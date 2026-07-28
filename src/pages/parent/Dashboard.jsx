import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { parentService } from '@/services/parentService'
import { 
  UserCheck, 
  BookOpen, 
  Calendar as CalendarIcon, 
  DollarSign, 
  Bell, 
  Clock, 
  GraduationCap, 
  FileText, 
  ChevronRight, 
  AlertCircle,
  RefreshCw,
  Sparkles
} from 'lucide-react'
import { 
  Button, 
  SimpleCard, 
  StatCard, 
  Badge, 
  Alert 
} from '@/components/shared'
import { cn } from '@/lib/utils'

export default function ParentDashboard() {
  const navigate = useNavigate()
  
  const [children, setChildren] = useState([])
  const [selectedChildId, setSelectedChildId] = useState('')
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Load children and dashboard data
  useEffect(() => {
    const loadPortalData = async () => {
      setLoading(true)
      setError('')
      try {
        const childrenList = await parentService.getChildren()
        setChildren(childrenList)
        const initialChildId = childrenList[0]?._id || childrenList[0]?.id || ''
        setSelectedChildId(initialChildId)

        const data = await parentService.getParentDashboard(initialChildId)
        setDashboardData(data)
      } catch (err) {
        setError('Failed to load parent portal dashboard. Please retry.')
      } finally {
        setLoading(false)
      }
    }
    loadPortalData()
  }, [])

  // Handle switching selected child
  const handleChildSelect = async (childId) => {
    setSelectedChildId(childId)
    setLoading(true)
    try {
      const data = await parentService.getParentDashboard(childId)
      setDashboardData(data)
    } catch (err) {
      // Keep existing data if error
    } finally {
      setLoading(false)
    }
  }

  if (loading && !dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <RefreshCw className="h-8 w-8 text-primary animate-spin" />
        <p className="text-sm font-medium text-muted-foreground">Loading Parent Portal Dashboard...</p>
      </div>
    )
  }

  const child = dashboardData?.childOverview || {}

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 p-4 md:p-6 animate-in fade-in duration-200">
      
      {/* Top Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <GraduationCap className="h-7 w-7 text-primary" />
            Parent Portal Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Monitor academic progress, daily attendance, homework assignments, and upcoming school events for your children.
          </p>
        </div>

        {/* Multi-child selector */}
        {children.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Select Child:</span>
            <select
              value={selectedChildId}
              onChange={(e) => handleChildSelect(e.target.value)}
              className="px-3 py-1.5 text-sm bg-background border border-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {children.map((c) => (
                <option key={c._id || c.id} value={c._id || c.id}>
                  {c.name || `${c.firstName} ${c.lastName}`} ({c.class || 'Grade 10'}-{c.section || 'A'})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Child Profile Card Header */}
      <div className="bg-card p-6 rounded-xl border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xl uppercase">
            {child.name ? child.name.split(' ').map(n=>n[0]).join('') : 'ST'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-foreground">{child.name || 'Student'}</h2>
              <Badge variant="secondary" className="text-xs font-semibold">Active Student</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
              <span><strong>Admission No:</strong> {child.admissionNo || '—'}</span>
              <span>•</span>
              <span><strong>Class:</strong> {child.class || 'Grade 10'} ({child.section || 'A'})</span>
              <span>•</span>
              <span><strong>Roll No:</strong> {child.rollNo || '101'}</span>
            </div>
          </div>
        </div>

        <Button 
          variant="outline" 
          onClick={() => navigate(selectedChildId ? `/parent/child/${selectedChildId}/profile` : '/parent/child-profile')}
          className="flex items-center gap-1.5 self-start md:self-auto"
        >
          View Full Profile Dossier
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card p-5 rounded-xl border border-border shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase">Attendance Rate</span>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">{dashboardData?.attendancePercentage || 94}%</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">37 Present / 40 Days</p>
          </div>
          <div className="h-11 w-11 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <UserCheck className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-card p-5 rounded-xl border border-border shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase">Pending Homework</span>
            <h3 className="text-2xl font-bold text-blue-600 mt-1">{dashboardData?.pendingHomework || 3} Tasks</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Due this week</p>
          </div>
          <div className="h-11 w-11 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
            <BookOpen className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-card p-5 rounded-xl border border-border shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase">Upcoming Exams</span>
            <h3 className="text-2xl font-bold text-purple-600 mt-1">{dashboardData?.upcomingExams || 2} Exams</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Mid-term Schedule</p>
          </div>
          <div className="h-11 w-11 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-600">
            <CalendarIcon className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-card p-5 rounded-xl border border-border shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase">Outstanding Fee Due</span>
            <h3 className="text-2xl font-bold text-rose-600 mt-1">${dashboardData?.feeDue || 450}</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Term 2 Tuition</p>
          </div>
          <div className="h-11 w-11 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-600">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Quick Actions & Notifications Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Quick Navigation Links */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-4">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Quick Parent Portal Actions
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'Attendance Log', path: selectedChildId ? `/parent/child/${selectedChildId}/attendance` : '/parent/attendance', icon: UserCheck, color: 'text-emerald-600 bg-emerald-50' },
                { label: 'Fee Payments', path: selectedChildId ? `/parent/child/${selectedChildId}/fees` : '/parent/fees', icon: DollarSign, color: 'text-rose-600 bg-rose-50' },
                { label: 'Homework Planner', path: selectedChildId ? `/parent/child/${selectedChildId}/homework` : '/parent/homework', icon: BookOpen, color: 'text-blue-600 bg-blue-50' },
                { label: 'Report Cards', path: selectedChildId ? `/parent/child/${selectedChildId}/results` : '/parent/results', icon: GraduationCap, color: 'text-purple-600 bg-purple-50' },
                { label: 'Apply Leave', path: selectedChildId ? `/parent/child/${selectedChildId}/leaves` : '/parent/leaves', icon: Clock, color: 'text-amber-600 bg-amber-50' },
                { label: 'Transport Bus', path: selectedChildId ? `/parent/child/${selectedChildId}/transport` : '/parent/transport', icon: FileText, color: 'text-cyan-600 bg-cyan-50' }
              ].map((act, idx) => (
                <button
                  key={idx}
                  onClick={() => navigate(act.path)}
                  className="p-4 border border-border rounded-lg hover:border-primary transition-all flex flex-col items-center text-center space-y-2 cursor-pointer bg-background hover:bg-muted/40 group"
                >
                  <div className={cn("p-2.5 rounded-full transition-transform group-hover:scale-110", act.color)}>
                    <act.icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold text-foreground">{act.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Notifications & Circulars Feed */}
        <div className="space-y-6">
          <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Bell className="h-5 w-5 text-amber-500" />
                Announcements & Alerts
              </h3>
              <Badge variant="outline" className="text-xs">Live Updates</Badge>
            </div>

            <div className="space-y-3">
              {(dashboardData?.notifications || []).map((note) => (
                <div key={note.id} className="p-3.5 border border-border rounded-lg bg-muted/20 space-y-1 hover:border-primary/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-primary">{note.type}</span>
                    <span className="text-[10px] text-muted-foreground">{note.date}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-foreground">{note.title}</h4>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}
