import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import './index.css'
import Layout from './Layout'
import Home from './Home'
import HomepageEmployee from './HomeEmployee'
import Inventory from './Inventory'
import Entry from './Entry'
import Transact from './components/legacy/Transact'
import Login from './Login'
import Register from './Register'
import TransactHistory from './TransactHistory'
import Notifications from './Notifications'
import Help from './Help'
import Reports from './Reports'
import EditUserForm from './EditUserForm'
import Maintenance from './Maintenance'

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
          <Route path="home" element={<Home />} />
          <Route path="homeemployee" element={<HomepageEmployee />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="entry" element={<Entry />} />
          <Route path="transact" element={<Transact />} />
          <Route path="transacthistory" element={<TransactHistory />} />
          <Route path="login" element={<Login />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="sales" element={<Sales />} />
          <Route path="register" element={<Register />} />
          <Route path="edituser" element={<EditUserForm />} />

          <Route path="help" element={<Help />} />
          <Route path="reports" element={<Reports />} />
          <Route path="maintenance" element={<Maintenance />} />
        </Route>
      </Routes>
    </Provider>
  </BrowserRouter>
)
