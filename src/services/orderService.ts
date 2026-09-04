import { IOrder, IOrderCreate, IOrderUpdate } from 'interfaces/IOrder'
import { IPage } from 'interfaces/IPage'

import { api as apiService, ApiService } from './api'

class OrderService {
  constructor(private readonly api: ApiService) {}

  /**
   * Lista paginada de pedidos, do mais recente para o mais antigo por data de
   * entrega. `page` começa em 1.
   */
  public getOrders = async (
    search?: string,
    status?: string,
    scheduledDate?: string,
    page = 1,
    pageSize = 20,
  ): Promise<IPage<IOrder>> => {
    const params: Record<string, string | number> = { page, page_size: pageSize }
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

  /** Marca um pedido como pago (somente admin — order:mark_paid). */
  public markOrderPaid = async (id: number): Promise<IOrder> => {
    return this.api.patch(`/orders/${id}/pay`, {})
  }

  /** Cancela um pedido (admin — order:cancel). */
  public cancelOrder = async (id: number): Promise<IOrder> => {
    return this.api.patch(`/orders/${id}/cancel`, {})
  }

  /** Prioriza um pedido: prioridade vira "A" (order:set_priority). */
  public prioritizeOrder = async (id: number): Promise<IOrder> => {
    return this.api.patch(`/orders/${id}/prioritize`, {})
  }

  /** Remarca a data de entrega (só Aguardando). */
  public rescheduleOrder = async (id: number, scheduledDate: string): Promise<IOrder> => {
    return this.api.patch(`/orders/${id}/reschedule`, { scheduledDate })
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
