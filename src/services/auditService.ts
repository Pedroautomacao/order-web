import { api as apiService, ApiService } from './api'

export interface IAuditLog {
  id: number
  /** Chave estável, usada nos filtros (ex.: "order:create"). */
  action: string
  entity: string
  /** Rótulo em português para exibição. */
  action_label: string
  entity_label: string
  entity_id: number | null
  description: string | null
  user_id: number | null
  username: string | null
  created_at: string
}

export interface IAuditFilters {
  action?: string
  entity?: string
  user_id?: number
  date_from?: string
  date_to?: string
  limit?: number
  offset?: number
}

export interface IAuditFilterOption {
  /** Valor enviado no filtro. */
  value: string
  /** Texto exibido no seletor. */
  label: string
}

export interface IAuditFilterOptions {
  actions: IAuditFilterOption[]
  entities: IAuditFilterOption[]
}

class AuditService {
  constructor(private readonly api: ApiService) {}

  getLogs = async (filters: IAuditFilters = {}): Promise<IAuditLog[]> => {
    const params: Record<string, string | number> = {}
    if (filters.action) params.action = filters.action
    if (filters.entity) params.entity = filters.entity
    if (filters.user_id != null) params.user_id = filters.user_id
    if (filters.date_from) params.date_from = filters.date_from
    if (filters.date_to) params.date_to = filters.date_to
    if (filters.limit != null) params.limit = filters.limit
    if (filters.offset != null) params.offset = filters.offset
    return this.api.get('/audit/logs', { params })
  }

  getFilterOptions = async (): Promise<IAuditFilterOptions> => {
    return this.api.get('/audit/options')
  }
}

const auditService = new AuditService(apiService)
export default auditService
