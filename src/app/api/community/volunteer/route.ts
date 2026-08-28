import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resolveMemberSession } from "@/lib/security/member-session";
import { z } from "zod";
const schema = z.object({ skills: z.string().max(1000).optional(), availability: z.string().max(1000).optional(), interests: z.string().max(1000).optional() });
export async function GET(req: NextRequest) {
  const session = await resolveMemberSession(req); if (!session) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const volunteer = await db.volunteer.findUnique({ where: { memberId: session.memberId }, include: { assignments: true, applications: true, hours: true } });
  return NextResponse.json({ volunteer });
}
export async function POST(req: NextRequest) {
  const session = await resolveMemberSession(req); if (!session) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const parsed = schema.safeParse(await req.json().catch(() => ({}))); if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const volunteer = await db.volunteer.upsert({ where: { memberId: session.memberId }, update: parsed.data, create: { memberId: session.memberId, ...parsed.data } });
  await db.auditLog.create({ data: { actor: session.memberId, action: "volunteer-profile-updated", entity: "volunteer", entityId: volunteer.id } });
  return NextResponse.json({ ok: true, volunteer });
}
