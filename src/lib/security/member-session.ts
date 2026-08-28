import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { createHash, randomBytes } from "node:crypto";
import { db } from "@/lib/db";
import { sameOriginMutationAllowed } from "@/lib/security/admin-authorization";

const COOKIE_NAME = "saca_member_session";
const MAX_AGE = 7 * 24 * 60 * 60;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createMemberSession(memberId: string, metadata?: { ipHash?: string; userAgentHash?: string }) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + MAX_AGE * 1000);
  await db.memberSession.create({ data: { memberId, tokenHash: hashToken(token), expiresAt, ipHash: metadata?.ipHash, userAgentHash: metadata?.userAgentHash } });
  return { token, expiresAt };
}

export async function resolveMemberSession(req?: NextRequest) {
  if (req && !sameOriginMutationAllowed(req)) return null;
  const token = req?.cookies.get(COOKIE_NAME)?.value ?? (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  const session = await db.memberSession.findUnique({ where: { tokenHash: hashToken(token) } });
  if (!session || session.revokedAt || session.expiresAt <= new Date()) return null;
  await db.memberSession.update({ where: { id: session.id }, data: { lastSeenAt: new Date() } }).catch(() => undefined);
  return { memberId: session.memberId, sessionId: session.id };
}

export function setMemberSessionCookie(response: Response, token: string) {
  response.headers.set("set-cookie", `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; Max-Age=${MAX_AGE}; HttpOnly; SameSite=Lax; ${process.env.NODE_ENV === "production" ? "Secure;" : ""}`);
}

export async function revokeMemberSession(req?: NextRequest) {
  const token = req?.cookies.get(COOKIE_NAME)?.value ?? (await cookies()).get(COOKIE_NAME)?.value;
  if (token) await db.memberSession.updateMany({ where: { tokenHash: hashToken(token), revokedAt: null }, data: { revokedAt: new Date() } });
}

export function clearMemberSessionCookie(response: Response) {
  response.headers.set("set-cookie", `${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax; ${process.env.NODE_ENV === "production" ? "Secure;" : ""}`);
}
