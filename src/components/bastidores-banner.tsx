import { BASTIDORES } from "@/lib/eventos/bastidores";

/**
 * F102 — faixa da live pública de quinta no topo do Club. Quem vê é decidido
 * pelo shell (`faixaDoTopo`); aqui não há regra de membership.
 *
 * ## Por que é HTML e não imagem
 *
 * A faixa nasceu como duas artes em WebP e não sobrevivia assim. O shell tira
 * 260px de sidebar a partir de 768px, então a faixa *encolhe* de 767px para
 * 508px bem quando a tela cresce — e nenhuma arte de proporção fixa cobre uma
 * caixa cuja proporção varia de 2,1:1 a 11:1. Servindo a arte inteira, o tipo
 * caía para 7–9px; cortando com `object-cover`, sumia metade da peça.
 *
 * Em HTML o problema não existe: o texto reflui, o tipo tem tamanho próprio em
 * cada faixa de largura e não há nada para cortar. De quebra some o `alt` que
 * duplicava a copy, somem 220KB de WebP e a campanha passa a ser editável sem
 * abrir editor de imagem.
 *
 * ## Por que container query e não `md:`
 *
 * `md:` mede o **viewport**, e é justamente em 768px que a sidebar entra e
 * rouba 260px: o layout largo ligaria no mesmo pixel em que a caixa cai para
 * 508px — o pior dos dois mundos, e a primeira versão deste componente clipava
 * ali. `@container` mede a largura real da faixa, que é a única que importa.
 * Efeito colateral bom: a faixa fica correta em qualquer lugar onde for
 * reusada, com ou sem sidebar, sem saber nada sobre o shell.
 *
 * O corte é `@lg` (512px), escolhido para deixar a faixa de 508px — o aperto
 * do tablet — do lado estreito.
 *
 * ## Altura e a escala do tipo
 *
 * Teto de 150px (`max-h-[150px]`), pedido de produto. O parágrafo de apoio
 * cabe dentro dele, mas só porque **todo o resto encolheu** para abrir a
 * linha: título, badge, data, botão e o ladrilho do calendário. Os tamanhos
 * abaixo estão calibrados contra esse teto — subir qualquer um deles sem
 * remedir estoura a caixa e o `overflow-hidden` corta o CTA em silêncio.
 *
 * Alturas reais: ~119px estreito (sem parágrafo), 128px em 764, 135px em 1180.
 *
 * ## Tema
 *
 * Escura nos dois temas, por decisão (spec F102, 6.5) — é peça de campanha,
 * não superfície do produto. Por isso as cores são literais aqui em vez de
 * token: `bg-accent` viraria verde-claro no tema claro e mataria o contraste
 * do texto branco.
 */
