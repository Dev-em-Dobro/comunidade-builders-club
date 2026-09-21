import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  findModulePath,
  type AulaModuleCard,
} from "@/components/aulas-catalog";

function mod(
  partial: Pick<AulaModuleCard, "id" | "slug" | "title"> &
    Partial<AulaModuleCard>,
): AulaModuleCard {
  return {
    description: null,
    coverImageUrl: null,
    freeAccess: false,
    lessons: [],
    children: [],
    ...partial,
  };
}

describe("findModulePath — F094", () => {
  const m01 = mod({ id: "m01", slug: "fase-1-m01", title: "Comece por aqui" });
  const m02 = mod({ id: "m02", slug: "fase-1-m02", title: "Nicho" });
  const fase1 = mod({
    id: "f1",
    slug: "fase-1",
    title: "FASE 1 — Do zero ao primeiro sim",
    children: [m01, m02],
  });
  const n8n = mod({ id: "n8n", slug: "n8n-basico", title: "n8n básico" });
  const trilha = mod({
    id: "ia",
    slug: "ia-aplicada",
    title: "IA Aplicada",
    children: [n8n],
  });
  const formacao = mod({
    id: "fia",
    slug: "formacao-ia",
    title: "Formação IA e Automações",
    children: [trilha],
  });
  const roots = [fase1, formacao];

  it("devolve fase + módulo", () => {
    assert.deepEqual(
      findModulePath(roots, "fase-1-m01").map((m) => m.slug),
      ["fase-1", "fase-1-m01"],
    );
  });

  it("inclui trilha intermediária", () => {
    assert.deepEqual(
      findModulePath(roots, "n8n-basico").map((m) => m.slug),
      ["formacao-ia", "ia-aplicada", "n8n-basico"],
    );
  });

  it("módulo raiz sozinho", () => {
    assert.deepEqual(
      findModulePath(roots, "fase-1").map((m) => m.slug),
      ["fase-1"],
    );
  });

  it("slug inexistente → vazio", () => {
    assert.deepEqual(findModulePath(roots, "nao-existe"), []);
  });
});
