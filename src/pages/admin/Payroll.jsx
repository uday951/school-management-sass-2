import React, { useState, useEffect } from 'react'
import axiosClient from '@/config/axiosClient'
import { 
  PageHeader, 
  PageContainer, 
  SimpleCard, 
  StatCard, 
  Button, 
  FormInput, 
  FormSelect, 
  Badge, 
  StatusChip,
  ReusableTable
} from '@/components/shared'
import { 
  Coins, 
  UserCheck, 
  DollarSign, 
  Calendar, 
  FileText, 
  Plus, 
  CheckCircle, 
  Printer, 
  Download, 
  Settings, 
  TrendingUp, 
  Trash2,
  RefreshCw,
  Search,
  Sparkles,
  Award,
  Scissors
} from 'lucide-react'

export default function Payroll() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  // ─── STATE HOARDS ──────────────────────────────────────────────────────────
  const [dashboardStats, setDashboardStats] = useState({
    totalEmployees: 0,
    monthlyPayrollCost: 0,
    pendingPayroll: 0,
    paidPayroll: 0,
    totalBonuses: 0,
    totalDeductions: 0,
    upcomingPayroll: 0,
    trends: []
  })

  const [employeeSalaries, setEmployeeSalaries] = useState([])
  const [salaryStructures, setSalaryStructures] = useState([])
  const [salaryComponents, setSalaryComponents] = useState([])
  const [payrollBatches, setPayrollBatches] = useState([])
  const [currentPayslips, setCurrentPayslips] = useState([])
  const [bonuses, setBonuses] = useState([])
  const [allowances, setAllowances] = useState([])
  const [deductions, setDeductions] = useState([])
  const [reportsData, setReportsData] = useState([])

  // Modal / Form States
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [showStructureModal, setShowStructureModal] = useState(false)
  const [showComponentModal, setShowComponentModal] = useState(false)
  const [showAddDynamicModal, setShowAddDynamicModal] = useState(false) // bonus/allowance/deduction
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [showPayslipModal, setShowPayslipModal] = useState(false)
  const [selectedPayslip, setSelectedPayslip] = useState(null)

  // Form Fields
  const [configForm, setConfigForm] = useState({ teacherId: '', salaryStructureId: '' })
  const [structureForm, setStructureForm] = useState({
    name: '', basicSalary: '', hra: '', da: '', medicalAllowance: '', transportAllowance: '', otherAllowances: ''
  })
  const [componentForm, setComponentForm] = useState({ name: '', type: 'earning', calculationType: 'fixed', value: '' })
  const [dynamicForm, setDynamicForm] = useState({ category: 'bonus', teacherId: '', type: '', amount: '', remarks: '' })
  const [generateForm, setGenerateForm] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear() })
  const [reportFilter, setReportFilter] = useState({ type: 'summary', month: '', year: '' })

  // ─── DATA FETCHING ─────────────────────────────────────────────────────────
  const fetchDashboardStats = async () => {
    try {
      const res = await axiosClient.get('/payroll/dashboard-stats')
      if (res.data.success) setDashboardStats(res.data.data)
    } catch (err) { console.error(err) }
  }

  const fetchTeachers = async () => {
    try {
      const res = await axiosClient.get('/teachers')
      if (res.data.success) setTeachers(res.data.data)
    } catch (err) { console.error(err) }
  }

  const fetchEmployeeSalaries = async () => {
    try {
      const res = await axiosClient.get('/payroll/employee-salaries')
      if (res.data.success) setEmployeeSalaries(res.data.data)
    } catch (err) { console.error(err) }
  }

  const fetchSalaryStructures = async () => {
    try {
      const res = await axiosClient.get('/payroll/structures')
      if (res.data.success) setSalaryStructures(res.data.data)
    } catch (err) { console.error(err) }
  }

  const fetchSalaryComponents = async () => {
    try {
      const res = await axiosClient.get('/payroll/components')
      if (res.data.success) setSalaryComponents(res.data.data)
    } catch (err) { console.error(err) }
  }

  const fetchPayrollBatches = async () => {
    try {
      const res = await axiosClient.get('/payroll')
      if (res.data.success) setPayrollBatches(res.data.data)
    } catch (err) { console.error(err) }
  }

  const fetchBonuses = async () => {
    try {
      const res = await axiosClient.get('/payroll/bonuses')
      if (res.data.success) setBonuses(res.data.data)
    } catch (err) { console.error(err) }
  }

  const fetchAllowances = async () => {
    try {
      const res = await axiosClient.get('/payroll/allowances')
      if (res.data.success) setAllowances(res.data.data)
    } catch (err) { console.error(err) }
  }

  const fetchDeductions = async () => {
    try {
      const res = await axiosClient.get('/payroll/deductions')
      if (res.data.success) setDeductions(res.data.data)
    } catch (err) { console.error(err) }
  }

  const fetchReports = async () => {
    try {
      const res = await axiosClient.get('/payroll/reports', { params: reportFilter })
      if (res.data.success) setReportsData(res.data.data)
    } catch (err) { console.error(err) }
  }

  const triggerToast = (msg) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  useEffect(() => {
    fetchTeachers()
    if (activeTab === 'dashboard') fetchDashboardStats()
    if (activeTab === 'employees') fetchEmployeeSalaries()
    if (activeTab === 'structures') fetchSalaryStructures()
    if (activeTab === 'components') fetchSalaryComponents()
    if (activeTab === 'monthly') fetchPayrollBatches()
    if (activeTab === 'bonuses') fetchBonuses()
    if (activeTab === 'allowances') fetchAllowances()
    if (activeTab === 'deductions') fetchDeductions()
    if (activeTab === 'reports') fetchReports()
  }, [activeTab, reportFilter])

  // ─── ACTION HANDLERS ───────────────────────────────────────────────────────
  const handleConfigSalary = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const res = await axiosClient.post('/payroll/employee-salaries', configForm)
      if (res.data.success) {
        triggerToast('Employee salary structure configured successfully!')
        setShowConfigModal(false)
        fetchEmployeeSalaries()
      }
    } catch (err) {
      console.error(err)
    } finally { setLoading(false) }
  }

  const handleCreateStructure = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const res = await axiosClient.post('/payroll/structures', structureForm)
      if (res.data.success) {
        triggerToast('Salary structure created successfully!')
        setShowStructureModal(false)
        fetchSalaryStructures()
      }
    } catch (err) {
      console.error(err)
    } finally { setLoading(false) }
  }

  const handleCreateComponent = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const res = await axiosClient.post('/payroll/components', componentForm)
      if (res.data.success) {
        triggerToast('Salary component created successfully!')
        setShowComponentModal(false)
        fetchSalaryComponents()
      }
    } catch (err) {
      console.error(err)
    } finally { setLoading(false) }
  }

  const handleCreateDynamic = async (e) => {
    e.preventDefault()
    const endpointMap = {
      bonus: '/payroll/bonuses',
      allowance: '/payroll/allowances',
      deduction: '/payroll/deductions'
    }
    try {
      setLoading(true)
      const payload = {
        teacherId: dynamicForm.teacherId,
        amount: Number(dynamicForm.amount),
        type: dynamicForm.type,
        date: new Date(),
        remarks: dynamicForm.remarks
      }
      const res = await axiosClient.post(endpointMap[dynamicForm.category], payload)
      if (res.data.success) {
        triggerToast(`Dynamic ${dynamicForm.category} added successfully!`)
        setShowAddDynamicModal(false)
        if (dynamicForm.category === 'bonus') fetchBonuses()
        if (dynamicForm.category === 'allowance') fetchAllowances()
        if (dynamicForm.category === 'deduction') fetchDeductions()
      }
    } catch (err) {
      console.error(err)
    } finally { setLoading(false) }
  }

  const handleGeneratePayroll = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const res = await axiosClient.post('/payroll/generate', generateForm)
      if (res.data.success) {
        triggerToast('Monthly payroll batch generated successfully!')
        setShowGenerateModal(false)
        fetchPayrollBatches()
      }
    } catch (err) {
      console.error(err)
    } finally { setLoading(false) }
  }

  const handleApprovePayroll = async (batchId) => {
    try {
      setLoading(true)
      const res = await axiosClient.post(`/payroll/approve/${batchId}`)
      if (res.data.success) {
        triggerToast('Payroll batch approved successfully!')
        fetchPayrollBatches()
      }
    } catch (err) {
      console.error(err)
    } finally { setLoading(false) }
  }

  const handlePayPayroll = async (batchId) => {
    try {
      setLoading(true)
      const res = await axiosClient.post(`/payroll/pay/${batchId}`, { paymentMethod: 'bank_transfer' })
      if (res.data.success) {
        triggerToast('Payroll batch paid and ledger transactions registered!')
        fetchPayrollBatches()
      }
    } catch (err) {
      console.error(err)
    } finally { setLoading(false) }
  }

  const handleViewPayslips = async (batchId) => {
    try {
      const res = await axiosClient.get(`/payroll/batch/${batchId}/payslips`)
      if (res.data.success) {
        setCurrentPayslips(res.data.data)
        setActiveTab('payslips')
      }
    } catch (err) { console.error(err) }
  }

  const handleDeleteStructure = async (id) => {
    if (window.confirm('Are you sure you want to delete this salary structure?')) {
      try {
        await axiosClient.delete(`/payroll/structures/${id}`)
        triggerToast('Salary structure deleted.')
        fetchSalaryStructures()
      } catch (err) { console.error(err) }
    }
  }

  const handleDeleteComponent = async (id) => {
    if (window.confirm('Are you sure you want to delete this salary component?')) {
      try {
        await axiosClient.delete(`/payroll/components/${id}`)
        triggerToast('Salary component deleted.')
        fetchSalaryComponents()
      } catch (err) { console.error(err) }
    }
  }

  const handleDeleteDynamic = async (category, id) => {
    if (window.confirm(`Are you sure you want to delete this scheduled ${category}?`)) {
      try {
        await axiosClient.delete(`/payroll/${category}es/${id}`)
        triggerToast('Record deleted.')
        if (category === 'bonus') fetchBonuses()
        if (category === 'allowance') fetchAllowances()
        if (category === 'deduction') fetchDeductions()
      } catch (err) { console.error(err) }
    }
  }

  return (
    <PageContainer>
      <PageHeader 
        title="Staff Payroll Console"
        subtitle="Configure structured staff compensation models, process monthly payouts, track statutory calculations, and synchronize books."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowConfigModal(true)} className="flex items-center gap-1.5"><Settings className="h-4 w-4" /> Setup Salary</Button>
            <Button onClick={() => setShowGenerateModal(true)} className="flex items-center gap-1.5"><Plus className="h-4 w-4" /> Generate Payroll</Button>
          </div>
        }
      />

      {successMsg && (
        <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 p-4 rounded-lg text-sm font-semibold flex items-center gap-2 mb-6 animate-fadeIn">
          <CheckCircle className="h-4 w-4" /> {successMsg}
        </div>
      )}

      {/* Tabs Header */}
      <div className="flex border-b border-border select-none overflow-x-auto gap-1 mb-6 pb-1">
        {[
          { id: 'dashboard', label: 'Dashboard Overview', icon: Coins },
          { id: 'employees', label: 'Employee Salaries', icon: UserCheck },
          { id: 'structures', label: 'Salary Structures', icon: Settings },
          { id: 'components', label: 'Salary Components', icon: Sparkles },
          { id: 'monthly', label: 'Monthly Batches', icon: Calendar },
          { id: 'payslips', label: 'Payslips Center', icon: FileText },
          { id: 'bonuses', label: 'Bonuses', icon: Award },
          { id: 'allowances', label: 'Allowances', icon: DollarSign },
          { id: 'deductions', label: 'Deductions', icon: Scissors },
          { id: 'reports', label: 'Payroll Reports', icon: TrendingUp }
        ].map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-t-lg transition-colors border-b-2 ${
                activeTab === tab.id 
                  ? 'border-primary text-primary bg-primary/5' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* ─── TAB CONTENT PANELS ───────────────────────────────────────────────── */}
      
      {/* 1. Dashboard Overview */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard title="Total Employees" value={`${dashboardStats.totalEmployees}`} icon={UserCheck} />
            <StatCard title="Monthly Cost Est." value={`$${dashboardStats.monthlyPayrollCost}`} icon={DollarSign} />
            <StatCard title="Upcoming Payout" value={`$${dashboardStats.upcomingPayroll}`} icon={Calendar} change="Next Month" />
            <StatCard title="Paid Batch Cost" value={`$${dashboardStats.paidPayroll}`} icon={CheckCircle} change="Processed Batches" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SimpleCard title="Payroll Cost Trend Overview">
                <div className="h-[250px] flex items-end gap-6 justify-between pt-6 border-b border-border">
                  {dashboardStats.trends.map(t => {
                    const heightPercent = Math.min(100, Math.max(10, (t.cost / (dashboardStats.monthlyPayrollCost || 5000)) * 100))
                    return (
                      <div key={t.month} className="flex-1 flex flex-col items-center gap-2 group">
                        <span className="text-xs font-bold text-foreground opacity-0 group-hover:opacity-100 transition-opacity">${t.cost}</span>
                        <div 
                          className="w-full bg-gradient-to-t from-primary/60 to-primary rounded-t-md hover:from-primary hover:to-primary/80 transition-all cursor-pointer"
                          style={{ height: `${heightPercent}%` }}
                        />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase pt-2">{t.month}</span>
                      </div>
                    )
                  })}
                  {(!dashboardStats.trends || dashboardStats.trends.length === 0) && (
                    <div className="w-full text-center py-20 text-xs font-semibold text-muted-foreground select-none">No historical trends available. Batch payouts auto-compile here.</div>
                  )}
                </div>
              </SimpleCard>
            </div>

            <div className="lg:col-span-1 space-y-4">
              <SimpleCard title="Batch Quick Totals">
                <div className="space-y-4 text-sm font-semibold">
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Total Bonuses Disbursed</span>
                    <span className="text-emerald-500 font-bold">+${dashboardStats.totalBonuses}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Total Deductions Applied</span>
                    <span className="text-rose-500 font-bold">-${dashboardStats.totalDeductions}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground">Approved Pending Disbursement</span>
                    <span className="text-amber-500 font-bold">${dashboardStats.pendingPayroll}</span>
                  </div>
                </div>
              </SimpleCard>
            </div>
          </div>
        </div>
      )}

      {/* 2. Employee Salaries */}
      {activeTab === 'employees' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-foreground">Employee Compensation Register</h2>
            <Button size="sm" onClick={() => setShowConfigModal(true)} className="flex items-center gap-1.5"><Plus className="h-4 w-4" /> Configure Employee</Button>
          </div>
          <ReusableTable 
            columns={[
              { header: 'Employee', accessor: (row) => `${row.teacherId?.firstName || 'N/A'} ${row.teacherId?.lastName || ''}` },
              { header: 'Department', accessor: (row) => row.teacherId?.department || 'N/A' },
              { header: 'Designation', accessor: (row) => row.teacherId?.designation || 'N/A' },
              { header: 'Structure', accessor: (row) => row.salaryStructureId?.name || 'N/A' },
              { header: 'Basic Pay', accessor: (row) => `$${row.basicSalary}` },
              { header: 'Net Payout Est.', accessor: (row) => `$${row.netSalary}` },
              { header: 'Status', accessor: (row) => <StatusChip status={row.status || 'active'} /> }
            ]}
            data={Array.isArray(employeeSalaries) ? employeeSalaries : []}
          />
        </div>
      )}

      {/* 3. Salary Structures */}
      {activeTab === 'structures' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-foreground">Salary Compensation Models</h2>
            <Button size="sm" onClick={() => setShowStructureModal(true)} className="flex items-center gap-1.5"><Plus className="h-4 w-4" /> Add Structure</Button>
          </div>
          <ReusableTable 
            columns={[
              { header: 'Structure Name', accessor: 'name' },
              { header: 'Basic Pay', accessor: (row) => `$${row.basicSalary}` },
              { header: 'HRA', accessor: (row) => `$${row.hra}` },
              { header: 'DA', accessor: (row) => `$${row.da}` },
              { header: 'Gross Salary', accessor: (row) => `$${row.grossSalary}` },
              { header: 'Effective Date', accessor: (row) => new Date(row.effectiveDate).toLocaleDateString() },
              { header: 'Actions', accessor: (row) => (
                <Button variant="danger" size="sm" onClick={() => handleDeleteStructure(row._id)}><Trash2 className="h-3.5 w-3.5" /></Button>
              )}
            ]}
            data={Array.isArray(salaryStructures) ? salaryStructures : []}
          />
        </div>
      )}

      {/* 4. Salary Components */}
      {activeTab === 'components' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-foreground">Salary Component Matrix</h2>
            <Button size="sm" onClick={() => setShowComponentModal(true)} className="flex items-center gap-1.5"><Plus className="h-4 w-4" /> Add Component</Button>
          </div>
          <ReusableTable 
            columns={[
              { header: 'Component Name', accessor: 'name' },
              { header: 'Type', accessor: (row) => <Badge variant={row.type === 'earning' ? 'success' : 'danger'}>{row.type.toUpperCase()}</Badge> },
              { header: 'Calculation', accessor: 'calculationType' },
              { header: 'Value Rate', accessor: (row) => row.calculationType === 'percentage' ? `${row.value}%` : `$${row.value}` },
              { header: 'Actions', accessor: (row) => (
                <Button variant="danger" size="sm" onClick={() => handleDeleteComponent(row._id)}><Trash2 className="h-3.5 w-3.5" /></Button>
              )}
            ]}
            data={Array.isArray(salaryComponents) ? salaryComponents : []}
          />
        </div>
      )}

      {/* 5. Monthly Payroll */}
      {activeTab === 'monthly' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-foreground">Payroll Batches run logs</h2>
            <Button size="sm" onClick={() => setShowGenerateModal(true)} className="flex items-center gap-1.5"><Plus className="h-4 w-4" /> Process Batch</Button>
          </div>
          <ReusableTable 
            columns={[
              { header: 'Batch Month', accessor: (row) => `${row.month}/${row.year}` },
              { header: 'Processed Date', accessor: (row) => new Date(row.processedDate).toLocaleDateString() },
              { header: 'Gross Paid', accessor: (row) => `$${row.totalAmount}` },
              { header: 'Net Disbursement', accessor: (row) => `$${row.netAmount}` },
              { header: 'Status', accessor: (row) => <StatusChip status={row.status} /> },
              { header: 'Execution Actions', accessor: (row) => (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleViewPayslips(row._id)}>View Payslips</Button>
                  {row.status === 'pending' && (
                    <Button size="sm" onClick={() => handleApprovePayroll(row._id)}>Approve Run</Button>
                  )}
                  {row.status === 'approved' && (
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handlePayPayroll(row._id)}>Disburse Funds</Button>
                  )}
                </div>
              )}
            ]}
            data={Array.isArray(payrollBatches) ? payrollBatches : []}
          />
        </div>
      )}

      {/* 6. Payslips Center */}
      {activeTab === 'payslips' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-foreground">Payslip Browser Center</h2>
            <Button size="sm" variant="outline" onClick={() => setActiveTab('monthly')}>Back to Batches</Button>
          </div>
          <ReusableTable 
            columns={[
              { header: 'Emp ID', accessor: 'employeeId' },
              { header: 'Name', accessor: 'name' },
              { header: 'Department', accessor: 'department' },
              { header: 'Basic Pay', accessor: (row) => `$${row.basicSalary}` },
              { header: 'PF ESI Deductions', accessor: (row) => `$${row.pf + row.esi}` },
              { header: 'Net Salary Paid', accessor: (row) => `$${row.netSalary}` },
              { header: 'Actions', accessor: (row) => (
                <Button size="sm" onClick={() => {
                  setSelectedPayslip(row)
                  setShowPayslipModal(true)
                }} className="flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> View Payslip</Button>
              )}
            ]}
            data={Array.isArray(currentPayslips) ? currentPayslips : []}
          />
          {currentPayslips.length === 0 && (
            <div className="text-center py-12 text-xs font-semibold text-muted-foreground select-none">No payslips loaded. Select a payroll run batch in the "Monthly Batches" tab to browse.</div>
          )}
        </div>
      )}

      {/* 7. Bonuses */}
      {activeTab === 'bonuses' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-foreground">Scheduled Dynamic Bonuses</h2>
            <Button size="sm" onClick={() => {
              setDynamicForm({ category: 'bonus', teacherId: '', type: 'Performance', amount: '', remarks: '' })
              setShowAddDynamicModal(true)
            }} className="flex items-center gap-1.5"><Plus className="h-4 w-4" /> Add Bonus</Button>
          </div>
          <ReusableTable 
            columns={[
              { header: 'Employee', accessor: (row) => `${row.teacherId?.firstName || 'N/A'} ${row.teacherId?.lastName || ''}` },
              { header: 'Type', accessor: 'type' },
              { header: 'Amount', accessor: (row) => `$${row.amount}` },
              { header: 'Status', accessor: (row) => <StatusChip status={row.status} /> },
              { header: 'Remarks', accessor: 'remarks' },
              { header: 'Actions', accessor: (row) => (
                <Button variant="danger" size="sm" onClick={() => handleDeleteDynamic('bonus', row._id)}><Trash2 className="h-3.5 w-3.5" /></Button>
              )}
            ]}
            data={Array.isArray(bonuses) ? bonuses : []}
          />
        </div>
      )}

      {/* 8. Allowances */}
      {activeTab === 'allowances' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-foreground">Scheduled Dynamic Allowances</h2>
            <Button size="sm" onClick={() => {
              setDynamicForm({ category: 'allowance', teacherId: '', type: 'Transport', amount: '', remarks: '' })
              setShowAddDynamicModal(true)
            }} className="flex items-center gap-1.5"><Plus className="h-4 w-4" /> Add Allowance</Button>
          </div>
          <ReusableTable 
            columns={[
              { header: 'Employee', accessor: (row) => `${row.teacherId?.firstName || 'N/A'} ${row.teacherId?.lastName || ''}` },
              { header: 'Type', accessor: 'type' },
              { header: 'Amount', accessor: (row) => `$${row.amount}` },
              { header: 'Status', accessor: (row) => <StatusChip status={row.status} /> },
              { header: 'Remarks', accessor: 'remarks' },
              { header: 'Actions', accessor: (row) => (
                <Button variant="danger" size="sm" onClick={() => handleDeleteDynamic('allowance', row._id)}><Trash2 className="h-3.5 w-3.5" /></Button>
              )}
            ]}
            data={Array.isArray(allowances) ? allowances : []}
          />
        </div>
      )}

      {/* 9. Deductions */}
      {activeTab === 'deductions' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-foreground">Scheduled Dynamic Deductions</h2>
            <Button size="sm" onClick={() => {
              setDynamicForm({ category: 'deduction', teacherId: '', type: 'Loan Recovery', amount: '', remarks: '' })
              setShowAddDynamicModal(true)
            }} className="flex items-center gap-1.5"><Plus className="h-4 w-4" /> Add Deduction</Button>
          </div>
          <ReusableTable 
            columns={[
              { header: 'Employee', accessor: (row) => `${row.teacherId?.firstName || 'N/A'} ${row.teacherId?.lastName || ''}` },
              { header: 'Type', accessor: 'type' },
              { header: 'Amount', accessor: (row) => `$${row.amount}` },
              { header: 'Status', accessor: (row) => <StatusChip status={row.status} /> },
              { header: 'Remarks', accessor: 'remarks' },
              { header: 'Actions', accessor: (row) => (
                <Button variant="danger" size="sm" onClick={() => handleDeleteDynamic('deduction', row._id)}><Trash2 className="h-3.5 w-3.5" /></Button>
              )}
            ]}
            data={Array.isArray(deductions) ? deductions : []}
          />
        </div>
      )}

      {/* 10. Reports */}
      {activeTab === 'reports' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex gap-4 items-end bg-card p-4 border border-border rounded-lg select-none">
            <FormSelect 
              label="Report Category"
              value={reportFilter.type}
              onChange={(e) => setReportFilter(prev => ({ ...prev, type: e.target.value }))}
              options={[
                { value: 'summary', label: 'Payroll Batches Summary' },
                { value: 'register', label: 'Salary Ledger Register' },
                { value: 'department', label: 'Department-wise Expenses' }
              ]}
            />
            <FormInput 
              label="Month (optional)"
              type="number"
              placeholder="e.g. 7"
              value={reportFilter.month}
              onChange={(e) => setReportFilter(prev => ({ ...prev, month: e.target.value }))}
            />
            <FormInput 
              label="Year (optional)"
              type="number"
              placeholder="e.g. 2026"
              value={reportFilter.year}
              onChange={(e) => setReportFilter(prev => ({ ...prev, year: e.target.value }))}
            />
          </div>

          <SimpleCard title="Payroll Statistics Reports Output">
            {reportFilter.type === 'summary' && (
              <ReusableTable 
                columns={[
                  { header: 'Month/Year', accessor: (row) => `${row.month}/${row.year}` },
                  { header: 'Gross Paid', accessor: (row) => `$${row.totalAmount}` },
                  { header: 'Total Allowances', accessor: (row) => `$${row.totalAllowances}` },
                  { header: 'Total Deductions', accessor: (row) => `$${row.totalDeductions}` },
                  { header: 'Net Payout', accessor: (row) => `$${row.netAmount}` },
                  { header: 'Status', accessor: (row) => <StatusChip status={row.status} /> }
                ]}
                data={Array.isArray(reportsData) ? reportsData : []}
              />
            )}
            {reportFilter.type === 'register' && (
              <ReusableTable 
                columns={[
                  { header: 'Emp ID', accessor: 'employeeId' },
                  { header: 'Employee Name', accessor: 'name' },
                  { header: 'Department', accessor: 'department' },
                  { header: 'Gross Pay', accessor: (row) => `$${row.grossSalary}` },
                  { header: 'Deductions Amount', accessor: (row) => `$${row.deductionsAmount}` },
                  { header: 'Net Pay', accessor: (row) => `$${row.netSalary}` }
                ]}
                data={Array.isArray(reportsData) ? reportsData : []}
              />
            )}
            {reportFilter.type === 'department' && (
              <ReusableTable 
                columns={[
                  { header: 'Department Division', accessor: '_id' },
                  { header: 'Total Net Cost Contribution', accessor: (row) => `$${row.totalCost}` },
                  { header: 'Faculty Count', accessor: 'count' }
                ]}
                data={Array.isArray(reportsData) ? reportsData : []}
              />
            )}
          </SimpleCard>
        </div>
      )}

      {/* ─── MODAL DIALOGS / POPUPS ───────────────────────────────────────────── */}

      {/* Setup Employee Salary Config Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn select-none">
          <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-foreground mb-4">Configure Employee Salary Structure</h3>
            <form onSubmit={handleConfigSalary} className="space-y-4">
              <FormSelect 
                label="Select Teacher/Employee"
                value={configForm.teacherId}
                onChange={(e) => setConfigForm(prev => ({ ...prev, teacherId: e.target.value }))}
                options={teachers.map(t => ({ value: t._id, label: `${t.firstName} ${t.lastName} (${t.employeeId})` }))}
                required
              />
              <FormSelect 
                label="Select Salary Structure"
                value={configForm.salaryStructureId}
                onChange={(e) => setConfigForm(prev => ({ ...prev, salaryStructureId: e.target.value }))}
                options={salaryStructures.map(s => ({ value: s._id, label: s.name }))}
                required
              />
              <div className="flex gap-2 justify-end pt-2">
                <Button type="button" variant="outline" onClick={() => setShowConfigModal(false)}>Cancel</Button>
                <Button type="submit" disabled={loading}>{loading ? 'Configuring...' : 'Configure Setup'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Salary Structure Modal */}
      {showStructureModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn select-none">
          <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-lg p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-foreground mb-4">Add New Salary Structure Model</h3>
            <form onSubmit={handleCreateStructure} className="space-y-4">
              <FormInput 
                label="Structure Name" 
                placeholder="e.g. Senior Science Faculty Grade II"
                value={structureForm.name} 
                onChange={(e) => setStructureForm(prev => ({ ...prev, name: e.target.value }))}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <FormInput 
                  label="Basic Salary" 
                  type="number"
                  value={structureForm.basicSalary} 
                  onChange={(e) => setStructureForm(prev => ({ ...prev, basicSalary: e.target.value }))}
                  required
                />
                <FormInput 
                  label="HRA" 
                  type="number"
                  value={structureForm.hra} 
                  onChange={(e) => setStructureForm(prev => ({ ...prev, hra: e.target.value }))}
                />
                <FormInput 
                  label="Dearness Allowance (DA)" 
                  type="number"
                  value={structureForm.da} 
                  onChange={(e) => setStructureForm(prev => ({ ...prev, da: e.target.value }))}
                />
                <FormInput 
                  label="Medical Allowance" 
                  type="number"
                  value={structureForm.medicalAllowance} 
                  onChange={(e) => setStructureForm(prev => ({ ...prev, medicalAllowance: e.target.value }))}
                />
                <FormInput 
                  label="Transport Allowance" 
                  type="number"
                  value={structureForm.transportAllowance} 
                  onChange={(e) => setStructureForm(prev => ({ ...prev, transportAllowance: e.target.value }))}
                />
                <FormInput 
                  label="Other Allowances" 
                  type="number"
                  value={structureForm.otherAllowances} 
                  onChange={(e) => setStructureForm(prev => ({ ...prev, otherAllowances: e.target.value }))}
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button type="button" variant="outline" onClick={() => setShowStructureModal(false)}>Cancel</Button>
                <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Structure'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Component Modal */}
      {showComponentModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn select-none">
          <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-foreground mb-4">Add Salary Component</h3>
            <form onSubmit={handleCreateComponent} className="space-y-4">
              <FormInput 
                label="Component Name" 
                placeholder="e.g. Special Project Bonus"
                value={componentForm.name} 
                onChange={(e) => setComponentForm(prev => ({ ...prev, name: e.target.value }))}
                required
              />
              <FormSelect 
                label="Type"
                value={componentForm.type}
                onChange={(e) => setComponentForm(prev => ({ ...prev, type: e.target.value }))}
                options={[
                  { value: 'earning', label: 'Earning / Allowance' },
                  { value: 'deduction', label: 'Deduction' }
                ]}
              />
              <FormSelect 
                label="Calculation Type"
                value={componentForm.calculationType}
                onChange={(e) => setComponentForm(prev => ({ ...prev, calculationType: e.target.value }))}
                options={[
                  { value: 'fixed', label: 'Fixed Amount' },
                  { value: 'percentage', label: 'Percentage' }
                ]}
              />
              <FormInput 
                label="Value Rate" 
                type="number"
                value={componentForm.value} 
                onChange={(e) => setComponentForm(prev => ({ ...prev, value: e.target.value }))}
                required
              />
              <div className="flex gap-2 justify-end pt-2">
                <Button type="button" variant="outline" onClick={() => setShowComponentModal(false)}>Cancel</Button>
                <Button type="submit" disabled={loading}>{loading ? 'Adding...' : 'Add Component'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Dynamic Additions/Deductions Modal */}
      {showAddDynamicModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn select-none">
          <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-foreground mb-4 capitalize">Schedule Dynamic {dynamicForm.category}</h3>
            <form onSubmit={handleCreateDynamic} className="space-y-4">
              <FormSelect 
                label="Select Category"
                value={dynamicForm.category}
                onChange={(e) => setDynamicForm(prev => ({ ...prev, category: e.target.value }))}
                options={[
                  { value: 'bonus', label: 'Bonus Incentive' },
                  { value: 'allowance', label: 'Allowance addition' },
                  { value: 'deduction', label: 'Salary deduction' }
                ]}
              />
              <FormSelect 
                label="Select Teacher/Employee"
                value={dynamicForm.teacherId}
                onChange={(e) => setDynamicForm(prev => ({ ...prev, teacherId: e.target.value }))}
                options={teachers.map(t => ({ value: t._id, label: `${t.firstName} ${t.lastName}` }))}
                required
              />
              <FormInput 
                label="Type Key" 
                placeholder="e.g. Festival, Performance, Food, PF"
                value={dynamicForm.type} 
                onChange={(e) => setDynamicForm(prev => ({ ...prev, type: e.target.value }))}
                required
              />
              <FormInput 
                label="Amount" 
                type="number"
                value={dynamicForm.amount} 
                onChange={(e) => setDynamicForm(prev => ({ ...prev, amount: e.target.value }))}
                required
              />
              <FormInput 
                label="Remarks" 
                value={dynamicForm.remarks} 
                onChange={(e) => setDynamicForm(prev => ({ ...prev, remarks: e.target.value }))}
              />
              <div className="flex gap-2 justify-end pt-2">
                <Button type="button" variant="outline" onClick={() => setShowAddDynamicModal(false)}>Cancel</Button>
                <Button type="submit" disabled={loading}>{loading ? 'Scheduling...' : 'Schedule Record'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generate Monthly Payroll Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn select-none">
          <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-foreground mb-4">Run Monthly Payroll Batch</h3>
            <form onSubmit={handleGeneratePayroll} className="space-y-4">
              <FormInput 
                label="Month (1-12)" 
                type="number"
                value={generateForm.month} 
                onChange={(e) => setGenerateForm(prev => ({ ...prev, month: e.target.value }))}
                required
              />
              <FormInput 
                label="Year" 
                type="number"
                value={generateForm.year} 
                onChange={(e) => setGenerateForm(prev => ({ ...prev, year: e.target.value }))}
                required
              />
              <div className="flex gap-2 justify-end pt-2">
                <Button type="button" variant="outline" onClick={() => setShowGenerateModal(false)}>Cancel</Button>
                <Button type="submit" disabled={loading}>{loading ? 'Generating Run...' : 'Execute Run Batch'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payslip Detail Modal */}
      {showPayslipModal && selectedPayslip && (
        <div className="fixed inset-0 bg-background/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl p-6 overflow-y-auto max-h-[90vh] animate-in zoom-in-95 duration-200">
            
            {/* Printable Payslip Structure */}
            <div id="printable-payslip" className="space-y-6 text-foreground font-sans">
              <div className="text-center border-b border-border pb-4">
                <h2 className="text-xl font-bold text-primary flex justify-center items-center gap-1.5"><Coins className="h-5 w-5" /> ACADEMIC INSTITUTION GROUP</h2>
                <p className="text-xs text-muted-foreground uppercase font-semibold">Staff Salary Payout Slip</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">Employee Name</span>
                  <span>{selectedPayslip.name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">Employee ID</span>
                  <span>{selectedPayslip.employeeId}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">Department / Role</span>
                  <span>{selectedPayslip.department} - {selectedPayslip.designation}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">Working Days in Batch</span>
                  <span>{selectedPayslip.workingDays} Days (P: {selectedPayslip.presentDays} | A: {selectedPayslip.absentDays} | L: {selectedPayslip.lateDays})</span>
                </div>
              </div>

              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs font-semibold">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border text-[10px] uppercase text-muted-foreground">
                      <th className="px-4 py-2">Earning Components</th>
                      <th className="px-4 py-2 text-right">Amount</th>
                      <th className="px-4 py-2">Deduction Components</th>
                      <th className="px-4 py-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border last:border-none">
                      <td className="px-4 py-2">Basic Pay Salary</td>
                      <td className="px-4 py-2 text-right">${selectedPayslip.basicSalary}</td>
                      <td className="px-4 py-2">Statutory Provident Fund (PF)</td>
                      <td className="px-4 py-2 text-right">${selectedPayslip.pf}</td>
                    </tr>
                    <tr className="border-b border-border last:border-none">
                      <td className="px-4 py-2">House Rent Allowance (HRA)</td>
                      <td className="px-4 py-2 text-right">${selectedPayslip.hra}</td>
                      <td className="px-4 py-2">State Insurance (ESI)</td>
                      <td className="px-4 py-2 text-right">${selectedPayslip.esi}</td>
                    </tr>
                    <tr className="border-b border-border last:border-none">
                      <td className="px-4 py-2">Dearness Allowance (DA)</td>
                      <td className="px-4 py-2 text-right">${selectedPayslip.da}</td>
                      <td className="px-4 py-2">Professional Tax</td>
                      <td className="px-4 py-2 text-right">${selectedPayslip.profTax}</td>
                    </tr>
                    <tr className="border-b border-border last:border-none">
                      <td className="px-4 py-2">Medical Allowance</td>
                      <td className="px-4 py-2 text-right">${selectedPayslip.medicalAllowance}</td>
                      <td className="px-4 py-2">Income Tax withholding</td>
                      <td className="px-4 py-2 text-right">${selectedPayslip.incomeTax}</td>
                    </tr>
                    <tr className="border-b border-border last:border-none">
                      <td className="px-4 py-2">Transport Allowance</td>
                      <td className="px-4 py-2 text-right">${selectedPayslip.transportAllowance}</td>
                      <td className="px-4 py-2">Attendance Leaves Loss Deduction</td>
                      <td className="px-4 py-2 text-right text-rose-500">${selectedPayslip.leaveDeduction}</td>
                    </tr>
                    <tr className="border-b border-border last:border-none">
                      <td className="px-4 py-2">Other Allowances & Incentives</td>
                      <td className="px-4 py-2 text-right">${selectedPayslip.otherAllowances + selectedPayslip.allowancesAmount + selectedPayslip.bonusesAmount}</td>
                      <td className="px-4 py-2">Other Deductions</td>
                      <td className="px-4 py-2 text-right">${selectedPayslip.deductionsAmount - (selectedPayslip.pf + selectedPayslip.esi + selectedPayslip.profTax + selectedPayslip.incomeTax + selectedPayslip.leaveDeduction)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-2 gap-6 bg-muted/40 p-4 rounded-lg font-semibold text-sm">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">Gross Salary Earnings</span>
                  <span className="text-primary font-bold">${selectedPayslip.grossSalary}</span>
                </div>
                <div className="text-right">
                  <span className="text-muted-foreground block text-[10px] uppercase">Net Salary Take-Home Payout</span>
                  <span className="text-emerald-500 font-bold text-base">${selectedPayslip.netSalary}</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px] text-muted-foreground font-semibold uppercase pt-4 border-t border-border">
                <span>Disbursement status: {selectedPayslip.status}</span>
                <span>Payment Method: {selectedPayslip.paymentMethod}</span>
              </div>
            </div>

            {/* Modal Controls */}
            <div className="flex gap-2 justify-end pt-6 border-t border-border mt-6">
              <Button variant="outline" onClick={() => setShowPayslipModal(false)}>Close View</Button>
              <Button variant="outline" onClick={() => window.print()} className="flex items-center gap-1.5"><Printer className="h-4 w-4" /> Print Payslip</Button>
              <Button onClick={() => window.print()} className="flex items-center gap-1.5"><Download className="h-4 w-4" /> Download PDF</Button>
            </div>

          </div>
        </div>
      )}

    </PageContainer>
  )
}
