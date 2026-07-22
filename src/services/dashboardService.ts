import { api as apiService, ApiService } from './api'

export interface IOrdersByDayPoint {
  date: string
  count: number
}

export interface IDashboardOverview {
  orders_today: {
    awaiting: number
    producing: number
    produced: number
    billed: number
    canceled: number
  }
  producing_now: number
  completion_rate_today: number
  overdue_orders: number
  produced_not_billed: number
  orders_by_day: IOrdersByDayPoint[]
}

class DashboardService {
  constructor(private readonly api: ApiService) {}

  public getOverview = async (): Promise<IDashboardOverview> => {
    return this.api.get('/dashboard/overview')
  }
}

const dashboardService = new DashboardService(apiService)
export default dashboardService

