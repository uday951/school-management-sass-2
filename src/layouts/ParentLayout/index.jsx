import React, { useState, useEffect } from 'react'
import { Outlet, useParams, useNavigate, useLocation } from 'react-router-dom'
import Sidebar from '@/components/shared/navigation/Sidebar'
import Navbar from '@/components/shared/navigation/Navbar'
import ContentWrapper from '@/components/shared/layout/ContentWrapper'
import { useSidebarStore } from '@/store'
import { cn } from '@/lib/utils'
import axiosClient from '@/config/axiosClient'

export default function ParentLayout() {
  const { isCollapsed } = useSidebarStore()
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  
  const [students, setStudents] = useState([])
  const [activeChildId, setActiveChildId] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await axiosClient.get('/parent/students')
        if (res.data.success && res.data.data.length > 0) {
          setStudents(res.data.data)
          
          // Determine starting child ID
          let initialId = id
          if (!initialId) {
            initialId = localStorage.getItem('parent_active_child_id') || res.data.data[0]._id
          }
          
          // Verify if initialId is valid
          const isValid = res.data.data.some(s => s._id === initialId)
          const targetId = isValid ? initialId : res.data.data[0]._id
          
          setActiveChildId(targetId)
          localStorage.setItem('parent_active_child_id', targetId)
        }
      } catch (err) {
        console.error('Failed to fetch linked children:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStudents()
  }, [id])

  const handleChildChange = (newId) => {
    setActiveChildId(newId)
    localStorage.setItem('parent_active_child_id', newId)

    const pathParts = location.pathname.split('/')
    const childIdx = pathParts.indexOf('child')
    if (childIdx !== -1 && pathParts[childIdx + 1]) {
      pathParts[childIdx + 1] = newId
      navigate(pathParts.join('/'))
    } else {
      navigate(`/parent/child/${newId}/profile`)
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
        <div className="bg-primary/5 border-b border-border px-4 py-2 flex items-center justify-between text-xs font-semibold text-primary select-none">
          <span>Active Child:</span>
          {loading ? (
            <span className="text-muted-foreground animate-pulse">Loading children...</span>
          ) : (
            <select 
              value={activeChildId}
              onChange={(e) => handleChildChange(e.target.value)}
              className="bg-background border border-border rounded px-2 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer font-medium"
            >
              {students.map(s => (
                <option key={s._id} value={s._id}>
                  {s.firstName} {s.lastName} ({s.class || 'N/A'})
                </option>
              ))}
            </select>
          )}
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
