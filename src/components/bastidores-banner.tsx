import Image from "next/image";
import { BASTIDORES, BASTIDORES_BANNER } from "@/lib/eventos/bastidores";

/**
 * F099 — faixa da live pública de quinta no topo do Club. Quem vê é decidido
 * pelo shell (`faixaDoTopo`); aqui não há regra de membership.
 *
 * ## Por que as alturas são fixas e a arte é cortada
 *
 * As duas peças de hoje foram desenhadas para 1920 e 800 de largura, mas a
 * faixa quase nunca tem essa largura: o shell tira 260px de sidebar a partir
 * de 768px (`app-shell-client.tsx`), então ela *encolhe* de 767px para 508px
 * bem quando a tela cresce. Servindo a arte inteira (`h-auto`), o tipo
 * renderizaria a 7–9px.
 *
 * Com altura fixa + `object-cover`, quem manda na escala passa a ser a
 * altura: a arte é ampliada até preencher a faixa e o excedente sai pela
 * direita — onde ficam os dois rostos. Título, data e botão vivem no terço
 * esquerdo das duas peças e sobrevivem em qualquer largura.
 *
 * As alturas abaixo foram escolhidas para o título nunca cair de ~27px e o
 * botão nunca sair do quadro em 320px. **É paliativo**: a spec F099 (decisão
 * 6) traz as dimensões das três peças definitivas, e quando elas chegarem
 * isto aqui vira `h-auto` com três `<Image>`.
 *
 * O alvo de toque não depende do botão desenhado: a faixa inteira é o link.
 */
export function BastidoresBanner() {
  const { wide, mobile } = BASTIDORES_BANNER;

  return (
    <a
      href={BASTIDORES.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block h-[240px] overflow-hidden border-b border-border sm:h-[200px] xl:h-[240px] 2xl:h-[320px] focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
    >
      <Image
        src={mobile.src}
        alt={BASTIDORES.alt}
        width={mobile.width}
        height={mobile.height}
        className="h-full w-full object-cover object-left sm:hidden"
        priority
        unoptimized
      />
      <Image
        src={wide.src}
        alt={BASTIDORES.alt}
        width={wide.width}
        height={wide.height}
        className="hidden h-full w-full object-cover object-left sm:block"
        priority
        unoptimized
      />
    </a>
  );
}
