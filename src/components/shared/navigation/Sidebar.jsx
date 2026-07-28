import React, { useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { useAuthStore, useSidebarStore } from '@/store'
import { ADMIN_MENU, TEACHER_MENU, PARENT_MENU } from '@/constants/menu.constants'
import { ChevronDown, ChevronRight, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Sidebar() {
  const { user } = useAuthStore()
  const { isCollapsed, isOpenMobile, toggleMobileSidebar } = useSidebarStore()
  const location = useLocation()
  
  // Track open state of submenus
  const [openSubmenus, setOpenSubmenus] = useState({})

  const toggleSubmenu = (title) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [title]: !prev[title]
    }))
  }

  // Choose menu based on role
  let menuItems = []
  if (user?.role === 'school_admin' || user?.role === 'super_admin') {
    menuItems = ADMIN_MENU
  } else if (user?.role === 'teacher') {
    menuItems = TEACHER_MENU
  } else if (user?.role === 'parent') {
    menuItems = PARENT_MENU
  }

  const resolvePath = (path) => {
    if (!path) return '';
    if (user?.role === 'parent' && path.includes('/parent/child/1/')) {
      const activeChildId = localStorage.getItem('parent_active_child_id') || '6a62315fb63cbcaf89179eb1';
      return path.replace('/parent/child/1/', `/parent/child/${activeChildId}/`);
    }
    return path;
  }

  const renderMenuItem = (item) => {
    const Icon = item.icon
    const hasChildren = !!item.children
    const isOpen = !!openSubmenus[item.title]
    
    const resolvedPath = resolvePath(item.path)
    const isLinkActive = location.pathname === resolvedPath
    
    // Check if any child is active
    const isChildActive = hasChildren && item.children.some(child => location.pathname === resolvePath(child.path))
    const isParentActive = isLinkActive || isChildActive

    return (
      <div key={item.title} className="w-full">
        {hasChildren ? (
          <div>
            <button
              onClick={() => toggleSubmenu(item.title)}
              className={cn(
                "flex w-full items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer",
                isParentActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                isCollapsed && "md:justify-center md:px-2"
              )}
            >
              <div className="flex items-center gap-3">
                {Icon && <Icon className="h-5 w-5 shrink-0" />}
                {!isCollapsed && <span>{item.title}</span>}
              </div>
              {!isCollapsed && (
                isOpen ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />
              )}
            </button>
            
            {isOpen && !isCollapsed && (
              <div className="mt-1 ml-6 space-y-1 border-l border-border pl-3 animate-in slide-in-from-left-1 duration-100">
                {item.children.map((child) => {
                  const childResolvedPath = resolvePath(child.path)
                  const isSubActive = location.pathname === childResolvedPath
                  return (
                    <Link
                      key={child.title}
                      to={childResolvedPath}
                      className={cn(
                        "flex w-full items-center justify-between px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer",
                        isSubActive 
                          ? "bg-primary text-primary-foreground" 
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <span>{child.title}</span>
                      {child.badge && (
                        <span className={cn(
                          "ml-2 rounded px-1.5 py-0.5 text-[10px] font-bold",
                          isSubActive ? "bg-primary-foreground text-primary" : "bg-primary/10 text-primary"
                        )}>
                          {child.badge}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        ) : (
          <Link
            to={resolvedPath}
            className={cn(
              "flex w-full items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer",
              isLinkActive 
                ? "bg-primary text-primary-foreground" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
              isCollapsed && "md:justify-center md:px-2"
            )}
          >
            <div className="flex items-center gap-3">
              {Icon && <Icon className="h-5 w-5 shrink-0" />}
              {!isCollapsed && <span>{item.title}</span>}
            </div>
            {item.badge && !isCollapsed && (
              <span className={cn(
                "rounded px-1.5 py-0.5 text-[10px] font-bold",
                isLinkActive ? "bg-primary-foreground text-primary" : "bg-primary/10 text-primary"
              )}>
                {item.badge}
              </span>
            )}
          </Link>
        )}
      </div>
    )
  }

  return (
    <>
      {/* Mobile Sidebar overlay */}
      {isOpenMobile && (
        <div 
          onClick={toggleMobileSidebar}
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Sidebar Panel container */}
      <aside className={cn(
        "fixed bottom-0 top-0 left-0 z-50 flex flex-col border-r border-border bg-card text-card-foreground transition-all duration-300",
        // Desktop widths
        isCollapsed ? "md:w-16" : "md:w-64",
        // Mobile behaviors
        isOpenMobile ? "translate-x-0 w-64" : "-translate-x-full w-64 md:translate-x-0"
      )}>
        {/* Header Branding section */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-border">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="h-8 w-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold shrink-0">
              S
            </div>
            {(!isCollapsed || isOpenMobile) && (
              <span className="font-bold text-lg tracking-tight text-foreground truncate">
                SchoolERP
              </span>
            )}
          </div>
          <button
            onClick={toggleMobileSidebar}
            className="inline-flex h-8 w-8 items-center justify-center rounded border border-border bg-card text-foreground hover:bg-muted md:hidden cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation items scrolling viewport */}
        <nav className="flex-1 space-y-1 p-3 overflow-y-auto select-none">
          {menuItems.map(renderMenuItem)}
        </nav>

        {/* Footer Tenant settings context */}
        {(!isCollapsed || isOpenMobile) && (
          <div className="p-4 border-t border-border bg-muted/40">
            <div className="text-[10px] uppercase font-bold text-muted-foreground">Tenant Context</div>
            <div className="text-xs font-semibold text-foreground truncate capitalize">
              {window.__tenant__ || 'Default Branch'}
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
