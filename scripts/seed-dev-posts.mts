/**
 * Popula o banco de DEV LOCAL com posts, comentários e reações de exemplo.
 *
 *   npm run db:seed:dev-posts
 *
 * Serve para avaliar a listagem e a página de leitura com conteúdo real:
 * post longo com markdown, post curto, post com imagem, post com link.
 *
 * Recusa rodar fora de 127.0.0.1/localhost — é dado fake, nunca vai para HML
 * ou produção. Idempotente: apaga e recria os posts que ele mesmo criou.
 */
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";

config({ path: ".env" });
config({ path: ".env.local", override: true });

const url = process.env.DATABASE_URL ?? "";
if (!/@(127\.0\.0\.1|localhost)[:/]/.test(url)) {
  console.error(
    "Recusado: DATABASE_URL não aponta para banco local.\n" +
      "Este seed cria dados fake e só roda em 127.0.0.1/localhost.",
  );
  process.exit(1);
}

const prisma = new PrismaClient();

/** Marcador para o seed reconhecer o que é dele e poder rodar de novo. */
const SEED_TAG = "dev-seed";

const AUTORES = [
  {
    id: "devseed-ana",
    email: "ana.devseed@localhost",
    name: "Ana Ribeiro",
    displayName: "Ana Ribeiro",
    bio: "Front-end em transição de carreira. Primeiro freela fechado em julho.",
  },
  {
    id: "devseed-bruno",
    email: "bruno.devseed@localhost",
    name: "Bruno Tavares",
    displayName: "Bruno Tavares",
    bio: "Back-end Node. Construindo um SaaS de agendamento.",
  },
  {
    id: "devseed-carla",
    email: "carla.devseed@localhost",
    name: "Carla Menezes",
    displayName: "Carla Menezes",
    bio: "Designer que aprendeu a codar pra parar de depender de dev.",
  },
  {
    id: "devseed-diego",
    email: "diego.devseed@localhost",
    name: "Diego Nunes",
    displayName: "Diego Nunes",
    bio: "Estudando full-stack há 8 meses. Documentando tudo.",
  },
];

type PostSeed = {
  space: string;
  autor: string;
  title: string;
  body: string;
  imageUrl?: string;
  linkUrl?: string;
  diasAtras: number;
  reacoes: number;
  leituras: number;
  comentarios?: { autor: string; body: string; respostas?: string[] }[];
};

