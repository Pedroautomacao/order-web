import { IOrder, IOrderCreate } from 'interfaces/IOrder'

import { api as apiService, ApiService } from './api'

class OrderService {
  constructor(private readonly api: ApiService) {}

  public getOrders = async (search?: string, status?: string): Promise<IOrder[]> => {
    const params: Record<string, string> = {}
    if (search?.trim()) params.search = search.trim()
    if (status?.trim()) params.status = status.trim()
    return this.api.get('/orders', { params })
  }

  /** Lista pedidos para tela fiscal (Produced, Billed). Usar quando o usuário só tem order:bill. */
  public getFiscalOrders = async (search?: string, status?: string): Promise<IOrder[]> => {
    const params: Record<string, string> = {}
    if (search?.trim()) params.search = search.trim()
    if (status?.trim()) params.status = status.trim()
    return this.api.get('/orders/fiscal', { params })
  }

  public getOrder = async (id: number): Promise<IOrder> => {
    return this.api.get(`/orders/${id}`)
  }

  /** Detalhe do pedido para tela fiscal. Usar quando o usuário só tem order:bill. */
  public getFiscalOrder = async (id: number): Promise<IOrder> => {
    return this.api.get(`/orders/fiscal/${id}`)
  }

  public createOrder = async (data: IOrderCreate): Promise<IOrder> => {
    return this.api.post('/orders', data)
  }
}

const orderService = new OrderService(apiService)
export default orderService
