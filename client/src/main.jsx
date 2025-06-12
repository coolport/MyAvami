import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import './index.css'
import Layout from './Layout'
import Home from './Home'
import Inventory from './Inventory'
import Entry from './Entry'
import Transact from './Transact'
import Login from './Login'
import TransactHistory from './TransactHistory'
import Notifications from './Notifications'

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
          <Route index element={<Home />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="entry" element={<Entry />} />
          <Route path="transact" element={<Transact />} />
          <Route path="transacthistory" element={<TransactHistory />} />
          <Route path="login" element={<Login />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="sales" element={<Sales />} />
        </Route>
      </Routes>
    </Provider>
  </BrowserRouter>
)
