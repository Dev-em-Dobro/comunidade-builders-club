import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  AULA_ABERTURA_FREE_VIDEO_ID,
  AULAS_FREE_HREF,
  canWatchLesson,
  lessonVideoId,
  moduleAllowsFree,
  moduleIsPurchased,
} from "./access";

describe("aula avulsa — F126", () => {
  const comprado = new Set(["site"]);

  it("libera o módulo comprado e os descendentes", () => {
    assert.equal(moduleIsPurchased({ id: "site", freeAccess: false }, comprado), true);
    assert.equal(
      moduleIsPurchased(
        { id: "sub", freeAccess: false, parent: { id: "site", freeAccess: false } },
        comprado,
      ),
      true,
    );
  });

  it("free sem compra continua sem acesso a módulo pago", () => {
    assert.equal(canWatchLesson(false, { id: "crm", freeAccess: false }, comprado), false);
    assert.equal(canWatchLesson(false, { id: "site", freeAccess: false }), false);
  });

  it("free com compra assiste o módulo comprado", () => {
    assert.equal(canWatchLesson(false, { id: "site", freeAccess: false }, comprado), true);
  });
});

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

describe("AULAS_FREE_HREF — F099", () => {
  it("é a aula de abertura do Comece por aqui", () => {
    assert.equal(
      AULAS_FREE_HREF,
      "/aulas/fase-1-m01-comece-por-aqui/desafio-quick-win-lovable",
    );
  });
});

describe("lessonVideoId", () => {
  it("usa a versão com CTA só para Free na aula de abertura", () => {
    const aula = {
      moduleSlug: "fase-1-m01-comece-por-aqui",
      lessonSlug: "desafio-quick-win-lovable",
      defaultVideoId: "video-sem-cta",
    };

    assert.equal(
      lessonVideoId({ ...aula, isPaid: false }),
      AULA_ABERTURA_FREE_VIDEO_ID,
    );
    assert.equal(lessonVideoId({ ...aula, isPaid: true }), "video-sem-cta");
    assert.equal(
      lessonVideoId({
        ...aula,
        isPaid: false,
        lessonSlug: "outra-aula",
      }),
      "video-sem-cta",
    );
  });
});
