import { Outlet } from 'react-router-dom'

import Layout from './Layout'

const Admin = () => (
  <Layout>
    <Outlet />
  </Layout>
)

export default Admin

