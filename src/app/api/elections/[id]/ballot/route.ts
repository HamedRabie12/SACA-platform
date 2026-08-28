import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resolveMemberSession } from "@/lib/security/member-session";
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await resolveMemberSession(req); if (!session) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const { id } = await params;
  const election = await db.election.findUnique({ where: { id } });
  if (!election || election.status !== "VOTING_OPEN") return NextResponse.json({ error: "Voting is not open" }, { status: 400 });
  const eligibility = await db.voterEligibility.findUnique({ where: { electionId_memberId: { electionId: id, memberId: session.memberId } } });
  if (!eligibility?.eligible) return NextResponse.json({ error: "Not eligible to vote" }, { status: 403 });
  const positions = await db.electionPosition.findMany({ where: { electionId: id, status: "ACTIVE" }, orderBy: { code: "asc" } });
  const candidates = await db.candidate.findMany({ where: { electionId: id, status: "APPROVED" }, select: { id: true, positionId: true, statement: true, memberId: true } });
  const members = await db.member.findMany({ where: { id: { in: candidates.map(c => c.memberId) } }, select: { id: true, name: true, avatarUrl: true } });
  const memberMap = new Map(members.map(m => [m.id, m]));
  return NextResponse.json({ election: { id: election.id, name: election.name, status: election.status, ballotVersion: election.ballotVersion }, positions, candidates: candidates.map(c => ({ ...c, member: memberMap.get(c.memberId) ?? null })) });
}
