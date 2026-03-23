import { IOrder, IOrderCreate, IOrderUpdate } from 'interfaces/IOrder'

import { api as apiService, ApiService } from './api'

class OrderService {
  constructor(private readonly api: ApiService) {}

  public getOrders = async (search?: string, status?: string, scheduledDate?: string): Promise<IOrder[]> => {
    const params: Record<string, string> = {}
    if (search?.trim()) params.search = search.trim()
    if (status?.trim()) params.status = status.trim()
    if (scheduledDate?.trim()) params.scheduled_date = scheduledDate.trim()
    return this.api.get('/orders', { params })
  }

  /** Lista pedidos para tela fiscal (Produced, Billed). Usar quando o usuário só tem order:bill. */
  public getFiscalOrders = async (search?: string, status?: string, scheduledDate?: string): Promise<IOrder[]> => {
    const params: Record<string, string> = {}
    if (search?.trim()) params.search = search.trim()
    if (status?.trim()) params.status = status.trim()
    if (scheduledDate?.trim()) params.scheduled_date = scheduledDate.trim()
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

  /** Lista pedidos criados pelo vendedor logado. */
  public getSellerOrders = async (search?: string, status?: string, scheduledDate?: string): Promise<IOrder[]> => {
    const params: Record<string, string> = {}
    if (search?.trim()) params.search = search.trim()
    if (status?.trim()) params.status = status.trim()
    if (scheduledDate?.trim()) params.scheduled_date = scheduledDate.trim()
    return this.api.get('/orders/seller', { params })
  }

  /** Detalhe de pedido do vendedor. */
  public getSellerOrder = async (id: number): Promise<IOrder> => {
    return this.api.get(`/orders/seller/${id}`)
  }

  /** Edita pedido do vendedor (apenas Aguardando). */
  public updateSellerOrder = async (id: number, data: IOrderUpdate): Promise<IOrder> => {
    return this.api.put(`/orders/seller/${id}`, data)
  }

  /** Cancela pedido do vendedor (apenas Aguardando). */
  public cancelSellerOrder = async (id: number): Promise<IOrder> => {
    return this.api.patch(`/orders/seller/${id}/cancel`, {})
  }

  /** Retorna o pedido atualmente em produção pelo produtor logado, ou null. */
  public getProducerCurrentOrder = async (): Promise<IOrder | null> => {
    return this.api.get('/orders/producer/current')
  }

  /** Atribui o próximo pedido Aguardando ao produtor logado. */
  public assignNextProducerOrder = async (): Promise<IOrder> => {
    return this.api.post('/orders/producer/next', {})
  }

  /** Finaliza pedido em produção do produtor logado. */
  public finishProducerOrder = async (id: number): Promise<IOrder> => {
    return this.api.patch(`/orders/producer/${id}/finish`, {})
  }

  /** Confirma produção de um item do pedido. */
  public confirmOrderItem = async (orderItemId: number, producedQuantity: number): Promise<IOrder> => {
    return this.api.patch(`/order-items/${orderItemId}/confirm`, { producedQuantity })
  }

  /** Atualiza a quantidade produzida de um item já confirmado (revisão antes de finalizar). */
  public updateOrderItemQuantity = async (orderItemId: number, producedQuantity: number): Promise<IOrder> => {
    return this.api.patch(`/order-items/${orderItemId}/update-quantity`, { producedQuantity })
  }
}

const orderService = new OrderService(apiService)
export default orderService
