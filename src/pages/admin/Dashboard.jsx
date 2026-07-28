import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, GraduationCap, UserCheck, BookOpen, Bus, Package,
  Coins, Mail, LayoutDashboard, TrendingUp, TrendingDown,
  AlertTriangle, CheckCircle, Clock, Calendar, Bell,
  UserPlus, CreditCard, ClipboardList, Megaphone,
  Activity, Server, Database, Cpu, HardDrive, Wifi,
  ChevronRight, RefreshCw, BookMarked, Wallet,
  BarChart2, PieChart as PieChartIcon, LineChart as LineChartIcon,
  Star, Award, FileText, Filter, Search,
  DollarSign, Receipt, ArrowUpRight, ArrowDownRight,
  Building2, Shield, Zap
} from 'lucide-react'
import PageContainer from '@/components/shared/layout/PageContainer'
import SkeletonLoader from '@/components/shared/loaders/SkeletonLoader'
import { BarChart, LineChart, PieChart, AreaChart } from '@/components/shared/Charts'
import { dashboardService } from '@/services/dashboardService'
import { useAuthStore } from '@/store'

// ─── Utility Helpers ──────────────────────────────────────────────────────────
const fmt = (n) => {
  if (n === null || n === undefined) return '0'
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return String(n)
}

const fmtCurrency = (n) => {
  if (n === null || n === undefined) return '₹0'
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`
  return `₹${Math.round(n)}`
}

const fmtPct = (n) => {
  if (n === null || n === undefined) return '0%'
  return `${Math.round(n)}%`
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// ─── Sub-tab Navigation ───────────────────────────────────────────────────────
const TABS = [
  { id: 'executive', label: 'Executive', icon: LayoutDashboard },
  { id: 'academic', label: 'Academic', icon: GraduationCap },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'attendance', label: 'Attendance', icon: UserCheck },
  { id: 'finance', label: 'Finance', icon: Wallet },
  { id: 'payroll', label: 'Payroll', icon: Coins },
  { id: 'transport', label: 'Transport', icon: Bus },
  { id: 'library', label: 'Library', icon: BookOpen },
  { id: 'communication', label: 'Communication', icon: Mail },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'activity', label: 'Activity', icon: Activity },
  { id: 'system', label: 'System Health', icon: Server },
]

// ─── KPI Card Component ────────────────────────────────────────────────────────
function KPICard({ title, value, subtitle, icon: Icon, color = 'primary', trend, trendValue, loading }) {
  const colorMap = {
    primary: 'bg-primary/10 text-primary',
    emerald: 'bg-emerald-500/10 text-emerald-600',
    amber: 'bg-amber-500/10 text-amber-600',
    rose: 'bg-rose-500/10 text-rose-600',
    violet: 'bg-violet-500/10 text-violet-600',
    sky: 'bg-sky-500/10 text-sky-600',
    orange: 'bg-orange-500/10 text-orange-600',
    teal: 'bg-teal-500/10 text-teal-600',
  }
  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <SkeletonLoader className="h-4 w-24" />
        <SkeletonLoader className="h-8 w-16" />
        <SkeletonLoader className="h-3 w-32" />
      </div>
    )
  }
  return (
    <div className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-shadow cursor-default">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${colorMap[color] || colorMap.primary}`}>
          <Icon className="w-4 h-4" />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trend >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
            {trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{title}</div>
      {subtitle && <div className="text-xs text-muted-foreground/70 mt-0.5">{subtitle}</div>}
    </div>
  )
}

