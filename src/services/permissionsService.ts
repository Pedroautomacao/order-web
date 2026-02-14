import { IUser } from 'interfaces/IUser'

import { api as apiService, ApiService } from './api'

class PermissionsService {
  constructor(private readonly api: ApiService) {}

  public getMe = async (): Promise<IUser> => {
    return this.api.get('/auth/me')
  }

  public getCurrentUser = async (userId: number): Promise<IUser> => {
    return this.api.get(`/users/${userId}`)
  }
}

const permissionsService = new PermissionsService(apiService)
export default permissionsService

