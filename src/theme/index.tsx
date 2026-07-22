import { createTheme, ThemeProvider, alpha } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { ReactNode } from 'react'

import colors from 'config/colors'

/**
 * Tema Uai System — identidade white-label.
 *
 * Estética: clean e moderna, porém acolhedora. Cantos suaves (12px),
 * sombras difusas, tipografia legível (Sora nos títulos, Inter no corpo),
 * botões grandes e alto contraste — pensado para público que vai de
 * usuários avançados a pessoas com pouca familiaridade digital.
 */

const HEADLINE = '"Sora", "Segoe UI", Roboto, sans-serif'
const BODY = '"Inter", "Segoe UI", Roboto, sans-serif'

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      light: colors.primary.light,
      main: colors.primary.main,
      dark: colors.primary.dark,
      contrastText: colors.primary.contrastText,
    },
    secondary: {
      light: colors.secondary.light,
      main: colors.secondary.main,
      dark: colors.secondary.dark,
      contrastText: colors.secondary.contrastText,
    },
    success: { main: colors.success, contrastText: '#ffffff' },
    warning: { main: colors.warning, contrastText: '#ffffff' },
    error: { main: colors.error, contrastText: '#ffffff' },
    info: { main: colors.info, contrastText: '#ffffff' },
    background: {
      default: colors.background,
      paper: colors.surface,
    },
    text: {
      primary: colors.textPrimary,
      secondary: colors.textSecondary,
    },
    divider: colors.outline,
  },

  shape: {
    borderRadius: 12,
  },

  typography: {
    fontFamily: BODY,
    h1: { fontFamily: HEADLINE, fontWeight: 700 },
    h2: { fontFamily: HEADLINE, fontWeight: 700 },
    h3: { fontFamily: HEADLINE, fontWeight: 600 },
    h4: { fontFamily: HEADLINE, fontWeight: 600 },
    h5: { fontFamily: HEADLINE, fontWeight: 600 },
    h6: { fontFamily: HEADLINE, fontWeight: 600 },
    button: { fontFamily: BODY, fontWeight: 600, textTransform: 'none' },
    body1: { fontSize: '1rem' },
    body2: { fontSize: '0.9375rem' },
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: colors.background,
        },
      },
    },

    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 12,
          minHeight: 44,
          paddingInline: 20,
          fontSize: '1rem',
          boxShadow: 'none',
        },
        containedPrimary: {
          boxShadow: `0 2px 8px ${alpha(colors.primary.main, 0.25)}`,
          '&:hover': {
            boxShadow: `0 4px 12px ${alpha(colors.primary.main, 0.32)}`,
          },
        },
        sizeLarge: {
          minHeight: 52,
          fontSize: '1.0625rem',
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        rounded: { borderRadius: 16 },
        elevation1: {
          boxShadow: `0 1px 3px ${alpha('#1a201d', 0.06)}, 0 4px 20px ${alpha(
            '#1a201d',
            0.05,
          )}`,
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: `0 1px 3px ${alpha('#1a201d', 0.06)}, 0 4px 20px ${alpha(
            '#1a201d',
            0.05,
          )}`,
        },
      },
    },

    MuiTextField: {
      defaultProps: {
        size: 'medium',
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: colors.surface,
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontWeight: 600,
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: colors.surface,
          color: colors.textPrimary,
          boxShadow: `0 1px 0 ${colors.outline}`,
        },
      },
    },

    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: colors.surface,
          borderRight: `1px solid ${colors.outline}`,
        },
      },
    },

    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          marginInline: 8,
          '&.Mui-selected': {
            backgroundColor: alpha(colors.primary.main, 0.12),
            color: colors.primary.dark,
            '& .MuiListItemIcon-root': { color: colors.primary.main },
            '&:hover': { backgroundColor: alpha(colors.primary.main, 0.18) },
          },
        },
      },
    },

    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: colors.surfaceContainer,
            fontWeight: 700,
            color: colors.textSecondary,
          },
        },
      },
    },
  },
})

interface ThemeProps {
  children: ReactNode
}

export const Theme = ({ children }: ThemeProps) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}
