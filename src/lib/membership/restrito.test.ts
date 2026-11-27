import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { canWatchLesson } from "@/lib/aulas/access";
import { nasceRestrita } from "./bootstrap";
import { isRestritoMembership } from "./capabilities";
import { entradaPorModulos } from "./restrito";

const base = { status: "active", role: "member" } as const;

describe("isRestritoMembership — F128", () => {
  it("free que nasceu de compra de módulo é restrita", () => {
    assert.equal(
      isRestritoMembership({ ...base, tier: "free", acessoRestrito: true }),
      true,
    );
  });

  it("free comum não é restrita", () => {
    assert.equal(
      isRestritoMembership({ ...base, tier: "free", acessoRestrito: false }),
      false,
    );
  });

  it("subiu de plano: deixa de ser restrita sem mexer no campo", () => {
    for (const tier of ["paid", "pro", "elite"] as const) {
      assert.equal(
        isRestritoMembership({ ...base, tier, acessoRestrito: true }),
        false,
      );
    }
  });

  it("staff nunca é restrito", () => {
    assert.equal(
      isRestritoMembership({
        status: "active",
        role: "admin",
        tier: "free",
        acessoRestrito: true,
      }),
      false,
    );
  });

  it("conta inativa não entra na regra", () => {
    assert.equal(
      isRestritoMembership({
        status: "revoked",
        role: "member",
        tier: "free",
        acessoRestrito: true,
      }),
      false,
    );
  });
});

describe("nasceRestrita — F128", () => {
  it("primeiro login free com compra de módulo nasce restrita", () => {
    assert.equal(nasceRestrita({ pago: false, comprasDeModulo: 1 }), true);
  });

  it("sem compra nasce gratuita comum", () => {
    assert.equal(nasceRestrita({ pago: false, comprasDeModulo: 0 }), false);
  });

  it("quem chega pago não nasce restrito, mesmo com compra de módulo", () => {
    assert.equal(nasceRestrita({ pago: true, comprasDeModulo: 2 }), false);
  });
});

describe("entradaPorModulos — F128", () => {
  it("um módulo: cai direto nele", () => {
    assert.equal(entradaPorModulos(["crm-com-ia"]), "/aulas/crm-com-ia");
  });

  it("mais de um: cai no catálogo", () => {
    assert.equal(entradaPorModulos(["crm-com-ia", "site"]), "/aulas");
  });

  it("nenhum (reembolsou): cai em planos", () => {
    assert.equal(entradaPorModulos([]), "/planos");
  });
});

describe("canWatchLesson com conta restrita — F128", () => {
  const comprado = new Set(["crm"]);

  it("módulo comprado abre", () => {
    assert.equal(canWatchLesson(false, { id: "crm", freeAccess: false }, comprado, true), true);
  });

  it("descendente do módulo comprado abre", () => {
    assert.equal(
      canWatchLesson(
        false,
        { id: "sub", freeAccess: false, parent: { id: "crm", freeAccess: false } },
        comprado,
        true,
      ),
      true,
    );
  });

  it("módulo gratuito NÃO abre para conta restrita", () => {
    assert.equal(canWatchLesson(false, { id: "m01", freeAccess: true }, comprado, true), false);
    assert.equal(
      canWatchLesson(
        false,
        { id: "m01", freeAccess: false, slug: "fase-1-m01-comece-por-aqui" },
        comprado,
        true,
      ),
      false,
    );
  });

  it("módulo gratuito continua abrindo para o free comum", () => {
    assert.equal(canWatchLesson(false, { id: "m01", freeAccess: true }, comprado, false), true);
  });

  it("outro módulo pago segue fechado", () => {
    assert.equal(canWatchLesson(false, { id: "site", freeAccess: false }, comprado, true), false);
  });
});
