import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Box,
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
  Storefront as SellerIcon,
  MenuBook as CatalogIcon,
  Insights as AnalyticsIcon,
} from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'

import { IState } from 'store'
import { BrandLogo } from 'shared'
import CleaverIcon from 'shared/icons/CleaverIcon'

const drawerWidth = 240

const menuItems = [
  // Ordem principal (admin). Cada item só aparece se o usuário tiver a permissão.
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard', permission: 'dashboard:read' },
  { text: 'Pedidos', icon: <OrdersIcon />, path: '/admin/orders', permission: 'order:read' },
  { text: 'Clientes', icon: <ClientsIcon />, path: '/admin/clients', permission: 'client:read' },
  { text: 'Produtos', icon: <ProductsIcon />, path: '/admin/products', permission: 'product:read' },
  { text: 'Relatórios', icon: <AnalyticsIcon />, path: '/admin/analytics', permission: 'analytics:read' },
  { text: 'Fiscal', icon: <FiscalIcon />, path: '/admin/fiscal', permission: 'order:bill' },
  { text: 'Usuários', icon: <UsersIcon />, path: '/admin/users', permission: 'user:create' },
  { text: 'Auditoria', icon: <AuditIcon />, path: '/admin/audit', permission: 'audit:read' },
  // Perfis específicos (só aparecem para vendedor/produtor via permissão)
  { text: 'Meus Pedidos', icon: <SellerIcon />, path: '/admin/seller', permission: 'order:list' },
  { text: 'Catálogo', icon: <CatalogIcon />, path: '/admin/catalog', permission: 'order:list' },
  { text: 'Produção', icon: <CleaverIcon />, path: '/admin/producer', permission: 'order:produce' },
]

interface DesktopNavbarProps {
  mobileOpen: boolean
  onMenuClick: () => void
}

export const DesktopNavbar = ({ mobileOpen, onMenuClick }: DesktopNavbarProps) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const navigate = useNavigate()
  const location = useLocation()
  const userPermissions = useSelector<IState, string[]>((state) => state.user.userPermissions)
  const isLoading = useSelector<IState, boolean>((state) => state.user.isLoading)
  const hasPermissions = userPermissions && userPermissions.length > 0
  const visibleItems =
    isLoading || !hasPermissions
      ? []
      : menuItems.filter((item) => !item.permission || userPermissions.includes(item.permission))

  const handleNavigation = (path: string) => {
    navigate(path)
    if (isMobile) onMenuClick()
  }

  const drawer = (
    <Box>
      {/* Bloco de LOGO trocável (padrão: Uai System; substituível pela do cliente) */}
      <Toolbar sx={{ px: 2 }}>
        <BrandLogo size={34} />
      </Toolbar>
      <Divider />
      <List sx={{ py: 1 }}>
        {visibleItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: 500 }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  )

  return (
    <Box
      component="nav"
      sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
    >
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={onMenuClick}
          ModalProps={{ keepMounted: true }}
          sx={{ '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}
        >
          {drawer}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{ '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}
          open
        >
          {drawer}
        </Drawer>
      )}
    </Box>
  )
}
