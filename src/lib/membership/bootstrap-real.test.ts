// Testes de integração para bootstrap.ts — testa código REAL.
// Cobre: N2 (só marca conversão quando source='hubla'|'tmb' com paidAt).

import assert from "node:assert/strict";
import { describe, it } from "node:test";

// Importa a função REAL de produção
import { calcularConversaoBootstrap } from "./bootstrap.js";

describe("N2: calcularConversaoBootstrap — código REAL de produção", () => {
  it("allowed + hubla + paidAt → marca conversão", () => {
    const result = calcularConversaoBootstrap(
      true,  // isAllowed
      false, // isBootstrapAdmin
      "hubla",
      new Date(),
    );
    assert.equal(result, true);
  });

  it("allowed + tmb + paidAt → marca conversão", () => {
    const result = calcularConversaoBootstrap(
      true,  // isAllowed
      false, // isBootstrapAdmin
      "tmb",
      new Date(),
    );
    assert.equal(result, true);
  });

  it("allowed + orion + paidAt → NÃO marca (N2: source inválido)", () => {
    const result = calcularConversaoBootstrap(
      true,
      false,
      "orion",
      new Date(),
    );
    assert.equal(result, false);
  });

  it("allowed + manual + paidAt → NÃO marca (N2: source inválido)", () => {
    const result = calcularConversaoBootstrap(
      true,
      false,
      "manual",
      new Date(),
    );
    assert.equal(result, false);
  });

  it("allowed + devquest + paidAt → NÃO marca", () => {
    const result = calcularConversaoBootstrap(
      true,
      false,
      "devquest",
      new Date(),
    );
    assert.equal(result, false);
  });

  it("allowed + admin-bulk + paidAt → NÃO marca", () => {
    const result = calcularConversaoBootstrap(
      true,
      false,
      "admin-bulk",
      new Date(),
    );
    assert.equal(result, false);
  });

  it("allowed + hubla + sem paidAt → NÃO marca", () => {
    const result = calcularConversaoBootstrap(
      true,
      false,
      "hubla",
      null,
    );
    assert.equal(result, false);
  });

  it("NÃO allowed → NÃO marca", () => {
    const result = calcularConversaoBootstrap(
      false, // isAllowed
      false,
      "hubla",
      new Date(),
    );
    assert.equal(result, false);
  });

  it("admin → NÃO marca", () => {
    const result = calcularConversaoBootstrap(
      true,
      true, // isBootstrapAdmin
      "hubla",
      new Date(),
    );
    assert.equal(result, false);
  });

  it("source null → NÃO marca", () => {
    const result = calcularConversaoBootstrap(
      true,
      false,
      null,
      new Date(),
    );
    assert.equal(result, false);
  });
});
