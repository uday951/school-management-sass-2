import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { timetableApi, TimetableEntry, BellPeriod } from '@/api/timetable';
import { subjectsApi } from '@/api/subjects';
import { assignmentsApi } from '@/api/assignments';
import { Button } from '@/components/ui/button';
import { PageLoader } from '@/components/LoadingSpinner';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Clock, 
  MapPin, 
  User, 
  Plus, 
  Trash, 
  Check, 
  AlertTriangle,
  Lock,
  Sparkles,
  BookOpen
} from 'lucide-react';

export default function TimetableBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  
  // Selected slot state
  const [activeSlot, setActiveSlot] = React.useState<{ day: string; period: BellPeriod; entry?: TimetableEntry } | null>(null);

  // Editor form state
  const [selectedSubjectId, setSelectedSubjectId] = React.useState('');
  const [selectedTeacherId, setSelectedTeacherId] = React.useState('');
  const [selectedRoomId, setSelectedRoomId] = React.useState('');
  const [notes, setNotes] = React.useState('');

  // Live conflicts validation state
  const [validationResult, setValidationResult] = React.useState<{ isValid: boolean; conflicts: string[] } | null>(null);

  // Fetch timetable details
  const { data: timetable, isLoading: tLoading } = useQuery({
    queryKey: ['timetable', id],
    queryFn: () => timetableApi.getTimetable(id!)
  });

  // Fetch all bell schedules to find periods
  const { data: bellSchedules, isLoading: bLoading } = useQuery({
    queryKey: ['bellSchedulesList'],
    queryFn: () => timetableApi.listBellSchedules()
  });

  // Fetch rooms
  const { data: rooms } = useQuery({
    queryKey: ['roomsList'],
    queryFn: () => timetableApi.listRooms()
  });

  // Fetch day mappings to find which day matches which schedule
  const { data: dayMappings } = useQuery({
    queryKey: ['dayMappingsList'],
    queryFn: () => timetableApi.getDaySchedules()
  });

  // Fetch mapped class subjects
  const { data: classSubjects } = useQuery({
    queryKey: ['classSubjectsList', timetable?.academicYearId, timetable?.classId, timetable?.sectionId],
    queryFn: () => subjectsApi.listMappings(timetable!.academicYearId, timetable!.classId, timetable!.sectionId),
    enabled: !!timetable
  });

  // Fetch teacher assignments
  const { data: teacherAssignments } = useQuery({
    queryKey: ['teacherAssignmentsList', timetable?.academicYearId, timetable?.classId, timetable?.sectionId],
    queryFn: () => assignmentsApi.listTeacherAssignments({
      academicYearId: timetable!.academicYearId,
      gradeLevelId: timetable!.classId,
      sectionId: timetable!.sectionId
    }),
    enabled: !!timetable
  });

  // Track conflict validations dynamically when form states change
  React.useEffect(() => {
    if (activeSlot && selectedSubjectId && selectedTeacherId) {
      const delayDebounceFn = setTimeout(() => {
        timetableApi.validateSlotConflicts(
          id!,
          {
            dayOfWeek: activeSlot.day,
            bellPeriodId: activeSlot.period.id,
            subjectId: selectedSubjectId,
            employeeId: selectedTeacherId,
            roomId: selectedRoomId || undefined,
            entryType: 'SUBJECT',
            notes: notes || undefined
          },
          activeSlot.entry?.id
        ).then(res => {
          setValidationResult(res);
        });
      }, 300);

      return () => clearTimeout(delayDebounceFn);
    } else {
      setValidationResult(null);
    }
  }, [selectedSubjectId, selectedTeacherId, selectedRoomId, notes, activeSlot]);

  // Mutations
  const addEntryMutation = useMutation({
    mutationFn: (payload: any) => timetableApi.addTimetableEntry(id!, payload),
    onSuccess: () => {
      toast.success('Timetable entry successfully updated!');
      setActiveSlot(null);
      queryClient.invalidateQueries({ queryKey: ['timetable', id] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update entry');
    }
  });

  const deleteEntryMutation = useMutation({
    mutationFn: (entryId: string) => timetableApi.deleteTimetableEntry(entryId),
    onSuccess: () => {
      toast.success('Timetable slot cleared successfully.');
      setActiveSlot(null);
      queryClient.invalidateQueries({ queryKey: ['timetable', id] });
    }
  });

  const publishMutation = useMutation({
    mutationFn: () => timetableApi.publishTimetable(id!),
    onSuccess: () => {
      toast.success('Timetable has been successfully validated and published!');
      queryClient.invalidateQueries({ queryKey: ['timetable', id] });
      queryClient.invalidateQueries({ queryKey: ['timetablesList'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to publish timetable');
    }
  });

  if (tLoading || bLoading) {
    return <PageLoader />;
  }

  if (!timetable) {
    return <div className="p-6 text-slate-400">Timetable not found.</div>;
  }

  // Resolve days of week and their bell periods
  const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

  // Resolve periods for the default or active bell schedule
  const defaultSchedule = bellSchedules?.find(s => s.isDefault) || bellSchedules?.[0];
  const bellPeriods = defaultSchedule?.bellPeriods || [];

  const handleOpenSlot = (day: string, period: BellPeriod, entry?: TimetableEntry) => {
    if (timetable.status === 'PUBLISHED' || timetable.status === 'SUPERSEDED') {
      // Read-only visualizer if published
      return;
    }
    setActiveSlot({ day, period, entry });
    setSelectedSubjectId(entry?.subjectId || '');
    setSelectedTeacherId(entry?.employeeId || '');
    setSelectedRoomId(entry?.roomId || '');
    setNotes(entry?.notes || '');
    setValidationResult(null);
  };

  const handleSaveSlot = () => {
    if (activeSlot?.period.periodType === 'TEACHING' && (!selectedSubjectId || !selectedTeacherId)) {
      toast.error('Subject and Teacher assignments are required');
      return;
    }

    addEntryMutation.mutate({
      dayOfWeek: activeSlot!.day,
      bellPeriodId: activeSlot!.period.id,
      subjectId: selectedSubjectId || undefined,
      employeeId: selectedTeacherId || undefined,
      roomId: selectedRoomId || undefined,
      entryType: activeSlot!.period.periodType === 'TEACHING' ? 'SUBJECT' : activeSlot!.period.periodType,
      notes: notes || undefined
    });
  };

  const handleDeleteSlot = () => {
    if (activeSlot?.entry?.id) {
      deleteEntryMutation.mutate(activeSlot.entry.id);
    }
  };

  // Filter teachers by selected subject
  const eligibleTeachers = teacherAssignments
    ?.filter(a => a.subjectId === selectedSubjectId)
    .map(a => a.employee) || [];

  return (
    <div className="space-y-6 p-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-900 pb-4">
        <div className="flex items-center gap-4">
          <Link to="/timetable/list" className="rounded-lg bg-slate-900 border border-slate-800 p-2 text-slate-400 hover:text-slate-200">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">
                {timetable.class.name} - {timetable.section.name} Timetable
              </h1>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${timetable.status === 'PUBLISHED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                {timetable.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Version {timetable.versionNumber} &bull; Academic Year {timetable.academicYear.name}
            </p>
          </div>
        </div>

        {timetable.status === 'DRAFT' && (
          <Button 
            onClick={() => publishMutation.mutate()}
            disabled={publishMutation.isPending}
            className="bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold flex items-center gap-1.5"
          >
            <Check className="h-4 w-4" />
            {publishMutation.isPending ? 'Validating...' : 'Publish Timetable'}
          </Button>
        )}
      </div>

      {/* Grid Container */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
        <table className="w-full border-collapse text-left min-w-[900px]">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/50">
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-36 border-r border-slate-800">
                Period Time
              </th>
              {daysOfWeek.map(day => (
                <th key={day} className="p-4 text-xs font-bold text-slate-350 uppercase tracking-wider text-center">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bellPeriods.map(period => {
              const isTeaching = period.periodType === 'TEACHING';

              return (
                <tr key={period.id} className="border-b border-slate-900 hover:bg-slate-900/10 transition-colors h-24">
                  {/* Period label/times */}
                  <td className="p-4 text-xs font-semibold text-slate-300 border-r border-slate-800 bg-slate-900/10 flex flex-col justify-center h-24">
                    <span className="font-bold text-slate-200">{period.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                      {period.startTime} - {period.endTime}
                    </span>
                  </td>

                  {/* Days */}
                  {daysOfWeek.map(day => {
                    const entry = timetable.entries.find(e => e.dayOfWeek === day && e.bellPeriodId === period.id);

                    if (!isTeaching) {
                      // Render locked non-teaching period
                      return (
                        <td key={day} className="p-2 border-r border-slate-900 bg-slate-900/30 text-center">
                          <div className="flex flex-col items-center justify-center text-slate-500 space-y-1">
                            <Lock className="h-3 w-3 opacity-45" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">{period.name}</span>
                          </div>
                        </td>
                      );
                    }

                    return (
                      <td 
                        key={day} 
                        onClick={() => handleOpenSlot(day, period, entry)}
                        className={`p-2 border-r border-slate-900 align-middle ${timetable.status === 'DRAFT' ? 'cursor-pointer' : ''}`}
                      >
                        {entry ? (
                          <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/50 hover:bg-slate-900 transition-all space-y-1.5">
                            <div className="flex items-start justify-between">
                              <span className="text-xs font-bold text-slate-200 leading-tight">
                                {entry.subject?.name}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1">
                              <User className="h-3 w-3 text-slate-500" />
                              {entry.teacher?.firstName} {entry.teacher?.lastName}
                            </div>
                            {entry.room && (
                              <div className="text-[10px] text-indigo-400/80 flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-slate-500" />
                                {entry.room.name}
                              </div>
                            )}
                          </div>
                        ) : (
                          timetable.status === 'DRAFT' && (
                            <div className="p-4 rounded-lg border border-dashed border-slate-800 bg-slate-950 hover:border-slate-700 hover:bg-slate-900/10 flex items-center justify-center text-slate-600 hover:text-slate-400 transition-all h-20">
                              <Plus className="h-4 w-4" />
                            </div>
                          )
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Slot Editor Dialog Modal */}
      {activeSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-400" />
              Configure Slot: {activeSlot.day} ({activeSlot.period.name})
            </h3>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
              Time range: {activeSlot.period.startTime} - {activeSlot.period.endTime}
            </p>

            <div className="space-y-4 mt-6">
              {/* Subject */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Select Subject *</label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => { setSelectedSubjectId(e.target.value); setSelectedTeacherId(''); }}
                  className="mt-1 w-full rounded bg-slate-900 border border-slate-800 p-2.5 text-xs text-slate-200 outline-none"
                >
                  <option value="">Choose subject...</option>
                  {classSubjects?.map(cs => (
                    <option key={cs.subjectId} value={cs.subjectId}>
                      {cs.subject?.name} ({cs.subject?.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Teacher */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Select Teacher *</label>
                <select
                  value={selectedTeacherId}
                  disabled={!selectedSubjectId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="mt-1 w-full rounded bg-slate-900 border border-slate-800 p-2.5 text-xs text-slate-200 outline-none disabled:opacity-40"
                >
                  <option value="">Choose teacher...</option>
                  {eligibleTeachers.map(t => (
                    <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
                  ))}
                </select>
                {!selectedSubjectId && (
                  <span className="text-[10px] text-slate-500 mt-1 block">Please select a subject first to view assigned faculty.</span>
                )}
              </div>

              {/* Room */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Select Room (Optional)</label>
                <select
                  value={selectedRoomId}
                  onChange={(e) => setSelectedRoomId(e.target.value)}
                  className="mt-1 w-full rounded bg-slate-900 border border-slate-800 p-2.5 text-xs text-slate-200 outline-none"
                >
                  <option value="">No Room Assigned</option>
                  {rooms?.map(rm => (
                    <option key={rm.id} value={rm.id}>{rm.name} (Cap: {rm.capacity || '-'})</option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Lab demonstration, revision class"
                  className="mt-1 w-full rounded bg-slate-900 border border-slate-800 p-2.5 text-xs text-slate-200 outline-none"
                />
              </div>

              {/* Conflicts Box */}
              {validationResult && !validationResult.isValid && (
                <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                    <AlertTriangle className="h-4 w-4" />
                    Conflict Warnings:
                  </div>
                  <ul className="list-disc pl-4 text-[10px] text-amber-200/80 leading-relaxed">
                    {validationResult.conflicts.map((c, i) => <li key={i}>{c}</li>)}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center gap-3 pt-6 border-t border-slate-900 mt-6">
              {activeSlot.entry ? (
                <Button 
                  onClick={handleDeleteSlot}
                  disabled={deleteEntryMutation.isPending}
                  className="bg-slate-950 border border-slate-850 hover:bg-slate-900 hover:text-red-400 text-xs px-3.5 flex items-center gap-1"
                >
                  <Trash className="h-4 w-4" /> Clear Slot
                </Button>
              ) : (
                <div />
              )}

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setActiveSlot(null)}
                  className="text-slate-400 hover:text-slate-200 text-xs px-3"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveSlot}
                  disabled={addEntryMutation.isPending || (validationResult !== null && !validationResult.isValid)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-xs px-4"
                >
                  Save Entry
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
