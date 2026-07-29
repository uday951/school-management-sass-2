import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Clock, ArrowLeft, Calendar, BookOpen, User, MapPin } from 'lucide-react'
import { Button, Badge } from '@/components/shared'
import { useChildStore } from '@/store'
import axiosClient from '@/config/axiosClient'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DAY_COLORS = [
  'bg-blue-50 border-blue-200 text-blue-700',
  'bg-purple-50 border-purple-200 text-purple-700',
  'bg-emerald-50 border-emerald-200 text-emerald-700',
  'bg-amber-50 border-amber-200 text-amber-700',
  'bg-rose-50 border-rose-200 text-rose-700',
  'bg-sky-50 border-sky-200 text-sky-700',
]

export default function ChildTimetable() {
  const { id: paramId } = useParams()
  const navigate = useNavigate()
  const { activeChild } = useChildStore()
  const id = paramId || activeChild?._id || activeChild?.id

  const [timetable, setTimetable] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeDay, setActiveDay] = useState(new Date().getDay() || 1) // 1=Mon default

  useEffect(() => {
    if (!id) { setLoading(false); return }
    const fetchTimetable = async () => {
      setLoading(true)
      try {
        const res = await axiosClient.get(`/portal/child/${id}/timetable`)
        if (res.data?.success) setTimetable(Array.isArray(res.data.data) ? res.data.data : [])
      } catch (_) {
        setTimetable([])
      } finally {
        setLoading(false)
      }
    }
    fetchTimetable()
  }, [id])

  // Group by day of week
  const byDay = DAYS.reduce((acc, day, i) => {
    acc[i + 1] = timetable.filter(e => e.dayOfWeek === i + 1 || e.day === day)
    return acc
  }, {})

  const todayEntries = byDay[activeDay] || []

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm text-muted-foreground">Loading timetable...</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 p-4 md:p-6 animate-in fade-in duration-200">
      <div className="flex items-center gap-3 border-b border-border pb-5">
        <Button variant="outline" size="sm" onClick={() => navigate('/parent/dashboard')}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Clock className="h-6 w-6 text-indigo-500" />
            Weekly Class Timetable
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">View your child's weekly class schedule.</p>
        </div>
      </div>

      {/* Day Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {DAYS.map((day, i) => (
          <button
            key={day}
            onClick={() => setActiveDay(i + 1)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap border transition-all ${
              activeDay === i + 1
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-card border-border text-muted-foreground hover:border-primary/50'
            }`}
          >
            {day.slice(0, 3)}
            {byDay[i + 1]?.length > 0 && (
              <span className={`ml-1.5 text-[10px] rounded-full px-1.5 py-0.5 font-bold ${
                activeDay === i + 1 ? 'bg-white/30 text-white' : 'bg-primary/10 text-primary'
              }`}>{byDay[i + 1].length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Classes for selected day */}
      {todayEntries.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Calendar className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <h3 className="font-semibold text-foreground">No classes scheduled</h3>
          <p className="text-sm text-muted-foreground mt-1">{DAYS[activeDay - 1]} has no scheduled periods.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {todayEntries.map((entry, i) => (
            <div
              key={entry._id || i}
              className={`p-4 rounded-xl border-2 ${DAY_COLORS[i % DAY_COLORS.length]} flex flex-col sm:flex-row sm:items-center gap-3`}
            >
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-center min-w-[56px]">
                  <p className="text-xs font-semibold opacity-70">Period {entry.periodNumber || i + 1}</p>
                  <p className="text-sm font-bold">{entry.startTime || 'N/A'}</p>
                  <p className="text-xs opacity-70">{entry.endTime || ''}</p>
                </div>
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 opacity-70" />
                  <p className="font-bold">{entry.subjectId?.name || entry.subjectId?.subjectName || entry.subject || 'Subject'}</p>
                </div>
                {(entry.teacherId || entry.teacher) && (
                  <div className="flex items-center gap-2 text-xs opacity-70">
                    <User className="h-3.5 w-3.5" />
                    <span>{
                      entry.teacherId
                        ? `${entry.teacherId.firstName || ''} ${entry.teacherId.lastName || ''}`.trim() || 'Teacher'
                        : entry.teacher || 'Teacher'
                    }</span>
                  </div>
                )}
                {entry.roomNo && (
                  <div className="flex items-center gap-2 text-xs opacity-70">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>Room {entry.roomNo}</span>
                  </div>
                )}
              </div>
              {entry.isBreak && <Badge variant="secondary">Break</Badge>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
