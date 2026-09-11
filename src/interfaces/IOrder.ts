import { IUser } from './IUser'
import { IProduct } from './IProduct'
import { IClient } from './IClient'

export interface IOrder {
  id: number
  priority: string
  status: OrderStatus
  /** Liberação para produzir. Só pedidos aprovados entram na fila do produtor. */
  production_approval: ProductionApproval
  scheduled_date: string
  client_id: number
  created_by_user_id: number
  assigned_user_id: number | null
  payment_method: string
  is_paid: boolean
  total_amount: number | string
  /** Todos os itens do pedido, em qualquer status. Só vem nas respostas de
   *  detalhe (GET /orders/:id e afins), não nas de listagem. */
  items?: IOrderItem[]
  /** Recorte da tela do produtor: só itens já produzidos. */
  produced_items: IOrderItem[]
  current_item: IOrderItem | null
  total_items: number
  can_finish: boolean
  client?: IClient
  /** Quem registrou o pedido. Só vem nas respostas de detalhe. */
  created_by?: IUserRef
  assigned_user?: IUser
}

/** Referência mínima a um usuário, para exibir autoria. */
export interface IUserRef {
  id: number
  username: string
  full_name: string
}

export interface IOrderItem {
  id: number
  order_id: number
  product_id: number
  quantity: number
  produced_quantity: number | null
  status: OrderItemStatus
  product?: IProduct
  /** Preço congelado na criação do pedido — não acompanha o preço do produto. */
  unit_price: number | string
  /** Valor da linha: preço congelado × quantidade. */
  total_price: number | string
}

export interface IOrderCreate {
  clientId: number
  scheduledDate: string
  paymentMethod: PaymentMethod
  items: IOrderItemCreate[]
}

export interface IOrderUpdate {
  clientId: number
  scheduledDate: string
  paymentMethod: PaymentMethod
  items: IOrderItemCreate[]
}

export interface IOrderItemCreate {
  product_id: number
  quantity: number
  /** Preço exclusivo deste pedido. Omitido = preço de tabela do produto. */
  unitPrice?: number
}

export enum PaymentMethod {
  CASH = 'Cash',
  CREDIT = 'Credit',
}

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  [PaymentMethod.CASH]: 'À vista',
  [PaymentMethod.CREDIT]: 'A prazo',
}

export function getPaymentMethodLabel(method: string): string {
  return PAYMENT_METHOD_LABELS[method] ?? method
}

export enum OrderStatus {
  AWAITING = 'Awaiting',
  PRODUCING = 'Producing',
  PRODUCED = 'Produced',
  BILLED = 'Billed',
  CANCELED = 'Canceled',
}

export enum OrderItemStatus {
  AWAITING = 'Awaiting',
  PRODUCING = 'Producing',
  PRODUCED = 'Produced',
}

/** Rótulos em português para exibição do status do pedido */
export const ORDER_STATUS_LABELS: Record<string, string> = {
  [OrderStatus.AWAITING]: 'Aguardando',
  [OrderStatus.PRODUCING]: 'Em produção',
  [OrderStatus.PRODUCED]: 'Produzido',
  [OrderStatus.BILLED]: 'Faturado',
  [OrderStatus.CANCELED]: 'Cancelado',
}

/** Rótulos em português para exibição do status do item do pedido */
export const ORDER_ITEM_STATUS_LABELS: Record<string, string> = {
  [OrderItemStatus.AWAITING]: 'Aguardando',
  [OrderItemStatus.PRODUCING]: 'Em produção',
  [OrderItemStatus.PRODUCED]: 'Produzido',
}

export function getOrderStatusLabel(status: string): string {
  return ORDER_STATUS_LABELS[status] ?? status
}

export function getOrderItemStatusLabel(status: string): string {
  return ORDER_ITEM_STATUS_LABELS[status] ?? status
}

export enum ProductionApproval {
  AWAITING = 'Awaiting',
  APPROVED = 'Approved',
  RECUSED = 'Recused',
}

/** Rótulos em português para a liberação de produção */
export const PRODUCTION_APPROVAL_LABELS: Record<string, string> = {
  [ProductionApproval.AWAITING]: 'Aguardando',
  [ProductionApproval.APPROVED]: 'Aprovado',
  [ProductionApproval.RECUSED]: 'Recusado',
}

export function getProductionApprovalLabel(approval: string): string {
  return PRODUCTION_APPROVAL_LABELS[approval] ?? approval
}
