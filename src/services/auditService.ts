import { api as apiService, ApiService } from './api'

export interface IAuditLog {
  id: number
  /** Chave estável, usada nos filtros (ex.: "order:create"). */
  action: string
  entity: string
  /** Rótulo em português para exibição. Ausente em API anterior à tradução. */
  action_label?: string
  entity_label?: string
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

/**
 * Normaliza as opções de filtro. API anterior à tradução devolve string[];
 * sem isto o seletor renderiza itens vazios em vez de degradar para a chave.
 */
export function normalizeFilterOptions(
  raw: (IAuditFilterOption | string)[] | null | undefined,
): IAuditFilterOption[] {
  if (!Array.isArray(raw)) return []
  return raw.map((o) =>
    typeof o === 'string' ? { value: o, label: o } : o,
  )
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
    const data = await this.api.get('/audit/options')
    return {
      actions: normalizeFilterOptions(data?.actions),
      entities: normalizeFilterOptions(data?.entities),
    }
  }
}

const auditService = new AuditService(apiService)
export default auditService
