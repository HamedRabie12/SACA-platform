import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resolveMemberSession } from "@/lib/security/member-session";
import { createCipheriv, createHash, randomBytes } from "node:crypto";
import { z } from "zod";

const schema = z.object({ credential: z.string().min(20).max(200), choices: z.record(z.string().min(1), z.string().min(1)) });

function getElectionKey() {
  const raw = process.env.ELECTION_ENCRYPTION_KEY;
  if (!raw || raw.length < 32) throw new Error("ELECTION_ENCRYPTION_KEY must be configured with at least 32 characters");
  return createHash("sha256").update(raw).digest();
}

function encrypt(payload: unknown) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getElectionKey(), iv);
  const plaintext = Buffer.from(JSON.stringify(payload));
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  return { iv: iv.toString("base64url"), data: encrypted.toString("base64url"), tag: cipher.getAuthTag().toString("base64url") };
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await resolveMemberSession(req);
  if (!session) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid ballot" }, { status: 400 });
  const { id } = await params;

  const election = await db.election.findUnique({ where: { id } });
  if (!election || election.status !== "VOTING_OPEN") return NextResponse.json({ error: "Voting is closed" }, { status: 400 });
  if (!election.ballotVersion) return NextResponse.json({ error: "Election ballot version is not frozen" }, { status: 409 });

  const positions = await db.electionPosition.findMany({ where: { electionId: id, status: "ACTIVE" }, select: { id: true, seatCount: true } });
  const candidates = await db.candidate.findMany({ where: { electionId: id, status: "APPROVED" }, select: { id: true, positionId: true } });
  const candidateMap = new Map(candidates.map((c) => [c.id, c.positionId]));

  for (const position of positions) {
    const chosen = parsed.data.choices[position.id];
    if (!chosen || candidateMap.get(chosen) !== position.id) return NextResponse.json({ error: "Invalid or incomplete ballot selection" }, { status: 400 });
    if (position.seatCount !== 1) return NextResponse.json({ error: "Multi-seat ballot requires approved election ballot configuration" }, { status: 409 });
  }
  for (const key of Object.keys(parsed.data.choices)) if (!positions.some((p) => p.id === key)) return NextResponse.json({ error: "Unknown ballot position" }, { status: 400 });

  const credentialHash = createHash("sha256").update(parsed.data.credential).digest("hex");
  const ballotPayload = { choices: parsed.data.choices, ballotVersion: election.ballotVersion, castAt: new Date().toISOString() };
  const encrypted = encrypt(ballotPayload);
  const ballotJson = JSON.stringify(encrypted);
  const commitment = createHash("sha256").update(`${id}:${election.ballotVersion}:${ballotJson}`).digest("hex");
  const receiptCode = randomBytes(16).toString("hex");

  try {
    const result = await db.$transaction(async (tx) => {
      const consumed = await tx.voterEligibility.updateMany({
        where: { electionId: id, memberId: session.memberId, eligible: true, credentialHash, credentialUsedAt: null },
        data: { credentialUsedAt: new Date() },
      });
      if (consumed.count !== 1) throw new Error("BALLOT_CREDENTIAL_INVALID_OR_USED");
      const ballot = await tx.encryptedBallot.create({ data: { electionId: id, ballotRef: randomBytes(16).toString("hex"), encryptedPayload: ballotJson, commitment, status: "CAST" } });
      await tx.voteReceipt.create({ data: { electionId: id, receiptCode, ballotCommitment: commitment } });
      await tx.electionAudit.create({ data: { electionId: id, category: "VOTE", event: "BALLOT_CAST", details: JSON.stringify({ commitment, ballotVersion: election.ballotVersion }), actor: "anonymous" } });
      return ballot;
    });
    return NextResponse.json({ ok: true, ballotId: result.id, receiptCode, commitment }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "BALLOT_FAILED";
    if (message === "BALLOT_CREDENTIAL_INVALID_OR_USED") return NextResponse.json({ error: "This ballot credential is invalid or has already been used." }, { status: 409 });
    console.error("vote error", error);
    return NextResponse.json({ error: "Unable to cast ballot" }, { status: 500 });
  }
}
