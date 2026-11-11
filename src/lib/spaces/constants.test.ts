import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  AULA_THREADS_SPACE_SLUG,
  AVISOS_SPACE_SLUG,
  HIDDEN_NAV_SPACE_SLUGS,
} from "./constants";

describe("HIDDEN_NAV_SPACE_SLUGS", () => {
  it("esconde do menu aula-threads, avisos, freelas e geral", () => {
    assert.deepEqual([...HIDDEN_NAV_SPACE_SLUGS].sort(), [
      AULA_THREADS_SPACE_SLUG,
      AVISOS_SPACE_SLUG,
      "freelas",
      "geral",
    ]);
  });
});
