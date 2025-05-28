import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import './index.css'
import Layout from './Layout'
import Home from './Home'
import Inventory from './Inventory'
import Entry from './Entry'

import { BrowserRouter, Routes, Route } from 'react-router'
import { Provider } from "./components/ui/provider.jsx"

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Provider>

        <Routes>
          <Route path="/" element={<Layout />} >
            {/* index route is basically just default child route */}
            <Route index element={<Home />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="entry" element={<Entry />} />

          </Route>
        </Routes>

      </Provider>
    </BrowserRouter>
  </StrictMode >,
)
