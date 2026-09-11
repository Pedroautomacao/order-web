/**
 * Data e hora no fuso de São Paulo.
 *
 * `new Date().toISOString()` devolve a data em UTC, não a de São Paulo: num
 * navegador em UTC-3, das 21h à meia-noite isso já aponta para o dia seguinte
 * — era o que fazia a tela abrir filtrando amanhã. O Intl resolve o fuso de
 * verdade, e funciona mesmo com o navegador em outro fuso.
 */

export const SAO_PAULO_TIME_ZONE = 'America/Sao_Paulo'

/** Depois desta hora não dá mais para entregar no mesmo dia. */
export const SAME_DAY_CUTOFF_HOUR = 16

interface PartesSP {
  ano: string
  mes: string
  dia: string
  hora: number
}

function partesEmSaoPaulo(instante: Date): PartesSP {
  const partes = new Intl.DateTimeFormat('en-US', {
    timeZone: SAO_PAULO_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
  }).formatToParts(instante)

  const valor = (tipo: string) => partes.find(p => p.type === tipo)?.value ?? '0'

  return {
    ano: valor('year'),
    mes: valor('month'),
    dia: valor('day'),
    // alguns runtimes devolvem "24" à meia-noite com hour12:false
    hora: Number(valor('hour')) % 24,
  }
}

/** Soma dias a uma data YYYY-MM-DD sem sair do frame UTC, que não tem DST. */
function somarDias(iso: string, dias: number): string {
  const [ano, mes, dia] = iso.split('-').map(Number)
  const deslocada = new Date(Date.UTC(ano, mes - 1, dia + dias))
  return deslocada.toISOString().split('T')[0]
}

/** Data de hoje em São Paulo, como YYYY-MM-DD. */
export function todayInSaoPaulo(): string {
  const { ano, mes, dia } = partesEmSaoPaulo(new Date())
  return `${ano}-${mes}-${dia}`
}

/** Hora atual (0-23) em São Paulo. */
export function currentHourInSaoPaulo(): number {
  return partesEmSaoPaulo(new Date()).hora
}

/** Ainda dá para pedir entrega para hoje? */
export function allowsSameDayDelivery(): boolean {
  return currentHourInSaoPaulo() < SAME_DAY_CUTOFF_HOUR
}

/**
 * Primeira data de entrega aceitável: hoje até as 16h de São Paulo, depois
 * disso amanhã. Espelha min_scheduled_date() do backend.
 */
export function getMinOrderDate(): string {
  const hoje = todayInSaoPaulo()
  return allowsSameDayDelivery() ? hoje : somarDias(hoje, 1)
}

/** Formata YYYY-MM-DD como DD/MM/YYYY, sem passar por Date. */
export function formatIsoDate(iso: string): string {
  const [ano, mes, dia] = iso.split('-')
  return ano && mes && dia ? `${dia}/${mes}/${ano}` : iso
}
