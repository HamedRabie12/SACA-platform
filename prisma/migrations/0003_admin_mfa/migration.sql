-- SACA 3.0 admin MFA hardening
ALTER TABLE "AdminSession" ADD COLUMN IF NOT EXISTS "mfaVerifiedAt" TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS "AdminMfaFactor" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "username" TEXT NOT NULL UNIQUE,
  "secretCipher" TEXT NOT NULL,
  "algorithm" TEXT NOT NULL DEFAULT 'SHA1',
  "digits" INTEGER NOT NULL DEFAULT 6,
  "periodSeconds" INTEGER NOT NULL DEFAULT 30,
  "enabled" BOOLEAN NOT NULL DEFAULT TRUE,
  "verifiedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "idx_AdminMfaFactor_username_enabled" ON "AdminMfaFactor" ("username", "enabled");