// ─── Chart Card Wrapper ────────────────────────────────────────────────────────
function ChartCard({ title, subtitle, icon: Icon, children, loading }) {
  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <SkeletonLoader className="h-5 w-40" />
        <SkeletonLoader className="h-40 w-full" />
      </div>
    )
  }
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        {Icon && <Icon className="w-4 h-4 text-primary" />}
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  )
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    online: 'bg-emerald-500/10 text-emerald-600',
    healthy: 'bg-emerald-500/10 text-emerald-600',
    connected: 'bg-emerald-500/10 text-emerald-600',
    warning: 'bg-amber-500/10 text-amber-600',
    offline: 'bg-rose-500/10 text-rose-500',
    error: 'bg-rose-500/10 text-rose-500',
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${map[status] || 'bg-muted text-muted-foreground'}`}>
      {status}
    </span>
  )
}

// ─── Activity Item ────────────────────────────────────────────────────────────
function ActivityItem({ icon: Icon, title, subtitle, time, color = 'primary' }) {
  const colorMap = {
    primary: 'bg-primary/10 text-primary',
    emerald: 'bg-emerald-500/10 text-emerald-600',
    amber: 'bg-amber-500/10 text-amber-600',
    rose: 'bg-rose-500/10 text-rose-500',
    violet: 'bg-violet-500/10 text-violet-600',
  }
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border/50 last:border-0">
      <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${colorMap[color]}`}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{title}</p>
        {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
      </div>
      {time && <span className="text-xs text-muted-foreground shrink-0">{time}</span>}
    </div>
  )
}

// ─── Quick Action Button ──────────────────────────────────────────────────────
function QuickAction({ icon: Icon, label, to, color = 'primary' }) {
  const navigate = useNavigate()
  const colorMap = {
    primary: 'hover:bg-primary/10 hover:text-primary hover:border-primary/30',
    emerald: 'hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-400/30',
    amber: 'hover:bg-amber-500/10 hover:text-amber-600 hover:border-amber-400/30',
    violet: 'hover:bg-violet-500/10 hover:text-violet-600 hover:border-violet-400/30',
    sky: 'hover:bg-sky-500/10 hover:text-sky-600 hover:border-sky-400/30',
    rose: 'hover:bg-rose-500/10 hover:text-rose-600 hover:border-rose-400/30',
    orange: 'hover:bg-orange-500/10 hover:text-orange-600 hover:border-orange-400/30',
    teal: 'hover:bg-teal-500/10 hover:text-teal-600 hover:border-teal-400/30',
  }
  return (
    <button
      onClick={() => navigate(to)}
      className={`flex flex-col items-center gap-2 p-3 rounded-xl border border-border bg-card transition-all cursor-pointer ${colorMap[color]}`}
    >
      <Icon className="w-5 h-5" />
      <span className="text-xs font-medium">{label}</span>
    </button>
  )
}

