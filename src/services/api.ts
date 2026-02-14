import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import cookies from 'js-cookie'

import { baseURL } from 'settings'

interface IApi {
  addPopup: (value: any) => void
  signOut: () => void
}

interface ErrorResponse {
  detail?: string
  message?: string
}

export class ApiService {
  private addPopup: any = null
  private signOut: any = null
  private isAuthError = false
  private last403At = 0
  private readonly FORBIDDEN_COOLDOWN_MS = 2000

  public setFuncions({ addPopup, signOut }: IApi) {
    this.addPopup = addPopup
    this.signOut = signOut
  }

  public instance = axios.create({
    baseURL,
  })

  requestInterceptor = this.instance.interceptors.request.use(
    (config) => {
      const token = cookies.get('authToken')
      if (token) {
        config.headers = config.headers || {}
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    },
  )

  interceptor = this.instance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response
    },
    (error: AxiosError<ErrorResponse>) => {
      const isMeRequest = error.config?.url?.includes('/auth/me')
      if (
        error.response?.status === 401 &&
        error.response.data?.detail !== 'No active account found with the given credentials' &&
        !isMeRequest
      ) {
        if (!this.isAuthError) {
          this.isAuthError = true
          this.signOut()
          this.addPopup({
            type: 'info',
            title: 'Token expirado ou inválido.',
          })
        }
      }
      if (error.response?.status === 403 && this.addPopup) {
        const now = Date.now()
        if (now - this.last403At >= this.FORBIDDEN_COOLDOWN_MS) {
          this.last403At = now
          const detail =
            typeof error.response?.data === 'object' && error.response?.data?.detail
              ? String(error.response.data.detail)
              : 'Você não tem permissão para esta ação.'
          this.addPopup({
            type: 'error',
            title: 'Sem permissão',
            message: detail,
          })
        }
      }
      return Promise.reject(error)
    },
  )

  public get = async (url: string, config?: AxiosRequestConfig): Promise<any> => {
    return this.instance
      .get(url, config)
      .then(x => x.data)
      .catch(err => {
        if (err?.message === 'Network Error') throw new Error('Network Error')
        if (axios.isAxiosError(err)) throw err.response?.data

        throw err
      })
  }

  public post = async (url: string, params?: any, config?: AxiosRequestConfig): Promise<any> => {
    return this.instance
      .post(url, params, config)
      .then(x => x.data)
      .catch(err => {
        if (err?.message === 'Network Error') throw new Error('Network Error')
        if (axios.isAxiosError(err)) throw err.response?.data
        throw err
      })
  }

  public put = async (url: string, params?: any, config?: AxiosRequestConfig): Promise<any> => {
    return this.instance
      .put(url, params, config)
      .then(x => x.data)
      .catch(err => {
        if (err?.message === 'Network Error') throw new Error('Network Error')
        if (axios.isAxiosError(err)) throw err.response?.data
        throw err
      })
  }

  public delete = async (url: string, config?: AxiosRequestConfig): Promise<any> => {
    return this.instance
      .delete(url, config)
      .then(x => x.data)
      .catch(err => {
        if (err?.message === 'Network Error') throw new Error('Network Error')
        if (axios.isAxiosError(err)) throw err.response?.data
        throw err
      })
  }

  public patch = async (url: string, params?: any, config?: AxiosRequestConfig): Promise<any> => {
    return this.instance
      .patch(url, params, config)
      .then(x => x.data)
      .catch(err => {
        if (err?.message === 'Network Error') throw new Error('Network Error')
        if (axios.isAxiosError(err)) throw err.response?.data
        throw err
      })
  }
}

export const api = new ApiService()

