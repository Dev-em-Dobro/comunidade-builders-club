/**
 * F080 — tempo ASSISTIDO, não ponto alcançado.
 *
 * A primeira versão guardava o maior `currentTime` visto. O teste em
 * homologação mostrou o furo em dois segundos de relógio: arrastar a barra
 * para o minuto 4 registrava "assistiu 224 segundos". E arrastar é exatamente
 * o que faz quem NÃO está assistindo — o número inflaria justo no caso que a
 * casa quer detectar.
 *
 * Agora o tempo é somado entre eventos consecutivos, e só quando o avanço
 * couber num passo natural de reprodução. Salto grande é navegação, não
 * audiência; avanço negativo é rebobinada, que também não soma (mas o trecho
 * revisto volta a somar, porque aí o vídeo está de fato rodando).
 */

/**
 * Maior avanço, em segundos, que ainda conta como reprodução contínua.
 *
 * O `panda_timeupdate` chega várias vezes por segundo, então o passo normal é
 * bem menor que isto. A folga cobre travada de rede e aba em segundo plano
 * (onde o navegador espaça os eventos) sem deixar passar um arrasto de barra,
 * que salta dezenas de segundos de uma vez.
 */
export const SALTO_MAXIMO_SEGUNDOS = 2;

export type EstadoTempo = {
  /** `currentTime` do último evento, para medir o passo seguinte. */
  ultimo: number;
  /** Soma dos passos que contaram como reprodução. */
  assistido: number;
};

export function estadoInicial(): EstadoTempo {
  return { ultimo: 0, assistido: 0 };
}

/** Aplica um `currentTime` novo e devolve o estado atualizado. */
export function acumular(estado: EstadoTempo, currentTime: number): EstadoTempo {
  if (!Number.isFinite(currentTime) || currentTime < 0) return estado;
  const passo = currentTime - estado.ultimo;
  const contou = passo > 0 && passo <= SALTO_MAXIMO_SEGUNDOS;
  return {
    ultimo: currentTime,
    assistido: contou ? estado.assistido + passo : estado.assistido,
  };
}
