import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '@/components/shared/navigation/Sidebar'
import Navbar from '@/components/shared/navigation/Navbar'
import ContentWrapper from '@/components/shared/layout/ContentWrapper'
import { useSidebarStore } from '@/store'
import { cn } from '@/lib/utils'

export default function ParentLayout() {
  const { isCollapsed } = useSidebarStore()

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className={cn(
        "flex flex-col flex-1 min-w-0 transition-all duration-300",
        isCollapsed ? "md:ml-16" : "md:ml-64"
      )}>
        <Navbar />
        <div className="bg-primary/5 border-b border-border px-4 py-2 flex items-center justify-between text-xs font-semibold text-primary">
          <span>Active Child:</span>
          <select className="bg-background border border-border rounded px-2 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer">
            <option>Alex Doe (Grade 10-A)</option>
            <option>Jane Doe (Grade 8-B)</option>
          </select>
        </div>
        <ContentWrapper>
          <main className="p-4 md:p-6">
            <Outlet />
          </main>
        </ContentWrapper>
      </div>
    </div>
  )
}
