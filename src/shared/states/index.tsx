import { Box, CircularProgress, Typography } from '@mui/material'
import { ReactNode } from 'react'

interface LoadingStateProps {
  minHeight?: number | string
}

/** Spinner centralizado padrão para carregamento de páginas/listas. */
export const LoadingState = ({ minHeight = 320 }: LoadingStateProps) => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight }}>
    <CircularProgress />
  </Box>
)

interface EmptyStateProps {
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
}

/** Estado vazio amigável (sem resultados / lista vazia). */
export const EmptyState = ({ title, description, icon, action }: EmptyStateProps) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      py: 6,
      px: 3,
      gap: 1,
    }}
  >
    {icon && <Box sx={{ color: 'text.secondary', fontSize: 48, mb: 1 }}>{icon}</Box>}
    <Typography variant="h6" sx={{ fontWeight: 600 }}>
      {title}
    </Typography>
    {description && (
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420 }}>
        {description}
      </Typography>
    )}
    {action && <Box sx={{ mt: 2 }}>{action}</Box>}
  </Box>
)
