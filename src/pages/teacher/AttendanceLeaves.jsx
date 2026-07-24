import React, { useState, useEffect } from 'react'
import axiosClient from '@/config/axiosClient'
import { 
  PageHeader, 
  PageContainer, 
  SimpleCard, 
  Button, 
  ReusableTable, 
  SuccessDialog,
  StatusChip,
  Badge
} from '@/components/shared'
import { Check, X, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function AttendanceLeaves() {
  const navigate = useNavigate()
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Feedback
  const [successOpen, setSuccessOpen] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  // Fetch classroom student leaves
  const fetchClassroomLeaves = async () => {
    setLoading(true)
    try {
      const res = await axiosClient.get('/attendance/leaves?type=student')
      if (res.data.success) {
        setLeaves(res.data.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClassroomLeaves()
  }, [])

  // Handle Approve/Reject status updates
  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await axiosClient.patch(`/attendance/leaves/${id}/status`, {
        status,
        actionRemarks: 'Processed by classroom coordinator.',
        actionBy: 'Class Coordinator'
      })
      if (res.data.success) {
        setSuccessMsg(`Student leave request successfully ${status}.`)
        setSuccessOpen(true)
        fetchClassroomLeaves()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const columns = [
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
    <PageContainer>
      <PageHeader 
        title="Classroom Leave Approvals"
        subtitle="Manage and approve student leave requests for your classroom sections."
        actions={
          <Button variant="outline" className="flex items-center gap-1.5" onClick={() => navigate('/teacher/dashboard')}>
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Button>
        }
      />

      <SimpleCard title="Student Leave Requests list">
        <ReusableTable columns={columns} data={leaves} />
      </SimpleCard>

      <SuccessDialog open={successOpen} onClose={() => setSuccessOpen(false)} message={successMsg} />
    </PageContainer>
  )
}
