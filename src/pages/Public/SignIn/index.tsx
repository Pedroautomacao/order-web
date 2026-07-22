import { yupResolver } from '@hookform/resolvers/yup'
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  CircularProgress,
} from '@mui/material'
import { Visibility, VisibilityOff, Lock, Person } from '@mui/icons-material'
import { useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import * as Yup from 'yup'

import { useAuth } from 'hooks/useAuth'
import { ILogin } from 'interfaces/IUser'
import { BrandLogo, brand } from 'shared'
import colors from 'config/colors'

const validateSchema = Yup.object().shape({
  username: Yup.string().required('Login obrigatório'),
  password: Yup.string().required('Senha obrigatória'),
})

const SignIn = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { signIn } = useAuth()

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<ILogin>({ resolver: yupResolver(validateSchema) })

  const handleSignIn: SubmitHandler<ILogin> = async (data) => {
    setIsLoading(true)
    await signIn(data)
    setIsLoading(false)
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        background: `linear-gradient(160deg, ${colors.background} 0%, ${colors.surfaceContainer} 100%)`,
      }}
    >
      <Paper
        elevation={1}
        sx={{
          width: '100%',
          maxWidth: 420,
          p: { xs: 3, sm: 5 },
          borderRadius: 4,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <BrandLogo size={64} variant="stacked" />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
            Faça login para continuar
          </Typography>
        </Box>

        <form onSubmit={handleSubmit(handleSignIn)}>
          <TextField
            {...register('username')}
            label="Usuário"
            fullWidth
            margin="normal"
            error={!!errors.username}
            helperText={errors.username?.message}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            {...register('password')}
            label="Senha"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            margin="normal"
            error={!!errors.password}
            helperText={errors.password?.message}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword((s) => !s)} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={isLoading}
            sx={{ mt: 3 }}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Entrar'}
          </Button>
        </form>

        {brand.tagline && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', textAlign: 'center', mt: 3 }}
          >
            {brand.tagline}
          </Typography>
        )}
      </Paper>
    </Box>
  )
}

export default SignIn
