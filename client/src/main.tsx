import { createRoot } from 'react-dom/client'
import Layout from './Layout'
import Home from './Home'
import HomepageEmployee from './HomeEmployee'
import Inventory from './Inventory'
import Login from './Login'
import TransactHistory from './TransactHistory'
import Notifications from './Notifications'
import Help from './Help'
import Reports from './Reports'
import EditUserForm from './EditUserForm'
import Maintenance from './Maintenance'
import Registration from './Registration'
import Unauthorized from './Unauthorized'

import RegisterSupplierForm from './RegisterSupplierForm'
import RegisterProductForm from './RegisterProductForm'
import RegisterUserForm from './RegisterUserForm'
import Sale from './Sale'

import ProtectedRoute from './components/ProtectedRoute'

import { BrowserRouter, Routes, Route } from 'react-router'
import { Provider } from "./components/ui/provider"

const adminOnly = (element: React.ReactNode) => (
  <ProtectedRoute allowedRoles={['admin']}>{element}</ProtectedRoute>
)

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Provider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Login />} />
          <Route path="unauthorized" element={<Unauthorized />} />

          <Route path="/login" element={adminOnly(<Login />)} />
          <Route path="/home" element={adminOnly(<Home />)} />
          <Route path="/maintenance" element={adminOnly(<Maintenance />)} />
          <Route path="/registration" element={adminOnly(<Registration />)} />
          <Route path="/reports" element={adminOnly(<Reports />)} />
          <Route path="/entry" element={adminOnly(<RegisterProductForm />)} />
          <Route path="/edituser" element={adminOnly(<EditUserForm />)} />
          <Route path="/registersupplier" element={adminOnly(<RegisterSupplierForm />)} />
          <Route path="/register" element={adminOnly(<RegisterUserForm />)} />
          <Route path="help" element={<Help />} />

          <Route
            path="inventory"
            element={
              <ProtectedRoute allowedRoles={['admin', 'employee']}>
                <Inventory />
              </ProtectedRoute>
            }
          />
          <Route
            path="sales"
            element={
              <ProtectedRoute allowedRoles={['admin', 'employee']}>
                <Sale />
              </ProtectedRoute>
            }
          />
          <Route
            path="transacthistory"
            element={
              <ProtectedRoute allowedRoles={['admin', 'employee']}>
                <TransactHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="notifications"
            element={
              <ProtectedRoute allowedRoles={['admin', 'employee']}>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route path="homeemployee" element={<HomepageEmployee />} />
        </Route>
      </Routes>
    </Provider>
  </BrowserRouter>
)
