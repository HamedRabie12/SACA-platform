import { NextRequest, NextResponse } from "next/server";
import { clearAdminSessionCookie, getAdminSession, revokeAdminSession } from "@/lib/security/admin-session";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ authenticated: false }, { status: 401 });
  return NextResponse.json({ authenticated: true, subject: session.sub, role: session.role, expiresAt: session.exp, mfaRequired: session.mfaRequired, mfaVerified: Boolean(session.mfaVerified) });
}

export async function DELETE(req: NextRequest) {
  await revokeAdminSession(req);
  const response = NextResponse.json({ ok: true });
  clearAdminSessionCookie(response);
  return response;
}
