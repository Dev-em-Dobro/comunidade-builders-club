import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { podeOtimizarImagem } from "./hosts";

describe("podeOtimizarImagem — F095", () => {
  it("aceita o blob da Vercel, onde o storeUpload grava", () => {
    assert.equal(
      podeOtimizarImagem(
        "https://abc123.public.blob.vercel-storage.com/posts/1-a.webp",
      ),
      true,
    );
  });

  it("aceita o avatar do Google", () => {
    assert.equal(
      podeOtimizarImagem("https://lh3.googleusercontent.com/a/ACg8oc=s96-c"),
      true,
    );
  });

  it("aceita subdomínio do Panda e o domínio pelado", () => {
    assert.equal(
      podeOtimizarImagem("https://player-vz-1.tv.pandavideo.com.br/t.jpg"),
      true,
    );
    assert.equal(podeOtimizarImagem("https://pandavideo.com.br/t.jpg"), true);
  });

  it("recusa host de fora — é o proxy aberto que a F095 fecha", () => {
    assert.equal(podeOtimizarImagem("https://exemplo.com/foto.jpg"), false);
    assert.equal(podeOtimizarImagem("https://i.imgur.com/foto.jpg"), false);
  });

  /**
   * O ataque que uma allowlist ingênua por `includes` deixaria passar: o host
   * permitido vira prefixo, sufixo ou subdomínio do host do atacante.
   */
  it("recusa host que só imita um permitido", () => {
    assert.equal(
      podeOtimizarImagem("https://lh3.googleusercontent.com.evil.com/x.jpg"),
      false,
    );
    assert.equal(
      podeOtimizarImagem("https://evil-pandavideo.com.br/x.jpg"),
      false,
    );
    assert.equal(
      podeOtimizarImagem("https://notlh3.googleusercontent.com/x.jpg"),
      false,
    );
  });

  it("aceita URL relativa — é servida por este app", () => {
    assert.equal(podeOtimizarImagem("/uploads/posts/a.webp"), true);
  });

  it("recusa protocol-relative, que sai para outro host", () => {
    assert.equal(podeOtimizarImagem("//exemplo.com/foto.jpg"), false);
  });

  it("recusa data:, javascript: e lixo", () => {
    assert.equal(podeOtimizarImagem("data:image/png;base64,AAAA"), false);
    assert.equal(podeOtimizarImagem("javascript:alert(1)"), false);
    assert.equal(podeOtimizarImagem("não é url"), false);
    assert.equal(podeOtimizarImagem(""), false);
    assert.equal(podeOtimizarImagem("   "), false);
  });

  it("ignora caixa no host", () => {
    assert.equal(
      podeOtimizarImagem("https://LH3.GoogleUserContent.com/a/x"),
      true,
    );
  });
});
