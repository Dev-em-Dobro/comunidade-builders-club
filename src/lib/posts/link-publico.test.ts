import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { postTemLinkPublico } from "./link-publico";

describe("postTemLinkPublico — F057/F084", () => {
  it("aceita https no linkUrl", () => {
    assert.equal(postTemLinkPublico("https://exemplo.com", ""), true);
  });

  it("rejeita marcador interno", () => {
    assert.equal(postTemLinkPublico("builders-club://aula/1", "sem url"), false);
  });

  it("aceita https no body", () => {
    assert.equal(
      postTemLinkPublico(null, "meu site https://loja.com.br/foo"),
      true,
    );
  });
});
