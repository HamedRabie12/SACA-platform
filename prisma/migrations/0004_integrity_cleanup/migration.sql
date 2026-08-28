-- SACA 3.0 integrity cleanup: canonical election credential lifecycle and removal of unused duplicate credential table.
ALTER TABLE "VoterEligibility" ADD COLUMN "credentialIssuedAt" TIMESTAMP(3);
ALTER TABLE "VoterEligibility" ADD COLUMN "credentialUsedAt" TIMESTAMP(3);
DROP TABLE IF EXISTS "BallotCredential";
CREATE INDEX IF NOT EXISTS "VoterEligibility_electionId_credentialUsedAt_idx" ON "VoterEligibility"("electionId", "credentialUsedAt");
