-- SACA 3.0 workflow extensions: quorum, elections, services, privacy and runtime verification.
BEGIN;

ALTER TABLE "VoterEligibility" ADD COLUMN IF NOT EXISTS "credentialHash" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "uq_VoterEligibility_credentialHash" ON "VoterEligibility" ("credentialHash");

CREATE TABLE IF NOT EXISTS "BoardTerm" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "boardId" TEXT NOT NULL,
  "termCode" TEXT NOT NULL,
  "startDate" TIMESTAMPTZ NOT NULL,
  "endDate" TIMESTAMPTZ NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "sourceRef" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS "uq_BoardTerm_boardId_termCode" ON "BoardTerm" ("boardId", "termCode");
CREATE INDEX IF NOT EXISTS "idx_BoardTerm_status_startDate_endDate" ON "BoardTerm" ("status", "startDate", "endDate");

CREATE TABLE IF NOT EXISTS "ScopeDefinition" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "code" TEXT NOT NULL UNIQUE,
  "nameAr" TEXT NOT NULL,
  "nameEn" TEXT NOT NULL,
  "scopeType" TEXT NOT NULL,
  "resourceRef" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "GeneralAssemblyAttendance" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "assemblyId" TEXT NOT NULL,
  "memberId" TEXT NOT NULL,
  "attendedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "leftAt" TIMESTAMPTZ,
  "attendanceType" TEXT NOT NULL DEFAULT 'IN_PERSON',
  "valid" BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE UNIQUE INDEX IF NOT EXISTS "uq_GeneralAssemblyAttendance_assemblyId_memberId" ON "GeneralAssemblyAttendance" ("assemblyId", "memberId");
CREATE INDEX IF NOT EXISTS "idx_GeneralAssemblyAttendance_assemblyId_valid" ON "GeneralAssemblyAttendance" ("assemblyId", "valid");

CREATE TABLE IF NOT EXISTS "Motion" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "meetingId" TEXT NOT NULL,
  "agendaItemId" TEXT,
  "title" TEXT NOT NULL,
  "text" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PROPOSED',
  "proposedBy" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "MotionVote" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "motionId" TEXT NOT NULL,
  "memberId" TEXT NOT NULL,
  "choice" TEXT NOT NULL,
  "castAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS "uq_MotionVote_motionId_memberId" ON "MotionVote" ("motionId", "memberId");
CREATE INDEX IF NOT EXISTS "idx_MotionVote_motionId_choice" ON "MotionVote" ("motionId", "choice");

CREATE TABLE IF NOT EXISTS "ElectionPosition" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "electionId" TEXT NOT NULL,
  "positionId" TEXT,
  "code" TEXT NOT NULL,
  "nameAr" TEXT NOT NULL,
  "nameEn" TEXT NOT NULL,
  "seatCount" INTEGER NOT NULL DEFAULT 1,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE'
);
CREATE UNIQUE INDEX IF NOT EXISTS "uq_ElectionPosition_electionId_code" ON "ElectionPosition" ("electionId", "code");
CREATE INDEX IF NOT EXISTS "idx_ElectionPosition_electionId_status" ON "ElectionPosition" ("electionId", "status");

CREATE TABLE IF NOT EXISTS "BallotCredential" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "electionId" TEXT NOT NULL,
  "credentialHash" TEXT NOT NULL UNIQUE,
  "issuedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "usedAt" TIMESTAMPTZ,
  "revokedAt" TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS "idx_BallotCredential_electionId_usedAt_revokedAt" ON "BallotCredential" ("electionId", "usedAt", "revokedAt");

CREATE TABLE IF NOT EXISTS "ElectionCertification" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "electionId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "resultHash" TEXT,
  "certifiedBy" TEXT,
  "certifiedAt" TIMESTAMPTZ,
  "notes" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "idx_ElectionCertification_electionId_status" ON "ElectionCertification" ("electionId", "status");

CREATE TABLE IF NOT EXISTS "MeetingRecording" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "meetingId" TEXT NOT NULL,
  "storageKey" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PROCESSING',
  "consentVersion" TEXT,
  "retentionUntil" TIMESTAMPTZ,
  "publishedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "idx_MeetingRecording_meetingId_status" ON "MeetingRecording" ("meetingId", "status");

CREATE TABLE IF NOT EXISTS "Service" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "code" TEXT NOT NULL UNIQUE,
  "nameAr" TEXT NOT NULL,
  "nameEn" TEXT NOT NULL,
  "descriptionAr" TEXT,
  "descriptionEn" TEXT,
  "category" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "idx_Service_category_status" ON "Service" ("category", "status");

CREATE TABLE IF NOT EXISTS "VerificationChallenge" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "channel" TEXT NOT NULL,
  "destinationHash" TEXT NOT NULL,
  "codeHash" TEXT NOT NULL,
  "purpose" TEXT NOT NULL,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "maxAttempts" INTEGER NOT NULL DEFAULT 5,
  "consumedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "ipHash" TEXT
);
CREATE INDEX IF NOT EXISTS "idx_VerificationChallenge_destinationHash_purpose_expiresAt" ON "VerificationChallenge" ("destinationHash", "purpose", "expiresAt");

CREATE TABLE IF NOT EXISTS "AIEmbedding" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "documentId" TEXT NOT NULL,
  "chunkIndex" INTEGER NOT NULL,
  "vectorRef" TEXT NOT NULL,
  "contentHash" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS "uq_AIEmbedding_documentId_chunkIndex" ON "AIEmbedding" ("documentId", "chunkIndex");

COMMIT;
