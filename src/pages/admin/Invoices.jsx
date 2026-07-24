import React, { useState, useEffect } from 'react'
import axiosClient from '@/config/axiosClient'
import { 
  PageHeader, 
  PageContainer, 
  SimpleCard, 
  StatCard, 
  Button, 
  ReusableTable, 
  FormInput, 
  FormSelect, 
  FormTextarea,
  SuccessDialog,
  StatusChip,
  Badge
} from '@/components/shared'
import { 
  Receipt, 
  Plus, 
  Check, 
  X, 
  Calendar, 
  DollarSign, 
  Percent, 
  Settings, 
  FileText,
  Clock,
  Printer,
  Download
} from 'lucide-react'

export default function Invoices() {
  const [activeTab, setActiveTab] = useState('categories')
  
  // Data Lists
  const [categories, setCategories] = useState([])
  const [structures, setStructures] = useState([])
  const [studentFees, setStudentFees] = useState([])
  const [scholarships, setScholarships] = useState([])
  const [discounts, setDiscounts] = useState([])
  const [fines, setFines] = useState([])
  const [receipts, setReceipts] = useState([])
  const [reports, setReports] = useState({ totalInvoiced: 0, totalCollected: 0, totalOutstanding: 0, pendingList: [], collectionSummary: { cash: 0, upi: 0, card: 0, bank_transfer: 0 } })
  
  // UI states
  const [loading, setLoading] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [classFilter, setClassFilter] = useState('')

  // Creation forms states
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '', isActive: true })
  const [structureForm, setStructureForm] = useState({ academicYear: '2026-2027', campus: 'Main Campus', class: 'Grade 10', category: '', amount: '', dueDate: '', lateFee: '' })
  const [scholForm, setScholForm] = useState({ name: '', eligibility: '', amount: '', percentage: '', isActive: true })
  const [discountForm, setDiscountForm] = useState({ name: '', percentage: '', fixedAmount: '', reason: '', isActive: true })
  const [fineForm, setFineForm] = useState({ name: '', fineRules: '', lateFee: '', gracePeriod: '', penaltyAmount: '' })

  // Fetch functions
  const fetchCategories = async () => {
    try {
      const res = await axiosClient.get('/fees/categories')
      if (res.data.success) setCategories(res.data.data)
    } catch (err) { console.error(err) }
  }

  const fetchStructures = async () => {
    try {
      const res = await axiosClient.get('/fees/structures')
      if (res.data.success) setStructures(res.data.data)
    } catch (err) { console.error(err) }
  }

  const fetchStudentFees = async () => {
    try {
      const res = await axiosClient.get('/fees/student-fees')
      if (res.data.success) setStudentFees(res.data.data)
    } catch (err) { console.error(err) }
  }

  const fetchScholarships = async () => {
    try {
      const res = await axiosClient.get('/fees/scholarships')
      if (res.data.success) setScholarships(res.data.data)
    } catch (err) { console.error(err) }
  }

  const fetchDiscounts = async () => {
    try {
      const res = await axiosClient.get('/fees/discounts')
      if (res.data.success) setDiscounts(res.data.data)
    } catch (err) { console.error(err) }
  }

  const fetchFines = async () => {
    try {
      const res = await axiosClient.get('/fees/fines')
      if (res.data.success) setFines(res.data.data)
    } catch (err) { console.error(err) }
  }

  const fetchReceipts = async () => {
    try {
      const res = await axiosClient.get('/fees/receipts')
      if (res.data.success) setReceipts(res.data.data)
    } catch (err) { console.error(err) }
  }

  const fetchReports = async () => {
    try {
      const res = await axiosClient.get('/fees/reports')
      if (res.data.success) setReports(res.data.data)
    } catch (err) { console.error(err) }
  }

  useEffect(() => {
    if (activeTab === 'categories') fetchCategories()
    if (activeTab === 'structures') { fetchCategories(); fetchStructures(); }
    if (activeTab === 'student_fees') fetchStudentFees()
    if (activeTab === 'scholarships') fetchScholarships()
    if (activeTab === 'discounts') fetchDiscounts()
    if (activeTab === 'fines') fetchFines()
    if (activeTab === 'receipts') fetchReceipts()
    if (activeTab === 'reports') fetchReports()
  }, [activeTab])

  // Form Submissions
  const handleCreateCategory = async (e) => {
    e.preventDefault()
    try {
      const res = await axiosClient.post('/fees/categories', categoryForm)
      if (res.data.success) {
        setSuccessMsg('Fee Category created successfully.')
        setSuccessOpen(true)
        setCategoryForm({ name: '', description: '', isActive: true })
        fetchCategories()
      }
    } catch (err) { console.error(err) }
  }

  const handleCreateStructure = async (e) => {
    e.preventDefault()
    try {
      const res = await axiosClient.post('/fees/structures', structureForm)
      if (res.data.success) {
        setSuccessMsg('Fee Structure configuration applied.')
        setSuccessOpen(true)
        setStructureForm({ academicYear: '2026-2027', campus: 'Main Campus', class: 'Grade 10', category: '', amount: '', dueDate: '', lateFee: '' })
        fetchStructures()
      }
    } catch (err) { console.error(err) }
  }

  const handleCreateScholarship = async (e) => {
    e.preventDefault()
    try {
      const res = await axiosClient.post('/fees/scholarships', scholForm)
      if (res.data.success) {
        setSuccessMsg('Scholarship eligibility configuration saved.')
        setSuccessOpen(true)
        setScholForm({ name: '', eligibility: '', amount: '', percentage: '', isActive: true })
        fetchScholarships()
      }
    } catch (err) { console.error(err) }
  }

  const handleCreateDiscount = async (e) => {
    e.preventDefault()
    try {
      const res = await axiosClient.post('/fees/discounts', discountForm)
      if (res.data.success) {
        setSuccessMsg('Discount criteria saved.')
        setSuccessOpen(true)
        setDiscountForm({ name: '', percentage: '', fixedAmount: '', reason: '', isActive: true })
        fetchDiscounts()
      }
    } catch (err) { console.error(err) }
  }

  const handleCreateFine = async (e) => {
    e.preventDefault()
    try {
      const res = await axiosClient.post('/fees/fines', fineForm)
      if (res.data.success) {
        setSuccessMsg('Late Fine penalty rule created.')
        setSuccessOpen(true)
        setFineForm({ name: '', fineRules: '', lateFee: '', gracePeriod: '', penaltyAmount: '' })
        fetchFines()
      }
    } catch (err) { console.error(err) }
  }

  // Soft Deletes
  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete category?')) return
    try {
      await axiosClient.delete(`/fees/categories/${id}`)
      fetchCategories()
    } catch (err) { console.error(err) }
  }

  const handleDeleteStructure = async (id) => {
    if (!window.confirm('Delete fee structure?')) return
    try {
      await axiosClient.delete(`/fees/structures/${id}`)
      fetchStructures()
    } catch (err) { console.error(err) }
  }

  // Column definitions
  const categoryColumns = [
    { header: 'Category Name', accessor: 'name' },
    { header: 'Description', accessor: 'description' },
    {
      header: 'Status',
      accessor: (row) => <StatusChip status={row.isActive ? 'active' : 'inactive'} />
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <Button variant="destructive" size="sm" onClick={() => handleDeleteCategory(row._id)}>Delete</Button>
      )
    }
  ]

  const structureColumns = [
    { header: 'Class', accessor: 'class' },
    { header: 'Category', accessor: (row) => row.category?.name || 'N/A' },
    { header: 'Amount', accessor: (row) => `$${row.amount}` },
    { header: 'Due Date', accessor: (row) => new Date(row.dueDate).toLocaleDateString() },
    { header: 'Late Fee Penalty', accessor: (row) => `$${row.lateFee}` },
    {
      header: 'Actions',
      accessor: (row) => (
        <Button variant="destructive" size="sm" onClick={() => handleDeleteStructure(row._id)}>Delete</Button>
      )
    }
  ]

  const studentFeeColumns = [
    {
      header: 'Student Name',
      accessor: (row) => row.studentId ? `${row.studentId.firstName} ${row.studentId.lastName}` : 'Unknown'
    },
    { header: 'Fee Category', accessor: (row) => row.feeStructureId?.category?.name || 'N/A' },
    { header: 'Total Billing', accessor: (row) => `$${row.totalAmount}` },
    { header: 'Amount Paid', accessor: (row) => `$${row.paidAmount}` },
    { header: 'Pending Balances', accessor: (row) => `$${row.pendingAmount}` },
    {
      header: 'Status',
      accessor: (row) => <StatusChip status={row.status} />
    }
  ]

  const scholColumns = [
    { header: 'Scholarship Name', accessor: 'name' },
    { header: 'Eligibility Criteria', accessor: 'eligibility' },
    { header: 'Percentage Deduction', accessor: (row) => row.percentage ? `${row.percentage}%` : 'N/A' },
    { header: 'Deduction Amount', accessor: (row) => row.amount ? `$${row.amount}` : 'N/A' },
    {
      header: 'Status',
      accessor: (row) => <StatusChip status={row.isActive ? 'active' : 'inactive'} />
    }
  ]

  const discountColumns = [
    { header: 'Discount Option', accessor: 'name' },
    { header: 'Deduction Percentage', accessor: (row) => row.percentage ? `${row.percentage}%` : 'N/A' },
    { header: 'Deduction Amount', accessor: (row) => row.fixedAmount ? `$${row.fixedAmount}` : 'N/A' },
    { header: 'Reason', accessor: 'reason' }
  ]

  const fineColumns = [
    { header: 'Late Fine Rule', accessor: 'name' },
    { header: 'Late Fee Penalty', accessor: (row) => `$${row.lateFee}` },
    { header: 'Grace Period (Days)', accessor: (row) => `${row.gracePeriod} Days` }
  ]

  const receiptColumns = [
    { header: 'Receipt No', accessor: 'receiptNumber' },
    { header: 'Student Name', accessor: (row) => row.studentId ? `${row.studentId.firstName} ${row.studentId.lastName}`.trim() : 'Student' },
    { header: 'Payment Method', accessor: (row) => <Badge className="uppercase">{row.paymentId?.method || 'Cash'}</Badge> },
    { header: 'Date issued', accessor: (row) => new Date(row.issueDate).toLocaleDateString() },
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
        title="Fees & Invoices Dashboard"
        subtitle="Manage billing categories, invoices structures, payments ledger, and fine regulations."
      />

      {/* Tabs list menu */}
      <div className="flex border-b border-border select-none overflow-x-auto gap-1 mb-6 pb-1">
        {[
          { id: 'categories', label: 'Fee Categories', icon: Settings },
          { id: 'structures', label: 'Fee Structure', icon: Calendar },
          { id: 'student_fees', label: 'Student Fees', icon: DollarSign },
          { id: 'scholarships', label: 'Scholarships', icon: Percent },
          { id: 'discounts', label: 'Discounts', icon: Percent },
          { id: 'fines', label: 'Fine Management', icon: Clock },
          { id: 'receipts', label: 'Receipts', icon: Receipt },
          { id: 'reports', label: 'Due Reports', icon: FileText }
        ].map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-md border-b-2 transition-all shrink-0 cursor-pointer ${
                activeTab === tab.id 
                  ? 'border-primary bg-primary/5 text-primary' 
                  : 'border-transparent text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
          <div className="md:col-span-1">
            <SimpleCard title="Add Category">
              <form onSubmit={handleCreateCategory} className="space-y-4">
                <FormInput 
                  label="Category Name" 
                  placeholder="e.g. Tuition, Transport, Hostel"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
                <FormTextarea 
                  label="Description" 
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                />
                <Button type="submit" className="w-full flex items-center justify-center gap-1"><Plus className="h-4 w-4" /> Save Category</Button>
              </form>
            </SimpleCard>
          </div>
          <div className="md:col-span-2">
            <SimpleCard title="Fee Categories lists">
              <ReusableTable columns={categoryColumns} data={categories} />
            </SimpleCard>
          </div>
        </div>
      )}

      {/* Structure Tab */}
      {activeTab === 'structures' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
          <div className="md:col-span-1">
            <SimpleCard title="Add Structure mapping">
              <form onSubmit={handleCreateStructure} className="space-y-4">
                <FormInput 
                  label="Academic Year" 
                  value={structureForm.academicYear}
                  onChange={(e) => setStructureForm(prev => ({ ...prev, academicYear: e.target.value }))}
                  required
                />
                <FormSelect 
                  label="Target Class" 
                  value={structureForm.class}
                  onChange={(e) => setStructureForm(prev => ({ ...prev, class: e.target.value }))}
                  options={[
                    { value: 'Grade 9', label: 'Grade 9' },
                    { value: 'Grade 10', label: 'Grade 10' },
                    { value: 'Grade 12', label: 'Grade 12' }
                  ]}
                  required
                />
                <FormSelect 
                  label="Category" 
                  value={structureForm.category}
                  onChange={(e) => setStructureForm(prev => ({ ...prev, category: e.target.value }))}
                  options={categories.map(c => ({ value: c._id, label: c.name }))}
                  required
                />
                <FormInput 
                  label="Fee Amount ($)" 
                  type="number"
                  value={structureForm.amount}
                  onChange={(e) => setStructureForm(prev => ({ ...prev, amount: e.target.value }))}
                  required
                />
                <FormInput 
                  label="Due Date" 
                  type="date"
                  value={structureForm.dueDate}
                  onChange={(e) => setStructureForm(prev => ({ ...prev, dueDate: e.target.value }))}
                  required
                />
                <FormInput 
                  label="Late Fee penalty ($)" 
                  type="number"
                  value={structureForm.lateFee}
                  onChange={(e) => setStructureForm(prev => ({ ...prev, lateFee: e.target.value }))}
                />
                <Button type="submit" className="w-full flex items-center justify-center gap-1"><Plus className="h-4 w-4" /> Save Structure</Button>
              </form>
            </SimpleCard>
          </div>
          <div className="md:col-span-2">
            <SimpleCard title="Fee Structure lists">
              <ReusableTable columns={structureColumns} data={structures} />
            </SimpleCard>
          </div>
        </div>
      )}

      {/* Student Fees Tab */}
      {activeTab === 'student_fees' && (
        <SimpleCard title="Students Billing Invoices ledger">
          <ReusableTable columns={studentFeeColumns} data={studentFees} />
        </SimpleCard>
      )}

      {/* Scholarships Tab */}
      {activeTab === 'scholarships' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
          <div className="md:col-span-1">
            <SimpleCard title="Configure Scholarship">
              <form onSubmit={handleCreateScholarship} className="space-y-4">
                <FormInput 
                  label="Scholarship Name" 
                  value={scholForm.name}
                  onChange={(e) => setScholForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
                <FormInput 
                  label="Eligibility Criteria" 
                  value={scholForm.eligibility}
                  onChange={(e) => setScholForm(prev => ({ ...prev, eligibility: e.target.value }))}
                />
                <FormInput 
                  label="Fixed Deduction ($)" 
                  type="number"
                  value={scholForm.amount}
                  onChange={(e) => setScholForm(prev => ({ ...prev, amount: e.target.value }))}
                />
                <FormInput 
                  label="Percentage Deduction (%)" 
                  type="number"
                  value={scholForm.percentage}
                  onChange={(e) => setScholForm(prev => ({ ...prev, percentage: e.target.value }))}
                />
                <Button type="submit" className="w-full flex items-center justify-center gap-1"><Plus className="h-4 w-4" /> Save Scholarship</Button>
              </form>
            </SimpleCard>
          </div>
          <div className="md:col-span-2">
            <SimpleCard title="Scholarships list">
              <ReusableTable columns={scholColumns} data={scholarships} />
            </SimpleCard>
          </div>
        </div>
      )}

      {/* Discounts Tab */}
      {activeTab === 'discounts' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
          <div className="md:col-span-1">
            <SimpleCard title="Add Discount option">
              <form onSubmit={handleCreateDiscount} className="space-y-4">
                <FormInput 
                  label="Discount Option Name" 
                  value={discountForm.name}
                  onChange={(e) => setDiscountForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
                <FormInput 
                  label="Percentage Deduction (%)" 
                  type="number"
                  value={discountForm.percentage}
                  onChange={(e) => setDiscountForm(prev => ({ ...prev, percentage: e.target.value }))}
                />
                <FormInput 
                  label="Fixed Deduction ($)" 
                  type="number"
                  value={discountForm.fixedAmount}
                  onChange={(e) => setDiscountForm(prev => ({ ...prev, fixedAmount: e.target.value }))}
                />
                <FormTextarea 
                  label="Reason" 
                  value={discountForm.reason}
                  onChange={(e) => setDiscountForm(prev => ({ ...prev, reason: e.target.value }))}
                />
                <Button type="submit" className="w-full flex items-center justify-center gap-1"><Plus className="h-4 w-4" /> Save Discount</Button>
              </form>
            </SimpleCard>
          </div>
          <div className="md:col-span-2">
            <SimpleCard title="Discount criteria lists">
              <ReusableTable columns={discountColumns} data={discounts} />
            </SimpleCard>
          </div>
        </div>
      )}

      {/* Fine Management Tab */}
      {activeTab === 'fines' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
          <div className="md:col-span-1">
            <SimpleCard title="Add Late Fine rule">
              <form onSubmit={handleCreateFine} className="space-y-4">
                <FormInput 
                  label="Late Fine Rule Name" 
                  value={fineForm.name}
                  onChange={(e) => setFineForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
                <FormInput 
                  label="Grace Period (Days)" 
                  type="number"
                  value={fineForm.gracePeriod}
                  onChange={(e) => setFineForm(prev => ({ ...prev, gracePeriod: e.target.value }))}
                />
                <FormInput 
                  label="Late Fee penalty ($)" 
                  type="number"
                  value={fineForm.lateFee}
                  onChange={(e) => setFineForm(prev => ({ ...prev, lateFee: e.target.value }))}
                  required
                />
                <Button type="submit" className="w-full flex items-center justify-center gap-1"><Plus className="h-4 w-4" /> Save Fine Rule</Button>
              </form>
            </SimpleCard>
          </div>
          <div className="md:col-span-2">
            <SimpleCard title="Fine rules lists">
              <ReusableTable columns={fineColumns} data={fines} />
            </SimpleCard>
          </div>
        </div>
      )}

      {/* Receipts Tab */}
      {activeTab === 'receipts' && (
        <SimpleCard title="Issued Receipts and transactions logs">
          <ReusableTable columns={receiptColumns} data={receipts} />
        </SimpleCard>
      )}

      {/* Due Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Outstandings Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard title="Total Invoiced" value={`$${reports.totalInvoiced}`} icon={FileText} />
            <StatCard title="Total Collected" value={`$${reports.totalCollected}`} change="Received" icon={Check} />
            <StatCard title="Outstanding Balance" value={`$${reports.totalOutstanding}`} changeType="negative" icon={X} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <SimpleCard title="Student Pending balances list">
                <ReusableTable 
                  columns={[
                    { header: 'Student Name', accessor: 'studentName' },
                    { header: 'Class', accessor: 'class' },
                    { header: 'Category', accessor: 'feeCategory' },
                    { header: 'Due Amount', accessor: (row) => `$${row.dueAmount}` },
                    { header: 'Due Date', accessor: (row) => new Date(row.dueDate).toLocaleDateString() }
                  ]}
                  data={reports.pendingList}
                />
              </SimpleCard>
            </div>
            
            <div className="md:col-span-1">
              <SimpleCard title="Collection group summary">
                <div className="space-y-4 text-sm font-semibold select-none">
                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="text-muted-foreground">UPI Payments</span>
                    <span>${reports.collectionSummary?.upi || 0}</span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="text-muted-foreground">Cash Collections</span>
                    <span>${reports.collectionSummary?.cash || 0}</span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="text-muted-foreground">Card Swipes</span>
                    <span>${reports.collectionSummary?.card || 0}</span>
                  </div>
                  <div className="flex justify-between pb-2">
                    <span className="text-muted-foreground">Bank Transfers</span>
                    <span>${reports.collectionSummary?.bank_transfer || 0}</span>
                  </div>
                </div>
              </SimpleCard>
            </div>
          </div>
        </div>
      )}

      <SuccessDialog open={successOpen} onClose={() => setSuccessOpen(false)} message={successMsg} />
    </PageContainer>
  )
}
