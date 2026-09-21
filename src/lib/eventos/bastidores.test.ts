import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { BASTIDORES, faixaDoTopo } from "./bastidores";

const DURANTE_IMERSAO = new Date("2026-09-22T10:00:00-03:00");
const DEPOIS_DA_IMERSAO = new Date("2026-09-24T10:00:00-03:00");

describe("faixaDoTopo — uma faixa por vez no topo (F099)", () => {
  it("Free vê a Imersão enquanto ela existe", () => {
    assert.equal(
      faixaDoTopo({ isPaid: false, agora: DURANTE_IMERSAO }),
      "imersao",
    );
  });

  it("pagante vê Bastidores mesmo durante a Imersão", () => {
    // A faixa da Imersão sempre foi só para Free (F088). Quem já pagou cai
    // direto em Bastidores, que é aberta a todo mundo.
    assert.equal(
      faixaDoTopo({ isPaid: true, agora: DURANTE_IMERSAO }),
      "bastidores",
    );
  });

  it("Free cai em Bastidores depois que a Imersão passa", () => {
    assert.equal(
      faixaDoTopo({ isPaid: false, agora: DEPOIS_DA_IMERSAO }),
      "bastidores",
    );
  });

  it("nunca devolve as duas — o retorno é uma faixa só", () => {
    for (const isPaid of [true, false]) {
      for (const agora of [DURANTE_IMERSAO, DEPOIS_DA_IMERSAO]) {
        assert.ok(["imersao", "bastidores"].includes(faixaDoTopo({ isPaid, agora })));
      }
    }
  });
});

describe("BASTIDORES — destino e acessibilidade (F099)", () => {
  it("o link é https", () => {
    assert.equal(new URL(BASTIDORES.url).protocol, "https:");
  });

  it("o alt descreve dia e hora, que só existem dentro da arte", () => {
    assert.match(BASTIDORES.alt, /quinta/i);
    assert.match(BASTIDORES.alt, /20h/);
  });

  it("o alt termina no CTA, que é o que o clique faz", () => {
    assert.ok(BASTIDORES.alt.includes(BASTIDORES.cta));
  });
});
