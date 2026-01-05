import { Navigate, useRoutes } from 'react-router-dom'

import SignIn from 'pages/Public/SignIn'
import Admin from 'pages/Admin'
import Dashboard from 'pages/Admin/Dashboard'
import Products from 'pages/Admin/Products'
import Clients from 'pages/Admin/Clients'
import { PublicRoute } from './PublicRoute'
import { PrivateRoute } from './PrivateRoute'

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
              element: <Dashboard />,
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
              path: '',
              element: <Navigate to="dashboard" replace />,
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

