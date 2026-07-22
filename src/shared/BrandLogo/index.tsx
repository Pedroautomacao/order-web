import { Box, Typography } from '@mui/material'

import colors from 'config/colors'
import { brand } from 'shared/brand'

interface BrandLogoProps {
  /** Mostra o nome da marca ao lado do símbolo. */
  showName?: boolean
  /** Tamanho do símbolo em px. */
  size?: number
  /** Cor do texto do nome (padrão: texto primário). */
  nameColor?: string
  /** Alinhamento vertical do conjunto. */
  variant?: 'horizontal' | 'stacked'
}

/**
 * Logo do Uai System — símbolo inspirado no triângulo (invertido) da bandeira
 * de Minas Gerais, em verde esmeralda com um detalhe em âmbar.
 *
 * White-label: se `brand.logoUrl` estiver definido (logo de um cliente),
 * ela substitui o símbolo padrão automaticamente.
 */
export const BrandLogo = ({
  showName = true,
  size = 36,
  nameColor,
  variant = 'horizontal',
}: BrandLogoProps) => {
  const symbol = brand.logoUrl ? (
    <Box
      component="img"
      src={brand.logoUrl}
      alt={brand.name}
      sx={{ width: size, height: size, objectFit: 'contain', borderRadius: 1.5 }}
    />
  ) : (
    <Box
      aria-hidden
      sx={{
        width: size,
        height: size,
        borderRadius: 2,
        display: 'grid',
        placeItems: 'center',
        background: `linear-gradient(135deg, ${colors.primary.main}, ${colors.secondary.main})`,
        flexShrink: 0,
      }}
    >
      <svg
        width={size * 0.58}
        height={size * 0.58}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Triângulo invertido (bandeira de MG) */}
        <path d="M3 5 H21 L12 20 Z" fill="#ffffff" />
        <path d="M8.2 8 H15.8 L12 14.4 Z" fill={colors.tertiary.main} />
      </svg>
    </Box>
  )

  if (!showName) return symbol

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: variant === 'stacked' ? 'column' : 'row',
        alignItems: 'center',
        gap: variant === 'stacked' ? 1 : 1.25,
      }}
    >
      {symbol}
      <Typography
        variant="h6"
        noWrap
        sx={{
          fontWeight: 700,
          letterSpacing: '-0.01em',
          color: nameColor || colors.textPrimary,
        }}
      >
        {brand.name}
      </Typography>
    </Box>
  )
}

export default BrandLogo
