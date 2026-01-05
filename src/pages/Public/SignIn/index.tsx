import { yupResolver } from '@hookform/resolvers/yup'
import {
  Box,
  Container,
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

import { useStyles } from './styles'

const validateSchema = Yup.object().shape({
  username: Yup.string().required('Login obrigatório'),
  password: Yup.string().required('Senha obrigatória'),
})

const SignIn = () => {
  const classes = useStyles()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { signIn } = useAuth()

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<ILogin>({
    resolver: yupResolver(validateSchema),
  })

  const handleSignIn: SubmitHandler<ILogin> = async data => {
    setIsLoading(true)
    await signIn(data)
    setIsLoading(false)
  }

  const handleShowPassword = () => setShowPassword(state => !state)

  return (
    <Container maxWidth="sm" className={classes.container}>
      <Box className={classes.content}>
        <Typography variant="h4" component="h1" className={classes.title}>
          Uai System
        </Typography>
        <Typography variant="body2" className={classes.subtitle}>
          Faça login para continuar
        </Typography>

        <form onSubmit={handleSubmit(handleSignIn)} className={classes.form}>
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
                  <IconButton onClick={handleShowPassword} edge="end">
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
            className={classes.button}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Entrar'}
          </Button>
        </form>
      </Box>
    </Container>
  )
}

export default SignIn
