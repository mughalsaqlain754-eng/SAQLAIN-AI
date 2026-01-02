import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
// 1. IMPORT HASHROUTER
import { HashRouter } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* 2. WRAP YOUR APP IN HASHROUTER INSTEAD OF BROWSERROUTER */}
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
)
