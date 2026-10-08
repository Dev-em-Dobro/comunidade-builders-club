// Testes de bootstrap.ts — N2: só marca conversão quando source='hubla'|'tmb' com paidAt.
// Usa deveMarcarConversaoBootstrap de produção (regras-conversao.ts).

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { deveMarcarConversaoBootstrap } from "@/lib/hubla/regras-conversao";

describe("N2: deveMarcarConversaoBootstrap — só hubla/tmb com paidAt", () => {
  it("source='hubla' com paidAt → marca conversão", () => {
    assert.equal(
      deveMarcarConversaoBootstrap({ source: "hubla", paidAt: new Date() }),
      true,
    );
  });

  it("source='tmb' com paidAt → marca conversão", () => {
    assert.equal(
      deveMarcarConversaoBootstrap({ source: "tmb", paidAt: new Date() }),
      true,
    );
  });

  it("source='orion' com paidAt → NÃO marca (não é fonte de conversão)", () => {
    assert.equal(
      deveMarcarConversaoBootstrap({ source: "orion", paidAt: new Date() }),
      false,
    );
  });

  it("source='devquest' com paidAt → NÃO marca", () => {
    assert.equal(
      deveMarcarConversaoBootstrap({ source: "devquest", paidAt: new Date() }),
      false,
    );
  });

  it("source='manual' com paidAt → NÃO marca", () => {
    assert.equal(
      deveMarcarConversaoBootstrap({ source: "manual", paidAt: new Date() }),
      false,
    );
  });

  it("source='admin-bulk' com paidAt → NÃO marca", () => {
    assert.equal(
      deveMarcarConversaoBootstrap({ source: "admin-bulk", paidAt: new Date() }),
      false,
    );
  });

  it("source='hubla' sem paidAt → NÃO marca (sem data de pagamento)", () => {
    assert.equal(
      deveMarcarConversaoBootstrap({ source: "hubla", paidAt: null }),
      false,
    );
  });

  it("source=null com paidAt → NÃO marca (source desconhecido)", () => {
    assert.equal(
      deveMarcarConversaoBootstrap({ source: null, paidAt: new Date() }),
      false,
    );
  });
});

// N2: Integração — bootstrap usa deveMarcarConversaoBootstrap
describe("N2: bootstrap — integração com deveMarcarConversaoBootstrap", () => {
  // Simula a lógica do bootstrap para marcar conversão
  function simularBootstrapMarcarConversao(
    source: string | null,
    paidAt: Date | null,
    isAllowed: boolean,
    isAdmin: boolean,
  ): boolean {
    if (!isAllowed || isAdmin) return false;
    return deveMarcarConversaoBootstrap({ source, paidAt });
  }

  it("allowed + hubla + paidAt → marca conversão", () => {
    assert.ok(simularBootstrapMarcarConversao("hubla", new Date(), true, false));
  });

  it("allowed + tmb + paidAt → marca conversão", () => {
    assert.ok(simularBootstrapMarcarConversao("tmb", new Date(), true, false));
  });

  it("allowed + orion + paidAt → NÃO marca", () => {
    assert.ok(!simularBootstrapMarcarConversao("orion", new Date(), true, false));
  });

  it("não-allowed + hubla + paidAt → NÃO marca (não está na allowlist)", () => {
    assert.ok(!simularBootstrapMarcarConversao("hubla", new Date(), false, false));
  });

  it("admin + hubla + paidAt → NÃO marca (admin não conta)", () => {
    assert.ok(!simularBootstrapMarcarConversao("hubla", new Date(), true, true));
  });

  it("allowed + hubla + sem paidAt → NÃO marca", () => {
    assert.ok(!simularBootstrapMarcarConversao("hubla", null, true, false));
  });
});
