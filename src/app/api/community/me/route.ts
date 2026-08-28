import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resolveMemberSession } from "@/lib/security/member-session";

export async function GET(req: NextRequest) {
  const session = await resolveMemberSession(req);
  if (!session) return NextResponse.json({ authenticated: false }, { status: 401 });
  const member = await db.member.findUnique({ where: { id: session.memberId }, include: { state: true, city: true } });
  if (!member) return NextResponse.json({ authenticated: false }, { status: 401 });
  return NextResponse.json({ authenticated: true, member });
}
