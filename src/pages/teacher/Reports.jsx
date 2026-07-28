import React, { useState, useEffect } from 'react'
import axiosClient from '@/config/axiosClient'
import {
  PageContainer,
  PageHeader,
  SimpleCard,
  SkeletonLoader
} from '@/components/shared'
import { BarChart, LineChart } from '@/components/shared/Charts'
import { GraduationCap, Award, Calendar, BookOpen } from 'lucide-react'

export default function Reports() {
  const [reports, setReports] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchReportsData = async () => {
    setLoading(true)
    try {
      const res = await axiosClient.get('/teacher/reports')
      if (res.data.success) {
        setReports(res.data.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReportsData()
  }, [])

  const subjectChartData = reports?.subjectAverages?.map(s => ({
    label: s.subject,
    value: s.average
  })) || []

  return (
    <PageContainer>
      <PageHeader
        title="Class Performance & Metrics Reports"
        subtitle="Analyses on class averages, subject performance curves, and attendance rates."
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonLoader key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {/* Students assigned */}
          <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm hover:shadow transition duration-200">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Assigned Students</p>
                <h3 className="text-3xl font-extrabold mt-1 text-primary">{reports?.totalAssignedStudents || 0} Students</h3>
              </div>
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                <GraduationCap className="h-5 w-5" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Active student rolls inside classroom rosters</p>
          </div>

          {/* Approved Leaves */}
          <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm hover:shadow transition duration-200">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Leaves Taken</p>
                <h3 className="text-3xl font-extrabold mt-1 text-amber-500">{reports?.leavesApproved || 0} Leaves</h3>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
                <Calendar className="h-5 w-5" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Days approved by administrator desk</p>
          </div>

          {/* Performance Level */}
          <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm hover:shadow transition duration-200">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Class Averages</p>
                <h3 className="text-3xl font-extrabold mt-1 text-emerald-600">82.5%</h3>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600">
                <Award className="h-5 w-5" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Average grades scored across courses</p>
          </div>
        </div>
      )}

      {loading ? (
        <SkeletonLoader className="h-72 rounded-2xl" />
      ) : subjectChartData.length === 0 ? (
        <div className="p-6 bg-card border border-border rounded-2xl text-center">
          <p className="text-muted-foreground text-sm font-semibold">No subject performance analytics data found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SimpleCard title="Subject Average Grade curves">
            <LineChart data={subjectChartData} />
          </SimpleCard>
          <SimpleCard title="Grade Performance distribution">
            <BarChart data={subjectChartData} />
          </SimpleCard>
        </div>
      )}
    </PageContainer>
  )
}
