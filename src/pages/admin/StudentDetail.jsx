import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  PageHeader, 
  PageContainer, 
  Button, 
  SimpleCard,
  StatCard,
  InformationCard,
  AttendanceBadge,
  PaymentBadge,
  CalendarLayout,
  Timeline,
  BarChart,
  LineChart,
  PieChart,
  FileCard,
  FileUpload,
  SuccessDialog,
  DeleteDialog,
  Avatar
} from '@/components/shared'
import { 
  ArrowLeft, 
  User, 
  BookOpen, 
  Users, 
  Calendar, 
  DollarSign, 
  FileSpreadsheet, 
  Activity, 
  Paperclip,
  Clock,
  Trash2,
  Download,
  Eye,
  Plus
} from 'lucide-react'

// Mock Data (Cleared)
const STUDENT_PROFILES = {}
export default function StudentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [successOpen, setSuccessOpen] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [studentProfile, setStudentProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Load real profile from backend API
  useEffect(() => {
    fetch(`http://localhost:5000/api/v1/students/${id}/profile`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setStudentProfile(data.data)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  const student = studentProfile || {
    id: id || '1',
    name: 'Student Profile',
    admissionNo: 'ADM000',
    rollNo: '100',
    class: 'Grade 10',
    section: 'A',
    status: 'active',
    dob: '2011-01-01',
    gender: 'Male',
    bloodGroup: 'O+',
    phone: '',
    email: '',
    parentName: 'N/A',
    attendancePercent: 95,
    totalFees: 3500,
    paidFees: 2500,
    pendingFees: 1000
  }

  // Documents state
  const [docs, setDocs] = useState([
    { name: 'Birth_Certificate.pdf', size: '450 KB', type: 'pdf', url: '#' },
    { name: 'Aadhaar_ID.jpg', size: '1.2 MB', type: 'jpg', url: '#' },
  ])
  const [deleteDocIndex, setDeleteDocIndex] = useState(null)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const handleDocUpload = (file) => {
    if (file) {
      setDocs(prev => [
        ...prev,
        { name: file.name, size: `${Math.round(file.size / 1024)} KB`, type: file.name.split('.').pop(), url: '#' }
      ])
      setSuccessMsg('Document uploaded successfully.')
      setSuccessOpen(true)
    }
  }

  const triggerDocDelete = (index) => {
    setDeleteDocIndex(index)
    setDeleteOpen(true)
  }

  const confirmDocDelete = () => {
    setDocs(prev => prev.filter((_, i) => i !== deleteDocIndex))
    setDeleteOpen(false)
    setSuccessMsg('Document deleted successfully.')
    setSuccessOpen(true)
  }

  return (
    <PageContainer>
      <PageHeader 
        title={`Student Profile: ${student.name}`}
        subtitle={`Admission ID: ${student.admissionNo} | Class: ${student.class}-${student.section}`}
        actions={
          <Button variant="outline" className="flex items-center gap-1.5" onClick={() => navigate('/admin/students')}>
            <ArrowLeft className="h-4 w-4" /> Back to Directory
          </Button>
        }
      />

      {/* Tabs Switcher */}
      <div className="flex border-b border-border select-none overflow-x-auto gap-1 mb-6 pb-1">
        {[
          { id: 'overview', label: 'Overview', icon: User },
          { id: 'personal', label: 'Personal Info', icon: User },
          { id: 'academic', label: 'Academic Info', icon: BookOpen },
          { id: 'parent', label: 'Parent Details', icon: Users },
          { id: 'attendance', label: 'Attendance', icon: Calendar },
          { id: 'fees', label: 'Fee Details', icon: DollarSign },
          { id: 'exams', label: 'Exam Results', icon: FileSpreadsheet },
          { id: 'medical', label: 'Medical Records', icon: Activity },
          { id: 'documents', label: 'Documents', icon: Paperclip },
          { id: 'timeline', label: 'Activity Timeline', icon: Clock }
        ].map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-md border-b-2 transition-all shrink-0 cursor-pointer ${
                activeTab === tab.id 
                  ? 'border-primary bg-primary/5 text-primary' 
                  : 'border-transparent text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Panels */}
      <div className="w-full">
        {/* OVERVIEW PANEL */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-6">
              <SimpleCard className="text-center flex flex-col items-center p-6">
                <Avatar name={student.name} size="lg" className="h-20 w-20 border border-border shadow-sm mb-4" />
                <h3 className="font-bold text-lg text-foreground">{student.name}</h3>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{student.class} - Section {student.section}</p>
                <div className="mt-4 flex gap-2 w-full justify-center">
                  <Button variant="outline" size="sm" onClick={() => window.print()}>Print ID Card</Button>
                </div>
              </SimpleCard>
              
              <StatCard title="Attendance Rate" value={`${student.attendancePercent}%`} change="+2.1%" icon={Calendar} />
            </div>

            <div className="md:col-span-2 space-y-6">
              <InformationCard 
                title="Quick Profile Details"
                items={[
                  { label: 'Admission Number', value: student.admissionNo },
                  { label: 'Roll Number', value: student.rollNo },
                  { label: 'Academic Year', value: student.academicYear },
                  { label: 'Parent Phone', value: student.parentPhone },
                  { label: 'Contact Email', value: student.email }
                ]}
              />

              <SimpleCard title="Term Performance Summary">
                <BarChart 
                  data={[
                    { label: 'Math', value: 85 },
                    { label: 'Science', value: 92 },
                    { label: 'English', value: 88 },
                    { label: 'History', value: 78 }
                  ]}
                />
              </SimpleCard>
            </div>
          </div>
        )}

        {/* PERSONAL DETAILS PANEL */}
        {activeTab === 'personal' && (
          <InformationCard 
            title="Personal Identification Details"
            items={[
              { label: 'First Name', value: student.name.split(' ')[0] },
              { label: 'Last Name', value: student.name.split(' ')[1] },
              { label: 'Date of Birth', value: student.dob },
              { label: 'Gender', value: student.gender },
              { label: 'Blood Group', value: student.bloodGroup },
              { label: 'Religion', value: student.religion },
              { label: 'Nationality', value: student.nationality },
              { label: 'Primary Phone', value: student.phone },
              { label: 'Contact Email', value: student.email },
              { label: 'Residential Address', value: student.address }
            ]}
          />
        )}

        {/* ACADEMIC DETAILS PANEL */}
        {activeTab === 'academic' && (
          <InformationCard 
            title="Institutional Allocation Details"
            items={[
              { label: 'Campus Wing', value: student.campus },
              { label: 'Academic Session', value: student.academicYear },
              { label: 'Enrolled Class', value: student.class },
              { label: 'Section Room', value: student.section },
              { label: 'Roll Number', value: student.rollNo },
              { label: 'Student House', value: student.house },
              { label: 'Education Board', value: student.board },
              { label: 'Instruction Medium', value: student.medium }
            ]}
          />
        )}

        {/* PARENT DETAILS PANEL */}
        {activeTab === 'parent' && (
          <div className="space-y-6">
            <InformationCard 
              title="Guardian Directory Details"
              items={[
                { label: 'Father Name', value: student.parentName },
                { label: 'Father Occupation', value: student.parentOccupation },
                { label: 'Mother Name', value: student.motherName },
                { label: 'Parent Telephone', value: student.parentPhone },
                { label: 'Parent Email', value: student.parentEmail }
              ]}
            />
            <InformationCard 
              title="Emergency Contact Reference"
              items={[
                { label: 'Emergency Contact Person', value: student.emergencyName },
                { label: 'Emergency Contact Phone', value: student.emergencyPhone },
                { label: 'Relationship to Student', value: student.emergencyRelation }
              ]}
            />
          </div>
        )}

        {/* ATTENDANCE PANEL */}
        {activeTab === 'attendance' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-6">
              <StatCard title="Total Present" value="23 Days" change="+1.2%" icon={Calendar} />
              <StatCard title="Total Absent" value="1 Day" icon={Calendar} />
              <div className="bg-card border border-border p-6 rounded-lg shadow-sm">
                <h4 className="font-semibold text-sm mb-4">Summary Statistics</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>Attendance status:</span>
                    <span className="font-bold text-emerald-600">Excellent</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Target Rate:</span>
                    <span className="font-bold">95.0%</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="md:col-span-2">
              <CalendarLayout 
                events={[
                  { day: 12, title: 'Present' },
                  { day: 13, title: 'Present' },
                  { day: 14, title: 'Absent' },
                  { day: 15, title: 'Present' }
                ]}
                monthName="July 2026"
              />
            </div>
          </div>
        )}

        {/* FEE DETAILS PANEL */}
        {activeTab === 'fees' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="Total Fees Billed" value={`$${student.totalFees}`} icon={DollarSign} />
              <StatCard title="Total Paid" value={`$${student.paidFees}`} icon={DollarSign} />
              <StatCard title="Total Outstanding" value={`$${student.pendingFees}`} icon={DollarSign} />
            </div>

            <SimpleCard title="Invoices Transaction History">
              <div className="overflow-x-auto rounded-md border border-border">
                <table className="w-full text-left text-sm text-foreground">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 font-semibold text-muted-foreground select-none">
                      <th className="px-4 py-3">Invoice Code</th>
                      <th className="px-4 py-3">Installment Term</th>
                      <th className="px-4 py-3">Total Amount</th>
                      <th className="px-4 py-3">Due Date</th>
                      <th className="px-4 py-3">Receipt status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border">
                      <td className="px-4 py-3">INV-2026-001</td>
                      <td className="px-4 py-3">Term 1 Fees</td>
                      <td className="px-4 py-3">$1,500</td>
                      <td className="px-4 py-3">2026-06-30</td>
                      <td className="px-4 py-3"><PaymentBadge status="paid" /></td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="px-4 py-3">INV-2026-002</td>
                      <td className="px-4 py-3">Term 2 Fees</td>
                      <td className="px-4 py-3">$1,000</td>
                      <td className="px-4 py-3">2026-09-30</td>
                      <td className="px-4 py-3"><PaymentBadge status="paid" /></td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="px-4 py-3">INV-2026-003</td>
                      <td className="px-4 py-3">Term 3 Fees</td>
                      <td className="px-4 py-3">$1,000</td>
                      <td className="px-4 py-3">2026-12-31</td>
                      <td className="px-4 py-3"><PaymentBadge status="partial" /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </SimpleCard>
          </div>
        )}

        {/* EXAMS RESULTS PANEL */}
        {activeTab === 'exams' && (
          <div className="space-y-6">
            <SimpleCard title="Terminal Examination Marks Matrix">
              <div className="overflow-x-auto rounded-md border border-border">
                <table className="w-full text-left text-sm text-foreground">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 font-semibold text-muted-foreground select-none">
                      <th className="px-4 py-3">Subject Name</th>
                      <th className="px-4 py-3">Exam Term</th>
                      <th className="px-4 py-3">Maximum Marks</th>
                      <th className="px-4 py-3">Marks Obtained</th>
                      <th className="px-4 py-3">Assigned Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border">
                      <td className="px-4 py-3 font-semibold">Mathematics</td>
                      <td className="px-4 py-3">First Midterm</td>
                      <td className="px-4 py-3">100</td>
                      <td className="px-4 py-3">85</td>
                      <td className="px-4 py-3">A</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="px-4 py-3 font-semibold">Physics</td>
                      <td className="px-4 py-3">First Midterm</td>
                      <td className="px-4 py-3">100</td>
                      <td className="px-4 py-3">92</td>
                      <td className="px-4 py-3">A+</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="px-4 py-3 font-semibold">English Lit</td>
                      <td className="px-4 py-3">First Midterm</td>
                      <td className="px-4 py-3">100</td>
                      <td className="px-4 py-3">88</td>
                      <td className="px-4 py-3">A</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </SimpleCard>
            <SimpleCard title="Historical Progress curve">
              <LineChart 
                data={[
                  { label: 'Grade 7', value: 78 },
                  { label: 'Grade 8', value: 83 },
                  { label: 'Grade 9', value: 87 },
                  { label: 'Grade 10', value: 92 }
                ]}
              />
            </SimpleCard>
          </div>
        )}

        {/* MEDICAL RECORDS PANEL */}
        {activeTab === 'medical' && (
          <InformationCard 
            title="Medical Logs & Dossier Profile"
            items={[
              { label: 'Blood Group', value: student.bloodGroup },
              { label: 'Registered Height', value: '162 cm' },
              { label: 'Registered Weight', value: '54 kg' },
              { label: 'Allergies Tracked', value: 'Peanuts' },
              { label: 'Medical Conditions', value: 'None' },
              { label: 'Vaccination History', value: 'Completed MMR, Varicella' },
              { label: 'Doctor Notes', value: 'Student wears spectacles for near vision.' }
            ]}
          />
        )}

        {/* DOCUMENTS PANEL */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            <SimpleCard title="Upload Digital File Archive">
              <FileUpload label="Select File to Upload" onFileSelect={handleDocUpload} />
            </SimpleCard>

            <SimpleCard title="Verified Dossier Documents">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {docs.map((doc, idx) => (
                  <FileCard 
                    key={idx}
                    name={doc.name}
                    size={doc.size}
                    type={doc.type}
                    url={doc.url}
                    onPreview={() => console.log('Previewing File', doc.name)}
                  />
                ))}
              </div>
            </SimpleCard>
          </div>
        )}

        {/* ACTIVITY TIMELINE PANEL */}
        {activeTab === 'timeline' && (
          <SimpleCard title="Academic and Administrative Logs">
            <Timeline 
              events={[
                { time: '2026-06-30', title: 'Admitted to Grade 10', description: 'Admission register verified under code ADM001.' },
                { time: '2026-07-05', title: 'Term 1 Fee Invoice Settled', description: 'Receipt processed via payment checkout for $1,500.' },
                { time: '2026-07-12', title: 'Marked Absent', description: 'Daily attendance log updated. Absent trigger notification dispatched.' }
              ]}
            />
          </SimpleCard>
        )}
      </div>

      {/* Success Dialog */}
      <SuccessDialog 
        isOpen={successOpen}
        onClose={() => setSuccessOpen(false)}
        message={successMsg}
      />

      {/* Delete Confirmation */}
      <DeleteDialog 
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={confirmDocDelete}
        itemName="selected file"
      />
    </PageContainer>
  )
}
