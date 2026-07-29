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
import { Printer, Download, CreditCard, Wallet, Coins, Percent } from 'lucide-react'

export default function Payslips() {
  const [payslips, setPayslips] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchPayslips = async () => {
    setLoading(true)
    try {
      const res = await axiosClient.get('/teacher/payslips')
      if (res.data.success) {
        setPayslips(res.data.data)
      }
    } catch (err) {
      console.error('Error fetching teacher payslips:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayslips()
  }, [])

  const columns = [
    {
      header: 'Statement Month',
      accessor: (row) => {
        // Formats date or shows month string
        const date = new Date(row.paymentDate || row.createdAt)
        return (
          <span className="font-bold text-foreground text-xs">
            {date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </span>
        )
      }
    },
    {
      header: 'Gross Salary',
      accessor: (row) => `$${row.grossSalary || row.basicSalary || 0}`
    },
    {
      header: 'Deductions',
      accessor: (row) => (
        <span className="text-rose-600 font-bold">
          -${row.deductionsAmount || 0}
        </span>
      )
    },
    {
      header: 'Net Salary',
      accessor: (row) => (
        <span className="text-emerald-600 font-bold text-sm">
          ${row.netSalary || 0}
        </span>
      )
    },
    {
      header: 'Method',
      accessor: (row) => (
        <span className="capitalize text-xs font-semibold text-muted-foreground">
          {row.paymentMethod?.replace('_', ' ') || 'Bank Transfer'}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: (row) => (
        <Badge className={row.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold' : 'bg-amber-50 text-amber-600 border border-amber-100 font-bold'}>
          {row.status}
        </Badge>
      )
    },
    {
      header: 'Print File',
      accessor: (row) => (
        <button
          onClick={() => window.print()}
          className="text-primary hover:underline text-xs font-bold flex items-center gap-1.5 cursor-pointer"
        >
          <Printer className="h-3.5 w-3.5" /> Print Statement
        </button>
      )
    }
  ]

  // Get active payslip summary (e.g. latest paid)
  const latestPayslip = payslips.length > 0 ? payslips[0] : null

  return (
    <PageContainer>
      <PageHeader
        title="Payslips & Payroll history"
        subtitle="Access salary ledger accounts, income breakdown distributions, and tax deduction sheets."
      />

      {latestPayslip && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-6">
          {/* Net Salary KPI */}
          <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Wallet className="h-4 w-4 text-emerald-500" /> Net Salary
            </p>
            <h3 className="text-3xl font-black text-emerald-600 mt-1.5">${latestPayslip.netSalary}</h3>
            <p className="text-[10px] text-muted-foreground mt-1">Disbursed to bank account</p>
          </div>

          {/* Basic Salary */}
          <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <CreditCard className="h-4 w-4 text-primary" /> Gross Salary
            </p>
            <h3 className="text-3xl font-black text-foreground mt-1.5">${latestPayslip.grossSalary}</h3>
            <p className="text-[10px] text-muted-foreground mt-1">Base package + allowances</p>
          </div>

          {/* Allowances */}
          <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Coins className="h-4 w-4 text-amber-500" /> Allowances
            </p>
            <h3 className="text-3xl font-black text-amber-600 mt-1.5">${latestPayslip.allowancesAmount || 0}</h3>
            <p className="text-[10px] text-muted-foreground mt-1">HRA, DA, Medical, Transit</p>
          </div>

          {/* Deductions */}
          <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Percent className="h-4 w-4 text-rose-500" /> Deductions
            </p>
            <h3 className="text-3xl font-black text-rose-600 mt-1.5">-${latestPayslip.deductionsAmount || 0}</h3>
            <p className="text-[10px] text-muted-foreground mt-1">Provident fund, tax, leaves</p>
          </div>
        </div>
      )}

      {loading ? (
        <SkeletonLoader count={4} className="h-14 mb-4" />
      ) : payslips.length === 0 ? (
        <div className="p-6 bg-card border border-border rounded-2xl text-center">
          <p className="text-muted-foreground text-sm font-semibold">No payslip records generated yet.</p>
        </div>
      ) : (
        <SimpleCard title="Payslips history registry">
          <ReusableTable columns={columns} data={payslips} />
        </SimpleCard>
      )}
    </PageContainer>
  )
}
