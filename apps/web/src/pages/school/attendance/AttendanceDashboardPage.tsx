import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { attendanceApi } from '@/api/attendance';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, AlertTriangle, CheckCircle, FileText, Settings, ShieldAlert, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { PageLoader } from '@/components/LoadingSpinner';

export default function AttendanceDashboardPage() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = React.useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });

  const { data: stats, isLoading } = useQuery({
    queryKey: ['attendanceDashboard', selectedDate],
    queryFn: () => attendanceApi.getDashboard(selectedDate),
    refetchInterval: 15000 // poll every 15s to keep real-time
  });

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-200 via-slate-100 to-indigo-100 bg-clip-text text-transparent">
            Attendance Dashboard
          </h1>
          <p className="text-sm text-slate-400">Track and manage student daily attendance status</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5">
            <Calendar className="h-4 w-4 text-indigo-400" />
            <input
              type="date"
              style={{ colorScheme: 'dark' }}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-sm text-slate-100 outline-none"
            />
          </div>
          <Button asChild className="bg-indigo-600 hover:bg-indigo-500 text-white">
            <Link to="/attendance/monitor">
              Daily Monitor
            </Link>
          </Button>
          <Button asChild variant="outline" className="border-slate-800 text-slate-300 hover:bg-slate-900">
            <Link to="/attendance/settings">
              <Settings className="mr-2 h-4 w-4" /> Settings
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-800 bg-slate-900/50 text-slate-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase">Expected Sections</p>
                <h3 className="mt-2 text-3xl font-extrabold">{stats?.expectedSections ?? 0}</h3>
              </div>
              <div className="rounded-xl bg-indigo-500/10 p-3 text-indigo-400">
                <Users className="h-6 w-6" />
              </div>
            </div>
            <p className="mt-4 text-xs text-slate-500">Active class streams this semester</p>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/50 text-slate-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase">Submitted Today</p>
                <h3 className="mt-2 text-3xl font-extrabold text-emerald-400">{stats?.submittedSessionsCount ?? 0}</h3>
              </div>
              <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-400">
                <CheckCircle className="h-6 w-6" />
              </div>
            </div>
            <p className="mt-4 text-xs text-slate-500">Sessions complete & locked</p>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/50 text-slate-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase">Draft Sessions</p>
                <h3 className="mt-2 text-3xl font-extrabold text-yellow-400">{stats?.draftSessionsCount ?? 0}</h3>
              </div>
              <div className="rounded-xl bg-yellow-500/10 p-3 text-yellow-400">
                <FileText className="h-6 w-6" />
              </div>
            </div>
            <p className="mt-4 text-xs text-slate-500">Marked but not yet finalized</p>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/50 text-slate-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase">Missing Submissions</p>
                <h3 className="mt-2 text-3xl font-extrabold text-rose-400">{stats?.missingSessionsCount ?? 0}</h3>
              </div>
              <div className="rounded-xl bg-rose-500/10 p-3 text-rose-400">
                <AlertTriangle className="h-6 w-6" />
              </div>
            </div>
            <p className="mt-4 text-xs text-slate-500">Sections without marked records</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Missing Sections */}
        <Card className="border-slate-800 bg-slate-900/50 text-slate-100 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-rose-300">Missing Daily Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.missingSections && stats.missingSections.length > 0 ? (
              <div className="divide-y divide-slate-800">
                {stats.missingSections.map((sec: any) => (
                  <div key={sec.id} className="flex items-center justify-between py-3">
                    <div>
                      <h4 className="font-bold text-slate-200">{sec.class} - {sec.name}</h4>
                      <p className="text-xs text-slate-500">Daily session missing</p>
                    </div>
                    <Button
                      onClick={() => navigate(`/attendance/mark?sectionId=${sec.id}&date=${selectedDate}`)}
                      size="sm"
                      variant="outline"
                      className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                    >
                      Mark Now
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle className="h-10 w-10 text-emerald-400" />
                <h3 className="mt-4 font-bold text-slate-200">All caught up!</h3>
                <p className="text-sm text-slate-500">Every section has submitted attendance for today.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action / Correction Queue Card */}
        <div className="space-y-6">
          <Card className="border-slate-800 bg-slate-900/50 text-slate-100">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-indigo-300">Correction Request Queue</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-slate-950 p-4 border border-slate-800">
                <div className="flex items-center gap-3">
                  <ShieldAlert className="h-8 w-8 text-yellow-400" />
                  <div>
                    <h4 className="font-bold text-slate-200">{stats?.pendingCorrections ?? 0} Pending</h4>
                    <p className="text-xs text-slate-500">Awaiting review approvals</p>
                  </div>
                </div>
                <Button asChild size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white">
                  <Link to="/attendance/corrections">
                    Open Queue <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Info weights */}
          <Card className="border-slate-800 bg-slate-900/50 text-slate-100">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-slate-300">Daily Status Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Total Present:</span>
                <span className="font-bold text-emerald-400">{stats?.totalPresent ?? 0}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Total Absent:</span>
                <span className="font-bold text-rose-400">{stats?.totalAbsent ?? 0}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Total Late:</span>
                <span className="font-bold text-amber-400">{stats?.totalLate ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Half-Day:</span>
                <span className="font-bold text-blue-400">{stats?.totalHalfDay ?? 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
