import { hrefPlanos } from "@/lib/membership/capabilities";

/**
 * F091 — CTA na descrição da aula, só para quem é Free e já está
 * assistindo. Aula paga tem overlay; este bloco não entra lá.
 *
 * A arte (texto + preço) vive em `public/banners/`. PNG originais
 * viram WebP q90; o Next serve o arquivo como está (`unoptimized`).
 */
export function shouldShowLessonUpgradeCta(opts: {
  isPaid: boolean;
  canWatch: boolean;
}): boolean {
  return !opts.isPaid && opts.canWatch;
}

export const LESSON_UPGRADE_MOTIVO = "aula-descricao" as const;

export const LESSON_UPGRADE_BANNER = {
  desktop: {
    src: "/banners/upgrade-aula-desktop.webp",
    width: 2126,
    height: 740,
  },
  mobile: {
    src: "/banners/upgrade-aula-mobile.webp",
    width: 1162,
    height: 1354,
  },
  alt: "Tenha acesso ao arsenal completo do Builders Club. Sites prontos para vender, propostas personalizadas, modelos de contrato. Planos a partir de 12× R$ 30,18.",
  cta: "Ver planos e benefícios",
} as const;

export function lessonUpgradeHref(): string {
  return hrefPlanos({ motivo: LESSON_UPGRADE_MOTIVO });
}
