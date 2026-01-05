import { IUnitOfMeasure } from 'interfaces/IUnitOfMeasure'

import { api as apiService, ApiService } from './api'

class UnitService {
  constructor(private readonly api: ApiService) {}

  public getUnits = async (): Promise<IUnitOfMeasure[]> => {
    return this.api.get('/units')
  }
}

const unitService = new UnitService(apiService)
export default unitService

