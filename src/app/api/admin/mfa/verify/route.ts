import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdminSessionValue, adminSessionCookieName } from "@/lib/security/admin-session";
import { verifyAdminMfa } from "@/lib/security/admin-mfa";

export async function POST(req: NextRequest) {
  const session = await verifyAdminSessionValue(req.cookies.get(adminSessionCookieName())?.value);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const code = String(body?.code ?? "");
  if (!/^\d{6}$/.test(code)) return NextResponse.json({ error: "Invalid MFA code" }, { status: 400 });
  const ok = await verifyAdminMfa(session.sub, code);
  if (!ok) return NextResponse.json({ error: "Invalid MFA code" }, { status: 401 });
  const stored = await db.adminSession.findUnique({ where: { sessionId: session.sid } });
  if (!stored || stored.revokedAt) return NextResponse.json({ error: "Session unavailable" }, { status: 401 });
  await db.adminSession.update({ where: { id: stored.id }, data: { mfaVerifiedAt: new Date() } });
  return NextResponse.json({ ok: true, mfaVerified: true });
}