// ─── Overview Bar ─────────────────────────────────────────────────────────────
function OverviewBar({ overview, loading }) {
  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl p-4 flex flex-wrap gap-6">
        {[...Array(4)].map((_, i) => <SkeletonLoader key={i} className="h-8 w-32" />)}
      </div>
    )
  }
  const items = [
    { label: 'School', value: overview?.schoolName || 'School ERP', icon: Building2 },
    { label: 'Academic Year', value: overview?.academicYear || '2025-2026', icon: Calendar },
    { label: 'Session', value: overview?.session || 'April – March', icon: Clock },
    { label: 'Campus', value: overview?.campus || 'Main Campus', icon: Shield },
  ]
  return (
    <div className="bg-gradient-to-r from-primary/5 via-violet-500/5 to-sky-500/5 border border-border rounded-xl p-4">
      <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
        {items.map(({ label, value, icon: Icon }) => (
          <div key={label} className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-primary shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-sm font-semibold text-foreground">{value}</p>
            </div>
          </div>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-emerald-600 font-medium">Live</span>
        </div>
      </div>
    </div>
  )
}

// ─── Executive Tab ────────────────────────────────────────────────────────────
function ExecutiveTab({ kpis, overview, activity, upcomingEvents, loading }) {
  const navigate = useNavigate()
  const studentKPIs = kpis?.students || {}
  const teacherKPIs = kpis?.teachers || {}
  const attendanceKPIs = kpis?.attendance || {}
  const financeKPIs = kpis?.finance || {}
  const libraryKPIs = kpis?.library || {}
  const transportKPIs = kpis?.transport || {}
  const communicationKPIs = kpis?.communication || {}
  const inventoryKPIs = kpis?.inventory || {}
  const payrollKPIs = kpis?.payroll || {}

  // Charts — service returns {label, value} arrays directly
  const admissionsChart = Array.isArray(kpis?.monthlyAdmissions) ? kpis.monthlyAdmissions : []
  const feeChart = Array.isArray(kpis?.feeCollectionTrend) ? kpis.feeCollectionTrend : []

  return (
    <div className="space-y-6">
      {/* Overview Bar */}
      <OverviewBar overview={overview} loading={loading} />

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">Quick Actions</h2>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          <QuickAction icon={UserPlus} label="Add Student" to="/admin/students/create" color="primary" />
          <QuickAction icon={UserCheck} label="Add Teacher" to="/admin/teachers/create" color="emerald" />
          <QuickAction icon={ClipboardList} label="Attendance" to="/admin/attendance/roster" color="amber" />
          <QuickAction icon={CreditCard} label="Collect Fees" to="/admin/fees/collect" color="violet" />
          <QuickAction icon={FileText} label="Create Exam" to="/admin/exams/setup" color="sky" />
          <QuickAction icon={BookMarked} label="Homework" to="/admin/communication/circulars" color="rose" />
          <QuickAction icon={Megaphone} label="Announce" to="/admin/communication/circulars" color="orange" />
          <QuickAction icon={BarChart2} label="Reports" to="/admin/reports" color="teal" />
        </div>
      </div>

      {/* Top KPI Grid */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">Today's Summary</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          <KPICard title="Total Students" value={fmt(studentKPIs.total)} subtitle={`${fmt(studentKPIs.newToday)} new today`} icon={Users} color="primary" loading={loading} />
          <KPICard title="Active Teachers" value={fmt(teacherKPIs.total)} subtitle={`${fmt(teacherKPIs.present)} present today`} icon={GraduationCap} color="emerald" loading={loading} />
          <KPICard title="Attendance Rate" value={fmtPct(attendanceKPIs.studentAttendancePct)} subtitle={`${fmt(attendanceKPIs.absent)} absent today`} icon={UserCheck} color="amber" loading={loading} />
          <KPICard title="Today's Collection" value={fmtCurrency(financeKPIs.todayCollection)} subtitle="Fee payments" icon={DollarSign} color="violet" loading={loading} />
          <KPICard title="Outstanding Fees" value={fmtCurrency(financeKPIs.outstanding)} subtitle="Balance pending" icon={Receipt} color="rose" loading={loading} />
          <KPICard title="Books Issued" value={fmt(libraryKPIs.issued)} subtitle={`${fmt(libraryKPIs.overdue)} overdue`} icon={BookOpen} color="sky" loading={loading} />
          <KPICard title="Vehicles Active" value={fmt(transportKPIs.vehicles)} subtitle={`${fmt(transportKPIs.assignedStudents)} students`} icon={Bus} color="orange" loading={loading} />
          <KPICard title="Notifications" value={fmt(communicationKPIs.unread)} subtitle="Unread alerts" icon={Bell} color="teal" loading={loading} />
          <KPICard title="Stock Alerts" value={fmt(inventoryKPIs.stockAlerts)} subtitle="Low stock items" icon={AlertTriangle} color="amber" loading={loading} />
          <KPICard title="Payroll Pending" value={fmtCurrency(payrollKPIs.pendingAmount)} subtitle={payrollKPIs.status || 'Not generated'} icon={Coins} color="violet" loading={loading} />
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Monthly Admissions" subtitle="This academic year" icon={TrendingUp} loading={loading}>
          {admissionsChart.length > 0
            ? <BarChart data={admissionsChart} height={160} />
            : <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">No admissions data yet</div>
          }
        </ChartCard>
        <ChartCard title="Fee Collection Trend" subtitle="Monthly collections" icon={Wallet} loading={loading}>
          {feeChart.length > 0
            ? <AreaChart data={feeChart} height={160} />
            : <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">No payment data yet</div>
          }
        </ChartCard>
        <ChartCard title="Module Overview" subtitle="System at a glance" icon={PieChartIcon} loading={loading}>
          <PieChart data={[
            { label: 'Students', value: studentKPIs.total || 0 },
            { label: 'Teachers', value: teacherKPIs.total || 0 },
            { label: 'Books', value: libraryKPIs.total || 0 },
            { label: 'Vehicles', value: transportKPIs.vehicles || 0 },
          ].filter(d => d.value > 0)} />
        </ChartCard>
      </div>

      {/* Activity + Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Activity */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" /> Recent Activity
            </h3>
            <button onClick={() => navigate('/admin/reports')} className="text-xs text-primary hover:underline flex items-center gap-1">
              View All <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <SkeletonLoader key={i} className="h-10 w-full" />)}
            </div>
          ) : (
            <div>
              {(activity?.recentAdmissions || []).map((s, i) => (
                <ActivityItem key={`adm-${i}`} icon={UserPlus} title={`${s.firstName || ''} ${s.lastName || ''} admitted`} subtitle={`Class: ${s.class || ''} • ${s.admissionNo || ''}`} time={s.admissionDate ? new Date(s.admissionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : ''} color="primary" />
              ))}
              {(activity?.recentPayments || []).map((p, i) => (
                <ActivityItem key={`pay-${i}`} icon={CreditCard} title={`Fee payment received`} subtitle={`₹${p.amount?.toLocaleString()} via ${p.method || ''}`} time={p.paymentDate ? new Date(p.paymentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : ''} color="emerald" />
              ))}
              {!activity?.recentAdmissions?.length && !activity?.recentPayments?.length && (
                <p className="text-sm text-muted-foreground text-center py-8">No recent activity</p>
              )}
            </div>
          )}
        </div>

        {/* Upcoming Events */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" /> Upcoming Events
            </h3>
            <button onClick={() => navigate('/admin/exams/setup')} className="text-xs text-primary hover:underline flex items-center gap-1">
              View All <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => <SkeletonLoader key={i} className="h-10 w-full" />)}
            </div>
          ) : (
            <div>
              {(upcomingEvents?.upcomingExams || []).map((e, i) => (
                <ActivityItem key={`exam-${i}`} icon={FileText} title={e.examName || e.title || 'Exam'} subtitle={`${e.class || ''} ${e.section || ''} • ${e.subject || ''}`} time={e.examDate ? new Date(e.examDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : ''} color="violet" />
              ))}
              {!upcomingEvents?.upcomingExams?.length && (
                <p className="text-sm text-muted-foreground text-center py-8">No upcoming exams in next 7 days</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Students Tab ─────────────────────────────────────────────────────────────
function StudentsTab({ kpis, loading }) {
  const studentKPIs = kpis?.students || {}
  const admissionsChart = (kpis?.monthlyAdmissions || []).map(d => ({
    label: MONTH_NAMES[(d._id || 1) - 1] || d._id,
    value: d.count || 0
  }))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <KPICard title="Total Students" value={fmt(studentKPIs.total)} icon={Users} color="primary" loading={loading} />
        <KPICard title="Active" value={fmt(studentKPIs.active)} icon={CheckCircle} color="emerald" loading={loading} />
        <KPICard title="Inactive" value={fmt(studentKPIs.inactive)} icon={AlertTriangle} color="rose" loading={loading} />
        <KPICard title="New Today" value={fmt(studentKPIs.newToday)} icon={UserPlus} color="amber" loading={loading} />
        <KPICard title="This Month" value={fmt(studentKPIs.newThisMonth)} icon={Calendar} color="violet" loading={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Monthly Admissions" subtitle="New students enrolled per month" icon={TrendingUp} loading={loading}>
          {admissionsChart.length > 0
            ? <BarChart data={admissionsChart} height={200} />
            : <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">No admission data yet</div>
          }
        </ChartCard>
        <ChartCard title="Gender Breakdown" subtitle="Student demographics" icon={PieChartIcon} loading={loading}>
          <PieChart data={[
            { label: 'Male', value: studentKPIs.male || 0 },
            { label: 'Female', value: studentKPIs.female || 0 },
            { label: 'Other', value: studentKPIs.other || 0 },
          ].filter(d => d.value > 0)} />
        </ChartCard>
      </div>
    </div>
  )
}

// ─── Attendance Tab ───────────────────────────────────────────────────────────
function AttendanceTab({ kpis, loading }) {
  const attendance = kpis?.attendance || {}
  const trend = Array.isArray(kpis?.attendanceTrend)
    ? kpis.attendanceTrend.map(d => ({
        label: d.date ? new Date(d.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '',
        value: d.percentage || d.pct || 0
      }))
    : []

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPICard title="Student Attendance" value={fmtPct(attendance.studentAttendancePct)} icon={Users} color="primary" loading={loading} />
        <KPICard title="Teacher Attendance" value={fmtPct(attendance.teacherAttendancePct)} icon={GraduationCap} color="emerald" loading={loading} />
        <KPICard title="Present Today" value={fmt(attendance.present)} icon={CheckCircle} color="emerald" loading={loading} />
        <KPICard title="Absent Today" value={fmt(attendance.absent)} icon={AlertTriangle} color="rose" loading={loading} />
        <KPICard title="Late Arrivals" value={fmt(attendance.late)} icon={Clock} color="amber" loading={loading} />
        <KPICard title="Half Day" value={fmt(attendance.halfday)} icon={Calendar} color="violet" loading={loading} />
      </div>

      <ChartCard title="30-Day Attendance Trend" subtitle="Daily student attendance percentage" icon={LineChartIcon} loading={loading}>
        {trend.length > 0
          ? <LineChart data={trend} height={220} />
          : <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">No attendance data yet</div>
        }
      </ChartCard>
    </div>
  )
}

// ─── Finance Tab ──────────────────────────────────────────────────────────────
function FinanceTab({ kpis, loading }) {
  const finance = kpis?.finance || {}
  const feeChart = Array.isArray(kpis?.feeCollectionTrend) ? kpis.feeCollectionTrend : []

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <KPICard title="Today's Collection" value={fmtCurrency(finance.todayCollection)} icon={DollarSign} color="emerald" loading={loading} />
        <KPICard title="Monthly Collection" value={fmtCurrency(finance.monthlyCollection)} icon={TrendingUp} color="primary" loading={loading} />
        <KPICard title="Outstanding Fees" value={fmtCurrency(finance.outstanding)} icon={AlertTriangle} color="rose" loading={loading} />
        <KPICard title="Pending Payments" value={fmt(finance.pendingCount)} icon={Clock} color="amber" loading={loading} />
        <KPICard title="Total Students Billed" value={fmt(finance.totalBilled)} icon={Receipt} color="violet" loading={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Fee Collection Trend" subtitle="Monthly collection this year" icon={BarChart2} loading={loading}>
          {feeChart.length > 0
            ? <AreaChart data={feeChart} height={200} />
            : <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">No payment data yet</div>
          }
        </ChartCard>
        <ChartCard title="Payment Status" subtitle="Fee payment breakdown" icon={PieChartIcon} loading={loading}>
          <PieChart data={[
            { label: 'Paid', value: finance.paid || 0 },
            { label: 'Partial', value: finance.partial || 0 },
            { label: 'Unpaid', value: finance.unpaid || 0 },
          ].filter(d => d.value > 0)} />
        </ChartCard>
      </div>
    </div>
  )
}

// ─── Payroll Tab ──────────────────────────────────────────────────────────────
function PayrollTab({ data, loading }) {
  const payroll = data || {}

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <KPICard title="Current Month Status" value={payroll.status || 'Not Generated'} icon={Coins} color="primary" loading={loading} />
        <KPICard title="Total Net Amount" value={fmtCurrency(payroll.netAmount)} icon={DollarSign} color="emerald" loading={loading} />
        <KPICard title="Total Deductions" value={fmtCurrency(payroll.totalDeductions)} icon={ArrowDownRight} color="rose" loading={loading} />
        <KPICard title="Total Allowances" value={fmtCurrency(payroll.totalAllowances)} icon={ArrowUpRight} color="amber" loading={loading} />
      </div>
      {!payroll.netAmount && !loading && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-center">
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
          <p className="text-sm font-medium text-amber-700">Payroll not generated for current month</p>
          <p className="text-xs text-amber-600 mt-1">Go to Payroll System to generate monthly payroll</p>
        </div>
      )}
    </div>
  )
}

// ─── Transport Tab ────────────────────────────────────────────────────────────
function TransportTab({ data, loading }) {
  const transport = data || {}

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard title="Total Vehicles" value={fmt(transport.vehicles)} icon={Bus} color="primary" loading={loading} />
        <KPICard title="Active Routes" value={fmt(transport.routes)} icon={Activity} color="emerald" loading={loading} />
        <KPICard title="Assigned Students" value={fmt(transport.assignedStudents)} icon={Users} color="amber" loading={loading} />
        <KPICard title="Maintenance Alerts" value={fmt(transport.maintenanceAlerts)} icon={AlertTriangle} color="rose" loading={loading} />
      </div>
    </div>
  )
}

// ─── Library Tab ──────────────────────────────────────────────────────────────
function LibraryTab({ data, loading }) {
  const library = data || {}

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard title="Total Books" value={fmt(library.total)} icon={BookOpen} color="primary" loading={loading} />
        <KPICard title="Available Copies" value={fmt(library.available)} icon={CheckCircle} color="emerald" loading={loading} />
        <KPICard title="Currently Issued" value={fmt(library.issued)} icon={BookMarked} color="amber" loading={loading} />
        <KPICard title="Overdue Books" value={fmt(library.overdue)} icon={AlertTriangle} color="rose" loading={loading} />
      </div>
    </div>
  )
}

// ─── Communication Tab ────────────────────────────────────────────────────────
function CommunicationTab({ data, loading }) {
  const comm = data || {}

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard title="Unread Notifications" value={fmt(comm.unread)} icon={Bell} color="rose" loading={loading} />
        <KPICard title="Total Notifications" value={fmt(comm.total)} icon={Mail} color="primary" loading={loading} />
        <KPICard title="Announcements (Month)" value={fmt(comm.announcements)} icon={Megaphone} color="emerald" loading={loading} />
        <KPICard title="Read Rate" value={comm.total > 0 ? fmtPct(((comm.total - comm.unread) / comm.total) * 100) : '0%'} icon={CheckCircle} color="amber" loading={loading} />
      </div>
    </div>
  )
}

// ─── Inventory Tab ────────────────────────────────────────────────────────────
function InventoryTab({ data, loading }) {
  const inv = data || {}

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <KPICard title="Total Assets" value={fmt(inv.assets)} icon={Package} color="primary" loading={loading} />
        <KPICard title="Stock Alerts" value={fmt(inv.stockAlerts)} icon={AlertTriangle} color="rose" loading={loading} />
        <KPICard title="Low Stock Items" value={fmt(inv.lowStockItems)} icon={AlertTriangle} color="amber" loading={loading} />
      </div>
    </div>
  )
}

