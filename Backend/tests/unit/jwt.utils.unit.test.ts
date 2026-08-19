import test from "node:test";
import assert from "node:assert/strict";
import { generateToken, verifyToken } from "../../src/utils/jwt.utils.ts";

test("verifyToken returns payload fields from a generated token", () => {
  const payload = {
    id: 42,
    fullName: "Ignored By Token",
    email: "tester@example.com",
    type: "admin" as const,
  };

  const token = generateToken(payload);
  const decoded = verifyToken(token);

  assert.ok(decoded);
  assert.equal(decoded.id, payload.id);
  assert.equal(decoded.email, payload.email);
  assert.equal(decoded.type, payload.type);
});

test("verifyToken returns null for an invalid token", () => {
  const decoded = verifyToken("not-a-valid-jwt");
  assert.equal(decoded, null);
});

test("generated token payload does not include fullName", () => {
  const payload = {
    id: 7,
    fullName: "Should Not Be Encoded",
    email: "no-name@example.com",
    type: "user" as const,
  };

  const token = generateToken(payload);
  const decoded = verifyToken(token);

  assert.ok(decoded);
  assert.equal((decoded as { fullName?: string }).fullName, undefined);
});
