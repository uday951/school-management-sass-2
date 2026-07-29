import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useChildStore } from '@/store'
import axiosClient from '@/config/axiosClient'
import {
  PageContainer,
  PageHeader,
  SimpleCard,
  Badge,
  SkeletonLoader
} from '@/components/shared'
import { User, Mail, Phone, Calendar, Heart, Shield, Award } from 'lucide-react'

export default function ChildProfile() {
  const { activeChild } = useChildStore()
  const params = useParams()
  const id = params.id || activeChild?._id || activeChild?.id
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const res = await axiosClient.get(`/students/${id}/profile`)
      if (res.data.success) {
        setProfile(res.data.data)
      }
    } catch (err) {
      console.error('Error fetching child profile:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [id])

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
          <p className="text-muted-foreground text-sm font-semibold">Child profile not found.</p>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageHeader
        title={`${profile.firstName} ${profile.lastName}`}
        subtitle={`Academic Student Profile Dossier for Session ${profile.academicYear || 'N/A'}.`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card & Avatar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm text-center">
            <div className="w-24 h-24 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4 overflow-hidden">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="h-12 w-12 text-primary" />
              )}
            </div>
            <h3 className="text-lg font-bold text-foreground">{profile.firstName} {profile.lastName}</h3>
            <p className="text-xs text-muted-foreground mt-1">Roll No: {profile.rollNo} • Adm No: {profile.admissionNo}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Badge className="bg-primary/10 text-primary capitalize font-bold text-[10px]">{profile.status}</Badge>
              <Badge className="bg-secondary capitalize font-bold text-[10px]">{profile.gender}</Badge>
            </div>
          </div>

          <SimpleCard title="Medical Records Info">
            <div className="space-y-4 text-xs font-semibold leading-relaxed">
              <div className="flex justify-between items-center pb-2 border-b border-border/60">
                <span className="text-muted-foreground flex items-center gap-1.5"><Heart className="h-4 w-4 text-rose-500" /> Blood Group</span>
                <span className="text-foreground">{profile.bloodGroup || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border/60">
                <span className="text-muted-foreground flex items-center gap-1.5"><Shield className="h-4 w-4 text-emerald-500" /> Vaccination status</span>
                <span className="text-foreground">{profile.vaccinationStatus || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1.5"><Award className="h-4 w-4 text-amber-500" /> House Name</span>
                <span className="text-foreground capitalize">{profile.house || 'N/A'}</span>
              </div>
            </div>
          </SimpleCard>
        </div>

        {/* Academic and Personal Dossier */}
        <div className="lg:col-span-2 space-y-6">
          <SimpleCard title="Student Dossier Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-xs font-semibold leading-relaxed">
              <div className="pb-2 border-b border-border/60">
                <p className="text-muted-foreground uppercase text-[9px] tracking-wider mb-0.5">Date of Birth</p>
                <p className="text-foreground">{new Date(profile.dob).toLocaleDateString()}</p>
              </div>
              <div className="pb-2 border-b border-border/60">
                <p className="text-muted-foreground uppercase text-[9px] tracking-wider mb-0.5">Medium of Instruction</p>
                <p className="text-foreground">{profile.medium || 'N/A'}</p>
              </div>
              <div className="pb-2 border-b border-border/60">
                <p className="text-muted-foreground uppercase text-[9px] tracking-wider mb-0.5">Affiliated Board</p>
                <p className="text-foreground">{profile.board || 'N/A'}</p>
              </div>
              <div className="pb-2 border-b border-border/60">
                <p className="text-muted-foreground uppercase text-[9px] tracking-wider mb-0.5">Campus Location</p>
                <p className="text-foreground">{profile.campus || 'N/A'}</p>
              </div>
              <div className="pb-2 border-b border-border/60">
                <p className="text-muted-foreground uppercase text-[9px] tracking-wider mb-0.5">Date of Admission</p>
                <p className="text-foreground">{new Date(profile.admissionDate).toLocaleDateString()}</p>
              </div>
              <div className="pb-2 border-b border-border/60">
                <p className="text-muted-foreground uppercase text-[9px] tracking-wider mb-0.5">Class / Section</p>
                <p className="text-foreground">{profile.class} - Section {profile.section}</p>
              </div>
            </div>
          </SimpleCard>

          <SimpleCard title="Contact Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-xs font-semibold leading-relaxed">
              <div className="pb-2 border-b border-border/60">
                <p className="text-muted-foreground uppercase text-[9px] tracking-wider mb-0.5 flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> Email Address</p>
                <p className="text-foreground">{profile.email || 'N/A'}</p>
              </div>
              <div className="pb-2 border-b border-border/60">
                <p className="text-muted-foreground uppercase text-[9px] tracking-wider mb-0.5 flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> Contact Number</p>
                <p className="text-foreground">{profile.phone || 'N/A'}</p>
              </div>
              <div className="pb-2 border-b border-border/60 md:col-span-2">
                <p className="text-muted-foreground uppercase text-[9px] tracking-wider mb-0.5">Residential Address</p>
                <p className="text-foreground">{profile.address}, {profile.city}, {profile.state}, {profile.country} - {profile.pinCode}</p>
              </div>
            </div>
          </SimpleCard>
        </div>
      </div>
    </PageContainer>
  )
}