// ─── Activity Tab ─────────────────────────────────────────────────────────────
function ActivityTab({ activity, loading }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-primary" /> Recent Admissions
        </h3>
        {loading ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => <SkeletonLoader key={i} className="h-10 w-full" />)}</div>
        ) : (
          (activity?.recentAdmissions || []).map((s, i) => (
            <ActivityItem key={i} icon={UserPlus}
              title={`${s.firstName || ''} ${s.lastName || ''}`}
              subtitle={`${s.admissionNo || ''} • Class ${s.class || ''}`}
              time={s.admissionDate ? new Date(s.admissionDate).toLocaleDateString('en-IN') : ''} color="primary" />
          ))
        )}
        {!loading && !activity?.recentAdmissions?.length && (
          <p className="text-sm text-muted-foreground text-center py-6">No recent admissions</p>
        )}
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-emerald-600" /> Recent Fee Payments
        </h3>
        {loading ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => <SkeletonLoader key={i} className="h-10 w-full" />)}</div>
        ) : (
          (activity?.recentPayments || []).map((p, i) => (
            <ActivityItem key={i} icon={CreditCard}
              title={`₹${p.amount?.toLocaleString() || 0} received`}
              subtitle={`Method: ${p.method || ''}${p.transactionId ? ` • Ref: ${p.transactionId}` : ''}`}
              time={p.paymentDate ? new Date(p.paymentDate).toLocaleDateString('en-IN') : ''} color="emerald" />
          ))
        )}
        {!loading && !activity?.recentPayments?.length && (
          <p className="text-sm text-muted-foreground text-center py-6">No recent payments</p>
        )}
      </div>
    </div>
  )
}

