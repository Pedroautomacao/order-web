import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

import { IState } from 'store'

interface RequirePermissionOrRedirectProps {
  permission: string
  children: ReactNode
  fallbackTo: string
}

/**
 * Se o usuário não tiver a permissão, redireciona para fallbackTo (ex: /admin).
 * Usado para evitar que usuário fiscal acesse /admin/dashboard e receba 403.
 */
function RequirePermissionOrRedirect({
  permission,
  children,
  fallbackTo,
}: RequirePermissionOrRedirectProps) {
  const userPermissions = useSelector<IState, string[]>(state => state.user.userPermissions)
  const hasPermission = userPermissions && userPermissions.includes(permission)

  if (!hasPermission) {
    return <Navigate to={fallbackTo} replace />
  }

  return <>{children}</>
}

export { RequirePermissionOrRedirect }
