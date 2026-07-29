import React, { useState, useEffect } from 'react'
import axiosClient from '@/config/axiosClient'
import {
  PageContainer,
  PageHeader,
  SimpleCard,
  SkeletonLoader
} from '@/components/shared'
import { BarChart, LineChart } from '@/components/shared/Charts'
import { Users, BookOpen, GraduationCap, Award } from 'lucide-react'

export default function Reports() {
  const [reports, setReports] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchReports = async () => {
    setLoading(true)
    try {
      const res = await axiosClient.get('/teacher/reports')
      if (res.data.success) {
        setReports(res.data.data)
      }
    } catch (err) {
      console.error('Error fetching teacher reports:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [])

  return (
    <PageContainer>
      <PageHeader
        title="Class Performance & Metrics Reports"
        subtitle="Review real-time class attendance summaries, homework submissions, and average subject marks."
      />

      {loading || !reports ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonLoader key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
          <SkeletonLoader className="h-64 rounded-2xl" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* KPI summaries */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Users className="h-4 w-4 text-primary" /> Student Strength
              </p>
              <h3 className="text-3xl font-black text-foreground mt-1.5">{reports.studentCount} Students</h3>
              <p className="text-[10px] text-muted-foreground mt-1">Across all assigned classes</p>
            </div>
            <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <BookOpen className="h-4 w-4 text-amber-500" /> Assigned Homeworks
              </p>
              <h3 className="text-3xl font-black text-amber-600 mt-1.5">{reports.homeworkCount} Tasks</h3>
              <p className="text-[10px] text-muted-foreground mt-1">Assigned this semester</p>
            </div>
            <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Award className="h-4 w-4 text-emerald-500" /> Class Average
              </p>
              <h3 className="text-3xl font-black text-emerald-600 mt-1.5">{reports.gradesAverage}%</h3>
              <p className="text-[10px] text-muted-foreground mt-1">Student grades performance average</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Attendance Analytics */}
            {reports.analytics?.attendanceSummary?.length > 0 && (
              <SimpleCard title="Assigned Classes Attendance rates">
                <BarChart data={reports.analytics.attendanceSummary} />
              </SimpleCard>
            )}

            {/* Performance Analytics */}
            {reports.analytics?.classPerformance?.length > 0 && (
              <SimpleCard title="Assigned Classes Performance statistics">
                <LineChart data={reports.analytics.classPerformance} />
              </SimpleCard>
            )}
          </div>
        </div>
      )}
    </PageContainer>
  )
}
