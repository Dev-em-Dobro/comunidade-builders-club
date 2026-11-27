/**
 * F050 — preenche ChallengeRequiredLesson (aulas obrigatórias por fase).
 *
 * Casa cada item pelo slug da aula (quando informado) ou pelo título (sem
 * acento/caixa), procurando em aulas e módulos. Item de módulo inclui todas as
 * aulas do módulo. Relata o que não encontrou e não apaga nada fora da lista.
 *
 * Uso: npx tsx scripts/seed-desafio-aulas.mts [--dry-run]
 * Banco: DATABASE_URL do .env (rode contra staging antes de produção).
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

// Mapeamento inicial da spec F050 — confirmar com o catálogo de produção.
const MAPPING: { phase: 1 | 2; title: string; slug?: string }[] = [
  { phase: 1, title: "Renda extra com IA e Claude Code" },
  { phase: 1, title: "Sites que vendem e o agente que atende sozinho" },
  { phase: 1, title: "Do nicho ao primeiro cliente" },
  { phase: 2, title: "Mentoria: destravando a prospecção" },
  { phase: 2, title: "Do \"gostei\" ao dinheiro na conta" },
];

const dryRun = process.argv.includes("--dry-run");
const db = new PrismaClient();
const norm = (value: string) =>
  value.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[“”"']/g, "").toLowerCase().replace(/\s+/g, " ").trim();

const modules = await db.module.findMany({ select: { id: true, title: true, lessons: { select: { id: true, title: true, slug: true } } } });
const lessons = modules.flatMap((module) => module.lessons);
const found: { lessonId: string; phase: number; label: string }[] = [];
const missing: string[] = [];

for (const item of MAPPING) {
  const lesson = lessons.find((entry) => (item.slug && entry.slug === item.slug) || norm(entry.title) === norm(item.title));
  if (lesson) {
    found.push({ lessonId: lesson.id, phase: item.phase, label: `aula "${lesson.title}"` });
    continue;
  }
  const module = modules.find((entry) => norm(entry.title) === norm(item.title));
  if (module?.lessons.length) {
    for (const entry of module.lessons) found.push({ lessonId: entry.id, phase: item.phase, label: `módulo "${module.title}" › "${entry.title}"` });
    continue;
  }
  missing.push(`fase ${item.phase}: ${item.title}`);
}

for (const item of found) console.log(`✓ fase ${item.phase} · ${item.label}`);
for (const item of missing) console.warn(`✗ não encontrado — ${item}`);

if (!dryRun) {
  for (const item of found) {
    await db.challengeRequiredLesson.upsert({
      where: { lessonId: item.lessonId },
      create: { lessonId: item.lessonId, phase: item.phase },
      update: { phase: item.phase },
    });
  }
  console.log(`${found.length} aula(s) gravadas${missing.length ? `; ${missing.length} item(ns) sem correspondência` : ""}.`);
} else {
  console.log("--dry-run: nada gravado.");
}

await db.$disconnect();
