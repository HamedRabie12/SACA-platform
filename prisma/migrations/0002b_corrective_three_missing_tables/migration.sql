-- SACA 3.0 corrective migration: create the three tables referenced by
-- prisma/schema.prisma but missing from the original migration chain
-- (0001..0008). This is the minimal fix for the schema-vs-migration drift
-- discovered during PHASE 24.2 audit. No business-logic change. No
-- application code change.
--
-- See docs/final/PHASE-24.2-MIGRATION-CHAIN-AUDIT.md for the full
-- root-cause analysis.

-- 1. ConstitutionClause (created before ConstitutionRule because
--    ConstitutionRule has a back-relation to ConstitutionClause).
CREATE TABLE IF NOT EXISTS "ConstitutionClause" (
  "id"        TEXT NOT NULL PRIMARY KEY,
  "articleId" TEXT NOT NULL,
  "clauseCode" TEXT NOT NULL,
  "body"      TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "status"    TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS "uq_ConstitutionClause_articleId_clauseCode" ON "ConstitutionClause" ("articleId", "clauseCode");
CREATE INDEX IF NOT EXISTS "idx_ConstitutionClause_articleId_sortOrder" ON "ConstitutionClause" ("articleId", "sortOrder");
ALTER TABLE "ConstitutionClause" ADD CONSTRAINT "fk_ConstitutionClause_articleId_ConstitutionArticle_id" FOREIGN KEY ("articleId") REFERENCES "ConstitutionArticle" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 2. AdminSession (created before AdminMfaFactor so that
--    0003_admin_mfa's ALTER on this table will succeed when this
--    corrective migration is applied first in a fresh deploy).
--    In the current staging DB 0003 already failed; the agent
--    will mark it as rolled back and let 0009 supply the table.
CREATE TABLE IF NOT EXISTS "AdminSession" (
  "id"             TEXT NOT NULL PRIMARY KEY,
  "sessionId"      TEXT NOT NULL,
  "username"       TEXT NOT NULL,
  "role"           TEXT NOT NULL,
  "userId"         TEXT,
  "scopeType"      TEXT NOT NULL DEFAULT 'NATIONAL',
  "scopeId"        TEXT,
  "expiresAt"      TIMESTAMPTZ NOT NULL,
  "revokedAt"      TIMESTAMPTZ,
  "mfaVerifiedAt"  TIMESTAMPTZ,
  "createdAt"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "lastSeenAt"     TIMESTAMPTZ,
  "ipHash"         TEXT,
  "userAgentHash"  TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS "uq_AdminSession_sessionId" ON "AdminSession" ("sessionId");
CREATE INDEX IF NOT EXISTS "idx_AdminSession_username_revokedAt" ON "AdminSession" ("username", "revokedAt");
CREATE INDEX IF NOT EXISTS "idx_AdminSession_expiresAt" ON "AdminSession" ("expiresAt");
CREATE INDEX IF NOT EXISTS "idx_AdminSession_userId_revokedAt" ON "AdminSession" ("userId", "revokedAt");
CREATE INDEX IF NOT EXISTS "idx_AdminSession_scopeType_scopeId" ON "AdminSession" ("scopeType", "scopeId");
ALTER TABLE "AdminSession" ADD CONSTRAINT "fk_AdminSession_userId_User_id" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 3. MeetingParticipant
CREATE TABLE IF NOT EXISTS "MeetingParticipant" (
  "id"          TEXT NOT NULL PRIMARY KEY,
  "meetingId"   TEXT NOT NULL,
  "identity"    TEXT NOT NULL,
  "memberId"    TEXT,
  "displayName" TEXT,
  "status"      TEXT NOT NULL DEFAULT 'CONNECTED',
  "joinedAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "leftAt"      TIMESTAMPTZ,
  "lastSeenAt"  TIMESTAMPTZ
);
CREATE UNIQUE INDEX IF NOT EXISTS "uq_MeetingParticipant_meetingId_identity" ON "MeetingParticipant" ("meetingId", "identity");
CREATE INDEX IF NOT EXISTS "idx_MeetingParticipant_meetingId_status" ON "MeetingParticipant" ("meetingId", "status");
CREATE INDEX IF NOT EXISTS "idx_MeetingParticipant_memberId_status" ON "MeetingParticipant" ("memberId", "status");
ALTER TABLE "MeetingParticipant" ADD CONSTRAINT "fk_MeetingParticipant_meetingId_Meeting_id" FOREIGN KEY ("meetingId") REFERENCES "Meeting" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
