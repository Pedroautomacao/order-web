import { FC, ReactNode, useState } from 'react'
import { Box, Toolbar } from '@mui/material'

import { DesktopNavbar } from './DesktopNavbar'
import { Header } from 'shared'

interface LayoutProps {
  children: ReactNode
}

const Layout: FC<LayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const handleMenuClick = () => setMobileOpen((v) => !v)

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', width: '100%', overflowX: 'hidden' }}>
      <Header onMenuClick={handleMenuClick} />
      <DesktopNavbar mobileOpen={mobileOpen} onMenuClick={handleMenuClick} />
      <Box component="main" sx={{ flexGrow: 1, minWidth: 0, width: '100%' }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  )
}

export default Layout
