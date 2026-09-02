// Authoritative admin session verification.
//
// This module is the SINGLE source of truth for whether a request is
// authenticated as an admin. Both the middleware (coarse pre-gate) and
// every /api/admin/* Route Handler (final gate) MUST call into
// verifyAdminSession() here.
//
// What the cookie proves:
//   - The cookie was issued by this server (HMAC-SHA256 over the payload).
//   - The payload is well-formed and not expired by its own `exp` claim.
//   - The `sid` (session id) is present.
//
// What the database proves (authoritative):
//   - The AdminSession row exists and is not revoked.
//   - The AdminSession row is not past expiresAt.
//   - The User exists.
//   - The User has an ACTIVE UserRole with a non-expired window.
//   - The UserRole's role and scope match the cookie claims.
//   - mfaVerifiedAt is the only source for the "MFA verified" decision.
//
// The cookie MUST NOT carry mfaVerified, role, scope, or any other state
// that the server can re-derive from the database. The cookie carries
// only (sid, sub, iat, exp, ver) for the cryptographic proof.

import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { createHmac } from "node:crypto";

// Defer the Prisma client import so that the cookie/HMAC helpers in this
// module (buildCookieValue, getCookieValueFromRequest, etc.) can be imported
// without a DATABASE_URL being present. The Prisma client is only needed
// when verifyAdminSession() actually runs (i.e., when a request carries
// an admin session cookie).
async function getDb() {
  const mod = await import("@/lib/db");
  return mod.db;
}

export const ADMIN_SESSION_COOKIE = "saca_admin_session";
export const ADMIN_SESSION_MAX_AGE_SECONDS = 4 * 60 * 60;
export const ADMIN_SESSION_VERSION = 3 as const;

export type AuthoritativeSession = {
  sid: string;
  sub: string;
  userId: string;
  role: string;
  scopeType: string;
  scopeId: string | null;
  iat: number;
  exp: number;
  mfaRequired: boolean;
  mfaVerified: boolean;
};

export type AdminVerifyResult =
  | { ok: true; session: AuthoritativeSession }
  | { ok: false; reason: "MISSING" | "INVALID_SIGNATURE" | "EXPIRED" | "REVOKED" | "MISSING_DB" | "MISSING_ROLE" | "SCOPE_DRIFT" };

type CookiePayload = { sid: string; sub: string; iat: number; exp: number; ver: number };

function b64urlDecode(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((value.length + 3) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

function b64urlEncode(value: Uint8Array | string): string {
  const bytes = typeof value === "string" ? new TextEncoder().encode(value) : value;
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function getHmacKey(): Buffer {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("ADMIN_SESSION_SECRET must be at least 32 characters.");
  }
  return Buffer.from(secret, "utf8");
}

function verifyCookieHmac(value: string): CookiePayload | null {
  const parts = value.split(".");
  if (parts.length !== 2) return null;
  const [payload, signature] = parts;
  if (!payload || !signature) return null;
  const expected = createHmac("sha256", getHmacKey()).update(payload).digest();
  let provided: Uint8Array;
  try {
    provided = b64urlDecode(signature);
  } catch {
    return null;
  }
  if (expected.length !== provided.length) return null;
  let diff = 0;
  for (let i = 0; i < expected.length; i += 1) {
    diff |= (expected[i] ^ provided[i]);
  }
  if (diff !== 0) return null;
  try {
    const json = JSON.parse(new TextDecoder().decode(b64urlDecode(payload))) as CookiePayload;
    if (json.ver !== ADMIN_SESSION_VERSION || typeof json.sid !== "string" || typeof json.sub !== "string" || typeof json.iat !== "number" || typeof json.exp !== "number" || json.sid.length === 0 || json.sub.length === 0) return null;
    return json;
  } catch {
    return null;
  }
}

function buildCookieValue(payload: CookiePayload): string {
  const encoded = b64urlEncode(JSON.stringify(payload));
  const sig = createHmac("sha256", getHmacKey()).update(encoded).digest();
  return `${encoded}.${b64urlEncode(sig)}`;
}

export async function verifyAdminSession(value: string | undefined | null): Promise<AdminVerifyResult> {
  if (!value) return { ok: false, reason: "MISSING" };
  const payload = verifyCookieHmac(value);
  if (!payload) return { ok: false, reason: "INVALID_SIGNATURE" };
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (payload.exp <= nowSeconds) return { ok: false, reason: "EXPIRED" };
  if (payload.iat > nowSeconds + 60) return { ok: false, reason: "INVALID_SIGNATURE" };

  const row = await (await getDb()).adminSession.findUnique({ where: { sessionId: payload.sid } });
  if (!row) return { ok: false, reason: "MISSING_DB" };
  if (row.revokedAt) return { ok: false, reason: "REVOKED" };
  if (row.expiresAt.getTime() <= Date.now()) return { ok: false, reason: "EXPIRED" };
  if (!row.userId) return { ok: false, reason: "MISSING_DB" };

  const dbClient = await getDb();
  const assignment = await dbClient.userRole.findFirst({
    where: {
      userId: row.userId,
      status: "ACTIVE",
      role: { code: row.role, status: "ACTIVE" },
      startsAt: { lte: new Date() },
      OR: [{ endsAt: null }, { endsAt: { gt: new Date() } }],
    },
    include: { role: true },
    orderBy: { startsAt: "desc" },
  });
  if (!assignment) return { ok: false, reason: "MISSING_ROLE" };
  if (assignment.scopeType !== row.scopeType || assignment.scopeId !== row.scopeId) return { ok: false, reason: "SCOPE_DRIFT" };

  if (row.username.trim().toLowerCase() !== payload.sub) return { ok: false, reason: "INVALID_SIGNATURE" };

  dbClient.adminSession.update({ where: { id: row.id }, data: { lastSeenAt: new Date() } }).catch(() => undefined);

  return {
    ok: true,
    session: {
      sid: row.sessionId,
      sub: row.username,
      userId: row.userId,
      role: assignment.role.code,
      scopeType: assignment.scopeType,
      scopeId: assignment.scopeId,
      iat: payload.iat,
      exp: row.expiresAt.getTime() / 1000,
      mfaRequired: true,
      mfaVerified: Boolean(row.mfaVerifiedAt),
    },
  };
}

export async function getCookieValueFromRequest(req: NextRequest): Promise<string | undefined> {
  return req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
}

export async function getCookieValueFromStore(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(ADMIN_SESSION_COOKIE)?.value;
}

export { buildCookieValue };
