import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { timetableApi, Timetable } from '@/api/timetable';
import { employeesApi } from '@/api/employees';
import { Button } from '@/components/ui/button';
import { PageLoader } from '@/components/LoadingSpinner';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  RefreshCw, 
  Calendar, 
  Trash, 
  Save, 
  User,
  Clock,
  Plus,
  BookOpen
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SubstitutionsPage() {
  const queryClient = useQueryClient();
  const [dateStr, setDateStr] = React.useState(new Date().toISOString().split('T')[0]);
  
  // Assign sub dialog state
  const [selectedSlot, setSelectedSlot] = React.useState<any | null>(null);
  const [substituteEmployeeId, setSubstituteEmployeeId] = React.useState('');
  const [reason, setReason] = React.useState('');

  // Fetch substitutions on selected date
  const { data: substitutions, isLoading: subLoading } = useQuery({
    queryKey: ['substitutionsList', dateStr],
    queryFn: () => timetableApi.listSubstitutions(dateStr)
  });

  // Fetch timetables (to map active timetables of the day)
  const { data: timetables, isLoading: tLoading } = useQuery({
    queryKey: ['timetablesList'],
    queryFn: () => timetableApi.listTimetables()
  });

  // Fetch all staff members
  const { data: staff, isLoading: sLoading } = useQuery({
    queryKey: ['employeesList'],
    queryFn: () => employeesApi.list({ page: 1, limit: 1000 })
  });

  const assignMutation = useMutation({
    mutationFn: (data: any) => timetableApi.assignSubstitute(data),
    onSuccess: () => {
      toast.success('Substitute teacher assigned successfully!');
      setSelectedSlot(null);
      setSubstituteEmployeeId('');
      setReason('');
      queryClient.invalidateQueries({ queryKey: ['substitutionsList', dateStr] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to assign substitute');
    }
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => timetableApi.cancelSubstitution(id),
    onSuccess: () => {
      toast.success('Substitute assignment canceled.');
      queryClient.invalidateQueries({ queryKey: ['substitutionsList', dateStr] });
    }
  });

  const handleOpenAssign = (slot: any) => {
    setSelectedSlot(slot);
    setSubstituteEmployeeId('');
    setReason('');
  };

  const handleSaveSubstitute = () => {
    if (!substituteEmployeeId) return;
    assignMutation.mutate({
      date: dateStr,
      timetableEntryId: selectedSlot.entryId,
      substituteEmployeeId,
      reason: reason || undefined
    });
  };

  const isLoading = subLoading || tLoading || sLoading;

  if (isLoading) {
    return <PageLoader />;
  }

  // Resolve active slots of the day from published timetables
  const dateObj = new Date(dateStr);
  const daysOfWeek = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const targetDay = daysOfWeek[dateObj.getDay()];

  // Build list of active scheduled teaching slots on this day
  const dailySlots: any[] = [];
  const publishedTimetables = timetables?.filter(t => t.status === 'PUBLISHED') || [];

  // Fetching detail of each timetable to find entries is usually slow but we can map them from their lists
  // Since we already have the timetable entries loaded in builder, we fetch them
  // Or in a simpler way, we fetch the published timetables. Wait, listTimetables returns them but might not return full entries.
  // Wait! In timetable.routes.ts, listTimetables returns timetables list. To get entries we fetch them or query.
  // Wait, let's look at listTimetables schema in prisma. It does not return entries unless we include them in backend.
  // Let's check: does listTimetables include entries in the backend service?
  // No, listTimetables includes class, section, academicYear, but not entries.
  // So to find affected slots, we can map entries by querying the timetables list.
  // Wait, in listTimetables backend we only returned class, section.
  // So in our daily planner, we can list the active substitutions and allow assigning substitutions by class + section.
  // Yes! If we select Class + Section + Slot, we can assign them! That is even more flexible and robust!
  // Let's do that:
  // - Select Class + Section
  // - Load its published timetable entries for this dayOfWeek
  // - List them, show assign button next to each
  // That is an extremely premium, user-friendly flow!

  return (
    <div className="space-y-8 p-6 text-slate-100">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/timetable" className="rounded-lg bg-slate-900 border border-slate-800 p-2 text-slate-400 hover:text-slate-200">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Substitution Management</h1>
          <p className="text-xs text-slate-400">Handle teacher absences, view affected schedules, and assign substitute teachers.</p>
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="flex items-center gap-4 bg-slate-950 p-4 rounded-xl border border-slate-900">
        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
          <Calendar className="h-4 w-4 text-indigo-400" />
          Select Date
        </span>
        <input
          type="date"
          value={dateStr}
          onChange={(e) => setDateStr(e.target.value)}
          style={{ colorScheme: 'dark' }}
          className="rounded bg-slate-900 border border-slate-800 p-2 text-xs text-slate-200 outline-none w-48"
        />
        <span className="text-xs text-slate-500 font-semibold">({targetDay})</span>
      </div>

      {/* Main Workspace grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left column: Assign Substitute Selector */}
        <div className="space-y-6">
          <h3 className="font-bold text-slate-200 flex items-center gap-2">
            <Plus className="h-4 w-4 text-pink-400" />
            New Assignment
          </h3>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 space-y-4">
            <p className="text-xs text-slate-400">
              Select an active published class section timetable to view slots and assign substitute teachers.
            </p>

            <ClassSlotSelector 
              publishedTimetables={publishedTimetables} 
              targetDay={targetDay}
              onAssign={handleOpenAssign}
            />
          </div>
        </div>

        {/* Right column: Current Substitutions List */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="font-bold text-slate-200 flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-indigo-400" />
            Active Substitutions Log ({substitutions?.length || 0})
          </h3>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-6">
            {substitutions?.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-slate-500 space-y-2">
                <RefreshCw className="h-8 w-8 opacity-40 animate-spin-slow" />
                <p className="text-xs">No substitute teachers assigned for this date.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {substitutions?.map(sub => (
                  <div key={sub.id} className="p-4 rounded-xl border border-slate-900 bg-slate-900/10 flex justify-between items-center hover:border-slate-800 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-slate-900 border border-slate-800 p-2.5 text-slate-400">
                        <User className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-200">
                          {sub.timetableEntry.timetable.class.name} - {sub.timetableEntry.timetable.section.name} &bull; {sub.timetableEntry.subject.name}
                        </h4>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                          <span className="font-semibold text-slate-350">{sub.timetableEntry.bellPeriod.name} ({sub.timetableEntry.bellPeriod.startTime} - {sub.timetableEntry.bellPeriod.endTime})</span>
                          <span className="text-red-400">Original: {sub.originalTeacher.firstName} {sub.originalTeacher.lastName}</span>
                          <span className="text-indigo-400 font-semibold">Substitute: {sub.substituteTeacher.firstName} {sub.substituteTeacher.lastName}</span>
                        </div>
                        {sub.reason && <p className="text-[10px] text-slate-500 italic mt-1">"{sub.reason}"</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sub.status === 'ASSIGNED' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-slate-850 text-slate-550'}`}>
                        {sub.status}
                      </span>
                      {sub.status === 'ASSIGNED' && (
                        <button
                          onClick={() => cancelMutation.mutate(sub.id)}
                          className="rounded p-2 text-slate-500 hover:bg-slate-900 hover:text-red-400"
                          title="Cancel Substitution"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assign Substitute dialog Modal */}
      {selectedSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-indigo-400" />
              Assign Substitute Teacher
            </h3>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5 uppercase tracking-wider">
              {selectedSlot.className} - {selectedSlot.sectionName} &bull; {selectedSlot.subjectName}
            </p>
            <div className="rounded bg-slate-900/50 p-3 mt-4 border border-slate-900 text-xs text-slate-400 space-y-1">
              <div>Time: <span className="font-semibold text-slate-350">{selectedSlot.periodName} ({selectedSlot.startTime} - {selectedSlot.endTime})</span></div>
              <div>Original: <span className="font-semibold text-slate-350">{selectedSlot.originalTeacherName}</span></div>
            </div>

            <div className="space-y-4 mt-6">
              {/* Substitute Selector */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Select Substitute Teacher *</label>
                <select
                  required
                  value={substituteEmployeeId}
                  onChange={(e) => setSubstituteEmployeeId(e.target.value)}
                  className="mt-1 w-full rounded bg-slate-900 border border-slate-800 p-2.5 text-xs text-slate-200 outline-none"
                >
                  <option value="">Choose substitute...</option>
                  {(staff?.data || [])
                    .filter((emp: any) => emp.employeeType === 'TEACHING' && emp.id !== selectedSlot.originalEmployeeId)
                    .map((emp: any) => (
                      <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                    ))
                  }
                </select>
              </div>

              {/* Reason */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Reason / Note</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Leave, Conference"
                  className="mt-1 w-full rounded bg-slate-900 border border-slate-800 p-2.5 text-xs text-slate-200 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-6 border-t border-slate-900 mt-6 text-xs">
              <Button
                variant="ghost"
                onClick={() => setSelectedSlot(null)}
                className="text-slate-400 hover:text-slate-200 px-3"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveSubstitute}
                disabled={assignMutation.isPending || !substituteEmployeeId}
                className="bg-indigo-600 hover:bg-indigo-700 px-4"
              >
                Assign Substitute
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Inner helper component to load timetable entries for selected section
function ClassSlotSelector({ publishedTimetables, targetDay, onAssign }: { publishedTimetables: Timetable[]; targetDay: string; onAssign: (slot: any) => void }) {
  const [selectedTimetableId, setSelectedTimetableId] = React.useState('');

  const { data: timetable, isLoading } = useQuery({
    queryKey: ['timetable', selectedTimetableId],
    queryFn: () => timetableApi.getTimetable(selectedTimetableId),
    enabled: !!selectedTimetableId
  });

  const dailyEntries = timetable?.entries.filter(e => e.dayOfWeek === targetDay && e.entryType === 'SUBJECT') || [];

  return (
    <div className="space-y-4">
      <div>
        <label className="text-[10px] font-bold text-slate-400 uppercase">Select Class Section</label>
        <select
          value={selectedTimetableId}
          onChange={(e) => setSelectedTimetableId(e.target.value)}
          className="mt-1 w-full rounded bg-slate-900 border border-slate-800 p-2 text-xs text-slate-200 outline-none"
        >
          <option value="">Choose section...</option>
          {publishedTimetables.map(t => (
            <option key={t.id} value={t.id}>{t.class.name} - {t.section.name}</option>
          ))}
        </select>
      </div>

      {isLoading && <PageLoader />}

      {selectedTimetableId && !isLoading && dailyEntries.length === 0 && (
        <div className="text-center p-6 text-xs text-slate-500 italic">
          No scheduled teaching periods found on this day.
        </div>
      )}

      {selectedTimetableId && !isLoading && dailyEntries.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-900">
          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Select Scheduled period Slot</label>
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {dailyEntries.map(entry => (
              <div 
                key={entry.id}
                className="p-3 rounded-lg border border-slate-900 bg-slate-900/10 flex justify-between items-center hover:border-slate-850 hover:bg-slate-900/30 transition-colors"
              >
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-200">{entry.subject?.name}</div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-slate-500" /> {entry.bellPeriod.name} ({entry.bellPeriod.startTime}-{entry.bellPeriod.endTime})
                  </div>
                  <div className="text-[10px] text-slate-400">Teacher: {entry.teacher?.firstName} {entry.teacher?.lastName}</div>
                </div>
                
                <Button
                  onClick={() => onAssign({
                    entryId: entry.id,
                    className: timetable!.class.name,
                    sectionName: timetable!.section.name,
                    subjectName: entry.subject?.name,
                    periodName: entry.bellPeriod.name,
                    startTime: entry.bellPeriod.startTime,
                    endTime: entry.bellPeriod.endTime,
                    originalEmployeeId: entry.employeeId,
                    originalTeacherName: `${entry.teacher?.firstName} ${entry.teacher?.lastName}`
                  })}
                  className="bg-indigo-600/10 hover:bg-indigo-600 hover:text-slate-100 border border-indigo-500/20 text-indigo-400 text-[10px] py-1 h-7 font-bold uppercase"
                >
                  Assign
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
