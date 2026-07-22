import React from 'react'
import { ThemeProvider } from './ThemeProvider'
import { AuthProvider } from '@/contexts/AuthContext'

export const GlobalProvider = ({ children }) => {
  return (
    <ThemeProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  )
}
