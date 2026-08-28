import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { adminScopeAllows, hasPermission, permissionForRequest, sameOriginMutationAllowed } from "@/lib/security/admin-authorization";

const COOKIE_NAME = "saca_admin_session";
const MAX_AGE_SECONDS = 4 * 60 * 60;

type SessionPayload = { sid: string; sub: string; role: string; userId: string; scopeType: string; scopeId?: string | null; iat: number; exp: number; ver: 3; mfaRequired: boolean; mfaVerified?: boolean };

function b64url(value: Uint8Array | string): string {
  const bytes = typeof value === "string" ? new TextEncoder().encode(value) : value;
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}
function unb64url(value: string): Uint8Array {
  const padded = value.replaceAll("-", "+").replaceAll("_", "/") + "===".slice((value.length + 3) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

async function key(): Promise<CryptoKey> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("ADMIN_SESSION_SECRET must be at least 32 characters.");
  return crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}
async function sign(payload: string) {
  const sig = await crypto.subtle.sign("HMAC", await key(), new TextEncoder().encode(payload));
  return b64url(new Uint8Array(sig));
}
async function verify(payload: string, sig: string) {
  const sigBytes = unb64url(sig);
  const buf = new Uint8Array(sigBytes.buffer.slice(sigBytes.byteOffset, sigBytes.byteOffset + sigBytes.byteLength));
  return crypto.subtle.verify("HMAC", await key(), buf as unknown as ArrayBuffer, new TextEncoder().encode(payload));
}

export async function createAdminSession(username: string, role = "SUPER_ADMIN", metadata?: { ipHash?: string; userAgentHash?: string }) {
  const now = Math.floor(Date.now() / 1000);
  const sid = randomUUID();
  const normalizedUsername = username.trim().toLowerCase();
  const configuredRole = role.trim().toUpperCase();
  const user = await db.user.findFirst({ where: { OR: [{ email: normalizedUsername }, { phoneE164: normalizedUsername }] } });
  if (!user) throw new Error("ADMIN_IDENTITY_NOT_PROVISIONED");
  const assignment = await db.userRole.findFirst({
    where: {
      userId: user.id,
      status: "ACTIVE",
      role: { code: configuredRole, status: "ACTIVE" },
      startsAt: { lte: new Date() },
      OR: [{ endsAt: null }, { endsAt: { gt: new Date() } }],
    },
    orderBy: { startsAt: "desc" },
    include: { role: true },
  });
  if (!assignment) throw new Error("ADMIN_ROLE_NOT_PROVISIONED");
  const mfaRequired = true;
  const expiresAt = new Date((now + MAX_AGE_SECONDS) * 1000);
  await db.adminSession.create({
    data: {
      sessionId: sid,
      username: normalizedUsername,
      role: assignment.role.code,
      userId: user.id,
      scopeType: assignment.scopeType,
      scopeId: assignment.scopeId,
      expiresAt,
      ipHash: metadata?.ipHash,
      userAgentHash: metadata?.userAgentHash,
    },
  });
  const payload = b64url(JSON.stringify({ sid, sub: normalizedUsername, role: assignment.role.code, userId: user.id, scopeType: assignment.scopeType, scopeId: assignment.scopeId, iat: now, exp: now + MAX_AGE_SECONDS, ver: 3, mfaRequired } satisfies SessionPayload));
  return `${payload}.${await sign(payload)}`;
}

export async function verifyAdminSessionValue(value: string | undefined): Promise<SessionPayload | null> {
  if (!value) return null;
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;
  try {
    if (!(await verify(payload, signature))) return null;
    const parsed = JSON.parse(new TextDecoder().decode(unb64url(payload))) as SessionPayload;
    const now = Math.floor(Date.now() / 1000);
    if (parsed.ver !== 3 || !parsed.sid || !parsed.sub || !parsed.userId || !parsed.scopeType || parsed.exp <= now || parsed.iat > now + 60) return null;
    const session = await db.adminSession.findUnique({ where: { sessionId: parsed.sid } });
    if (!session || session.revokedAt || session.expiresAt.getTime() <= Date.now()) return null;
    const assignment = await db.userRole.findFirst({
      where: {
        userId: session.userId ?? parsed.userId,
        status: "ACTIVE",
        role: { code: session.role, status: "ACTIVE" },
        startsAt: { lte: new Date() },
        OR: [{ endsAt: null }, { endsAt: { gt: new Date() } }],
      },
      include: { role: true },
      orderBy: { startsAt: "desc" },
    });
    if (!assignment || assignment.scopeType !== session.scopeType || assignment.scopeId !== session.scopeId) return null;
    await db.adminSession.update({ where: { id: session.id }, data: { lastSeenAt: new Date() } }).catch(() => undefined);
    return { ...parsed, role: assignment.role.code, userId: assignment.userId, scopeType: assignment.scopeType, scopeId: assignment.scopeId, mfaVerified: Boolean(session.mfaVerifiedAt) };
  } catch {
    return null;
  }
}

export async function getAdminSession() {
  const store = await cookies();
  return verifyAdminSessionValue(store.get(COOKIE_NAME)?.value);
}

export async function revokeAdminSession(req?: NextRequest) {
  const value = req?.cookies.get(COOKIE_NAME)?.value ?? (await cookies()).get(COOKIE_NAME)?.value;
  if (!value) return;
  const [payload] = value.split(".");
  if (!payload) return;
  try {
    const parsed = JSON.parse(new TextDecoder().decode(unb64url(payload))) as Partial<SessionPayload>;
    if (parsed.sid) await db.adminSession.updateMany({ where: { sessionId: parsed.sid, revokedAt: null }, data: { revokedAt: new Date() } });
  } catch {
    // Ignore malformed session cookies during logout.
  }
}

export async function requireAdminSession() {
  const session = await getAdminSession();
  if (!session) throw new Error("ADMIN_UNAUTHORIZED");
  return session;
}

export async function requireAdminRequest(req: NextRequest) {
  if (!sameOriginMutationAllowed(req)) return null;
  const session = await verifyAdminSessionValue(req.cookies.get(COOKIE_NAME)?.value);
  if (!session || (session.mfaRequired && !session.mfaVerified)) return null;
  if (!adminScopeAllows(session)) return null;
  const permission = permissionForRequest(req);
  if (!(await hasPermission(session.role, permission, session.userId))) return null;
  return session;
}

export function setAdminSessionCookie(response: Response, token: string) {
  response.headers.set(
    "set-cookie",
    `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; Max-Age=${MAX_AGE_SECONDS}; HttpOnly; SameSite=Lax; ${process.env.NODE_ENV === "production" ? "Secure;" : ""}`,
  );
}

export function clearAdminSessionCookie(response: Response) {
  response.headers.set("set-cookie", `${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax; ${process.env.NODE_ENV === "production" ? "Secure;" : ""}`);
}

export function adminSessionCookieName() { return COOKIE_NAME; }
