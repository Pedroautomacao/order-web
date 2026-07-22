import { SvgIcon, SvgIconProps } from '@mui/material'

/**
 * Ícone de faca de açougue (cutelo) — remete ao corte de carne na tela de Produção.
 * SVG próprio pois o Material Icons não tem uma faca isolada.
 */
export const CleaverIcon = (props: SvgIconProps) => (
  <SvgIcon viewBox="0 0 24 24" {...props}>
    {/* Lâmina (retângulo largo com ponta) */}
    <path d="M4 4 h11 a1 1 0 0 1 1 1 v7 a1 1 0 0 1 -1 1 H6 L3 10 a1 1 0 0 1 0 -1.4 L4 4 Z" />
    {/* Furo da lâmina */}
    <circle cx="13" cy="7" r="1" fill="#fff" />
    {/* Cabo */}
    <rect x="16" y="6.2" width="5.2" height="2.6" rx="1.3" />
  </SvgIcon>
)

export default CleaverIcon
