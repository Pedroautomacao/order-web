import { Chip } from '@mui/material'
import { alpha } from '@mui/material/styles'

import colors from 'config/colors'
import { OrderStatus, getOrderStatusLabel } from 'interfaces/IOrder'

type Tone = { fg: string; bg: string }

/**
 * Cores semânticas por status do pedido:
 * Aguardando (neutro), Em produção (âmbar), Produzido (verde),
 * Faturado (teal), Cancelado (vermelho).
 */
const STATUS_TONES: Record<string, Tone> = {
  [OrderStatus.AWAITING]: { fg: colors.outlineStrong, bg: alpha(colors.outlineStrong, 0.14) },
  [OrderStatus.PRODUCING]: { fg: colors.tertiary.dark, bg: alpha(colors.tertiary.main, 0.16) },
  [OrderStatus.PRODUCED]: { fg: colors.primary.dark, bg: alpha(colors.primary.main, 0.14) },
  [OrderStatus.BILLED]: { fg: colors.secondary.dark, bg: alpha(colors.secondary.main, 0.14) },
  [OrderStatus.CANCELED]: { fg: colors.error, bg: alpha(colors.error, 0.14) },
}

const FALLBACK: Tone = { fg: colors.textSecondary, bg: alpha(colors.textSecondary, 0.12) }

interface StatusChipProps {
  status: string
  size?: 'small' | 'medium'
}

export const StatusChip = ({ status, size = 'small' }: StatusChipProps) => {
  const tone = STATUS_TONES[status] ?? FALLBACK
  return (
    <Chip
      label={getOrderStatusLabel(status)}
      size={size}
      sx={{
        color: tone.fg,
        backgroundColor: tone.bg,
        fontWeight: 600,
      }}
    />
  )
}

export default StatusChip
