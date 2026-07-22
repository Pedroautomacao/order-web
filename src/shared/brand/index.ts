/**
 * Configuração de marca (white-label).
 *
 * A marca PADRÃO é o Uai System. Para adaptar a um cliente (ex.: Frigorífico
 * Vereda), sobrescreva estes valores — idealmente via variáveis de ambiente
 * ou configuração vinda da API no futuro. Toda a UI lê a marca daqui.
 */

export interface BrandConfig {
  /** Nome exibido no login e no topo do menu lateral. */
  name: string
  /** URL de um logotipo do cliente. Quando ausente, usa a logo padrão (Uai System). */
  logoUrl?: string
  /** Assinatura curta exibida no login. */
  tagline?: string
}

export const brand: BrandConfig = {
  name: process.env.REACT_APP_BRAND_NAME || 'Uai System',
  logoUrl: process.env.REACT_APP_BRAND_LOGO_URL || undefined,
  tagline: process.env.REACT_APP_BRAND_TAGLINE || 'Gestão de Pedidos e Produção',
}

export default brand
