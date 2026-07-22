/** Formata um valor numérico (ou string numérica) como moeda BRL. */
export function formatCurrency(value: number | string | null | undefined): string {
  const n = Number(value ?? 0)
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
