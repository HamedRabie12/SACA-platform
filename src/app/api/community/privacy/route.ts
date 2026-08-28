import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resolveMemberSession } from "@/lib/security/member-session";
import { z } from "zod";
const schema = z.object({ type: z.enum(["EXPORT", "CORRECTION", "DELETION"]), details: z.string().max(4000).optional() });
export async function GET(req: NextRequest) {
  const session = await resolveMemberSession(req); if (!session) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const requests = await db.privacyRequest.findMany({ where: { memberId: session.memberId }, orderBy: { requestedAt: "desc" }, take: 50 });
  return NextResponse.json({ requests });
}
export async function POST(req: NextRequest) {
  const session = await resolveMemberSession(req); if (!session) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const parsed = schema.safeParse(await req.json().catch(() => ({}))); if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const request = await db.privacyRequest.create({ data: { memberId: session.memberId, type: parsed.data.type, details: parsed.data.details } });
  await db.auditLog.create({ data: { actor: session.memberId, action: "privacy-request-created", entity: "privacy_request", entityId: request.id, details: JSON.stringify({ type: request.type }) } });
  return NextResponse.json({ ok: true, request }, { status: 201 });
}
