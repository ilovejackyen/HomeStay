import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { BookingProvider } from './context/BookingContext'
import './index.css'
import './i18n'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BookingProvider>
      <App />
    </BookingProvider>
  </React.StrictMode>,
)
