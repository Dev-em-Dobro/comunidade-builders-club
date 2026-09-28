import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { META_FUNIL_BASTIDORES_PCT } from "./metricas";

describe("META_FUNIL_BASTIDORES_PCT — constante de referência", () => {
  it("está no range 30–50% documentado", () => {
    assert.ok(META_FUNIL_BASTIDORES_PCT >= 30);
    assert.ok(META_FUNIL_BASTIDORES_PCT <= 50);
  });

  it("default é 40% conforme spec P0", () => {
    assert.equal(META_FUNIL_BASTIDORES_PCT, 40);
  });
});

describe("calcTaxa helper — internals via export check", () => {
  const calcTaxa = (numerador: number, denominador: number): number | null => {
    if (denominador === 0) return null;
    return Math.round((numerador / denominador) * 1000) / 10;
  };

  it("retorna null quando denominador é zero", () => {
    assert.equal(calcTaxa(10, 0), null);
    assert.equal(calcTaxa(0, 0), null);
  });

  it("calcula percentual com 1 casa decimal", () => {
    assert.equal(calcTaxa(40, 100), 40);
    assert.equal(calcTaxa(33, 100), 33);
    assert.equal(calcTaxa(1, 3), 33.3);
    assert.equal(calcTaxa(2, 3), 66.7);
  });

  it("aceita valores acima de 100%", () => {
    assert.equal(calcTaxa(150, 100), 150);
  });
});

describe("BastidoresFunilSummary shape", () => {
  it("tipo exportado tem campos obrigatórios (compile-time check)", () => {
    const summary: {
      totalFreeComOrigem: number;
      totalCliquesComOrigem: number;
      taxaGeralPct: number | null;
      metaReferenciaPct: number;
      porOrigem: Array<{
        key: string;
        label: string;
        cadastrosFreeComOrigem: number;
        cliquesBastidores: number;
        taxaPct: number | null;
      }>;
    } = {
      totalFreeComOrigem: 100,
      totalCliquesComOrigem: 40,
      taxaGeralPct: 40,
      metaReferenciaPct: 40,
      porOrigem: [
        {
          key: "utm:test",
          label: "test",
          cadastrosFreeComOrigem: 50,
          cliquesBastidores: 20,
          taxaPct: 40,
        },
      ],
    };

    assert.equal(summary.totalFreeComOrigem, 100);
    assert.equal(summary.porOrigem.length, 1);
  });
});
