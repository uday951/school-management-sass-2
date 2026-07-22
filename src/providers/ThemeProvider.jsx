import React, { createContext, useContext, useEffect } from 'react'
import { useThemeStore } from '@/store'

const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {}
})

export const ThemeProvider = ({ children }) => {
  const { theme, setTheme } = useThemeStore()

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
