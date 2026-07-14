import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceApi } from '@/api/attendance';
import { Button } from '@/components/ui/button';
import { Calendar, Lock, Unlock, Eye, ArrowLeft, ShieldAlert } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { PageLoader } from '@/components/LoadingSpinner';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

export default function AttendanceMonitorPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = React.useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });

  const [reopenTarget, setReopenTarget] = React.useState<string | null>(null);
  const [reopenReason, setReopenReason] = React.useState('');

  const { data: monitorList, isLoading } = useQuery({
    queryKey: ['attendanceMonitor', selectedDate],
    queryFn: () => attendanceApi.getDailyMonitor(selectedDate)
  });

  const lockMutation = useMutation({
    mutationFn: (sessId: string) => attendanceApi.lockSession(sessId),
    onSuccess: () => {
      toast.success('Attendance session locked successfully');
      queryClient.invalidateQueries({ queryKey: ['attendanceMonitor', selectedDate] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to lock session');
    }
  });

  const reopenMutation = useMutation({
    mutationFn: ({ sessId, reason }: { sessId: string; reason: string }) =>
      attendanceApi.reopenSession(sessId, reason),
    onSuccess: () => {
      toast.success('Attendance session reopened as edit-ready draft');
      setReopenTarget(null);
      setReopenReason('');
      queryClient.invalidateQueries({ queryKey: ['attendanceMonitor', selectedDate] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to reopen session');
    }
  });

  const handleLock = (sessionId: string) => {
    lockMutation.mutate(sessionId);
  };

  const handleReopenSubmit = () => {
    if (!reopenReason.trim()) {
      toast.error('Please specify a reopening explanation');
      return;
    }
    if (reopenTarget) {
      reopenMutation.mutate({ sessId: reopenTarget, reason: reopenReason });
    }
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon" className="text-slate-400 hover:text-slate-100">
            <Link to="/attendance">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-100">Daily Monitor</h1>
            <p className="text-sm text-slate-400">Lock, reopen, and check section completion</p>
          </div>
        </div>
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
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Class Stream</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Present</th>
                <th className="px-6 py-4">Absent</th>
                <th className="px-6 py-4">Late</th>
                <th className="px-6 py-4">Half-Day</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {monitorList && monitorList.length > 0 ? (
                monitorList.map((row: any) => (
                  <tr key={row.sectionId} className="hover:bg-slate-900/40">
                    <td className="px-6 py-4 font-bold text-slate-200">
                      {row.className} - {row.sectionName}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold
                        ${row.status === 'SUBMITTED' ? 'bg-emerald-500/10 text-emerald-400' : ''}
                        ${row.status === 'LOCKED' ? 'bg-blue-500/10 text-blue-400' : ''}
                        ${row.status === 'DRAFT' || row.status === 'REOPENED' ? 'bg-yellow-500/10 text-yellow-400' : ''}
                        ${row.status === 'MISSING' ? 'bg-rose-500/10 text-rose-400' : ''}
                      `}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-emerald-400">{row.present}</td>
                    <td className="px-6 py-4 font-semibold text-rose-400">{row.absent}</td>
                    <td className="px-6 py-4 text-amber-400">{row.late}</td>
                    <td className="px-6 py-4 text-blue-400">{row.halfDay}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {row.status !== 'MISSING' ? (
                          <>
                            <Button
                              onClick={() => navigate(`/attendance/mark?sessionId=${row.sessionId}`)}
                              variant="ghost"
                              size="icon"
                              className="text-slate-400 hover:text-slate-100"
                              title="View Session Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {row.status !== 'LOCKED' ? (
                              <Button
                                onClick={() => handleLock(row.sessionId)}
                                variant="ghost"
                                size="icon"
                                className="text-emerald-500 hover:bg-emerald-500/10"
                                title="Lock Session"
                              >
                                <Lock className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                onClick={() => setReopenTarget(row.sessionId)}
                                variant="ghost"
                                size="icon"
                                className="text-yellow-500 hover:bg-yellow-500/10"
                                title="Reopen Session"
                              >
                                <Unlock className="h-4 w-4" />
                              </Button>
                            )}
                          </>
                        ) : (
                          <Button
                            onClick={() => navigate(`/attendance/mark?sectionId=${row.sectionId}&date=${selectedDate}`)}
                            size="sm"
                            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs"
                          >
                            Mark
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No active school streams or sections found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reopen Dialogue */}
      <Dialog open={reopenTarget !== null} onOpenChange={(open) => !open && setReopenTarget(null)}>
        <DialogContent className="border-slate-800 bg-slate-900 text-slate-100 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-yellow-400" /> Confirm Session Reopen
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 text-sm text-slate-300">
            <p>Reopening this locked session allows teachers to edit attendance. Specify an audit reason:</p>
            <Input
              value={reopenReason}
              onChange={(e) => setReopenReason(e.target.value)}
              placeholder="e.g. Forgot late student arrival log correction"
              className="border-slate-800 bg-slate-950 text-slate-100"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" className="text-slate-400" onClick={() => setReopenTarget(null)}>
              Cancel
            </Button>
            <Button
              className="bg-yellow-600 hover:bg-yellow-500 text-white"
              onClick={handleReopenSubmit}
              disabled={reopenMutation.isPending}
            >
              Reopen Draft
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
