import { IClient, IClientCreate, IClientUpdate } from 'interfaces/IClient'

import { api as apiService, ApiService } from './api'

class ClientService {
  constructor(private readonly api: ApiService) {}

  public getClients = async (): Promise<IClient[]> => {
    return this.api.get('/clients')
  }

  public getClient = async (id: number): Promise<IClient> => {
    return this.api.get(`/clients/${id}`)
  }

  public createClient = async (data: IClientCreate): Promise<IClient> => {
    return this.api.post('/clients', data)
  }

  public updateClient = async (id: number, data: IClientUpdate): Promise<IClient> => {
    return this.api.put(`/clients/${id}`, data)
  }

  public deleteClient = async (id: number): Promise<void> => {
    return this.api.delete(`/clients/${id}`)
  }
}

const clientService = new ClientService(apiService)
export default clientService

