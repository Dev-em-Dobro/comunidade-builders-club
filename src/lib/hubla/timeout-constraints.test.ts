// R1 — Testes de restrições de timeout e maxDuration para o webhook Hubla.
// Garantem que os valores cumprem a cadeia: maxDuration < claim timeout < Hubla retry window (~75s).

import assert from "node:assert/strict";
import { describe, it, before } from "node:test";

let TIMEOUT_PROCESSING_MS: number;
let ROUTE_MAX_DURATION_S: number;

describe("R1: restrições de timeout Hubla", () => {
  before(async () => {
    const regras = await import("./regras-conversao.js");
    TIMEOUT_PROCESSING_MS = regras.TIMEOUT_PROCESSING_MS;
    ROUTE_MAX_DURATION_S = regras.ROUTE_MAX_DURATION_S;
  });

  it("TIMEOUT_PROCESSING_MS deve ser < 60s (bem abaixo da janela de 75s da Hubla)", () => {
    assert.ok(
      TIMEOUT_PROCESSING_MS < 60_000,
      `TIMEOUT_PROCESSING_MS (${TIMEOUT_PROCESSING_MS}ms) deve ser < 60000ms para caber na janela de retry da Hubla`,
    );
  });

  it("TIMEOUT_PROCESSING_MS deve ser > ROUTE_MAX_DURATION_S * 1000", () => {
    const maxDurationMs = ROUTE_MAX_DURATION_S * 1000;
    assert.ok(
      TIMEOUT_PROCESSING_MS > maxDurationMs,
      `TIMEOUT_PROCESSING_MS (${TIMEOUT_PROCESSING_MS}ms) deve ser > maxDuration (${maxDurationMs}ms) — caso contrário, a função pode ser morta antes do claim expirar`,
    );
  });

  it("ROUTE_MAX_DURATION_S deve ser <= 60 (limite Vercel serverless)", () => {
    assert.ok(
      ROUTE_MAX_DURATION_S <= 60,
      `ROUTE_MAX_DURATION_S (${ROUTE_MAX_DURATION_S}s) deve ser <= 60s (limite Vercel)`,
    );
  });

  it("a rota exporta maxDuration igual a ROUTE_MAX_DURATION_S", async () => {
    const route = await import("../../app/api/webhooks/hubla/route.js");
    assert.equal(
      route.maxDuration,
      ROUTE_MAX_DURATION_S,
      "route.maxDuration deve usar ROUTE_MAX_DURATION_S",
    );
  });
});
