import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { contextoAceiteDeHeaders } from "./aceite-legal";

describe("contextoAceiteDeHeaders — origem do aceite (F058)", () => {
  it("pega o primeiro IP do x-forwarded-for", () => {
    // A cadeia da Vercel/Cloudflare chega como "cliente, proxy1, proxy2".
    // O primeiro é o titular; os outros são infraestrutura.
    const h = new Headers({
      "x-forwarded-for": "203.0.113.7, 70.41.3.18, 150.172.238.178",
      "user-agent": "Mozilla/5.0 (iPhone)",
    });
    assert.deepEqual(contextoAceiteDeHeaders(h), {
      ip: "203.0.113.7",
      userAgent: "Mozilla/5.0 (iPhone)",
    });
  });

  it("tolera espaço em volta do IP", () => {
    const h = new Headers({ "x-forwarded-for": "  203.0.113.7 , 10.0.0.1" });
    assert.equal(contextoAceiteDeHeaders(h).ip, "203.0.113.7");
  });

  it("sem x-forwarded-for grava null em vez de string vazia", () => {
    const h = new Headers({ "user-agent": "curl/8.4.0" });
    assert.deepEqual(contextoAceiteDeHeaders(h), {
      ip: null,
      userAgent: "curl/8.4.0",
    });
  });

  it("sem headers devolve contexto vazio, sem lançar", () => {
    // O hook de criação do Better Auth pode não trazer request em todo
    // caminho; perder o IP é aceitável, quebrar o cadastro não é.
    assert.deepEqual(contextoAceiteDeHeaders(undefined), {});
    assert.deepEqual(contextoAceiteDeHeaders(null), {});
  });
});
