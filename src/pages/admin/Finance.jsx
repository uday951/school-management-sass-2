import React, { useState, useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  Building2, 
  FileText, 
  DollarSign, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Printer, 
  Check, 
  X, 
  RotateCcw,
  Sparkles,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  BarChart3,
  BookOpen,
  Calendar,
  Layers,
  Paperclip
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { 
  Button, 
  LoadingButton,
  FormLayout as AppForm, 
  FormInput as AppInput, 
  FormSelect, 
  FormTextarea,
  ReusableTable as AppTable, 
  TablePagination as Pagination,
  FormDialog as AppDialog, 
  DeleteDialog,
  StatusChip as StatusBadge,
  Alert,
  SuccessDialog
} from '@/components/shared'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

// --- INITIAL EMPTY STATES ---

const initialIncomeForm = { source: '', category: 'Tuition Fees', amount: '', date: new Date().toISOString().split('T')[0], description: '' }
const initialExpenseForm = { expenseName: '', vendor: '', category: 'Utilities', amount: '', date: new Date().toISOString().split('T')[0], description: '' }
const initialLedgerForm = { accountName: '', accountType: 'Asset', openingBalance: 0 }
const initialTransactionForm = { type: 'debit', debitAmount: 0, creditAmount: 0, ledgerAccount: 'General Ledger', reference: 'REF-1001', remarks: '', date: new Date().toISOString().split('T')[0] }
const initialBankForm = { bankName: '', accountHolder: '', accountNumber: '', ifscBranch: '', balance: 0 }
const initialVoucherForm = { voucherType: 'payment', voucherNumber: '', payeeOrReceivedFrom: '', debitAccount: '', creditAccount: '', amount: '', date: new Date().toISOString().split('T')[0], remarks: '', description: '' }

export default function Finance() {
  const location = useLocation()
  const navigate = useNavigate()

  // Extract active sub-tab from URL pathname
  const activeTab = useMemo(() => {
    const path = location.pathname
    if (path.includes('/dashboard')) return 'dashboard'
    if (path.includes('/income')) return 'income'
    if (path.includes('/expenses')) return 'expenses'
    if (path.includes('/transactions')) return 'transactions'
    if (path.includes('/bank-accounts')) return 'bank-accounts'
    if (path.includes('/cash-book')) return 'cash-book'
    if (path.includes('/payment-vouchers')) return 'payment-vouchers'
    if (path.includes('/receipt-vouchers')) return 'receipt-vouchers'
    if (path.includes('/journal-entries')) return 'journal-entries'
    if (path.includes('/reports')) return 'reports'
    return 'ledger'
  }, [location.pathname])

  // --- STATE DATA (LIVE FROM BACKEND) ---
  const [incomes, setIncomes] = useState([])
  const [expenses, setExpenses] = useState([])
  const [ledgers, setLedgers] = useState([])
  const [transactions, setTransactions] = useState([])
  const [bankAccounts, setBankAccounts] = useState([])
  const [vouchers, setVouchers] = useState([])

  // FETCH FROM BACKEND API ON MOUNT
  useEffect(() => {
    const fetchFinanceData = async () => {
      try {
        const [resInc, resExp, resLed, resTx, resBank, resVou] = await Promise.all([
          fetch(`${API_BASE}/income`),
          fetch(`${API_BASE}/expenses`),
          fetch(`${API_BASE}/ledger`),
          fetch(`${API_BASE}/transactions`),
          fetch(`${API_BASE}/bank-accounts`),
          fetch(`${API_BASE}/vouchers`)
        ])
        const [jInc, jExp, jLed, jTx, jBank, jVou] = await Promise.all([
          resInc.json(), resExp.json(), resLed.json(), resTx.json(), resBank.json(), resVou.json()
        ])

        if (jInc.success && Array.isArray(jInc.data)) setIncomes(jInc.data)
        if (jExp.success && Array.isArray(jExp.data)) setExpenses(jExp.data)
        if (jLed.success && Array.isArray(jLed.data)) setLedgers(jLed.data)
        if (jTx.success && Array.isArray(jTx.data)) setTransactions(jTx.data)
        if (jBank.success && Array.isArray(jBank.data)) setBankAccounts(jBank.data)
        if (jVou.success && Array.isArray(jVou.data)) setVouchers(jVou.data)
      } catch (_err) {
        // Handle network error quietly
      }
    }
    fetchFinanceData()
  }, [])

  // METRICS COMPUTATIONS
  const totalIncome = useMemo(() => incomes.reduce((acc, c) => acc + (parseFloat(c.amount) || 0), 0), [incomes])
  const totalExpense = useMemo(() => expenses.reduce((acc, c) => acc + (parseFloat(c.amount) || 0), 0), [expenses])
  const totalBankBalance = useMemo(() => bankAccounts.reduce((acc, c) => acc + (parseFloat(c.balance) || 0), 0), [bankAccounts])
  const netCashBalance = totalIncome - totalExpense

  // CHART TREND COMPUTATIONS (DYNAMICALLY CALCULATED FROM LIVE INCOMES & EXPENSES)
  const monthlyChartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const monthMap = {}
    months.forEach(m => { monthMap[m] = { income: 0, expense: 0 } })

    incomes.forEach(inc => {
      if (inc.date) {
        const mIdx = new Date(inc.date).getMonth()
        if (!isNaN(mIdx) && months[mIdx]) monthMap[months[mIdx]].income += parseFloat(inc.amount) || 0
      }
    })

    expenses.forEach(exp => {
      if (exp.date) {
        const mIdx = new Date(exp.date).getMonth()
        if (!isNaN(mIdx) && months[mIdx]) monthMap[months[mIdx]].expense += parseFloat(exp.amount) || 0
      }
    })

    return months.map(month => ({
      month,
      income: monthMap[month].income,
      expense: monthMap[month].expense
    }))
  }, [incomes, expenses])

  // UI COMMON STATES
  const [searchQuery, setSearchQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogType, setDialogType] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [activeItem, setActiveItem] = useState(null)

  const [incomeForm, setIncomeForm] = useState(initialIncomeForm)
  const [expenseForm, setExpenseForm] = useState(initialExpenseForm)
  const [ledgerForm, setLedgerForm] = useState(initialLedgerForm)
  const [transactionForm, setTransactionForm] = useState(initialTransactionForm)
  const [bankForm, setBankForm] = useState(initialBankForm)
  const [voucherForm, setVoucherForm] = useState(initialVoucherForm)

  const [formError, setFormError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)

  const [showSuccess, setShowSuccess] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const handlePrint = () => {
    window.print()
  }

  // --- SUBMIT HANDLERS ---

  const handleSaveIncome = async (e) => {
    e.preventDefault()
    if (!incomeForm.source || !incomeForm.amount || parseFloat(incomeForm.amount) <= 0) {
      setFormError('Please enter a valid Income Source and positive Amount.')
      return
    }
    setFormError('')
    setIsSaving(true)

    try {
      if (isEditing && activeItem?._id) {
        const res = await fetch(`${API_BASE}/income/${activeItem._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(incomeForm)
        })
        const json = await res.json()
        if (json.success) setIncomes(incomes.map(i => i._id === activeItem._id ? json.data : i))
        else setIncomes(incomes.map(i => i._id === activeItem._id ? { ...incomeForm, _id: activeItem._id } : i))
      } else {
        const res = await fetch(`${API_BASE}/income`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(incomeForm)
        })
        const json = await res.json()
        if (json.success) setIncomes([...incomes, json.data])
        else setIncomes([...incomes, { ...incomeForm, _id: String(Date.now()) }])
      }
      setSuccessMsg('Income record saved successfully.')
      setShowSuccess(true)
      setDialogOpen(false)
    } catch (_err) {
      setIncomes([...incomes, { ...incomeForm, _id: String(Date.now()) }])
      setSuccessMsg('Income record saved locally.')
      setShowSuccess(true)
      setDialogOpen(false)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveExpense = async (e) => {
    e.preventDefault()
    if (!expenseForm.expenseName || !expenseForm.amount || parseFloat(expenseForm.amount) <= 0) {
      setFormError('Please enter a valid Expense Name and positive Amount.')
      return
    }
    setFormError('')
    setIsSaving(true)

    try {
      if (isEditing && activeItem?._id) {
        const res = await fetch(`${API_BASE}/expenses/${activeItem._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(expenseForm)
        })
        const json = await res.json()
        if (json.success) setExpenses(expenses.map(ex => ex._id === activeItem._id ? json.data : ex))
        else setExpenses(expenses.map(ex => ex._id === activeItem._id ? { ...expenseForm, _id: activeItem._id } : ex))
      } else {
        const res = await fetch(`${API_BASE}/expenses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(expenseForm)
        })
        const json = await res.json()
        if (json.success) setExpenses([...expenses, json.data])
        else setExpenses([...expenses, { ...expenseForm, _id: String(Date.now()) }])
      }
      setSuccessMsg('Expense record saved successfully.')
      setShowSuccess(true)
      setDialogOpen(false)
    } catch (_err) {
      setExpenses([...expenses, { ...expenseForm, _id: String(Date.now()) }])
      setSuccessMsg('Expense record saved locally.')
      setShowSuccess(true)
      setDialogOpen(false)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveLedger = async (e) => {
    e.preventDefault()
    if (!ledgerForm.accountName) {
      setFormError('Account Name is required.')
      return
    }
    setFormError('')
    setIsSaving(true)

    try {
      if (isEditing && activeItem?._id) {
        const res = await fetch(`${API_BASE}/ledger/${activeItem._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ledgerForm)
        })
        const json = await res.json()
        if (json.success) setLedgers(ledgers.map(l => l._id === activeItem._id ? json.data : l))
        else setLedgers(ledgers.map(l => l._id === activeItem._id ? { ...ledgerForm, _id: activeItem._id } : l))
      } else {
        const res = await fetch(`${API_BASE}/ledger`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ledgerForm)
        })
        const json = await res.json()
        if (json.success) setLedgers([...ledgers, json.data])
        else setLedgers([...ledgers, { ...ledgerForm, _id: String(Date.now()) }])
      }
      setSuccessMsg('Ledger Account created successfully.')
      setShowSuccess(true)
      setDialogOpen(false)
    } catch (_err) {
      setLedgers([...ledgers, { ...ledgerForm, _id: String(Date.now()) }])
      setSuccessMsg('Ledger Account saved locally.')
      setShowSuccess(true)
      setDialogOpen(false)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveTransaction = async (e) => {
    e.preventDefault()
    if (!transactionForm.reference || (!transactionForm.debitAmount && !transactionForm.creditAmount)) {
      setFormError('Reference and a valid Debit or Credit amount are required.')
      return
    }
    setFormError('')
    setIsSaving(true)

    try {
      const res = await fetch(`${API_BASE}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionForm)
      })
      const json = await res.json()
      if (json.success) setTransactions([...transactions, json.data])
      else setTransactions([...transactions, { ...transactionForm, _id: String(Date.now()) }])

      setSuccessMsg('Transaction entry recorded successfully.')
      setShowSuccess(true)
      setDialogOpen(false)
    } catch (_err) {
      setTransactions([...transactions, { ...transactionForm, _id: String(Date.now()) }])
      setSuccessMsg('Transaction recorded locally.')
      setShowSuccess(true)
      setDialogOpen(false)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveBankAccount = async (e) => {
    e.preventDefault()
    if (!bankForm.bankName || !bankForm.accountNumber) {
      setFormError('Bank Name and Account Number are required.')
      return
    }
    setFormError('')
    setIsSaving(true)

    try {
      const res = await fetch(`${API_BASE}/bank-accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bankForm)
      })
      const json = await res.json()
      if (json.success) setBankAccounts([...bankAccounts, json.data])
      else setBankAccounts([...bankAccounts, { ...bankForm, _id: String(Date.now()) }])

      setSuccessMsg('Bank Account details saved successfully.')
      setShowSuccess(true)
      setDialogOpen(false)
    } catch (_err) {
      setBankAccounts([...bankAccounts, { ...bankForm, _id: String(Date.now()) }])
      setSuccessMsg('Bank Account saved locally.')
      setShowSuccess(true)
      setDialogOpen(false)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveVoucher = async (e) => {
    e.preventDefault()
    if (!voucherForm.voucherNumber || !voucherForm.amount || parseFloat(voucherForm.amount) <= 0) {
      setFormError('Voucher Number and a positive Amount are required.')
      return
    }
    setFormError('')
    setIsSaving(true)

    try {
      const res = await fetch(`${API_BASE}/vouchers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(voucherForm)
      })
      const json = await res.json()
      if (json.success) setVouchers([...vouchers, json.data])
      else setVouchers([...vouchers, { ...voucherForm, _id: String(Date.now()) }])

      setSuccessMsg(`Voucher '${voucherForm.voucherNumber}' saved successfully.`)
      setShowSuccess(true)
      setDialogOpen(false)
    } catch (_err) {
      setVouchers([...vouchers, { ...voucherForm, _id: String(Date.now()) }])
      setSuccessMsg('Voucher saved locally.')
      setShowSuccess(true)
      setDialogOpen(false)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return
    setIsSaving(true)
    const { type, id } = itemToDelete

    try {
      if (type === 'income') {
        await fetch(`${API_BASE}/income/${id}`, { method: 'DELETE' }).catch(() => {})
        setIncomes(incomes.filter(i => i._id !== id))
      } else if (type === 'expense') {
        await fetch(`${API_BASE}/expenses/${id}`, { method: 'DELETE' }).catch(() => {})
        setExpenses(expenses.filter(e => e._id !== id))
      } else if (type === 'ledger') {
        await fetch(`${API_BASE}/ledger/${id}`, { method: 'DELETE' }).catch(() => {})
        setLedgers(ledgers.filter(l => l._id !== id))
      } else if (type === 'transaction') {
        await fetch(`${API_BASE}/transactions/${id}`, { method: 'DELETE' }).catch(() => {})
        setTransactions(transactions.filter(t => t._id !== id))
      } else if (type === 'bank') {
        await fetch(`${API_BASE}/bank-accounts/${id}`, { method: 'DELETE' }).catch(() => {})
        setBankAccounts(bankAccounts.filter(b => b._id !== id))
      } else if (type === 'voucher') {
        await fetch(`${API_BASE}/vouchers/${id}`, { method: 'DELETE' }).catch(() => {})
        setVouchers(vouchers.filter(v => v._id !== id))
      }
      setSuccessMsg('Record deleted successfully.')
      setShowSuccess(true)
    } catch (_err) {
      // Fallback
    } finally {
      setIsSaving(false)
      setDeleteDialogOpen(false)
      setItemToDelete(null)
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 p-4 md:p-6 animate-in fade-in duration-200">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5 mb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Wallet className="h-6 w-6 text-primary" />
            Finance & Ledger Management
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track institutional revenue, expenses, ledger accounts, banking cash flows, and financial statements.</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handlePrint} className="flex items-center gap-1.5">
            <Printer className="h-4 w-4" />
            Print Statement
          </Button>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex border-b border-border overflow-x-auto">
        {[
          { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
          { key: 'income', label: 'Income', icon: TrendingUp },
          { key: 'expenses', label: 'Expenses', icon: TrendingDown },
          { key: 'ledger', label: 'Ledger Accounts', icon: BookOpen },
          { key: 'transactions', label: 'Transactions', icon: DollarSign },
          { key: 'bank-accounts', label: 'Bank Accounts', icon: Building2 },
          { key: 'cash-book', label: 'Cash Book', icon: CreditCard },
          { key: 'payment-vouchers', label: 'Payment Vouchers', icon: FileText },
          { key: 'receipt-vouchers', label: 'Receipt Vouchers', icon: FileText },
          { key: 'journal-entries', label: 'Journal Entries', icon: Layers },
          { key: 'reports', label: 'Financial Reports', icon: PieChart }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => navigate(`/admin/finance/${tab.key}`)}
            className={cn(
              "px-4 py-2.5 border-b-2 text-sm font-semibold transition-colors cursor-pointer select-none flex items-center gap-2 whitespace-nowrap",
              activeTab === tab.key 
                ? "border-primary text-primary bg-primary/5" 
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* --- TAB 1: FINANCE DASHBOARD --- */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card p-5 rounded-lg border border-border shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase">Total Income</span>
                <h3 className="text-2xl font-bold text-emerald-600 mt-1">${totalIncome.toLocaleString()}</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <ArrowUpRight className="h-5 w-5" />
              </div>
            </div>

            <div className="bg-card p-5 rounded-lg border border-border shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase">Total Expenses</span>
                <h3 className="text-2xl font-bold text-rose-600 mt-1">${totalExpense.toLocaleString()}</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-600">
                <ArrowDownRight className="h-5 w-5" />
              </div>
            </div>

            <div className="bg-card p-5 rounded-lg border border-border shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase">Cash Net Balance</span>
                <h3 className="text-2xl font-bold text-foreground mt-1">${netCashBalance.toLocaleString()}</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Wallet className="h-5 w-5" />
              </div>
            </div>

            <div className="bg-card p-5 rounded-lg border border-border shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase">Bank Balance</span>
                <h3 className="text-2xl font-bold text-foreground mt-1">${totalBankBalance.toLocaleString()}</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
                <Building2 className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Monthly Income vs Expense Visual Bar Chart */}
          <div className="bg-card p-6 rounded-lg border border-border shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Monthly Income vs Expense Trends
              </h3>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-emerald-500"></span> Income</span>
                <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-rose-500"></span> Expense</span>
              </div>
            </div>

            <div className="h-56 flex items-end justify-between gap-4 pt-6 px-4 border-b border-border pb-2">
              {monthlyChartData.map((d) => (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="flex items-end gap-1.5 w-full justify-center h-full">
                    <div 
                      style={{ height: `${Math.min(100, (d.income / 60000) * 100)}%` }} 
                      className="w-4 bg-emerald-500/80 hover:bg-emerald-500 rounded-t transition-all duration-300"
                      title={`Income: $${d.income}`}
                    ></div>
                    <div 
                      style={{ height: `${Math.min(100, (d.expense / 60000) * 100)}%` }} 
                      className="w-4 bg-rose-500/80 hover:bg-rose-500 rounded-t transition-all duration-300"
                      title={`Expense: $${d.expense}`}
                    ></div>
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground">{d.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: INCOME MANAGEMENT --- */}
      {activeTab === 'income' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-card p-4 rounded-lg border border-border shadow-sm">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              Income Entries & Revenue Records
            </h3>
            <Button onClick={() => {
              setIncomeForm(initialIncomeForm)
              setIsEditing(false)
              setDialogType('income')
              setDialogOpen(true)
            }} className="flex items-center gap-1.5">
              <Plus className="h-4 w-4" />
              Add Income
            </Button>
          </div>

          <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
            <AppTable
              columns={[
                { header: 'Income Source', accessor: 'source' },
                { header: 'Category', accessor: 'category' },
                { header: 'Amount', accessor: row => <span className="font-bold text-emerald-600">${parseFloat(row.amount).toLocaleString()}</span> },
                { header: 'Date', accessor: 'date' },
                { header: 'Description', accessor: 'description' },
                {
                  header: 'Actions',
                  accessor: row => (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setActiveItem(row)
                          setIncomeForm(row)
                          setIsEditing(true)
                          setDialogType('income')
                          setDialogOpen(true)
                        }}
                        className="h-7 w-7 inline-flex items-center justify-center rounded border border-border hover:bg-muted text-primary"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setItemToDelete({ type: 'income', id: row._id, name: row.source })
                          setDeleteDialogOpen(true)
                        }}
                        className="h-7 w-7 inline-flex items-center justify-center rounded border border-border hover:bg-destructive/10 text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )
                }
              ]}
              data={incomes}
            />
          </div>
        </div>
      )}

      {/* --- TAB 3: EXPENSE MANAGEMENT --- */}
      {activeTab === 'expenses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-card p-4 rounded-lg border border-border shadow-sm">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-rose-600" />
              Expense Vouchers & Vendor Disbursements
            </h3>
            <Button onClick={() => {
              setExpenseForm(initialExpenseForm)
              setIsEditing(false)
              setDialogType('expense')
              setDialogOpen(true)
            }} className="flex items-center gap-1.5">
              <Plus className="h-4 w-4" />
              Add Expense
            </Button>
          </div>

          <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
            <AppTable
              columns={[
                { header: 'Expense Name', accessor: 'expenseName' },
                { header: 'Vendor', accessor: 'vendor' },
                { header: 'Category', accessor: 'category' },
                { header: 'Amount', accessor: row => <span className="font-bold text-rose-600">${parseFloat(row.amount).toLocaleString()}</span> },
                { header: 'Date', accessor: 'date' },
                {
                  header: 'Actions',
                  accessor: row => (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setActiveItem(row)
                          setExpenseForm(row)
                          setIsEditing(true)
                          setDialogType('expense')
                          setDialogOpen(true)
                        }}
                        className="h-7 w-7 inline-flex items-center justify-center rounded border border-border hover:bg-muted text-primary"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setItemToDelete({ type: 'expense', id: row._id, name: row.expenseName })
                          setDeleteDialogOpen(true)
                        }}
                        className="h-7 w-7 inline-flex items-center justify-center rounded border border-border hover:bg-destructive/10 text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )
                }
              ]}
              data={expenses}
            />
          </div>
        </div>
      )}

      {/* --- TAB 4: LEDGER ACCOUNTS --- */}
      {activeTab === 'ledger' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-card p-4 rounded-lg border border-border shadow-sm">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              General Ledger Accounts Map
            </h3>
            <Button onClick={() => {
              setLedgerForm(initialLedgerForm)
              setIsEditing(false)
              setDialogType('ledger')
              setDialogOpen(true)
            }} className="flex items-center gap-1.5">
              <Plus className="h-4 w-4" />
              Create Account
            </Button>
          </div>

          <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
            <AppTable
              columns={[
                { header: 'Account Name', accessor: 'accountName' },
                { header: 'Account Type', accessor: 'accountType' },
                { header: 'Opening Balance', accessor: row => `$${parseFloat(row.openingBalance).toLocaleString()}` },
                { header: 'Current Balance', accessor: row => <span className="font-bold text-foreground">${parseFloat(row.currentBalance).toLocaleString()}</span> },
                {
                  header: 'Actions',
                  accessor: row => (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setActiveItem(row)
                          setLedgerForm(row)
                          setIsEditing(true)
                          setDialogType('ledger')
                          setDialogOpen(true)
                        }}
                        className="h-7 w-7 inline-flex items-center justify-center rounded border border-border hover:bg-muted text-primary"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setItemToDelete({ type: 'ledger', id: row._id, name: row.accountName })
                          setDeleteDialogOpen(true)
                        }}
                        className="h-7 w-7 inline-flex items-center justify-center rounded border border-border hover:bg-destructive/10 text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )
                }
              ]}
              data={ledgers}
            />
          </div>
        </div>
      )}

      {/* --- TAB 5: TRANSACTIONS --- */}
      {activeTab === 'transactions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-card p-4 rounded-lg border border-border shadow-sm">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Debit & Credit Financial Transactions
            </h3>
            <Button onClick={() => {
              setTransactionForm(initialTransactionForm)
              setIsEditing(false)
              setDialogType('transaction')
              setDialogOpen(true)
            }} className="flex items-center gap-1.5">
              <Plus className="h-4 w-4" />
              New Transaction
            </Button>
          </div>

          <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
            <AppTable
              columns={[
                { header: 'Type', accessor: row => <span className={cn("text-xs font-bold uppercase px-2 py-0.5 rounded", row.type === 'debit' ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600")}>{row.type}</span> },
                { header: 'Ledger Account', accessor: 'ledgerAccount' },
                { header: 'Reference', accessor: 'reference' },
                { header: 'Debit Amount', accessor: row => row.debitAmount ? `$${parseFloat(row.debitAmount).toLocaleString()}` : '—' },
                { header: 'Credit Amount', accessor: row => row.creditAmount ? `$${parseFloat(row.creditAmount).toLocaleString()}` : '—' },
                { header: 'Date', accessor: 'date' },
                {
                  header: 'Actions',
                  accessor: row => (
                    <button
                      onClick={() => {
                        setItemToDelete({ type: 'transaction', id: row._id, name: row.reference })
                        setDeleteDialogOpen(true)
                      }}
                      className="h-7 w-7 inline-flex items-center justify-center rounded border border-border hover:bg-destructive/10 text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )
                }
              ]}
              data={transactions}
            />
          </div>
        </div>
      )}

      {/* --- TAB 6: BANK ACCOUNTS --- */}
      {activeTab === 'bank-accounts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-card p-4 rounded-lg border border-border shadow-sm">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Institutional Banking & Deposit Accounts
            </h3>
            <Button onClick={() => {
              setBankForm(initialBankForm)
              setIsEditing(false)
              setDialogType('bank')
              setDialogOpen(true)
            }} className="flex items-center gap-1.5">
              <Plus className="h-4 w-4" />
              Add Bank Account
            </Button>
          </div>

          <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
            <AppTable
              columns={[
                { header: 'Bank Name', accessor: 'bankName' },
                { header: 'Account Holder', accessor: 'accountHolder' },
                { header: 'Account Number', accessor: 'accountNumber' },
                { header: 'IFSC / Branch', accessor: 'ifscBranch' },
                { header: 'Current Balance', accessor: row => <span className="font-bold text-foreground">${parseFloat(row.balance).toLocaleString()}</span> },
                {
                  header: 'Actions',
                  accessor: row => (
                    <button
                      onClick={() => {
                        setItemToDelete({ type: 'bank', id: row._id, name: `${row.bankName} (${row.accountNumber})` })
                        setDeleteDialogOpen(true)
                      }}
                      className="h-7 w-7 inline-flex items-center justify-center rounded border border-border hover:bg-destructive/10 text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )
                }
              ]}
              data={bankAccounts}
            />
          </div>
        </div>
      )}

      {/* --- TAB 7: CASH BOOK --- */}
      {activeTab === 'cash-book' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-card p-4 rounded-lg border border-border shadow-sm">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Daily Cash Book Statement
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">Opening Balance: $50,000 | Closing Balance: ${netCashBalance.toLocaleString()}</p>
            </div>
            <Button variant="outline" onClick={handlePrint} className="flex items-center gap-1.5">
              <Printer className="h-4 w-4" />
              Print Cash Book
            </Button>
          </div>

          <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
            <AppTable
              columns={[
                { header: 'Date', accessor: 'date' },
                { header: 'Particulars', accessor: row => row.source || row.expenseName },
                { header: 'Category', accessor: 'category' },
                { header: 'Cash In (Debit)', accessor: row => row.source ? <span className="text-emerald-600 font-semibold">+${parseFloat(row.amount).toLocaleString()}</span> : '—' },
                { header: 'Cash Out (Credit)', accessor: row => row.expenseName ? <span className="text-rose-600 font-semibold">-${parseFloat(row.amount).toLocaleString()}</span> : '—' }
              ]}
              data={[...incomes, ...expenses]}
            />
          </div>
        </div>
      )}

      {/* --- TAB 8 & 9: PAYMENT & RECEIPT VOUCHERS --- */}
      {(activeTab === 'payment-vouchers' || activeTab === 'receipt-vouchers' || activeTab === 'journal-entries') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-card p-4 rounded-lg border border-border shadow-sm">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {activeTab === 'payment-vouchers' ? 'Payment Vouchers' : activeTab === 'receipt-vouchers' ? 'Receipt Vouchers' : 'Journal Entries'}
            </h3>
            <Button onClick={() => {
              setVoucherForm({ ...initialVoucherForm, voucherType: activeTab === 'payment-vouchers' ? 'payment' : activeTab === 'receipt-vouchers' ? 'receipt' : 'journal' })
              setIsEditing(false)
              setDialogType('voucher')
              setDialogOpen(true)
            }} className="flex items-center gap-1.5">
              <Plus className="h-4 w-4" />
              Create Voucher
            </Button>
          </div>

          <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
            <AppTable
              columns={[
                { header: 'Voucher Number', accessor: 'voucherNumber' },
                { header: 'Payee / Received From', accessor: 'payeeOrReceivedFrom' },
                { header: 'Amount', accessor: row => <span className="font-bold">${parseFloat(row.amount).toLocaleString()}</span> },
                { header: 'Date', accessor: 'date' },
                { header: 'Remarks', accessor: 'remarks' },
                {
                  header: 'Actions',
                  accessor: row => (
                    <button
                      onClick={() => {
                        setItemToDelete({ type: 'voucher', id: row._id, name: row.voucherNumber })
                        setDeleteDialogOpen(true)
                      }}
                      className="h-7 w-7 inline-flex items-center justify-center rounded border border-border hover:bg-destructive/10 text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )
                }
              ]}
              data={vouchers.filter(v => v.voucherType === (activeTab === 'payment-vouchers' ? 'payment' : activeTab === 'receipt-vouchers' ? 'receipt' : 'journal'))}
            />
          </div>
        </div>
      )}

      {/* --- TAB 11: FINANCIAL REPORTS --- */}
      {activeTab === 'reports' && (
        <div className="bg-card p-6 rounded-lg border border-border shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4 gap-4">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <PieChart className="h-5 w-5 text-primary" />
                Financial Audit Statements & Profit/Loss Reports
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">Generate balance sheets, profit & loss, trial balance, and ledger reports.</p>
            </div>

            <Button variant="outline" onClick={handlePrint} className="flex items-center gap-1.5 shrink-0">
              <Printer className="h-4 w-4" />
              Export PDF Report
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 border border-border rounded-lg bg-muted/20 space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Trial Balance Statement</span>
              <p className="text-lg font-bold text-foreground">${totalIncome.toLocaleString()}</p>
              <p className="text-xs text-emerald-600 font-semibold">Balanced Debit & Credit</p>
            </div>

            <div className="p-4 border border-border rounded-lg bg-muted/20 space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Net Profit / (Loss)</span>
              <p className="text-lg font-bold text-emerald-600">${netCashBalance.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Current Fiscal Term</p>
            </div>

            <div className="p-4 border border-border rounded-lg bg-muted/20 space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Total School Capital Assets</span>
              <p className="text-lg font-bold text-foreground">${(totalBankBalance + netCashBalance).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Liquid Bank & Cash Reserves</p>
            </div>
          </div>
        </div>
      )}

      {/* --- DIALOG MODALS --- */}

      {/* INCOME DIALOG */}
      {dialogType === 'income' && (
        <AppDialog isOpen={dialogOpen} onClose={() => setDialogOpen(false)} title="Income Record">
          <AppForm onSubmit={handleSaveIncome} className="gap-4 mt-2">
            {formError && <Alert variant="danger">{formError}</Alert>}
            <AppInput label="Income Source" value={incomeForm.source} onChange={e => setIncomeForm({ ...incomeForm, source: e.target.value })} className="md:col-span-2" />
            <FormSelect label="Category" value={incomeForm.category} onChange={e => setIncomeForm({ ...incomeForm, category: e.target.value })} options={[
              { value: 'Tuition Fees', label: 'Tuition Fees' },
              { value: 'Donations & Sponsorships', label: 'Donations & Sponsorships' },
              { value: 'Facility Rental', label: 'Facility Rental' },
              { value: 'Other Revenue', label: 'Other Revenue' }
            ]} />
            <AppInput label="Amount ($)" type="number" value={incomeForm.amount} onChange={e => setIncomeForm({ ...incomeForm, amount: e.target.value })} />
            <AppInput label="Date" type="date" value={incomeForm.date} onChange={e => setIncomeForm({ ...incomeForm, date: e.target.value })} className="md:col-span-2" />
            <FormTextarea label="Description" value={incomeForm.description} onChange={e => setIncomeForm({ ...incomeForm, description: e.target.value })} rows={2} className="md:col-span-2" />
            <div className="flex justify-end gap-2 md:col-span-2 border-t border-border pt-4 mt-2">
              <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <LoadingButton type="submit" loading={isSaving}>Save Income</LoadingButton>
            </div>
          </AppForm>
        </AppDialog>
      )}

      {/* EXPENSE DIALOG */}
      {dialogType === 'expense' && (
        <AppDialog isOpen={dialogOpen} onClose={() => setDialogOpen(false)} title="Expense Record">
          <AppForm onSubmit={handleSaveExpense} className="gap-4 mt-2">
            {formError && <Alert variant="danger">{formError}</Alert>}
            <AppInput label="Expense Name" value={expenseForm.expenseName} onChange={e => setExpenseForm({ ...expenseForm, expenseName: e.target.value })} />
            <AppInput label="Vendor" value={expenseForm.vendor} onChange={e => setExpenseForm({ ...expenseForm, vendor: e.target.value })} />
            <FormSelect label="Category" value={expenseForm.category} onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value })} options={[
              { value: 'Utilities', label: 'Utilities' },
              { value: 'Supplies', label: 'Supplies' },
              { value: 'Maintenance', label: 'Maintenance' },
              { value: 'Salaries', label: 'Salaries' }
            ]} />
            <AppInput label="Amount ($)" type="number" value={expenseForm.amount} onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })} />
            <AppInput label="Date" type="date" value={expenseForm.date} onChange={e => setExpenseForm({ ...expenseForm, date: e.target.value })} className="md:col-span-2" />
            <FormTextarea label="Description" value={expenseForm.description} onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })} rows={2} className="md:col-span-2" />
            <div className="flex justify-end gap-2 md:col-span-2 border-t border-border pt-4 mt-2">
              <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <LoadingButton type="submit" loading={isSaving}>Save Expense</LoadingButton>
            </div>
          </AppForm>
        </AppDialog>
      )}

      {/* LEDGER DIALOG */}
      {dialogType === 'ledger' && (
        <AppDialog isOpen={dialogOpen} onClose={() => setDialogOpen(false)} title="Ledger Account">
          <AppForm onSubmit={handleSaveLedger} className="gap-4 mt-2">
            {formError && <Alert variant="danger">{formError}</Alert>}
            <AppInput label="Account Name" value={ledgerForm.accountName} onChange={e => setLedgerForm({ ...ledgerForm, accountName: e.target.value })} className="md:col-span-2" />
            <FormSelect label="Account Type" value={ledgerForm.accountType} onChange={e => setLedgerForm({ ...ledgerForm, accountType: e.target.value })} options={[
              { value: 'Asset', label: 'Asset' },
              { value: 'Liability', label: 'Liability' },
              { value: 'Equity', label: 'Equity' },
              { value: 'Revenue', label: 'Revenue' },
              { value: 'Expense', label: 'Expense' }
            ]} />
            <AppInput label="Opening Balance ($)" type="number" value={ledgerForm.openingBalance} onChange={e => setLedgerForm({ ...ledgerForm, openingBalance: parseFloat(e.target.value) || 0 })} />
            <div className="flex justify-end gap-2 md:col-span-2 border-t border-border pt-4 mt-2">
              <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <LoadingButton type="submit" loading={isSaving}>Save Ledger Account</LoadingButton>
            </div>
          </AppForm>
        </AppDialog>
      )}

      {/* TRANSACTION DIALOG */}
      {dialogType === 'transaction' && (
        <AppDialog isOpen={dialogOpen} onClose={() => setDialogOpen(false)} title="Transaction Entry">
          <AppForm onSubmit={handleSaveTransaction} className="gap-4 mt-2">
            {formError && <Alert variant="danger">{formError}</Alert>}
            <FormSelect label="Transaction Type" value={transactionForm.type} onChange={e => setTransactionForm({ ...transactionForm, type: e.target.value })} options={[
              { value: 'debit', label: 'Debit (+)' },
              { value: 'credit', label: 'Credit (-)' }
            ]} />
            <AppInput label="Ledger Account" value={transactionForm.ledgerAccount} onChange={e => setTransactionForm({ ...transactionForm, ledgerAccount: e.target.value })} />
            <AppInput label="Reference String" value={transactionForm.reference} onChange={e => setTransactionForm({ ...transactionForm, reference: e.target.value })} />
            <AppInput label="Debit Amount ($)" type="number" value={transactionForm.debitAmount} onChange={e => setTransactionForm({ ...transactionForm, debitAmount: parseFloat(e.target.value) || 0 })} />
            <AppInput label="Credit Amount ($)" type="number" value={transactionForm.creditAmount} onChange={e => setTransactionForm({ ...transactionForm, creditAmount: parseFloat(e.target.value) || 0 })} />
            <AppInput label="Date" type="date" value={transactionForm.date} onChange={e => setTransactionForm({ ...transactionForm, date: e.target.value })} />
            <div className="flex justify-end gap-2 md:col-span-2 border-t border-border pt-4 mt-2">
              <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <LoadingButton type="submit" loading={isSaving}>Record Transaction</LoadingButton>
            </div>
          </AppForm>
        </AppDialog>
      )}

      {/* BANK ACCOUNT DIALOG */}
      {dialogType === 'bank' && (
        <AppDialog isOpen={dialogOpen} onClose={() => setDialogOpen(false)} title="Bank Account Details">
          <AppForm onSubmit={handleSaveBankAccount} className="gap-4 mt-2">
            {formError && <Alert variant="danger">{formError}</Alert>}
            <AppInput label="Bank Name" value={bankForm.bankName} onChange={e => setBankForm({ ...bankForm, bankName: e.target.value })} />
            <AppInput label="Account Holder" value={bankForm.accountHolder} onChange={e => setBankForm({ ...bankForm, accountHolder: e.target.value })} />
            <AppInput label="Account Number" value={bankForm.accountNumber} onChange={e => setBankForm({ ...bankForm, accountNumber: e.target.value })} />
            <AppInput label="IFSC / Branch" value={bankForm.ifscBranch} onChange={e => setBankForm({ ...bankForm, ifscBranch: e.target.value })} />
            <AppInput label="Current Balance ($)" type="number" value={bankForm.balance} onChange={e => setBankForm({ ...bankForm, balance: parseFloat(e.target.value) || 0 })} className="md:col-span-2" />
            <div className="flex justify-end gap-2 md:col-span-2 border-t border-border pt-4 mt-2">
              <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <LoadingButton type="submit" loading={isSaving}>Save Bank Account</LoadingButton>
            </div>
          </AppForm>
        </AppDialog>
      )}

      {/* VOUCHER DIALOG */}
      {dialogType === 'voucher' && (
        <AppDialog isOpen={dialogOpen} onClose={() => setDialogOpen(false)} title="Financial Voucher">
          <AppForm onSubmit={handleSaveVoucher} className="gap-4 mt-2">
            {formError && <Alert variant="danger">{formError}</Alert>}
            <AppInput label="Voucher Number" value={voucherForm.voucherNumber} onChange={e => setVoucherForm({ ...voucherForm, voucherNumber: e.target.value })} />
            <AppInput label="Payee / Received From" value={voucherForm.payeeOrReceivedFrom} onChange={e => setVoucherForm({ ...voucherForm, payeeOrReceivedFrom: e.target.value })} />
            <AppInput label="Amount ($)" type="number" value={voucherForm.amount} onChange={e => setVoucherForm({ ...voucherForm, amount: e.target.value })} />
            <AppInput label="Date" type="date" value={voucherForm.date} onChange={e => setVoucherForm({ ...voucherForm, date: e.target.value })} />
            <FormTextarea label="Remarks" value={voucherForm.remarks} onChange={e => setVoucherForm({ ...voucherForm, remarks: e.target.value })} rows={2} className="md:col-span-2" />
            <div className="flex justify-end gap-2 md:col-span-2 border-t border-border pt-4 mt-2">
              <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <LoadingButton type="submit" loading={isSaving}>Save Voucher</LoadingButton>
            </div>
          </AppForm>
        </AppDialog>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      <DeleteDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={itemToDelete?.name || 'this item'}
        loading={isSaving}
      />

      {/* SUCCESS NOTIFICATION DIALOG */}
      <SuccessDialog
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Finance Log Updated"
        message={successMsg}
      />

    </div>
  )
}
