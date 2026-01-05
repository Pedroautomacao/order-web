export interface IUnitOfMeasure {
  id: number
  code: string
  description: string | null
}

export interface IUnitOfMeasureCreate {
  code: string
  description?: string
}

export interface IUnitOfMeasureUpdate {
  code?: string
  description?: string
}

