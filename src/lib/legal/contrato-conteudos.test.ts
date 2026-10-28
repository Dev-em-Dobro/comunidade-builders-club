import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CORTE_CONTRATO_CONTEUDOS,
  compraExigeContratoConteudos,
  dataEfetivaCompraContrato,
} from "./contrato-conteudos";

describe("compraExigeContratoConteudos — F122", () => {
  it("sem data → false", () => {
    assert.equal(compraExigeContratoConteudos(null), false);
    assert.equal(compraExigeContratoConteudos(undefined), false);
  });

  it("antes do corte → false", () => {
    assert.equal(
      compraExigeContratoConteudos(new Date("2026-10-27T23:59:59.999-03:00")),
      false,
    );
  });

  it("no instante do corte → true", () => {
    assert.equal(compraExigeContratoConteudos(CORTE_CONTRATO_CONTEUDOS), true);
  });

  it("depois do corte → true", () => {
    assert.equal(
      compraExigeContratoConteudos(new Date("2026-10-28T12:00:00-03:00")),
      true,
    );
  });
});

describe("dataEfetivaCompraContrato — F122 + F120", () => {
  it("escolhe a mais recente (PRO antigo + Vitalício novo)", () => {
    const antiga = new Date("2026-01-10T12:00:00.000Z");
    const vitalicio = new Date("2026-10-29T15:00:00.000Z");
    assert.equal(
      dataEfetivaCompraContrato([antiga, null, vitalicio])?.toISOString(),
      vitalicio.toISOString(),
    );
    assert.equal(
      compraExigeContratoConteudos(
        dataEfetivaCompraContrato([antiga, null, vitalicio]),
      ),
      true,
    );
  });

  it("Vitalício concedido antes do corte → não exige", () => {
    const vitalicio = new Date("2026-10-26T12:00:00.000Z");
    assert.equal(
      compraExigeContratoConteudos(dataEfetivaCompraContrato([vitalicio])),
      false,
    );
  });
});
