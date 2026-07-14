import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { staffOpsApi } from '@/api/staffOps';
import { academicYearsApi } from '@/api/academicYears';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageLoader } from '@/components/LoadingSpinner';
import { toast } from 'sonner';
import { 
  Clock, 
  Calendar, 
  Plus, 
  FileText, 
  Check, 
  X,
  AlertCircle
} from 'lucide-react';

export default function MyStaffPortalPage() {
  const queryClient = useQueryClient();
  
  // Load current academic year
  const { data: academicYears } = useQuery({
    queryKey: ['academicYears'],
    queryFn: academicYearsApi.list
  });
  const currentAcademicYear = (academicYears as any)?.find((y: any) => y.isCurrent);

  // Load My Status & Requests
  const { data: todayStatus, isLoading: isTodayLoading } = useQuery({
    queryKey: ['myTodayStatus'],
    queryFn: staffOpsApi.getMyTodayStatus
  });

  const { data: myRequests, isLoading: isRequestsLoading } = useQuery({
    queryKey: ['myLeaveRequests'],
    queryFn: staffOpsApi.getMyLeaveRequests
  });

  const { data: myBalances, isLoading: isBalancesLoading } = useQuery({
    queryKey: ['myLeaveBalances', currentAcademicYear?.id],
    queryFn: () => staffOpsApi.getMyBalances(currentAcademicYear?.id || ''),
    enabled: !!currentAcademicYear
  });

  const { data: leaveTypes } = useQuery({
    queryKey: ['leaveTypes'],
    queryFn: staffOpsApi.listLeaveTypes
  });

  // Clock Actions
  const checkInMutation = useMutation({
    mutationFn: (remarks?: string) => staffOpsApi.selfCheckIn(remarks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myTodayStatus'] });
      toast.success('Successfully checked in for today!');
    },
    onError: (err: any) => toast.error(err.message || 'Check-in failed')
  });

  const checkOutMutation = useMutation({
    mutationFn: (remarks?: string) => staffOpsApi.selfCheckOut(remarks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myTodayStatus'] });
      toast.success('Successfully checked out for today!');
    },
    onError: (err: any) => toast.error(err.message || 'Check-out failed')
  });

  // Submit Leave state
  const [isOpen, setIsOpen] = React.useState(false);
  const [form, setForm] = React.useState({
    leaveTypeId: '',
    startDate: '',
    endDate: '',
    partialDayType: 'FULL_DAY',
    reason: '',
    attachmentUrl: ''
  });

  const submitLeaveMutation = useMutation({
    mutationFn: (data: typeof form) => staffOpsApi.submitLeaveRequest({
      ...data,
      academicYearId: currentAcademicYear?.id || ''
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myLeaveRequests'] });
      toast.success('Leave request submitted successfully');
      setIsOpen(false);
      setForm({ leaveTypeId: '', startDate: '', endDate: '', partialDayType: 'FULL_DAY', reason: '', attachmentUrl: '' });
    },
    onError: (err: any) => toast.error(err.message || 'Failed to submit leave request')
  });

  if (isTodayLoading || isRequestsLoading || isBalancesLoading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto text-slate-100 bg-slate-950 min-h-screen">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-800 pb-5 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-200 via-slate-100 to-indigo-100 bg-clip-text text-transparent">
            My Staff Portal
          </h1>
          <p className="text-sm text-slate-400">Mark your check-ins, request paid leaves, and inspect annual holiday credits.</p>
        </div>
        <Button onClick={() => setIsOpen(true)} className="bg-primary hover:bg-primary/95 text-white flex items-center gap-2">
          <Plus className="h-4 w-4" /> Request Leave
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Clock desk card */}
        <Card className="border-slate-800 bg-slate-900/40 p-6 flex flex-col justify-between backdrop-blur-md">
          <div className="space-y-4">
            <h3 className="font-bold text-slate-200 flex items-center gap-2 text-md">
              <Clock className="h-5 w-5 text-indigo-400" /> Attendance Desk
            </h3>
            <div className="rounded-xl bg-slate-950 p-4 border border-slate-900 text-center">
              <div className="text-xs text-slate-400 uppercase tracking-wider">Clock Status Today</div>
              <div className="text-2xl font-black text-indigo-400 mt-2">
                {todayStatus?.status || 'OFF WORK'}
              </div>
              {todayStatus?.checkInTime && (
                <div className="text-[10px] text-slate-500 mt-1 font-mono">
                  In: {new Date(todayStatus.checkInTime).toLocaleTimeString()}
                </div>
              )}
              {todayStatus?.checkOutTime && (
                <div className="text-[10px] text-slate-500 font-mono">
                  Out: {new Date(todayStatus.checkOutTime).toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
          <div className="grid gap-2 grid-cols-2 mt-6">
            <Button className="bg-emerald-600 hover:bg-emerald-500" disabled={!!todayStatus?.checkInTime} onClick={() => checkInMutation.mutate('Clocked in')}>
              Check In
            </Button>
            <Button variant="outline" className="border-slate-800 hover:bg-slate-900" disabled={!todayStatus?.checkInTime || !!todayStatus?.checkOutTime} onClick={() => checkOutMutation.mutate('Clocked out')}>
              Check Out
            </Button>
          </div>
        </Card>

        {/* Leave Balances card */}
        <Card className="border-slate-800 bg-slate-900/40 p-6 md:col-span-2 backdrop-blur-md">
          <h3 className="font-bold text-slate-200 flex items-center gap-2 text-md mb-4">
            <Calendar className="h-5 w-5 text-indigo-400" /> Leave Balance Directory
          </h3>
          {myBalances?.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-6 text-center">No leave balance mappings found. Contact admin to assign policies.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-3">
              {myBalances?.map(bal => (
                <div key={bal.id} className="rounded-xl bg-slate-950 p-4 border border-slate-800">
                  <div className="text-xs font-semibold text-slate-400 truncate">{bal.leaveType?.name}</div>
                  <div className="text-2xl font-black text-slate-100 mt-2">{bal.remaining} <span className="text-xs font-normal text-slate-400">Left</span></div>
                  <div className="text-[10px] text-slate-500 mt-1 font-mono">Used: {bal.used} / Allowance: {bal.openingBalance}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* History table */}
      <Card className="border-slate-800 bg-slate-900/40">
        <CardHeader>
          <CardTitle className="text-lg font-bold">My Leave History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="text-slate-400">Leave Type</TableHead>
                <TableHead className="text-slate-400">Dates Range</TableHead>
                <TableHead className="text-slate-400">Reason</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400">Review Feedback</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myRequests?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-slate-500 italic">No leaves requested yet.</TableCell>
                </TableRow>
              ) : (
                myRequests?.map(req => (
                  <TableRow key={req.id} className="border-slate-800 hover:bg-slate-900/20">
                    <TableCell className="font-semibold">{req.leaveType?.name}</TableCell>
                    <TableCell>{new Date(req.startDate).toLocaleDateString()} to {new Date(req.endDate).toLocaleDateString()}</TableCell>
                    <TableCell className="max-w-xs truncate">{req.reason}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        req.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400' :
                        req.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-400' :
                        'bg-amber-500/10 text-amber-400'
                      }`}>
                        {req.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-400 text-xs italic">{req.reviewComment || 'Awaiting response'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Leave Request Dialog Form */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg border-slate-800 bg-slate-900 text-slate-100">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Submit Leave Application</CardTitle>
              <CardDescription className="text-slate-400">Fill details. Approval check will run balance validations.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Leave Type *</Label>
                <Select value={form.leaveTypeId} onValueChange={val => setForm({ ...form, leaveTypeId: val })}>
                  <SelectTrigger className="bg-slate-950 border-slate-800">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-950 border-slate-800 text-slate-100">
                    {leaveTypes?.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-4 grid-cols-2">
                <div>
                  <Label>Start Date *</Label>
                  <Input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} className="bg-slate-950 border-slate-800" />
                </div>
                <div>
                  <Label>End Date *</Label>
                  <Input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} className="bg-slate-950 border-slate-800" />
                </div>
              </div>
              <div>
                <Label>Partial Day Selector</Label>
                <Select value={form.partialDayType} onValueChange={val => setForm({ ...form, partialDayType: val })}>
                  <SelectTrigger className="bg-slate-950 border-slate-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-950 border-slate-800 text-slate-100">
                    <SelectItem value="FULL_DAY">Full Day</SelectItem>
                    <SelectItem value="FIRST_HALF">First Half (AM)</SelectItem>
                    <SelectItem value="SECOND_HALF">Second Half (PM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Reason *</Label>
                <Input value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="Reason for leave" className="bg-slate-950 border-slate-800" />
              </div>
              <div>
                <Label>Document reference / URL (Optional)</Label>
                <Input value={form.attachmentUrl} onChange={e => setForm({ ...form, attachmentUrl: e.target.value })} placeholder="https://drive.google.com/..." className="bg-slate-950 border-slate-800" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 border-t border-slate-800 pt-4">
              <Button variant="outline" className="border-slate-800 hover:bg-slate-950" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button className="bg-primary hover:bg-primary/95 text-white" disabled={!form.leaveTypeId || !form.startDate || !form.endDate || !form.reason} onClick={() => submitLeaveMutation.mutate(form)}>
                Submit Application
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
