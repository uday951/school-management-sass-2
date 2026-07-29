import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useChildStore } from '@/store'
import axiosClient from '@/config/axiosClient'
import { 
  PageHeader, 
  PageContainer, 
  SimpleCard, 
  Button, 
  FormInput, 
  FormSelect, 
  FormTextarea,
  SuccessDialog
} from '@/components/shared'
import { ArrowLeft, Save } from 'lucide-react'

export default function ChildLeavesApply() {
  const { activeChild } = useChildStore()
  const params = useParams()
  const id = params.id || activeChild?._id || activeChild?.id
  const navigate = useNavigate()
  
  // Child Name State
  const [childName, setChildName] = useState('Student')
  const [successOpen, setSuccessOpen] = useState(false)
  
  const [form, setForm] = useState({
    leaveType: 'sick',
    startDate: '',
    endDate: '',
    reason: ''
  })

  // Fetch child name on mount
  useEffect(() => {
    if (!id) return;
    axiosClient.get(`/students/${id}/profile`)
      .then(res => {
        if (res.data.success && res.data.data) {
          setChildName(res.data.data.name || 'Student')
        }
      })
      .catch(() => {})
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!id) return;
    try {
      const res = await axiosClient.post('/attendance/leaves', {
        applicantId: id,
        applicantName: childName,
        type: 'student',
        leaveType: form.leaveType,
        startDate: form.startDate,
        endDate: form.endDate,
        reason: form.reason
      })
      if (res.data.success) {
        setSuccessOpen(true)
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <PageContainer>
      <PageHeader 
        title="Apply for Leave"
        subtitle={`Submit a new leave application request for ${childName}.`}
        actions={
          <Button variant="outline" className="flex items-center gap-1.5" onClick={() => navigate(`/parent/child/${id}/leaves`)}>
            <ArrowLeft className="h-4 w-4" /> Back to History
          </Button>
        }
      />

      <SimpleCard title="Leave Application details">
        <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
          <FormSelect 
            label="Leave Type" 
            value={form.leaveType}
            onChange={(e) => setForm(prev => ({ ...prev, leaveType: e.target.value }))}
            options={[
              { value: 'sick', label: 'Sick Leave' },
              { value: 'casual', label: 'Casual Leave' },
              { value: 'other', label: 'Other Leave' }
            ]}
            required
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput 
              label="Start Date" 
              type="date"
              value={form.startDate}
              onChange={(e) => setForm(prev => ({ ...prev, startDate: e.target.value }))}
              required
            />
            <FormInput 
              label="End Date" 
              type="date"
              value={form.endDate}
              onChange={(e) => setForm(prev => ({ ...prev, endDate: e.target.value }))}
              required
            />
          </div>
          <FormTextarea 
            label="Reason / Explanation" 
            placeholder="Please detail the reason for leave request"
            value={form.reason}
            onChange={(e) => setForm(prev => ({ ...prev, reason: e.target.value }))}
            required
          />
          <div className="flex justify-end gap-2 pt-2 select-none">
            <Button type="button" variant="outline" onClick={() => navigate(`/parent/child/${id}/leaves`)}>
              Cancel
            </Button>
            <Button type="submit" className="flex items-center gap-1.5">
              <Save className="h-4 w-4" /> Submit Application
            </Button>
          </div>
        </form>
      </SimpleCard>

      <SuccessDialog 
        isOpen={successOpen} 
        onClose={() => {
          setSuccessOpen(false)
          navigate(`/parent/child/${id}/leaves`)
        }} 
        message="Leave application submitted successfully for coordinator review." 
      />
    </PageContainer>
  )
}
