import { test } from "node:test";
import assert from "node:assert/strict";
import { moduloMedido } from "./escopo";

test("os cinco módulos da Fase 1 são medidos", () => {
  for (const slug of [
    "fase-1-m01-comece-por-aqui",
    "fase-1-m02-nicho-e-oferta",
    "fase-1-m03-ache-seus-clientes",
    "fase-1-m04-abordagem-e-amostra",
    "fase-1-m05-feche-seguro",
  ]) {
    assert.equal(moduloMedido(slug), true, slug);
  }
});

test("o resto do catálogo fica de fora por enquanto", () => {
  for (const slug of [
    "fase-2-m06-entregue-o-site",
    "ia-aplicada-rag",
    "automacoes-n8n-agentes",
    "fundamentos-do-builder-profissional",
  ]) {
    assert.equal(moduloMedido(slug), false, slug);
  }
});

test("slug ausente não quebra a página", () => {
  assert.equal(moduloMedido(null), false);
  assert.equal(moduloMedido(undefined), false);
  assert.equal(moduloMedido(""), false);
});
