/** F079 — link do Google Calendar pro botão "Marcar na agenda". Sem lib nova. */

const DURACAO_PADRAO_MIN = 60;

function paraGoogleCalendarUTC(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

export function googleCalendarUrl(opts: {
  liveAt: Date;
  titulo: string;
  detalhes?: string;
  local?: string;
}): string {
  const fim = new Date(opts.liveAt.getTime() + DURACAO_PADRAO_MIN * 60_000);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: opts.titulo,
    dates: `${paraGoogleCalendarUTC(opts.liveAt)}/${paraGoogleCalendarUTC(fim)}`,
  });
  if (opts.detalhes) params.set("details", opts.detalhes);
  if (opts.local) params.set("location", opts.local);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
