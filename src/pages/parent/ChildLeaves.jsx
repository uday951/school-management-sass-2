import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useChildStore } from '@/store'
import axiosClient from '@/config/axiosClient'
import { 
  PageHeader, 
  PageContainer, 
  SimpleCard, 
  Button, 
  ReusableTable, 
  StatusChip,
  Badge
} from '@/components/shared'
import { Plus, ArrowLeft } from 'lucide-react'

export default function ChildLeaves() {
  const { activeChild } = useChildStore()
  const params = useParams()
  const id = params.id || activeChild?._id || activeChild?.id
  const navigate = useNavigate()
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch leave history for this child/student
  const fetchLeaveHistory = async () => {
    setLoading(true)
    if (!id) { setLoading(false); return; }
    try {
      const res = await axiosClient.get(`/attendance/leaves?applicantId=${id}`)
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
    fetchLeaveHistory()
  }, [id])

  const columns = [
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
    { header: 'Remarks', accessor: (row) => row.actionRemarks || 'N/A' }
  ]

  return (
    <PageContainer>
      <PageHeader 
        title="Leave History"
        subtitle="Track status and logs of applied student leaves."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-1.5" onClick={() => navigate('/parent/dashboard')}>
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </Button>
            <Button className="flex items-center gap-1.5" onClick={() => navigate(`/parent/child/${id}/leaves/apply`)}>
              <Plus className="h-4 w-4" /> Apply Leave
            </Button>
          </div>
        }
      />

      <SimpleCard title="Applied Leaves history list">
        <ReusableTable columns={columns} data={leaves} />
      </SimpleCard>
    </PageContainer>
  )
}
