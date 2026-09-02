import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseImagemBloco } from "./text";

describe("parseImagemBloco (F076)", () => {
  it("lê imagem com legenda", () => {
    assert.deepEqual(parseImagemBloco("![A tela do jogo](https://x.com/a.webp)"), {
      legenda: "A tela do jogo",
      url: "https://x.com/a.webp",
    });
  });

  it("aceita legenda vazia, para imagem decorativa", () => {
    assert.deepEqual(parseImagemBloco("![](https://x.com/a.webp)"), {
      legenda: "",
      url: "https://x.com/a.webp",
    });
  });

  it("aceita caminho interno", () => {
    assert.deepEqual(parseImagemBloco("![capa](/uploads/posts/a.webp)"), {
      legenda: "capa",
      url: "/uploads/posts/a.webp",
    });
  });

  it("ignora indentação em volta da linha", () => {
    assert.equal(parseImagemBloco("   ![x](https://x.com/a.webp)  ")?.legenda, "x");
  });

  it("recusa imagem no meio de uma frase", () => {
    assert.equal(parseImagemBloco("olha isso ![x](https://x.com/a.webp) aqui"), null);
  });

  it("recusa link comum, que não é imagem", () => {
    assert.equal(parseImagemBloco("[documentação](https://x.com/doc)"), null);
  });

  it("recusa protocolo perigoso", () => {
    assert.equal(parseImagemBloco("![x](javascript:alert(1))"), null);
    assert.equal(parseImagemBloco("![x](//evil.com/a.png)"), null);
  });
});
