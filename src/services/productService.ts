import { IProduct, IProductCreate, IProductUpdate } from 'interfaces/IProduct'

import { api as apiService, ApiService } from './api'

class ProductService {
  constructor(private readonly api: ApiService) {}

  public getProducts = async (): Promise<IProduct[]> => {
    return this.api.get('/products')
  }

  public getProduct = async (id: number): Promise<IProduct> => {
    return this.api.get(`/products/${id}`)
  }

  public createProduct = async (data: IProductCreate): Promise<IProduct> => {
    return this.api.post('/products', data)
  }

  public updateProduct = async (id: number, data: IProductUpdate): Promise<IProduct> => {
    return this.api.put(`/products/${id}`, data)
  }

  public deleteProduct = async (id: number): Promise<void> => {
    return this.api.delete(`/products/${id}`)
  }
}

const productService = new ProductService(apiService)
export default productService

