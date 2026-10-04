import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseUpgradeFunnelEvent } from "./upgrade-funnel";

describe("parseUpgradeFunnelEvent", () => {
  it("normaliza visualização de planos sem plano", () => {
    assert.deepEqual(
      parseUpgradeFunnelEvent({
        step: "planos_view",
        plan: "elite",
        motivo: "aula-descricao",
      }),
      { step: "planos_view", plan: null, motivo: "aula-descricao" },
    );
  });

  it("exige a oferta no clique de checkout", () => {
    assert.equal(parseUpgradeFunnelEvent({ step: "checkout_click" }), null);
    assert.deepEqual(
      parseUpgradeFunnelEvent({
        step: "checkout_click",
        plan: "pro_mensal",
        motivo: "desconhecido",
      }),
      { step: "checkout_click", plan: "pro_mensal", motivo: null },
    );
  });
});
