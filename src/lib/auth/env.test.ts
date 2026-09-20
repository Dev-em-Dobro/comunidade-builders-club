import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { loadAuthEnv } from "./env";

const ENVS = [
  "BETTER_AUTH_SECRET",
  "BETTER_AUTH_URL",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
] as const;

const original = Object.fromEntries(
  ENVS.map((k) => [k, process.env[k]]),
) as Record<(typeof ENVS)[number], string | undefined>;

function setEnv(valores: Partial<Record<(typeof ENVS)[number], string>>) {
  for (const k of ENVS) {
    const v = valores[k];
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
}

afterEach(() => {
  for (const k of ENVS) {
    const v = original[k];
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
});

const BASE = {
  BETTER_AUTH_SECRET: "s3cr3t",
  BETTER_AUTH_URL: "https://club.exemplo.com",
} as const;

describe("loadAuthEnv — sem defaults", () => {
  it("lança sem BETTER_AUTH_SECRET", () => {
    setEnv({ BETTER_AUTH_URL: BASE.BETTER_AUTH_URL });
    assert.throws(() => loadAuthEnv(), /BETTER_AUTH_SECRET/);
  });

  it("lança sem BETTER_AUTH_URL", () => {
    setEnv({ BETTER_AUTH_SECRET: BASE.BETTER_AUTH_SECRET });
    assert.throws(() => loadAuthEnv(), /BETTER_AUTH_URL/);
  });

  it("string vazia não conta como configurada", () => {
    setEnv({ ...BASE, BETTER_AUTH_SECRET: "   " });
    assert.throws(() => loadAuthEnv(), /BETTER_AUTH_SECRET/);
  });
});

describe("loadAuthEnv — Google as duas ou nenhuma (F095)", () => {
  it("nenhuma das duas é válido: sobra magic link e OTP", () => {
    setEnv(BASE);
    assert.equal(loadAuthEnv().google, null);
  });

  it("as duas presentes montam o provider", () => {
    setEnv({ ...BASE, GOOGLE_CLIENT_ID: "id", GOOGLE_CLIENT_SECRET: "sec" });
    assert.deepEqual(loadAuthEnv().google, {
      clientId: "id",
      clientSecret: "sec",
    });
  });

  it("só o ID lança, apontando a que falta", () => {
    setEnv({ ...BASE, GOOGLE_CLIENT_ID: "id" });
    assert.throws(() => loadAuthEnv(), /GOOGLE_CLIENT_SECRET/);
  });

  it("só o SECRET lança, apontando a que falta", () => {
    setEnv({ ...BASE, GOOGLE_CLIENT_SECRET: "sec" });
    assert.throws(() => loadAuthEnv(), /GOOGLE_CLIENT_ID/);
  });
});
