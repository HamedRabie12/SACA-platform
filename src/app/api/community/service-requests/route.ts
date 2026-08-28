import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resolveMemberSession } from "@/lib/security/member-session";
import { z } from "zod";

const schema = z.object({
  serviceCode: z.string().min(1).max(80),
  stateCode: z.string().max(10).optional(),
  chapterId: z.string().max(100).optional(),
  language: z.string().max(20).optional(),
  urgency: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
  description: z.string().min(10).max(4000),
});

export async function GET(req: NextRequest) {
  const session = await resolveMemberSession(req);
  if (!session) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const requests = await db.serviceRequest.findMany({ where: { memberId: session.memberId }, orderBy: { createdAt: "desc" }, take: 50 });
  return NextResponse.json({ requests });
}

export async function POST(req: NextRequest) {
  const session = await resolveMemberSession(req);
  if (!session) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request", issues: parsed.error.issues }, { status: 400 });
  const service = await db.service.findUnique({ where: { code: parsed.data.serviceCode } });
  if (!service || service.status !== "ACTIVE") return NextResponse.json({ error: "Service not available" }, { status: 404 });
  const request = await db.serviceRequest.create({ data: { ...parsed.data, memberId: session.memberId } });
  await db.auditLog.create({ data: { actor: session.memberId, action: "service-request-created", entity: "service_request", entityId: request.id, details: JSON.stringify({ serviceCode: request.serviceCode, urgency: request.urgency }) } });
  return NextResponse.json({ ok: true, request }, { status: 201 });
}