export function BastidoresBanner() {
  return (
    <a
      href={BASTIDORES.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group @container relative block max-h-[150px] overflow-hidden border-b border-white/10 bg-[#07201b] px-4 py-2.5 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#2dd4bf] @lg:px-8 @lg:py-3"
    >
      <BastidoresFundo />

      <div className="relative flex flex-col gap-2 @lg:flex-row @lg:items-center @lg:justify-between @lg:gap-8">
        <div className="min-w-0">
          {/*
            Estreito: título à esquerda, badge empurrado para a direita pela
            `justify-between` — é o que libera a linha do título em 320px.
            Largo: `flex-col-reverse` inverte a dupla sem duplicar o badge no
            DOM, e ele volta para cima do título.
          */}
          <div className="flex items-start justify-between gap-2 @lg:flex-col-reverse @lg:items-start @lg:justify-start @lg:gap-1.5">
            <h2 className="text-[16px] font-extrabold leading-[1.12] tracking-tight text-white @xs:text-[17px] @lg:text-[20px] @lg:leading-[1.08] @4xl:text-[23px]">
              {BASTIDORES.tituloLinha1}
              <br />
              <span className="text-[#2dd4bf]">{BASTIDORES.tituloLinha2}</span>
            </h2>

            <span className="mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-full bg-[#f5333f] px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.1em] whitespace-nowrap text-white @lg:mt-0">
              <span className="size-1 shrink-0 rounded-full bg-white" />
              {BASTIDORES.badge}
            </span>
          </div>

          {/*
            O parágrafo só entra a partir de `@lg`. Abaixo disso ele competiria
            com o CTA pelo mesmo espaço vertical, e o CTA é o que precisa
            sobreviver.
          */}
          <p className="mt-1.5 hidden max-w-[62ch] text-[11.5px] leading-snug text-white/70 @lg:block">
            {BASTIDORES.descricao}
          </p>
        </div>

        <div className="flex flex-col gap-1.5 @lg:shrink-0">
          {/*
            O calendário é glifo solto no estreito e vira ladrilho verde no
            largo — mesma marcação, só troca de caixa.
          */}
          <p className="flex items-center gap-1.5 @lg:gap-2.5">
            <span className="grid shrink-0 place-items-center text-[#2dd4bf] @lg:size-8 @lg:rounded-lg @lg:bg-[#2dd4bf] @lg:text-[#07201b]">
              <IconeCalendario />
            </span>
            <span className="text-[11px] whitespace-nowrap text-white/85 @lg:text-[12px]">
              {BASTIDORES.quando} às{" "}
              <span className="font-extrabold text-[#2dd4bf]">
                {BASTIDORES.horario}
              </span>
            </span>
          </p>

          {/*
            Não é <button>: o elemento clicável é o <a> que embrulha a faixa
            inteira. Aninhar um botão aqui criaria um alvo dentro do outro.
          */}
          <span className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-[11px] font-bold whitespace-nowrap text-[#07201b] shadow-sm transition-transform group-hover:-translate-y-0.5 @lg:w-auto @lg:px-4 @lg:text-[12px]">
            {BASTIDORES.cta}
            <IconeSeta />
          </span>
        </div>
      </div>
    </a>
  );
}

/**
 * Brilho + cubos isométricos. Pura decoração: `aria-hidden`, sem alvo de
 * clique, e escondido em faixa estreita — ali não há largura sobrando e os
 * cubos só roubariam contraste do texto.
 */
function BastidoresFundo() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0 bg-[radial-gradient(125%_150%_at_78%_30%,#0f5f50_0%,#0a3129_45%,#07201b_100%)]" />
      <svg
        viewBox="0 0 380 260"
        className="absolute -right-8 top-1/2 hidden h-[220%] -translate-y-1/2 @lg:block"
        fill="none"
      >
        <Cubo x={78} y={168} w={52} h={30} d={52} />
        <Cubo x={182} y={112} w={58} h={33} d={74} />
        <Cubo x={296} y={48} w={64} h={37} d={98} />
      </svg>
    </div>
  );
}

/**
 * Um cubo isométrico. `x`/`y` é o vértice de topo, `w` a meia-largura, `h` a
 * meia-altura do losango do topo e `d` a profundidade das faces laterais.
 *
 * As três faces usam o mesmo verde em alfas diferentes — é o que dá volume
 * sem precisar de sombra ou gradiente por face.
 */
function Cubo({
  x,
  y,
  w,
  h,
  d,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  d: number;
}) {
  const topo = `${x},${y} ${x + w},${y + h} ${x},${y + 2 * h} ${x - w},${y + h}`;
  const esquerda = `${x - w},${y + h} ${x},${y + 2 * h} ${x},${y + 2 * h + d} ${x - w},${y + h + d}`;
  const direita = `${x},${y + 2 * h} ${x + w},${y + h} ${x + w},${y + h + d} ${x},${y + 2 * h + d}`;

  return (
    <g>
      <polygon points={topo} fill="#2dd4bf" fillOpacity={0.22} />
      <polygon points={direita} fill="#2dd4bf" fillOpacity={0.12} />
      <polygon points={esquerda} fill="#2dd4bf" fillOpacity={0.06} />
    </g>
  );
}

function IconeCalendario() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-3 @lg:size-3.5"
    >
      <rect x={3} y={5} width={18} height={16} rx={3} />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}

function IconeSeta() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5"
    >
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  );
}
