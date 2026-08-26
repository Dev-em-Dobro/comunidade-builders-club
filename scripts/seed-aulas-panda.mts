/**
 * F050 / F051 — Seed dos módulos rascunho (jornada Fase 1–2, n8n, IA Aplicada).
 *
 *   npm run db:seed:aulas-panda -- --target=hml
 *   npm run db:seed:aulas-panda -- --target=prod --confirm
 *
 * Idempotente por slug. Não altera `published` nem `sortOrder` se o
 * registro já existir (ordem do admin prevalece), **exceto** o M01
 * Comece por aqui (F060: `forceLessonSort`).
 * Títulos da jornada e da formação IA/n8n: amigáveis (sem Mxx-Lxx
 * nem prefixo `Aula N —`).
 */
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { WELCOME_TUTORIAL_VIDEO } from "../src/lib/spaces/constants.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
config({ path: resolve(root, ".env"), override: true });
config({ path: resolve(root, ".env.local"), override: true });

const PANDA_LIBRARY = "77c52f03-dc6";

type Target = "local" | "hml" | "prod";

type LessonSeed = {
  slug: string;
  title: string;
  description?: string;
  pandaVideoExternalId?: string;
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
  /** F060 — regrava sortOrder das aulas deste módulo. */
  forceLessonSort?: boolean;
};

function thumb(externalId: string) {
  return `https://cdn.pandavideo.com/vz-${PANDA_LIBRARY}/${externalId}/thumbnail.jpg`;
}

