import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isElegivelReguaMember,
  lastSeenNeedsTouch,
  LAST_SEEN_THROTTLE_MS,
  MS_48H,
  shouldSendSemAcesso48h,
} from "./regras";

const now = new Date("2026-09-02T15:00:00.000Z");

describe("shouldSendSemAcesso48h — F075", () => {
  it("não dispara sem lastSeenAt (evita blast no deploy)", () => {
    assert.equal(
      shouldSendSemAcesso48h({
        lastSeenAt: null,
        lastSendAt: null,
        now,
      }),
      false,
    );
  });

  it("não dispara antes de 48h", () => {
    assert.equal(
      shouldSendSemAcesso48h({
        lastSeenAt: new Date(now.getTime() - MS_48H + 60_000),
        lastSendAt: null,
        now,
      }),
      false,
    );
  });

  it("dispara na primeira ausência de 48h", () => {
    assert.equal(
      shouldSendSemAcesso48h({
        lastSeenAt: new Date(now.getTime() - MS_48H),
        lastSendAt: null,
        now,
      }),
      true,
    );
  });

  it("não dispara de novo se continua sumido", () => {
    const seen = new Date(now.getTime() - 5 * MS_48H);
    assert.equal(
      shouldSendSemAcesso48h({
        lastSeenAt: seen,
        lastSendAt: new Date(seen.getTime() + 60_000),
        now,
      }),
      false,
    );
  });

  it("dispara de novo depois que voltou e sumiu outra vez", () => {
    const lastSend = new Date(now.getTime() - 10 * MS_48H);
    const lastSeen = new Date(now.getTime() - MS_48H);
    assert.equal(
      shouldSendSemAcesso48h({
        lastSeenAt: lastSeen,
        lastSendAt: lastSend,
        now,
      }),
      true,
    );
  });
});

describe("isElegivelReguaMember — F075", () => {
  it("aceita member ativo, free ou pago", () => {
    assert.equal(
      isElegivelReguaMember({ status: "active", role: "member" }),
      true,
    );
  });

  it("rejeita staff e membership inativa", () => {
    assert.equal(
      isElegivelReguaMember({ status: "active", role: "admin" }),
      false,
    );
    assert.equal(
      isElegivelReguaMember({ status: "revoked", role: "member" }),
      false,
    );
  });
});

describe("lastSeenNeedsTouch — F075", () => {
  it("grava o primeiro heartbeat", () => {
    assert.equal(lastSeenNeedsTouch(null, now), true);
  });

  it("respeita o throttle de 15 min", () => {
    assert.equal(
      lastSeenNeedsTouch(new Date(now.getTime() - LAST_SEEN_THROTTLE_MS + 1), now),
      false,
    );
    assert.equal(
      lastSeenNeedsTouch(new Date(now.getTime() - LAST_SEEN_THROTTLE_MS), now),
      true,
    );
  });
});
