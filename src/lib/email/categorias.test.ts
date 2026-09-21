import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  categoriaDoEmail,
  categorizarPorAssunto,
  ehEmailBuildersClub,
} from "./categorias";

describe("ehEmailBuildersClub — F085", () => {
  it("aceita assunto do Club", () => {
    assert.equal(
      ehEmailBuildersClub({
        subject: "Seu link de acesso — Builders Club",
      }),
      true,
    );
  });

  it("rejeita Orion / Scudo / genéricos", () => {
    assert.equal(
      ehEmailBuildersClub({
        subject: "Seu link de acesso — Orion Lead Hunter",
      }),
      false,
    );
    assert.equal(
      ehEmailBuildersClub({ subject: "Redefina sua senha no Scudo" }),
      false,
    );
    assert.equal(
      ehEmailBuildersClub({ subject: "Nova mensagem de Lucas.Alves" }),
      false,
    );
  });

  it("aceita From com nome do produto", () => {
    assert.equal(
      ehEmailBuildersClub({
        subject: "Assunto genérico",
        from: "Builders Club <noreply@devemdobro.com>",
      }),
      true,
    );
  });
});

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
      categorizarPorAssunto(
        "Faz dois dias que você não aparece no Builders Club",
      ),
      "regua",
    );
    assert.equal(
      categorizarPorAssunto(
        "Seu desafio de 7 dias está te esperando no Builders Club",
      ),
      "regua",
    );
    assert.equal(
      categorizarPorAssunto(
        "Faz duas semanas que você não aparece no Builders Club",
      ),
      "regua",
    );
  });

  it("respostas", () => {
    assert.equal(
      categorizarPorAssunto("Ana respondeu no Builders Club"),
      "respostas",
    );
    assert.equal(
      categorizarPorAssunto("3 respostas no Builders Club"),
      "respostas",
    );
  });

  it("Orion com link de acesso não passa em categoriaDoEmail", () => {
    assert.equal(
      categoriaDoEmail({
        subject: "Seu link de acesso — Orion Lead Hunter",
      }),
      null,
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
