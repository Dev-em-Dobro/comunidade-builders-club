import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ENTREGAVEIS,
  entregavelExigeElite,
  entregavelPorPasta,
  entregavelPorSlug,
} from "./catalogo";

describe("entregaveis eliteOnly — F097", () => {
  it("cms e crm exigem Elite", () => {
    const cms = entregavelPorSlug("cms");
    const crm = entregavelPorSlug("crm");
    assert.ok(cms);
    assert.ok(crm);
    assert.equal(cms.eliteOnly, true);
    assert.equal(crm.eliteOnly, true);
    assert.equal(entregavelExigeElite(cms), true);
    assert.equal(entregavelExigeElite(crm), true);
  });

  it("demais materiais disponíveis não exigem Elite", () => {
    const arsenal = entregavelPorSlug("arsenal-sites");
    assert.ok(arsenal);
    assert.equal(entregavelExigeElite(arsenal), false);
  });

  it("pasta 10-CMS mapeia para o item cms", () => {
    const cms = entregavelPorPasta("10-CMS");
    assert.ok(cms);
    assert.equal(cms.slug, "cms");
  });

  it("crm continua emBreve; cms está disponível", () => {
    assert.equal(entregavelPorSlug("crm")?.emBreve, true);
    assert.equal(entregavelPorSlug("cms")?.emBreve, undefined);
    assert.ok(ENTREGAVEIS.some((e) => e.slug === "cms" && !e.emBreve));
  });
});
