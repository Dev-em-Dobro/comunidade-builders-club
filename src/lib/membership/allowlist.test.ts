// Testes de allowlist.ts — B2: não sobrescreve paidAt existente.
// Usa funções de produção de regras-conversao.ts.

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildUpdatePaidAt,
  deveAtualizarPaidAtAllowlist,
} from "@/lib/hubla/regras-conversao";
import { normalizarEmail, parseEmailBulk } from "./allowlist";

describe("B2: buildUpdatePaidAt — só grava quando existente é null (produção)", () => {
  it("grava paidAt quando existente é null", () => {
    const novoPaidAt = new Date("2026-10-05T10:00:00Z");
    const update = buildUpdatePaidAt({ paidAt: novoPaidAt }, null);
    assert.deepEqual(update, { paidAt: novoPaidAt });
  });

  it("NÃO sobrescreve paidAt existente", () => {
    const novoPaidAt = new Date("2026-10-05T10:00:00Z");
    const existente = new Date("2026-09-01T10:00:00Z");
    const update = buildUpdatePaidAt({ paidAt: novoPaidAt }, existente);
    assert.deepEqual(update, {});
  });

  it("não altera quando não há novo paidAt", () => {
    const update = buildUpdatePaidAt({}, new Date());
    assert.deepEqual(update, {});
  });

  it("não altera quando novo paidAt é undefined e existente é null", () => {
    const update = buildUpdatePaidAt({ paidAt: undefined }, null);
    assert.deepEqual(update, {});
  });
});

describe("B2: deveAtualizarPaidAtAllowlist — regra pura de produção", () => {
  it("true quando novoPaidAt definido e existente é null", () => {
    assert.equal(deveAtualizarPaidAtAllowlist(new Date(), null), true);
  });

  it("false quando existente não é null (preserva original)", () => {
    assert.equal(deveAtualizarPaidAtAllowlist(new Date(), new Date()), false);
  });

  it("false quando novoPaidAt é undefined", () => {
    assert.equal(deveAtualizarPaidAtAllowlist(undefined, null), false);
  });
});

describe("normalizarEmail — normalização de email", () => {
  it("converte para lowercase", () => {
    assert.equal(normalizarEmail("Test@Example.COM"), "test@example.com");
  });

  it("remove espaços", () => {
    assert.equal(normalizarEmail("  test@example.com  "), "test@example.com");
  });

  it("normaliza email com espaços e uppercase", () => {
    assert.equal(normalizarEmail("  TEST@EXAMPLE.COM  "), "test@example.com");
  });
});

describe("parseEmailBulk — parse de emails em bulk", () => {
  it("separa por quebra de linha", () => {
    const result = parseEmailBulk("a@test.com\nb@test.com");
    assert.deepEqual(result, ["a@test.com", "b@test.com"]);
  });

  it("separa por vírgula", () => {
    const result = parseEmailBulk("a@test.com,b@test.com");
    assert.deepEqual(result, ["a@test.com", "b@test.com"]);
  });

  it("separa por ponto-e-vírgula", () => {
    const result = parseEmailBulk("a@test.com;b@test.com");
    assert.deepEqual(result, ["a@test.com", "b@test.com"]);
  });

  it("remove duplicatas", () => {
    const result = parseEmailBulk("a@test.com\na@test.com\nb@test.com");
    assert.deepEqual(result, ["a@test.com", "b@test.com"]);
  });

  it("normaliza emails", () => {
    const result = parseEmailBulk("A@TEST.COM\nB@Test.com");
    assert.deepEqual(result, ["a@test.com", "b@test.com"]);
  });

  it("ignora linhas vazias", () => {
    const result = parseEmailBulk("a@test.com\n\nb@test.com\n");
    assert.deepEqual(result, ["a@test.com", "b@test.com"]);
  });
});

// B2: Teste de integração — addAllowedEmail usa buildUpdatePaidAt
describe("B2: addAllowedEmail — integração com buildUpdatePaidAt", () => {
  // Simula a lógica de addAllowedEmail
  function simularAddAllowedEmailUpdate(
    existingPaidAt: Date | null,
    novoPaidAt: Date | undefined,
  ): { paidAt?: Date } {
    return buildUpdatePaidAt({ paidAt: novoPaidAt }, existingPaidAt);
  }

  it("atualiza paidAt quando allowedEmail não tinha paidAt", () => {
    const novoPaidAt = new Date("2026-10-05T10:00:00Z");
    const update = simularAddAllowedEmailUpdate(null, novoPaidAt);
    assert.deepEqual(update, { paidAt: novoPaidAt });
  });

  it("NÃO sobrescreve paidAt existente (B2)", () => {
    const existente = new Date("2026-09-01T10:00:00Z");
    const novoPaidAt = new Date("2026-10-05T10:00:00Z");
    const update = simularAddAllowedEmailUpdate(existente, novoPaidAt);
    assert.deepEqual(update, {});
  });
});
