import { randomBytes, pbkdf2Sync, timingSafeEqual } from "node:crypto";

// Canonical hash format produced by scripts/hash-admin-password.mjs:
//   pbkdf2$<digest>$<iterations>$<salt>$<hash>
//   e.g. pbkdf2$sha256$310000$<16-byte base64url salt>$<32-byte base64url hash>
//
// Hardening notes:
//   * Iterations are clamped to MAX_ITERATIONS to prevent a stored-hash
//     DoS by a privileged insider. The canonical value (310000) is well
//     below the cap.
//   * Digest is restricted to {sha1, sha256, sha512}. The canonical value
//     is sha256.
//   * The password candidate is hashed with the parsed parameters and
//     compared in constant time. The lengths of the two base64url
//     strings are also compared in constant time by padding both to
//     a fixed length before timingSafeEqual.
//   * No plaintext fallback. No logging. No throw on malformed input;
//     verifyAdminPassword returns false uniformly.

const ITERATIONS = 310_000;
const KEYLEN = 32;
const DIGEST = "sha256";
const MIN_ITERATIONS = 1000;
const MAX_ITERATIONS = 1_000_000;
const ALLOWED_DIGESTS = new Set(["sha1", "sha256", "sha512"]);

export function hashAdminPassword(password: string): string {
  const salt = randomBytes(16).toString("base64url");
  const hash = pbkdf2Sync(password, salt, ITERATIONS, KEYLEN, DIGEST).toString("base64url");
  return `pbkdf2$${DIGEST}$${ITERATIONS}$${salt}$${hash}`;
}

function safeEqualB64Url(a: string, b: string): boolean {
  // base64url uses the same alphabet length regardless of value;
  // pad both to a fixed length (128 bytes) before timingSafeEqual.
  const bufA = Buffer.alloc(128);
  const bufB = Buffer.alloc(128);
  Buffer.from(a, "utf8").copy(bufA);
  Buffer.from(b, "utf8").copy(bufB);
  return timingSafeEqual(bufA, bufB);
}

export function verifyAdminPassword(password: string, encoded: string): boolean {
  if (typeof password !== "string" || typeof encoded !== "string") return false;
  const parts = encoded.split("$");
  if (parts.length !== 5) return false;
  const [scheme, digest, iterationsRaw, salt, stored] = parts;
  if (scheme !== "pbkdf2") return false;
  if (!digest || !ALLOWED_DIGESTS.has(digest)) return false;
  if (!salt || !stored) return false;
  const iterations = Number(iterationsRaw);
  if (!Number.isInteger(iterations)) return false;
  if (iterations < MIN_ITERATIONS || iterations > MAX_ITERATIONS) return false;
  let candidate: string;
  try {
    candidate = pbkdf2Sync(password, salt, iterations, KEYLEN, digest).toString("base64url");
  } catch {
    return false;
  }
  return safeEqualB64Url(candidate, stored);
}
