-- SACA 3.0 corrective migration: add clauseId column to ConstitutionRule
-- discovered during PHASE 24.3 E2E. Root cause: prisma/schema.prisma:630
-- declares the optional FK, but the original 0002 migration did not
-- include the column. Without the column the application cannot
-- persist rule→clause traceability. This is the minimal fix.
--
-- This is an additive migration with no destructive change. The
-- column is NULL-able to allow rules that are attached only to an
-- article, matching the schema definition.

ALTER TABLE "ConstitutionRule" ADD COLUMN IF NOT EXISTS "clauseId" TEXT;
CREATE INDEX IF NOT EXISTS "idx_ConstitutionRule_clauseId_status" ON "ConstitutionRule" ("clauseId", "status");
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_ConstitutionRule_clauseId_ConstitutionClause_id') THEN
    ALTER TABLE "ConstitutionRule" ADD CONSTRAINT "fk_ConstitutionRule_clauseId_ConstitutionClause_id" FOREIGN KEY ("clauseId") REFERENCES "ConstitutionClause" ("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
