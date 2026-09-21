import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  escolherMaterial48h,
  montarCopy48h,
  pathFallbackPresentes,
} from "./material-48h";

const GIFTS = [
  { slug: "saga", title: "Kit Elevator Saga" },
  { slug: "fluxo", title: "Kit n8n Fluxo" },
  { slug: "agent", title: "Agent Reach" },
];

describe("escolherMaterial48h — F089", () => {
  it("com origem, entrega o próximo (≠ origem)", () => {
    const m = escolherMaterial48h(GIFTS, "saga");
    assert.ok(m);
    assert.equal(m.path, "/presentes/fluxo");
    assert.equal(m.titulo, "Kit n8n Fluxo");
    assert.equal(m.origemTitulo, "Kit Elevator Saga");
  });

  it("sem origem, entrega o primeiro da lista", () => {
    const m = escolherMaterial48h(GIFTS, null);
    assert.ok(m);
    assert.equal(m.path, "/presentes/saga");
    assert.equal(m.origemTitulo, null);
  });

  it("lista vazia → null", () => {
    assert.equal(escolherMaterial48h([], "saga"), null);
  });

  it("só o presente de origem na lista → null (não reenvia o mesmo)", () => {
    assert.equal(
      escolherMaterial48h([{ slug: "saga", title: "Saga" }], "saga"),
      null,
    );
  });
});

describe("montarCopy48h — três textos (F089)", () => {
  it("variante 1: origem + material (não cobra presença)", () => {
    const c = montarCopy48h({
      displayName: "Maria Silva",
      materialUrl: "https://club.test/presentes/fluxo",
      material: {
        path: "/presentes/fluxo",
        titulo: "Kit n8n Fluxo",
        origemTitulo: "Kit Elevator Saga",
      },
    });
    assert.match(c.subject, /próximo/i);
    assert.match(c.texto, /Elevator Saga/);
    assert.match(c.texto, /Kit n8n Fluxo/);
    assert.doesNotMatch(c.texto, /não te vê|sentimos sua falta|dois dias/i);
    assert.doesNotMatch(c.subject, /não aparece/i);
  });

  it("variante 2: sem origem + material", () => {
    const c = montarCopy48h({
      displayName: "João",
      materialUrl: "https://club.test/presentes/saga",
      material: {
        path: "/presentes/saga",
        titulo: "Kit Elevator Saga",
        origemTitulo: null,
      },
    });
    assert.match(c.subject, /trilha/i);
    assert.match(c.texto, /Kit Elevator Saga/);
    assert.doesNotMatch(c.texto, /não te vê|dois dias/i);
  });

  it("variante 3: sem material → space Presentes", () => {
    const c = montarCopy48h({
      displayName: "Ana",
      materialUrl: `https://club.test${pathFallbackPresentes()}`,
      material: null,
    });
    assert.match(c.subject, /Presente/i);
    assert.equal(c.ctaLabel, "Ver Presentes");
    assert.doesNotMatch(c.texto, /não te vê|sentimos sua falta/i);
  });
});
