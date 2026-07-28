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
import { Printer, Download, CreditCard, Wallet, AlertCircle } from 'lucide-react'

export default function Payslips() {
  const [slips, setSlips] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSlip, setSelectedSlip] = useState(null)

  const fetchPayslips = async () => {
    setLoading(true)
    try {
      const res = await axiosClient.get('/teacher/payslips')
      if (res.data.success) {
        setSlips(res.data.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayslips()
  }, [])

  const printPayslip = () => {
    window.print()
  }

  const columns = [
    {
      header: 'Pay Period',
      accessor: (row) => {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        // Check if row has month and year or payrollId details
        const m = row.payrollId?.month || 7 // Fallback to July
        const y = row.payrollId?.year || 2026 // Fallback to 2026
        return <span className="font-bold text-foreground">{monthNames[m - 1]} {y}</span>
      }
    },
    {
      header: 'Basic Salary',
      accessor: (row) => `$${row.basicSalary}`
    },
    {
      header: 'Allowances / Bonuses',
      accessor: (row) => `$${(row.allowancesAmount || 0) + (row.bonusesAmount || 0)}`
    },
    {
      header: 'Deductions',
      accessor: (row) => `$${row.deductionsAmount}`
    },
    {
      header: 'Net Salary',
      accessor: (row) => <span className="text-emerald-600 font-bold">${row.netSalary}</span>
    },
    {
      header: 'Payment Status',
      accessor: (row) => (
        <Badge className={row.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold' : 'bg-amber-50 text-amber-600 border border-amber-100 font-bold'}>
          {row.status}
        </Badge>
      )
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <button
          onClick={() => setSelectedSlip(row)}
          className="text-primary hover:underline font-bold text-xs p-1 cursor-pointer hover:bg-muted rounded"
        >
          View Payslip
        </button>
      )
    }
  ]

  // Calculate quick indicators
  const latestSlip = slips[0]

  return (
    <PageContainer>
      <PageHeader
        title="My Payslips & Payroll Ledger"
        subtitle="Track monthly compensation payouts, allowances, tax withholdings, and bonus incentives."
      />

      {latestSlip && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {/* Net Pay */}
          <div className="bg-card border border-border p-5 rounded-2xl shadow-sm hover:shadow transition duration-200">
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Latest Net Salary</p>
            <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">${latestSlip.netSalary}</h3>
            <p className="text-[10px] text-muted-foreground mt-2">Disbursed on {latestSlip.paymentDate ? new Date(latestSlip.paymentDate).toLocaleDateString() : 'N/A'}</p>
          </div>

          {/* Gross Pay */}
          <div className="bg-card border border-border p-5 rounded-2xl shadow-sm hover:shadow transition duration-200">
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Gross Base Salary</p>
            <h3 className="text-2xl font-extrabold text-foreground mt-1">${latestSlip.grossSalary}</h3>
            <p className="text-[10px] text-muted-foreground mt-2">Includes base salary and HRA</p>
          </div>

          {/* Deductions */}
          <div className="bg-card border border-border p-5 rounded-2xl shadow-sm hover:shadow transition duration-200">
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Tax & Deductions</p>
            <h3 className="text-2xl font-extrabold text-rose-600 mt-1">${latestSlip.deductionsAmount}</h3>
            <p className="text-[10px] text-muted-foreground mt-2">PF, Professional tax, income withholdings</p>
          </div>

          {/* Payment Method */}
          <div className="bg-card border border-border p-5 rounded-2xl shadow-sm hover:shadow transition duration-200">
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Payment Method</p>
            <h3 className="text-2xl font-extrabold text-primary capitalize mt-1">{latestSlip.paymentMethod?.replace('_', ' ') || 'Bank Transfer'}</h3>
            <p className="text-[10px] text-muted-foreground mt-2">Direct bank deposits</p>
          </div>
        </div>
      )}

      {loading ? (
        <SkeletonLoader count={4} className="h-14" />
      ) : slips.length === 0 ? (
        <div className="p-6 bg-card border border-border rounded-2xl text-center">
          <p className="text-muted-foreground text-sm font-semibold">No payslips generated yet in this session.</p>
        </div>
      ) : (
        <SimpleCard title="Monthly payslips roster logs">
          <ReusableTable columns={columns} data={slips} />
        </SimpleCard>
      )}

      {/* View Payslip Modal */}
      {selectedSlip && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border shadow-lg rounded-2xl max-w-xl w-full p-6 relative animate-in fade-in zoom-in-95 duration-150 text-xs font-semibold leading-relaxed">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-foreground">Monthly Payout Statement</h3>
              <div className="flex gap-2">
                <button
                  onClick={printPayslip}
                  className="px-2.5 py-1.5 border border-input rounded-xl hover:bg-muted text-foreground flex items-center gap-1 cursor-pointer font-bold"
                >
                  <Printer className="h-3.5 w-3.5" /> Print
                </button>
                <button
                  onClick={() => setSelectedSlip(null)}
                  className="px-2.5 py-1.5 bg-primary text-primary-foreground rounded-xl flex items-center justify-center cursor-pointer font-bold"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 border border-border bg-muted/20 rounded-xl grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground uppercase text-[9px] mb-0.5">Employee Name</p>
                  <p className="text-foreground text-sm font-bold">{selectedSlip.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground uppercase text-[9px] mb-0.5">Employee Code</p>
                  <p className="text-foreground text-sm font-bold">{selectedSlip.employeeId}</p>
                </div>
                <div>
                  <p className="text-muted-foreground uppercase text-[9px] mb-0.5">Department</p>
                  <p className="text-foreground font-bold">{selectedSlip.department}</p>
                </div>
                <div>
                  <p className="text-muted-foreground uppercase text-[9px] mb-0.5">Designation</p>
                  <p className="text-foreground font-bold">{selectedSlip.designation}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Allowances list */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-emerald-600 border-b border-border pb-1">Allowances & Earnings</h4>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Basic Pay</span>
                    <span className="text-foreground">${selectedSlip.basicSalary}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">HRA</span>
                    <span className="text-foreground">${selectedSlip.hra}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">DA</span>
                    <span className="text-foreground">${selectedSlip.da}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Medical Allowance</span>
                    <span className="text-foreground">${selectedSlip.medicalAllowance}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-border pt-1">
                    <span className="text-foreground">Gross Earnings</span>
                    <span className="text-foreground">${selectedSlip.grossSalary}</span>
                  </div>
                </div>

                {/* Deductions list */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-rose-600 border-b border-border pb-1">Deductions & Withholdings</h4>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">PF Contribution</span>
                    <span className="text-foreground">${selectedSlip.pf}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ESI Contribution</span>
                    <span className="text-foreground">${selectedSlip.esi}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Professional Tax</span>
                    <span className="text-foreground">${selectedSlip.profTax}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Income Tax (TDS)</span>
                    <span className="text-foreground">${selectedSlip.incomeTax}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-border pt-1">
                    <span className="text-foreground">Gross Deductions</span>
                    <span className="text-rose-600">${selectedSlip.deductionsAmount}</span>
                  </div>
                </div>
              </div>

              {/* Net payout footer banner */}
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex justify-between items-center mt-6">
                <div>
                  <h4 className="text-emerald-800 text-xs font-bold">Net salary disbursed</h4>
                  <p className="text-[10px] text-emerald-700">Bank Transfer Account Deposit</p>
                </div>
                <h3 className="text-2xl font-extrabold text-emerald-600">${selectedSlip.netSalary}</h3>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  )
}
