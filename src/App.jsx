import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { GlobalProvider } from '@/providers/GlobalProvider'
import AppRoutes from '@/routes'

function App() {
  return (
    <BrowserRouter>
      <GlobalProvider>
        <AppRoutes />
      </GlobalProvider>
    </BrowserRouter>
  )
}

export default App