const POSTS: PostSeed[] = [
  {
    space: "conquistas",
    autor: "devseed-ana",
    title: "Fechei meu primeiro freela de R$ 2.400 e quase estraguei tudo na proposta",
    diasAtras: 1,
    reacoes: 34,
    leituras: 187,
    body: `Levei quatro meses estudando antes de mandar a primeira proposta. Achei que o problema seria técnico. Não foi.

O cliente é uma clínica de fisioterapia aqui do bairro. A dona me achou por indicação de uma amiga, mandou mensagem perguntando quanto eu cobrava para "fazer um site". Respondi com um número. Ela sumiu por três dias.

## O erro que quase matou o negócio

Mandei o preço antes de entender o que ela precisava. Isso transformou a conversa num leilão: ela comparou meu número com o de mais dois orçamentos e o único critério virou quem era mais barato.

O que eu deveria ter feito, e fiz na segunda tentativa:

- Perguntar o que ela esperava que o site resolvesse
- Perguntar quantos pacientes novos ela recebe por mês hoje
- Perguntar de onde vêm esses pacientes hoje
- **Só então** falar de escopo, e por último de preço

Quando ela disse que recebe uns 6 pacientes novos por mês e que cada um vale em média R$ 800 no ciclo de tratamento, o site deixou de ser um custo e virou uma conta.

## Como eu retomei

Mandei uma mensagem assumindo o erro:

> "Te passei um preço sem entender direito o que você precisa. Me dá 15 minutos numa call que eu te mostro duas opções de escopo, aí você decide."

Ela topou. Na call desenhei duas versões: uma página só com agendamento via WhatsApp, e uma com página institucional, blog e integração com o sistema de agendamento que ela já usa.

Fechou a segunda. R$ 2.400, 50% na assinatura.

## O que eu levo daqui

O código foi a parte fácil. Next.js, Tailwind, um formulário que dispara no WhatsApp. Três dias de trabalho.

O que eu não sabia fazer era conduzir a conversa. E ninguém ensina isso num curso de React.

Se você está travado esperando "saber o suficiente" para cobrar: você provavelmente já sabe. O que falta é entender o problema de quem paga.`,
    comentarios: [
      {
        autor: "devseed-bruno",
        body: "A parte de perguntar quantos clientes novos ela recebe por mês é ouro. Roubei pra minha próxima call.",
        respostas: [
          "Rouba mesmo! Foi o que virou a chave aqui.",
        ],
      },
      {
        autor: "devseed-carla",
        body: "Assumir o erro na mensagem foi corajoso. Muita gente teria só sumido junto.",
      },
      {
        autor: "devseed-diego",
        body: "Quanto tempo levou entre a primeira mensagem dela e a assinatura?",
        respostas: ["Onze dias no total, sendo três deles de silêncio depois que eu vacilei no preço."],
      },
    ],
  },
  {
    space: "duvidas",
    autor: "devseed-diego",
    title: "Server Action ou Route Handler? Estou usando os dois e acho que errado",
    diasAtras: 2,
    reacoes: 12,
    leituras: 94,
    body: `Estou num projeto Next 15 e me perdi na hora de decidir onde colocar cada coisa.

Hoje eu tenho:

- Um \`POST /api/upload\` como Route Handler, porque recebe \`FormData\` com arquivo
- Um \`criarPostAction\` como Server Action, chamado direto do formulário
- E um \`GET /api/nav\` que existe só porque eu não sabia como buscar dados no cliente

O terceiro me cheira mal. Alguém consegue explicar a regra prática?

Minha dúvida específica: se a Server Action já roda no servidor e tem acesso ao banco, por que eu precisaria de um Route Handler pra qualquer coisa?

\`\`\`ts
export async function criarPostAction(fd: FormData) {
  "use server";
  const body = String(fd.get("body") ?? "");
  await prisma.post.create({ data: { body, authorId } });
  revalidatePath("/");
}
\`\`\`

Isso não cobre 90% dos casos?`,
    comentarios: [
      {
        autor: "devseed-bruno",
        body: "Regra que eu uso: Server Action pra mutação vinda de um formulário da minha própria app. Route Handler quando alguém de fora precisa chamar (webhook, app mobile) ou quando você precisa de streaming/resposta customizada.",
        respostas: [
          "Isso responde. O /api/nav então tá errado mesmo, é só a minha app chamando.",
          "Exato. Provavelmente dá pra virar um Server Component buscando direto.",
        ],
      },
      {
        autor: "devseed-ana",
        body: "Upload como Route Handler faz sentido porque você quer controle sobre o streaming do arquivo. Esse eu deixaria.",
      },
    ],
  },
  {
    space: "projetos",
    autor: "devseed-bruno",
    title: "Desafio 7 dias: landing pra barbearia do meu primo — dia 3",
    diasAtras: 2,
    reacoes: 19,
    leituras: 76,
    imageUrl:
      "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200&q=70",
    body: `Peguei o desafio na segunda. Estou no dia 3 e já mudei o escopo duas vezes.

O que estava previsto pro dia 1 ao 3:

- Estrutura da página
- Seção de serviços com preço
- Botão de agendamento no WhatsApp

O que aconteceu de verdade: passei o dia 1 inteiro decidindo paleta de cor. Perdi um dia num problema que não era problema.

Dia 2 e 3 rendendo: página no ar, serviços listados, WhatsApp funcionando com mensagem pré-preenchida por serviço.

O detalhe que fez diferença foi o link do WhatsApp levar o serviço no texto:

\`\`\`
https://wa.me/5511999999999?text=Oi!%20Quero%20agendar%20um%20corte%20degrad%C3%AA
\`\`\`

Meu primo falou que assim ele já sabe o que a pessoa quer antes de responder. Coisa de cinco minutos de código que resolveu um problema real dele.

Amanhã: fotos de verdade no lugar dos placeholders.`,
    comentarios: [
      {
        autor: "devseed-carla",
        body: "O dia perdido em paleta de cor é rito de passagem. Todo mundo faz uma vez.",
      },
    ],
  },
  {
    space: "geral",
    autor: "devseed-carla",
    title: "Parei de decorar comando de git e minha vida melhorou",
    diasAtras: 4,
    reacoes: 41,
    leituras: 212,
    body: `Confissão: durante um ano eu usei git copiando comando de post do Stack Overflow sem entender.

O que destravou foi parar de estudar comandos e estudar **o modelo mental**. Git tem três lugares onde seu código pode estar:

1. O diretório de trabalho — os arquivos que você está editando
2. A staging area — o que você marcou pra entrar no próximo commit
3. O repositório — o histórico de commits

Praticamente todo comando é mover coisa entre esses três lugares.

- \`git add\` — trabalho → staging
- \`git commit\` — staging → repositório
- \`git restore\` — desfaz no diretório de trabalho
- \`git restore --staged\` — tira da staging, mantém a alteração

Quando eu entendi isso, parei de precisar decorar. Se eu sei de onde pra onde eu quero mover, o comando eu descubro.

O que ainda me pega é rebase. Mas aí é outro assunto.`,
    comentarios: [
      {
        autor: "devseed-diego",
        body: "Salvei. Os três lugares explicam por que `git add` existe, coisa que eu nunca tinha entendido.",
      },
      {
        autor: "devseed-ana",
        body: "Rebase pega todo mundo. O que me ajudou foi pensar nele como 'reaplica meus commits em cima de outra base'.",
      },
    ],
  },
  {
    space: "freelas",
    autor: "devseed-ana",
    title: "Indicação: restaurante em Pinheiros precisa de cardápio digital",
    diasAtras: 5,
    reacoes: 8,
    leituras: 63,
    linkUrl: "https://exemplo-restaurante.com.br",
    body: `Cliente da minha irmã. Eles querem tirar o cardápio do PDF e colocar numa página que dê pra atualizar preço sem chamar ninguém.

Escopo pequeno, bom pra quem está no primeiro ou segundo projeto:

- Uma página com as categorias e itens
- Painel simples pra editar preço e disponibilidade
- QR code na mesa apontando pra página

Faixa que eles falaram: R$ 1.200 a R$ 1.800.

Quem tiver interesse me chama no direct que eu apresento.`,
  },
  {
    space: "geral",
    autor: "devseed-diego",
    title: "Alguém mais acha que documentação boa é rara demais?",
    diasAtras: 6,
    reacoes: 15,
    leituras: 88,
    body: `Passei a tarde inteira tentando integrar uma API de pagamento e a documentação só tinha o caminho feliz.

Nenhum exemplo de erro. Nenhuma lista de códigos de retorno. Nenhuma explicação do que acontece quando o webhook falha.

Acabei descobrindo o comportamento por tentativa e erro em sandbox.`,
    comentarios: [
      {
        autor: "devseed-bruno",
        body: "O teste de doc boa pra mim é: tem exemplo de erro? Se não tem, o autor nunca usou a própria API em produção.",
      },
    ],
  },
  {
    space: "conquistas",
    autor: "devseed-carla",
    title: "Primeiro deploy em produção sem quebrar nada",
    diasAtras: 8,
    reacoes: 27,
    leituras: 141,
    body: `Pequeno pra quem já faz isso todo dia. Enorme pra mim.

Subiu na Vercel, domínio próprio apontado, variáveis de ambiente configuradas certo de primeira.

O que me deu segurança foi ter rodado o build local antes. \`npm run build\` pegou dois erros de tipo que o dev não pegava.`,
  },
];

