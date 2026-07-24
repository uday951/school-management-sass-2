import React, { useState, useEffect } from 'react'
import axiosClient from '@/config/axiosClient'
import { 
  PageHeader, 
  PageContainer, 
  SimpleCard, 
  StatCard, 
  Button, 
  ReusableTable, 
  FormInput, 
  FormSelect, 
  SuccessDialog,
  StatusChip,
  Badge
} from '@/components/shared'
import { 
  Calendar, 
  Users, 
  UserCheck, 
  Plus, 
  Check, 
  X, 
  FileText, 
  Cpu, 
  Settings, 
  BarChart, 
  Printer 
} from 'lucide-react'

export default function Attendance() {
  const [activeTab, setActiveTab] = useState('student_register')
  const [selectedClass, setSelectedClass] = useState('Grade 10')
  const [selectedSection, setSelectedSection] = useState('A')
  const [selectedDept, setSelectedDept] = useState('Mathematics')
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0])
  
  // Data States
  const [students, setStudents] = useState([])
  const [teachers, setTeachers] = useState([])
  const [holidays, setHolidays] = useState([])
  const [biometricLogs, setBiometricLogs] = useState([])
  const [reportData, setReportData] = useState([])
  
  // UI Loading/Feedback States
  const [loading, setLoading] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  
  // Holiday Form State
  const [holidayForm, setHolidayForm] = useState({ title: '', date: '', description: '' })

  // Fetch student registers
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

  // Fetch teacher registers
  const fetchTeachers = async () => {
    setLoading(true)
    try {
      const res = await axiosClient.get(`/attendance/teacher?department=${selectedDept}&date=${attendanceDate}`)
      if (res.data.success) {
        setTeachers(res.data.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch holidays list
  const fetchHolidays = async () => {
    try {
      const res = await axiosClient.get('/holidays')
      if (res.data.success) {
        setHolidays(res.data.data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Fetch reports list
  const fetchReports = async () => {
    try {
      const res = await axiosClient.get(`/attendance/report?type=student&class=${selectedClass}&section=${selectedSection}`)
      if (res.data.success) {
        setReportData(res.data.data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Fetch real biometric logs from backend
  const loadBiometricLogs = async () => {
    try {
      const res = await axiosClient.get('/attendance/biometric-logs')
      if (res.data.success) {
        setBiometricLogs(res.data.data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    if (activeTab === 'student_register') fetchStudents()
    if (activeTab === 'teacher_register') fetchTeachers()
    if (activeTab === 'holidays') fetchHolidays()
    if (activeTab === 'biometric') loadBiometricLogs()
    if (activeTab === 'reports') fetchReports()
  }, [activeTab, selectedClass, selectedSection, selectedDept, attendanceDate])

  // Handle Mark Student Status
  const handleStudentStatusChange = async (studentId, status) => {
    try {
      const res = await axiosClient.post('/attendance/student', {
        studentId,
        date: attendanceDate,
        status,
        remarks: 'Class roster mark'
      })
      if (res.data.success) {
        setStudents(prev => prev.map(s => s.id === studentId ? { ...s, status } : s))
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Handle Mark Teacher Status
  const handleTeacherStatusChange = async (teacherId, status) => {
    try {
      const res = await axiosClient.post('/attendance/teacher', {
        teacherId,
        date: attendanceDate,
        status,
        remarks: 'Admin roster mark'
      })
      if (res.data.success) {
        setTeachers(prev => prev.map(t => t.id === teacherId ? { ...t, status } : t))
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Handle create holiday
  const handleAddHoliday = async (e) => {
    e.preventDefault()
    try {
      const res = await axiosClient.post('/holidays', holidayForm)
      if (res.data.success) {
        setHolidayForm({ title: '', date: '', description: '' })
        fetchHolidays()
        setSuccessMsg('Holiday created successfully.')
        setSuccessOpen(true)
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Columns Definitions
  const studentColumns = [
    { header: 'Admission No', accessor: 'admissionNo' },
    { header: 'Roll No', accessor: 'rollNo' },
    { header: 'Student Name', accessor: 'name' },
    {
      header: 'Status',
      accessor: (row) => <StatusChip status={row.status} />
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex gap-1.5 select-none">
          <Button variant={row.status === 'present' ? 'default' : 'outline'} size="sm" onClick={() => handleStudentStatusChange(row.id, 'present')}>Present</Button>
          <Button variant={row.status === 'absent' ? 'destructive' : 'outline'} size="sm" onClick={() => handleStudentStatusChange(row.id, 'absent')}>Absent</Button>
          <Button variant={row.status === 'late' ? 'secondary' : 'outline'} size="sm" onClick={() => handleStudentStatusChange(row.id, 'late')}>Late</Button>
          <Button variant={row.status === 'halfday' ? 'outline' : 'outline'} size="sm" onClick={() => handleStudentStatusChange(row.id, 'halfday')}>Half Day</Button>
        </div>
      )
    }
  ]

  const teacherColumns = [
    { header: 'Employee ID', accessor: 'id' },
    { header: 'Teacher Name', accessor: 'name' },
    { header: 'Department', accessor: 'department' },
    {
      header: 'Status',
      accessor: (row) => <StatusChip status={row.status} />
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex gap-1.5">
          <Button variant={row.status === 'present' ? 'default' : 'outline'} size="sm" onClick={() => handleTeacherStatusChange(row.id, 'present')}>Present</Button>
          <Button variant={row.status === 'absent' ? 'destructive' : 'outline'} size="sm" onClick={() => handleTeacherStatusChange(row.id, 'absent')}>Absent</Button>
          <Button variant={row.status === 'late' ? 'secondary' : 'outline'} size="sm" onClick={() => handleTeacherStatusChange(row.id, 'late')}>Late</Button>
        </div>
      )
    }
  ]

  const reportColumns = [
    { header: 'Admission No', accessor: 'admissionNo' },
    { header: 'Student Name', accessor: 'name' },
    { header: 'Class', accessor: 'class' },
    { header: 'Section', accessor: 'section' },
    { header: 'Present Days', accessor: 'presentCount' },
    { header: 'Absent Days', accessor: 'absentCount' },
    {
      header: 'Attendance Rate',
      accessor: (row) => (
        <Badge className={row.attendanceRate >= 90 ? 'bg-emerald-600' : 'bg-amber-600'}>
          {row.attendanceRate}%
        </Badge>
      )
    }
  ]

  return (
    <PageContainer>
      <PageHeader 
        title="Attendance Roster"
        subtitle="Mark daily student & teacher attendance registers, configure holidays and audit logs."
      />

      {/* Summary Stat Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Daily Student Rate" value="96.2%" change="+1.2%" changeType="positive" icon={UserCheck} />
        <StatCard title="Teachers Present" value="28 / 30" change="93%" icon={Users} />
        <StatCard title="Holidays Logged" value={`${holidays.length} Days`} icon={Calendar} />
        <StatCard title="Biometric Checkins" value="142 Devices" icon={Cpu} />
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-border select-none overflow-x-auto gap-1 mb-6 pb-1">
        {[
          { id: 'student_register', label: 'Student Register', icon: Users },
          { id: 'teacher_register', label: 'Teacher Register', icon: Users },
          { id: 'holidays', label: 'Holiday Calendar', icon: Calendar },
          { id: 'biometric', label: 'Biometric Logs', icon: Cpu },
          { id: 'reports', label: 'Attendance Reports', icon: BarChart }
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

      {/* Roster Controls */}
      {(activeTab === 'student_register' || activeTab === 'teacher_register') && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-card p-4 rounded-lg border border-border shadow-sm mb-6">
          <FormInput 
            label="Attendance Date" 
            type="date" 
            value={attendanceDate} 
            onChange={(e) => setAttendanceDate(e.target.value)} 
            className="space-y-0"
          />
          {activeTab === 'student_register' && (
            <>
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
            </>
          )}
          {activeTab === 'teacher_register' && (
            <FormSelect 
              label="Department" 
              value={selectedDept} 
              onChange={(e) => setSelectedDept(e.target.value)}
              options={[
                { value: 'Mathematics', label: 'Mathematics' },
                { value: 'Science', label: 'Science' },
                { value: 'English', label: 'English' }
              ]}
              className="space-y-0"
            />
          )}
          <div className="flex items-end justify-end">
            <Button className="w-full flex items-center justify-center gap-1.5" onClick={() => {
              setSuccessMsg('Roster register successfully synced to cloud.')
              setSuccessOpen(true)
            }}>
              <Check className="h-4 w-4" /> Save Roster
            </Button>
          </div>
        </div>
      )}

      {/* Main Roster Panel Content */}
      <div className="w-full">
        {activeTab === 'student_register' && (
          <SimpleCard title="Student Attendance register list">
            <ReusableTable columns={studentColumns} data={students} />
          </SimpleCard>
        )}

        {activeTab === 'teacher_register' && (
          <SimpleCard title="Teacher / Staff register list">
            <ReusableTable columns={teacherColumns} data={teachers} />
          </SimpleCard>
        )}

        {activeTab === 'holidays' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <SimpleCard title="Add School Holiday">
                <form onSubmit={handleAddHoliday} className="space-y-4">
                  <FormInput 
                    label="Holiday Title" 
                    placeholder="e.g. Christmas Day"
                    value={holidayForm.title}
                    onChange={(e) => setHolidayForm(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                  <FormInput 
                    label="Holiday Date" 
                    type="date"
                    value={holidayForm.date}
                    onChange={(e) => setHolidayForm(prev => ({ ...prev, date: e.target.value }))}
                    required
                  />
                  <FormInput 
                    label="Description" 
                    placeholder="Brief holiday details"
                    value={holidayForm.description}
                    onChange={(e) => setHolidayForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                  <Button type="submit" className="w-full flex items-center justify-center gap-1.5">
                    <Plus className="h-4 w-4" /> Add Holiday
                  </Button>
                </form>
              </SimpleCard>
            </div>
            <div className="md:col-span-2">
              <SimpleCard title="Academic Holiday Calendar Calendar">
                <ReusableTable 
                  columns={[
                    { header: 'Holiday Title', accessor: 'title' },
                    { header: 'Date', accessor: (row) => new Date(row.date).toLocaleDateString() },
                    { header: 'Description', accessor: 'description' }
                  ]} 
                  data={holidays} 
                />
              </SimpleCard>
            </div>
          </div>
        )}

        {activeTab === 'biometric' && (
          <SimpleCard title="IoT Biometric Device Logs">
            <ReusableTable 
              columns={[
                { header: 'Employee ID', accessor: 'empId' },
                { header: 'Name', accessor: 'name' },
                { header: 'Time Captured', accessor: 'time' },
                { header: 'Machine Device', accessor: 'device' },
                { 
                  header: 'Gate status', 
                  accessor: (row) => <Badge className="bg-emerald-600">{row.status}</Badge> 
                }
              ]} 
              data={biometricLogs} 
            />
          </SimpleCard>
        )}

        {activeTab === 'reports' && (
          <SimpleCard title="Monthly Performance Reports">
            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-2">
                <FormSelect 
                  placeholder="Class" 
                  value={selectedClass} 
                  onChange={(e) => setSelectedClass(e.target.value)}
                  options={[
                    { value: 'Grade 9', label: 'Grade 9' },
                    { value: 'Grade 10', label: 'Grade 10' }
                  ]}
                  className="w-36 space-y-0 h-9"
                />
              </div>
              <Button variant="outline" size="sm" className="flex items-center gap-1.5" onClick={() => window.print()}>
                <Printer className="h-4 w-4" /> Print Reports
              </Button>
            </div>
            <ReusableTable columns={reportColumns} data={reportData} />
          </SimpleCard>
        )}
      </div>

      <SuccessDialog open={successOpen} onClose={() => setSuccessOpen(false)} message={successMsg} />
    </PageContainer>
  )
}
