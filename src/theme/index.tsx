import { createTheme, ThemeProvider } from '@mui/material/styles'
import { ReactNode } from 'react'

import colors from 'config/colors'

const theme = createTheme({
  palette: {
    primary: {
      main: colors.primary.main,
    },
    secondary: {
      main: colors.secondary.main,
    },
  },
})

interface ThemeProps {
  children: ReactNode
}

export const Theme = ({ children }: ThemeProps) => {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>
}

