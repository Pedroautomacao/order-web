import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import cookies from 'js-cookie'

import { baseURL } from 'settings'

interface IApi {
  addPopup: (value: any) => void
  signOut: () => void
}

interface ErrorResponse {
  detail?: string | Array<{ loc: string[]; msg: string; type: string }>
  message?: string
  /** Status HTTP da resposta. Sem ele a tela nao distingue 404 de 500. */
  status?: number
}

/**
 * Normaliza erros da API para que `detail` seja sempre string.
 * O FastAPI retorna `detail` como array quando há erros de validação Pydantic (422).
 */
function normalizeApiError(data: ErrorResponse | null | undefined): ErrorResponse {
  if (!data) return { detail: 'Erro desconhecido' }
  if (Array.isArray(data.detail)) {
    return {
      ...data,
      detail: data.detail.map(e => e.msg ?? String(e)).join('; '),
    }
  }
  return data as ErrorResponse
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
          const normalized = normalizeApiError(error.response?.data)
          const detail = normalized?.detail
            ? String(normalized.detail)
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
        if (axios.isAxiosError(err))
          throw { ...normalizeApiError(err.response?.data), status: err.response?.status }

        throw err
      })
  }

  public post = async (url: string, params?: any, config?: AxiosRequestConfig): Promise<any> => {
    return this.instance
      .post(url, params, config)
      .then(x => x.data)
      .catch(err => {
        if (err?.message === 'Network Error') throw new Error('Network Error')
        if (axios.isAxiosError(err))
          throw { ...normalizeApiError(err.response?.data), status: err.response?.status }
        throw err
      })
  }

  public put = async (url: string, params?: any, config?: AxiosRequestConfig): Promise<any> => {
    return this.instance
      .put(url, params, config)
      .then(x => x.data)
      .catch(err => {
        if (err?.message === 'Network Error') throw new Error('Network Error')
        if (axios.isAxiosError(err))
          throw { ...normalizeApiError(err.response?.data), status: err.response?.status }
        throw err
      })
  }

  public delete = async (url: string, config?: AxiosRequestConfig): Promise<any> => {
    return this.instance
      .delete(url, config)
      .then(x => x.data)
      .catch(err => {
        if (err?.message === 'Network Error') throw new Error('Network Error')
        if (axios.isAxiosError(err))
          throw { ...normalizeApiError(err.response?.data), status: err.response?.status }
        throw err
      })
  }

  public patch = async (url: string, params?: any, config?: AxiosRequestConfig): Promise<any> => {
    return this.instance
      .patch(url, params, config)
      .then(x => x.data)
      .catch(err => {
        if (err?.message === 'Network Error') throw new Error('Network Error')
        if (axios.isAxiosError(err))
          throw { ...normalizeApiError(err.response?.data), status: err.response?.status }
        throw err
      })
  }
}

export const api = new ApiService()

