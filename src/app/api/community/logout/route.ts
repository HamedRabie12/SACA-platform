import { NextRequest, NextResponse } from "next/server";
import { clearMemberSessionCookie, revokeMemberSession } from "@/lib/security/member-session";
export async function POST(req: NextRequest) {
  await revokeMemberSession(req);
  const response = NextResponse.json({ ok: true });
  clearMemberSessionCookie(response);
  return response;
}