/**
 * F059 — presente com leitura pública em /presentes/<slug>.
 * Sem linkUrl de propósito: assim `giftLinkView` devolve null e a página
 * renderiza título + corpo (o caso de leitura, não o de card de link).
 */
const PRESENTE = {
  slug: "guia-primeiro-freela",
  autor: "devseed-ana",
  title: "O guia que eu queria ter lido antes do meu primeiro freela",
  body: `Escrevi isso depois de fechar três projetos e errar em todos eles de um jeito diferente. É o que eu falaria comigo mesma um ano atrás.

## Antes de falar de preço, entenda a conta do cliente

Todo serviço que você vende resolve um problema que tem valor em dinheiro. Enquanto você não souber qual é esse valor, qualquer preço que você disser vai soar caro.

Três perguntas que mudam a conversa:

- Quantos clientes novos você recebe por mês hoje?
- Quanto vale um cliente novo pra você?
- De onde eles vêm hoje?

Com essas respostas, um site de R$ 2.000 deixa de ser despesa e vira investimento com prazo de retorno.

## Escopo por escrito, sempre

Não precisa de contrato de dez páginas. Precisa de uma lista do que está incluído e de uma linha dizendo o que não está.

O que salvou meu terceiro projeto foi uma frase: **"alterações de layout após a aprovação do design são orçadas à parte."**

## Cobre metade na assinatura

Quem não paga a entrada não paga o final. Aprendi levando calote de R$ 800 num projeto que entreguei inteiro antes de ver a primeira nota.

## O código é a parte fácil

Você vai passar mais tempo alinhando expectativa do que escrevendo componente. Isso não é sinal de que você é um dev ruim — é como o trabalho funciona.

Se você está esperando "saber o suficiente" pra cobrar: provavelmente já sabe. O que falta é aprender a conduzir a conversa.`,
  diasAtras: 3,
};

