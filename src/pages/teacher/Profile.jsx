import React, { useState, useEffect } from 'react'
import axiosClient from '@/config/axiosClient'
import {
  PageHeader,
  PageContainer,
  Badge,
  SkeletonLoader
} from '@/components/shared'
import {
  User,
  Mail,
  Phone,
  Building2,
  Briefcase,
  GraduationCap,
  BookOpen,
  Award,
  Calendar,
  AlertCircle
} from 'lucide-react'

export default function Profile() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadMyProfile() {
      try {
        const res = await axiosClient.get('/teacher/profile')
        if (res.data.success) {
          setProfile(res.data.data)
        }
      } catch (err) {
        console.error('Error fetching teacher profile:', err)
      } finally {
        setLoading(false)
      }
    }
    loadMyProfile()
  }, [])

  if (loading) {
    return (
      <PageContainer>
        <SkeletonLoader className="h-40 rounded-2xl mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SkeletonLoader className="h-64 rounded-2xl" />
          <SkeletonLoader className="h-64 rounded-2xl" />
        </div>
      </PageContainer>
    )
  }

  if (!profile) {
    return (
      <PageContainer>
        <div className="p-6 bg-card rounded-xl border border-border text-center">
          <p className="text-muted-foreground text-sm font-semibold">Teacher profile not found.</p>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="My Personal Profile"
        subtitle="Manage your personal records, educational qualifications, and academic class assignments."
      />

      {/* Header Banner */}
      <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary text-2xl font-black shrink-0">
            {profile.firstName?.[0] || 'T'}
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-lg font-black text-foreground">{profile.firstName} {profile.lastName}</h2>
              <Badge className="bg-primary/5 text-primary text-[10px] font-bold border border-primary/10">{profile.employeeId}</Badge>
              <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-bold capitalize">{profile.status}</Badge>
            </div>
            <p className="text-xs text-muted-foreground pt-1">{profile.designation} • {profile.department} Department</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-muted/20 p-3.5 rounded-xl border border-border/60">
          <div className="text-center px-4 border-r border-border">
            <span className="text-base font-bold text-foreground block">{profile.assignedClasses?.length || 0}</span>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Classes</span>
          </div>
          <div className="text-center px-4 border-r border-border">
            <span className="text-base font-bold text-foreground block">{profile.assignedSubjects?.length || 0}</span>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Subjects</span>
          </div>
          <div className="text-center px-4">
            <span className="text-base font-bold text-foreground block">{profile.experienceYears || 0} Yrs</span>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Experience</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal & Contact Card */}
        <div className="bg-card border border-border/80 p-5 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider border-b border-border/50 pb-2 flex items-center gap-2">
            <User className="h-4 w-4 text-primary" /> Personal & Contact Details
          </h3>
          <div className="grid grid-cols-2 gap-4 text-xs font-semibold leading-relaxed">
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase">Email Address</span>
              <span className="text-foreground">{profile.email}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase">Phone Number</span>
              <span className="text-foreground">{profile.phone}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase">Joining Date</span>
              <span className="text-foreground">{profile.joiningDate ? new Date(profile.joiningDate).toLocaleDateString() : 'N/A'}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase">Gender</span>
              <span className="text-foreground capitalize">{profile.gender}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase">Qualification</span>
              <span className="text-foreground">{profile.qualification || 'Master of Science'}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase">Date of Birth</span>
              <span className="text-foreground">{profile.dob ? new Date(profile.dob).toLocaleDateString() : 'N/A'}</span>
            </div>
            <div className="col-span-2">
              <span className="text-muted-foreground block text-[10px] uppercase">Residential Address</span>
              <span className="text-foreground">{profile.address || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Assigned Classes & Subjects Card */}
        <div className="bg-card border border-border/80 p-5 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider border-b border-border/50 pb-2 flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-primary" /> Academic Assignments
          </h3>
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase block mb-2">Assigned Classes</span>
              <div className="flex flex-wrap gap-2">
                {profile.assignedClasses?.map((cls, idx) => (
                  <Badge key={idx} className="bg-primary/5 text-primary border border-primary/10 flex items-center gap-1.5 py-1 px-2.5 text-xs font-semibold">
                    <GraduationCap className="h-3.5 w-3.5" /> {cls.className} ({cls.section}) {cls.isClassTeacher && '• Class Teacher'}
                  </Badge>
                ))}
                {!profile.assignedClasses?.length && (
                  <span className="text-xs text-muted-foreground">No classes assigned.</span>
                )}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase block mb-2">Assigned Subjects</span>
              <div className="flex flex-wrap gap-2">
                {profile.assignedSubjects?.map((sbj, idx) => (
                  <Badge key={idx} className="bg-secondary text-foreground border border-border flex items-center gap-1.5 py-1 px-2.5 text-xs font-semibold">
                    <BookOpen className="h-3.5 w-3.5 text-muted-foreground" /> {sbj.subjectName} ({sbj.className})
                  </Badge>
                ))}
                {!profile.assignedSubjects?.length && (
                  <span className="text-xs text-muted-foreground">No subjects assigned.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
