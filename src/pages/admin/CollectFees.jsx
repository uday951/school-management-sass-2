import React, { useState, useEffect } from 'react'
import axiosClient from '@/config/axiosClient'
import { 
  PageHeader, 
  PageContainer, 
  SimpleCard, 
  Button, 
  ReusableTable, 
  FormInput, 
  FormSelect, 
  SuccessDialog,
  StatusChip
} from '@/components/shared'
import { DollarSign, Check, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function CollectFees() {
  const navigate = useNavigate()
  
  // Roster lists
  const [unpaidFees, setUnpaidFees] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedFee, setSelectedFee] = useState(null)
  
  // Payment Form
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    method: 'cash',
    transactionId: ''
  })

  // Feedback Dialog
  const [successOpen, setSuccessOpen] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  // Fetch unpaid student fees
  const fetchUnpaidFees = async () => {
    setLoading(true)
    try {
      const res = await axiosClient.get('/fees/student-fees')
      if (res.data.success) {
        // filter unpaid or partial
        setUnpaidFees(res.data.data.filter(f => f.status !== 'paid'))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUnpaidFees()
  }, [])

  // Handle select fee record
  const handleSelectFee = (fee) => {
    setSelectedFee(fee)
    setPaymentForm(prev => ({
      ...prev,
      amount: fee.pendingAmount.toString()
    }))
  }

  // Submit payment
  const handleCollect = async (e) => {
    e.preventDefault()
    if (!selectedFee) return
    try {
      const res = await axiosClient.post('/fees/payments', {
        studentFeeId: selectedFee._id,
        amount: Number(paymentForm.amount),
        method: paymentForm.method,
        transactionId: paymentForm.transactionId
      })
      if (res.data.success) {
        setSuccessMsg(`Successfully collected $${paymentForm.amount}. Receipt reference generated: ${res.data.data.receipt?.receiptNumber}`)
        setSuccessOpen(true)
        setSelectedFee(null)
        setPaymentForm({ amount: '', method: 'cash', transactionId: '' })
        fetchUnpaidFees()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const columns = [
    {
      header: 'Student Name',
      accessor: (row) => row.studentId ? `${row.studentId.firstName} ${row.studentId.lastName}`.trim() : 'Unknown'
    },
    { header: 'Class', accessor: (row) => row.studentId?.class || 'N/A' },
    { header: 'Fee Category', accessor: (row) => row.feeStructureId?.category?.name || 'N/A' },
    { header: 'Outstanding Amount', accessor: (row) => `$${row.pendingAmount}` },
    {
      header: 'Status',
      accessor: (row) => <StatusChip status={row.status} />
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <Button variant="default" size="sm" onClick={() => handleSelectFee(row)}>Collect payment</Button>
      )
    }
  ]

  return (
    <PageContainer>
      <PageHeader 
        title="Collect Fee Payments"
        subtitle="Process cash, UPI, and cards payment transactions for students outstanding bills."
        actions={
          <Button variant="outline" className="flex items-center gap-1.5" onClick={() => navigate('/admin/fees/invoices')}>
            <ArrowLeft className="h-4 w-4" /> Invoices Ledger
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Unpaid Roster */}
        <div className="md:col-span-2">
          <SimpleCard title="Outstanding balances roster">
            <ReusableTable columns={columns} data={unpaidFees} />
          </SimpleCard>
        </div>

        {/* Collection Wizard Panel */}
        <div className="md:col-span-1">
          <SimpleCard title={selectedFee ? `Collect: ${selectedFee.studentId?.firstName || 'Student'}` : 'Select student'}>
            {selectedFee ? (
              <form onSubmit={handleCollect} className="space-y-4">
                <div className="bg-card p-3 rounded-lg border border-border select-none leading-relaxed text-sm font-semibold">
                  <div className="flex justify-between border-b border-border pb-1.5 mb-1.5">
                    <span className="text-muted-foreground">Category</span>
                    <span>{selectedFee.feeStructureId?.category?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pending Balance</span>
                    <span className="text-primary font-bold">${selectedFee.pendingAmount}</span>
                  </div>
                </div>

                <FormInput 
                  label="Collect Amount ($)" 
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                  required
                />
                
                <FormSelect 
                  label="Payment Method" 
                  value={paymentForm.method}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, method: e.target.value }))}
                  options={[
                    { value: 'cash', label: 'Cash Payment' },
                    { value: 'upi', label: 'UPI / Scan Payment' },
                    { value: 'card', label: 'Debit/Credit Card' },
                    { value: 'bank_transfer', label: 'Bank Transfer' }
                  ]}
                  required
                />

                <FormInput 
                  label="Transaction Reference / Note" 
                  placeholder="e.g. Transaction ID, Check No"
                  value={paymentForm.transactionId}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, transactionId: e.target.value }))}
                />

                <div className="flex gap-2 pt-2 select-none">
                  <Button type="button" variant="outline" className="w-full" onClick={() => setSelectedFee(null)}>Cancel</Button>
                  <Button type="submit" className="w-full flex items-center justify-center gap-1"><DollarSign className="h-4 w-4" /> Collect</Button>
                </div>
              </form>
            ) : (
              <div className="text-center py-10 text-muted-foreground select-none leading-relaxed">
                <DollarSign className="h-10 w-10 mx-auto opacity-30 mb-2" />
                <p className="text-xs font-semibold">Select a student from the ledger roster list to start processing checkout payments.</p>
              </div>
            )}
          </SimpleCard>
        </div>
      </div>

      <SuccessDialog open={successOpen} onClose={() => setSuccessOpen(false)} message={successMsg} />
    </PageContainer>
  )
}
