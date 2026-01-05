export interface IUserState {
  isAuthenticated: boolean
  userPermissions: string[]
  isLoading: boolean
  userId: number
}

export interface ILogin {
  username: string
  password: string
}

export interface IAuthentication {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface IUser {
  id: number
  username: string
  email: string | null
  first_name: string
  last_name: string
  cpf: string
  is_active: boolean
  roles: IRole[]
}

export interface IRole {
  id: number
  name: string
  permissions: IPermission[]
}

export interface IPermission {
  id: number
  code: string
  description: string | null
}

