import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axiosClient from '@/config/axiosClient'
import { 
  PageHeader, 
  PageContainer, 
  SimpleCard, 
  StatCard, 
  Button, 
  ReusableTable, 
  StatusChip,
  Badge
} from '@/components/shared'
import { 
  DollarSign, Check, X, Calendar, ArrowLeft, Printer, Download, Search, 
  ArrowUpDown, Filter, ChevronLeft, ChevronRight, FileText, Gift, Percent, Eye
} from 'lucide-react'

export default function ChildFees() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  // Tab State
  const [activeTab, setActiveTab] = useState('summary')

  // Data States
  const [childName, setChildName] = useState('Student')
  const [stats, setStats] = useState({
    totalFees: 0,
    paidFees: 0,
    pendingFees: 0,
    transportFees: 0,
    scholarshipAmount: 0,
    discountAmount: 0,
    outstandingBalance: 0
  })
  const [timeline, setTimeline] = useState([])
  const [scholarships, setScholarships] = useState([])
  const [discounts, setDiscounts] = useState([])

  // Payments State
  const [payments, setPayments] = useState([])
  const [paymentTotal, setPaymentTotal] = useState(0)
  const [paymentPage, setPaymentPage] = useState(1)
  const [paymentLimit] = useState(5)
  const [paymentPages, setPaymentPages] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortBy, setSortBy] = useState('paymentDate')
  const [sortOrder, setSortOrder] = useState('desc')

  // Receipts State
  const [receipts, setReceipts] = useState([])
  const [activeReceipt, setActiveReceipt] = useState(null)
  const [receiptModalOpen, setReceiptModalOpen] = useState(false)

  // General Loading & Error States
  const [loading, setLoading] = useState(true)

  // Fetch Child Profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profRes = await axiosClient.get(`/students/${id}/profile`)
        if (profRes.data.success && profRes.data.data) {
          setChildName(profRes.data.data.firstName ? `${profRes.data.data.firstName} ${profRes.data.data.lastName}` : profRes.data.data.name || 'Student')
        }
      } catch (err) {
        console.error('Error fetching child profile:', err)
      }
    }
    fetchProfile()
  }, [id])

  // Fetch Fee Summary, Scholarships, Discounts, and Timeline
  const fetchFeesData = async () => {
    setLoading(true)
    try {
      const res = await axiosClient.get(`/parent/fees?studentId=${id}`)
      if (res.data.success) {
        setStats(res.data.data.stats || {})
        setTimeline(res.data.data.timeline || [])
        setScholarships(res.data.data.scholarships || [])
        setDiscounts(res.data.data.discounts || [])
      }
    } catch (err) {
      console.error('Error fetching fees data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch Payments with search, sorting, filtering, and pagination
  const fetchPayments = async () => {
    try {
      const res = await axiosClient.get(`/parent/payments`, {
        params: {
          studentId: id,
          search: searchQuery,
          status: statusFilter,
          page: paymentPage,
          limit: paymentLimit,
          sortBy,
          sortOrder
        }
      })
      if (res.data.success) {
        setPayments(res.data.data || [])
        setPaymentTotal(res.data.meta?.totalRecords || 0)
        setPaymentPages(res.data.meta?.totalPages || 1)
      }
    } catch (err) {
      console.error('Error fetching payments:', err)
    }
  }

  // Fetch Receipts
  const fetchReceipts = async () => {
    try {
      const res = await axiosClient.get(`/parent/receipts?studentId=${id}`)
      if (res.data.success) {
        setReceipts(res.data.data || [])
      }
    } catch (err) {
      console.error('Error fetching receipts:', err)
    }
  }

  // Initial and trigger-based load
  useEffect(() => {
    fetchFeesData()
    fetchReceipts()
  }, [id])

  useEffect(() => {
    fetchPayments()
  }, [id, searchQuery, statusFilter, paymentPage, sortBy, sortOrder])

  // Toggle sort order
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
    setPaymentPage(1)
  }

  // Download PDF helper
  const handleDownloadPdf = (receiptId) => {
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'
    window.open(`${backendUrl}/parent/receipts/${receiptId}/pdf`, '_blank')
  }

  const tabs = [
    { id: 'summary', label: 'Fee Summary', icon: DollarSign },
    { id: 'payments', label: 'Payment History', icon: Calendar },
    { id: 'receipts', label: 'Receipts', icon: FileText },
    { id: 'scholarships', label: 'Scholarships', icon: Gift },
    { id: 'discounts', label: 'Discounts', icon: Percent }
  ]

  return (
    <PageContainer>
      <PageHeader 
        title={`${childName}'s Financial ledger`}
        subtitle="Review fee structures, track payments, download receipts, and manage discounts."
        actions={
          <Button variant="outline" className="flex items-center gap-1.5" onClick={() => navigate('/parent/dashboard')}>
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Button>
        }
      />

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Billing" value={`$${stats.totalFees}`} icon={DollarSign} />
        <StatCard title="Total Paid" value={`$${stats.paidFees}`} change="Received Amount" icon={Check} />
        <StatCard title="Outstanding Balance" value={`$${stats.outstandingBalance}`} changeType="negative" icon={X} />
        <StatCard title="Transit Fees" value={`$${stats.transportFees}`} change="Annual transit" icon={Check} />
      </div>

      {/* Custom Tabs Navigation */}
      <div className="flex border-b border-border mb-6 overflow-x-auto select-none gap-2">
        {tabs.map(tab => {
          const TabIcon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 transition-colors duration-150 cursor-pointer whitespace-nowrap ${
                isActive 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
              }`}
            >
              <TabIcon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Panels */}
      {loading ? (
        <div className="space-y-4">
          <div className="h-10 bg-muted/50 animate-pulse rounded"></div>
          <div className="h-40 bg-muted/30 animate-pulse rounded"></div>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* TAB 1: FEE SUMMARY */}
          {activeTab === 'summary' && (
            <div className="space-y-6">
              <SimpleCard title="Installments ledger Timeline" subtitle="Chronological breakdown of assigned fees, dues, and payment progress.">
                {timeline.length === 0 ? (
                  <div className="py-12 text-center text-sm text-muted-foreground">No assigned fee structures found for this student.</div>
                ) : (
                  <div className="relative border-l-2 border-primary/20 ml-4 pl-6 space-y-6">
                    {timeline.map((item, idx) => {
                      const isOverdue = new Date(item.dueDate) < new Date() && item.status !== 'paid'
                      return (
                        <div key={item.feeId} className="relative">
                          <span className={`absolute -left-[31px] top-1.5 h-4.5 w-4.5 rounded-full border-2 bg-background flex items-center justify-center ${
                            item.status === 'paid' ? 'border-emerald-600' : isOverdue ? 'border-rose-600' : 'border-primary'
                          }`}>
                            {item.status === 'paid' && <div className="h-2 w-2 rounded-full bg-emerald-600" />}
                            {isOverdue && <div className="h-2 w-2 rounded-full bg-rose-600" />}
                          </span>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-card p-4 rounded border border-border gap-3">
                            <div>
                              <h4 className="font-bold text-sm text-foreground">{item.category}</h4>
                              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                <Calendar className="h-3.5 w-3.5" /> Due Date: {new Date(item.dueDate).toLocaleDateString()}
                                {isOverdue && <span className="text-rose-600 font-bold">(Overdue)</span>}
                              </p>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <div className="text-sm font-bold text-foreground">${item.amount}</div>
                                <div className="text-xs text-muted-foreground">Pending: ${item.pendingAmount}</div>
                              </div>
                              <StatusChip status={item.status} />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </SimpleCard>
            </div>
          )}

          {/* TAB 2: PAYMENT HISTORY */}
          {activeTab === 'payments' && (
            <SimpleCard title="Logs of Transaction ledger payments" subtitle="Search and filter student payments.">
              <div className="flex flex-col sm:flex-row gap-3 mb-4 select-none">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="search"
                    placeholder="Search Transaction ID or Method..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setPaymentPage(1); }}
                    className="h-9 w-full rounded border border-input bg-background pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPaymentPage(1); }}
                    className="h-9 rounded border border-input bg-background px-3 text-sm focus-visible:outline-none"
                  >
                    <option value="">All Statuses</option>
                    <option value="success">Success</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>

              {payments.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">No payment records found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left border border-border rounded">
                    <thead className="bg-muted text-muted-foreground text-xs uppercase font-bold select-none">
                      <tr>
                        <th className="p-3 cursor-pointer" onClick={() => handleSort('paymentDate')}>
                          <div className="flex items-center gap-1">Payment Date <ArrowUpDown className="h-3 w-3" /></div>
                        </th>
                        <th className="p-3">Fee Particulars</th>
                        <th className="p-3 cursor-pointer" onClick={() => handleSort('amount')}>
                          <div className="flex items-center gap-1">Amount <ArrowUpDown className="h-3 w-3" /></div>
                        </th>
                        <th className="p-3">Method</th>
                        <th className="p-3">Transaction ID</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {payments.map(p => (
                        <tr key={p._id} className="hover:bg-muted/40 font-medium">
                          <td className="p-3">{new Date(p.paymentDate).toLocaleDateString()}</td>
                          <td className="p-3">{p.studentFeeId?.feeStructureId?.category?.name || 'School Fee'}</td>
                          <td className="p-3 font-bold">${p.amount}</td>
                          <td className="p-3 uppercase text-xs font-bold text-primary">{p.method}</td>
                          <td className="p-3 font-mono text-xs">{p.transactionId || 'N/A'}</td>
                          <td className="p-3">
                            <Badge className={p.status === 'success' ? 'bg-emerald-600' : 'bg-rose-600'}>
                              {p.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {/* Pagination Footer */}
                  {paymentPages > 1 && (
                    <div className="flex items-center justify-between border-t border-border pt-4 mt-4 select-none">
                      <span className="text-xs text-muted-foreground">
                        Showing page {paymentPage} of {paymentPages} ({paymentTotal} total)
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          disabled={paymentPage === 1}
                          onClick={() => setPaymentPage(p => Math.max(p - 1, 1))}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          disabled={paymentPage === paymentPages}
                          onClick={() => setPaymentPage(p => Math.min(p + 1, paymentPages))}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </SimpleCard>
          )}

          {/* TAB 3: RECEIPTS */}
          {activeTab === 'receipts' && (
            <SimpleCard title="Official Receipt Registers" subtitle="View details and print or download official receipts.">
              {receipts.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">No issued receipts found.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {receipts.map(r => (
                    <div key={r._id} className="flex items-center justify-between p-4 bg-card rounded border border-border">
                      <div>
                        <div className="font-bold text-sm text-foreground">{r.receiptNumber}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          Amount: <span className="font-bold text-foreground">${r.paymentId?.amount || 0}</span> | Issued: {new Date(r.issueDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 select-none">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex items-center gap-1"
                          onClick={() => { setActiveReceipt(r); setReceiptModalOpen(true); }}
                        >
                          <Eye className="h-3.5 w-3.5" /> View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex items-center gap-1 text-primary hover:text-primary"
                          onClick={() => handleDownloadPdf(r._id)}
                        >
                          <Download className="h-3.5 w-3.5" /> PDF
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SimpleCard>
          )}

          {/* TAB 4: SCHOLARSHIPS */}
          {activeTab === 'scholarships' && (
            <SimpleCard title="Applied Scholarship Benefits" subtitle="Academic grants and tuition assistance mapped to this child.">
              {scholarships.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">No active scholarship programs found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left border border-border rounded">
                    <thead className="bg-muted text-muted-foreground text-xs uppercase font-bold select-none">
                      <tr>
                        <th className="p-3">Scholarship Name</th>
                        <th className="p-3">Percentage</th>
                        <th className="p-3">Discount Amount</th>
                        <th className="p-3">Applied Date</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {scholarships.map((s, idx) => (
                        <tr key={idx} className="hover:bg-muted/40 font-medium">
                          <td className="p-3 text-foreground">{s.name}</td>
                          <td className="p-3 text-primary">{s.percentage}%</td>
                          <td className="p-3 font-bold text-emerald-600">${s.amount}</td>
                          <td className="p-3">{new Date(s.appliedDate).toLocaleDateString()}</td>
                          <td className="p-3">
                            <Badge className="bg-emerald-600 uppercase text-[10px]">
                              {s.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </SimpleCard>
          )}

          {/* TAB 5: DISCOUNTS */}
          {activeTab === 'discounts' && (
            <SimpleCard title="Fee Deductions & Discounts" subtitle="Assigned structural fee reductions.">
              {discounts.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">No active fee discounts found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left border border-border rounded">
                    <thead className="bg-muted text-muted-foreground text-xs uppercase font-bold select-none">
                      <tr>
                        <th className="p-3">Discount Program</th>
                        <th className="p-3">Description / Reason</th>
                        <th className="p-3">Saved Amount</th>
                        <th className="p-3">Validity</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {discounts.map((d, idx) => (
                        <tr key={idx} className="hover:bg-muted/40 font-medium">
                          <td className="p-3 text-foreground">{d.name}</td>
                          <td className="p-3 text-xs text-muted-foreground">{d.reason}</td>
                          <td className="p-3 font-bold text-emerald-600">${d.amount}</td>
                          <td className="p-3 capitalize">{d.validity}</td>
                          <td className="p-3">
                            <Badge className="bg-emerald-600 uppercase text-[10px]">
                              {d.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </SimpleCard>
          )}

        </div>
      )}

      {/* RECEIPT PREVIEW DIALOG MODAL */}
      {receiptModalOpen && activeReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-lg rounded-lg border border-border shadow-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-border flex justify-between items-center bg-primary/5">
              <h3 className="font-bold text-base text-foreground">Receipt Detail - {activeReceipt.receiptNumber}</h3>
              <button 
                onClick={() => setReceiptModalOpen(false)}
                className="text-muted-foreground hover:text-foreground font-bold cursor-pointer text-sm p-1.5"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-sm font-medium text-muted-foreground leading-relaxed">
              <div className="grid grid-cols-2 gap-4 border-b border-border pb-4">
                <div>
                  <span className="text-xs font-semibold text-muted-foreground block uppercase">Date Issued</span>
                  <span className="text-foreground font-bold">{new Date(activeReceipt.issueDate).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-muted-foreground block uppercase">Transaction ID</span>
                  <span className="text-foreground font-bold font-mono">{activeReceipt.paymentId?.transactionId || 'N/A'}</span>
                </div>
                <div className="mt-2">
                  <span className="text-xs font-semibold text-muted-foreground block uppercase">Student Name</span>
                  <span className="text-foreground font-bold">{activeReceipt.studentId?.firstName} {activeReceipt.studentId?.lastName}</span>
                </div>
                <div className="mt-2">
                  <span className="text-xs font-semibold text-muted-foreground block uppercase">Admission Number</span>
                  <span className="text-foreground font-bold">{activeReceipt.studentId?.admissionNo}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-foreground">Particulars</h4>
                <div className="flex justify-between border-b border-border/50 py-1.5">
                  <span className="text-foreground">{activeReceipt.paymentId?.studentFeeId?.feeStructureId?.category?.name || 'Term Fees'}</span>
                  <span className="font-bold text-foreground">${activeReceipt.paymentId?.amount || 0}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-border mt-6">
                <div>
                  <span className="text-xs font-semibold block uppercase">Payment Method</span>
                  <span className="text-foreground font-bold uppercase text-xs">{activeReceipt.paymentId?.method || 'Cash'}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold block uppercase">Total Amount Paid</span>
                  <span className="text-lg font-bold text-primary">${activeReceipt.paymentId?.amount || 0}</span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-border flex justify-end gap-2 bg-muted/40 select-none">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={() => {
                  setReceiptModalOpen(false);
                  handleDownloadPdf(activeReceipt._id);
                }}
              >
                <Printer className="h-4 w-4" /> Print / PDF
              </Button>
              <Button 
                variant="default" 
                size="sm"
                onClick={() => setReceiptModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

    </PageContainer>
  )
}
