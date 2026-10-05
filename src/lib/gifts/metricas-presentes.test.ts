import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { contarPresentesPegos } from "./metricas";

describe("contarPresentesPegos", () => {
  it("conta presentes distintos e inclui o presente de origem", () => {
    assert.equal(
      contarPresentesPegos("agent-reach", ["agent-reach", "whisper-local"]),
      2,
    );
  });
});
