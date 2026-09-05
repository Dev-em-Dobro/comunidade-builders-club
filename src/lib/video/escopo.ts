/**
 * F080 — onde a audiência é medida, por enquanto.
 *
 * A instrumentação não custa nada por aula que ninguém abre, mas custa atenção:
 * medir as 66 aulas de uma vez espalharia dado que ninguém vai olhar antes de
 * a pergunta atual estar respondida. E a pergunta atual é uma só — **o Free
 * assiste o que a pop-up prometeu?** — que se responde com o vídeo de
 * boas-vindas e a Fase 1, o destino do cadastro.
 *
 * O resto do catálogo entra depois, e entra apagando este arquivo (ou trocando
 * o prefixo). O `id` do iframe fica em TODAS as aulas de propósito: é a peça
 * que o SDK do Panda precisa, e deixá-la pronta faz a ampliação ser de uma
 * linha, não de uma varredura.
 */

/** Os cinco módulos da Fase 1 (`m01`…`m05`) compartilham este prefixo. */
export const PREFIXO_FASE_1 = "fase-1-";

/** A aula deste módulo tem a audiência registrada? */
export function moduloMedido(moduleSlug: string | null | undefined): boolean {
  if (!moduleSlug) return false;
  return moduleSlug.startsWith(PREFIXO_FASE_1);
}