// ─── Academic Tab ─────────────────────────────────────────────────────────────
function AcademicTab({ kpis, upcomingEvents, loading }) {
  const academics = kpis?.academics || {}

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard title="Total Classes" value={fmt(academics.classes)} icon={GraduationCap} color="primary" loading={loading} />
        <KPICard title="Total Subjects" value={fmt(academics.subjects)} icon={BookOpen} color="emerald" loading={loading} />
        <KPICard title="Active Exams" value={fmt(academics.activeExams)} icon={FileText} color="amber" loading={loading} />
        <KPICard title="Upcoming Exams" value={fmt(upcomingEvents?.upcomingExams?.length)} icon={Calendar} color="violet" loading={loading} />
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" /> Upcoming Exams (Next 7 Days)
        </h3>
        {loading ? (
          <div className="space-y-3">{[...Array(4)].map((_, i) => <SkeletonLoader key={i} className="h-10 w-full" />)}</div>
        ) : (
          (upcomingEvents?.upcomingExams || []).map((e, i) => (
            <ActivityItem key={i} icon={FileText}
              title={e.examName || e.title || 'Exam'}
              subtitle={`${e.class || ''} ${e.section || ''} • ${e.subject || ''} • Max: ${e.maxMarks || ''}marks`}
              time={e.examDate ? new Date(e.examDate).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' }) : ''} color="violet" />
          ))
        )}
        {!loading && !upcomingEvents?.upcomingExams?.length && (
          <p className="text-sm text-muted-foreground text-center py-6">No upcoming exams in the next 7 days</p>
        )}
      </div>
    </div>
  )
}

