import React, { useState, useEffect } from 'react'
import axiosClient from '@/config/axiosClient'
import { 
  PageHeader, 
  PageContainer, 
  SimpleCard, 
  StatCard, 
  Button, 
  ReusableTable, 
  FormSelect, 
  SuccessDialog,
  StatusChip,
  Badge
} from '@/components/shared'
import { Check, X, Calendar, Users, Clock } from 'lucide-react'

export default function Leaves() {
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('pending')
  const [typeFilter, setTypeFilter] = useState('')
  const [stats, setStats] = useState({
    pendingLeaves: 0,
    approvedLeaves: 0,
    activeLeavesToday: 0
  })
  
  // Feedback Dialog
  const [successOpen, setSuccessOpen] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const fetchStats = async () => {
    try {
      const res = await axiosClient.get('/attendance/stats')
      if (res.data.success) {
        setStats({
          pendingLeaves: res.data.data.pendingLeaves || 0,
          approvedLeaves: res.data.data.approvedLeaves || 0,
          activeLeavesToday: res.data.data.activeLeavesToday || 0
        })
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Fetch leave requests
  const fetchLeaves = async () => {
    setLoading(true)
    try {
      const res = await axiosClient.get(`/attendance/leaves?status=${statusFilter}${typeFilter ? `&type=${typeFilter}` : ''}`)
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
    fetchStats()
    fetchLeaves()
  }, [statusFilter, typeFilter])

  // Handle Approve/Reject status updates
  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await axiosClient.patch(`/attendance/leaves/${id}/status`, {
        status,
        actionRemarks: 'Processed via admin leave approvals panel.',
        actionBy: 'Principal / Admin'
      })
      if (res.data.success) {
        setSuccessMsg(`Leave request successfully ${status}.`)
        setSuccessOpen(true)
        fetchLeaves()
      }
    } catch (err) {
      console.error(err)
    }
  }
  const columns = [
    { header: 'Applicant', accessor: 'applicantName' },
    { 
      header: 'Role', 
      accessor: (row) => <Badge className="capitalize bg-primary/10 text-primary border-primary/20">{row.type}</Badge> 
    },
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
        <span className="text-xs text-muted-foreground">Processed by {row.actionBy || 'Admin'}</span>
      )
    }
  ]

  return (
    <PageContainer>
      <PageHeader 
        title="Leave Approvals"
        subtitle="Manage, approve, and audit student & staff leave requests."
      />

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard title="Pending Approvals" value={stats.pendingLeaves} icon={Clock} />
        <StatCard title="Approved Leaves" value={stats.approvedLeaves} icon={Check} />
        <StatCard title="Active Today" value={`${stats.activeLeavesToday} Active`} icon={Calendar} />
      </div>

      {/* Roster Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-card p-4 rounded-lg border border-border shadow-sm mb-6">
        <FormSelect 
          label="Filter by Status" 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: 'pending', label: 'Pending Approvals' },
            { value: 'approved', label: 'Approved Leaves' },
            { value: 'rejected', label: 'Rejected Leaves' }
          ]}
          className="space-y-0"
        />
        <FormSelect 
          label="Applicant Type" 
          value={typeFilter} 
          onChange={(e) => setTypeFilter(e.target.value)}
          options={[
            { value: '', label: 'All Applicants' },
            { value: 'student', label: 'Students' },
            { value: 'teacher', label: 'Teachers / Staff' }
          ]}
          className="space-y-0"
        />
        <div className="flex items-end justify-end">
          <Button className="w-full flex items-center justify-center gap-1.5" onClick={fetchLeaves}>
            Refresh Requests
          </Button>
        </div>
      </div>

      <SimpleCard title="Leave Requests register">
        <ReusableTable columns={columns} data={leaves} />
      </SimpleCard>

      <SuccessDialog open={successOpen} onClose={() => setSuccessOpen(false)} message={successMsg} />
    </PageContainer>
  )
}
