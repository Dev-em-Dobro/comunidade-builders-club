import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { canWatchLesson, moduleAllowsFree } from "./access";

describe("moduleAllowsFree — F065", () => {
  it("libera quando o próprio módulo tem a flag", () => {
    assert.equal(moduleAllowsFree({ freeAccess: true }), true);
  });

  it("herda do ancestral", () => {
    assert.equal(
      moduleAllowsFree({
        freeAccess: false,
        parent: {
          freeAccess: false,
          parent: { freeAccess: true },
        },
      }),
      true,
    );
  });

  it("filho não desliga o pai", () => {
    assert.equal(
      moduleAllowsFree({
        freeAccess: false,
        parent: { freeAccess: true },
      }),
      true,
    );
  });

  it("libera o Comece por aqui pelo slug mesmo sem a flag", () => {
    assert.equal(
      moduleAllowsFree({
        freeAccess: false,
        slug: "fase-1-m01-comece-por-aqui",
      }),
      true,
    );
  });

  it("não libera a raiz da Fase 1 só pelo slug", () => {
    assert.equal(
      moduleAllowsFree({
        freeAccess: false,
        slug: "fase-1-do-zero-ao-primeiro-sim",
      }),
      false,
    );
  });

  it("não libera M02 mesmo com a raiz Fase 1 como pai", () => {
    assert.equal(
      moduleAllowsFree({
        freeAccess: false,
        slug: "fase-1-m02-nicho-e-oferta",
        parent: {
          freeAccess: false,
          slug: "fase-1-do-zero-ao-primeiro-sim",
        },
      }),
      false,
    );
  });
});

describe("canWatchLesson — F065", () => {
  const locked = { freeAccess: false };

  it("pago assiste aula bloqueada para o free", () => {
    assert.equal(canWatchLesson(true, locked), true);
  });

  it("free não assiste sem freeAccess nem slug do M01", () => {
    assert.equal(canWatchLesson(false, locked), false);
  });

  it("free assiste aula do Comece por aqui", () => {
    assert.equal(
      canWatchLesson(false, {
        freeAccess: false,
        slug: "fase-1-m01-comece-por-aqui",
        parent: {
          freeAccess: false,
          slug: "fase-1-do-zero-ao-primeiro-sim",
        },
      }),
      true,
    );
  });

  it("free não assiste M02", () => {
    assert.equal(
      canWatchLesson(false, {
        freeAccess: false,
        slug: "fase-1-m02-nicho-e-oferta",
        parent: {
          freeAccess: false,
          slug: "fase-1-do-zero-ao-primeiro-sim",
        },
      }),
      false,
    );
  });
});
