import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceApi } from '@/api/attendance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save, Send, Search, Check, AlertCircle, ShieldAlert, Sparkles } from 'lucide-react';
import { PageLoader } from '@/components/LoadingSpinner';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

type StatusType = 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'EXCUSED' | 'LEAVE';

interface StudentMark {
  studentId: string;
  studentEnrollmentId: string;
  firstName: string;
  lastName: string;
  admissionNumber: string;
  rollNumber?: string;
  status: StatusType;
  reason?: string;
  remarks?: string;
}

export default function MarkAttendancePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const sessionId = searchParams.get('sessionId');
  const sectionIdParam = searchParams.get('sectionId');
  const dateParam = searchParams.get('date');

  const [searchQuery, setSearchQuery] = React.useState('');
  const [studentMarks, setStudentMarks] = React.useState<StudentMark[]>([]);
  const [notes, setNotes] = React.useState('');
  
  // Correction dialog states
  const [showCorrectionDialog, setShowCorrectionDialog] = React.useState(false);
  const [correctionReason, setCorrectionReason] = React.useState('');
  const [correctionItems, setCorrectionItems] = React.useState<Record<string, StatusType>>({});

  // 1. Fetch academic details / assignments to map current year
  const { data: myClasses, isLoading: loadingClasses } = useQuery({
    queryKey: ['myClasses'],
    queryFn: attendanceApi.getMyClasses
  });

  // Resolve matching class/section context
  const selectedClassContext = React.useMemo(() => {
    if (!myClasses) return null;
    if (sessionId) return null; // Resolved from session fetch
    return myClasses.find((c: any) => c.sectionId === sectionIdParam) || myClasses[0];
  }, [myClasses, sectionIdParam, sessionId]);

  const [academicYearId, setAcademicYearId] = React.useState('');

  // Auto-resolve active academic year if not present
  React.useEffect(() => {
    // Standard endpoint to get current academic year can be queried, or default to mock/db-resolved values.
    // For now we'll fetch from any loaded context or use a default database ObjectId string.
    // We can resolve it by getting the settings config.
  }, []);

  // Fetch settings for active limits
  const { data: settings } = useQuery({
    queryKey: ['attendanceSettings'],
    queryFn: attendanceApi.getSettings
  });

  // Load active academic year from settings/tenant or fallback
  const finalYearId = settings?.tenant?.academicYears?.find((y: any) => y.isCurrent)?.id || 'current';

  // 2. Fetch session details if sessionId is active
  const { data: sessionData, isLoading: loadingSession } = useQuery({
    queryKey: ['attendanceSession', sessionId],
    queryFn: () => attendanceApi.getSession(sessionId!),
    enabled: !!sessionId
  });

  // 3. Fetch Roster if creating a new session
  const rosterParams = React.useMemo(() => {
    if (sessionId) return null;
    if (!selectedClassContext) return null;
    return {
      academicYearId: finalYearId,
      classId: selectedClassContext.classId,
      sectionId: selectedClassContext.sectionId,
      date: dateParam || new Date().toISOString().split('T')[0]
    };
  }, [sessionId, selectedClassContext, finalYearId, dateParam]);

  const { data: rosterData, isLoading: loadingRoster } = useQuery({
    queryKey: ['roster', rosterParams],
    queryFn: () => attendanceApi.getRoster(rosterParams!),
    enabled: !!rosterParams
  });

  // Sync sessionData or rosterData into local markings state
  React.useEffect(() => {
    if (sessionId && sessionData) {
      setNotes(sessionData.notes || '');
      setStudentMarks(
        sessionData.records.map((r: any) => ({
          studentId: r.studentId,
          studentEnrollmentId: r.studentEnrollmentId,
          firstName: r.student.firstName,
          lastName: r.student.lastName,
          admissionNumber: r.student.admissionNumber,
          status: r.status,
          reason: r.reason || '',
          remarks: r.remarks || ''
        }))
      );
    } else if (!sessionId && rosterData) {
      setStudentMarks(
        rosterData.map((r: any) => ({
          studentId: r.studentId,
          studentEnrollmentId: r.studentEnrollmentId,
          firstName: r.firstName,
          lastName: r.lastName,
          admissionNumber: r.admissionNumber,
          rollNumber: r.rollNumber,
          status: 'PRESENT' // default all present for speed
        }))
      );
    }
  }, [sessionId, sessionData, rosterData]);

  // Mutations
  const draftMutation = useMutation({
    mutationFn: (data: any) => attendanceApi.saveDraft(data),
    onSuccess: (res: any) => {
      toast.success('Draft saved successfully!');
      if (!sessionId) {
        navigate(`/attendance/mark?sessionId=${res.id}`, { replace: true });
      } else {
        queryClient.invalidateQueries({ queryKey: ['attendanceSession', sessionId] });
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to save draft');
    }
  });

  const submitMutation = useMutation({
    mutationFn: ({ sessId, data }: { sessId: string; data: any }) =>
      attendanceApi.submitAttendance(sessId, data),
    onSuccess: () => {
      toast.success('Attendance submitted and finalized!');
      navigate('/attendance');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to submit attendance');
    }
  });

  const correctionMutation = useMutation({
    mutationFn: ({ sessId, data }: { sessId: string; data: any }) =>
      attendanceApi.submitCorrection(sessId, data),
    onSuccess: () => {
      toast.success('Correction request submitted to admin approval queue!');
      setShowCorrectionDialog(false);
      setCorrectionReason('');
      setCorrectionItems({});
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to submit correction request');
    }
  });

  // Action Handlers
  const handleStatusChange = (studentId: string, status: StatusType) => {
    if (sessionData?.status === 'SUBMITTED' || sessionData?.status === 'LOCKED') {
      // If locked/submitted, toggle in correction dictionary
      setCorrectionItems(prev => ({
        ...prev,
        [studentId]: status
      }));
      return;
    }

    setStudentMarks(prev =>
      prev.map(m => (m.studentId === studentId ? { ...m, status } : m))
    );
  };

  const handleMarkAll = (status: StatusType) => {
    if (sessionData?.status === 'SUBMITTED' || sessionData?.status === 'LOCKED') return;
    setStudentMarks(prev => prev.map(m => ({ ...m, status })));
    toast.info(`All students marked as ${status}`);
  };

  const handleSaveDraft = () => {
    const classCtx = selectedClassContext || sessionData;
    if (!classCtx) return;

    draftMutation.mutate({
      academicYearId: sessionData?.academicYearId || finalYearId,
      classId: classCtx.classId || classCtx.class?.id,
      sectionId: classCtx.sectionId || classCtx.section?.id,
      attendanceDate: dateParam || sessionData?.attendanceDate || new Date().toISOString().split('T')[0],
      attendanceType: 'DAILY',
      notes,
      records: studentMarks.map(m => ({
        studentId: m.studentId,
        studentEnrollmentId: m.studentEnrollmentId,
        status: m.status,
        reason: m.reason,
        remarks: m.remarks
      }))
    });
  };

  const handleSubmitFinal = () => {
    const activeSessionId = sessionId || draftMutation.data?.id;
    if (!activeSessionId) {
      // If no draft session ID is created yet, save draft first then submit
      toast.error('Please save this attendance as a draft first before submitting.');
      return;
    }

    submitMutation.mutate({
      sessId: activeSessionId,
      data: {
        notes,
        records: studentMarks.map(m => ({
          studentId: m.studentId,
          studentEnrollmentId: m.studentEnrollmentId,
          status: m.status,
          reason: m.reason,
          remarks: m.remarks
        }))
      }
    });
  };

  const handleCorrectionSubmit = () => {
    if (!correctionReason.trim()) {
      toast.error('Please write a correction justification statement');
      return;
    }

    const items = Object.entries(correctionItems).map(([studentId, requestedStatus]) => {
      const orig = sessionData.records.find((r: any) => r.studentId === studentId);
      return {
        attendanceRecordId: orig.id,
        oldStatus: orig.status,
        requestedStatus,
        reason: correctionReason
      };
    });

    if (items.length === 0) {
      toast.error('No status overrides selected to request');
      return;
    }

    correctionMutation.mutate({
      sessId: sessionId!,
      data: {
        reason: correctionReason,
        items
      }
    });
  };

  // Filters
  const filteredMarks = React.useMemo(() => {
    return studentMarks.filter(m =>
      `${m.firstName} ${m.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.admissionNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [studentMarks, searchQuery]);

  const stats = React.useMemo(() => {
    const total = studentMarks.length;
    const present = studentMarks.filter(m => m.status === 'PRESENT').length;
    const absent = studentMarks.filter(m => m.status === 'ABSENT').length;
    const late = studentMarks.filter(m => m.status === 'LATE').length;
    const halfDay = studentMarks.filter(m => m.status === 'HALF_DAY').length;
    return { total, present, absent, late, halfDay };
  }, [studentMarks]);

  if (loadingClasses || loadingSession || loadingRoster) return <PageLoader />;

  const isFinalized = sessionData?.status === 'SUBMITTED' || sessionData?.status === 'LOCKED';
  const hasCorrectionChanges = Object.keys(correctionItems).length > 0;

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <Button onClick={() => navigate('/attendance')} variant="ghost" size="icon" className="text-slate-400 hover:text-slate-100">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-100 flex items-center gap-2">
              Mark Attendance
              {isFinalized && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-semibold text-blue-400">
                  Locked / Finalized
                </span>
              )}
            </h1>
            <p className="text-sm text-slate-400">
              {sessionId
                ? `${sessionData?.class?.name} - ${sessionData?.section?.name} | ${new Date(sessionData?.attendanceDate).toLocaleDateString()}`
                : `${selectedClassContext?.className} - ${selectedClassContext?.sectionName} | ${new Date(dateParam || '').toLocaleDateString()}`
              }
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!isFinalized ? (
            <>
              <Button onClick={handleSaveDraft} disabled={draftMutation.isPending} variant="outline" className="border-slate-800 text-slate-300 hover:bg-slate-900 gap-2">
                <Save className="h-4 w-4" /> Save Draft
              </Button>
              <Button onClick={handleSubmitFinal} disabled={submitMutation.isPending} className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2">
                <Send className="h-4 w-4" /> Submit
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setShowCorrectionDialog(true)}
              disabled={!hasCorrectionChanges}
              className="bg-yellow-600 hover:bg-yellow-500 text-white gap-2"
            >
              <ShieldAlert className="h-4 w-4" /> Request Correction ({Object.keys(correctionItems).length})
            </Button>
          )}
        </div>
      </div>

      {/* Roster Metrics Summary */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5 bg-slate-950 p-4 rounded-xl border border-slate-800/80">
        <div className="text-center p-2 border-r border-slate-800/60 last:border-0">
          <p className="text-xs text-slate-500 font-semibold uppercase">Total</p>
          <p className="text-xl font-black text-slate-200 mt-1">{stats.total}</p>
        </div>
        <div className="text-center p-2 border-r border-slate-800/60 last:border-0">
          <p className="text-xs text-emerald-500/80 font-semibold uppercase">Present</p>
          <p className="text-xl font-black text-emerald-400 mt-1">{stats.present}</p>
        </div>
        <div className="text-center p-2 border-r border-slate-800/60 last:border-0">
          <p className="text-xs text-rose-500/80 font-semibold uppercase">Absent</p>
          <p className="text-xl font-black text-rose-400 mt-1">{stats.absent}</p>
        </div>
        <div className="text-center p-2 border-r border-slate-800/60 last:border-0">
          <p className="text-xs text-amber-500/80 font-semibold uppercase">Late</p>
          <p className="text-xl font-black text-amber-400 mt-1">{stats.late}</p>
        </div>
        <div className="text-center p-2 last:border-0">
          <p className="text-xs text-blue-500/80 font-semibold uppercase">Half-Day</p>
          <p className="text-xl font-black text-blue-400 mt-1">{stats.halfDay}</p>
        </div>
      </div>

      {/* Exception mark actions (Sticky Toolbar context) */}
      {!isFinalized && (
        <div className="flex flex-wrap gap-2 justify-between items-center bg-slate-900/40 p-3 rounded-lg border border-slate-800/50">
          <span className="text-xs text-slate-400 font-semibold">Bulk Exceptions:</span>
          <div className="flex gap-2">
            <Button onClick={() => handleMarkAll('PRESENT')} variant="ghost" size="sm" className="text-xs hover:bg-emerald-500/10 text-emerald-400">
              Mark All Present
            </Button>
            <Button onClick={() => handleMarkAll('ABSENT')} variant="ghost" size="sm" className="text-xs hover:bg-rose-500/10 text-rose-400">
              Mark All Absent
            </Button>
          </div>
        </div>
      )}

      {/* Search & Student List */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or admission number..."
            className="pl-10 border-slate-800 bg-slate-950 text-slate-100"
          />
        </div>

        {/* Student Cards (mobile responsive grid) */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMarks.map((student) => {
            const hasCorrection = correctionItems[student.studentId] !== undefined;
            const currentStatus = correctionItems[student.studentId] || student.status;

            return (
              <div
                key={student.studentId}
                className={`relative flex flex-col justify-between p-4 rounded-xl border bg-slate-900/60 transition-all
                  ${hasCorrection ? 'border-yellow-500/40 ring-1 ring-yellow-500/20' : 'border-slate-800/80'}
                  ${currentStatus === 'ABSENT' ? 'bg-rose-950/5' : ''}
                `}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-200">{student.firstName} {student.lastName}</h4>
                      <p className="text-xs text-slate-500">Adm: {student.admissionNumber}</p>
                    </div>
                    {hasCorrection && (
                      <span className="inline-flex items-center gap-1 rounded bg-yellow-500/15 px-1.5 py-0.5 text-[10px] font-bold text-yellow-400 uppercase">
                        Change Requested
                      </span>
                    )}
                  </div>
                </div>

                {/* Status Toggle Grid */}
                <div className="mt-4 grid grid-cols-4 gap-1.5">
                  {(['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY'] as StatusType[]).map((st) => {
                    const active = currentStatus === st;
                    const isAllowed = 
                      st === 'PRESENT' || 
                      st === 'ABSENT' ||
                      (st === 'LATE' && settings?.allowLate) ||
                      (st === 'HALF_DAY' && settings?.allowHalfDay);

                    if (!isAllowed) return null;

                    return (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(student.studentId, st)}
                        className={`py-2 rounded-lg text-xs font-bold transition-all border
                          ${active && st === 'PRESENT' ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-950/50' : ''}
                          ${active && st === 'ABSENT' ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-950/50' : ''}
                          ${active && st === 'LATE' ? 'bg-amber-600 text-white border-amber-500 shadow-md shadow-amber-950/50' : ''}
                          ${active && st === 'HALF_DAY' ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-950/50' : ''}
                          ${!active ? 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-900' : ''}
                        `}
                      >
                        {st === 'PRESENT' && 'P'}
                        {st === 'ABSENT' && 'A'}
                        {st === 'LATE' && 'L'}
                        {st === 'HALF_DAY' && 'H'}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sessions Notes */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-2">
        <label className="text-xs font-semibold text-slate-400 uppercase">Session Memo / Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={isFinalized}
          placeholder="Include weather disruptions, special half-day announcements, or assembly logs..."
          className="w-full h-20 rounded-md border border-slate-800 bg-slate-950 p-2.5 text-sm text-slate-100 outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {/* Correction Dialog Form */}
      <Dialog open={showCorrectionDialog} onOpenChange={setShowCorrectionDialog}>
        <DialogContent className="border-slate-800 bg-slate-900 text-slate-100 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-yellow-400" /> Attendance Correction Request
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 text-sm text-slate-300">
            <p>You have customized status updates for locked logs. Provide the correction request explanation:</p>
            <Input
              value={correctionReason}
              onChange={(e) => setCorrectionReason(e.target.value)}
              placeholder="e.g. Student marked absent, but arrived 15m late with signed doctor slip."
              className="border-slate-800 bg-slate-950 text-slate-100"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" className="text-slate-400" onClick={() => setShowCorrectionDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-yellow-600 hover:bg-yellow-500 text-white font-semibold"
              onClick={handleCorrectionSubmit}
              disabled={correctionMutation.isPending}
            >
              Submit to Queue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
