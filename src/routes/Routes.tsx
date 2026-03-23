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
import Seller from 'pages/Admin/Seller'
import SellerOrderDetail from 'pages/Admin/Seller/SellerOrderDetail'
import Producer from 'pages/Admin/Producer'
import Users from 'pages/Admin/Users'
import Audit from 'pages/Admin/Audit'
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
              element: (
                <RequirePermissionOrRedirect permission="product:read" fallbackTo="/admin">
                  <Products />
                </RequirePermissionOrRedirect>
              ),
            },
            {
              path: 'clients',
              element: (
                <RequirePermissionOrRedirect permission="client:read" fallbackTo="/admin">
                  <Clients />
                </RequirePermissionOrRedirect>
              ),
            },
            {
              path: 'orders',
              element: (
                <RequirePermissionOrRedirect permission="order:read" fallbackTo="/admin">
                  <Orders />
                </RequirePermissionOrRedirect>
              ),
            },
            {
              path: 'orders/:id',
              element: (
                <RequirePermissionOrRedirect permission="order:read" fallbackTo="/admin/orders">
                  <OrderDetail />
                </RequirePermissionOrRedirect>
              ),
            },
            {
              path: 'fiscal',
              element: (
                <RequirePermissionOrRedirect permission="order:bill" fallbackTo="/admin">
                  <Fiscal />
                </RequirePermissionOrRedirect>
              ),
            },
            {
              path: 'fiscal/orders/:id',
              element: (
                <RequirePermissionOrRedirect permission="order:bill" fallbackTo="/admin/fiscal">
                  <FiscalOrderDetail />
                </RequirePermissionOrRedirect>
              ),
            },
            {
              path: 'seller',
              element: (
                <RequirePermissionOrRedirect permission="order:list" fallbackTo="/admin">
                  <Seller />
                </RequirePermissionOrRedirect>
              ),
            },
            {
              path: 'seller/orders/:id',
              element: (
                <RequirePermissionOrRedirect permission="order:list" fallbackTo="/admin/seller">
                  <SellerOrderDetail />
                </RequirePermissionOrRedirect>
              ),
            },
            {
              path: 'producer',
              element: (
                <RequirePermissionOrRedirect permission="order:produce" fallbackTo="/admin">
                  <Producer />
                </RequirePermissionOrRedirect>
              ),
            },
            {
              path: 'users',
              element: (
                <RequirePermissionOrRedirect permission="user:create" fallbackTo="/admin">
                  <Users />
                </RequirePermissionOrRedirect>
              ),
            },
            {
              path: 'audit',
              element: (
                <RequirePermissionOrRedirect permission="audit:read" fallbackTo="/admin">
                  <Audit />
                </RequirePermissionOrRedirect>
              ),
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

