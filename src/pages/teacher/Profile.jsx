import React, { useState, useEffect } from 'react'
import {
  PageHeader,
  PageContainer,
  Badge,
  StatusChip,
  Avatar,
  Button
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
  FileText,
  Calendar
} from 'lucide-react'
import teacherService from '@/services/teacherService'

export default function Profile() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadMyProfile() {
      try {
        const listRes = await teacherService.getTeachers({ limit: 1 })
        if (listRes?.data && listRes.data.length > 0) {
          const firstTeacher = listRes.data[0]
          const profileData = await teacherService.getTeacherById(firstTeacher._id || firstTeacher.id)
          setProfile(profileData)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadMyProfile()
  }, [])

  if (loading || !profile) {
    return (
      <PageContainer className="flex items-center justify-center min-h-[300px]">
        <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </PageContainer>
    )
  }

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="My Personal Profile"
        description="View your personal records, academic qualifications, and class assignments."
      />

      {/* Header Banner */}
      <div className="bg-card border border-border rounded-lg p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Avatar src={profile.avatarUrl} fallback={`${profile.firstName?.[0] || 'T'}`} className="h-20 w-20 border-2 border-primary/20" />
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-foreground">{profile.firstName} {profile.lastName}</h2>
              <Badge variant="outline">{profile.employeeId}</Badge>
              <StatusChip status={profile.status} />
            </div>
            <p className="text-xs text-muted-foreground pt-1">{profile.designation} • {profile.department} Department</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-muted/30 p-3 rounded-lg border border-border">
          <div className="text-center px-3 border-r border-border">
            <span className="text-base font-bold text-foreground block">{profile.assignedClasses?.length || 0}</span>
            <span className="text-[10px] text-muted-foreground uppercase font-semibold">Classes</span>
          </div>
          <div className="text-center px-3 border-r border-border">
            <span className="text-base font-bold text-foreground block">{profile.assignedSubjects?.length || 0}</span>
            <span className="text-[10px] text-muted-foreground uppercase font-semibold">Subjects</span>
          </div>
          <div className="text-center px-3">
            <span className="text-base font-bold text-foreground block">{profile.experienceYears || 0} yrs</span>
            <span className="text-[10px] text-muted-foreground uppercase font-semibold">Experience</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal & Contact Card */}
        <div className="bg-card border border-border p-5 rounded-lg shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider border-b border-border pb-2 flex items-center gap-2">
            <User className="h-4 w-4 text-primary" /> Contact & Personal Details
          </h3>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-muted-foreground block">Email</span>
              <span className="font-semibold text-foreground">{profile.email}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Phone</span>
              <span className="font-mono font-semibold text-foreground">{profile.phone}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Joining Date</span>
              <span className="font-semibold text-foreground">{profile.joiningDate ? new Date(profile.joiningDate).toLocaleDateString() : 'N/A'}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Gender</span>
              <span className="font-semibold text-foreground capitalize">{profile.gender}</span>
            </div>
            <div className="col-span-2">
              <span className="text-muted-foreground block">Address</span>
              <span className="font-semibold text-foreground">{profile.address}</span>
            </div>
          </div>
        </div>

        {/* Assigned Classes & Subjects Card */}
        <div className="bg-card border border-border p-5 rounded-lg shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider border-b border-border pb-2 flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-primary" /> Academic Assignments
          </h3>
          <div className="space-y-3">
            <div>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase block mb-1.5">Assigned Classes</span>
              <div className="flex flex-wrap gap-2">
                {profile.assignedClasses?.map((cls, idx) => (
                  <Badge key={idx} variant="outline" className="flex items-center gap-1 py-1 px-2 text-xs">
                    <GraduationCap className="h-3 w-3 text-primary" /> {cls.className} ({cls.section})
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase block mb-1.5">Assigned Subjects</span>
              <div className="flex flex-wrap gap-2">
                {profile.assignedSubjects?.map((sbj, idx) => (
                  <Badge key={idx} variant="outline" className="flex items-center gap-1 py-1 px-2 text-xs">
                    <BookOpen className="h-3 w-3 text-primary" /> {sbj.subjectName} ({sbj.className})
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
