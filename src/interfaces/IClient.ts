export interface IClient {
  id: number
  name: string
  cpf_cnpj: string
  priority: string
  address: string
  phone_number: string
  observations: string | null
}

export interface IClientCreate {
  name: string
  cpfCnpj: string
  priority: string
  address: string
  phoneNumber: string
  observations?: string
}

export interface IClientUpdate {
  name?: string
  cpfCnpj?: string
  priority?: string
  address?: string
  phoneNumber?: string
  observations?: string
}

