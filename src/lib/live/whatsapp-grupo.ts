/** F082 — URL do grupo WhatsApp de avisos das lives (público no client). */

export function urlGrupoWhatsappAvisosLive(): string | null {
  const raw = process.env.NEXT_PUBLIC_WHATSAPP_AVISOS_LIVE_URL?.trim();
  if (!raw) return null;
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    return u.toString();
  } catch {
    return null;
  }
}
