import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resolveMemberSession } from "@/lib/security/member-session";
import { createHash, randomBytes } from "node:crypto";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await resolveMemberSession(req); if (!session) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const { id } = await params;
  const election = await db.election.findUnique({ where: { id } });
  if (!election) return NextResponse.json({ error: "Election not found" }, { status: 404 });
  const membership = await db.membership.findFirst({ where: { memberId: session.memberId, status: "ACTIVE" }, orderBy: { startedAt: "desc" } });
  const start = membership?.startedAt ?? null;
  const membershipAgeDays = start ? Math.floor((Date.now() - start.getTime()) / 86400000) : 0;
  const eligible = !!membership && membershipAgeDays >= 183 && membership.status === "ACTIVE" && election.status === "VOTING_OPEN";
  const reason = !membership ? "ACTIVE_MEMBERSHIP_REQUIRED" : membershipAgeDays < 183 ? "SIX_MONTH_MEMBERSHIP_REQUIRED" : election.status !== "VOTING_OPEN" ? "VOTING_NOT_OPEN" : "ELIGIBLE";
  let record = await db.voterEligibility.findUnique({ where: { electionId_memberId: { electionId: id, memberId: session.memberId } } });
  if (!record || record.evaluatedAt.getTime() < Date.now() - 5 * 60 * 1000) {
    record = await db.voterEligibility.upsert({ where: { electionId_memberId: { electionId: id, memberId: session.memberId } }, update: { eligible, reason, membershipAgeDays, evaluatedAt: new Date() }, create: { electionId: id, memberId: session.memberId, eligible, reason, membershipAgeDays } });
  }
  if (!eligible) return NextResponse.json({ eligible: false, reason, membershipAgeDays });
  if (record.credentialUsedAt) return NextResponse.json({ eligible: true, reason: "ALREADY_VOTED", membershipAgeDays, alreadyVoted: true }, { status: 409 });
  if (!record.credentialHash) {
    const raw = randomBytes(32).toString("base64url");
    const hash = createHash("sha256").update(raw).digest("hex");
    const updated = await db.voterEligibility.update({ where: { id: record.id }, data: { credentialHash: hash, credentialIssuedAt: new Date(), credentialUsedAt: null } });
    return NextResponse.json({ eligible: true, reason, membershipAgeDays, credential: raw, credentialId: updated.id });
  }
  return NextResponse.json({ eligible: true, reason, membershipAgeDays, credentialId: record.id, credentialAlreadyIssued: true });
}
