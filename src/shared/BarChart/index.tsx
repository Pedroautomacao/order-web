import { Box, Paper, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'

import colors from 'config/colors'

export interface BarChartPoint {
  label: string
  value: number
}

interface BarChartProps {
  title?: string
  data: BarChartPoint[]
  height?: number
}

/**
 * Gráfico de barras simples em SVG puro (sem libs externas), no espírito do
 * gráfico "Pedidos por dia" do Stitch. Barras verdes com valor no topo.
 */
export const BarChart = ({ title, data, height = 220 }: BarChartProps) => {
  const max = Math.max(1, ...data.map((d) => d.value))

  return (
    <Paper sx={{ p: 3 }}>
      {title && (
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
          {title}
        </Typography>
      )}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: { xs: 1, sm: 2 },
          height,
          px: 1,
        }}
      >
        {data.map((d) => {
          const h = Math.round((d.value / max) * (height - 48))
          return (
            <Box
              key={d.label}
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 0.5,
                minWidth: 0,
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                {d.value}
              </Typography>
              <Box
                title={`${d.label}: ${d.value}`}
                sx={{
                  width: '100%',
                  maxWidth: 44,
                  height: Math.max(4, h),
                  borderRadius: 1.5,
                  background: `linear-gradient(180deg, ${colors.primary.main}, ${alpha(
                    colors.primary.main,
                    0.65,
                  )})`,
                  transition: 'height .3s ease',
                }}
              />
              <Typography
                variant="caption"
                noWrap
                sx={{ color: 'text.secondary', maxWidth: '100%' }}
              >
                {d.label}
              </Typography>
            </Box>
          )
        })}
      </Box>
    </Paper>
  )
}

export default BarChart
