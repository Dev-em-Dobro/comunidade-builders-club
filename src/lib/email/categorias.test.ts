import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  categoriaDoEmail,
  categorizarPorAssunto,
} from "./categorias";

describe("categorizarPorAssunto — F085", () => {
  it("login", () => {
    assert.equal(
      categorizarPorAssunto("Seu link de acesso — Builders Club"),
      "login",
    );
    assert.equal(
      categorizarPorAssunto("Seu código de acesso — Builders Club"),
      "login",
    );
  });

  it("live", () => {
    assert.equal(
      categorizarPorAssunto("Amanhã tem live no Builders Club"),
      "live",
    );
    assert.equal(
      categorizarPorAssunto("Começa em instantes: live no Builders Club"),
      "live",
    );
  });

  it("regua", () => {
    assert.equal(
      categorizarPorAssunto("Faz dois dias que você não aparece no Builders Club"),
      "regua",
    );
    assert.equal(
      categorizarPorAssunto("Seu desafio de 7 dias está te esperando no Builders Club"),
      "regua",
    );
  });

  it("tag ganha do assunto", () => {
    assert.equal(
      categoriaDoEmail({
        subject: "Amanhã tem live no Builders Club",
        tags: [{ name: "category", value: "login" }],
      }),
      "login",
    );
  });
});
