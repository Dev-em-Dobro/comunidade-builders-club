import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { signEmailUnsubToken, verifyEmailUnsubToken } from "./email-token";

describe("email unsub token — F072", () => {
  it("assina e verifica", () => {
    const prev = process.env.BETTER_AUTH_SECRET;
    process.env.BETTER_AUTH_SECRET = "test-secret-f072";
    try {
      const token = signEmailUnsubToken("user_abc");
      assert.equal(verifyEmailUnsubToken(token), "user_abc");
      assert.equal(verifyEmailUnsubToken("user_abc.deadbeef"), null);
      assert.equal(verifyEmailUnsubToken("nope"), null);
    } finally {
      if (prev === undefined) delete process.env.BETTER_AUTH_SECRET;
      else process.env.BETTER_AUTH_SECRET = prev;
    }
  });
});
