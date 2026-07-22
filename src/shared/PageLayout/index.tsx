import { Box } from '@mui/material'
import { ReactNode } from 'react'

interface PageLayoutProps {
  children: ReactNode
  /** Largura máxima do conteúdo. `false` = largura total. */
  maxWidth?: number | false
}

/**
 * Wrapper padrão de página do conteúdo admin: respiro vertical consistente,
 * largura máxima opcional e responsividade. Substitui o `container` repetido
 * em cada tela.
 */
export const PageLayout = ({ children, maxWidth = false }: PageLayoutProps) => (
  <Box
    sx={{
      width: '100%',
      mx: 'auto',
      maxWidth: maxWidth === false ? '100%' : maxWidth,
      px: { xs: 2, sm: 3 },
      py: { xs: 2, sm: 4 },
    }}
  >
    {children}
  </Box>
)

export default PageLayout
