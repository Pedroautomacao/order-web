import { IUser } from './IUser'
import { IProduct } from './IProduct'
import { IClient } from './IClient'

export interface IOrder {
  id: number
  priority: string
  status: OrderStatus
  scheduled_date: string
  client_id: number
  created_by_user_id: number
  assigned_user_id: number | null
  payment_method: string
  is_paid: boolean
  total_amount: number | string
  produced_items: IOrderItem[]
  current_item: IOrderItem | null
  total_items: number
  can_finish: boolean
  client?: IClient
  created_by?: IUser
  assigned_user?: IUser
}

export interface IOrderItem {
  id: number
  order_id: number
  product_id: number
  quantity: number
  produced_quantity: number | null
  status: OrderItemStatus
  product?: IProduct
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

