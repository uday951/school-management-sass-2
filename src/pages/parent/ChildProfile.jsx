import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { parentService } from '@/services/parentService'
import { 
  User, 
  GraduationCap, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Heart, 
  ShieldAlert, 
  ArrowLeft, 
  RefreshCw, 
  Award,
  BookOpen
} from 'lucide-react'
import { Button, Badge, Alert } from '@/components/shared'

export default function ChildProfile() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await parentService.getChildProfile(id)
        setProfile(data)
      } catch (err) {
        setError('Failed to load child profile details.')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [id])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <RefreshCw className="h-8 w-8 text-primary animate-spin" />
        <p className="text-sm font-medium text-muted-foreground">Loading Child Profile Dossier...</p>
      </div>
    )
  }

  const personal = profile?.personalDetails || {}
  const academic = profile?.academicDetails || {}
  const teacher = profile?.teacherDetails || {}
  const medical = profile?.medicalInfo || {}
  const emergency = profile?.emergencyContact || {}
  const overview = profile?.academicOverview || {}

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 p-4 md:p-6 animate-in fade-in duration-200">
      
      {/* Header with Back Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-5 gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate('/parent/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <User className="h-6 w-6 text-primary" />
              Child Profile Dossier
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">Comprehensive personal, academic, medical, and emergency contact details for your child.</p>
          </div>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Main Student Header Card */}
      <div className="bg-card p-6 rounded-xl border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center text-primary font-bold text-2xl uppercase">
            {personal.name ? personal.name.split(' ').map(n=>n[0]).join('') : 'ST'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-foreground">{personal.name || 'Student Name'}</h2>
              <Badge variant="secondary" className="text-xs">Grade {academic.class} ({academic.section})</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
              <span><strong>Admission No:</strong> {personal.admissionNo || '—'}</span>
              <span>•</span>
              <span><strong>Roll No:</strong> {academic.rollNo || '101'}</span>
              <span>•</span>
              <span><strong>Gender:</strong> {personal.gender || 'Male'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Academic Grade</span>
            <p className="text-xl font-bold text-emerald-600">{overview.grade || 'A'} ({overview.gpa || '3.8 GPA'})</p>
          </div>
        </div>
      </div>

      {/* Information Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* 1. Personal & Contact Details */}
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-4">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
            <User className="h-5 w-5 text-primary" />
            Personal & Demographic Details
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-xs font-medium text-muted-foreground">Full Name</span>
              <p className="font-semibold text-foreground mt-0.5">{personal.name || '—'}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-muted-foreground">Date of Birth</span>
              <p className="font-semibold text-foreground mt-0.5">{personal.dob || '—'}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-muted-foreground">Blood Group</span>
              <p className="font-semibold text-rose-600 mt-0.5">{personal.bloodGroup || 'O+'}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-muted-foreground">Admission Date</span>
              <p className="font-semibold text-foreground mt-0.5">{academic.admissionDate || '—'}</p>
            </div>
            <div className="col-span-2">
              <span className="text-xs font-medium text-muted-foreground">Residential Address</span>
              <p className="font-semibold text-foreground mt-0.5 flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                {personal.address || '—'}
              </p>
            </div>
          </div>
        </div>

        {/* 2. Class Teacher Details */}
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-4">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
            <GraduationCap className="h-5 w-5 text-primary" />
            Class Teacher & Academic Contacts
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-xs font-medium text-muted-foreground">Class Teacher</span>
              <p className="font-semibold text-foreground mt-0.5">{teacher.name || 'Dr. Sarah Connor'}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-muted-foreground">Subject</span>
              <p className="font-semibold text-foreground mt-0.5">{teacher.subject || 'Class Teacher'}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-muted-foreground">Email Contact</span>
              <p className="font-semibold text-primary mt-0.5 flex items-center gap-1">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                {teacher.email || '—'}
              </p>
            </div>
            <div>
              <span className="text-xs font-medium text-muted-foreground">Phone Number</span>
              <p className="font-semibold text-foreground mt-0.5 flex items-center gap-1">
                <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                {teacher.phone || '—'}
              </p>
            </div>
          </div>
        </div>

        {/* 3. Medical & Health Record */}
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-4">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
            <Heart className="h-5 w-5 text-rose-600" />
            Medical & Health Profile
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-xs font-medium text-muted-foreground">Allergies</span>
              <p className="font-semibold text-foreground mt-0.5">{medical.allergies || 'None'}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-muted-foreground">Health Conditions</span>
              <p className="font-semibold text-foreground mt-0.5">{medical.conditions || 'Good Health'}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-muted-foreground">Emergency Doctor</span>
              <p className="font-semibold text-foreground mt-0.5">{medical.doctorName || '—'}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-muted-foreground">Doctor Phone</span>
              <p className="font-semibold text-foreground mt-0.5">{medical.doctorPhone || '—'}</p>
            </div>
          </div>
        </div>

        {/* 4. Emergency Contact Details */}
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-4">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
            <ShieldAlert className="h-5 w-5 text-amber-500" />
            Primary Emergency Contact
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-xs font-medium text-muted-foreground">Guardian Name</span>
              <p className="font-semibold text-foreground mt-0.5">{emergency.name || '—'}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-muted-foreground">Relationship</span>
              <p className="font-semibold text-foreground mt-0.5">{emergency.relationship || 'Guardian'}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-muted-foreground">Phone Number</span>
              <p className="font-semibold text-foreground mt-0.5">{emergency.phone || '—'}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-muted-foreground">Email Address</span>
              <p className="font-semibold text-foreground mt-0.5">{emergency.email || '—'}</p>
            </div>
          </div>
        </div>

      </div>

      {/* Academic Performance Summary */}
      <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-3">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <Award className="h-5 w-5 text-purple-600" />
          Academic Overview & Teacher Remark
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {overview.performanceSummary || 'Student maintains excellent academic records across core subjects.'}
        </p>
      </div>

    </div>
  )
}
