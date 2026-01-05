import { FC, ReactNode, useState } from 'react'
import { Box } from '@mui/material'

import { DesktopNavbar } from './DesktopNavbar'
import { Header } from 'components/Header'
import { useStyles } from './styles'

interface LayoutProps {
  children: ReactNode
}

const Layout: FC<LayoutProps> = ({ children }) => {
  const classes = useStyles()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleMenuClick = () => {
    setMobileOpen(!mobileOpen)
  }

  return (
    <Box className={classes.root}>
      <Header onMenuClick={handleMenuClick} />
      <DesktopNavbar mobileOpen={mobileOpen} onMenuClick={handleMenuClick} />
      <Box component="main" className={classes.content}>
        <Box className={classes.toolbar} />
        {children}
      </Box>
    </Box>
  )
}

export default Layout

