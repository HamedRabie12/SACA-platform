// Roundtrip test: canonical hash from scripts/hash-admin-password.mjs
// must be accepted by the new verifyAdminPassword.
//
// Uses node:test. Run with:  node --test tests/security/hash-script-compat.step1.2.test.mjs

import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { verifyAdminPassword } from "../../src/lib/security/password.ts";

const password = "Operator-Generated-Password-9!";

test("hash from scripts/hash-admin-password.mjs is accepted", () => {
  const out = execFileSync("node", ["scripts/hash-admin-password.mjs", password], { encoding: "utf8" });
  const encoded = out.trim();
  assert.match(encoded, /^pbkdf2\$sha256\$310000\$/);
  assert.equal(verifyAdminPassword(password, encoded), true);
  assert.equal(verifyAdminPassword("wrong", encoded), false);
});
