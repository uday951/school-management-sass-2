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
import { Calendar, AlertCircle, Plus, XCircle, Clock, CheckCircle } from 'lucide-react'

export default function LeaveManagement() {
  const [leaves, setLeaves] = useState([])
  const [balances, setBalances] = useState({ total: 15, used: 0, available: 15 })
  const [loading, setLoading] = useState(true)
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [applying, setApplying] = useState(false)
  const [form, setForm] = useState({
    leaveType: 'casual',
    startDate: '',
    endDate: '',
    reason: ''
  })
  const [message, setMessage] = useState(null)

  const fetchLeaveHistory = async () => {
    setLoading(true)
    try {
      const res = await axiosClient.get('/teacher/leave-history')
      if (res.data.success) {
        setLeaves(res.data.data.leaves || [])
        setBalances(res.data.data.balances || { total: 15, used: 0, available: 15 })
      }
    } catch (err) {
      console.error('Error fetching teacher leave history:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaveHistory()
  }, [])

  const handleApplyLeave = async (e) => {
    e.preventDefault()
    setApplying(true)
    setMessage(null)
    try {
      const res = await axiosClient.post('/teacher/leave', form)
      if (res.data.success) {
        setForm({ leaveType: 'casual', startDate: '', endDate: '', reason: '' })
        setShowApplyModal(false)
        fetchLeaveHistory()
      }
    } catch (err) {
      console.error(err)
      setMessage('Failed to submit leave request. Verify dates and balances.')
    } finally {
      setApplying(false)
    }
  }

  const handleCancelLeave = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this leave application?')) return
    try {
      const res = await axiosClient.delete(`/teacher/leave/${id}`)
      if (res.data.success) {
        fetchLeaveHistory()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const columns = [
    {
      header: 'Type',
      accessor: (row) => (
        <Badge className="bg-primary/5 text-primary border border-primary/10 capitalize text-xs">
          {row.leaveType}
        </Badge>
      )
    },
    {
      header: 'Dates',
      accessor: (row) => (
        <span className="flex items-center gap-1.5 font-semibold text-foreground text-xs">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
          {new Date(row.startDate).toLocaleDateString()} - {new Date(row.endDate).toLocaleDateString()}
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
      header: 'Action',
      accessor: (row) => row.status === 'pending' ? (
        <button
          onClick={() => handleCancelLeave(row._id)}
          className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 hover:underline cursor-pointer"
        >
          <XCircle className="h-3.5 w-3.5" /> Cancel
        </button>
      ) : '-'
    }
  ]

  return (
    <PageContainer>
      <PageHeader
        title="Leave Management Center"
        subtitle="Manage sick leaves, maternity absences, casual leaves, and track real-time approvals."
        actions={
          <button
            onClick={() => setShowApplyModal(true)}
            className="inline-flex items-center justify-center rounded-xl text-xs font-bold transition h-9 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/95 cursor-pointer gap-1.5"
          >
            <Plus className="h-4 w-4" /> Apply for Leave
          </button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Leave Balance</p>
          <h3 className="text-3xl font-black text-primary mt-1">{balances.total} Days</h3>
          <p className="text-[10px] text-muted-foreground mt-1.5">Annual allotted quota</p>
        </div>
        <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Approved Absences</p>
          <h3 className="text-3xl font-black text-emerald-600 mt-1">{balances.used} Days</h3>
          <p className="text-[10px] text-muted-foreground mt-1.5">Leaves taken this year</p>
        </div>
        <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Available Quota</p>
          <h3 className="text-3xl font-black text-amber-600 mt-1">{balances.available} Days</h3>
          <p className="text-[10px] text-muted-foreground mt-1.5">Remaining unallocated days</p>
        </div>
      </div>

      {loading ? (
        <SkeletonLoader count={3} className="h-14 mb-4" />
      ) : (
        <SimpleCard title="Leave requests history">
          <ReusableTable columns={columns} data={leaves} />
        </SimpleCard>
      )}

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border shadow-lg rounded-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-sm font-bold text-foreground">Apply for Leave Absence</h3>
              <button
                onClick={() => setShowApplyModal(false)}
                className="text-muted-foreground hover:text-foreground text-sm cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            {message && (
              <div className="p-3 mb-4 rounded-xl bg-rose-500/5 border border-rose-200 text-xs font-semibold text-rose-800 flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{message}</span>
              </div>
            )}

            <form onSubmit={handleApplyLeave} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-muted-foreground mb-1">Leave Type</label>
                <select
                  value={form.leaveType}
                  onChange={(e) => setForm(prev => ({ ...prev, leaveType: e.target.value }))}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="casual">Casual Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="maternity">Maternity Leave</option>
                  <option value="unpaid">Unpaid Leave</option>
                  <option value="other">Other Absence</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-muted-foreground mb-1">Start Date</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm(prev => ({ ...prev, startDate: e.target.value }))}
                    required
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground mb-1">End Date</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm(prev => ({ ...prev, endDate: e.target.value }))}
                    required
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground mb-1">Reason for Absence</label>
                <textarea
                  rows="3"
                  value={form.reason}
                  onChange={(e) => setForm(prev => ({ ...prev, reason: e.target.value }))}
                  required
                  placeholder="Explain why you are applying..."
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 border border-input rounded-xl bg-background hover:bg-accent text-foreground cursor-pointer font-bold"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={applying}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/95 cursor-pointer font-bold disabled:opacity-50"
                >
                  {applying ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  )
}
