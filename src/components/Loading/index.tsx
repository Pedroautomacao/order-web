import { Box, CircularProgress, Typography } from '@mui/material'

const Loading = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
      }}
    >
      <CircularProgress />
      <Typography variant="body2" sx={{ mt: 2 }}>
        Carregando...
      </Typography>
    </Box>
  )
}

export default Loading

