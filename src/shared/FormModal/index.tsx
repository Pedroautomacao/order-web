import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { ReactNode } from 'react'

interface FormModalProps {
  open: boolean
  title: string
  onClose: () => void
  onSubmit?: () => void
  children: ReactNode
  submitLabel?: string
  cancelLabel?: string
  submitting?: boolean
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg'
  /** Ações customizadas no rodapé (substitui os botões padrão). */
  actions?: ReactNode
}

/**
 * Modal de formulário padrão: título (Sora), corpo com espaçamento e rodapé
 * com Cancelar + ação primária. Envolve o conteúdo num <form> quando
 * `onSubmit` é passado. Usado por Novo Pedido, Produto, Cliente, Usuário etc.
 */
export const FormModal = ({
  open,
  title,
  onClose,
  onSubmit,
  children,
  submitLabel = 'Salvar',
  cancelLabel = 'Cancelar',
  submitting = false,
  maxWidth = 'sm',
  actions,
}: FormModalProps) => {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const body = (
    <>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
        {children}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        {actions ?? (
          <>
            <Button onClick={onClose} disabled={submitting} color="inherit">
              {cancelLabel}
            </Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? 'Salvando...' : submitLabel}
            </Button>
          </>
        )}
      </DialogActions>
    </>
  )

  return (
    <Dialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth fullScreen={fullScreen}>
      <DialogTitle sx={{ fontWeight: 600 }}>{title}</DialogTitle>
      {onSubmit ? (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit()
          }}
        >
          {body}
        </form>
      ) : (
        body
      )}
    </Dialog>
  )
}

export default FormModal
