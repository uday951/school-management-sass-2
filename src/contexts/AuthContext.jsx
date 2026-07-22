import React, { createContext, useContext } from 'react'
import { useAuthStore } from '@/store'

const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  loading: false
})

export const AuthProvider = ({ children }) => {
  const { user, isAuthenticated, login, logout } = useAuthStore()

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        logout,
        loading: false
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
