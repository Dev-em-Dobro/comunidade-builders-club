/**
 * F050 — Seed dos módulos rascunho Automações n8n e IA Aplicada.
 *
 *   npm run db:seed:aulas-panda -- --target=hml
 *   npm run db:seed:aulas-panda -- --target=prod --confirm
 *
 * Idempotente por slug. Não altera `published` se o registro já existir.
 */
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
config({ path: resolve(root, ".env"), override: true });
config({ path: resolve(root, ".env.local"), override: true });

const PANDA_LIBRARY = "77c52f03-dc6";

type Target = "local" | "hml" | "prod";

type LessonSeed = {
  slug: string;
  title: string;
  description: string;
  pandaVideoExternalId: string;
  sortOrder: number;
};

type ModuleSeed = {
  slug: string;
  title: string;
  description: string;
  coverImageUrl?: string | null;
  sortOrder: number;
  lessons: LessonSeed[];
  children?: ModuleSeed[];
};

function thumb(externalId: string) {
  return `https://cdn.pandavideo.com/vz-${PANDA_LIBRARY}/${externalId}/thumbnail.jpg`;
}

const CATALOG: ModuleSeed[] = [
  {
    slug: "formacao-ia-e-automacoes",
    title: "Formação IA e Automações",
    description:
      "Produto-base da comunidade: criação de software com IA aplicada e automações com n8n.",
    sortOrder: 1,
    lessons: [],
    children: [
  {
    slug: "automacoes-n8n",
    title: "Automações com n8n",
    description:
      "Do zero ao primeiro agente: n8n, workflows, webhooks e automações práticas para o dia a dia de quem constrói produto.",
    coverImageUrl: "/thumb-automacoes-n8n.png",
    sortOrder: 1,
    lessons: [
      {
        slug: "introducao-ao-n8n",
        title: "Introdução ao n8n",
        description:
          "O que é o n8n, quando faz sentido usar e o panorama desta formação.",
        pandaVideoExternalId: "98529f6e-328b-4f19-8d92-200b61b8c7dc",
        sortOrder: 0,
      },
      {
        slug: "criando-conta-e-dashboard",
        title: "Criando conta e conhecendo o dashboard",
        description:
          "Como criar a conta e se orientar na interface do n8n.",
        pandaVideoExternalId: "f79a02b8-7db6-46f8-a210-22b822e1557f",
        sortOrder: 1,
      },
      {
        slug: "workflows",
        title: "Workflows",
        description:
          "Como um workflow é estruturado e como montar o primeiro fluxo.",
        pandaVideoExternalId: "85976b5c-359b-4555-b99c-f2fc64261bf0",
        sortOrder: 2,
      },
      {
        slug: "triggers",
        title: "Triggers",
        description:
          "O que dispara um fluxo: tipos de trigger e quando usar cada um.",
        pandaVideoExternalId: "78401961-25d6-4ea9-9d0a-05a7a7b20e82",
        sortOrder: 3,
      },
      {
        slug: "formularios",
        title: "Formulários",
        description:
          "Capturar dados com forms e ligar o envio a um workflow.",
        pandaVideoExternalId: "26296c12-94bd-4629-9c07-25db6ae77682",
        sortOrder: 4,
      },
      {
        slug: "edit-fields-e-if",
        title: "Nós que modificam o fluxo: Edit Fields e IF",
        description:
          "Transformar dados no meio do caminho e ramificar com condições.",
        pandaVideoExternalId: "3197e94c-d989-4b77-b567-3d642749650c",
        sortOrder: 5,
      },
      {
        slug: "filter-e-switch",
        title: "Nós que modificam o fluxo: Filter e Switch",
        description:
          "Filtrar itens e escolher caminhos diferentes com Switch.",
        pandaVideoExternalId: "ee01fac3-1b2b-4376-9f34-6eb38e478079",
        sortOrder: 6,
      },
      {
        slug: "http-requests-e-webhook",
        title: "HTTP Requests e Webhook",
        description:
          "Integrar APIs externas e receber eventos via webhook.",
        pandaVideoExternalId: "a0df3c8d-0ade-43c3-9b11-4d70d9b46783",
        sortOrder: 7,
      },
      {
        slug: "agente-planejador-de-conteudos",
        title: "Agente planejador de conteúdos com Google Sheets",
        description:
          "Montar um agente que planeja conteúdos e registra tudo em planilha.",
        pandaVideoExternalId: "15a0cfd5-b96e-4e74-aa56-4d85651fdd01",
        sortOrder: 8,
      },
      {
        slug: "agente-gestor-financeiro",
        title: "Agente gestor financeiro",
        description:
          "Um agente para organizar e acompanhar o financeiro no n8n.",
        pandaVideoExternalId: "a25a8637-6398-4b19-8a4c-dccc88d51fd1",
        sortOrder: 9,
      },
      {
        slug: "hospedagem-na-hostinger",
        title: "Hospedando o n8n na Hostinger",
        description:
          "Subir o n8n em um VPS da Hostinger para rodar 24 horas.",
        pandaVideoExternalId: "fb2968ed-72e1-451f-bc4a-d96549010402",
        sortOrder: 10,
      },
    ],
  },
  {
    slug: "ia-aplicada",
    title: "IA Aplicada",
    description:
      "Da origem da IA até um produto guiado por modelos: LLMs, prompt, RAG e um projeto final na prática.",
    coverImageUrl: "/thumb-ia-aplicada.png",
    sortOrder: 0,
    lessons: [],
    children: [
      {
        slug: "ia-aplicada-introducao",
        title: "Introdução à formação e ao surgimento da IA",
        description:
          "Contexto da formação, como a IA chegou até aqui e o que muda para quem não quer ser só programador.",
        sortOrder: 0,
        lessons: [
          {
            slug: "aula-1-introducao",
            title: "Aula 1 — Introdução",
            description:
              "Abertura da formação: o que você vai construir e por quê.",
            pandaVideoExternalId: "21b476aa-228f-4054-bc23-9b32c9a92ffa",
            sortOrder: 0,
          },
          {
            slug: "aula-2-formacao-e-surgimento-da-ia",
            title: "Aula 2 — A formação e o surgimento da IA",
            description:
              "Como a IA evoluiu e o recorte que usamos nesta formação.",
            pandaVideoExternalId: "41f76650-3775-4b69-98ee-ddb4e4c9d8dd",
            sortOrder: 1,
          },
          {
            slug: "aula-3-ia-pra-quem-nao-quer-ser-programador",
            title: "Aula 3 — IA pra quem não quer ser programador",
            description:
              "Como usar IA no dia a dia mesmo sem viver só de código.",
            pandaVideoExternalId: "10746ecf-328c-45e8-af85-73f6211f59dd",
            sortOrder: 2,
          },
        ],
      },
      {
        slug: "ia-aplicada-fundamentos-llms",
        title: "Fundamentos de LLMs para Devs",
        description:
          "Como os modelos de linguagem funcionam e quais configurações realmente importam.",
        sortOrder: 1,
        lessons: [
          {
            slug: "aula-4-como-as-llms-pensam",
            title: "Aula 4 — Como as LLMs pensam",
            description:
              "Intuição prática de como um modelo de linguagem gera respostas.",
            pandaVideoExternalId: "e8ea3434-2e9a-4547-84ba-da2490caa2fe",
            sortOrder: 0,
          },
          {
            slug: "aula-6-configuracoes",
            title: "Aula 6 — Configurações",
            description:
              "Parâmetros e configs que mudam o comportamento do modelo.",
            pandaVideoExternalId: "5b3283a3-60af-40ce-abb2-f7d256151e24",
            sortOrder: 1,
          },
        ],
      },
      {
        slug: "ia-aplicada-engenharia-prompt",
        title: "Engenharia de Prompt Essencial",
        description:
          "Escrever prompts que funcionam: estrutura, few-shot e prática.",
        sortOrder: 2,
        lessons: [
          {
            slug: "aula-8-prompts",
            title: "Aula 8 — Prompts",
            description:
              "Estrutura de um bom prompt e padrões que se repetem no dia a dia.",
            pandaVideoExternalId: "cb34660e-776c-45b7-ac5c-4c98b3d6d8ae",
            sortOrder: 0,
          },
          {
            slug: "aula-10-few-shot",
            title: "Aula 10 — Mão na massa: few-shot",
            description:
              "Ensinar o modelo com exemplos e iterar o prompt na prática.",
            pandaVideoExternalId: "95430708-f622-4025-876d-a02c16c14b13",
            sortOrder: 1,
          },
        ],
      },
      {
        slug: "ia-aplicada-rag",
        title: "RAG: usando seus próprios dados",
        description:
          "Fazer o modelo responder com a sua base: o que é RAG e o papel dos embeddings.",
        sortOrder: 3,
        lessons: [
          {
            slug: "aula-13-o-que-e-rag",
            title: "Aula 13 — O que é RAG",
            description:
              "Retrieval-Augmented Generation: por que o modelo precisa da sua base.",
            pandaVideoExternalId: "25c49ffe-2f76-404d-b4d1-f8d88d21dad4",
            sortOrder: 0,
          },
          {
            slug: "aula-14-embeddings",
            title: "Aula 14 — Embeddings",
            description:
              "Como transformar texto em vetores e buscar trechos relevantes.",
            pandaVideoExternalId: "69be19f9-40f1-4738-ba80-01aab4f95720",
            sortOrder: 1,
          },
        ],
      },
      {
        slug: "ia-aplicada-projeto-final",
        title: "Projeto final: produto guiado por IA",
        description:
          "Doc Pilot: um produto com chat, vetores, upload e integração de ponta a ponta.",
        sortOrder: 4,
        lessons: [
          {
            slug: "aula-27-projeto-doc-pilot",
            title: "Aula 27 — Projeto Doc Pilot",
            description:
              "Visão do produto final e o recorte que vamos construir.",
            pandaVideoExternalId: "abd536ee-6b16-43e7-94a0-59a945e84c14",
            sortOrder: 0,
          },
          {
            slug: "aula-28-projeto-doc-pilot-continuacao",
            title: "Aula 28 — Projeto Doc Pilot (continuação)",
            description:
              "Seguindo a construção do Doc Pilot passo a passo.",
            pandaVideoExternalId: "9bee1e55-6e05-408b-a8ba-4dda0eb97131",
            sortOrder: 1,
          },
          {
            slug: "aula-29-design-e-configs-iniciais",
            title: "Aula 29 — Design e configs iniciais",
            description:
              "Base visual e configurações iniciais do produto.",
            pandaVideoExternalId: "97293066-3696-4d60-a9b1-783e0c059e54",
            sortOrder: 2,
          },
          {
            slug: "aula-30-integrando-o-design",
            title: "Aula 30 — Integrando o design",
            description:
              "Encaixar o layout no fluxo da aplicação.",
            pandaVideoExternalId: "723cea46-09b5-48ac-97ff-f7fa963086ee",
            sortOrder: 3,
          },
          {
            slug: "aula-31-configs-extra-openai",
            title: "Aula 31 — Configs extra da OpenAI",
            description:
              "Ajustes extras da API da OpenAI no projeto.",
            pandaVideoExternalId: "70a5c758-2b14-45fb-8d9e-ee1ffddcc61f",
            sortOrder: 4,
          },
          {
            slug: "aula-32-salvar-vetores-no-banco",
            title: "Aula 32 — Salvar vetores no banco",
            description:
              "Persistir embeddings para busca no produto.",
            pandaVideoExternalId: "f9eed381-10ec-4272-9c24-2e57f32ad4f1",
            sortOrder: 5,
          },
          {
            slug: "aula-33-enviar-mensagem-pelo-chat",
            title: "Aula 33 — Enviar mensagem pelo chat",
            description:
              "O fluxo de envio e resposta no chat do Doc Pilot.",
            pandaVideoExternalId: "028d05a1-01b8-4b45-8539-2bbe7d023226",
            sortOrder: 6,
          },
          {
            slug: "aula-34-upload-de-arquivos",
            title: "Aula 34 — Upload de arquivos",
            description:
              "Enviar arquivos, indexar e usar no chat.",
            pandaVideoExternalId: "36b8eb27-985c-4c91-a4e0-4c22ef6c70fe",
            sortOrder: 7,
          },
        ],
      },
    ],
  },
    ],
  },
];

