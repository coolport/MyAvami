import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import './index.css'
import Layout from './Layout'
import Home from './Home'
import HomepageEmployee from './HomeEmployee'
import Inventory from './Inventory'
import Transact from './components/legacy/Transact'
import Login from './Login'
import TransactHistory from './TransactHistory'
import Notifications from './Notifications'
import Help from './Help'
import Reports from './Reports'
import EditUserForm from './EditUserForm'
import Maintenance from './Maintenance'
import Registration from './Registration';
import Unauthorized from './Unauthorized'

import RegisterSupplierForm from './RegisterSupplierForm'
import RegisterProductForm from './RegisterProductForm'
import RegisterUserForm from './RegisterUserForm'

import ProtectedRoute from './components/ProtectedRoute'

import Sales from './Sale'

import { BrowserRouter, Routes, Route } from 'react-router'
import { Provider } from "./components/ui/provider.jsx"

createRoot(document.getElementById('root')).render(
  // temp removed strict mode for useeffects readabilityh
  <BrowserRouter>
    <Provider>
      <Routes>
        <Route path="/" element={<Layout />} >
          {/* index route is basically just default child route */}
          <Route index element={<Login />} />
          <Route path="transact" element={<Transact />} />
          <Route path="transacthistory" element={<TransactHistory />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="homeemployee" element={<HomepageEmployee />} />
          <Route path="help" element={<Help />} />



          <Route path="unauthorized" element={<Unauthorized />} />

          <Route
            path="/login"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Login />
              </ProtectedRoute>
            }
          />

          <Route
            path="/registersupplier"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <RegisterSupplierForm />
              </ProtectedRoute>
            }
          />

          <Route
            path="/home"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <ProtectedRoute allowedRoles={['admin', 'employee']}>
                <Inventory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales"
            element={
              <ProtectedRoute allowedRoles={['admin', 'employee']}>
                <Sales />
              </ProtectedRoute>
            }
          />
          <Route
            path="/entry"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <RegisterProductForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/register"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <RegisterUserForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edituser"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <EditUserForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/home"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Maintenance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/maintenance"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Maintenance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/registration"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Registration />
              </ProtectedRoute>
            }
          />

        </Route>
      </Routes>
    </Provider>
  </BrowserRouter>
)
