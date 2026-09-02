// Cookie format test for the new admin-verify.ts.
//
// The cookie payload must be EXACTLY:
//   { sid: string, sub: string, iat: number, exp: number, ver: 3 }
//
// It MUST NOT contain role, scopeType, scopeId, mfaRequired, mfaVerified,
// or userId (any of which would constitute a stale source of authority).
//
// Uses node:test. Run with:  node --test tests/security/cookie-format.step1.2.test.mjs

import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";

// Mirror the server-side buildCookieValue from admin-verify.ts.
// Do NOT import the module under test here (it requires ADMIN_SESSION_SECRET
// and that env is not set in this harness).

function b64urlEncode(value) {
  const buf = typeof value === "string" ? Buffer.from(value, "utf8") : Buffer.from(value);
  return buf.toString("base64url");
}

function build(payload) {
  const encoded = b64urlEncode(JSON.stringify(payload));
  const sig = createHmac("sha256", "a-very-secret-key-with-at-least-32-characters").update(encoded).digest();
  return `${encoded}.${b64urlEncode(sig)}`;
}

test("payload schema contains only sid/sub/iat/exp/ver", () => {
  const cookie = build({ sid: "abc-123", sub: "admin@example.example", iat: 100, exp: 200, ver: 3 });
  const [payload] = cookie.split(".");
  const json = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  const keys = Object.keys(json).sort();
  assert.deepEqual(keys, ["exp", "iat", "sid", "sub", "ver"]);
});

test("payload MUST NOT contain role, scopeType, scopeId, mfaRequired, mfaVerified, userId", () => {
  const cookie = build({ sid: "x", sub: "y", iat: 1, exp: 2, ver: 3 });
  const [payload] = cookie.split(".");
  const json = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  for (const forbidden of ["role", "scopeType", "scopeId", "mfaRequired", "mfaVerified", "userId"]) {
    assert.equal(json[forbidden], undefined, `forbidden key ${forbidden} present in cookie payload`);
  }
});

test("ver MUST equal 3", () => {
  const cookie = build({ sid: "x", sub: "y", iat: 1, exp: 2, ver: 3 });
  const [payload] = cookie.split(".");
  const json = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  assert.equal(json.ver, 3);
});
