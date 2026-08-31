/**
 * F070 — o corpo do Presente termina no assunto; o CTA final é do app.
 *
 * O bloco de promessa e o formulário de cadastro variam por sessão
 * (`presente-promessa.tsx`): completo para quem está deslogada, compacto
 * para o free, nada para quem já é pago. Um CTA escrito dentro do markdown
 * não varia — ele pede cadastro a quem já tem conta e vende a quem já
 * comprou. Por isso o corpo não pode carregar CTA.
 *
 * Este módulo é puro: sem Prisma, sem Next, sem `process.env`. Roda no
 * servidor (gate de gravação), no cliente (aviso no composer) e no script
 * de auditoria.
 */
import {
  PRICING_ELITE,
  PRICING_PRO,
  PROMESSA_PRIMEIRO_CLIENTE,
} from "@/lib/membership/checkout";

export type RegraCta =
  | "link-conversao"
  | "checkout"
  | "preco-do-produto"
  | "promessa-do-produto"
  | "pedido-de-cadastro";

export type AchadoCta = {
  regra: RegraCta;
  /** O que casou, como está escrito no corpo. */
  trecho: string;
  /** Frase curta para a admin saber o que fazer. */
  motivo: string;
};

/** Caminhos de conversão do próprio Club. */
const CAMINHOS_CONVERSAO = ["planos", "cadastro", "login"] as const;

/** Hosts de checkout — não há uso legítimo deles dentro de um artigo. */
const HOSTS_CHECKOUT = ["hub.la", "tmb.com.br"] as const;

/** Hosts do Club: caminho de conversão neles é link de conversão. */
const HOSTS_DO_CLUB = [
  "comunidade-builders-club.devemdobro.com",
  "builders-club.devemdobro.com",
] as const;

const MOTIVO: Record<RegraCta, string> = {
  "link-conversao":
    "Apontar para planos/cadastro é trabalho do bloco do app, que sabe se a leitora está logada.",
  checkout:
    "Link de checkout no corpo vende para quem já comprou e some com a atribuição de origem.",
  "preco-do-produto":
    "Preço tem uma fonte só: checkout.ts. Escrito no texto, envelhece em todos os Presentes de uma vez.",
  "promessa-do-produto":
    "A promessa é PROMESSA_PRIMEIRO_CLIENTE, renderizada pelo bloco do app.",
  "pedido-de-cadastro":
    "Pedido de cadastro só vale para quem está deslogada — e quem decide isso é o app. Se a frase é sobre outra ferramenta, reescreva em terceira pessoa.",
};

/**
 * Dobra acentos e caixa trocando 1 caractere por 1 — o índice do match
 * continua valendo no texto original, que é o que a admin lê. Espaço fino e
 * nbsp ficam como estão: `\s` nos padrões já os cobre.
 */
const ACENTOS: Record<string, string> = {
  á: "a", à: "a", â: "a", ã: "a", ä: "a",
  é: "e", è: "e", ê: "e", ë: "e",
  í: "i", ì: "i", î: "i", ï: "i",
  ó: "o", ò: "o", ô: "o", õ: "o", ö: "o",
  ú: "u", ù: "u", û: "u", ü: "u",
  ç: "c", ñ: "n", º: "o", ª: "a",
};

const ACENTUADOS = /[à-üªº]/g;

function normalizar(texto: string): string {
  return texto.toLowerCase().replace(ACENTUADOS, (c) => ACENTOS[c] ?? c);
}

/** Contexto legível em volta do match, para achar o trecho no texto. */
function trechoEmVolta(original: string, inicio: number, fim: number): string {
  const de = Math.max(0, inicio - 30);
  const ate = Math.min(original.length, fim + 30);
  const corpo = original.slice(de, ate).replace(/\s+/g, " ").trim();
  return `${de > 0 ? "…" : ""}${corpo}${ate < original.length ? "…" : ""}`;
}

/** Transforma um literal em regex tolerante a espaço variável. */
function comoRegex(literal: string, sufixo = ""): RegExp {
  const partes = literal
    .trim()
    .split(/\s+/)
    .map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  return new RegExp(partes.join("\\s*") + sufixo, "g");
}

function hostCasa(host: string, alvo: string): boolean {
  return host === alvo || host.endsWith(`.${alvo}`);
}

const URL_ABSOLUTA = /https?:\/\/[^\s)\]<>"'`]+/gi;

const PEDIDOS: RegExp[] = [
  /\bcri[ea]\s+(?:sua|uma)\s+conta\b/g,
  /\bcriar\s+conta\s+gratis\b/g,
  /\bcadastre\s*-?\s*se\b/g,
  /\bfaca\s+(?:o\s+)?seu\s+cadastro\b/g,
  /\bassine\s+o\s+(?:pro|elite)\b/g,
  /\bentre\s+(?:no|para\s+o)\s+club\b/g,
  /\bvem\s+(?:pro|para\s+o)\s+club\b/g,
  /\bgaranta\s+sua\s+vaga\b/g,
];

