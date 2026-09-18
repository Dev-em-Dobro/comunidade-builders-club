import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { UPGRADE_REASON_COPY } from "@/lib/membership/capabilities";
import {
  LESSON_UPGRADE_BANNER,
  lessonUpgradeHref,
  shouldShowLessonUpgradeCta,
} from "./upgrade-cta";

describe("shouldShowLessonUpgradeCta — F091", () => {
  it("mostra para Free que já pode assistir", () => {
    assert.equal(
      shouldShowLessonUpgradeCta({ isPaid: false, canWatch: true }),
      true,
    );
  });

  it("esconde de quem já é pago", () => {
    assert.equal(
      shouldShowLessonUpgradeCta({ isPaid: true, canWatch: true }),
      false,
    );
  });

  it("esconde na aula que o Free não assiste", () => {
    assert.equal(
      shouldShowLessonUpgradeCta({ isPaid: false, canWatch: false }),
      false,
    );
  });
});

describe("copy do CTA — F091", () => {
  const planos = UPGRADE_REASON_COPY["aula-descricao"];
  const texto = [
    LESSON_UPGRADE_BANNER.alt,
    LESSON_UPGRADE_BANNER.cta,
    planos.title,
    planos.body,
  ].join(" ");

  it("fala o arsenal e o preço do PRO", () => {
    assert.match(texto, /arsenal/i);
    assert.match(texto, /12\s*×\s*R\$ 30,18/);
  });

  it("não promete live de terça nem garantia de 90 dias", () => {
    assert.doesNotMatch(texto, /live/i);
    assert.doesNotMatch(texto, /terça/i);
    assert.doesNotMatch(texto, /90\s*dias/i);
    assert.doesNotMatch(texto, /garantia/i);
  });

  it("leva à /planos com motivo próprio", () => {
    assert.equal(lessonUpgradeHref(), "/planos?motivo=aula-descricao");
  });
});
