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
import { DollarSign, Check, X, Calendar, ArrowLeft, Printer, Download } from 'lucide-react'

export default function ChildFees() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  // Data States
  const [childName, setChildName] = useState('Student')
  const [fees, setFees] = useState([])
  const [receipts, setReceipts] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch child profile, fees, and receipts
  const fetchChildFeeData = async () => {
    setLoading(true)
    try {
      // 1. Fetch child profile
      const profRes = await axiosClient.get(`/students/${id}/profile`)
      if (profRes.data.success && profRes.data.data) {
        setChildName(profRes.data.data.name || 'Student')
      }

      // 2. Fetch assigned fees for this student
      const feesRes = await axiosClient.get(`/fees/student-fees?studentId=${id}`)
      if (feesRes.data.success) {
        setFees(feesRes.data.data)
      }

      // 3. Fetch receipts for this student
      const recRes = await axiosClient.get(`/fees/receipts?studentId=${id}`)
      if (recRes.data.success) {
        setReceipts(recRes.data.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchChildFeeData()
  }, [id])

  // Summarize stats
  const totalBilling = fees.reduce((acc, f) => acc + f.totalAmount, 0)
  const totalPaid = fees.reduce((acc, f) => acc + f.paidAmount, 0)
  const outstandingBal = fees.reduce((acc, f) => acc + f.pendingAmount, 0)

  const feeColumns = [
    { header: 'Fee Category', accessor: (row) => row.feeStructureId?.category?.name || 'N/A' },
    { header: 'Total Billing', accessor: (row) => `$${row.totalAmount}` },
    { header: 'Amount Paid', accessor: (row) => `$${row.paidAmount}` },
    { header: 'Outstanding', accessor: (row) => `$${row.pendingAmount}` },
    { header: 'Due Date', accessor: (row) => new Date(row.feeStructureId?.dueDate || Date.now()).toLocaleDateString() },
    {
      header: 'Status',
      accessor: (row) => <StatusChip status={row.status} />
    }
  ]

  const receiptColumns = [
    { header: 'Receipt No', accessor: 'receiptNumber' },
    { header: 'Amount Paid', accessor: (row) => `$${row.paymentId?.amount || 0}` },
    { header: 'Method', accessor: (row) => <Badge className="uppercase">{row.paymentId?.method || 'Cash'}</Badge> },
    { header: 'Transaction ID', accessor: (row) => row.paymentId?.transactionId || 'N/A' },
    { header: 'Payment Date', accessor: (row) => new Date(row.issueDate).toLocaleDateString() },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex gap-1.5 select-none">
          <Button variant="outline" size="sm" className="flex items-center gap-1"><Printer className="h-3 w-3" /> Print</Button>
          <Button variant="outline" size="sm" className="flex items-center gap-1"><Download className="h-3 w-3" /> PDF</Button>
        </div>
      )
    }
  ]

  return (
    <PageContainer>
      <PageHeader 
        title={`${childName}'s Billing ledger`}
        subtitle="Track child term fees structures, payments, and outstanding balances."
        actions={
          <Button variant="outline" className="flex items-center gap-1.5" onClick={() => navigate('/parent/dashboard')}>
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Button>
        }
      />

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard title="Total Billing" value={`$${totalBilling}`} icon={DollarSign} />
        <StatCard title="Paid Amount" value={`$${totalPaid}`} change="Total Received" icon={Check} />
        <StatCard title="Outstanding Balance" value={`$${outstandingBal}`} changeType="negative" icon={X} />
      </div>

      <div className="space-y-6">
        {/* Fee Structures List */}
        <SimpleCard title="Term Fees ledger invoices">
          <ReusableTable columns={feeColumns} data={fees} />
        </SimpleCard>

        {/* Transactions/Receipts Logs */}
        <SimpleCard title="Payment transactions history">
          <ReusableTable columns={receiptColumns} data={receipts} />
        </SimpleCard>
      </div>
    </PageContainer>
  )
}
