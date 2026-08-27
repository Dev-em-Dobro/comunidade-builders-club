/**
 * F062 — canais de suporte ao membro.
 *
 * O checkout é da Hubla, não nosso: cancelamento e troca de forma de pagamento
 * não passam pela nossa API. A página de Configurações encaminha para o
 * atendimento humano em vez de prometer self-service que não existe.
 */

/**
 * Número do WhatsApp de suporte, só dígitos e com DDI (ex.: `5511999999999`).
 * Vazio = botão de WhatsApp não aparece; o e-mail continua sendo exibido.
 */
export const WHATSAPP_SUPORTE = (
  process.env.NEXT_PUBLIC_WHATSAPP_SUPORTE ?? ""
).replace(/\D/g, "");

/** E-mail de suporte — mesmo endereço do contato legal. */
export const EMAIL_SUPORTE = "suportedevquest@gmail.com";

const MENSAGEM_PADRAO =
  "Oi! Preciso de ajuda com minha assinatura do Builders Club.";

/** Link do WhatsApp com mensagem pré-preenchida, ou `null` se não configurado. */
export function whatsappSuporteUrl(mensagem = MENSAGEM_PADRAO): string | null {
  if (!WHATSAPP_SUPORTE) return null;
  return `https://wa.me/${WHATSAPP_SUPORTE}?text=${encodeURIComponent(mensagem)}`;
}

/** `mailto:` do suporte com assunto pré-preenchido. */
export function emailSuporteUrl(assunto = "Ajuda com minha assinatura"): string {
  return `mailto:${EMAIL_SUPORTE}?subject=${encodeURIComponent(assunto)}`;
}
