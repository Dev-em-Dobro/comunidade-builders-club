/**
 * F124 — módulo CRM com IA (5 aulas gravadas + 3 em breve).
 *
 *   npx tsx scripts/seed-f124-crm-com-ia.mts --target=hml
 *   npx tsx scripts/seed-f124-crm-com-ia.mts --target=prod --confirm
 */
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
config({ path: resolve(root, ".env"), override: true });

const libraryId = "77c52f03-dc6";
const zip = "/materiais/crm-para-alunos-template.zip";
const emBreve = "Em breve — esta aula ainda não foi gravada.";

const lessons: Array<{
  slug: string;
  title: string;
  description: string;
  videoId?: string;
  sortOrder: number;
}> = [
  {
    slug: "visao-geral-do-crm",
    title: "Visão geral do CRM",
    sortOrder: 0,
    videoId: "ae0cabc2-254e-48ed-98cc-3daf0cfc6f13",
    description: `Nesta aula você vê o CRM com IA do ponto de vista do aluno: uma instalação independente por negócio, com WhatsApp Cloud API, Instagram Direct e agente de atendimento.

A ideia é começar o caminho — o ZIP traz o template 1.0.4, os guias e os prompts de instalação assistida.

## Materiais
- [Baixar template e guias (ZIP)](${zip})`,
  },
  {
    slug: "arquivos-e-instalacao",
    title: "Arquivos e instalação",
    sortOrder: 1,
    videoId: "d7b922aa-0484-45af-b0cc-41e1b9dfa6da",
    description: `Aqui você baixa o pacote, extrai o template, confere Node.js 22 LTS e Docker Desktop, e sobe a instalação local com o setup.

O ZIP da aula 1 tem o template e o guia de instalação assistida (prompts para o agente). Sem Docker aberto e sem Node 22, o setup não anda.

## Materiais
- [Baixar template e guias (ZIP)](${zip}) — o mesmo pacote da aula 1
- [Node.js 22 LTS](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)`,
  },
  {
    slug: "primeiro-acesso-e-configuracao",
    title: "Primeiro acesso e configuração",
    sortOrder: 2,
    videoId: "df983cd6-689f-4d6a-9406-bc2b77c6060a",
    description: `Depois do setup, você entra no painel, cria o administrador e faz a configuração inicial da instância.

Se travar no primeiro acesso, volte ao README e à instalação assistida que estão no ZIP da aula 1.`,
  },
  {
    slug: "agente-de-ia-e-catalogo",
    title: "Agente de IA e catálogo",
    sortOrder: 3,
    videoId: "4512a78a-88a6-4df1-a930-094f8941c82e",
    description: `Nesta aula você configura o primeiro agente de IA, o catálogo e as regras de transferência para humano.

Você precisa de uma chave de API da Anthropic ou da OpenAI — assinatura de chat não substitui crédito de API. O guia de agentes está no ZIP da aula 1.`,
  },
  {
    slug: "whatsapp-e-proximos-passos",
    title: "WhatsApp e próximos passos",
    sortOrder: 4,
    videoId: "fef3b100-d72d-4242-82e7-949bb9e67aa9",
    description: `Aqui você conecta WhatsApp Cloud API (e Instagram Direct, se for usar) com os ativos da sua própria conta Meta.

O guia META.md está no ZIP da aula 1. A Meta não alcança localhost: para webhook no desenvolvimento use um túnel HTTPS; na produção entra o domínio da aula de deploy.

## Links
- [WhatsApp Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Meta for Developers](https://developers.facebook.com/)`,
  },
  {
    slug: "deploy-no-railway",
    title: "Deploy no Railway",
    sortOrder: 5,
    description: emBreve,
  },
  {
    slug: "configurar-dominio-https-e-migrar-callbacks-da-meta",
    title: "Configurar domínio HTTPS e migrar os callbacks da Meta",
    sortOrder: 6,
    description: emBreve,
  },
  {
    slug: "testes-de-aceitacao-operacao-custos-e-backup",
    title: "Testes de aceitação, operação, custos e backup",
    sortOrder: 7,
    description: emBreve,
  },
];

type Target = "local" | "hml" | "prod";
const target = (process.argv.find((arg) => arg.startsWith("--target="))?.slice(9) ??
  "hml") as Target;
if (!["local", "hml", "prod"].includes(target)) {
  throw new Error("Use --target=hml|local|prod");
}
if (target === "prod" && !process.argv.includes("--confirm")) {
  throw new Error("Produção exige --confirm");
}

const url = {
  local: process.env.DATABASE_URL?.trim(),
  hml:
    process.env.DATABASE_URL_HML?.trim() ||
    process.env.DATABASE_URL_STAGING?.trim(),
  prod: process.env.DATABASE_URL_PROD?.trim(),
}[target];
if (!url) throw new Error(`Env ausente para --target=${target}`);

const prisma = new PrismaClient({ datasources: { db: { url } } });

try {
  const result = await prisma.$transaction(async (db) => {
    await db.module.update({
      where: { slug: "jev-aplicado-ao-mundo-real" },
      data: { sortOrder: 18 },
    });

    const module = await db.module.upsert({
      where: { slug: "crm-com-ia" },
      create: {
        slug: "crm-com-ia",
        title: "CRM com IA",
        description:
          "Template de CRM com WhatsApp, Instagram e agente de IA: da instalação local ao atendimento no ar.",
        coverImageUrl: "/10-crm.png",
        published: true,
        freeAccess: false,
        sortOrder: 17,
        parentId: null,
      },
      update: {
        title: "CRM com IA",
        description:
          "Template de CRM com WhatsApp, Instagram e agente de IA: da instalação local ao atendimento no ar.",
        coverImageUrl: "/10-crm.png",
        published: true,
        freeAccess: false,
        sortOrder: 17,
      },
    });

    const saved = [];
    for (const lesson of lessons) {
      const row = await db.lesson.upsert({
        where: { moduleId_slug: { moduleId: module.id, slug: lesson.slug } },
        create: {
          moduleId: module.id,
          slug: lesson.slug,
          title: lesson.title,
          description: lesson.description,
          pandaVideoExternalId: lesson.videoId ?? null,
          pandaLibraryId: lesson.videoId ? libraryId : null,
          thumbnailUrl: lesson.videoId
            ? `https://cdn.pandavideo.com/vz-${libraryId}/${lesson.videoId}/thumbnail.jpg`
            : null,
          sortOrder: lesson.sortOrder,
          published: true,
        },
        update: {
          title: lesson.title,
          description: lesson.description,
          pandaVideoExternalId: lesson.videoId ?? null,
          pandaLibraryId: lesson.videoId ? libraryId : null,
          thumbnailUrl: lesson.videoId
            ? `https://cdn.pandavideo.com/vz-${libraryId}/${lesson.videoId}/thumbnail.jpg`
            : null,
          sortOrder: lesson.sortOrder,
          published: true,
        },
      });
      saved.push(row);
    }
    return { module, saved };
  });
  console.log(
    `[${target}] ${result.module.slug} order=${result.module.sortOrder} cover=${result.module.coverImageUrl} lessons=${result.saved.length}`,
  );
  for (const l of result.saved) {
    console.log(`  ${l.sortOrder} ${l.slug} video=${Boolean(l.pandaVideoExternalId)}`);
  }
} finally {
  await prisma.$disconnect();
}
