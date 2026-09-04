/** Formata um valor numérico (ou string numérica) como moeda BRL. */
export function formatCurrency(value: number | string | null | undefined): string {
  const n = Number(value ?? 0)
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

interface ProductLike {
  name?: string | null
  sku?: string | null
  unit?: { code?: string | null } | null
}

/**
 * Rótulo padrão do produto: mostra a unidade ao lado do nome.
 * Ex.: "Picanha Peça (kg)". Opcionalmente prefixa o SKU.
 *
 * Passe `withUnit: false` quando a quantidade ao lado já traz a unidade,
 * senão ela aparece duas vezes na mesma linha.
 */
export function productLabel(
  product: ProductLike | null | undefined,
  opts: { withSku?: boolean; fallback?: string; withUnit?: boolean } = {},
): string {
  if (!product) return opts.fallback ?? '-'
  const showUnit = opts.withUnit ?? true
  const unit = showUnit && product.unit?.code ? ` (${product.unit.code})` : ''
  const sku = opts.withSku && product.sku ? `${product.sku} — ` : ''
  return `${sku}${product.name ?? ''}${unit}`
}

/** Formata quantidade com a unidade do produto. Ex.: "8,5 kg". */
export function formatQuantityWithUnit(
  value: number | string | null | undefined,
  unitCode?: string | null,
): string {
  if (value == null || value === '') return '-'
  const n = Number(value)
  const num = Number.isInteger(n) ? String(n) : n.toLocaleString('pt-BR')
  return unitCode ? `${num} ${unitCode}` : num
}
