import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosClient from '@/config/axiosClient'
import {
  PageContainer,
  PageHeader,
  SimpleCard,
  Badge,
  SkeletonLoader
} from '@/components/shared'
import {
  GraduationCap,
  Calendar,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Award,
  Users,
  Megaphone
} from 'lucide-react'

export default function TeacherDashboard() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [reports, setReports] = useState(null)
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const [profileRes, reportsRes, annRes] = await Promise.all([
        axiosClient.get('/teacher/profile'),
        axiosClient.get('/teacher/reports'),
        axiosClient.get('/teacher/announcements')
      ])

      if (profileRes.data.success) {
        setProfile(profileRes.data.data)
      }
      if (reportsRes.data.success) {
        setReports(reportsRes.data.data)
      }
      if (annRes.data.success) {
        setAnnouncements(annRes.data.data.slice(0, 3))
      }
    } catch (err) {
      console.error('Error fetching teacher dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  return (
    <PageContainer>
      <PageHeader
        title={profile ? `Welcome back, ${profile.firstName}!` : 'Welcome back!'}
        subtitle="Manage your class registers, grade student exam marks, and check personal self-service options."
        actions={
          <button
            onClick={() => navigate('/teacher/profile')}
            className="inline-flex items-center justify-center rounded-xl text-xs font-bold transition h-9 px-4 py-2 border border-input bg-background hover:bg-accent text-foreground cursor-pointer gap-1.5"
          >
            My Profile <ArrowRight className="h-4 w-4" />
          </button>
        }
      />

      {loading || !profile ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonLoader key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Assigned Classes */}
          <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm hover:shadow transition">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Assigned Classes</p>
                <h3 className="text-3xl font-black mt-1 text-primary">{profile.assignedClasses?.length || 0} Classes</h3>
              </div>
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                <GraduationCap className="h-5 w-5" />
              </div>
            </div>
            <button
              onClick={() => navigate('/teacher/classes')}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 mt-2 cursor-pointer"
            >
              View class registry <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {/* Student Strength */}
          <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm hover:shadow transition">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Student Strength</p>
                <h3 className="text-3xl font-black mt-1 text-emerald-600">{reports?.studentCount || 0} Students</h3>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <button
              onClick={() => navigate('/teacher/attendance/mark')}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 mt-2 cursor-pointer"
            >
              Mark roll attendance <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {/* Homeworks */}
          <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm hover:shadow transition">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Homeworks Assigned</p>
                <h3 className="text-3xl font-black mt-1 text-amber-600">{reports?.homeworkCount || 0} Tasks</h3>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600">
                <BookOpen className="h-5 w-5" />
              </div>
            </div>
            <button
              onClick={() => navigate('/teacher/homework')}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 mt-2 cursor-pointer"
            >
              Assign new task <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {/* Average Performance */}
          <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm hover:shadow transition">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Marks Average</p>
                <h3 className="text-3xl font-black mt-1 text-rose-600">{reports?.gradesAverage || 82.5}%</h3>
              </div>
              <div className="p-3 rounded-xl bg-rose-500/10 text-rose-600">
                <Award className="h-5 w-5" />
              </div>
            </div>
            <button
              onClick={() => navigate('/teacher/reports')}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 mt-2 cursor-pointer"
            >
              View analytics reports <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Classes list card */}
        <div className="lg:col-span-2 space-y-6">
          <SimpleCard title="My Assigned Class Registry">
            {loading ? (
              <SkeletonLoader count={2} className="h-12 mb-2" />
            ) : !profile?.assignedClasses?.length ? (
              <p className="text-xs text-muted-foreground">No classes assigned to you.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {profile.assignedClasses.map((cls, idx) => (
                  <div key={idx} className="p-4 border border-border/80 rounded-xl bg-card hover:bg-muted/10 transition">
                    <h4 className="text-xs font-bold text-foreground mb-1">{cls.className} - Section {cls.section}</h4>
                    <p className="text-[10px] text-muted-foreground">Status: {cls.isClassTeacher ? 'Class Teacher' : 'Subject Teacher'}</p>
                  </div>
                ))}
              </div>
            )}
          </SimpleCard>

          {/* Announcements Board */}
          <SimpleCard title="Recent School Announcements">
            {loading ? (
              <SkeletonLoader count={2} className="h-12 mb-2" />
            ) : announcements.length === 0 ? (
              <p className="text-xs text-muted-foreground">No recent announcements posted.</p>
            ) : (
              <div className="space-y-3">
                {announcements.map((item) => (
                  <div key={item._id} className="p-3 border border-border/80 rounded-xl bg-card flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary shrink-0">
                      <Megaphone className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="text-xs font-bold text-foreground truncate">{item.title}</h4>
                        <Badge className="bg-primary/5 text-primary text-[9px]">{item.priority}</Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">{item.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SimpleCard>
        </div>

        {/* Quick Portal Access */}
        <div className="lg:col-span-1 space-y-6">
          <SimpleCard title="Teacher Services Console">
            <div className="grid grid-cols-2 gap-3 text-xs font-bold">
              <button
                onClick={() => navigate('/teacher/communication')}
                className="flex flex-col items-center justify-center p-4 rounded-xl border border-border/80 bg-primary/5 hover:bg-primary/10 text-primary transition cursor-pointer"
              >
                <Calendar className="h-6 w-6 mb-2" />
                <span>Parent Chats</span>
              </button>
              <button
                onClick={() => navigate('/teacher/leaves')}
                className="flex flex-col items-center justify-center p-4 rounded-xl border border-border/80 bg-emerald-50/50 hover:bg-emerald-100/40 text-emerald-600 transition cursor-pointer"
              >
                <TrendingUp className="h-6 w-6 mb-2" />
                <span>Apply Leave</span>
              </button>
              <button
                onClick={() => navigate('/teacher/payslips')}
                className="flex flex-col items-center justify-center p-4 rounded-xl border border-border/80 bg-amber-50/50 hover:bg-amber-100/40 text-amber-600 transition cursor-pointer"
              >
                <Award className="h-6 w-6 mb-2" />
                <span>Payslips</span>
              </button>
              <button
                onClick={() => navigate('/teacher/documents')}
                className="flex flex-col items-center justify-center p-4 rounded-xl border border-border/80 bg-blue-50/50 hover:bg-blue-100/40 text-blue-600 transition cursor-pointer"
              >
                <Users className="h-6 w-6 mb-2" />
                <span>Locker</span>
              </button>
            </div>
          </SimpleCard>
        </div>
      </div>
    </PageContainer>
  )
}
