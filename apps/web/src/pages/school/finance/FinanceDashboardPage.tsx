import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { feesApi } from '@/api/fees';
import { academicYearsApi } from '@/api/academicYears';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageLoader } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { CreditCard, DollarSign, AlertCircle, Calendar, RefreshCw, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FinanceDashboardPage() {
  const { data: currentYear } = useQuery({
    queryKey: ['currentAcademicYear'],
    queryFn: async () => {
      const list = await academicYearsApi.list();
      return list.find(y => y.isCurrent) || list[0] || null;
    }
  });

  const academicYearId = currentYear?.id || '';

  const { data: metrics, isLoading, refetch } = useQuery({
    queryKey: ['financeDashboard', academicYearId],
    queryFn: () => feesApi.getFinanceDashboard(academicYearId),
    enabled: !!academicYearId
  });

  if (isLoading) return <PageLoader />;

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount / 100);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Finance Dashboard</h1>
          <p className="text-slate-400 text-sm">
            Overview of school fee collections, outstanding dues, and concessions for {currentYear?.name || 'Active Year'}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="border-slate-800 bg-slate-900 text-slate-300 hover:text-white">
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
          <Link to="/school/payments">
            <Button size="sm" className="bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/20">
              <CreditCard className="w-4 h-4 mr-2" /> Record Payment
            </Button>
          </Link>
        </div>
      </div>

      {!metrics ? (
        <EmptyState icon={DollarSign} title="No Financial Data Available" description="Ensure you have created academic years and fee structures mapped to students." />
      ) : (
        <div className="space-y-8">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-md hover:border-violet-500/50 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">Total Billed Dues</CardTitle>
                <DollarSign className="w-4 h-4 text-violet-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{formatMoney(metrics.totalCharges)}</div>
                <p className="text-xs text-slate-500 mt-1">Accumulated structured fee targets</p>
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-md hover:border-emerald-500/50 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">Total Collected</CardTitle>
                <CreditCard className="w-4 h-4 text-emerald-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{formatMoney(metrics.totalCollected)}</div>
                <p className="text-xs text-slate-500 mt-1">Confirmed payments received</p>
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-md hover:border-amber-500/50 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">Concessions Granted</CardTitle>
                <Layers className="w-4 h-4 text-amber-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{formatMoney(metrics.totalConcessions)}</div>
                <p className="text-xs text-slate-500 mt-1">Approved scholarships & waivers</p>
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-md hover:border-rose-500/50 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">Outstanding Balance</CardTitle>
                <AlertCircle className="w-4 h-4 text-rose-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{formatMoney(metrics.totalOutstanding)}</div>
                <p className="text-xs text-slate-500 mt-1">Remaining pending dues</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border-slate-800 bg-slate-900/40">
              <CardHeader>
                <CardTitle className="text-white">Recent Collections</CardTitle>
                <CardDescription className="text-slate-400">Total payments collected today: <span className="font-semibold text-white">{formatMoney(metrics.todayCollection)}</span></CardDescription>
              </CardHeader>
              <CardContent className="h-64 flex flex-col justify-center items-center text-slate-500">
                <Calendar className="w-12 h-12 text-slate-700 mb-4" />
                <p className="text-sm">Head over to the Reports tab to download detailed daily breakdowns.</p>
                <Link to="/school/finance/reports" className="mt-4">
                  <Button variant="outline" size="sm" className="border-slate-800 hover:bg-slate-800 text-white">Go to Reports</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900/40">
              <CardHeader>
                <CardTitle className="text-white">Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <Link to="/school/finance/structures" className="w-full">
                  <Button variant="outline" className="w-full justify-start border-slate-800 text-slate-300 hover:text-white bg-slate-900/50">
                    📂 Fee Structures & Target Groups
                  </Button>
                </Link>
                <Link to="/school/finance/assignments" className="w-full">
                  <Button variant="outline" className="w-full justify-start border-slate-800 text-slate-300 hover:text-white bg-slate-900/50">
                    👥 Assign Fees to Students
                  </Button>
                </Link>
                <Link to="/school/finance/concessions" className="w-full">
                  <Button variant="outline" className="w-full justify-start border-slate-800 text-slate-300 hover:text-white bg-slate-900/50">
                    🎟️ Concessions & Scholarships
                  </Button>
                </Link>
                <Link to="/school/finance/settings" className="w-full">
                  <Button variant="outline" className="w-full justify-start border-slate-800 text-slate-300 hover:text-white bg-slate-900/50">
                    ⚙️ Late Fees & Receipt Settings
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