const CATALOG: ModuleSeed[] = [
  {
    slug: "fase-1-do-zero-ao-primeiro-sim",
    title: "FASE 1 — Do zero ao primeiro sim",
    description:
      "Jornada até o primeiro cliente fechado: nicho, abordagem, amostra e o lado empresa.",
    coverImageUrl: "/1-renda-extra.png",
    sortOrder: 0,
    lessons: [],
    children: [
      {
        slug: "fase-1-m01-comece-por-aqui",
        title: "Comece por aqui",
        description:
          "Introdução ao clube, tutorial da comunidade, desafio quick win no Lovable, mapa da formação e o que você vai construir e vender com IA.\n\nEntregável: apresentar-se no grupo, definir um nicho inicial e postar o quick win no Desafio Projetos.",
        sortOrder: 0,
        forceLessonSort: true,
        lessons: [
          {
            slug: "aula-introducao-builders-club",
            title: "Introdução ao Builders Club",
            description:
              "Aula de abertura: o que é o Builders Club, para quem é e como você entra na jornada.",
            pandaVideoExternalId: "19fad82c-70df-4dd1-ab5d-a6b44b18a58f",
            sortOrder: 0,
          },
          {
            slug: "tutorial-intro-comunidade",
            title: "Como usar a comunidade",
            description:
              "Tutorial da plataforma: Feed, Spaces, Aulas e como circular na comunidade. Mesmo vídeo da tela de Boas-vindas no plano pago (F058/F060).",
            pandaVideoExternalId: WELCOME_TUTORIAL_VIDEO.paidVideoExternalId,
            sortOrder: 1,
          },
          {
            slug: "desafio-quick-win-lovable",
            title: "Quick win no Lovable",
            description:
              "Primeiro projeto do desafio de 7 dias: montar uma landing no Lovable para um estabelecimento da sua rede quente e postar no space Desafio Projetos.",
            pandaVideoExternalId: "f32d7741-a581-4904-a8cf-e9fc4de2b018",
            sortOrder: 2,
          },
          {
            slug: "bem-vindo-e-mapa-da-jornada",
            title: "Bem-vindo e mapa da jornada",
            description:
              "Boas-vindas, como funciona a formação, mapa das fases, como usar a plataforma, regras e a primeira ação.",
            pandaVideoExternalId: "e413fe2b-8f93-408b-bb03-3fa6684c8f33",
            sortOrder: 3,
          },
          {
            slug: "o-que-voce-vai-construir",
            title: "O que você vai construir e vender com IA",
            description:
              "Nivelamento: o que é a formação, o que não é, e o objetivo de construir e vender soluções com IA.",
            pandaVideoExternalId: "9986fcaa-be0f-479b-8e51-8015baa04fde",
            sortOrder: 4,
          },
        ],
      },
      {
        slug: "fase-1-m02-nicho-e-oferta",
        title: "Escolha o nicho e o que vender",
        description:
          "Pensar como empresa, escolher nicho, ler o mercado e montar a escada de ofertas.\n\nEntregável: nicho definido + oferta escolhida.",
        sortOrder: 1,
        lessons: [
          {
            slug: "voce-nao-e-freela",
            title: "Você não é freela: pense como empresa",
            description:
              "Sair da lógica de freelancer hora/projeto e operar como empresa: oferta, processo e relacionamento com o cliente.",
            pandaVideoExternalId: "86f5e5bb-435a-4048-9c68-377e01594c7e",
            sortOrder: 0,
          },
          {
            slug: "sua-escada-de-ofertas",
            title: "Sua escada de ofertas",
            description:
              "Lead quente x frio, por que a amostra abre a porta e a progressão: landing page → agente → sistema → recorrência.",
            pandaVideoExternalId: "ae5b79c0-fe45-4711-a972-0601538206ff",
            sortOrder: 1,
          },
          {
            slug: "o-mercado-pede-isso",
            title: "O mercado pede isso",
            description:
              "O que o mercado local está comprando agora e como isso guia o que você oferece.",
            pandaVideoExternalId: "90907e50-1845-427a-83ef-e386c8da9403",
            sortOrder: 2,
          },
        ],
      },
      {
        slug: "fase-1-m03-ache-seus-clientes",
        title: "Ache seus clientes",
        description:
          "Rede quente, vergonha de abordar, prospecção fria com Orion e outras formas de encontrar cliente.\n\nEntregável: 20 nomes na lista quente + 3 visitas marcadas + Orion rodando.",
        sortOrder: 2,
        lessons: [
          {
            slug: "comece-pela-sua-rede-quente",
            title: "Comece pela sua rede quente",
            description:
              "Lista das 20 pessoas, abordagem de conhecidos, contatos próximos e visitas presenciais.",
            pandaVideoExternalId: "064235e5-d4d9-4a36-8ae4-5740607b0fd6",
            sortOrder: 0,
          },
          {
            slug: "voce-e-empresa-e-rede-quente",
            title: "Você é uma empresa e a rede quente",
            description:
              "Pensar como empresa e abordar conhecidos. Versão ainda misturada; entra no preview até a edição separar.",
            pandaVideoExternalId: "81ef2f5a-d0cb-4f01-b6fe-5e4babe770da",
            sortOrder: 1,
          },
          {
            slug: "como-vencer-a-vergonha-de-abordar",
            title: "Como vencer a vergonha de abordar",
            description:
              "Destravar a abordagem: o que trava, como começar e como manter o ritmo sem se sabotar.",
            pandaVideoExternalId: "a4032d95-cd09-4bc0-9f99-f049b7cff863",
            sortOrder: 2,
          },
          {
            slug: "outras-formas-de-encontrar-clientes",
            title: "Outras formas de encontrar clientes",
            description:
              "Outras formas de prospecção de leads para aumentar as chances de fechar negócios.",
            pandaVideoExternalId: "2d5df20c-a3d3-4e3c-943d-f2fed48f4e5e",
            sortOrder: 3,
          },
        ],
      },
      {
        slug: "fase-1-m04-abordagem-e-amostra",
        title: "Aborde e mande a amostra",
        description:
          "Abordagem que gera resposta, a amostra que abre a porta, publicação e o cliente que já tem site.\n\nEntregável: uma amostra publicada + abordagens enviadas.",
        sortOrder: 3,
        lessons: [
          {
            slug: "a-abordagem-que-gera-resposta",
            title: "A abordagem que gera resposta",
            description:
              "Scripts por origem do lead, follow-up, o que fazer quando o cliente responde, lead frio que some e uso de áudio.",
            pandaVideoExternalId: "e3f3c9e8-131e-4044-b409-804ec7ebd1b1",
            sortOrder: 0,
          },
          {
            slug: "nicho-promissor-e-amostra",
            title: "Nicho promissor e amostra",
            description:
              "Nicho e amostra no mesmo vídeo. Versão ainda misturada; entra no preview até a edição separar.",
            pandaVideoExternalId: "90d76d32-0ac4-4b18-8307-4e0337b3ad04",
            sortOrder: 1,
          },
          {
            slug: "a-amostra-que-abre-a-porta",
            title: "A amostra que abre a porta",
            description:
              "Montagem ao vivo: template → Claude Code/Cursor → adaptação → construção da amostra. Aula principal da formação.",
            pandaVideoExternalId: "bc505027-7127-43b1-a2a4-32b5f6616a93",
            sortOrder: 2,
          },
        ],
      },
      {
        slug: "fase-1-m05-feche-seguro",
        title: "Feche seguro — o lado empresa",
        description:
          "Contrato, sinal, precificação, briefing e início do projeto. Marco da fase: primeiro cliente fechado.\n\nEntregável: proposta enviada + contrato assinado + sinal recebido.",
        sortOrder: 4,
        lessons: [
          {
            slug: "contrato-sinal-e-protecao",
            title: "Contrato, sinal e proteção contra calote",
            description:
              "Contrato, sinal, proteção e quando começar o projeto. Conferir se a régua de preços no vídeo é a versão atual aprovada.",
            pandaVideoExternalId: "72eec156-0ace-459b-8884-42ed176f7c04",
            sortOrder: 0,
          },
          {
            slug: "orion-scripts-e-contratos",
            title: "Orion, scripts e contratos",
            description:
              "Acesso free do Orion, scripts de abordagem e contratos no mesmo vídeo. Versão ainda misturada; entra no preview até a edição separar.",
            pandaVideoExternalId: "9b3bb1df-23e7-48c4-8b00-87d6f0272962",
            sortOrder: 1,
          },
        ],
      },
    ],
  },
  {
    slug: "fase-2-entregar-e-ligar-a-recorrencia",
    title: "FASE 2 — Entregar e ligar a recorrência",
    description:
      "Entregar o site, o agente e transformar a entrega em mensalidade. Marco: cliente entregue + receita recorrente.",
    coverImageUrl: "/2-entregar-recorrencia.png",
    sortOrder: 1,
    lessons: [],
    children: [
      {
        slug: "fase-2-m06-entregue-o-site",
        title: "Entregue o site",
        description:
          "Do template ao site profissional, direção visual, portfólio que vende, deploy e domínio.\n\nEntregável: site do cliente publicado + portfólio atualizado.",
        sortOrder: 0,
        lessons: [
          {
            slug: "deploy-e-dominio-do-cliente",
            title: "Deploy e domínio do cliente",
            description:
              "Hospedagem, deploy, domínio e configuração final para o site do cliente ficar no ar.",
            pandaVideoExternalId: "1ae8faad-69b6-4c4a-8403-8369b70e562c",
            sortOrder: 0,
          },
          {
            slug: "portfolio-e-design-de-sites",
            title: "Portfólio e design de sites",
            description:
              "Portfólio que vende e direção visual no mesmo vídeo. Versão ainda misturada; entra no preview até a edição separar.",
            pandaVideoExternalId: "f15e397e-494f-4e11-89e5-64323056b8a7",
            sortOrder: 1,
          },
        ],
      },
      {
        slug: "fase-2-m07-entregue-o-agente",
        title: "Entregue o agente",
        description:
          "Os quatro tipos de agente, cérebro no GPT Maker, agendamento, webhook e WhatsApp.\n\nEntregável: agente funcionando no WhatsApp real do cliente, agendando e registrando.",
        sortOrder: 1,
        lessons: [
          {
            slug: "preview-gpt-maker",
            title: "Preview do GPT Maker",
            description:
              "Primeiro contato com o GPT Maker: o que a ferramenta faz e como o preview se encaixa na entrega do agente.",
            pandaVideoExternalId: "71c3ebc6-1967-41ed-8bef-ce90970dec7d",
            sortOrder: 0,
          },
          {
            slug: "os-agentes-que-voce-pode-vender",
            title: "Os agentes que você pode vender",
            description:
              "Os quatro tipos de agentes, o preview da ferramenta e o conceito do agente que nunca inventa.",
            pandaVideoExternalId: "47e8cbfe-a39c-4966-a53e-9dfc63d948c4",
            sortOrder: 1,
          },
          {
            slug: "intencoes-webhook-e-integracoes",
            title: "Intenções, webhook e integrações",
            description:
              "Conexões, intenções, webhook, n8n e integração com outros sistemas.",
            pandaVideoExternalId: "39f2a157-5e54-4c30-9ad1-e3edb1c5a87f",
            sortOrder: 2,
          },
          {
            slug: "o-cerebro-do-agente",
            title: "O cérebro do agente",
            description:
              "Descrição, instruções, base de conhecimento, FAQ e configuração no GPT Maker.",
            pandaVideoExternalId: "c60fc57f-ad32-415c-bf65-4f03dfe12e8a",
            sortOrder: 3,
          },
          {
            slug: "o-agente-que-agenda-sozinho",
            title: "O agente que agenda sozinho",
            description:
              "Aula principal de construção: configuração, Google Calendar, agendamento e testes.",
            pandaVideoExternalId: "7ef01cc5-d34b-4fa6-ab20-7961303c9a35",
            sortOrder: 4,
          },
        ],
      },
      {
        slug: "fase-2-m08-ligue-a-recorrencia",
        title: "Ligue a recorrência",
        description:
          "Transformar a entrega em mensalidade, parceria e as travas que quebram a entrega.\n\nEntregável: primeira mensalidade/recorrência assinada.",
        sortOrder: 2,
        lessons: [],
      },
    ],
  },
  {
    slug: "formacao-ia-e-automacoes",
    title: "Formação IA e Automações",
    description:
      "Produto-base da comunidade: criação de software com IA aplicada e automações com n8n.",
    coverImageUrl: "/3-ia-automacoes.png",
    sortOrder: 10,
    lessons: [],
    children: [
  {
    slug: "automacoes-n8n",
    title: "Automações com n8n",
    description:
      "Do zero ao primeiro agente: n8n, workflows, webhooks e automações práticas para o dia a dia de quem constrói produto.",
    coverImageUrl: "/thumb-automacoes-n8n.png",
    sortOrder: 1,
    lessons: [],
    children: [
      {
        slug: "automacoes-n8n-introducao",
        title: "Introdução ao n8n",
        description:
          "O que são automações, conta, dashboard, primeiro workflow e hospedagem.",
        sortOrder: 0,
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
            slug: "hospedagem-na-hostinger",
            title: "Hospedando o n8n na Hostinger",
            description:
              "Subir o n8n em um VPS da Hostinger para rodar 24 horas.",
            pandaVideoExternalId: "fb2968ed-72e1-451f-bc4a-d96549010402",
            sortOrder: 3,
          },
        ],
      },
      {
        slug: "automacoes-n8n-banco-integracoes",
        title: "Banco de integrações n8n",
        description:
          "Autenticar o n8n em APIs e no Google: Gemini, OpenAI e OAuth.",
        sortOrder: 1,
        lessons: [
          {
            slug: "introducao-banco-de-integracoes",
            title: "Introdução ao banco de integrações",
            description:
              "Como conectar o n8n a qualquer ferramenta usando chaves de API.",
            pandaVideoExternalId: "854a8330-68a8-4d87-b311-baf3e3f5d77d",
            sortOrder: 0,
          },
          {
            slug: "chave-api-gemini",
            title: "Pegando chave API do Gemini",
            description:
              "Gerar uma API Key do Gemini no Google AI Studio para usar no n8n.",
            pandaVideoExternalId: "ccb8139c-c885-4119-944a-1450767f0ece",
            sortOrder: 1,
          },
          {
            slug: "chave-api-openai",
            title: "Pegando chave API do ChatGPT",
            description:
              "Criar e configurar uma API Key da OpenAI para os fluxos no n8n.",
            pandaVideoExternalId: "10a5633e-1320-42dc-9dfc-5ff98ac1a34f",
            sortOrder: 2,
          },
          {
            slug: "credencial-ferramentas-google",
            title: "Se conectando com qualquer ferramenta do Google",
            description:
              "OAuth 2.0 no Google Cloud: Client ID e Client Secret para o n8n.",
            pandaVideoExternalId: "ca5191c0-8d03-4935-a11c-0ad0535e7abf",
            sortOrder: 3,
          },
        ],
      },
      {
        slug: "automacoes-n8n-fundamentos",
        title: "Fundamentos n8n",
        description:
          "Triggers, formulários, nós de fluxo, webhooks e HTTP requests.",
        sortOrder: 2,
        lessons: [
          {
            slug: "triggers",
            title: "Triggers",
            description:
              "O que dispara um fluxo: tipos de trigger e quando usar cada um.",
            pandaVideoExternalId: "78401961-25d6-4ea9-9d0a-05a7a7b20e82",
            sortOrder: 0,
          },
          {
            slug: "formularios",
            title: "Formulários",
            description:
              "Capturar dados com forms e ligar o envio a um workflow.",
            pandaVideoExternalId: "26296c12-94bd-4629-9c07-25db6ae77682",
            sortOrder: 1,
          },
          {
            slug: "edit-fields-e-if",
            title: "Nós que modificam o fluxo: Edit Fields e IF",
            description:
              "Transformar dados no meio do caminho e ramificar com condições.",
            pandaVideoExternalId: "3197e94c-d989-4b77-b567-3d642749650c",
            sortOrder: 2,
          },
          {
            slug: "filter-e-switch",
            title: "Nós que modificam o fluxo: Filter e Switch",
            description:
              "Filtrar itens e escolher caminhos diferentes com Switch.",
            pandaVideoExternalId: "ee01fac3-1b2b-4376-9f34-6eb38e478079",
            sortOrder: 3,
          },
          {
            slug: "http-requests-e-webhook",
            title: "HTTP Requests e Webhook",
            description:
              "Integrar APIs externas e receber eventos via webhook.",
            pandaVideoExternalId: "a0df3c8d-0ade-43c3-9b11-4d70d9b46783",
            sortOrder: 4,
          },
        ],
      },
      {
        slug: "automacoes-n8n-agentes",
        title: "Criação de agentes",
        description:
          "Agentes práticos no n8n: planilha de conteúdos e gestor financeiro.",
        sortOrder: 3,
        lessons: [
          {
            slug: "agente-planejador-de-conteudos",
            title: "Agente planejador de conteúdos com Google Sheets",
            description:
              "Montar um agente que planeja conteúdos e registra tudo em planilha.",
            pandaVideoExternalId: "15a0cfd5-b96e-4e74-aa56-4d85651fdd01",
            sortOrder: 0,
          },
          {
            slug: "agente-gestor-financeiro",
            title: "Agente gestor financeiro",
            description:
              "Um agente para organizar e acompanhar o financeiro no n8n.",
            pandaVideoExternalId: "a25a8637-6398-4b19-8a4c-dccc88d51fd1",
            sortOrder: 1,
          },
        ],
      },
      {
        slug: "automacoes-n8n-ia",
        title: "Criando automações com IA",
        description:
          "Gerar fluxos no n8n com Skills, Build AI e MCP, em vez de montar tudo na mão.",
        sortOrder: 4,
        lessons: [
          {
            slug: "criando-automacoes-com-skills",
            title: "Criando automações com Skills no n8n",
            description:
              "Usar skills de IA na IDE para gerar automações completas no n8n.",
            pandaVideoExternalId: "7f6c8cda-c255-478c-ab93-6073f78cfa52",
            sortOrder: 0,
          },
          {
            slug: "criando-automacoes-com-buildai",
            title: "Criando automações com o Build AI do n8n",
            description:
              "Descrever o fluxo em texto e deixar o Build AI montar a estrutura inicial.",
            pandaVideoExternalId: "0b23a857-eaa0-4461-8a7b-05671cb972a6",
            sortOrder: 1,
          },
          {
            slug: "mcp-do-n8n",
            title: "MCP do n8n",
            description:
              "Conectar a IA ao n8n via MCP para criar workflows direto na plataforma.",
            pandaVideoExternalId: "3df259cc-1571-4d98-b1c3-db4da6f3352f",
            sortOrder: 2,
          },
        ],
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
            title: "Introdução",
            description:
              "Abertura da formação: o que você vai construir e por quê.",
            pandaVideoExternalId: "21b476aa-228f-4054-bc23-9b32c9a92ffa",
            sortOrder: 0,
          },
          {
            slug: "aula-2-formacao-e-surgimento-da-ia",
            title: "A formação e o surgimento da IA",
            description:
              "Como a IA evoluiu e o recorte que usamos nesta formação.",
            pandaVideoExternalId: "41f76650-3775-4b69-98ee-ddb4e4c9d8dd",
            sortOrder: 1,
          },
          {
            slug: "aula-3-ia-pra-quem-nao-quer-ser-programador",
            title: "IA pra quem não quer ser programador",
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
            title: "Como as LLMs pensam",
            description:
              "Intuição prática de como um modelo de linguagem gera respostas.",
            pandaVideoExternalId: "e8ea3434-2e9a-4547-84ba-da2490caa2fe",
            sortOrder: 0,
          },
          {
            slug: "aula-6-configuracoes",
            title: "Configurações",
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
            title: "Prompts",
            description:
              "Estrutura de um bom prompt e padrões que se repetem no dia a dia.",
            pandaVideoExternalId: "cb34660e-776c-45b7-ac5c-4c98b3d6d8ae",
            sortOrder: 0,
          },
          {
            slug: "aula-10-few-shot",
            title: "Mão na massa: few-shot",
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
            title: "O que é RAG",
            description:
              "Retrieval-Augmented Generation: por que o modelo precisa da sua base.",
            pandaVideoExternalId: "25c49ffe-2f76-404d-b4d1-f8d88d21dad4",
            sortOrder: 0,
          },
          {
            slug: "aula-14-embeddings",
            title: "Embeddings",
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
            title: "Projeto Doc Pilot",
            description:
              "Visão do produto final e o recorte que vamos construir.",
            pandaVideoExternalId: "abd536ee-6b16-43e7-94a0-59a945e84c14",
            sortOrder: 0,
          },
          {
            slug: "aula-28-projeto-doc-pilot-continuacao",
            title: "Projeto Doc Pilot (continuação)",
            description:
              "Seguindo a construção do Doc Pilot passo a passo.",
            pandaVideoExternalId: "9bee1e55-6e05-408b-a8ba-4dda0eb97131",
            sortOrder: 1,
          },
          {
            slug: "aula-29-design-e-configs-iniciais",
            title: "Design e configs iniciais",
            description:
              "Base visual e configurações iniciais do produto.",
            pandaVideoExternalId: "97293066-3696-4d60-a9b1-783e0c059e54",
            sortOrder: 2,
          },
          {
            slug: "aula-30-integrando-o-design",
            title: "Integrando o design",
            description:
              "Encaixar o layout no fluxo da aplicação.",
            pandaVideoExternalId: "723cea46-09b5-48ac-97ff-f7fa963086ee",
            sortOrder: 3,
          },
          {
            slug: "aula-31-configs-extra-openai",
            title: "Configs extra da OpenAI",
            description:
              "Ajustes extras da API da OpenAI no projeto.",
            pandaVideoExternalId: "70a5c758-2b14-45fb-8d9e-ee1ffddcc61f",
            sortOrder: 4,
          },
          {
            slug: "aula-32-salvar-vetores-no-banco",
            title: "Salvar vetores no banco",
            description:
              "Persistir embeddings para busca no produto.",
            pandaVideoExternalId: "f9eed381-10ec-4272-9c24-2e57f32ad4f1",
            sortOrder: 5,
          },
          {
            slug: "aula-33-enviar-mensagem-pelo-chat",
            title: "Enviar mensagem pelo chat",
            description:
              "O fluxo de envio e resposta no chat do Doc Pilot.",
            pandaVideoExternalId: "028d05a1-01b8-4b45-8539-2bbe7d023226",
            sortOrder: 6,
          },
          {
            slug: "aula-34-upload-de-arquivos",
            title: "Upload de arquivos",
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
  {
    slug: "fundamentos-do-builder-profissional",
    title: "Fundamentos do Builder Profissional",
    description:
      "A base para operar como profissional: CNPJ, precificação, contrato, hospedagem, domínio e os primeiros clientes.",
    coverImageUrl: "/4-fundamentos-builder.png",
    sortOrder: 11,
    lessons: [
      {
        slug: "preciso-de-cnpj",
        title: "Preciso de CNPJ",
        pandaVideoExternalId: "104830ff-8575-44a3-bd28-d573a440d2d9",
        sortOrder: 0,
      },
      {
        slug: "como-hospedar-sites",
        title: "Como hospedar sites",
        pandaVideoExternalId: "89e09ea9-46d4-4eae-81da-20499d2a2890",
        sortOrder: 1,
      },
      {
        slug: "precificacao",
        title: "Precificação",
        pandaVideoExternalId: "5c0dcc0a-0513-4ed3-9c62-699823f2e923",
        sortOrder: 2,
      },
      {
        slug: "como-criar-um-contrato-a-prova-de-calotes",
        title: "Como criar um contrato à prova de calotes",
        pandaVideoExternalId: "7b802256-c438-40ef-aab0-eec2425e4906",
        sortOrder: 3,
      },
      {
        slug: "a-maneira-certeira-para-conseguir-os-primeiros-clientes",
        title: "A maneira certeira para conseguir os primeiros clientes",
        pandaVideoExternalId: "66673913-95c7-4cf2-ad68-c85dcd19f225",
        sortOrder: 4,
      },
      {
        slug: "criacao-de-dominios",
        title: "Criação de domínios",
        pandaVideoExternalId: "96e49ff2-8901-4d58-8ef6-c4d1b269f5e8",
        sortOrder: 5,
      },
      {
        slug: "lista-de-templates",
        title: "Lista de templates",
        sortOrder: 6,
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
          ...(seed.description ? { description: seed.description } : {}),
          coverImageUrl: seed.coverImageUrl ?? undefined,
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
    const byVideo = lesson.pandaVideoExternalId
      ? await prisma.lesson.findFirst({
          where: { pandaVideoExternalId: lesson.pandaVideoExternalId },
        })
      : null;
    const bySlug = await prisma.lesson.findUnique({
      where: { moduleId_slug: { moduleId: module.id, slug: lesson.slug } },
    });
    const found = byVideo ?? bySlug;
    const lessonData = {
      title: lesson.title,
      pandaVideoExternalId: lesson.pandaVideoExternalId ?? null,
      pandaLibraryId: lesson.pandaVideoExternalId ? PANDA_LIBRARY : null,
      thumbnailUrl: lesson.pandaVideoExternalId
        ? thumb(lesson.pandaVideoExternalId)
        : null,
      moduleId: module.id,
      slug: lesson.slug,
      ...(lesson.description ? { description: lesson.description } : {}),
      ...(seed.forceLessonSort ? { sortOrder: lesson.sortOrder } : {}),
    };
    if (found) {
      await prisma.lesson.update({
        where: { id: found.id },
        data: lessonData,
      });
    } else {
      await prisma.lesson.create({
        data: {
          ...lessonData,
          sortOrder: lesson.sortOrder,
          description: lesson.description || null,
          published: module.published,
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
