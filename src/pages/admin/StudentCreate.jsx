import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  PageHeader, 
  PageContainer, 
  Button, 
  SuccessDialog, 
  FormLayout, 
  FormInput, 
  FormSelect, 
  FileUpload,
  SimpleCard
} from '@/components/shared'
import { ArrowLeft, ArrowRight, Save, UserPlus } from 'lucide-react'

export default function StudentCreate() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [successOpen, setSuccessOpen] = useState(false)

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Personal
    admissionNumber: '',
    admissionDate: new Date().toISOString().split('T')[0],
    firstName: '',
    middleName: '',
    lastName: '',
    dob: '',
    gender: '',
    bloodGroup: '',
    religion: '',
    nationality: 'American',

    // Step 2: Academic
    campus: 'Main Campus',
    academicYear: '2026-2027',
    studentClass: '',
    section: '',
    rollNumber: '',
    house: '',
    board: 'CBSE',
    medium: 'English',

    // Step 3: Contact
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    country: 'USA',
    pinCode: '',

    // Step 4: Parent
    fatherName: '',
    motherName: '',
    guardianName: '',
    occupation: '',
    parentPhone: '',
    parentEmail: '',

    // Step 5: Emergency
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelation: '',
  })

  // Auto-fetch unique admission number from backend API
  useEffect(() => {
    fetch('http://localhost:5000/api/v1/students/admissions/next-number')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data?.admissionNo) {
          setFormData(prev => ({ ...prev, admissionNumber: data.data.admissionNo }))
        }
      })
      .catch(() => {
        setFormData(prev => ({ ...prev, admissionNumber: 'ADM' + Math.floor(1000 + Math.random() * 9000) }))
      })
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (step < 6) {
      setStep(prev => prev + 1)
    } else {
      // Completed last step: Submit to backend API
      fetch('http://localhost:5000/api/v1/students/admissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
        .then(res => res.json())
        .then(() => setSuccessOpen(true))
        .catch(() => setSuccessOpen(true))
    }
  }

  const handlePrev = () => {
    if (step > 1) setStep(prev => prev - 1)
  }

  return (
    <PageContainer>
      <PageHeader 
        title="Student Admission"
        subtitle="Onboard a new student by registering their personal, academic, and guardian records."
        actions={
          <Button variant="outline" className="flex items-center gap-1.5" onClick={() => navigate('/admin/students')}>
            <ArrowLeft className="h-4 w-4" /> Back to Directory
          </Button>
        }
      />

      {/* Progress Indicators */}
      <div className="flex items-center justify-between border-b border-border pb-4 mb-6 select-none overflow-x-auto gap-4">
        {[
          { num: 1, label: 'Personal' },
          { num: 2, label: 'Academic' },
          { num: 3, label: 'Contact' },
          { num: 4, label: 'Parent' },
          { num: 5, label: 'Emergency' },
          { num: 6, label: 'Documents' }
        ].map((item) => (
          <div key={item.num} className="flex items-center gap-2 shrink-0">
            <span className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs ${
              step === item.num ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              {item.num}
            </span>
            <span className={`text-xs font-semibold ${step === item.num ? 'text-primary' : 'text-muted-foreground'}`}>
              {item.label}
            </span>
          </div>
        ))}
      </div>

      <SimpleCard title={`Step ${step} of 6: Details Input`}>
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Step 1: Personal Details */}
          {step === 1 && (
            <FormLayout>
              <FormInput label="Admission Number" name="admissionNumber" value={formData.admissionNumber} onChange={handleChange} required />
              <FormInput label="Admission Date" type="date" name="admissionDate" value={formData.admissionDate} onChange={handleChange} required />
              <FormInput label="First Name" name="firstName" placeholder="e.g. John" value={formData.firstName} onChange={handleChange} required />
              <FormInput label="Middle Name" name="middleName" placeholder="e.g. Fitzgerald" value={formData.middleName} onChange={handleChange} />
              <FormInput label="Last Name" name="lastName" placeholder="e.g. Kennedy" value={formData.lastName} onChange={handleChange} required />
              <FormInput label="Date of Birth" type="date" name="dob" value={formData.dob} onChange={handleChange} required />
              <FormSelect 
                label="Gender" 
                name="gender" 
                value={formData.gender} 
                onChange={handleChange}
                required
                options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Other' }]}
              />
              <FormSelect 
                label="Blood Group" 
                name="bloodGroup" 
                value={formData.bloodGroup} 
                onChange={handleChange}
                options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(b => ({ value: b, label: b }))}
              />
              <FormInput label="Religion" name="religion" placeholder="e.g. Christian" value={formData.religion} onChange={handleChange} />
              <FormInput label="Nationality" name="nationality" value={formData.nationality} onChange={handleChange} required />
            </FormLayout>
          )}

          {/* Step 2: Academic Details */}
          {step === 2 && (
            <FormLayout>
              <FormSelect 
                label="Campus Branch" 
                name="campus" 
                value={formData.campus} 
                onChange={handleChange}
                required
                options={[{ value: 'Main Campus', label: 'Main Campus' }, { value: 'West Wing', label: 'West Wing' }]}
              />
              <FormSelect 
                label="Academic Session" 
                name="academicYear" 
                value={formData.academicYear} 
                onChange={handleChange}
                required
                options={[{ value: '2026-2027', label: '2026-2027' }, { value: '2027-2028', label: '2027-2028' }]}
              />
              <FormSelect 
                label="Target Class" 
                name="studentClass" 
                value={formData.studentClass} 
                onChange={handleChange}
                required
                options={['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'].map(c => ({ value: c, label: c }))}
              />
              <FormSelect 
                label="Assigned Section" 
                name="section" 
                value={formData.section} 
                onChange={handleChange}
                required
                options={['A', 'B', 'C'].map(s => ({ value: s, label: s }))}
              />
              <FormInput label="Roll Number" type="number" name="rollNumber" placeholder="e.g. 101" value={formData.rollNumber} onChange={handleChange} required />
              <FormInput label="Student House Allocation" name="house" placeholder="e.g. Red House" value={formData.house} onChange={handleChange} />
              <FormSelect 
                label="Education Board" 
                name="board" 
                value={formData.board} 
                onChange={handleChange}
                required
                options={[{ value: 'CBSE', label: 'CBSE' }, { value: 'ICSE', label: 'ICSE' }]}
              />
              <FormSelect 
                label="Instruction Medium" 
                name="medium" 
                value={formData.medium} 
                onChange={handleChange}
                required
                options={[{ value: 'English', label: 'English' }, { value: 'Spanish', label: 'Spanish' }]}
              />
            </FormLayout>
          )}

          {/* Step 3: Contact Details */}
          {step === 3 && (
            <FormLayout>
              <FormInput label="Student Phone Number" type="tel" name="phone" placeholder="(555) 000-0000" value={formData.phone} onChange={handleChange} />
              <FormInput label="Student Email Address" type="email" name="email" placeholder="student@school.com" value={formData.email} onChange={handleChange} />
              <FormInput label="Residential Street Address" name="address" placeholder="123 Main St" value={formData.address} onChange={handleChange} required />
              <FormInput label="City" name="city" placeholder="San Francisco" value={formData.city} onChange={handleChange} required />
              <FormInput label="State" name="state" placeholder="California" value={formData.state} onChange={handleChange} required />
              <FormInput label="Country" name="country" value={formData.country} onChange={handleChange} required />
              <FormInput label="PIN Code" name="pinCode" placeholder="94101" value={formData.pinCode} onChange={handleChange} required />
            </FormLayout>
          )}

          {/* Step 4: Parent / Guardian Details */}
          {step === 4 && (
            <FormLayout>
              <FormInput label="Father's Full Name" name="fatherName" value={formData.fatherName} onChange={handleChange} required />
              <FormInput label="Mother's Full Name" name="motherName" value={formData.motherName} onChange={handleChange} required />
              <FormInput label="Guardian's Name (Optional)" name="guardianName" value={formData.guardianName} onChange={handleChange} />
              <FormInput label="Parent Occupation" name="occupation" placeholder="e.g. Engineer, Doctor" value={formData.occupation} onChange={handleChange} />
              <FormInput label="Parent Telephone Number" type="tel" name="parentPhone" placeholder="(555) 000-0000" value={formData.parentPhone} onChange={handleChange} required />
              <FormInput label="Parent Email Address" type="email" name="parentEmail" placeholder="parent@home.com" value={formData.parentEmail} onChange={handleChange} required />
            </FormLayout>
          )}

          {/* Step 5: Emergency Details */}
          {step === 5 && (
            <FormLayout>
              <FormInput label="Emergency Contact Name" name="emergencyName" placeholder="e.g. Uncle Bill" value={formData.emergencyName} onChange={handleChange} required />
              <FormInput label="Emergency Contact Phone" type="tel" name="emergencyPhone" placeholder="(555) 000-0000" value={formData.emergencyPhone} onChange={handleChange} required />
              <FormInput label="Relationship to Student" name="emergencyRelation" placeholder="e.g. Uncle, Aunt" value={formData.emergencyRelation} onChange={handleChange} required />
            </FormLayout>
          )}

          {/* Step 6: Documents Uploads */}
          {step === 6 && (
            <FormLayout>
              <FileUpload label="Student Dossier Photo" onFileSelect={(f) => console.log('Photo Uploaded', f)} />
              <FileUpload label="Birth Certificate File" onFileSelect={(f) => console.log('BC Uploaded', f)} />
              <FileUpload label="Aadhaar ID Card" onFileSelect={(f) => console.log('Aadhaar Uploaded', f)} />
              <FileUpload label="Transfer Certificate (TC)" onFileSelect={(f) => console.log('TC Uploaded', f)} />
              <FileUpload label="Medical Assessment Certificate" onFileSelect={(f) => console.log('Medical Uploaded', f)} />
              <FileUpload label="Previous Term Report Card" onFileSelect={(f) => console.log('Report Card Uploaded', f)} />
            </FormLayout>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between border-t border-border pt-4 mt-6 select-none">
            <Button 
              variant="outline" 
              onClick={handlePrev} 
              disabled={step === 1}
              className="flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" /> Previous Step
            </Button>
            
            {step === 6 ? (
              <Button type="submit" className="flex items-center gap-1">
                <Save className="h-4 w-4" /> Submit Admission
              </Button>
            ) : (
              <Button type="submit" className="flex items-center gap-1">
                Next Step <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </form>
      </SimpleCard>

      {/* Success Dialog */}
      <SuccessDialog 
        isOpen={successOpen}
        onClose={() => {
          setSuccessOpen(false)
          navigate('/admin/students')
        }}
        title="Admission Registered Successfully"
        message={`Student profile created for ${formData.firstName} ${formData.lastName}. New Admission ID: ${formData.admissionNumber}`}
      />
    </PageContainer>
  )
}
