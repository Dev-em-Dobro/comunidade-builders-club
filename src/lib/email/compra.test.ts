import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { categoriaDoEmail } from "./categorias";
import { conteudoCompraEmail, textoCompraEmail } from "./compra";

describe("conteudoCompraEmail — F127", () => {
  it("módulo usa o título que veio do banco", () => {
    const c = conteudoCompraEmail({ tipo: "modulo", tituloModulo: " CRM com IA " });
    assert.equal(c.subject, "Seu acesso ao CRM com IA — Builders Club");
    assert.match(c.liberado, /CRM com IA/);
  });

  it("PRO e Elite têm assunto próprio", () => {
    assert.equal(conteudoCompraEmail({ tipo: "pro" }).subject, "Seu acesso PRO — Builders Club");
    assert.equal(conteudoCompraEmail({ tipo: "elite" }).subject, "Seu acesso Elite — Builders Club");
  });

  it("todo assunto cai na categoria compra, mesmo sem tag", () => {
    for (const compra of [
      { tipo: "modulo", tituloModulo: "CRM com IA" },
      { tipo: "pro" },
      { tipo: "elite" },
    ] as const) {
      const { subject } = conteudoCompraEmail(compra);
      assert.equal(categoriaDoEmail({ subject }), "compra");
    }
  });

  it("login por link ou código não vira compra", () => {
    assert.equal(categoriaDoEmail({ subject: "Seu link de acesso — Builders Club" }), "login");
    assert.equal(categoriaDoEmail({ subject: "Seu código de acesso — Builders Club" }), "login");
  });
});

describe("textoCompraEmail — F127", () => {
  it("traz o e-mail da compra e o endereço de login", () => {
    const texto = textoCompraEmail(
      { tipo: "pro" },
      { email: "ana@example.com", loginUrl: "https://club.example/login" },
    );
    assert.match(texto, /ana@example\.com/);
    assert.match(texto, /https:\/\/club\.example\/login/);
    assert.match(texto, /código/);
  });
});
