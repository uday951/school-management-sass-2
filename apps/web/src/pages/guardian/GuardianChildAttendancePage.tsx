import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { attendanceApi } from '@/api/attendance';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Calendar, Percent, CheckCircle2, Clock, ArrowLeft } from 'lucide-react';
import { PageLoader } from '@/components/LoadingSpinner';
import { Button } from '@/components/ui/button';

export default function GuardianChildAttendancePage() {
  const { studentId } = useParams<{ studentId: string }>();

  const { data: summary, isLoading, error } = useQuery({
    queryKey: ['guardianChildAttendance', studentId],
    queryFn: () => attendanceApi.getGuardianChildSummary(studentId!),
    enabled: !!studentId
  });

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" className="text-slate-400 hover:text-slate-100">
          <Link to="/guardian/dashboard">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-100">Child Attendance</h1>
          <p className="text-sm text-slate-400">Track presence, absences, and overall statistics for your child</p>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-6 text-center text-sm text-rose-400">
          Permission Denied: Either this student is not linked to your parent portal credentials, or session doesn't exist.
        </div>
      ) : summary ? (
        <>
          {/* KPI Dashboard */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-slate-800 bg-slate-900/50 text-slate-100">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase">Compliance Score</p>
                    <h3 className="mt-2 text-3xl font-extrabold text-indigo-400">{summary.percentage}%</h3>
                  </div>
                  <div className="rounded-xl bg-indigo-500/10 p-3 text-indigo-400">
                    <Percent className="h-6 w-6" />
                  </div>
                </div>
                <p className="mt-4 text-[10px] text-slate-500">Target minimum is 75%</p>
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900/50 text-slate-100">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase">Total Classes</p>
                    <h3 className="mt-2 text-3xl font-extrabold">{summary.stats.total}</h3>
                  </div>
                  <div className="rounded-xl bg-slate-500/10 p-3 text-slate-400">
                    <Calendar className="h-6 w-6" />
                  </div>
                </div>
                <p className="mt-4 text-[10px] text-slate-500">Total sessions recorded</p>
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900/50 text-slate-100">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase">Days Present</p>
                    <h3 className="mt-2 text-3xl font-extrabold text-emerald-400">{summary.stats.present}</h3>
                  </div>
                  <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-400">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                </div>
                <p className="mt-4 text-[10px] text-slate-500 font-medium">Class presence records</p>
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900/50 text-slate-100">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase">Absences Reported</p>
                    <h3 className="mt-2 text-3xl font-extrabold text-rose-400">{summary.stats.absent}</h3>
                  </div>
                  <div className="rounded-xl bg-rose-500/10 p-3 text-rose-400">
                    <Clock className="h-6 w-6" />
                  </div>
                </div>
                <p className="mt-4 text-[10px] text-slate-500">Unexcused absence count</p>
              </CardContent>
            </Card>
          </div>

          {/* Roster list */}
          <Card className="border-slate-800 bg-slate-900/50 text-slate-100">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-slate-200">Recent Attendance Activity Logs</CardTitle>
            </CardHeader>
            <CardContent>
              {summary.recentRecords && summary.recentRecords.length > 0 ? (
                <div className="divide-y divide-slate-800">
                  {summary.recentRecords.map((rec: any) => (
                    <div key={rec.id} className="flex justify-between items-center py-3.5">
                      <div>
                        <h4 className="font-bold text-slate-200">{new Date(rec.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h4>
                        <p className="text-xs text-slate-500">Classroom Stream: {rec.className} - {rec.sectionName}</p>
                      </div>
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide
                        ${rec.status === 'PRESENT' ? 'bg-emerald-500/10 text-emerald-400' : ''}
                        ${rec.status === 'ABSENT' ? 'bg-rose-500/10 text-rose-400' : ''}
                        ${rec.status === 'LATE' ? 'bg-amber-500/10 text-amber-400' : ''}
                        ${rec.status === 'HALF_DAY' ? 'bg-blue-500/10 text-blue-400' : ''}
                      `}>
                        {rec.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  No attendance logs reported for this academic year yet.
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="text-center py-12 text-slate-500">
          No child summary context resolved.
        </div>
      )}
    </div>
  );
}