async function main() {
  console.log("Banco local confirmado. Semeando...\n");

  // 1. Autores fake
  for (const a of AUTORES) {
    await prisma.user.upsert({
      where: { id: a.id },
      create: {
        id: a.id,
        email: a.email,
        name: a.name,
        emailVerified: true,
        updatedAt: new Date(),
      },
      update: {},
    });
    await prisma.profile.upsert({
      where: { userId: a.id },
      create: {
        userId: a.id,
        displayName: a.displayName,
        bio: a.bio,
        welcomeSeenAt: new Date(),
      },
      update: { displayName: a.displayName, bio: a.bio },
    });
    await prisma.membership.upsert({
      where: { userId: a.id },
      create: { userId: a.id, status: "active", tier: "pro", role: "member" },
      update: {},
    });
  }
  console.log(`autores: ${AUTORES.length}`);

  // 2. Limpa o que este seed criou antes (idempotente)
  const antigos = await prisma.post.findMany({
    where: { authorId: { in: AUTORES.map((a) => a.id) } },
    select: { id: true },
  });
  if (antigos.length > 0) {
    await prisma.post.deleteMany({
      where: { id: { in: antigos.map((p) => p.id) } },
    });
    console.log(`posts antigos removidos: ${antigos.length}`);
  }

  // 3. Spaces por slug
  const spaces = await prisma.space.findMany({ select: { id: true, slug: true } });
  const spaceId = new Map(spaces.map((s) => [s.slug, s.id]));

  // Quem vai "ler" os posts (gera PostView e viewCount realista)
  const leitores = await prisma.user.findMany({ select: { id: true } });

  let criados = 0;
  let comentariosCriados = 0;

  for (const p of POSTS) {
    const sid = spaceId.get(p.space);
    if (!sid) {
      console.warn(`space "${p.space}" não existe, pulando "${p.title}"`);
      continue;
    }
    const createdAt = new Date(Date.now() - p.diasAtras * 24 * 60 * 60 * 1000);

    const post = await prisma.post.create({
      data: {
        spaceId: sid,
        authorId: p.autor,
        title: p.title,
        body: p.body,
        imageUrl: p.imageUrl ?? null,
        linkUrl: p.linkUrl ?? null,
        createdAt,
        updatedAt: createdAt,
        viewCount: p.leituras,
        reactionCount: 0,
        commentCount: 0,
      },
    });
    criados += 1;

    // Reações: uma por autor fake disponível (o unique é [userId, postId, type])
    let reacoes = 0;
    for (const a of AUTORES) {
      if (a.id === p.autor) continue;
      if (reacoes >= p.reacoes) break;
      await prisma.reaction.create({
        data: { userId: a.id, postId: post.id, type: "like" },
      });
      reacoes += 1;
    }
    // O contador exibido é o denormalizado — mantém o número "social" do seed.
    await prisma.post.update({
      where: { id: post.id },
      data: { reactionCount: p.reacoes },
    });

    // Views reais (alimenta o denormalizado de forma coerente)
    for (const l of leitores) {
      await prisma.postView.upsert({
        where: { postId_userId: { postId: post.id, userId: l.id } },
        create: { postId: post.id, userId: l.id, createdAt },
        update: {},
      });
    }

    // Comentários e respostas
    let total = 0;
    for (const c of p.comentarios ?? []) {
      const raiz = await prisma.comment.create({
        data: {
          postId: post.id,
          authorId: c.autor,
          body: c.body,
          createdAt: new Date(createdAt.getTime() + 3 * 60 * 60 * 1000),
          updatedAt: createdAt,
        },
      });
      total += 1;
      for (const [i, r] of (c.respostas ?? []).entries()) {
        await prisma.comment.create({
          data: {
            postId: post.id,
            authorId: p.autor,
            parentId: raiz.id,
            body: r,
            createdAt: new Date(
              createdAt.getTime() + (4 + i) * 60 * 60 * 1000,
            ),
            updatedAt: createdAt,
          },
        });
        total += 1;
      }
    }
    if (total > 0) {
      await prisma.post.update({
        where: { id: post.id },
        data: { commentCount: total },
      });
      comentariosCriados += total;
    }
  }

  // Presente público (F059)
  const presentesId = spaceId.get("presentes");
  if (presentesId) {
    const createdAt = new Date(
      Date.now() - PRESENTE.diasAtras * 24 * 60 * 60 * 1000,
    );
    await prisma.post.deleteMany({ where: { slug: PRESENTE.slug } });
    await prisma.post.create({
      data: {
        spaceId: presentesId,
        authorId: PRESENTE.autor,
        title: PRESENTE.title,
        body: PRESENTE.body,
        slug: PRESENTE.slug,
        createdAt,
        updatedAt: createdAt,
      },
    });
    criados += 1;
    console.log(`presente público: /presentes/${PRESENTE.slug}`);
  }

  console.log(`posts: ${criados}`);
  console.log(`comentários: ${comentariosCriados}`);
  console.log(`\ntag: ${SEED_TAG} — rodar de novo apaga e recria`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
