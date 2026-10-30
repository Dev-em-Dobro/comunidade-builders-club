import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { shouldShowBlackAlunosPopup } from "./black-alunos-popup";

const base = {
  isPaid: true,
  isVitalicio: false,
  precisaCienteGarantia: false,
};

describe("shouldShowBlackAlunosPopup (F125)", () => {
  it("aluno pago que não comprou a Black vê", () => {
    assert.equal(shouldShowBlackAlunosPopup(base), true);
  });

  it("Free não vê", () => {
    assert.equal(shouldShowBlackAlunosPopup({ ...base, isPaid: false }), false);
  });

  it("Vitalício já comprou e não vê", () => {
    assert.equal(
      shouldShowBlackAlunosPopup({ ...base, isVitalicio: true }),
      false,
    );
  });

  it("não aparece por cima da modal de garantia", () => {
    assert.equal(
      shouldShowBlackAlunosPopup({ ...base, precisaCienteGarantia: true }),
      false,
    );
  });
});