function precosDoProduto(): string[] {
  const todos = [
    PRICING_PRO.installmentPrice,
    PRICING_PRO.fullPrice,
    PRICING_PRO.boletoPrice,
    PRICING_ELITE.installmentPrice,
    PRICING_ELITE.fullPrice,
    PRICING_ELITE.boletoPrice,
  ];
  return [...new Set(todos.filter((v): v is string => Boolean(v)))];
}

/**
 * Devolve tudo que, no corpo, é CTA do produto. Lista vazia = corpo limpo.
 */
export function detectarCtaNoCorpo(body: string): AchadoCta[] {
  const original = body ?? "";
  if (!original.trim()) return [];

  const achados: AchadoCta[] = [];
  const faixas = new Map<RegraCta, [number, number][]>();

  function registrar(regra: RegraCta, inicio: number, fim: number) {
    const jaVistas = faixas.get(regra) ?? [];
    // Um mesmo trecho pode casar por dois padrões da mesma regra (a promessa
    // inteira e a variante solta dentro dela). Reportar uma vez só.
    if (jaVistas.some(([a, b]) => inicio < b && fim > a)) return;
    jaVistas.push([inicio, fim]);
    faixas.set(regra, jaVistas);
    achados.push({
      regra,
      trecho: trechoEmVolta(original, inicio, fim),
      motivo: MOTIVO[regra],
    });
  }

  // 1. URLs absolutas: decididas pelo host, nunca pelo texto do caminho.
  //    Depois são mascaradas, para a varredura de caminho relativo não
  //    confundir `https://outro.com/planos` com um link nosso.
  const mascarado = original.split("");
  for (const m of original.matchAll(URL_ABSOLUTA)) {
    const bruta = m[0].replace(/[.,;:!?]+$/, "");
    const inicio = m.index ?? 0;
    const fim = inicio + bruta.length;
    let host = "";
    let caminho = "";
    try {
      const u = new URL(bruta);
      host = u.hostname.toLowerCase();
      caminho = u.pathname.toLowerCase();
    } catch {
      host = "";
    }
    if (host && HOSTS_CHECKOUT.some((h) => hostCasa(host, h))) {
      registrar("checkout", inicio, fim);
    } else if (
      host &&
      HOSTS_DO_CLUB.some((h) => hostCasa(host, h)) &&
      CAMINHOS_CONVERSAO.some(
        (c) => caminho === `/${c}` || caminho.startsWith(`/${c}/`),
      )
    ) {
      registrar("link-conversao", inicio, fim);
    }
    for (let i = inicio; i < fim && i < mascarado.length; i++) {
      mascarado[i] = " ";
    }
  }

  const normalizado = normalizar(mascarado.join(""));

  // 2. Caminho relativo do próprio app: /planos, /cadastro, /login.
  const relativo = new RegExp(
    `/(?:${CAMINHOS_CONVERSAO.join("|")})(?![a-z0-9-])`,
    "g",
  );
  for (const m of normalizado.matchAll(relativo)) {
    const inicio = m.index ?? 0;
    registrar("link-conversao", inicio, inicio + m[0].length);
  }

  // 3. Preço do produto — string exata vinda de checkout.ts.
  for (const preco of precosDoProduto()) {
    const re = comoRegex(normalizar(preco), "(?!\\d)");
    for (const m of normalizado.matchAll(re)) {
      const inicio = m.index ?? 0;
      registrar("preco-do-produto", inicio, inicio + m[0].length);
    }
  }

  // 4. Promessa do produto — a string oficial e a variante solta.
  const promessas = [
    comoRegex(normalizar(PROMESSA_PRIMEIRO_CLIENTE)),
    /\bclientes?\s+em\s+90\s+dias\b/g,
  ];
  for (const re of promessas) {
    for (const m of normalizado.matchAll(re)) {
      const inicio = m.index ?? 0;
      registrar("promessa-do-produto", inicio, inicio + m[0].length);
    }
  }

  // 5. Pedido de cadastro — imperativo de 2ª pessoa dirigido à leitora.
  for (const re of PEDIDOS) {
    for (const m of normalizado.matchAll(re)) {
      const inicio = m.index ?? 0;
      registrar("pedido-de-cadastro", inicio, inicio + m[0].length);
    }
  }

  return achados;
}

export function mensagemCtaNoCorpo(achados: AchadoCta[]): string {
  const itens = achados
    .map((a) => `• [${a.regra}] "${a.trecho}" — ${a.motivo}`)
    .join("\n");
  return (
    "O corpo do Presente não pode trazer o CTA final (F070): ele é do app e " +
    "muda conforme a leitora esteja deslogada, free ou paga.\n" +
    itens
  );
}

export class CtaNoCorpoError extends Error {
  readonly achados: AchadoCta[];
  constructor(achados: AchadoCta[]) {
    super(mensagemCtaNoCorpo(achados));
    this.name = "CtaNoCorpoError";
    this.achados = achados;
  }
}

/** Gate de gravação. Lança se o corpo carregar CTA. */
export function assertSemCtaNoCorpo(body: string): void {
  const achados = detectarCtaNoCorpo(body);
  if (achados.length) throw new CtaNoCorpoError(achados);
}
