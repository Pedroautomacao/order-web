import { AppBar, Toolbar, Box, IconButton, Avatar, Menu, MenuItem, Divider } from '@mui/material'
import { AccountCircle, Logout, Menu as MenuIcon, LockReset } from '@mui/icons-material'
import { useState } from 'react'

import { useAuth } from 'hooks/useAuth'
import { theme } from 'theme'
import BrandLogo from 'shared/BrandLogo'
import ChangePasswordModal from 'shared/ChangePasswordModal'

interface HeaderProps {
  onMenuClick?: () => void
}

/**
 * Barra superior fixa: no mobile mostra o hambúrguer + logo da marca; à direita,
 * o menu do usuário (sair). Usa a BrandLogo trocável (white-label).
 */
export const Header = ({ onMenuClick }: HeaderProps) => {
  const { signOut } = useAuth()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [pwdOpen, setPwdOpen] = useState(false)

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget)
  const handleClose = () => setAnchorEl(null)
  const handleLogout = () => {
    handleClose()
    signOut()
  }
  const handleChangePassword = () => {
    handleClose()
    setPwdOpen(true)
  }

  return (
    <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
      <Toolbar>
        {onMenuClick && (
          <IconButton
            color="inherit"
            aria-label="abrir menu"
            edge="start"
            onClick={onMenuClick}
            sx={{ mr: 2, display: { xs: 'flex', md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
        )}
        <BrandLogo size={32} />
        <Box sx={{ flexGrow: 1 }} />
        <Box>
          <IconButton
            size="large"
            edge="end"
            aria-label="conta do usuário"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
          >
            <Avatar sx={{ width: 32, height: 32 }}>
              <AccountCircle />
            </Avatar>
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            keepMounted
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleChangePassword}>
              <LockReset sx={{ mr: 1 }} />
              Trocar senha
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 1 }} />
              Sair
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>

      <ChangePasswordModal open={pwdOpen} onClose={() => setPwdOpen(false)} />
    </AppBar>
  )
}

export default Header
