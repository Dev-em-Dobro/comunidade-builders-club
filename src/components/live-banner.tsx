/** F079 — faixa fixa com a próxima live + botão de agenda. Não dispensável. */

function formatarProximaLive(liveAtISO: string): string {
  const d = new Date(liveAtISO);
  const partes = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).formatToParts(d);
  const get = (t: Intl.DateTimeFormatPartTypes) =>
    partes.find((p) => p.type === t)?.value ?? "";

  const dia = get("weekday").replace(/-feira$/, "");
  const diaCapitalizado = dia.charAt(0).toUpperCase() + dia.slice(1);
  return `${diaCapitalizado}, ${get("day")}/${get("month")} às ${get("hour")}:${get("minute")}`;
}

export function LiveBanner({
  liveAt,
  calendarUrl,
}: {
  /** ISO string — vem de um Server Component, não pode ser Date. */
  liveAt: string;
  calendarUrl: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-accent/25 bg-accent/10 px-4 py-2.5 text-sm md:px-8">
      <p className="font-medium text-foreground">
        <span aria-hidden className="mr-1.5">
          🔴
        </span>
        Próxima live: {formatarProximaLive(liveAt)}
      </p>
      <a
        href={calendarUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 rounded-lg border border-accent/40 bg-background px-3 py-1 text-xs font-semibold text-accent transition-colors hover:bg-accent/10"
      >
        Marcar na agenda
      </a>
    </div>
  );
}
