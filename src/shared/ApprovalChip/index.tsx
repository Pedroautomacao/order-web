import { Chip } from '@mui/material'
import { alpha } from '@mui/material/styles'

import colors from 'config/colors'
import { ProductionApproval, getProductionApprovalLabel } from 'interfaces/IOrder'

type Tone = { fg: string; bg: string }

/**
 * Cores da liberação de produção: aguardando (âmbar, pede ação),
 * aprovado (verde) e recusado (vermelho).
 */
const APPROVAL_TONES: Record<string, Tone> = {
  [ProductionApproval.AWAITING]: {
    fg: colors.tertiary.dark,
    bg: alpha(colors.tertiary.main, 0.16),
  },
  [ProductionApproval.APPROVED]: {
    fg: colors.primary.dark,
    bg: alpha(colors.primary.main, 0.14),
  },
  [ProductionApproval.RECUSED]: {
    fg: colors.error,
    bg: alpha(colors.error, 0.14),
  },
}

const FALLBACK: Tone = { fg: colors.textSecondary, bg: alpha(colors.textSecondary, 0.12) }

interface ApprovalChipProps {
  approval: string
  size?: 'small' | 'medium'
}

export const ApprovalChip = ({ approval, size = 'small' }: ApprovalChipProps) => {
  const tone = APPROVAL_TONES[approval] ?? FALLBACK
  return (
    <Chip
      label={getProductionApprovalLabel(approval)}
      size={size}
      sx={{
        color: tone.fg,
        backgroundColor: tone.bg,
        fontWeight: 600,
      }}
    />
  )
}

export default ApprovalChip
