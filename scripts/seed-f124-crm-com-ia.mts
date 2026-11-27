/**
 * F124 — módulo CRM com IA (7 aulas gravadas + 1 em texto (QR) + 1 em breve).
 *
 * Sobrescreve vídeo, título e descrição de todas as aulas do módulo. Aula
 * gravada ou editada em produção precisa entrar aqui antes de rodar de novo.
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
const zip = "/materiais/crm-para-alunos-template-1.0.5.zip";
const emBreve = "Em breve — esta aula ainda não foi gravada.";

/** F124 (1.0.5) — aula em texto: WhatsApp via QR (WAHA), base no WHATSAPP_QR.md. */
const whatsappQr = `Nesta aula você conecta o WhatsApp do atendimento só lendo um QR code: sem aplicativo na Meta, sem aprovação e sem janela de 24 horas. O template 1.0.5 faz isso com o WAHA, que roda no Docker junto com o banco e o Redis.

A API oficial da aula anterior continua valendo. Os dois canais podem ficar ligados ao mesmo tempo.

## Antes de usar
- A conexão é **não oficial**: o WhatsApp pode desconectar a sessão ou bloquear o número.
- O risco sobe com disparo frio, lista comprada, volume alto e texto igual em massa. Responder quem escreveu primeiro é o uso de menor risco.
- Prefira um número com histórico. Para atendimento crítico de cliente, prefira a API oficial.
- Um número por instalação: se você ler o QR no CRM local e no do Railway, o cliente recebe resposta em dobro.

## Passo a passo (local)
- Baixe o template 1.0.5 abaixo. Quem instalou o 1.0.4 precisa do projeto novo.
- Rode \`npm run setup\`. Ele gera a \`WAQR_API_KEY\` e o \`WAQR_WEBHOOK_SECRET\` no \`.env\`.
- No \`.env\`, confira \`WAQR_BASE_URL=http://127.0.0.1:3000\` e \`WAQR_WEBHOOK_BASE_URL=http://host.docker.internal:3100\`. Não precisa de ngrok.
- Suba o WAHA com \`docker compose --profile waha up -d --wait\` e espere o serviço \`waha\` ficar \`healthy\`.
- Reinicie o CRM: \`Ctrl+C\` e \`npm run dev\`.
- No CRM, abra **Onboarding → Canais** e clique em **Conectar WhatsApp** no card **WhatsApp via QR**.
- No celular do número de atendimento: WhatsApp → **Aparelhos conectados** → **Conectar aparelho**, e leia o QR.
- Quando o card mostrar **Conectado**, mande uma mensagem de outro celular. Ela aparece em **Conversas** e o agente responde.

Para parar sem perder a sessão, use \`docker compose --profile waha stop\`. Não use \`down -v\`: ele apaga a sessão e você vai ter que ler o QR de novo.

## Se travar
- **WAHA inacessível:** o container está parado ou o \`WAQR_BASE_URL\` está errado. Rode \`docker compose --profile waha ps\`.
- **WAHA recusou a chave:** a \`WAQR_API_KEY\` não bate com a do container. Recrie com \`docker compose --profile waha up -d\`.
- **Mensagem não chega:** o recebimento está pausado. Clique em **Ativar recebimento** no card.
- **Sessão FAILED:** o celular desconectou o aparelho. Clique em **Conectar WhatsApp** e leia o QR de novo.

O guia completo é o \`WHATSAPP_QR.md\`, na pasta de guias do ZIP. Para colocar no ar, veja a seção 11 do \`RAILWAY.md\`.

## Materiais
- [Baixar template 1.0.5 e guias (ZIP)](${zip})
- [Documentação do WAHA](https://waha.devlike.pro)`;

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
    description: `Nesta aula você vê o CRM com IA do ponto de vista do aluno: uma instalação independente por negócio, com WhatsApp Cloud API, WhatsApp via QR code, Instagram Direct e agente de atendimento.

A ideia é começar o caminho — o ZIP traz o template 1.0.5, os guias e os prompts de instalação assistida.

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

Prefere não passar pela Meta? Na próxima aula você conecta o WhatsApp só lendo um QR code.

## Links
- [WhatsApp Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Meta for Developers](https://developers.facebook.com/)`,
  },
  {
    slug: "whatsapp-via-qr-code",
    title: "WhatsApp via QR code (sem Meta)",
    sortOrder: 5,
    description: whatsappQr,
  },
  {
    // Gravada e cadastrada em produção em 2026-11-06 — copiada de lá.
    slug: "deploy-no-railway",
    title: "Deploy no Railway",
    sortOrder: 6,
    videoId: "422f16ef-c630-4345-8ec6-888ddd708c6b",
    description: `Nesta aula, colocamos o CRM no ar usando Railway e Claude Code. Você acompanha a criação do projeto, o envio do código ao GitHub, a configuração do banco de dados e do Redis, e a conexão do repositório ao serviço.

Também mostramos como investigar erros de build e de banco, até validar o acesso ao CRM publicado e trocar a senha inicial. Na próxima aula, vamos configurar os dados, as chaves e os agentes no ambiente de produção.

## Links úteis
- [Railway](https://railway.com/)
- [Claude Code](https://code.claude.com/docs/en/overview)
- [GitHub](https://github.com/)
- [Railway CLI](https://docs.railway.com/cli)
- [Docker Desktop](https://docs.docker.com/desktop/)`,
  },
  {
    // Gravada e cadastrada em produção em 2026-11-06 — copiada de lá.
    // O slug ficou o antigo; só o título mudou.
    slug: "configurar-dominio-https-e-migrar-callbacks-da-meta",
    title: "Configurações em produção e WhatsApp",
    sortOrder: 7,
    videoId: "8d4d0746-17fa-4454-879a-9fff355828d1",
    description: `Nesta aula, continuo a configuração do CRM publicado no Railway e testo a integração com o WhatsApp pela Meta. Mostro como levar as configurações do ambiente local para a produção, atualizar a chave da API, conferir o webhook e validar o envio e o recebimento de uma mensagem real.

Também explico os próximos passos para usar um número próprio: configurar a cobrança, verificar a empresa, criar um usuário do sistema, gerar um token duradouro e conferir suas permissões. Ao seguir a aula, use o Business, o aplicativo, o número e as credenciais da sua própria empresa.

## Links da aula
- [Railway](https://railway.com/)
- [Chaves da API Claude](https://platform.claude.com/settings/keys)
- [Aplicativos no Meta for Developers](https://developers.facebook.com/apps/)
- [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
- [Depurador de tokens da Meta](https://developers.facebook.com/tools/debug/accesstoken/)
- [WhatsApp Manager](https://business.facebook.com/wa/manage/home/)
- [Números no WhatsApp Manager](https://business.facebook.com/wa/manage/phone-numbers/)
- [Usuários do sistema no Meta Business](https://business.facebook.com/settings/system-users)
- [Configurações de pagamento da Meta](https://business.facebook.com/billing_hub/payment_settings)`,
  },
  {
    slug: "testes-de-aceitacao-operacao-custos-e-backup",
    title: "Testes de aceitação, operação, custos e backup",
    sortOrder: 8,
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
