import { Box, Paper, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { ReactNode } from 'react'

import colors from 'config/colors'

export type KpiTone = 'neutral' | 'primary' | 'warning' | 'success' | 'info' | 'error'

const TONE_COLOR: Record<KpiTone, string> = {
  neutral: colors.outlineStrong,
  primary: colors.primary.main,
  warning: colors.warning,
  success: colors.success,
  info: colors.info,
  error: colors.error,
}

interface KpiCardProps {
  label: string
  value: ReactNode
  icon?: ReactNode
  tone?: KpiTone
}

/**
 * Cartão de KPI do Dashboard: rótulo em cima, número grande embaixo e um
 * ícone colorido semântico. Cores por tom (aguardando, produção, produzido…).
 */
export const KpiCard = ({ label, value, icon, tone = 'neutral' }: KpiCardProps) => {
  const c = TONE_COLOR[tone]
  return (
    <Paper sx={{ p: { xs: 2, sm: 2.5 }, height: '100%', display: 'flex', alignItems: 'center', gap: 1.5 }}>
      {icon && (
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2.5,
            display: 'grid',
            placeItems: 'center',
            color: c,
            backgroundColor: alpha(c, 0.14),
            flexShrink: 0,
            '& svg': { fontSize: 24 },
          }}
        >
          {icon}
        </Box>
      )}
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            fontWeight: 500,
            lineHeight: 1.25,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {label}
        </Typography>
        <Typography
          sx={{
            fontWeight: 700,
            lineHeight: 1.15,
            mt: 0.5,
            color: 'text.primary',
            // valor completo (com centavos): nunca corta; encolhe a fonte e
            // quebra a palavra se necessário para caber inteiro no card
            fontSize: { xs: '1.25rem', sm: '1.35rem', md: '1.4rem' },
            overflowWrap: 'anywhere',
          }}
        >
          {value}
        </Typography>
      </Box>
    </Paper>
  )
}

export default KpiCard
