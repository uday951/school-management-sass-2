import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { teacherService } from '@/services/teacherService'
import { 
  Users, 
  BookOpen, 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle2, 
  Bell, 
  GraduationCap, 
  FileSpreadsheet, 
  BookMarked, 
  Mail, 
  ChevronRight, 
  RefreshCw, 
  Sparkles,
  AlertCircle
} from 'lucide-react'
import { Button, Badge, Alert } from '@/components/shared'
import { cn } from '@/lib/utils'

export default function TeacherDashboard() {
  const navigate = useNavigate()

  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await teacherService.getTeacherDashboard()
        setDashboardData(data)
      } catch (err) {
        setError('Failed to load teacher portal dashboard. Please retry.')
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  if (loading && !dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <RefreshCw className="h-8 w-8 text-primary animate-spin" />
        <p className="text-sm font-medium text-muted-foreground">Loading Teacher Portal Dashboard...</p>
      </div>
    )
  }

  const profile = dashboardData?.teacherProfile || {}
  const stats = dashboardData || {}

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 p-4 md:p-6 animate-in fade-in duration-200">
      
      {/* Top Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <GraduationCap className="h-7 w-7 text-primary" />
            Teacher Portal Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your daily class schedules, student attendance, subject assignments, and academic announcements.
          </p>
        </div>

        <Button 
          variant="outline"
          onClick={() => navigate('/teacher/profile')}
          className="flex items-center gap-1.5 self-start md:self-auto"
        >
          View Profile Details
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Teacher Info Card Header */}
      <div className="bg-card p-6 rounded-xl border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xl uppercase">
            {profile.name ? profile.name.split(' ').map(n=>n[0]).join('') : 'TC'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-foreground">{profile.name || 'Faculty Member'}</h2>
              <Badge variant="secondary" className="text-xs font-semibold">{profile.designation || 'Teacher'}</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
              <span><strong>Employee ID:</strong> {profile.employeeId || 'TCH-2026-08'}</span>
              <span>•</span>
              <span><strong>Department:</strong> {profile.department || 'Science'}</span>
              <span>•</span>
              <span><strong>Email:</strong> {profile.email || 'teacher@schoolerp.edu'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Classroom Attendance</span>
            <p className="text-xl font-bold text-emerald-600">{stats.attendanceSummary?.presentRate || 96.4}% Present</p>
          </div>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card p-5 rounded-xl border border-border shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase">Assigned Classes</span>
            <h3 className="text-2xl font-bold text-primary mt-1">{stats.assignedClassesCount || 3} Classes</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Active sections</p>
          </div>
          <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <BookOpen className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-card p-5 rounded-xl border border-border shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase">Today's Schedule</span>
            <h3 className="text-2xl font-bold text-blue-600 mt-1">{stats.todaysScheduleCount || 4} Periods</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Scheduled today</p>
          </div>
          <div className="h-11 w-11 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
            <Clock className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-card p-5 rounded-xl border border-border shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase">Total Students</span>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">{stats.totalStudentCount || 112} Students</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Enrolled across classes</p>
          </div>
          <div className="h-11 w-11 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <Users className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-card p-5 rounded-xl border border-border shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase">Upcoming Exams</span>
            <h3 className="text-2xl font-bold text-purple-600 mt-1">{stats.upcomingExamsCount || 2} Exams</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Invigilation / Subjects</p>
          </div>
          <div className="h-11 w-11 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-600">
            <CalendarIcon className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Schedule & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Today's Schedule Timeline & Assigned Classes */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Today's Schedule */}
          <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Today's Class Schedule
              </h3>
              <Badge variant="outline" className="text-xs font-semibold">Live Timeline</Badge>
            </div>

            <div className="space-y-3">
              {(stats.todaysSchedule || []).map((sch) => (
                <div key={sch.id} className="p-3.5 border border-border rounded-lg bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                      {sch.period}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">{sch.subject} ({sch.className}-{sch.section})</h4>
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                        <span>Time: {sch.time}</span>
                        <span>•</span>
                        <span>Location: {sch.room}</span>
                      </p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => navigate('/teacher/attendance/mark')}
                    className="shrink-0 text-xs"
                  >
                    Mark Attendance
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-4">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Quick Classroom Actions
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'My Classes', path: '/teacher/classes', icon: BookOpen, color: 'text-primary bg-primary/10' },
                { label: 'Mark Attendance', path: '/teacher/attendance/mark', icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
                { label: 'Leave Requests', path: '/teacher/attendance/leaves', icon: Clock, color: 'text-amber-600 bg-amber-50' },
                { label: 'Homework Logs', path: '/teacher/homework', icon: BookMarked, color: 'text-blue-600 bg-blue-50' },
                { label: 'Grades Entry', path: '/teacher/exams/marks', icon: FileSpreadsheet, color: 'text-purple-600 bg-purple-50' },
                { label: 'Parent Chats', path: '/teacher/communication', icon: Mail, color: 'text-cyan-600 bg-cyan-50' }
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

        {/* Announcements Feed */}
        <div className="space-y-6">
          <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Bell className="h-5 w-5 text-amber-500" />
                Faculty Announcements
              </h3>
              <Badge variant="outline" className="text-xs">Circulars</Badge>
            </div>

            <div className="space-y-3">
              {(stats.announcements || []).map((note) => (
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
