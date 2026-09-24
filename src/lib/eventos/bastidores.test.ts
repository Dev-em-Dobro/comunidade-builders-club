import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { BASTIDORES, faixaDoTopo } from "./bastidores";

const DURANTE_IMERSAO = new Date("2026-09-22T10:00:00-03:00");
const DEPOIS_DA_IMERSAO = new Date("2026-09-24T10:00:00-03:00");

describe("faixaDoTopo — uma faixa por vez no topo (F102)", () => {
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

describe("BASTIDORES — destino e copy (F102)", () => {
  it("o link é https", () => {
    assert.equal(new URL(BASTIDORES.url).protocol, "https:");
  });

  it("dia e hora existem como texto, não dentro de imagem", () => {
    // A faixa é HTML: estes dois campos viram nós de texto no DOM, e é isso
    // que um leitor de tela lê. Se voltarem a ser imagem, volta o `alt`.
    assert.match(BASTIDORES.quando, /quinta/i);
    assert.match(BASTIDORES.horario, /20h/);
  });

  it("as duas linhas do título reconstroem o nome da live", () => {
    // O título quebra em duas linhas por desenho; juntas têm que dar o nome
    // canônico, senão a faixa anuncia uma coisa e o domínio chama de outra.
    assert.equal(
      `${BASTIDORES.tituloLinha1} ${BASTIDORES.tituloLinha2}`,
      BASTIDORES.nome,
    );
  });

  it("o CTA diz o que o clique faz", () => {
    assert.match(BASTIDORES.cta, /grupo/i);
  });
});
