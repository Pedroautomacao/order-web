export interface IUserState {
  isAuthenticated: boolean
  userPermissions: string[]
  isLoading: boolean
  userId: number
}

export interface ILogin {
  username: string
  password: string
}

export interface IAuthentication {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface IUser {
  id: number
  username: string
  email: string | null
  first_name: string
  last_name: string
  cpf: string
  is_active: boolean
  roles: IRole[]
}

export interface IMenuGroup {
  id: number
  code: string
  name: string
  description: string | null
  permissions?: IPermission[]
}

export interface IRole {
  id: number
  name: string
  permissions: IPermission[]
  menu_groups?: IMenuGroup[]
}

export interface IPermission {
  id: number
  code: string
  description: string | null
}

export interface IUserCreate {
  username: string
  first_name: string
  last_name: string
  cpf: string
  email?: string | null
  is_active: boolean
  password: string
  roleIds?: number[]
}

export interface IUserUpdate {
  first_name?: string
  last_name?: string
  email?: string | null
  is_active?: boolean
  password?: string
  roleIds?: number[]
}

/** Nomes de exibição dos grupos de permissão (roles) */
export const ROLE_DISPLAY_NAMES: Record<string, string> = {
  admin: 'Admin',
  order_creator: 'Vendedor',
  order_producer: 'Produtor',
  fiscal: 'Fiscal',
  tech: 'Tech',
}

/** Rótulos em português para permissões (ex.: ao criar grupos de menu) */
export const PERMISSION_LABELS_PT: Record<string, string> = {
  'client:read': 'Visualizar/listar clientes',
  'client:create': 'Criar cliente',
  'client:update': 'Atualizar cliente',
  'client:delete': 'Excluir cliente',
  'product:read': 'Visualizar/listar produtos',
  'product:create': 'Criar produto',
  'product:update': 'Atualizar produto',
  'product:delete': 'Excluir produto',
  'unit:create': 'Criar unidade de medida',
  'unit:update': 'Atualizar unidade de medida',
  'unit:delete': 'Excluir unidade de medida',
  'unit:list': 'Listar unidades de medida',
  'order:create': 'Criar pedido',
  'order:read': 'Visualizar pedido',
  'order:list': 'Listar pedidos',
  'order:cancel': 'Cancelar pedido',
  'order:reset_production': 'Reiniciar produção do pedido',
  'order:set_priority': 'Definir prioridade do pedido',
  'order:bill': 'Marcar pedido como faturado',
  'order_item_break:read': 'Visualizar quebras de item',
  'order_item_break:create': 'Registrar quebra de item',
  'order_item_break:update': 'Atualizar quebra de item',
  'order_item_break:delete': 'Excluir quebra de item',
  'rankings:read': 'Visualizar rankings',
  'user:create': 'Criar usuário',
  'user:update': 'Atualizar usuário',
  'user:reset_password': 'Redefinir senha de usuário',
  'user:delete': 'Excluir usuário',
  'audit:read': 'Visualizar logs de auditoria',
  'dashboard:read': 'Visualizar dashboard',
  'analytics:read': 'Visualizar relatórios',
}

