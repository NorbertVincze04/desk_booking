import test from "node:test";
import assert from "node:assert/strict";
import { generateTempPasswordString } from "../../src/utils/password.utils.ts";

test("generateTempPasswordString returns a 12-character password from allowed chars", () => {
  const password = generateTempPasswordString();

  assert.equal(password.length, 12);
  assert.match(password, /^[A-Za-z0-9!@#$%^&*]{12}$/);
});
