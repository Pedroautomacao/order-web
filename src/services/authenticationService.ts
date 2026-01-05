import { IAuthentication } from 'interfaces/IUser'
import { ILogin } from 'interfaces/IUser'

import { api as apiService, ApiService } from './api'

class AuthenticationService {
  constructor(private readonly api: ApiService) {}

  public postLogin = async (login: ILogin): Promise<IAuthentication> => {
    return this.api.post('/auth/login', login)
  }

  public postRefresh = async (refreshToken: string): Promise<IAuthentication> => {
    return this.api.post('/auth/refresh', refreshToken)
  }
}

export const authenticationService = new AuthenticationService(apiService)

