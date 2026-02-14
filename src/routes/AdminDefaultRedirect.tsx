import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

import { IState } from 'store'

/**
 * Redireciona /admin para a primeira rota que o usuário tem permissão.
 * Usuário só com permissão fiscal vai para /admin/fiscal em vez do dashboard.
 */
const routeByPermission: { permission: string; path: string }[] = [
  { permission: 'dashboard:read', path: '/admin/dashboard' },
  { permission: 'order:bill', path: '/admin/fiscal' },
  { permission: 'order:read', path: '/admin/orders' },
  { permission: 'product:read', path: '/admin/products' },
  { permission: 'client:read', path: '/admin/clients' },
  { permission: 'user:create', path: '/admin/users' },
]

export const AdminDefaultRedirect = () => {
  const userPermissions = useSelector<IState, string[]>(state => state.user.userPermissions)

  const firstAllowed = routeByPermission.find(
    ({ permission }) => userPermissions && userPermissions.includes(permission),
  )

  if (firstAllowed) {
    return <Navigate to={firstAllowed.path} replace />
  }

  return <Navigate to="/admin/dashboard" replace />
}
