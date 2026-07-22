import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import PageContainer from '@/components/shared/layout/PageContainer'
import PageHeader from '@/components/shared/layout/PageHeader'
import { cn } from '@/lib/utils'

// Lazy loaded subviews
import ClassList from './academics/ClassList'
import SubjectList from './academics/SubjectList'

export default function Academics() {
  const location = useLocation()
  const navigate = useNavigate()
  
  const isSubjectsTab = location.pathname.includes('/subjects')

  return (
    <PageContainer>
      <PageHeader 
        title="Academic Administration" 
        subtitle="Manage class register databases, school room capacities, and course subject configurations."
      />

      {/* Tabs Menu Navigation */}
      <div className="border-b border-border select-none mb-6">
        <nav className="flex gap-6 -mb-px">
          <button
            onClick={() => navigate('/admin/academics/classes')}
            className={cn(
              "pb-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap",
              !isSubjectsTab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Class Register
          </button>
          <button
            onClick={() => navigate('/admin/academics/subjects')}
            className={cn(
              "pb-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap",
              isSubjectsTab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Subject Setup
          </button>
        </nav>
      </div>

      {/* Tab Panels */}
      <div className="w-full">
        {!isSubjectsTab ? <ClassList /> : <SubjectList />}
      </div>
    </PageContainer>
  )
}
