import { randomBytes, pbkdf2Sync, timingSafeEqual } from "node:crypto";

const ITERATIONS = 310_000;
const KEYLEN = 32;
const DIGEST = "sha256";

export function hashAdminPassword(password: string): string {
  const salt = randomBytes(16).toString("base64url");
  const hash = pbkdf2Sync(password, salt, ITERATIONS, KEYLEN, DIGEST).toString("base64url");
  return `pbkdf2$${DIGEST}$${ITERATIONS}$${salt}$${hash}`;
}

export function verifyAdminPassword(password: string, encoded: string): boolean {
  const [scheme, digest, iterations, salt, stored] = encoded.split("$");
  if (scheme !== "pbkdf2" || !digest || !iterations || !salt || !stored) return false;
  const candidate = pbkdf2Sync(password, salt, Number(iterations), KEYLEN, digest).toString("base64url");
  const a = Buffer.from(candidate);
  const b = Buffer.from(stored);
  return a.length === b.length && timingSafeEqual(a, b);
}
