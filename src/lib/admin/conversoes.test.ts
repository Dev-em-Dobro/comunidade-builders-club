import assert from "node:assert/strict";
import { describe, it } from "node:test";

const SAO_PAULO_TZ = "America/Sao_Paulo";

function formatarDataBR(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: SAO_PAULO_TZ,
  }).format(date);
}

function getDateKeyBR(date: Date): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: SAO_PAULO_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(date);
}

function getTimezoneOffset(tz: string, date: Date): number {
  const utcDate = new Date(date.toLocaleString("en-US", { timeZone: "UTC" }));
  const tzDate = new Date(date.toLocaleString("en-US", { timeZone: tz }));
  return tzDate.getTime() - utcDate.getTime();
}

function inicioDodia(date: Date, tz: string): Date {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "01";
  const isoDate = `${get("year")}-${get("month")}-${get("day")}T00:00:00`;
  const offset = getTimezoneOffset(tz, date);
  return new Date(new Date(isoDate).getTime() - offset);
}

describe("formatarDataBR — conversões", () => {
  it("formata data no fuso America/Sao_Paulo", () => {
    const date = new Date("2026-10-05T15:30:00Z");
    const formatted = formatarDataBR(date);
    assert.match(formatted, /05\/10\/2026/);
  });
});

describe("getDateKeyBR — agrupamento por dia", () => {
  it("retorna key no formato YYYY-MM-DD", () => {
    const date = new Date("2026-10-05T15:30:00Z");
    const key = getDateKeyBR(date);
    assert.match(key, /2026-10-05/);
  });

  it("agrupa conversões do mesmo dia", () => {
    const conv1 = new Date("2026-10-05T10:00:00Z");
    const conv2 = new Date("2026-10-05T23:59:59Z");
    assert.equal(getDateKeyBR(conv1), getDateKeyBR(conv2));
  });

  it("separa conversões de dias diferentes", () => {
    const conv1 = new Date("2026-10-05T10:00:00Z");
    const conv2 = new Date("2026-10-06T10:00:00Z");
    assert.notEqual(getDateKeyBR(conv1), getDateKeyBR(conv2));
  });
});

describe("janela de 7 dias — lógica", () => {
  function calcularJanela(agora: Date): { inicio: Date; dias: string[] } {
    const inicioPeriodo = inicioDodia(agora, SAO_PAULO_TZ);
    inicioPeriodo.setDate(inicioPeriodo.getDate() - 6);

    const dias: string[] = [];
    for (let i = 0; i < 7; i++) {
      const dia = new Date(inicioPeriodo);
      dia.setDate(dia.getDate() + i);
      dias.push(getDateKeyBR(dia));
    }

    return { inicio: inicioPeriodo, dias };
  }

  it("calcula 7 dias a partir de hoje", () => {
    const agora = new Date("2026-10-05T15:00:00Z");
    const { dias } = calcularJanela(agora);
    assert.equal(dias.length, 7);
  });

  it("inclui o dia de hoje como último dia", () => {
    const agora = new Date("2026-10-05T15:00:00Z");
    const { dias } = calcularJanela(agora);
    const hoje = getDateKeyBR(agora);
    assert.equal(dias[dias.length - 1], hoje);
  });

  it("primeiro dia é 6 dias atrás", () => {
    const agora = new Date("2026-10-05T15:00:00Z");
    const { dias } = calcularJanela(agora);
    const seisAtras = new Date(agora);
    seisAtras.setDate(seisAtras.getDate() - 6);
    assert.equal(dias[0], getDateKeyBR(seisAtras));
  });

  it("dias estão em ordem cronológica", () => {
    const agora = new Date("2026-10-05T15:00:00Z");
    const { dias } = calcularJanela(agora);
    for (let i = 1; i < dias.length; i++) {
      assert.ok(dias[i] > dias[i - 1], `${dias[i]} deve ser maior que ${dias[i - 1]}`);
    }
  });
});

describe("contagem de conversões por dia", () => {
  type ConversaoMock = { convertedToPaidAt: Date };

  function contarPorDia(
    conversoes: ConversaoMock[],
    diasValidos: Set<string>,
  ): Map<string, number> {
    const contagem = new Map<string, number>();
    for (const key of diasValidos) {
      contagem.set(key, 0);
    }
    for (const c of conversoes) {
      const key = getDateKeyBR(c.convertedToPaidAt);
      if (diasValidos.has(key)) {
        contagem.set(key, (contagem.get(key) ?? 0) + 1);
      }
    }
    return contagem;
  }

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
});
