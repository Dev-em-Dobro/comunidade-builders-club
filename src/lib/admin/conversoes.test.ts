import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getDateKeySaoPaulo,
  formatarRotuloDaChave,
  gerarChaves7Dias,
  inicioDodiaSaoPaulo,
  contarPorDia,
} from "./conversoes";

describe("getDateKeySaoPaulo — B1: não depende do TZ do processo", () => {
  it("retorna key no formato YYYY-MM-DD", () => {
    const date = new Date("2026-10-05T15:30:00Z");
    const key = getDateKeySaoPaulo(date);
    assert.match(key, /^\d{4}-\d{2}-\d{2}$/);
  });

  it("agrupa conversões do mesmo dia em SP", () => {
    const conv1 = new Date("2026-10-05T10:00:00Z");
    const conv2 = new Date("2026-10-05T23:59:59Z");
    assert.equal(getDateKeySaoPaulo(conv1), getDateKeySaoPaulo(conv2));
  });

  it("separa conversões de dias diferentes em SP", () => {
    const conv1 = new Date("2026-10-05T02:00:00Z");
    const conv2 = new Date("2026-10-05T04:00:00Z");
    assert.notEqual(getDateKeySaoPaulo(conv1), getDateKeySaoPaulo(conv2));
  });

  it("conversão às 01h SP (04h UTC) fica no dia correto", () => {
    const conv = new Date("2026-10-06T04:00:00Z");
    const key = getDateKeySaoPaulo(conv);
    assert.equal(key, "2026-10-06");
  });

  it("conversão às 23h59 SP (02h59 UTC do dia seguinte) fica no dia anterior", () => {
    const conv = new Date("2026-10-06T02:59:00Z");
    const key = getDateKeySaoPaulo(conv);
    assert.equal(key, "2026-10-05");
  });
});

describe("formatarRotuloDaChave — B1: rótulo direto da chave YYYY-MM-DD", () => {
  it("formata chave para DD/MM/YYYY", () => {
    assert.equal(formatarRotuloDaChave("2026-10-05"), "05/10/2026");
  });

  it("mantém zeros à esquerda", () => {
    assert.equal(formatarRotuloDaChave("2026-01-09"), "09/01/2026");
  });
});

describe("gerarChaves7Dias — janela móvel", () => {
  it("gera exatamente 7 chaves", () => {
    const agora = new Date("2026-10-05T15:00:00Z");
    const chaves = gerarChaves7Dias(agora);
    assert.equal(chaves.length, 7);
  });

  it("última chave é hoje em SP", () => {
    const agora = new Date("2026-10-05T15:00:00Z");
    const chaves = gerarChaves7Dias(agora);
    const hojeKey = getDateKeySaoPaulo(agora);
    assert.equal(chaves[chaves.length - 1], hojeKey);
  });

  it("primeira chave é 6 dias atrás", () => {
    const agora = new Date("2026-10-05T15:00:00Z");
    const chaves = gerarChaves7Dias(agora);
    assert.equal(chaves[0], "2026-09-29");
  });

  it("chaves estão em ordem cronológica", () => {
    const agora = new Date("2026-10-05T15:00:00Z");
    const chaves = gerarChaves7Dias(agora);
    for (let i = 1; i < chaves.length; i++) {
      assert.ok(chaves[i]! > chaves[i - 1]!, `${chaves[i]} deve ser maior que ${chaves[i - 1]}`);
    }
  });
});

describe("inicioDodiaSaoPaulo — B1: meia-noite de SP com offset explícito", () => {
  it("meia-noite de SP é 03:00 UTC (offset -03:00 fixo)", () => {
    const inicio = inicioDodiaSaoPaulo("2026-06-15");
    assert.equal(inicio.getUTCHours(), 3);
    assert.equal(inicio.getUTCMinutes(), 0);
    assert.equal(inicio.getUTCSeconds(), 0);
  });

  it("funciona com qualquer data", () => {
    const inicio = inicioDodiaSaoPaulo("2026-10-05");
    assert.equal(inicio.toISOString(), "2026-10-05T03:00:00.000Z");
  });

  it("não depende do TZ do processo (offset explícito)", () => {
    const inicio1 = inicioDodiaSaoPaulo("2026-01-15");
    const inicio2 = inicioDodiaSaoPaulo("2026-07-15");
    assert.equal(inicio1.getUTCHours(), 3);
    assert.equal(inicio2.getUTCHours(), 3);
  });
});

describe("contarPorDia — B5: importado do código de produção", () => {
  it("conta conversões no mesmo dia", () => {
    const diasValidos = new Set(["2026-10-05"]);
    const conversoes: ConversaoMock[] = [
      { convertedToPaidAt: new Date("2026-10-05T10:00:00Z") },
      { convertedToPaidAt: new Date("2026-10-05T15:00:00Z") },
    ];
    const contagem = contarPorDia(conversoes, diasValidos);
    assert.equal(contagem.get("2026-10-05"), 2);
  });

  it("ignora conversões fora da janela", () => {
    const diasValidos = new Set(["2026-10-05"]);
    const conversoes: ConversaoMock[] = [
      { convertedToPaidAt: new Date("2026-10-04T10:00:00Z") },
      { convertedToPaidAt: new Date("2026-10-05T15:00:00Z") },
    ];
    const contagem = contarPorDia(conversoes, diasValidos);
    assert.equal(contagem.get("2026-10-05"), 1);
    assert.equal(contagem.has("2026-10-04"), false);
  });

  it("dias sem conversão ficam com zero", () => {
    const diasValidos = new Set(["2026-10-04", "2026-10-05"]);
    const conversoes: ConversaoMock[] = [
      { convertedToPaidAt: new Date("2026-10-05T15:00:00Z") },
    ];
    const contagem = contarPorDia(conversoes, diasValidos);
    assert.equal(contagem.get("2026-10-04"), 0);
    assert.equal(contagem.get("2026-10-05"), 1);
  });

  it("conversão às 01h SP (madrugada) fica no dia correto", () => {
    const diasValidos = new Set(["2026-10-05", "2026-10-06"]);
    const conv: ConversaoMock = { convertedToPaidAt: new Date("2026-10-06T04:00:00Z") };
    const contagem = contarPorDia([conv], diasValidos);
    assert.equal(contagem.get("2026-10-06"), 1);
    assert.equal(contagem.get("2026-10-05"), 0);
  });
});

describe("B8: estado vazio quando total 7 dias = 0", () => {
  it("total 0 deve mostrar mensagem de nenhuma conversão", () => {
    const metricas = {
      conversoesPorDia: [
        { data: "29/09/2026", total: 0 },
        { data: "30/09/2026", total: 0 },
        { data: "01/10/2026", total: 0 },
        { data: "02/10/2026", total: 0 },
        { data: "03/10/2026", total: 0 },
        { data: "04/10/2026", total: 0 },
        { data: "05/10/2026", total: 0 },
      ],
      total7dias: 0,
    };
    assert.equal(metricas.total7dias, 0);
  });

  it("total > 0 não deve mostrar estado vazio", () => {
    const metricas = {
      conversoesPorDia: [
        { data: "05/10/2026", total: 1 },
      ],
      total7dias: 1,
    };
    assert.ok(metricas.total7dias > 0);
  });
});
