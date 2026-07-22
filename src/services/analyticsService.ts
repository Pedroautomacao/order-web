import { api as apiService, ApiService } from './api'

export interface IByDayPoint {
  date: string
  count: number
}
export interface ITopSku {
  sku: string
  name: string
  quantity: number
  lines: number
}
export interface ITopSeller {
  name: string
  produced_orders: number
}
export interface ITopClient {
  name: string
  orders: number
  amount: number
}
export interface IFinancials {
  total_amount: number
  billed_amount: number
  outstanding_amount: number
  avg_ticket: number
}
export interface IOrdersByStatus {
  Awaiting: number
  Producing: number
  Produced: number
  Billed: number
  Canceled: number
}
export interface IBreakStats {
  breaks: number
  produced_items: number
  rate: number
}

export interface IAnalyticsOverview {
  range: { start: string; end: string }
  total_orders: number
  orders_by_status: IOrdersByStatus
  completion_rate: number
  financials: IFinancials
  payment_mix: { cash: number; credit: number }
  break_stats: IBreakStats
  orders_by_day: IByDayPoint[]
  top_skus: ITopSku[]
  top_sellers: ITopSeller[]
  top_clients: ITopClient[]
}

export interface IAnalyticsByClient {
  client: {
    id: number
    name: string
    allow_cash: boolean
    allow_credit: boolean
    credit_limit: number
  } | null
  range: { start: string; end: string }
  total_orders: number
  orders_by_status: IOrdersByStatus
  financials: IFinancials
  payment_mix: { cash: number; credit: number }
  break_stats: IBreakStats
  credit: { limit: number; outstanding: number; available: number }
  days_since_last_order: number | null
  orders_by_day: IByDayPoint[]
  top_skus: ITopSku[]
}

class AnalyticsService {
  constructor(private readonly api: ApiService) {}

  public overview = async (dateFrom: string, dateTo: string): Promise<IAnalyticsOverview> => {
    return this.api.get('/analytics/overview', {
      params: { date_from: dateFrom, date_to: dateTo },
    })
  }

  public byClient = async (
    clientId: number,
    dateFrom: string,
    dateTo: string,
  ): Promise<IAnalyticsByClient> => {
    return this.api.get('/analytics/by-client', {
      params: { client_id: clientId, date_from: dateFrom, date_to: dateTo },
    })
  }
}

const analyticsService = new AnalyticsService(apiService)
export default analyticsService
