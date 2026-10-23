import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import {
  AULA_ABERTURA_HREF,
  POPUP_DELAY_MS,
  POPUP_FADE_CLASS,
  POPUP_OVERLAY_CLASS,
  subheadPopup,
  tituloPopup,
} from "./popup-aula";

describe("copy por número de aulas (F078)", () => {
  it("usa o número quando a contagem veio do banco", () => {
    assert.match(tituloPopup(5), /5 primeiras aulas/);
    assert.match(subheadPopup(5), /as 5 primeiras aulas/);
  });

  it("cai na forma sem número quando a contagem falha ou vem zero", () => {
    // Melhor uma copy mais fraca do que uma que promete "0 aulas".
    assert.match(tituloPopup(0), /às primeiras aulas/);
    assert.doesNotMatch(tituloPopup(0), /\d/);
    assert.match(subheadPopup(0), /as primeiras aulas/);
    assert.doesNotMatch(subheadPopup(0), /\b\d+ primeiras\b/);
  });

  it("número negativo é tratado como ausência de contagem", () => {
    assert.doesNotMatch(tituloPopup(-3), /-3/);
  });

  it("não promete aula tática que o módulo não entrega", () => {
    // Decisão 4: a promessa dos 90 dias é do Club, não título de aula. O
    // módulo gratuito é a porta de entrada, e a copy não pode inverter isso.
    for (const texto of [tituloPopup(5), subheadPopup(5)]) {
      assert.doesNotMatch(texto, /90 dias/);
    }
  });
});

describe("destino do cadastro pela modal (F078)", () => {
  it("aponta para a aula de abertura do módulo gratuito", () => {
    assert.equal(
      AULA_ABERTURA_HREF,
      "/aulas/fase-1-m01-comece-por-aqui/desafio-quick-win-lovable",
    );
  });
});

describe("layout da pop-up (F118)", () => {
  const css = readFileSync("src/app/globals.css", "utf8");
  const popup = readFileSync(
    "src/app/presentes/presente-aula-popup.tsx",
    "utf8",
  );
  const jsx = popup.slice(popup.indexOf("return ("));
  const banner = readFileSync("src/components/cookie-consent.tsx", "utf8");

  it("no desktop (md+) centra; no mobile senta no rodapé com teto de 50dvh", () => {
    assert.match(jsx, /items-end/);
    assert.match(jsx, /md:items-center/);
    assert.match(jsx, /max-md:max-h-\[50dvh\]/);
    assert.doesNotMatch(jsx, /sm:items-center/);
  });

  it("no mobile cola nas bordas, sem blur; no desktop o overlay de sempre", () => {
    assert.match(jsx, /bg-black\/60/);
    assert.match(jsx, /backdrop-blur-none/);
    assert.match(jsx, /md:backdrop-blur-sm/);
    assert.match(jsx, /z-\[60\]/);
    assert.match(jsx, /overflow-y-auto/);
    assert.match(jsx, /\bp-0\b/);
    assert.match(jsx, /md:p-4/);
    assert.match(jsx, /rounded-t-2xl/);
    assert.match(jsx, /rounded-b-none/);
    assert.match(jsx, /md:rounded-2xl/);
  });

  it("é a mesma caixa (sem puxador de sheet) e some o CTA Ver meu presente", () => {
    assert.match(jsx, /max-w-lg/);
    assert.doesNotMatch(jsx, /h-1\.5 w-10/);
    assert.doesNotMatch(jsx, /Ver meu presente/);
    assert.match(jsx, /giftSlug=\{giftSlug\}/);
  });

  it("o X tem área de toque 44px", () => {
    assert.match(jsx, /h-11 w-11/);
  });

  it("fade só de opacity, na posição final, com reduced-motion", () => {
    assert.equal(POPUP_FADE_CLASS, "popup-aula-fade");
    const fade =
      css.split("@keyframes popupAulaFade")[1]?.split("@keyframes")[0] ?? "";
    assert.match(fade, /from\s*\{[^}]*opacity:\s*0/);
    assert.match(fade, /to\s*\{[^}]*opacity:\s*1/);
    assert.doesNotMatch(fade, /transform/);
    assert.match(
      css,
      /prefers-reduced-motion:\s*reduce[\s\S]*\.popup-aula-fade[\s\S]*animation:\s*none/s,
    );
    assert.doesNotMatch(css, /slideUpSheet/);
    assert.doesNotMatch(css, /presente-sheet-overlay/);
  });

  it("não mexe no componente do aviso de cookies e não usa --bc-consent-h", () => {
    assert.doesNotMatch(banner, /data-presente-sheet/);
    assert.doesNotMatch(banner, /className="cookie-consent /);
    assert.equal(POPUP_OVERLAY_CLASS, "popup-aula-overlay");
    const overlayCss =
      css.split(".popup-aula-overlay")[1]?.split("@keyframes")[0] ?? "";
    assert.doesNotMatch(overlayCss, /--bc-consent-h/);
    assert.match(css, /env\(safe-area-inset-bottom\)/);
  });

  it("abre no delay da F078, sem esperar o cookie de consentimento", () => {
    assert.match(
      popup,
      /setTimeout\(\(\) => setAberta\(true\), POPUP_DELAY_MS\)/,
    );
    assert.doesNotMatch(popup, /aguardarConsentimentoParaPopup/);
    assert.doesNotMatch(popup, /bc_consent/);
    assert.doesNotMatch(popup, /precisaDecidir/);
    assert.doesNotMatch(popup, /CONSENTIMENTO_ANALYTICS_EVENT/);
  });
});

describe("delay da modal (F078)", () => {
  it("é o valor da decisão 1 da spec, não um valor de QA esquecido", () => {
    // Este teste é um trinco, não uma verificação: o valor já foi 60.000 (spec
    // original), já esteve em 10.000 por engano durante o QA em HML, e hoje é 0
    // por decisão do dono do produto. Mudar o delay muda a relação da feature
    // com a regra da F063 — não é ajuste de parâmetro. Se este teste falhar,
    // atualize a decisão 1 da spec junto, de propósito.
    assert.equal(POPUP_DELAY_MS, 0);
  });
});
