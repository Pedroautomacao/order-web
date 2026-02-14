import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Box,
  Typography,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  ShoppingCart as OrdersIcon,
  Inventory as ProductsIcon,
  People as ClientsIcon,
  Person as UsersIcon,
  Receipt as FiscalIcon,
  History as AuditIcon,
} from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'

import { IState } from 'store'
import { useStyles } from './styles'

const drawerWidth = 240

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard', permission: 'dashboard:read' },
  { text: 'Pedidos', icon: <OrdersIcon />, path: '/admin/orders', permission: 'order:read' },
  { text: 'Fiscal', icon: <FiscalIcon />, path: '/admin/fiscal', permission: 'order:bill' },
  { text: 'Produtos', icon: <ProductsIcon />, path: '/admin/products', permission: 'product:read' },
  { text: 'Clientes', icon: <ClientsIcon />, path: '/admin/clients', permission: 'client:read' },
  { text: 'Usuários', icon: <UsersIcon />, path: '/admin/users', permission: 'user:create' },
  { text: 'Auditoria', icon: <AuditIcon />, path: '/admin/audit', permission: 'audit:read' },
]

interface DesktopNavbarProps {
  mobileOpen: boolean
  onMenuClick: () => void
}

export const DesktopNavbar = ({ mobileOpen, onMenuClick }: DesktopNavbarProps) => {
  const classes = useStyles()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const navigate = useNavigate()
  const location = useLocation()
  const userPermissions = useSelector<IState, string[]>(state => state.user.userPermissions)
  const isLoading = useSelector<IState, boolean>(state => state.user.isLoading)
  const hasPermissions = userPermissions && userPermissions.length > 0
  const visibleItems =
    isLoading || !hasPermissions
      ? []
      : menuItems.filter(
          item => !item.permission || userPermissions.includes(item.permission),
        )

  const handleDrawerToggle = () => {
    onMenuClick()
  }

  const handleNavigation = (path: string) => {
    navigate(path)
    if (isMobile) {
      onMenuClick()
    }
  }

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" className={classes.title}>
          Uai System
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {visibleItems.map(item => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  )

  return (
    <Box component="nav" className={classes.drawer}>
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      )}
    </Box>
  )
}

