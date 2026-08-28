import { db } from "@/lib/db";
import { decryptTotpSecret, encryptTotpSecret, generateBase32Secret, verifyTotp } from "@/lib/security/totp";

export async function getAdminMfa(username: string) {
  return db.adminMfaFactor.findUnique({ where: { username } });
}

export async function setupAdminMfa(username: string) {
  const existing = await getAdminMfa(username);
  if (existing?.verifiedAt) return { alreadyConfigured: true as const };
  const secret = generateBase32Secret(32);
  const factor = await db.adminMfaFactor.upsert({
    where: { username },
    update: { secretCipher: encryptTotpSecret(secret), enabled: true, verifiedAt: null },
    create: { username, secretCipher: encryptTotpSecret(secret), enabled: true },
  });
  return { alreadyConfigured: false as const, factorId: factor.id, secret, uri: `otpauth://totp/SACA:${encodeURIComponent(username)}?secret=${secret}&issuer=SACA&algorithm=SHA1&digits=6&period=30` };
}

export async function verifyAdminMfa(username: string, code: string) {
  const factor = await getAdminMfa(username);
  if (!factor?.enabled) return false;
  if (factor.lockedUntil && factor.lockedUntil.getTime() > Date.now()) return false;
  const secret = decryptTotpSecret(factor.secretCipher);
  const ok = verifyTotp(secret, code);
  if (!ok) {
    const nextAttempts = factor.failedAttempts + 1;
    const lock = nextAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;
    await db.adminMfaFactor.update({ where: { id: factor.id }, data: { failedAttempts: lock ? 0 : nextAttempts, lockedUntil: lock } });
    return false;
  }
  await db.adminMfaFactor.update({ where: { id: factor.id }, data: { verifiedAt: new Date(), enabled: true, failedAttempts: 0, lockedUntil: null } });
  return true;
}

export function recoveryRequirementMessage() {
  return "Admin MFA setup is required before administrative access is granted.";
}
