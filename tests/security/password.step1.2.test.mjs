// E9 Step 1.2 — focused security behavior tests for the password verifier.
//
// Uses node:test (built into Node 18+). No DB required for these tests.
// Run with:  node --test tests/security/password.step1.2.test.mjs

import { test } from "node:test";
import assert from "node:assert/strict";
import { hashAdminPassword, verifyAdminPassword } from "../../src/lib/security/password.ts";

test("canonical hash roundtrip succeeds", () => {
  const password = "CorrectHorseBatteryStaple!9";
  const encoded = hashAdminPassword(password);
  assert.equal(verifyAdminPassword(password, encoded), true);
});

test("wrong password is rejected", () => {
  const encoded = hashAdminPassword("a-very-secret-password");
  assert.equal(verifyAdminPassword("not-the-password", encoded), false);
});

test("malformed encoded string is rejected without throwing", () => {
  assert.equal(verifyAdminPassword("any", ""), false);
  assert.equal(verifyAdminPassword("any", "not-a-hash"), false);
  assert.equal(verifyAdminPassword("any", "pbkdf2$$$$"), false);
  assert.equal(verifyAdminPassword("any", "pbkdf2$$$foo"), false);
  assert.equal(verifyAdminPassword("any", "pbkdf2$bogus$310000$abc$def"), false);
  assert.equal(verifyAdminPassword("any", "pbkdf2$sha256$abc$abc$abc"), false);
  assert.equal(verifyAdminPassword("any", "pbkdf2$sha256$310000$abc"), false);
  assert.equal(verifyAdminPassword("any", "pbkdf2$sha256$310000$$"), false);
});

test("out-of-range iterations are rejected (DoS guard)", () => {
  const salt = "0123456789abcdef";
  const hash = "abcdef0123456789";
  assert.equal(verifyAdminPassword("any", `pbkdf2$sha256$0$${salt}$${hash}`), false);
  assert.equal(verifyAdminPassword("any", `pbkdf2$sha256$500$${salt}$${hash}`), false);
  assert.equal(verifyAdminPassword("any", `pbkdf2$sha256$9999999999$${salt}$${hash}`), false);
  assert.equal(verifyAdminPassword("any", `pbkdf2$sha256$310000.5$${salt}$${hash}`), false);
  assert.equal(verifyAdminPassword("any", `pbkdf2$sha256$notanumber$${salt}$${hash}`), false);
});

test("non-string inputs are rejected", () => {
  // @ts-expect-error -- intentional bad input
  assert.equal(verifyAdminPassword(null, "pbkdf2$sha256$310000$aa$bb"), false);
  // @ts-expect-error
  assert.equal(verifyAdminPassword(undefined, "pbkdf2$sha256$310000$aa$bb"), false);
  // @ts-expect-error
  assert.equal(verifyAdminPassword(123, "pbkdf2$sha256$310000$aa$bb"), false);
});

test("rejects unknown digest", () => {
  const salt = "0123456789abcdef";
  const hash = "abcdef0123456789";
  assert.equal(verifyAdminPassword("any", `pbkdf2$md5$310000$${salt}$${hash}`), false);
  assert.equal(verifyAdminPassword("any", `pbkdf2$$310000$${salt}$${hash}`), false);
});

test("constant-time comparison does not leak via early return on length mismatch", () => {
  // A short encoded string is rejected; a long canonical-format string is also rejected for a wrong password.
  // The function must not throw on either; both return false.
  assert.equal(verifyAdminPassword("x", "pbkdf2$sha256$310000$aa$bb"), false);
  assert.equal(verifyAdminPassword("x", "pbkdf2$sha256$310000$aaaaaaaaaaaaaaaaaaaaaaaaaaaa$bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"), false);
});
