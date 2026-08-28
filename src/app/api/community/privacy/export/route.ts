import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resolveMemberSession } from "@/lib/security/member-session";

export async function GET(req: NextRequest) {
  const session = await resolveMemberSession(req);
  if (!session) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const approved = await db.privacyRequest.findFirst({ where: { memberId: session.memberId, type: "EXPORT", status: { in: ["APPROVED", "COMPLETED"] } }, orderBy: { requestedAt: "desc" } });
  if (!approved) return NextResponse.json({ error: "An approved export request is required before data can be downloaded." }, { status: 403 });

  const [member, membership, payments, requests, volunteer, registrations, follow] = await Promise.all([
    db.member.findUnique({ where: { id: session.memberId }, select: { id:true,email:true,phoneE164:true,name:true,bio:true,stateId:true,cityId:true,profession:true,interests:true,membershipType:true,accountState:true,emailVerifiedAt:true,phoneVerifiedAt:true,createdAt:true,updatedAt:true } }),
    db.membership.findMany({ where: { memberId: session.memberId }, orderBy: { createdAt: "desc" } }),
    db.membershipPayment.findMany({ where: { memberId: session.memberId }, orderBy: { createdAt: "desc" } }),
    db.serviceRequest.findMany({ where: { memberId: session.memberId }, orderBy: { createdAt: "desc" } }),
    db.volunteer.findUnique({ where: { memberId: session.memberId }, include: { applications: true, assignments: true, hours: true } }),
    db.eventRegistration.findMany({ where: { memberId: session.memberId }, orderBy: { registeredAt: "desc" } }),
    db.follow.findMany({ where: { memberId: session.memberId }, orderBy: { createdAt: "desc" } }),
  ]);

  const payload = { exportedAt: new Date().toISOString(), member, membership, payments, serviceRequests: requests, volunteer, eventRegistrations: registrations, follows: follow };
  await db.privacyRequest.update({ where: { id: approved.id }, data: { status: "COMPLETED", completedAt: new Date(), handledBy: session.memberId } });
  await db.auditLog.create({ data: { actor: session.memberId, action: "privacy-data-exported", entity: "member", entityId: session.memberId, details: JSON.stringify({ requestId: approved.id }) } });
  return new NextResponse(JSON.stringify(payload, null, 2), { status: 200, headers: { "content-type": "application/json; charset=utf-8", "content-disposition": `attachment; filename="saca-data-export-${session.memberId}.json"`, "cache-control": "no-store" } });
}
