import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { codesElite, codesPermitidos, interpretarVendaTmb } from "./interpretar";
import { TMB_CODE_BLACK_INFINITA } from "./tipos";

const oldEnv = { ...process.env };
afterEach(() => { process.env = { ...oldEnv }; });

function venda(code: string, lancamento_id = 41472) {
  return {
    email: "aluno@example.com",
    code,
    pedido: "1001",
    lancamento_id,
    status_pedido: "efetivado",
    status_financeiro: "adimplente",
  };
}

describe("TMB Black Infinita 2026", () => {
  it("a oferta base concede Elite vitalício mesmo com filtros antigos", () => {
    process.env.TMB_PRODUCT_CODES = "1AS249898VN";
    process.env.TMB_ELITE_CODES = "3XB272209KV";
    process.env.TMB_LANCAMENTO_ID = "36238";
    assert.equal(codesPermitidos().has(TMB_CODE_BLACK_INFINITA), true);
    assert.equal(codesElite().has(TMB_CODE_BLACK_INFINITA), true);
    const acao = interpretarVendaTmb(venda(TMB_CODE_BLACK_INFINITA));
    assert.equal(acao.acao, "conceder");
    if (acao.acao !== "conceder") return;
    assert.equal(acao.plan, "elite");
    assert.equal(acao.vitalicio, true);
  });

  it("não concede renovação do mesmo produto", () => {
    assert.equal(interpretarVendaTmb(venda("CSN345414S8")).acao, "ignorar");
  });
});
