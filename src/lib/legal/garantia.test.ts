import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DOCUMENTO_GARANTIA,
  LISTA_GARANTIA,
  PROMESSA_ELITE,
  PROMESSA_PRO,
  VERSAO_GARANTIA,
} from "./garantia";

describe("garantia — F090", () => {
  it("tem 8 itens na lista de execução", () => {
    assert.equal(LISTA_GARANTIA.length, 8);
    assert.equal(LISTA_GARANTIA[0]?.numero, 1);
    assert.equal(LISTA_GARANTIA[7]?.numero, 8);
  });

  it("versão e documento estão definidos", () => {
    assert.equal(DOCUMENTO_GARANTIA, "garantia");
    assert.match(VERSAO_GARANTIA, /^\d{4}-\d{2}-\d{2}$/);
  });

  it("promessas Pro e Elite são distintas", () => {
    assert.notEqual(PROMESSA_PRO, PROMESSA_ELITE);
    assert.doesNotMatch(PROMESSA_PRO, /garantia/i);
    assert.match(PROMESSA_ELITE, /garantia/i);
  });
});
