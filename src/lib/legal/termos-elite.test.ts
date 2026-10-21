import assert from "node:assert/strict";
import { test } from "node:test";
import { datasAcompanhamentoElite, versaoAceiteTermosElite } from "./termos-elite";

test("prazo Elite usa a data civil da compra no Brasil e soma um ano", () => {
  assert.deepEqual(
    datasAcompanhamentoElite(new Date("2026-10-21T02:30:00Z")),
    { compra: "20/10/2026", termino: "20/10/2027" },
  );
});

test("29 de fevereiro termina em 1 de março no ano seguinte", () => {
  assert.deepEqual(
    datasAcompanhamentoElite(new Date("2024-02-29T15:00:00Z")),
    { compra: "29/02/2024", termino: "01/03/2025" },
  );
});

test("sem data confiável não inventa vencimento", () => {
  assert.equal(datasAcompanhamentoElite(null), null);
});

test("conciliação da compra exige novo aceite", () => {
  assert.notEqual(
    versaoAceiteTermosElite(null),
    versaoAceiteTermosElite(new Date("2026-10-20T12:00:00Z")),
  );
});
