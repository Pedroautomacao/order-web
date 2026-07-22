import { ComponentType } from 'react'
import { useSelector } from 'react-redux'
import { Navigate, useLocation, Outlet } from 'react-router-dom'

import { IState } from 'store'
import { Loading } from 'shared'

type IPrivateRoute = {
  component?: ComponentType
  requiredPermissions?: string[]
}

export const PrivateRoute = ({ component: RouteComponent, requiredPermissions = [] }: IPrivateRoute) => {
  const { isAuthenticated, userPermissions, isLoading } = useSelector<IState, IState['user']>(
    state => state.user,
  )
  const location = useLocation()

  if (isLoading) {
    return <Loading />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requiredPermissions.length > 0) {
    const hasPermission = requiredPermissions.some(permission => userPermissions.includes(permission))

    if (!hasPermission) {
      return <Navigate to="/" state={{ from: location }} replace />
    }
  }

  return RouteComponent ? <RouteComponent /> : <Outlet />
}