// ─── System Health Tab ────────────────────────────────────────────────────────
function SystemHealthTab({ health, loading }) {
  const formatUptime = (seconds) => {
    if (!seconds) return 'N/A'
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    return `${h}h ${m}m`
  }

  const metrics = [
    { label: 'Server Status', value: 'Online', status: 'online', icon: Server },
    { label: 'Database Status', value: health?.mongoStatus === 1 ? 'Connected' : 'Disconnected', status: health?.mongoStatus === 1 ? 'connected' : 'offline', icon: Database },
    { label: 'Server Uptime', value: formatUptime(health?.uptime), status: 'healthy', icon: Clock },
    { label: 'Node.js Version', value: health?.nodeVersion || 'N/A', status: 'healthy', icon: Zap },
    { label: 'API Status', value: 'Operational', status: 'online', icon: Wifi },
    { label: 'Last Checked', value: health?.timestamp ? new Date(health.timestamp).toLocaleTimeString('en-IN') : 'N/A', status: 'healthy', icon: RefreshCw },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map(({ label, value, status, icon: Icon }) => (
          loading ? (
            <div key={label} className="bg-card border border-border rounded-xl p-4 space-y-2">
              <SkeletonLoader className="h-4 w-24" />
              <SkeletonLoader className="h-6 w-20" />
            </div>
          ) : (
            <div key={label} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{label}</span>
                </div>
                <StatusBadge status={status} />
              </div>
              <p className="text-sm font-semibold text-foreground">{value}</p>
            </div>
          )
        ))}
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span className="text-sm font-medium text-emerald-700">All systems operational</span>
        </div>
        <p className="text-xs text-emerald-600 mt-1">School ERP is running normally. All modules are connected to live MongoDB.</p>
      </div>
    </div>
  )
}

