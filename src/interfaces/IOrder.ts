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
  produced_items: IOrderItem[]
  current_item: IOrderItem | null
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
  items: IOrderItemCreate[]
}

export interface IOrderItemCreate {
  product_id: number
  quantity: number
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

