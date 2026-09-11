export interface IUnitOfMeasure {
  id: number
  code: string
  /** Nome legível da unidade (ex.: "Quilograma"). É o que a tela deve exibir. */
  name: string
  /** Texto livre opcional. Quase sempre nulo, então não serve de rótulo. */
  description: string | null
}

export interface IUnitOfMeasureCreate {
  code: string
  name: string
  description?: string
}

export interface IUnitOfMeasureUpdate {
  code?: string
  name?: string
  description?: string
}
