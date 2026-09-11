import { useState, ReactNode, MouseEvent } from 'react'
import {
  Button,
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from '@mui/material'
import { MoreVert as MoreIcon } from '@mui/icons-material'

export interface ActionItem {
  key: string
  label: string
  icon?: ReactNode
  onClick: () => void
  /** Cor do texto e do ícone. Use 'error' para ação destrutiva. */
  color?: 'inherit' | 'primary' | 'success' | 'error' | 'warning'
  disabled?: boolean
  /** Insere um separador acima do item, para isolar o que é destrutivo. */
  dividerBefore?: boolean
}

interface ActionsMenuProps {
  items: ActionItem[]
  /** Texto do botão. */
  label?: string
}

/**
 * Um botão único que abre as ações em lista suspensa.
 *
 * No cabeçalho de detalhe, três botões lado a lado quebravam em duas linhas e
 * competiam por atenção. A lista concentra tudo num ponto e segue o mesmo
 * padrão do menu de três pontos que a listagem de pedidos já usa.
 *
 * Não renderiza nada quando não há ação disponível.
 */
export const ActionsMenu = ({ items, label = 'Ações' }: ActionsMenuProps) => {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)

  if (!items.length) return null

  const abrir = (e: MouseEvent<HTMLButtonElement>) => setAnchor(e.currentTarget)
  const fechar = () => setAnchor(null)

  return (
    <>
      <Button
        variant="contained"
        endIcon={<MoreIcon />}
        onClick={abrir}
        aria-haspopup="menu"
        aria-expanded={!!anchor}
      >
        {label}
      </Button>

      <Menu
        anchorEl={anchor}
        open={!!anchor}
        onClose={fechar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { minWidth: 220 } } }}
      >
        {items.map(item => [
          item.dividerBefore && <Divider key={`${item.key}-divider`} />,
          <MenuItem
            key={item.key}
            disabled={item.disabled}
            onClick={() => {
              // fecha antes de agir: a ação pode recarregar a tela e deixar o
              // menu órfão, ancorado num botão que não existe mais
              fechar()
              item.onClick()
            }}
            sx={item.color && item.color !== 'inherit' ? { color: `${item.color}.main` } : undefined}
          >
            {item.icon && (
              <ListItemIcon sx={{ color: 'inherit' }}>{item.icon}</ListItemIcon>
            )}
            <ListItemText>{item.label}</ListItemText>
          </MenuItem>,
        ])}
      </Menu>
    </>
  )
}

export default ActionsMenu
