export interface IClient {
  id: number
  name: string
  cpf_cnpj: string
  priority: string
  address: string
  phone_number: string
  observations: string | null
  is_active: boolean
  allow_cash: boolean
  allow_credit: boolean
  credit_limit: number | string
}

export interface IClientCreate {
  name: string
  cpfCnpj: string
  priority: string
  address: string
  phoneNumber: string
  observations?: string
  isActive?: boolean
  allowCash: boolean
  allowCredit: boolean
  creditLimit: number
}

export interface IClientUpdate {
  name?: string
  cpfCnpj?: string
  priority?: string
  address?: string
  phoneNumber?: string
  observations?: string
  isActive?: boolean
  allowCash?: boolean
  allowCredit?: boolean
  creditLimit?: number
}

/** Situação de crédito do cliente (GET /clients/:id/credit) */
export interface IClientCredit {
  client_id: number
  credit_limit: number | string
  outstanding: number | string
  available: number | string
  allow_cash: boolean
  allow_credit: boolean
}

