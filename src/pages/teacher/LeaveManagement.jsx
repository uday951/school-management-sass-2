import React, { useState, useEffect } from 'react'
import axiosClient from '@/config/axiosClient'
import {
  PageContainer,
  PageHeader,
  SimpleCard,
  Badge,
  ReusableTable,
  SkeletonLoader
} from '@/components/shared'
import { Calendar, FileText, CheckCircle, Clock, Plus, Trash } from 'lucide-react'

export default function LeaveManagement() {
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    leaveType: 'casual',
    startDate: '',
    endDate: '',
    reason: ''
  })

  const fetchLeaveHistory = async () => {
    setLoading(true)
    try {
      const res = await axiosClient.get('/teacher/leave-history')
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
  }, [])

  const handleApplyLeave = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await axiosClient.post('/teacher/leave', form)
      if (res.data.success) {
        setLeaves(prev => [res.data.data, ...prev])
        setShowApplyModal(false)
        setForm({ leaveType: 'casual', startDate: '', endDate: '', reason: '' })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancelLeave = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this leave application?')) return
    try {
      const res = await axiosClient.delete(`/teacher/leave/${id}`)
      if (res.data.success) {
        setLeaves(prev => prev.filter(l => l._id !== id))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const columns = [
    {
      header: 'Leave Type',
      accessor: (row) => <span className="capitalize font-bold text-foreground">{row.leaveType} Leave</span>
    },
    {
      header: 'Dates Duration',
      accessor: (row) => (
        <span className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
          {new Date(row.startDate).toLocaleDateString()} — {new Date(row.endDate).toLocaleDateString()}
        </span>
      )
    },
    { header: 'Reason', accessor: 'reason' },
    {
      header: 'Status',
      accessor: (row) => {
        let style = 'bg-amber-50 text-amber-600 border border-amber-100'
        if (row.status === 'approved') style = 'bg-emerald-50 text-emerald-600 border border-emerald-100'
        if (row.status === 'rejected') style = 'bg-rose-50 text-rose-600 border border-rose-100'
        return (
          <Badge className={`capitalize font-bold text-[10px] ${style}`}>
            {row.status}
          </Badge>
        )
      }
    },
    {
      header: 'Actions',
      accessor: (row) => row.status === 'pending' ? (
        <button
          onClick={() => handleCancelLeave(row._id)}
          className="text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer font-bold text-xs p-1 rounded hover:bg-muted"
        >
          <Trash className="h-4 w-4" /> Cancel
        </button>
      ) : 'N/A'
    }
  ]

  // Calculate leave summary balances
  const approvedCount = leaves.filter(l => l.status === 'approved').length
  const pendingCount = leaves.filter(l => l.status === 'pending').length

  return (
    <PageContainer>
      <PageHeader
        title="Leave & Time-Off Management"
        subtitle="Submit leave applications, view remaining balances, and track approvals history."
        actions={
          <button
            onClick={() => setShowApplyModal(true)}
            className="px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1.5 transition"
          >
            <Plus className="h-4 w-4" /> Request Leave
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm text-center">
          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Leave Balance</p>
          <h3 className="text-3xl font-extrabold text-primary mt-1">12 Days</h3>
          <p className="text-[10px] text-muted-foreground mt-2">Available for session 2026-2027</p>
        </div>
        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm text-center">
          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Approved Leaves</p>
          <h3 className="text-3xl font-extrabold text-emerald-600 mt-1">{approvedCount} Leaves</h3>
          <p className="text-[10px] text-muted-foreground mt-2">Days taken off so far</p>
        </div>
        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm text-center">
          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Pending Requests</p>
          <h3 className="text-3xl font-extrabold text-amber-500 mt-1">{pendingCount} Requests</h3>
          <p className="text-[10px] text-muted-foreground mt-2">Awaiting administrator approval</p>
        </div>
      </div>

      {loading ? (
        <SkeletonLoader count={3} className="h-14" />
      ) : (
        <SimpleCard title="Leave requests history list">
          <ReusableTable columns={columns} data={leaves} />
        </SimpleCard>
      )}

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleApplyLeave} className="bg-card border border-border shadow-lg rounded-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in-95 duration-150 text-xs font-semibold leading-relaxed">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-foreground">Apply for Leave Request</h3>
              <button
                type="button"
                onClick={() => setShowApplyModal(false)}
                className="text-muted-foreground hover:text-foreground text-sm cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-muted-foreground mb-1 font-bold">Leave Type</label>
                <select
                  value={form.leaveType}
                  onChange={(e) => setForm(prev => ({ ...prev, leaveType: e.target.value }))}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="casual">Casual Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="maternity">Maternity Leave</option>
                  <option value="unpaid">Unpaid Leave</option>
                  <option value="other">Other / Special</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-muted-foreground mb-1 font-bold">Start Date</label>
                  <input
                    type="date"
                    required
                    value={form.startDate}
                    onChange={(e) => setForm(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground mb-1 font-bold">End Date</label>
                  <input
                    type="date"
                    required
                    value={form.endDate}
                    onChange={(e) => setForm(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground mb-1 font-bold">Reason for request</label>
                <textarea
                  required
                  rows="3"
                  value={form.reason}
                  onChange={(e) => setForm(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Explain briefly the reason for time-off..."
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowApplyModal(false)}
                className="px-4 py-2 border border-input rounded-xl hover:bg-muted text-foreground cursor-pointer font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground rounded-xl cursor-pointer font-bold disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Apply Request'}
              </button>
            </div>
          </form>
        </div>
      )}
    </PageContainer>
  )
}
