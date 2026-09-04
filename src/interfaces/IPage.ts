/** Envelope de listagem paginada devolvido pela API. */
export interface IPage<T> {
  items: T[]
  /** Total com os filtros aplicados — não o tamanho de `items`. */
  total: number
  page: number
  page_size: number
  pages: number
}
