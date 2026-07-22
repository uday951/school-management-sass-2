import React, { useState } from 'react'
import { useAuthStore, useSidebarStore } from '@/store'
import { useTheme } from '@/providers/ThemeProvider'
import { Bell, Sun, Moon, User, LogOut, Search, Menu } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const { toggleSidebar, toggleMobileSidebar } = useSidebarStore()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleMobileSidebar}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-foreground hover:bg-muted md:hidden cursor-pointer"
        >
          <Menu className="h-5 w-5" />
        </button>
        <button
          onClick={toggleSidebar}
          className="hidden md:inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-foreground hover:bg-muted cursor-pointer"
        >
          <Menu className="h-5 w-5" />
        </button>
        
        <div className="relative hidden max-w-xs sm:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search resources..."
            className="h-9 w-64 rounded-md border border-input bg-background pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            readOnly
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-foreground hover:bg-muted cursor-pointer"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4 text-yellow-500" /> : <Moon className="h-4 w-4" />}
        </button>

        <button
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-foreground hover:bg-muted cursor-pointer"
          title="View Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
        </button>

        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 rounded-full border border-border p-1 pr-3 hover:bg-muted cursor-pointer focus:outline-none"
          >
            <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold capitalize">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <span className="hidden text-sm font-medium md:inline-block capitalize">
              {user?.name || 'Guest User'}
            </span>
          </button>
          
          {profileDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-30" 
                onClick={() => setProfileDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-48 rounded-md border border-border bg-card p-1 shadow-md z-45 animate-in fade-in duration-100">
                <div className="px-2 py-1.5 text-xs text-muted-foreground border-b border-border mb-1 capitalize">
                  Role: {user?.role?.replace('_', ' ') || 'Guest'}
                </div>
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false)
                    if (user?.role === 'teacher') navigate('/teacher/profile')
                    else if (user?.role === 'parent') navigate('/parent/child/1/profile')
                    else navigate('/admin/settings')
                  }}
                  className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-foreground hover:bg-muted cursor-pointer"
                >
                  <User className="h-4 w-4" />
                  My Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
