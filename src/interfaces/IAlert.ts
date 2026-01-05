export interface IAlert {
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  message?: string
}

