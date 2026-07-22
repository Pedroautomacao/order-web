import { ComponentType } from 'react'
import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'

import { IState } from 'store'
import { Loading } from 'shared'

type IPublicRoute = {
  component: ComponentType
}

export const PublicRoute = ({ component: RouteComponent }: IPublicRoute) => {
  const { isAuthenticated, isLoading } = useSelector<IState, IState['user']>(state => state.user)
  const location = useLocation()

  if (isLoading) {
    return <Loading />
  }

  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" state={{ from: location }} replace />
  }

  return <RouteComponent />
}

