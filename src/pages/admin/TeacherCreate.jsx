import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  PageHeader,
  PageContainer,
  FormLayout,
  FormInput,
  FormSelect,
  FormTextarea,
  Button,
  FileUpload,
  SuccessDialog,
  Avatar
} from '@/components/shared'
import { ArrowLeft, Save, UserPlus, CheckCircle2 } from 'lucide-react'
import teacherService from '@/services/teacherService'

export default function TeacherCreate() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('edit')

  const isEditMode = Boolean(editId)

  // Form State
  const [formData, setFormData] = useState({
    employeeId: `TCH-${Math.floor(1000 + Math.random() * 9000)}`,
    firstName: '',
    lastName: '',
    gender: 'male',
    dob: '1990-01-01',
    phone: '',
    email: '',
    address: '',
    department: 'Mathematics',
    designation: 'Senior Teacher',
    joiningDate: new Date().toISOString().split('T')[0],
    qualification: '',
    experienceYears: 2,
    status: 'active',
    avatarUrl: ''
  })

  const [departments, setDepartments] = useState([])
  const [designations, setDesignations] = useState([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [isSuccessOpen, setIsSuccessOpen] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    async function loadData() {
      // Fetch departments
      try {
        const depts = await teacherService.getDepartments()
        if (depts) setDepartments(depts)
      } catch (err) {
        console.error('Failed to load departments:', err)
      }

      // Fetch designations
      try {
        const desigs = await teacherService.getDesignations()
        if (desigs) setDesignations(desigs)
      } catch (err) {
        console.error('Failed to load designations:', err)
      }

      // Fetch teacher if in edit mode
      if (isEditMode) {
        try {
          const teacher = await teacherService.getTeacherById(editId)
          if (teacher) {
            setFormData({
              employeeId: teacher.employeeId || '',
              firstName: teacher.firstName || '',
              lastName: teacher.lastName || '',
              gender: teacher.gender || 'male',
              dob: teacher.dob ? teacher.dob.split('T')[0] : '1990-01-01',
              phone: teacher.phone || '',
              email: teacher.email || '',
              address: teacher.address || '',
              department: teacher.department || 'Mathematics',
              designation: teacher.designation || 'Senior Teacher',
              joiningDate: teacher.joiningDate ? teacher.joiningDate.split('T')[0] : new Date().toISOString().split('T')[0],
              qualification: teacher.qualification || '',
              experienceYears: teacher.experienceYears || 0,
              status: teacher.status || 'active',
              avatarUrl: teacher.avatarUrl || ''
            })
          }
        } catch (err) {
          console.error('Failed to load teacher profile:', err)
        }
      }
    }
    loadData()
  }, [editId, isEditMode])

  const validate = () => {
    const errs = {}
    if (!formData.employeeId) errs.employeeId = 'Employee ID is required'
    if (!formData.firstName) errs.firstName = 'First name is required'
    if (!formData.lastName) errs.lastName = 'Last name is required'
    if (!formData.email) errs.email = 'Email address is required'
    if (!formData.phone) errs.phone = 'Phone number is required'
    if (!formData.department) errs.department = 'Department is required'
    if (!formData.designation) errs.designation = 'Designation is required'
    if (!formData.joiningDate) errs.joiningDate = 'Joining date is required'

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      if (isEditMode) {
        await teacherService.updateTeacher(editId, formData)
        setSuccessMsg(`Teacher profile for '${formData.firstName} ${formData.lastName}' updated successfully!`)
      } else {
        await teacherService.createTeacher(formData)
        setSuccessMsg(`Teacher '${formData.firstName} ${formData.lastName}' onboarded successfully!`)
      }
      setIsSuccessOpen(true)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSuccessClose = () => {
    setIsSuccessOpen(false)
    navigate('/admin/teachers')
  }

  return (
    <PageContainer className="space-y-6">
      {/* Header */}
      <PageHeader
        title={isEditMode ? 'Edit Teacher Record' : 'Teacher Onboarding Setup'}
        description={isEditMode ? 'Modify faculty profile details and academic role parameters.' : 'Onboard a new faculty member with personal, contact, and academic credentials.'}
      >
        <Button variant="outline" onClick={() => navigate('/admin/teachers')} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Directory
        </Button>
      </PageHeader>

      {/* Main Form Container */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Personal Details */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider border-b border-border pb-2 flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-primary" /> Personal Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormInput
              label="Employee ID *"
              placeholder="e.g. EMP-1001"
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              error={errors.employeeId}
            />
            <FormInput
              label="First Name *"
              placeholder="e.g. Robert"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              error={errors.firstName}
            />
            <FormInput
              label="Last Name *"
              placeholder="e.g. Langdon"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              error={errors.lastName}
            />
            <FormSelect
              label="Gender *"
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              options={[
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
                { value: 'other', label: 'Other' }
              ]}
            />
            <FormInput
              label="Date of Birth *"
              type="date"
              value={formData.dob}
              onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
            />
            <FormSelect
              label="Status *"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'on_leave', label: 'On Leave' }
              ]}
            />
          </div>
        </div>

        {/* Section 2: Contact Details */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider border-b border-border pb-2">
            Contact & Address Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Phone Number *"
              placeholder="(555) 000-0000"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              error={errors.phone}
            />
            <FormInput
              label="Email Address *"
              type="email"
              placeholder="faculty@school.edu"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={errors.email}
            />
            <FormTextarea
              label="Residential Address"
              placeholder="Full street address..."
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={2}
            />
          </div>
        </div>

        {/* Section 3: Academic Role & Department */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider border-b border-border pb-2">
            Academic & Position Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormSelect
              label="Department *"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              options={
                departments && departments.length > 0
                  ? departments.map(d => typeof d === 'string' ? { value: d, label: d } : { value: d.name || d.code, label: d.name || d.code })
                  : [
                      { value: 'Mathematics', label: 'Mathematics' },
                      { value: 'Science', label: 'Science' },
                      { value: 'Humanities', label: 'Humanities' },
                      { value: 'Languages', label: 'Languages' },
                      { value: 'Computer Science', label: 'Computer Science' }
                    ]
              }
              error={errors.department}
            />
            <FormSelect
              label="Designation *"
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              options={
                designations && designations.length > 0
                  ? designations.map(d => typeof d === 'string' ? { value: d, label: d } : { value: d.name || d.code, label: d.name || d.code })
                  : [
                      { value: 'Department Head', label: 'Department Head' },
                      { value: 'Senior Teacher', label: 'Senior Teacher' },
                      { value: 'Assistant Teacher', label: 'Assistant Teacher' },
                      { value: 'Lab Instructor', label: 'Lab Instructor' }
                    ]
              }
              error={errors.designation}
            />
            <FormInput
              label="Joining Date *"
              type="date"
              value={formData.joiningDate}
              onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
              error={errors.joiningDate}
            />
            <FormInput
              label="Primary Qualification"
              placeholder="e.g. Ph.D. Mathematics, M.Sc."
              value={formData.qualification}
              onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
            />
            <FormInput
              label="Teaching Experience (Years)"
              type="number"
              min="0"
              value={formData.experienceYears}
              onChange={(e) => setFormData({ ...formData, experienceYears: Number(e.target.value) })}
            />
          </div>
        </div>

        {/* Section 4: Profile Avatar Photo */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider border-b border-border pb-2">
            Profile Image Photo
          </h3>
          <div className="flex items-center gap-6">
            <Avatar src={formData.avatarUrl} fallback={`${formData.firstName?.[0] || 'T'}`} className="h-16 w-16 border-2 border-primary/20" />
            <div className="flex-1 space-y-2">
              <FormInput
                label="Image URL or Path"
                placeholder="https://..."
                value={formData.avatarUrl}
                onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
              />
              <p className="text-[11px] text-muted-foreground">Supported formats: JPG, PNG, WEBP. Recommended resolution: 300x300px.</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Button variant="outline" type="button" onClick={() => navigate('/admin/teachers')}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="flex items-center gap-2">
            <Save className="h-4 w-4" /> {isEditMode ? 'Update Teacher Record' : 'Complete Onboarding'}
          </Button>
        </div>
      </form>

      {/* Success Dialog */}
      <SuccessDialog
        isOpen={isSuccessOpen}
        onClose={handleSuccessClose}
        message={successMsg}
      />
    </PageContainer>
  )
}
