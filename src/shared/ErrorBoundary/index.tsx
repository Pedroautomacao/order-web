import { Component, ReactNode } from 'react'
import { Box, Typography, Button } from '@mui/material'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            p: 3,
          }}
        >
          <Typography variant="h5" gutterBottom>
            Oops! Algo deu errado
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {this.state.error?.message || 'Um erro inesperado ocorreu'}
          </Typography>
          <Button
            variant="contained"
            onClick={() => {
              this.setState({ hasError: false, error: null })
              window.location.reload()
            }}
          >
            Recarregar página
          </Button>
        </Box>
      )
    }

    return this.props.children
  }
}

