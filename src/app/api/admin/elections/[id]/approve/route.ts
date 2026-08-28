import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdminRequest } from "@/lib/security/admin-session";

const schema = z.object({
  action: z.enum(["TALLY", "CERTIFICATION"]),
  note: z.string().max(1000).optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = schema.safeParse(await req.json().catch(() => ({})));
  if (!body.success) return NextResponse.json({ error: "Invalid approval request" }, { status: 400 });

  const election = await db.election.findUnique({ where: { id }, select: { id: true, status: true } });
  if (!election) return NextResponse.json({ error: "Election not found" }, { status: 404 });

  const approval = await db.electionControlApproval.upsert({
    where: { electionId_action_approverUserId: { electionId: id, action: body.data.action, approverUserId: session.userId } },
    update: { note: body.data.note ?? null, approvedAt: new Date() },
    create: { electionId: id, action: body.data.action, approverUserId: session.userId, note: body.data.note },
  });

  const approvals = await db.electionControlApproval.findMany({
    where: { electionId: id, action: body.data.action },
    select: { approverUserId: true, approvedAt: true },
    distinct: ["approverUserId"],
    orderBy: { approvedAt: "desc" },
    take: 5,
  });

  await db.electionAudit.create({
    data: {
      electionId: id,
      category: "CONTROL",
      event: "CONTROL_APPROVAL_RECORDED",
      details: JSON.stringify({ action: body.data.action, approvals: approvals.length }),
      actor: session.userId,
    },
  });

  return NextResponse.json({
    ok: true,
    approval: { id: approval.id, action: approval.action, approvedAt: approval.approvedAt },
    approvals: approvals.length,
    required: 2,
  });
}
