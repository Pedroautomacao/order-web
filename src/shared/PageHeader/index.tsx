import { Box, Typography } from '@mui/material'
import { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  /** Ação principal (ex.: botão "Novo Pedido"), alinhada à direita no desktop. */
  action?: ReactNode
  /** Linha de filtros exibida abaixo do título (empilha no mobile). */
  filters?: ReactNode
}

/**
 * Cabeçalho de página padronizado: título grande (Sora), ação principal e
 * linha de filtros responsiva. Substitui os blocos header/headerRow/filtersRow
 * duplicados em várias telas.
 */
export const PageHeader = ({ title, subtitle, action, filters }: PageHeaderProps) => (
  <Box sx={{ mb: { xs: 2, sm: 3 }, width: '100%' }}>
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: { xs: 'stretch', sm: 'center' },
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2,
      }}
    >
      <Box>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
    </Box>

    {filters && (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap',
          mt: 2.5,
          flexDirection: { xs: 'column', sm: 'row' },
          '& > *': { width: { xs: '100%', sm: 'auto' } },
        }}
      >
        {filters}
      </Box>
    )}
  </Box>
)

export default PageHeader
