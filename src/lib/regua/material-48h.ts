/**
 * F089 — material e copy do e-mail 48h (próximo Presente, não cobrança).
 * Sem Next / Prisma: o disparo passa a lista de gifts já carregada.
 */

import { NOME_PRODUTO } from "@/lib/produto";
import { PRESENTES_SPACE_SLUG } from "@/lib/spaces/constants";

export type GiftResumo = {
  slug: string;
  title: string;
};

export type Material48h = {
  /** Path no Club (ex.: `/presentes/saga`). */
  path: string;
  titulo: string;
  /** Título do presente de origem, se houver. */
  origemTitulo: string | null;
};

export type Copy48h = {
  subject: string;
  tituloHtml: string;
  texto: string;
  htmlInner: string;
  ctaLabel: string;
};

/** Lista já ordenada como o feed (pinned → createdAt). */
export function escolherMaterial48h(
  gifts: GiftResumo[],
  originGiftSlug: string | null,
): Material48h | null {
  if (gifts.length === 0) return null;

  const origem = originGiftSlug
    ? gifts.find((g) => g.slug === originGiftSlug)
    : undefined;

  const proximo =
    gifts.find((g) => g.slug !== originGiftSlug) ??
    (origem ? null : gifts[0]!);

  if (!proximo) return null;

  return {
    path: `/presentes/${proximo.slug}`,
    titulo: proximo.title.trim() || proximo.slug,
    origemTitulo: origem ? origem.title.trim() || origem.slug : null,
  };
}

export function pathFallbackPresentes(): string {
  return `/spaces/${PRESENTES_SPACE_SLUG}`;
}

function primeiroNome(displayName: string): string {
  const parte = displayName.trim().split(/\s+/)[0];
  return parte || "Builder";
}

/**
 * Três textos:
 * 1. origem + material
 * 2. sem origem + material
 * 3. sem material → space Presentes
 */
export function montarCopy48h(opts: {
  displayName: string;
  materialUrl: string;
  material: Material48h | null;
}): Copy48h {
  const nome = primeiroNome(opts.displayName);
  const ctaLabel = "Abrir o material";

  if (opts.material?.origemTitulo) {
    const subject = `${nome}, o próximo depois do seu presente está aqui`;
    const tituloHtml = "O próximo da sua trilha";
    const corpo = [
      `Olá, ${nome},`,
      ``,
      `Você começou pelo presente "${opts.material.origemTitulo}". O próximo da trilha é este:`,
      ``,
      opts.material.titulo,
      ``,
      opts.materialUrl,
      ``,
      `É o mesmo acervo de Presentes — sem cobrança, só o próximo passo.`,
      ``,
      `— ${NOME_PRODUTO}`,
    ].join("\n");
    return {
      subject,
      tituloHtml,
      texto: corpo,
      ctaLabel,
      htmlInner: `<p style="color:#64748b;font-size:15px;line-height:1.5;">Olá, ${esc(nome)}. Você começou pelo presente <strong style="color:#0f172a;">"${esc(opts.material.origemTitulo)}"</strong>. O próximo da trilha é este:</p>
    <p style="color:#0f172a;font-size:16px;font-weight:600;line-height:1.4;margin:16px 0;">${esc(opts.material.titulo)}</p>
    <p style="margin:24px 0;"><a href="${esc(opts.materialUrl)}" style="display:inline-block;background:#0d9488;color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:600;">${esc(ctaLabel)}</a></p>
    <p style="color:#94a3b8;font-size:13px;line-height:1.45;">É o mesmo acervo de Presentes — sem cobrança, só o próximo passo.</p>`,
    };
  }

  if (opts.material) {
    const subject = `Separei o próximo material da trilha no ${NOME_PRODUTO}`;
    const tituloHtml = "Seu próximo Presente";
    const corpo = [
      `Olá, ${nome},`,
      ``,
      `Separei um material da trilha de Presentes pra você continuar:`,
      ``,
      opts.material.titulo,
      ``,
      opts.materialUrl,
      ``,
      `Sem cobrança — é só o próximo passo.`,
      ``,
      `— ${NOME_PRODUTO}`,
    ].join("\n");
    return {
      subject,
      tituloHtml,
      texto: corpo,
      ctaLabel,
      htmlInner: `<p style="color:#64748b;font-size:15px;line-height:1.5;">Olá, ${esc(nome)}. Separei um material da trilha de Presentes pra você continuar:</p>
    <p style="color:#0f172a;font-size:16px;font-weight:600;line-height:1.4;margin:16px 0;">${esc(opts.material.titulo)}</p>
    <p style="margin:24px 0;"><a href="${esc(opts.materialUrl)}" style="display:inline-block;background:#0d9488;color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:600;">${esc(ctaLabel)}</a></p>
    <p style="color:#94a3b8;font-size:13px;line-height:1.45;">Sem cobrança — é só o próximo passo.</p>`,
    };
  }

  const subject = `Tem mais Presente te esperando no ${NOME_PRODUTO}`;
  const tituloHtml = "Continue na trilha de Presentes";
  const cta = "Ver Presentes";
  const corpo = [
    `Olá, ${nome},`,
    ``,
    `A trilha de Presentes do ${NOME_PRODUTO} tem material novo pra você continuar de onde parou — sem cobrança.`,
    ``,
    opts.materialUrl,
    ``,
    `— ${NOME_PRODUTO}`,
  ].join("\n");
  return {
    subject,
    tituloHtml,
    texto: corpo,
    ctaLabel: cta,
    htmlInner: `<p style="color:#64748b;font-size:15px;line-height:1.5;">Olá, ${esc(nome)}. A trilha de Presentes do ${esc(NOME_PRODUTO)} tem material pra você continuar de onde parou — sem cobrança.</p>
    <p style="margin:24px 0;"><a href="${esc(opts.materialUrl)}" style="display:inline-block;background:#0d9488;color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:600;">${esc(cta)}</a></p>`,
  };
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
