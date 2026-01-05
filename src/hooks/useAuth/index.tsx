import { FC, useContext, createContext, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import cookies from 'js-cookie'
import { jwtDecode } from 'jwt-decode'

import { ILogin } from 'interfaces/IUser'
import { IState } from 'store'
import { api } from 'services/api'
import { authenticationService } from 'services/authenticationService'
import permissionsService from 'services/permissionsService'
import { updateUser } from 'store/reducers/user/actions'
import { usePopup } from '../usePopup'

type IUseAuth = {
  signIn: (props: ILogin) => Promise<void>
  signOut: () => void
}

const AuthContext = createContext<IUseAuth>({} as IUseAuth)

const AuthProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch()
  const { addPopup } = usePopup()
  const navigate = useNavigate()
  const { isAuthenticated } = useSelector<IState, IState['user']>(state => state.user)

  console.log('AuthProvider rendering, isAuthenticated:', isAuthenticated)

  const getRules = async (userId: number) => {
    try {
      const data = await permissionsService.getCurrentUser(userId)
      
      const permissions = data.roles
        ? data.roles.flatMap(role => role.permissions.map(p => p.code))
        : []

      dispatch(
        updateUser({
          isAuthenticated: true,
          userPermissions: permissions,
          isLoading: false,
          userId: data.id,
        }),
      )
    } catch {
      dispatch(
        updateUser({
          isAuthenticated: true,
          userPermissions: [],
          isLoading: false,
          userId: 0,
        }),
      )
      addPopup({
        type: 'error',
        title: 'Erro ao buscar informações do usuário',
      })
    }
  }

  const signIn = async (data: ILogin): Promise<void> => {
    try {
      const { access_token, refresh_token } = await authenticationService.postLogin(data)

      const date = new Date()
      date.setHours(date.getHours() + 6)
      cookies.set('authToken', access_token, {
        expires: date,
      })

      cookies.set('refreshToken', refresh_token, {
        expires: date,
      })

      // @ts-ignore: Unreachable code error
      // eslint-disable-next-line dot-notation
      api.instance.defaults.headers['Authorization'] = `Bearer ${access_token}`

      const decodedToken = jwtDecode(access_token) as any
      const userId = parseInt(decodedToken.sub)

      await getRules(userId)

      addPopup({
        type: 'success',
        title: 'Logado com sucesso',
      })

      navigate('/admin/dashboard')
    } catch (error: any) {
      if (error?.detail === 'Invalid credentials') {
        addPopup({
          type: 'error',
          title: 'Credenciais inválidas',
        })
        return
      }

      addPopup({
        type: 'error',
        title: error?.detail ?? error?.message ?? 'Ocorreu um erro, contate o administrador.',
      })
    }
  }

  const signOut = () => {
    cookies.remove('authToken')
    cookies.remove('refreshToken')
    dispatch(
      updateUser({
        isAuthenticated: false,
        userPermissions: [],
        isLoading: false,
        userId: 0,
      }),
    )
    navigate('/login')
    // @ts-ignore: Unreachable code error
    // eslint-disable-next-line dot-notation
    api.instance.defaults.headers['Authorization'] = ''
  }

  const verifyAuth = () => {
    try {
      const token = cookies.get('authToken')
      if (token) {
        try {
          const decodedToken = jwtDecode(token) as any
          const currentDate = new Date()

          if (decodedToken.exp * 1000 < currentDate.getTime()) {
            dispatch(
              updateUser({
                isAuthenticated: false,
                userPermissions: [],
                isLoading: false,
                userId: 0,
              }),
            )
            cookies.remove('authToken')
            cookies.remove('refreshToken')
            return
          }

          // @ts-ignore: Unreachable code error
          // eslint-disable-next-line dot-notation
          api.instance.defaults.headers['Authorization'] = `Bearer ${token}`

          const userId = parseInt(decodedToken.sub)
          getRules(userId)
        } catch (err) {
          console.error('Error verifying token:', err)
          dispatch(
            updateUser({
              isAuthenticated: false,
              userPermissions: [],
              isLoading: false,
              userId: 0,
            }),
          )
          cookies.remove('authToken')
          cookies.remove('refreshToken')
        }
      } else {
        dispatch(
          updateUser({
            isAuthenticated: false,
            userPermissions: [],
            isLoading: false,
            userId: 0,
          }),
        )
      }
    } catch (error) {
      console.error('Error in verifyAuth:', error)
      dispatch(
        updateUser({
          isAuthenticated: false,
          userPermissions: [],
          isLoading: false,
          userId: 0,
        }),
      )
    }
  }

  useEffect(() => {
    try {
      api.setFuncions({
        addPopup: addPopup,
        signOut: signOut,
      })

      verifyAuth()
    } catch (error) {
      console.error('Error in AuthProvider initialization:', error)
      dispatch(
        updateUser({
          isAuthenticated: false,
          userPermissions: [],
          isLoading: false,
          userId: 0,
        }),
      )
    }
  }, [])

  return <AuthContext.Provider value={{ signIn, signOut }}>{children}</AuthContext.Provider>
}

const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export { AuthProvider, useAuth }

