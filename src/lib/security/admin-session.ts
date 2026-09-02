import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { adminScopeAllows, hasPermission, permissionForRequest, sameOriginMutationAllowed } from "@/lib/security/admin-authorization";
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_MAX_AGE_SECONDS, ADMIN_SESSION_VERSION, buildCookieValue, getCookieValueFromRequest, getCookieValueFromStore, verifyAdminSession } from "@/lib/security/admin-verify";

export const ADMIN_SESSION_COOKIE_NAME = ADMIN_SESSION_COOKIE;
export const COOKIE_NAME = ADMIN_SESSION_COOKIE;

export type AdminSession = {
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
  const expiresAt = new Date((now + ADMIN_SESSION_MAX_AGE_SECONDS) * 1000);
  await db.adminSession.create({
    data: {
      sessionId: sid,
      username: normalizedUsername,
      role: assignment.role.code,
      userId: user.id,
      scopeType: assignment.scopeType,
      scopeId: assignment.scopeId,
      expiresAt,
      mfaVerifiedAt: null,
      ipHash: metadata?.ipHash,
      userAgentHash: metadata?.userAgentHash,
    },
  });
  // Cookie payload intentionally carries ONLY (sid, sub, iat, exp, ver).
  // MFA state, role, scope, userId are all re-derived from the DB on
  // every verification. See lib/security/admin-verify.ts.
  return buildCookieValue({ sid, sub: normalizedUsername, iat: now, exp: now + ADMIN_SESSION_MAX_AGE_SECONDS, ver: ADMIN_SESSION_VERSION });
}

export async function verifyAdminSessionValue(value: string | undefined): Promise<AdminSession | null> {
  const result = await verifyAdminSession(value);
  return result.ok ? result.session : null;
}

export async function getAdminSession() {
  const value = await getCookieValueFromStore();
  return verifyAdminSessionValue(value);
}

export async function getAdminSessionFromRequest(req: NextRequest) {
  const value = await getCookieValueFromRequest(req);
  return verifyAdminSessionValue(value);
}

export async function revokeAdminSession(req?: NextRequest) {
  const value = req ? await getCookieValueFromRequest(req) : await getCookieValueFromStore();
  if (!value) return;
  const parts = value.split(".");
  if (parts.length !== 2) return;
  try {
    const json = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(parts[0].replace(/-/g, "+").replace(/_/g, "/") + "===".slice((parts[0].length + 3) % 4)), (c) => c.charCodeAt(0)))) as { sid?: string };
    if (json.sid) {
      await db.adminSession.updateMany({ where: { sessionId: json.sid, revokedAt: null }, data: { revokedAt: new Date() } });
    }
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
  const session = await getAdminSessionFromRequest(req);
  if (!session) return null;
  if (session.mfaRequired && !session.mfaVerified) return null;
  if (!adminScopeAllows(session)) return null;
  const permission = permissionForRequest(req);
  if (!(await hasPermission(session.role, permission, session.userId))) return null;
  return session;
}

export function setAdminSessionCookie(response: Response, token: string) {
  response.headers.set(
    "set-cookie",
    `${ADMIN_SESSION_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; Max-Age=${ADMIN_SESSION_MAX_AGE_SECONDS}; HttpOnly; SameSite=Lax; ${process.env.NODE_ENV === "production" ? "Secure;" : ""}`,
  );
}

export function clearAdminSessionCookie(response: Response) {
  response.headers.set("set-cookie", `${ADMIN_SESSION_COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax; ${process.env.NODE_ENV === "production" ? "Secure;" : ""}`);
}

export function adminSessionCookieName() { return ADMIN_SESSION_COOKIE_NAME; }
