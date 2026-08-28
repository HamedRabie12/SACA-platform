import { randomUUID, createHash, randomBytes } from "node:crypto";
import { db } from "@/lib/db";

export function createBallotCommitment(payload: string) {
  return createHash("sha256").update(payload).digest("hex");
}

export async function prepareElectionBallot(electionId: string, memberId: string) {
  const eligibility = await db.voterEligibility.findUnique({ where: { electionId_memberId: { electionId, memberId } } });
  if (!eligibility?.eligible) throw new Error("VOTER_NOT_ELIGIBLE");
  const ballotRef = randomUUID();
  const secret = randomBytes(32).toString("base64url");
  return { ballotRef, secret };
}

export async function castEncryptedBallot(input: {
  electionId: string;
  ballotRef: string;
  encryptedPayload: string;
}) {
  const commitment = createBallotCommitment(input.encryptedPayload);
  const existing = await db.encryptedBallot.findUnique({ where: { ballotRef: input.ballotRef } });
  if (existing) throw new Error("BALLOT_REPLAY");
  const ballot = await db.encryptedBallot.create({ data: { electionId: input.electionId, ballotRef: input.ballotRef, encryptedPayload: input.encryptedPayload, commitment } });
  const receipt = await db.voteReceipt.create({ data: { electionId: input.electionId, receiptCode: randomUUID(), ballotCommitment: commitment } });
  return { ballotId: ballot.id, receiptCode: receipt.receiptCode, commitment };
}
