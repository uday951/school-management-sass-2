import React, { useState, useEffect } from 'react'
import axiosClient from '@/config/axiosClient'
import { 
  PageHeader, 
  PageContainer, 
  SimpleCard, 
  Button, 
  ReusableTable, 
  FormInput, 
  FormSelect, 
  SuccessDialog,
  StatusChip
} from '@/components/shared'
import { Check, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function AttendanceMark() {
  const navigate = useNavigate()
  const [selectedClass, setSelectedClass] = useState('Grade 10')
  const [selectedSection, setSelectedSection] = useState('A')
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0])
  
  // Data States
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  
  // Feedback
  const [successOpen, setSuccessOpen] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  // Fetch students for mark roster
  const fetchStudents = async () => {
    setLoading(true)
    try {
      const res = await axiosClient.get(`/attendance/student?class=${selectedClass}&section=${selectedSection}&date=${attendanceDate}`)
      if (res.data.success) {
        setStudents(res.data.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [selectedClass, selectedSection, attendanceDate])

  // Handle Mark Status
  const handleStatusChange = async (studentId, status) => {
    try {
      const res = await axiosClient.post('/attendance/student', {
        studentId,
        date: attendanceDate,
        status,
        remarks: 'Teacher mark call'
      })
      if (res.data.success) {
        setStudents(prev => prev.map(s => s.id === studentId ? { ...s, status } : s))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const columns = [
    { header: 'Admission No', accessor: 'admissionNo' },
    { header: 'Roll No', accessor: 'rollNo' },
    { header: 'Student Name', accessor: 'name' },
    {
      header: 'Status',
      accessor: (row) => <StatusChip status={row.status} />
    },
    {
      header: 'Mark Attendance',
      accessor: (row) => (
        <div className="flex gap-1">
          <Button variant={row.status === 'present' ? 'default' : 'outline'} size="sm" onClick={() => handleStatusChange(row.id, 'present')}>Present</Button>
          <Button variant={row.status === 'absent' ? 'destructive' : 'outline'} size="sm" onClick={() => handleStatusChange(row.id, 'absent')}>Absent</Button>
          <Button variant={row.status === 'late' ? 'secondary' : 'outline'} size="sm" onClick={() => handleStatusChange(row.id, 'late')}>Late</Button>
          <Button variant={row.status === 'halfday' ? 'outline' : 'outline'} size="sm" onClick={() => handleStatusChange(row.id, 'halfday')}>Half Day</Button>
        </div>
      )
    }
  ]

  return (
    <PageContainer>
      <PageHeader 
        title="Student Attendance Roll Call"
        subtitle="Mark daily student attendance registers for class sections."
        actions={
          <Button variant="outline" className="flex items-center gap-1.5" onClick={() => navigate('/teacher/dashboard')}>
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Button>
        }
      />

      {/* Roster Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-card p-4 rounded-lg border border-border shadow-sm mb-6">
        <FormInput 
          label="Attendance Date" 
          type="date" 
          value={attendanceDate} 
          onChange={(e) => setAttendanceDate(e.target.value)} 
          className="space-y-0"
        />
        <FormSelect 
          label="Class" 
          value={selectedClass} 
          onChange={(e) => setSelectedClass(e.target.value)}
          options={[
            { value: 'Grade 9', label: 'Grade 9' },
            { value: 'Grade 10', label: 'Grade 10' },
            { value: 'Grade 12', label: 'Grade 12' }
          ]}
          className="space-y-0"
        />
        <FormSelect 
          label="Section" 
          value={selectedSection} 
          onChange={(e) => setSelectedSection(e.target.value)}
          options={[
            { value: 'A', label: 'Section A' },
            { value: 'B', label: 'Section B' }
          ]}
          className="space-y-0"
        />
        <div className="flex items-end justify-end">
          <Button className="w-full flex items-center justify-center gap-1.5" onClick={() => {
            setSuccessMsg('Roll call attendance successfully recorded.')
            setSuccessOpen(true)
          }}>
            <Check className="h-4 w-4" /> Submit Register
          </Button>
        </div>
      </div>

      <SimpleCard title="Mark Student Register list">
        <ReusableTable columns={columns} data={students} />
      </SimpleCard>

      <SuccessDialog open={successOpen} onClose={() => setSuccessOpen(false)} message={successMsg} />
    </PageContainer>
  )
}