function resolveUrl(target: Target): string {
  const map: Record<Target, string | undefined> = {
    local: process.env.DATABASE_URL?.trim(),
    hml:
      process.env.DATABASE_URL_HML?.trim() ||
      process.env.DATABASE_URL_STAGING?.trim(),
    prod: process.env.DATABASE_URL_PROD?.trim(),
  };
  const url = map[target];
  if (!url) throw new Error(`Env ausente para --target=${target}`);
  return url;
}

function maskUrl(url: string): string {
  return url.replace(/:([^:@/]+)@/, ":****@");
}

function parseTargets(argv: string[]): Target[] {
  const raw = argv
    .find((a) => a.startsWith("--target="))
    ?.slice("--target=".length);
  const parts = (raw ?? "hml")
    .split(",")
    .map((p) => p.trim()) as Target[];
  for (const p of parts) {
    if (p !== "local" && p !== "hml" && p !== "prod") {
      throw new Error(`Target inválido: ${p}`);
    }
  }
  return parts;
}

async function upsertModule(
  prisma: PrismaClient,
  seed: ModuleSeed,
  parentId: string | null,
) {
  const existing = await prisma.module.findUnique({ where: { slug: seed.slug } });
  const module = existing
    ? await prisma.module.update({
        where: { slug: seed.slug },
        data: {
          title: seed.title,
          description: seed.description,
          coverImageUrl: seed.coverImageUrl ?? null,
          sortOrder: seed.sortOrder,
          parentId,
        },
      })
    : await prisma.module.create({
        data: {
          slug: seed.slug,
          title: seed.title,
          description: seed.description,
          coverImageUrl: seed.coverImageUrl ?? null,
          sortOrder: seed.sortOrder,
          parentId,
          published: false,
        },
      });

  for (const lesson of seed.lessons) {
    const found = await prisma.lesson.findUnique({
      where: { moduleId_slug: { moduleId: module.id, slug: lesson.slug } },
    });
    const lessonData = {
      title: lesson.title,
      description: lesson.description,
      pandaVideoExternalId: lesson.pandaVideoExternalId,
      pandaLibraryId: PANDA_LIBRARY,
      thumbnailUrl: thumb(lesson.pandaVideoExternalId),
      sortOrder: lesson.sortOrder,
    };
    if (found) {
      await prisma.lesson.update({
        where: { id: found.id },
        data: lessonData,
      });
    } else {
      await prisma.lesson.create({
        data: {
          moduleId: module.id,
          slug: lesson.slug,
          ...lessonData,
          published: false,
        },
      });
    }
  }

  for (const child of seed.children ?? []) {
    await upsertModule(prisma, child, module.id);
  }

  return module;
}

const argv = process.argv.slice(2);
const targets = parseTargets(argv);
if (targets.includes("prod") && !argv.includes("--confirm")) {
  throw new Error("Produção exige --confirm");
}

for (const target of targets) {
  const url = resolveUrl(target);
  const prisma = new PrismaClient({ datasources: { db: { url } } });
  console.log(`\n[${target}] ${maskUrl(url)}`);
  try {
    for (const mod of CATALOG) {
      const saved = await upsertModule(prisma, mod, null);
      console.log(
        `  ${saved.slug}: published=${saved.published} (formação → módulos → submódulos)`,
      );
    }
  } finally {
    await prisma.$disconnect();
  }
}
