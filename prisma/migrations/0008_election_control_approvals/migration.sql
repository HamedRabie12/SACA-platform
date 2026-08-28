CREATE TABLE "ElectionControlApproval" (
  "id" TEXT NOT NULL,
  "electionId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "approverUserId" TEXT NOT NULL,
  "approvedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "note" TEXT,
  CONSTRAINT "ElectionControlApproval_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ElectionControlApproval_electionId_action_approverUserId_key" ON "ElectionControlApproval"("electionId", "action", "approverUserId");
CREATE INDEX "ElectionControlApproval_electionId_action_approvedAt_idx" ON "ElectionControlApproval"("electionId", "action", "approvedAt");
