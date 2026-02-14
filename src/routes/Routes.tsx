import { ReactNode } from 'react'
import { Navigate, useRoutes } from 'react-router-dom'
import { useSelector } from 'react-redux'

import SignIn from 'pages/Public/SignIn'
import Admin from 'pages/Admin'
import Dashboard from 'pages/Admin/Dashboard'
import Products from 'pages/Admin/Products'
import Clients from 'pages/Admin/Clients'
import Orders from 'pages/Admin/Orders'
import OrderDetail from 'pages/Admin/Orders/OrderDetail'
import Fiscal from 'pages/Admin/Fiscal'
import FiscalOrderDetail from 'pages/Admin/Fiscal/FiscalOrderDetail'
import Users from 'pages/Admin/Users'
import { IState } from 'store'
import { PublicRoute } from './PublicRoute'
import { PrivateRoute } from './PrivateRoute'
import { AdminDefaultRedirect } from './AdminDefaultRedirect'

function RequirePermissionOrRedirect({
  permission,
  children,
  fallbackTo,
}: {
  permission: string
  children: ReactNode
  fallbackTo: string
}) {
  const userPermissions = useSelector<IState, string[]>(state => state.user.userPermissions)
  const hasPermission = userPermissions && userPermissions.includes(permission)
  if (!hasPermission) return <Navigate to={fallbackTo} replace />
  return <>{children}</>
}

const Routes = () => {
  return useRoutes([
    {
      path: '/login',
      element: <PublicRoute component={SignIn} />,
    },
    {
      path: '/admin',
      element: <PrivateRoute />,
      children: [
        {
          element: <Admin />,
          children: [
            {
              path: 'dashboard',
              element: (
                <RequirePermissionOrRedirect permission="dashboard:read" fallbackTo="/admin">
                  <Dashboard />
                </RequirePermissionOrRedirect>
              ),
            },
            {
              path: 'products',
              element: <Products />,
            },
            {
              path: 'clients',
              element: <Clients />,
            },
            {
              path: 'orders',
              element: <Orders />,
            },
            {
              path: 'orders/:id',
              element: <OrderDetail />,
            },
            {
              path: 'fiscal',
              element: <Fiscal />,
            },
            {
              path: 'fiscal/orders/:id',
              element: <FiscalOrderDetail />,
            },
            {
              path: 'users',
              element: <Users />,
            },
            {
              path: '',
              element: <AdminDefaultRedirect />,
            },
          ],
        },
      ],
    },
    {
      path: '/',
      element: <Navigate to="/login" replace />,
    },
    {
      path: '*',
      element: <Navigate to="/login" />,
    },
  ])
}

export default Routes

