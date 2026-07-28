import React, { useEffect } from 'react'
import { Outlet, useNavigate, useParams, useLocation } from 'react-router-dom'
import Sidebar from '@/components/shared/navigation/Sidebar'
import Navbar from '@/components/shared/navigation/Navbar'
import ContentWrapper from '@/components/shared/layout/ContentWrapper'
import { useSidebarStore, useChildStore } from '@/store'
import axiosClient from '@/config/axiosClient'
import { cn } from '@/lib/utils'

export default function ParentLayout() {
  const { isCollapsed } = useSidebarStore()
  const { children, activeChild, setChildren, setActiveChild } = useChildStore()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const res = await axiosClient.get('/portal/my-children')
        if (res.data.success && Array.isArray(res.data.data)) {
          setChildren(res.data.data)
        }
      } catch (err) {
        console.error('Error fetching parent children:', err)
      }
    }
    fetchChildren()
  }, [setChildren])

  const handleChildChange = (e) => {
    const childId = e.target.value
    const child = children.find(c => c.id === childId || c._id === childId)
    if (child) {
      setActiveChild(child)
      
      // If we are currently on a child-specific page, we want to update the URL with the new child ID!
      // Child routes typically look like: /parent/child/:id/homework, /parent/child/:id/profile, etc.
      const match = location.pathname.match(/\/parent\/child\/[^\/]+\/([^\/]+)/)
      if (match && match[1]) {
        navigate(`/parent/child/${child.id || child._id}/${match[1]}`)
      } else {
        navigate('/parent/dashboard')
      }
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className={cn(
        "flex flex-col flex-1 min-w-0 transition-all duration-300",
        isCollapsed ? "md:ml-16" : "md:ml-64"
      )}>
        <Navbar />
        {children.length > 0 && (
          <div className="bg-primary/5 border-b border-border px-4 py-2 flex items-center justify-between text-xs font-semibold text-primary">
            <span>Active Child:</span>
            <select
              value={activeChild?.id || activeChild?._id || ''}
              onChange={handleChildChange}
              className="bg-background border border-border rounded px-2 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              {children.map(c => (
                <option key={c.id || c._id} value={c.id || c._id}>
                  {c.firstName} {c.lastName} ({c.class || 'No Class'})
                </option>
              ))}
            </select>
          </div>
        )}
        <ContentWrapper>
          <main className="p-4 md:p-6">
            <Outlet />
          </main>
        </ContentWrapper>
      </div>
    </div>
  )
}
