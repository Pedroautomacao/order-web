import { IUnitOfMeasure } from './IUnitOfMeasure'

export interface IProduct {
  id: number
  name: string
  description: string | null
  sku: string
  is_active: boolean
  unit_of_measure_id: number
  unit?: IUnitOfMeasure
}

export interface IProductCreate {
  name: string
  description?: string
  sku: string
  isActive?: boolean
  unitOfMeasureId: number
}

export interface IProductUpdate {
  name?: string
  description?: string
  sku?: string
  isActive?: boolean
  unitOfMeasureId?: number
}

