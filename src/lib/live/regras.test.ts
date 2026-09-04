import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isElegivelLembreteLive,
  MS_HORA,
  proximaLive,
  shouldSendPoucoAntes,
  shouldSendVespera,
} from "./regras";

describe("proximaLive — F079", () => {
  // hour/minute são BRT (UTC-3, sem horário de verão desde 2019) — terça
  // 20h BRT vira 23h UTC no resultado, sempre que não houver virada de dia.
  const regraTercaAs20h = { weekday: 2, hour: 20, minute: 0, nextOverrideAt: null };

  it("acha a próxima terça 20h (BRT) quando ainda não chegou nesta semana", () => {
    // 2026-09-01 é uma terça (confirmado pela sequência real do calendário).
    const now = new Date("2026-08-31T12:00:00.000Z"); // segunda, 09h BRT
    const proxima = proximaLive(regraTercaAs20h, now);
    assert.equal(proxima.toISOString(), "2026-09-01T23:00:00.000Z");
  });

  it("pula pra semana seguinte se já passou das 20h BRT hoje", () => {
    const now = new Date("2026-09-02T00:00:00.000Z"); // terça 21h BRT, depois da live
    const proxima = proximaLive(regraTercaAs20h, now);
    assert.equal(proxima.toISOString(), "2026-09-08T23:00:00.000Z");
  });

  it("mantém o mesmo dia se ainda não chegou a hora", () => {
    const now = new Date("2026-09-01T10:00:00.000Z"); // terça, 07h BRT
    const proxima = proximaLive(regraTercaAs20h, now);
    assert.equal(proxima.toISOString(), "2026-09-01T23:00:00.000Z");
  });

  it("usa o override enquanto está no futuro", () => {
    const now = new Date("2026-08-31T12:00:00.000Z");
    const override = new Date("2026-09-03T19:00:00.000Z"); // quinta, horário trocado
    const proxima = proximaLive(
      { ...regraTercaAs20h, nextOverrideAt: override },
      now,
    );
    assert.equal(proxima.toISOString(), override.toISOString());
  });

  it("ignora o override assim que ele fica no passado", () => {
    const now = new Date("2026-09-05T12:00:00.000Z"); // sábado, override já passou
    const overrideVencido = new Date("2026-09-03T19:00:00.000Z");
    const proxima = proximaLive(
      { ...regraTercaAs20h, nextOverrideAt: overrideVencido },
      now,
    );
    // volta pra regra padrão: próxima terça 20h BRT a partir de sábado
    assert.equal(proxima.toISOString(), "2026-09-08T23:00:00.000Z");
  });
});

describe("shouldSendVespera — F079", () => {
  const liveAt = new Date("2026-09-08T20:00:00.000Z");

  it("não dispara fora da janela de 24-32h antes", () => {
    assert.equal(
      shouldSendVespera({
        liveAt,
        now: new Date(liveAt.getTime() - 33 * MS_HORA),
        jaEnviado: false,
      }),
      false,
    );
    assert.equal(
      shouldSendVespera({
        liveAt,
        now: new Date(liveAt.getTime() - 23 * MS_HORA),
        jaEnviado: false,
      }),
      false,
    );
  });

  it("dispara dentro da janela", () => {
    assert.equal(
      shouldSendVespera({
        liveAt,
        now: new Date(liveAt.getTime() - 26 * MS_HORA),
        jaEnviado: false,
      }),
      true,
    );
  });

  it("não dispara de novo se já enviou pra essa ocorrência", () => {
    assert.equal(
      shouldSendVespera({
        liveAt,
        now: new Date(liveAt.getTime() - 26 * MS_HORA),
        jaEnviado: true,
      }),
      false,
    );
  });
});

describe("shouldSendPoucoAntes — F079", () => {
  const liveAt = new Date("2026-09-08T20:00:00.000Z");

  it("dispara dentro de 1h antes", () => {
    assert.equal(
      shouldSendPoucoAntes({
        liveAt,
        now: new Date(liveAt.getTime() - 30 * 60_000),
        jaEnviado: false,
      }),
      true,
    );
  });

  it("não dispara depois que a live já começou", () => {
    assert.equal(
      shouldSendPoucoAntes({
        liveAt,
        now: new Date(liveAt.getTime() + 60_000),
        jaEnviado: false,
      }),
      false,
    );
  });

  it("não dispara mais de 1h antes", () => {
    assert.equal(
      shouldSendPoucoAntes({
        liveAt,
        now: new Date(liveAt.getTime() - 90 * 60_000),
        jaEnviado: false,
      }),
      false,
    );
  });
});

describe("isElegivelLembreteLive — F079", () => {
  it("aceita member ativo, free ou pago", () => {
    assert.equal(
      isElegivelLembreteLive({ status: "active", role: "member" }),
      true,
    );
  });

  it("rejeita staff e membership inativa", () => {
    assert.equal(
      isElegivelLembreteLive({ status: "active", role: "admin" }),
      false,
    );
    assert.equal(
      isElegivelLembreteLive({ status: "revoked", role: "member" }),
      false,
    );
  });
});
