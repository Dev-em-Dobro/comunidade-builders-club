import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { googleCalendarUrl } from "./calendar";

describe("googleCalendarUrl — F078", () => {
  it("monta início/fim com 60 min de duração em UTC básico", () => {
    const url = googleCalendarUrl({
      liveAt: new Date("2026-09-08T20:00:00.000Z"),
      titulo: "Live semanal — Builders Club",
    });
    const params = new URL(url).searchParams;
    assert.equal(params.get("action"), "TEMPLATE");
    assert.equal(params.get("text"), "Live semanal — Builders Club");
    assert.equal(params.get("dates"), "20260908T200000Z/20260908T210000Z");
  });

  it("inclui detalhes e local quando informados", () => {
    const url = googleCalendarUrl({
      liveAt: new Date("2026-09-08T20:00:00.000Z"),
      titulo: "Live",
      detalhes: "Link no Club",
      local: "https://club.exemplo.com",
    });
    const params = new URL(url).searchParams;
    assert.equal(params.get("details"), "Link no Club");
    assert.equal(params.get("location"), "https://club.exemplo.com");
  });
});
