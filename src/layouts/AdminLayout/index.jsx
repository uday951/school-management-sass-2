import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '@/components/shared/navigation/Sidebar'
import Navbar from '@/components/shared/navigation/Navbar'
import ContentWrapper from '@/components/shared/layout/ContentWrapper'
import { useSidebarStore } from '@/store'
import { cn } from '@/lib/utils'

export default function AdminLayout() {
  const { isCollapsed } = useSidebarStore()

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className={cn(
        "flex flex-col flex-1 min-w-0 transition-all duration-300",
        isCollapsed ? "md:ml-16" : "md:ml-64"
      )}>
        <Navbar />
        <ContentWrapper>
          <main className="p-4 md:p-6">
            <Outlet />
          </main>
        </ContentWrapper>
      </div>
    </div>
  )
}
