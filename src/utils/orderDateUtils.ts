/**
 * Retorna a data mínima permitida para criação de pedido:
 * - Se hora atual (Brasília, UTC-3) >= 16h → mínimo amanhã
 * - Caso contrário → mínimo hoje
 */
export function getMinOrderDate(): string {
  const now = new Date()
  // Brasília = UTC-3
  const hourBR = (now.getUTCHours() - 3 + 24) % 24
  const min = new Date(now)
  if (hourBR >= 16) {
    min.setDate(min.getDate() + 1)
  }
  return min.toISOString().split('T')[0]
}
