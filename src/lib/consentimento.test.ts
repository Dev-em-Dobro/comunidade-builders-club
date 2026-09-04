import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  consentiuAnalytics,
  serializarConsentimento,
  shouldLoadClarity,
} from "./consentimento";

describe("shouldLoadClarity — F074", () => {
  const aceito = serializarConsentimento("aceito");
  const recusado = serializarConsentimento("recusado");

  it("não carrega sem Project ID", () => {
    assert.equal(
      shouldLoadClarity({ projectId: "", consentCookie: aceito }),
      false,
    );
    assert.equal(
      shouldLoadClarity({ projectId: "  ", consentCookie: aceito }),
      false,
    );
  });

  it("não carrega sem aceite, mesmo com ID", () => {
    assert.equal(
      shouldLoadClarity({ projectId: "abc123", consentCookie: recusado }),
      false,
    );
    assert.equal(
      shouldLoadClarity({ projectId: "abc123", consentCookie: null }),
      false,
    );
  });

  it("carrega só com ID e aceite", () => {
    assert.equal(
      shouldLoadClarity({ projectId: "abc123", consentCookie: aceito }),
      true,
    );
    assert.equal(consentiuAnalytics(aceito), true);
  });
});
