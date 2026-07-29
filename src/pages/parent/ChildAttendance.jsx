import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useChildStore } from '@/store'
import axiosClient from '@/config/axiosClient'
import { 
  PageHeader, 
  PageContainer, 
  SimpleCard, 
  StatCard, 
  Button, 
  Badge
} from '@/components/shared'
import { Calendar, UserCheck, UserX, AlertTriangle, ArrowLeft } from 'lucide-react'

export default function ChildAttendance() {
  const { activeChild } = useChildStore()
  const params = useParams()
  const id = params.id || activeChild?._id || activeChild?.id
  const navigate = useNavigate()
  
  // Data States
  const [stats, setStats] = useState({ workingDays: 0, presentDays: 0, absentDays: 0, lateDays: 0, rate: 0 })
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch child stats and calendar logs
  const fetchChildAttendance = async () => {
    setLoading(true)
    try {
      const logsRes = await axiosClient.get(`/portal/child/${id}/attendance`)
      if (logsRes.data.success) {
        const { records, summary } = logsRes.data.data || { records: [], summary: {} }
        setAttendanceRecords(records)
        const lateDays = Array.isArray(records) ? records.filter(r => r.status === 'late').length : 0
        
        setStats({
          workingDays: summary.totalMarked || 0,
          presentDays: summary.presentDays || 0,
          absentDays: summary.absentDays || 0,
          lateDays: lateDays || summary.lateDays || 0,
          rate: summary.attendanceRate || 0
        })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchChildAttendance()
  }, [id])

  // Simple Month Calendar Generator
  const generateMonthDays = () => {
    const days = []
    const baseDate = new Date()
    const year = baseDate.getFullYear()
    const month = baseDate.getMonth()
    const firstDayOfMonth = new Date(year, month, 1).getDay()
    const totalDays = new Date(year, month + 1, 0).getDate()
    
    for (let day = 1; day <= totalDays; day++) {
      const dayDate = new Date(year, month, day)
      const dateString = dayDate.toISOString().split('T')[0]
      const foundRecord = Array.isArray(attendanceRecords) 
        ? attendanceRecords.find(r => {
            if (!r || !r.date) return false;
            const d = new Date(r.date);
            if (isNaN(d.getTime())) return false;
            return d.toISOString().split('T')[0] === dateString;
          })
        : null;

      let status = 'present'
      if (foundRecord) {
        status = foundRecord.status
      } else {
        const dayOfWeek = dayDate.getDay()
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          status = 'holiday'
        }
      }
      
      days.push({ day, status })
    }
    return { days, firstDayOfMonth }
  }

  const { days: calendarDays, firstDayOfMonth } = generateMonthDays()

  return (
    <PageContainer>
      <PageHeader 
        title="Child Attendance Tracker"
        subtitle="Track monthly attendance patterns, working days, and late register history."
        actions={
          <Button variant="outline" className="flex items-center gap-1.5" onClick={() => navigate('/parent/dashboard')}>
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Button>
        }
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Attendance Rate" value={`${stats.rate}%`} change="Excellent" icon={UserCheck} />
        <StatCard title="Total Working Days" value={`${stats.workingDays} Days`} icon={Calendar} />
        <StatCard title="Present Days" value={`${stats.presentDays} Days`} icon={UserCheck} />
        <StatCard title="Absent Days" value={`${stats.absentDays} Days`} changeType="negative" icon={UserX} />
      </div>

      {/* Monthly Attendance Calendar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <SimpleCard title="Monthly Calendar Tracker">
            <div className="grid grid-cols-7 gap-2 text-center font-bold text-xs text-muted-foreground uppercase border-b border-border pb-2 mb-4 select-none">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>
            
            <div className="grid grid-cols-7 gap-2 text-center select-none">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="h-10 border border-transparent"></div>
              ))}
              
              {calendarDays.map((d) => {
                let colorClass = 'bg-emerald-600/10 text-emerald-600 border-emerald-600/20'
                if (d.status === 'absent') colorClass = 'bg-rose-600/10 text-rose-600 border-rose-600/20'
                if (d.status === 'late') colorClass = 'bg-amber-600/10 text-amber-600 border-amber-600/20'
                if (d.status === 'holiday') colorClass = 'bg-blue-600/10 text-blue-600 border-blue-600/20'
                
                return (
                  <div key={d.day} className={`h-12 flex flex-col justify-between p-1.5 rounded-lg border text-sm font-semibold ${colorClass}`}>
                    <span>{d.day}</span>
                    <span className="text-[8px] uppercase tracking-wider font-bold">{d.status}</span>
                  </div>
                )
              })}
            </div>
          </SimpleCard>
        </div>

        <div className="md:col-span-1 space-y-6">
          <SimpleCard title="Status Legend">
            <div className="space-y-4 text-sm font-semibold">
              <div className="flex items-center justify-between">
                <span className="text-emerald-600">Present</span>
                <Badge className="bg-emerald-600">Full Day Present</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-rose-600">Absent</span>
                <Badge className="bg-rose-600">Unexcused Absent</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-amber-600">Late</span>
                <Badge className="bg-amber-600">Late Arrival</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-blue-600">Holiday</span>
                <Badge className="bg-blue-600">Institutional Holiday</Badge>
              </div>
            </div>
          </SimpleCard>

          <SimpleCard title="Important Notifications">
            <div className="flex gap-3 text-xs text-muted-foreground leading-relaxed">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
              <p>Maintaining at least 75% attendance is required to qualify for academic term assessments. Please contact the class coordinator for leave applications.</p>
            </div>
          </SimpleCard>
        </div>
      </div>
    </PageContainer>
  )
}
