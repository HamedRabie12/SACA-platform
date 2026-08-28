import { createCipheriv, createDecipheriv, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

function keyBytes() {
  const raw = process.env.MFA_ENCRYPTION_KEY;
  if (!raw) throw new Error("MFA_ENCRYPTION_KEY is not configured");
  const cleaned = raw.trim();
  const key = /^[0-9a-fA-F]{64}$/.test(cleaned) ? Buffer.from(cleaned, "hex") : Buffer.from(cleaned, "base64");
  if (key.length !== 32) throw new Error("MFA_ENCRYPTION_KEY must decode to 32 bytes");
  return key;
}

export function encryptTotpSecret(secret: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", keyBytes(), iv);
  const enc = Buffer.concat([cipher.update(secret, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64url")}.${tag.toString("base64url")}.${enc.toString("base64url")}`;
}

export function decryptTotpSecret(ciphertext: string) {
  const [ivS, tagS, encS] = ciphertext.split(".");
  if (!ivS || !tagS || !encS) throw new Error("Invalid MFA secret");
  const decipher = createDecipheriv("aes-256-gcm", keyBytes(), Buffer.from(ivS, "base64url"));
  decipher.setAuthTag(Buffer.from(tagS, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(encS, "base64url")), decipher.final()]).toString("utf8");
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
export function generateBase32Secret(length = 32) {
  const bytes = randomBytes(Math.ceil((length * 5) / 8));
  let bits = 0;
  let value = 0;
  let out = "";
  for (const b of bytes) {
    value = (value << 8) | b;
    bits += 8;
    while (bits >= 5 && out.length < length) {
      bits -= 5;
      out += ALPHABET[(value >>> bits) & 31];
    }
  }
  return out.padEnd(length, "A").slice(0, length);
}

function base32Decode(value: string) {
  const clean = value.toUpperCase().replace(/[^A-Z2-7]/g, "");
  let buffer = 0;
  let bits = 0;
  const bytes: number[] = [];
  for (const ch of clean) {
    buffer = (buffer << 5) | ALPHABET.indexOf(ch);
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((buffer >>> bits) & 255);
    }
  }
  return Buffer.from(bytes);
}

export function verifyTotp(secret: string, code: string, timestamp = Date.now()) {
  const normalized = code.replace(/\D/g, "");
  if (!/^\d{6}$/.test(normalized)) return false;
  const counter = Math.floor(timestamp / 1000 / 30);
  const key = base32Decode(secret);
  for (let offset = -1; offset <= 1; offset += 1) {
    const buf = Buffer.alloc(8);
    buf.writeBigUInt64BE(BigInt(counter + offset));
    const digest = createHmac("sha1", key).update(buf).digest();
    const index = digest[digest.length - 1] & 0x0f;
    const otp = (digest.readUInt32BE(index) & 0x7fffffff) % 1_000_000;
    const expected = String(otp).padStart(6, "0");
    if (timingSafeEqual(Buffer.from(expected), Buffer.from(normalized))) return true;
  }
  return false;
}