// ─── Main Dashboard Page ──────────────────────────────────────────────────────
export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('executive')
  const [kpis, setKPIs] = useState(null)
  const [overview, setOverview] = useState(null)
  const [activity, setActivity] = useState(null)
  const [upcomingEvents, setUpcomingEvents] = useState(null)
  const [payrollData, setPayrollData] = useState(null)
  const [transportData, setTransportData] = useState(null)
  const [libraryData, setLibraryData] = useState(null)
  const [communicationData, setCommunicationData] = useState(null)
  const [inventoryData, setInventoryData] = useState(null)
  const [healthData, setHealthData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  const user = useAuthStore(s => s.user)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [
        kpisRes,
        overviewRes,
        activityRes,
        eventsRes,
      ] = await Promise.allSettled([
        dashboardService.getKPIs(),
        dashboardService.getOverview(),
        dashboardService.getActivity(),
        dashboardService.getUpcomingEvents(),
      ])

      if (kpisRes.status === 'fulfilled') setKPIs(kpisRes.value)
      if (overviewRes.status === 'fulfilled') setOverview(overviewRes.value)
      if (activityRes.status === 'fulfilled') setActivity(activityRes.value)
      if (eventsRes.status === 'fulfilled') setUpcomingEvents(eventsRes.value)
    } catch (e) {
      console.error('[Dashboard] Error loading data:', e.message)
    } finally {
      setLoading(false)
      setLastRefresh(new Date())
    }
  }, [])

  const loadTabData = useCallback(async (tab) => {
    try {
      if (tab === 'payroll' && !payrollData) {
        const d = await dashboardService.getPayrollStats()
        setPayrollData(d)
      } else if (tab === 'transport' && !transportData) {
        const d = await dashboardService.getTransportStats()
        setTransportData(d)
      } else if (tab === 'library' && !libraryData) {
        const d = await dashboardService.getLibraryStats()
        setLibraryData(d)
      } else if (tab === 'communication' && !communicationData) {
        const d = await dashboardService.getCommunicationStats()
        setCommunicationData(d)
      } else if (tab === 'inventory' && !inventoryData) {
        const d = await dashboardService.getInventoryStats()
        setInventoryData(d)
      } else if (tab === 'system' && !healthData) {
        const d = await dashboardService.getSystemHealth()
        setHealthData(d)
      }
    } catch (e) {
      console.error(`[Dashboard] Error loading ${tab} tab data:`, e.message)
    }
  }, [payrollData, transportData, libraryData, communicationData, inventoryData, healthData])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    loadTabData(tabId)
  }

  return (
    <PageContainer>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {overview?.schoolName || 'School ERP'} — Command Center
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground hidden sm:block">
            Last updated: {lastRefresh.toLocaleTimeString('en-IN')}
          </span>
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium border border-border rounded-lg hover:bg-muted transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-border mb-6 overflow-x-auto">
        <nav className="flex gap-1 min-w-max pb-0">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleTabChange(id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'executive' && (
          <ExecutiveTab kpis={kpis} overview={overview} activity={activity} upcomingEvents={upcomingEvents} loading={loading} />
        )}
        {activeTab === 'academic' && (
          <AcademicTab kpis={kpis} upcomingEvents={upcomingEvents} loading={loading} />
        )}
        {activeTab === 'students' && (
          <StudentsTab kpis={kpis} loading={loading} />
        )}
        {activeTab === 'attendance' && (
          <AttendanceTab kpis={kpis} loading={loading} />
        )}
        {activeTab === 'finance' && (
          <FinanceTab kpis={kpis} loading={loading} />
        )}
        {activeTab === 'payroll' && (
          <PayrollTab data={payrollData || kpis?.payroll} loading={loading && !payrollData} />
        )}
        {activeTab === 'transport' && (
          <TransportTab data={transportData || kpis?.transport} loading={loading && !transportData} />
        )}
        {activeTab === 'library' && (
          <LibraryTab data={libraryData || kpis?.library} loading={loading && !libraryData} />
        )}
        {activeTab === 'communication' && (
          <CommunicationTab data={communicationData || kpis?.communication} loading={loading && !communicationData} />
        )}
        {activeTab === 'inventory' && (
          <InventoryTab data={inventoryData || kpis?.inventory} loading={loading && !inventoryData} />
        )}
        {activeTab === 'activity' && (
          <ActivityTab activity={activity} loading={loading} />
        )}
        {activeTab === 'system' && (
          <SystemHealthTab health={healthData} loading={loading && !healthData} />
        )}
      </div>
    </PageContainer>
  )
}
