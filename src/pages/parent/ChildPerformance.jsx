import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { TrendingUp, ArrowLeft, Award, BookOpen, Calendar, Star, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Button, Badge } from '@/components/shared'
import { useChildStore } from '@/store'
import axiosClient from '@/config/axiosClient'

const gradeColor = (avg) => {
  if (avg >= 80) return 'text-emerald-600'
  if (avg >= 60) return 'text-amber-600'
  return 'text-red-600'
}

const gradeLabel = (avg) => {
  if (avg >= 90) return 'Excellent'
  if (avg >= 80) return 'Good'
  if (avg >= 60) return 'Average'
  return 'Needs Improvement'
}

export default function ChildPerformance() {
  const { id: paramId } = useParams()
  const navigate = useNavigate()
  const { activeChild } = useChildStore()
  const id = paramId || activeChild?._id || activeChild?.id

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) { setLoading(false); return }
    const fetchPerformance = async () => {
      setLoading(true)
      try {
        const res = await axiosClient.get(`/portal/child/${id}/performance`)
        if (res.data?.success) setData(res.data.data)
      } catch (_) {
        setData(null)
      } finally {
        setLoading(false)
      }
    }
    fetchPerformance()
  }, [id])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm text-muted-foreground">Analyzing performance...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-6 text-center">
        <AlertTriangle className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
        <p className="text-muted-foreground">No performance data available yet.</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 p-4 md:p-6 animate-in fade-in duration-200">
      <div className="flex items-center gap-3 border-b border-border pb-5">
        <Button variant="outline" size="sm" onClick={() => navigate('/parent/dashboard')}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-emerald-500" />
            Academic Performance Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Comprehensive performance overview for your child.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">Overall Average</p>
          <p className={`text-4xl font-extrabold ${gradeColor(data.overallAverage)}`}>{data.overallAverage ?? 'N/A'}%</p>
          <p className="text-xs text-muted-foreground mt-1">{gradeLabel(data.overallAverage)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">Homework Completion</p>
          <p className="text-4xl font-extrabold text-primary">{data.homeworkRate ?? 0}%</p>
          <p className="text-xs text-muted-foreground mt-1">{data.submittedHomework}/{data.totalHomework} submitted</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">Total Subjects Evaluated</p>
          <p className="text-4xl font-extrabold text-foreground">{data.subjectPerformance?.length ?? 0}</p>
          <p className="text-xs text-muted-foreground mt-1">subjects tracked</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Performance */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" /> Subject-wise Performance
          </h3>
          {data.subjectPerformance?.length === 0 ? (
            <p className="text-sm text-muted-foreground">No exam marks recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {(data.subjectPerformance || []).map((s, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">{s.subject}</span>
                    <span className={`text-sm font-bold ${gradeColor(s.average)}`}>{s.average}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        s.average >= 80 ? 'bg-emerald-500' : s.average >= 60 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(100, s.average)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Strong & Weak Subjects */}
        <div className="space-y-4">
          <div className="bg-card border border-emerald-200 rounded-xl p-5">
            <h3 className="font-bold text-emerald-700 flex items-center gap-2 mb-3">
              <Star className="h-5 w-5" /> Strong Subjects
            </h3>
            {data.strongSubjects?.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data yet.</p>
            ) : (
              <div className="space-y-2">
                {(data.strongSubjects || []).map((s, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{s.subject}</span>
                    <Badge variant="success">{s.average}%</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-card border border-red-200 rounded-xl p-5">
            <h3 className="font-bold text-red-700 flex items-center gap-2 mb-3">
              <AlertTriangle className="h-5 w-5" /> Needs Improvement
            </h3>
            {data.weakSubjects?.length === 0 ? (
              <p className="text-sm text-muted-foreground">All subjects performing well!</p>
            ) : (
              <div className="space-y-2">
                {(data.weakSubjects || []).map((s, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{s.subject}</span>
                    <Badge variant="danger">{s.average}%</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Attendance Trend */}
      {data.attendanceTrend?.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-bold text-foreground flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-primary" /> Monthly Attendance Trend
          </h3>
          <div className="flex items-end gap-3 h-32 overflow-x-auto">
            {data.attendanceTrend.map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-1 min-w-[48px]">
                <span className="text-xs font-bold text-foreground">{item.rate}%</span>
                <div
                  className={`w-10 rounded-t-md transition-all duration-700 ${
                    item.rate >= 80 ? 'bg-emerald-500' : item.rate >= 60 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ height: `${Math.max(8, item.rate)}%`, maxHeight: '80px' }}
                />
                <span className="text-[10px] text-muted-foreground">{item.month.split('-')[1]}/{item.month.split('-')[0].slice(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
