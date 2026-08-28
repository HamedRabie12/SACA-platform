-- Security hardening: admin MFA brute-force protection.
ALTER TABLE "AdminMfaFactor" ADD COLUMN "failedAttempts" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "AdminMfaFactor" ADD COLUMN "lockedUntil" TIMESTAMP(3);
CREATE INDEX IF NOT EXISTS "AdminMfaFactor_lockedUntil_idx" ON "AdminMfaFactor"("lockedUntil");
