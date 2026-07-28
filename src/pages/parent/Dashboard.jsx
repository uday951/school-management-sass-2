import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useChildStore } from '@/store'
import axiosClient from '@/config/axiosClient'
import {
  PageContainer,
  PageHeader,
  SimpleCard,
  Button,
  Badge,
  SkeletonLoader
} from '@/components/shared'
import {
  User,
  Calendar,
  CreditCard,
  BookOpen,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  FileText,
  MessageSquare
} from 'lucide-react'

export default function ParentDashboard() {
  const navigate = useNavigate()
  const { activeChild } = useChildStore()
  const [summary, setSummary] = useState(null)
  const [notices, setNotices] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchDashboardData = async () => {
    if (!activeChild) return
    setLoading(true)
    try {
      const childId = activeChild.id || activeChild._id
      const [summaryRes, noticesRes] = await Promise.all([
        axiosClient.get(`/portal/child/${childId}/summary`),
        axiosClient.get('/portal/notices')
      ])

      if (summaryRes.data.success) {
        setSummary(summaryRes.data.data)
      }
      if (noticesRes.data.success) {
        setNotices(noticesRes.data.data)
      }
    } catch (err) {
      console.error('Error fetching parent dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [activeChild])

  const childId = activeChild?.id || activeChild?._id

  if (!activeChild) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold text-foreground">No Children Linked</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm">
            We couldn't find any student records linked to your parent portal account. Please contact administration.
          </p>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageHeader
        title={`Welcome Back, Parent`}
        subtitle={`Managing portals and academic dossier updates for ${activeChild.firstName} ${activeChild.lastName}.`}
        actions={
          <Button
            variant="outline"
            className="flex items-center gap-1.5"
            onClick={() => navigate(`/parent/child/${childId}/profile`)}
          >
            View Dossier <ArrowRight className="h-4 w-4" />
          </Button>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonLoader key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Attendance KPI */}
          <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm hover:shadow transition-all duration-300 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Attendance Rate</p>
                <h3 className="text-3xl font-bold mt-1 text-emerald-600">{summary?.attendance?.rate}%</h3>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600">
                <Calendar className="h-5 w-5" />
              </div>
            </div>
            <button
              onClick={() => navigate(`/parent/child/${childId}/attendance`)}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 mt-2 cursor-pointer"
            >
              View calendar logs <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {/* Fees KPI */}
          <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm hover:shadow transition-all duration-300 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Outstanding Fees</p>
                <h3 className="text-3xl font-bold mt-1 text-rose-600">${summary?.fees?.outstanding}</h3>
              </div>
              <div className="p-3 rounded-xl bg-rose-500/10 text-rose-600">
                <CreditCard className="h-5 w-5" />
              </div>
            </div>
            <button
              onClick={() => navigate(`/parent/child/${childId}/fees`)}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 mt-2 cursor-pointer"
            >
              Pay or view ledger <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {/* Library Books KPI */}
          <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm hover:shadow transition-all duration-300 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Issued Books</p>
                <h3 className="text-3xl font-bold mt-1 text-amber-600">{summary?.library?.borrowedBooks} Books</h3>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600">
                <BookOpen className="h-5 w-5" />
              </div>
            </div>
            <button
              onClick={() => navigate(`/parent/child/${childId}/library`)}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 mt-2 cursor-pointer"
            >
              View borrow cards <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {/* Class Code */}
          <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm hover:shadow transition-all duration-300 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Classroom Details</p>
                <h3 className="text-2xl font-bold mt-1.5 text-foreground truncate">{activeChild.class}</h3>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600">
                <User className="h-5 w-5" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Section: {activeChild.section} • Roll Number: {activeChild.rollNo}</p>
          </div>
        </div>
      )}

      {/* Main Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Quick Actions + Notice board */}
        <div className="lg:col-span-2 space-y-6">
          <SimpleCard title="Child Core Portlets">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => navigate(`/parent/child/${childId}/homework`)}
                className="flex flex-col items-center justify-center p-4 rounded-xl border border-border/85 bg-primary/5 hover:bg-primary/10 text-primary transition duration-200 cursor-pointer"
              >
                <FileText className="h-6 w-6 mb-2" />
                <span className="text-xs font-bold">Homework</span>
              </button>
              <button
                onClick={() => navigate(`/parent/child/${childId}/results`)}
                className="flex flex-col items-center justify-center p-4 rounded-xl border border-border/85 bg-emerald-50/50 hover:bg-emerald-100/40 text-emerald-600 transition duration-200 cursor-pointer"
              >
                <TrendingUp className="h-6 w-6 mb-2" />
                <span className="text-xs font-bold">Report Card</span>
              </button>
              <button
                onClick={() => navigate(`/parent/child/${childId}/leaves`)}
                className="flex flex-col items-center justify-center p-4 rounded-xl border border-border/85 bg-amber-50/50 hover:bg-amber-100/40 text-amber-600 transition duration-200 cursor-pointer"
              >
                <Calendar className="h-6 w-6 mb-2" />
                <span className="text-xs font-bold">Leaves Tracker</span>
              </button>
              <button
                onClick={() => navigate(`/parent/child/${childId}/transport`)}
                className="flex flex-col items-center justify-center p-4 rounded-xl border border-border/85 bg-blue-50/50 hover:bg-blue-100/40 text-blue-600 transition duration-200 cursor-pointer"
              >
                <CreditCard className="h-6 w-6 mb-2" />
                <span className="text-xs font-bold">Transit Map</span>
              </button>
            </div>
          </SimpleCard>

          <SimpleCard title="School Notices Circulars">
            {loading ? (
              <SkeletonLoader count={3} className="h-12 mb-2" />
            ) : notices.length === 0 ? (
              <p className="text-xs text-muted-foreground p-2">No active announcements or notices currently posted.</p>
            ) : (
              <div className="space-y-4">
                {notices.map((n) => (
                  <div key={n._id} className="p-3 border border-border/80 rounded-xl hover:bg-muted/30 transition">
                    <div className="flex justify-between items-start mb-1.5">
                      <h4 className="text-xs font-bold text-foreground">{n.title}</h4>
                      <Badge className="bg-primary/10 text-primary capitalize text-[9px]">{n.category}</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-normal">{n.content}</p>
                    <div className="text-[9px] text-muted-foreground mt-2">
                      Posted: {new Date(n.publishDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SimpleCard>
        </div>

        {/* Right column: Emergency contact details */}
        <div className="lg:col-span-1 space-y-6">
          <SimpleCard title="Emergency Contacts">
            <div className="space-y-4 text-xs font-semibold leading-relaxed">
              <div className="p-3 border border-border/80 rounded-xl bg-card">
                <p className="text-muted-foreground uppercase text-[9px] tracking-wider mb-1">Campus Registrar</p>
                <p className="text-foreground">Administrative Desk</p>
                <p className="text-primary hover:underline cursor-pointer mt-1 font-bold">+1 (555) 019-2834</p>
              </div>
              <div className="p-3 border border-border/80 rounded-xl bg-card">
                <p className="text-muted-foreground uppercase text-[9px] tracking-wider mb-1">School Medical Unit</p>
                <p className="text-foreground">Dr. Helen Cho (Campus Nurse)</p>
                <p className="text-primary hover:underline cursor-pointer mt-1 font-bold">+1 (555) 019-3388</p>
              </div>
            </div>
          </SimpleCard>
        </div>
      </div>
    </PageContainer>
  )
}
