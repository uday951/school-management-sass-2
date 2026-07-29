import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosClient from '@/config/axiosClient'
import {
  PageHeader,
  PageContainer,
  SimpleCard,
  Button,
  ReusableTable,
  SuccessDialog,
  StatusChip,
  Badge,
  FormDialog,
  FormSelect,
  FormInput,
  FormTextarea
} from '@/components/shared'
import { Check, X, ArrowLeft, CalendarDays, Plus, Clock, FileText } from 'lucide-react'
import teacherService from '@/services/teacherService'

export default function AttendanceLeaves() {
  const navigate = useNavigate()
  const [activeSubTab, setActiveSubTab] = useState('classroom')

  // Tab 1: Student Classroom Leave Approvals state
  const [studentLeaves, setStudentLeaves] = useState([])
  const [studentLoading, setStudentLoading] = useState(true)
  const [studentSuccessOpen, setStudentSuccessOpen] = useState(false)
  const [studentSuccessMsg, setStudentSuccessMsg] = useState('')

  // Tab 2: Teacher's Own Leaves & Attendance state
  const [teacher, setTeacher] = useState(null)
  const [teacherLoading, setTeacherLoading] = useState(true)
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false)
  const [isSuccessOpen, setIsSuccessOpen] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [leaveForm, setLeaveForm] = useState({
    leaveType: 'casual',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: ''
  })

  // Fetch classroom student leaves
  const fetchClassroomLeaves = async () => {
    setStudentLoading(true)
    try {
      const res = await axiosClient.get('/attendance/leaves?type=student')
      if (res.data.success) {
        setStudentLeaves(res.data.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setStudentLoading(false)
    }
  }

  // Load teacher's own attendance & leaves data
  const loadTeacherData = async () => {
    setTeacherLoading(true)
    try {
      const res = await axiosClient.get('/teacher/profile')
      const teacher = res.data?.data || res.data
      setTeacher(teacher)
    } catch (err) {
      console.error(err)
    } finally {
      setTeacherLoading(false)
    }
  }

  useEffect(() => {
    fetchClassroomLeaves()
    loadTeacherData()
  }, [])

  // Handle Approve/Reject status updates for student leaves
  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await axiosClient.patch(`/attendance/leaves/${id}/status`, {
        status,
        actionRemarks: 'Processed by classroom coordinator.',
        actionBy: 'Class Coordinator'
      })
      if (res.data.success) {
        setStudentSuccessMsg(`Student leave request successfully ${status}.`)
        setStudentSuccessOpen(true)
        fetchClassroomLeaves()
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Handle Apply Leave for Teacher
  const handleApplyLeave = async (e) => {
    e.preventDefault()
    setIsLeaveModalOpen(false)
    try {
      if (teacher) {
        await axiosClient.post('/teacher/leave', leaveForm)
      }
      setLeaveForm({ leaveType: 'casual', startDate: new Date().toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0], reason: '' })
      setSuccessMsg('Leave request submitted to administration successfully.')
      setIsSuccessOpen(true)
      loadTeacherData()
    } catch (err) {
      console.error(err)
    }
  }

  const studentColumns = [
    { header: 'Student Name', accessor: 'applicantName' },
    { 
      header: 'Leave Type', 
      accessor: (row) => <Badge className="capitalize bg-secondary">{row.leaveType}</Badge> 
    },
    { 
      header: 'Start Date', 
      accessor: (row) => new Date(row.startDate).toLocaleDateString() 
    },
    { 
      header: 'End Date', 
      accessor: (row) => new Date(row.endDate).toLocaleDateString() 
    },
    { header: 'Reason', accessor: 'reason' },
    {
      header: 'Status',
      accessor: (row) => <StatusChip status={row.status} />
    },
    {
      header: 'Actions',
      accessor: (row) => row.status === 'pending' ? (
        <div className="flex gap-1.5 select-none">
          <Button variant="default" size="sm" className="flex items-center gap-1" onClick={() => handleUpdateStatus(row._id || row.id, 'approved')}>
            <Check className="h-3 w-3" /> Approve
          </Button>
          <Button variant="destructive" size="sm" className="flex items-center gap-1" onClick={() => handleUpdateStatus(row._id || row.id, 'rejected')}>
            <X className="h-3 w-3" /> Reject
          </Button>
        </div>
      ) : (
        <span className="text-xs text-muted-foreground">Processed</span>
      )
    }
  ]

  return (
    <PageContainer className="space-y-6">
      <PageHeader 
        title="Attendance & Leave Approvals"
        description="Approve classroom student leaves and monitor your own attendance records."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" className="flex items-center gap-1.5" onClick={() => navigate('/teacher/dashboard')}>
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </Button>
            {activeSubTab === 'my-leaves' && (
              <Button onClick={() => setIsLeaveModalOpen(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" /> Apply for Leave
              </Button>
            )}
          </div>
        }
      />

      {/* Tabs */}
      <div className="border-b border-border flex items-center gap-6">
        <button
          onClick={() => setActiveSubTab('classroom')}
          className={`pb-3 text-xs font-bold transition-colors border-b-2 cursor-pointer ${
            activeSubTab === 'classroom' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Student Leave Requests
        </button>
        <button
          onClick={() => setActiveSubTab('my-leaves')}
          className={`pb-3 text-xs font-bold transition-colors border-b-2 cursor-pointer ${
            activeSubTab === 'my-leaves' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          My Attendance & Leaves
        </button>
      </div>

      {/* Tab 1 content: Student Leave approvals */}
      {activeSubTab === 'classroom' && (
        <SimpleCard title="Student Leave Requests list">
          {studentLoading ? (
            <div className="p-6 text-center text-xs text-muted-foreground">Loading request registry...</div>
          ) : (
            <ReusableTable columns={studentColumns} data={studentLeaves} />
          )}
        </SimpleCard>
      )}

      {/* Tab 2 content: Teacher's own attendance & leaves */}
      {activeSubTab === 'my-leaves' && teacher && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-card border border-border p-4 rounded-lg text-center shadow-sm">
              <span className="text-2xl font-bold text-emerald-600 block">{teacher.attendanceSummary?.presentCount || 0}</span>
              <span className="text-xs font-semibold text-muted-foreground uppercase">Days Present</span>
            </div>
            <div className="bg-card border border-border p-4 rounded-lg text-center shadow-sm">
              <span className="text-2xl font-bold text-rose-600 block">{teacher.attendanceSummary?.absentCount || 0}</span>
              <span className="text-xs font-semibold text-muted-foreground uppercase">Days Absent</span>
            </div>
            <div className="bg-card border border-border p-4 rounded-lg text-center shadow-sm">
              <span className="text-2xl font-bold text-amber-600 block">{teacher.attendanceSummary?.leaveCount || 0}</span>
              <span className="text-xs font-semibold text-muted-foreground uppercase">Leaves Taken</span>
            </div>
            <div className="bg-card border border-border p-4 rounded-lg text-center shadow-sm">
              <span className="text-2xl font-bold text-primary block">{teacher.leaveSummary?.totalRequests || 0}</span>
              <span className="text-xs font-semibold text-muted-foreground uppercase">Total Applications</span>
            </div>
          </div>

          <div className="bg-card border border-border p-5 rounded-lg shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider border-b border-border pb-2 flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" /> Leave Application Logs
            </h3>
            <div className="divide-y divide-border border border-border rounded-md overflow-hidden bg-card">
              {teacher.leaveSummary?.recent && teacher.leaveSummary.recent.length > 0 ? (
                teacher.leaveSummary.recent.map((lvl, idx) => (
                  <div key={idx} className="p-3.5 flex items-center justify-between hover:bg-muted/20 text-xs">
                    <div className="space-y-0.5">
                      <span className="font-bold text-foreground capitalize">{lvl.leaveType} Leave</span>
                      <p className="text-[11px] text-muted-foreground">{lvl.startDate} to {lvl.endDate} • {lvl.reason}</p>
                    </div>
                    <StatusChip status={lvl.status} />
                  </div>
                ))
              ) : (
                <p className="p-4 text-xs text-muted-foreground text-center">No leave logs available.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Apply Leave Modal */}
      <FormDialog isOpen={isLeaveModalOpen} onClose={() => setIsLeaveModalOpen(false)} title="Apply for Leave">
        <form onSubmit={handleApplyLeave} className="space-y-4">
          <FormSelect
            label="Leave Type"
            value={leaveForm.leaveType}
            onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
            options={[
              { value: 'casual', label: 'Casual Leave' },
              { value: 'sick', label: 'Sick Leave' },
              { value: 'maternity', label: 'Maternity Leave' },
              { value: 'unpaid', label: 'Unpaid Leave' }
            ]}
          />
          <div className="grid grid-cols-2 gap-3">
            <FormInput label="Start Date" type="date" value={leaveForm.startDate} onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })} required />
            <FormInput label="End Date" type="date" value={leaveForm.endDate} onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })} required />
          </div>
          <FormTextarea label="Reason for Leave" placeholder="Detail reason..." value={leaveForm.reason} onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })} required rows={2} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setIsLeaveModalOpen(false)}>Cancel</Button>
            <Button type="submit">Submit Request</Button>
          </div>
        </form>
      </FormDialog>

      <SuccessDialog isOpen={studentSuccessOpen} onClose={() => setStudentSuccessOpen(false)} message={studentSuccessMsg} />
      <SuccessDialog isOpen={isSuccessOpen} onClose={() => setIsSuccessOpen(false)} message={successMsg} />
    </PageContainer>
  )
}
