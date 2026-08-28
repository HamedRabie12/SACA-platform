ALTER TABLE "AdminSession" ADD COLUMN IF NOT EXISTS "userId" TEXT;
ALTER TABLE "AdminSession" ADD COLUMN IF NOT EXISTS "scopeType" TEXT NOT NULL DEFAULT 'NATIONAL';
ALTER TABLE "AdminSession" ADD COLUMN IF NOT EXISTS "scopeId" TEXT;
CREATE INDEX IF NOT EXISTS "AdminSession_userId_revokedAt_idx" ON "AdminSession"("userId", "revokedAt");
CREATE INDEX IF NOT EXISTS "AdminSession_scopeType_scopeId_idx" ON "AdminSession"("scopeType", "scopeId");
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AdminSession_userId_fkey') THEN
    ALTER TABLE "AdminSession" ADD CONSTRAINT "AdminSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
