import { IOrder } from 'interfaces/IOrder'

import { api as apiService, ApiService } from './api'

class BillingService {
  constructor(private readonly api: ApiService) {}

  public billOrder = async (orderId: number): Promise<IOrder> => {
    return this.api.patch(`/billing/${orderId}/bill`)
  }
}

const billingService = new BillingService(apiService)
export default billingService
