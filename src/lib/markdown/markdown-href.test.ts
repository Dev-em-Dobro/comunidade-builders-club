import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { markdownHrefIsDownload } from "./text";

describe("markdownHrefIsDownload — F100", () => {
  it("baixa só anexo em /materiais/", () => {
    assert.equal(
      markdownHrefIsDownload("/materiais/calculo-horas-freelance.xlsx"),
      true,
    );
  });

  it("não baixa rota do app", () => {
    assert.equal(markdownHrefIsDownload("/entregaveis/precificacao"), false);
    assert.equal(markdownHrefIsDownload("/planos"), false);
    assert.equal(markdownHrefIsDownload("/aulas/fundamentos-gpt-maker"), false);
  });

  it("não baixa http(s)", () => {
    assert.equal(
      markdownHrefIsDownload("https://comunidade-builders-club.devemdobro.com/entregaveis/precificacao"),
      false,
    );
  });
});
