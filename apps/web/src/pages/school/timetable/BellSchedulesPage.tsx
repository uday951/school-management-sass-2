import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { timetableApi, BellSchedule, BellPeriod } from '@/api/timetable';
import { Button } from '@/components/ui/button';
import { PageLoader } from '@/components/LoadingSpinner';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Clock, 
  Plus, 
  Trash, 
  Save, 
  Check, 
  AlertTriangle,
  Calendar,
  Layers
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function BellSchedulesPage() {
  const queryClient = useQueryClient();
  const [selectedScheduleId, setSelectedScheduleId] = React.useState<string>('');
  const [isCreatingSchedule, setIsCreatingSchedule] = React.useState(false);
  const [newScheduleName, setNewScheduleName] = React.useState('');
  const [newScheduleDesc, setNewScheduleDesc] = React.useState('');
  const [newScheduleDefault, setNewScheduleDefault] = React.useState(false);

  // Local Bell Periods draft state
  const [periods, setPeriods] = React.useState<Omit<BellPeriod, 'id'>[]>([]);

  // Fetch Bell Schedules
  const { data: schedules, isLoading: sLoading } = useQuery({
    queryKey: ['bellSchedulesList'],
    queryFn: () => timetableApi.listBellSchedules()
  });

  // Fetch Working Days for mapping
  const { data: workingDays, isLoading: wLoading } = useQuery({
    queryKey: ['workingDaysList'],
    queryFn: () => timetableApi.getWorkingDays()
  });

  // Fetch Day Mappings
  const { data: dayMappings, isLoading: mLoading } = useQuery({
    queryKey: ['dayMappingsList'],
    queryFn: () => timetableApi.getDaySchedules()
  });

  const { data: activeSchedule } = useQuery({
    queryKey: ['bellSchedule', selectedScheduleId],
    queryFn: () => timetableApi.getBellSchedule(selectedScheduleId),
    enabled: !!selectedScheduleId
  });

  React.useEffect(() => {
    if (schedules && schedules.length > 0 && !selectedScheduleId) {
      const defaultSched = schedules.find(s => s.isDefault) || schedules[0];
      setSelectedScheduleId(defaultSched.id);
    }
  }, [schedules]);

  React.useEffect(() => {
    if (activeSchedule) {
      setPeriods(activeSchedule.bellPeriods.map(p => ({
        name: p.name,
        periodNumber: p.periodNumber,
        periodType: p.periodType,
        startTime: p.startTime,
        endTime: p.endTime,
        sortOrder: p.sortOrder
      })));
    }
  }, [activeSchedule]);

  // Mutations
  const createScheduleMutation = useMutation({
    mutationFn: (data: { name: string; description?: string; isDefault?: boolean }) => 
      timetableApi.createBellSchedule(data),
    onSuccess: (newSchedule) => {
      toast.success('Bell schedule created successfully!');
      setIsCreatingSchedule(false);
      setNewScheduleName('');
      setNewScheduleDesc('');
      setNewScheduleDefault(false);
      queryClient.invalidateQueries({ queryKey: ['bellSchedulesList'] });
      setSelectedScheduleId(newSchedule.id);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create schedule');
    }
  });

  const setDefaultMutation = useMutation({
    mutationFn: (id: string) => timetableApi.updateBellSchedule(id, { isDefault: true }),
    onSuccess: () => {
      toast.success('Default bell schedule updated!');
      queryClient.invalidateQueries({ queryKey: ['bellSchedulesList'] });
    }
  });

  const setPeriodsMutation = useMutation({
    mutationFn: (payload: { id: string; periods: Omit<BellPeriod, 'id'>[] }) =>
      timetableApi.setBellPeriods(payload.id, payload.periods),
    onSuccess: () => {
      toast.success('Timeline periods successfully updated!');
      queryClient.invalidateQueries({ queryKey: ['bellSchedulesList'] });
      queryClient.invalidateQueries({ queryKey: ['bellSchedule', selectedScheduleId] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update bell periods');
    }
  });

  const setDayMappingsMutation = useMutation({
    mutationFn: (mappings: { dayOfWeek: string; bellScheduleId: string }[]) =>
      timetableApi.setDaySchedules(mappings),
    onSuccess: () => {
      toast.success('Working day mappings successfully updated!');
      queryClient.invalidateQueries({ queryKey: ['dayMappingsList'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update day mappings');
    }
  });

  const handleAddPeriod = () => {
    // Generate logical defaults based on last period
    let lastEndTime = '09:00';
    let lastSortOrder = 0;
    let nextPeriodNumber = 1;

    if (periods.length > 0) {
      const sorted = [...periods].sort((a, b) => a.sortOrder - b.sortOrder);
      const last = sorted[sorted.length - 1];
      lastEndTime = last.endTime;
      lastSortOrder = last.sortOrder + 1;
      
      const teachingPeriods = sorted.filter(p => p.periodType === 'TEACHING');
      if (teachingPeriods.length > 0) {
        const maxNum = Math.max(...teachingPeriods.map(p => p.periodNumber || 0));
        nextPeriodNumber = maxNum + 1;
      }
    }

    // Default 45 minute duration
    const parseTime = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };
    const formatTime = (mins: number) => {
      const h = Math.floor(mins / 60) % 24;
      const m = mins % 60;
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };

    const nextEndMins = parseTime(lastEndTime) + 45;
    const nextEndTime = formatTime(nextEndMins);

    setPeriods(prev => [
      ...prev,
      {
        name: `Period ${nextPeriodNumber}`,
        periodNumber: nextPeriodNumber,
        periodType: 'TEACHING',
        startTime: lastEndTime,
        endTime: nextEndTime,
        sortOrder: lastSortOrder
      }
    ]);
  };

  const handleRemovePeriod = (index: number) => {
    setPeriods(prev => prev.filter((_, i) => i !== index));
  };

  const handlePeriodChange = (index: number, field: keyof Omit<BellPeriod, 'id'>, value: any) => {
    setPeriods(prev => prev.map((p, i) => {
      if (i !== index) return p;
      if (field === 'periodNumber') {
        return { ...p, [field]: value === '' ? undefined : Number(value) };
      }
      return { ...p, [field]: value };
    }));
  };

  const handleSavePeriods = () => {
    // Validate locally
    for (let i = 0; i < periods.length; i++) {
      const p = periods[i];
      if (p.startTime >= p.endTime) {
        toast.error(`Period '${p.name}' start time must be before end time.`);
        return;
      }
    }

    setPeriodsMutation.mutate({
      id: selectedScheduleId,
      periods
    });
  };

  const handleDayMappingChange = (dayOfWeek: string, bellScheduleId: string) => {
    const activeMappings = dayMappings?.map(m => ({
      dayOfWeek: m.dayOfWeek,
      bellScheduleId: m.bellScheduleId
    })) || [];

    const existingIndex = activeMappings.findIndex(m => m.dayOfWeek === dayOfWeek);
    if (existingIndex > -1) {
      activeMappings[existingIndex].bellScheduleId = bellScheduleId;
    } else {
      activeMappings.push({ dayOfWeek, bellScheduleId });
    }

    setDayMappingsMutation.mutate(activeMappings);
  };

  const isLoading = sLoading || wLoading || mLoading;

  if (isLoading) {
    return <PageLoader />;
  }

  const activeDayDays = workingDays?.filter(w => w.isWorkingDay) || [];

  return (
    <div className="space-y-8 p-6 text-slate-100">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/timetable" className="rounded-lg bg-slate-900 border border-slate-800 p-2 text-slate-400 hover:text-slate-200">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bell Schedules & Timelines</h1>
          <p className="text-xs text-slate-400">Configure bell schedule periods and map them to school working days.</p>
        </div>
      </div>

      {/* Day Mapping Section */}
      <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 space-y-4">
        <div className="flex items-center gap-2 text-slate-200 font-bold text-sm">
          <Calendar className="h-4 w-4 text-indigo-400" />
          WORKING DAY BELL MAPPING
        </div>
        <p className="text-xs text-slate-400 max-w-xl">
          Assign which bell periods timeline applies to which active working days (e.g. Regular Schedule for Mon-Fri, Short Schedule for Sat).
        </p>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 pt-2">
          {activeDayDays.map(day => {
            const mapped = dayMappings?.find(m => m.dayOfWeek === day.dayOfWeek);
            return (
              <div key={day.id} className="rounded-lg border border-slate-900 bg-slate-900/20 p-3 space-y-2">
                <span className="text-xs font-semibold text-slate-400">{day.dayOfWeek}</span>
                <select
                  value={mapped?.bellScheduleId || ''}
                  onChange={(e) => handleDayMappingChange(day.dayOfWeek, e.target.value)}
                  className="w-full rounded bg-slate-950 border border-slate-800 p-1.5 text-xs text-slate-200 outline-none"
                >
                  <option value="">Map Schedule...</option>
                  {schedules?.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Pane: Schedules List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-200 flex items-center gap-2">
              <Layers className="h-4 w-4 text-purple-400" />
              Schedules
            </h3>
            <Button 
              onClick={() => setIsCreatingSchedule(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-xs px-3 py-1 flex items-center gap-1.5"
            >
              <Plus className="h-3 w-3" /> New Schedule
            </Button>
          </div>

          {/* Create Schedule Drawer/Form */}
          {isCreatingSchedule && (
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-4">
              <h4 className="text-sm font-semibold text-slate-200">Create Bell Schedule</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Schedule Name *</label>
                  <input
                    type="text"
                    value={newScheduleName}
                    onChange={(e) => setNewScheduleName(e.target.value)}
                    placeholder="e.g. Regular Day, Exam Day"
                    className="mt-1 w-full rounded bg-slate-900 border border-slate-800 p-2 text-sm text-slate-200 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Description</label>
                  <textarea
                    value={newScheduleDesc}
                    onChange={(e) => setNewScheduleDesc(e.target.value)}
                    placeholder="Short summary..."
                    className="mt-1 w-full rounded bg-slate-900 border border-slate-800 p-2 text-xs text-slate-200 outline-none h-16"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newScheduleDefault}
                    onChange={(e) => setNewScheduleDefault(e.target.checked)}
                    id="new-is-default"
                    className="rounded accent-indigo-500 h-3.5 w-3.5"
                  />
                  <label htmlFor="new-is-default" className="text-xs text-slate-350 cursor-pointer">Set as default schedule</label>
                </div>
              </div>
              <div className="flex justify-end gap-2 text-xs pt-2">
                <Button 
                  variant="ghost" 
                  onClick={() => setIsCreatingSchedule(false)}
                  className="text-slate-400 hover:text-slate-200 text-xs px-3"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => createScheduleMutation.mutate({
                    name: newScheduleName,
                    description: newScheduleDesc,
                    isDefault: newScheduleDefault
                  })}
                  disabled={!newScheduleName}
                  className="bg-indigo-600 hover:bg-indigo-700 text-xs px-3"
                >
                  Create
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {schedules?.map(sched => (
              <div 
                key={sched.id}
                onClick={() => setSelectedScheduleId(sched.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 flex flex-col justify-between ${selectedScheduleId === sched.id ? 'border-indigo-500 bg-indigo-500/5' : 'border-slate-800 bg-slate-950 hover:border-slate-750 hover:bg-slate-900/20'}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-200">{sched.name}</h4>
                    {sched.description && <p className="text-xs text-slate-400 mt-0.5">{sched.description}</p>}
                  </div>
                  {sched.isDefault && (
                    <span className="bg-indigo-500/10 text-indigo-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Default
                    </span>
                  )}
                </div>
                {!sched.isDefault && selectedScheduleId === sched.id && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDefaultMutation.mutate(sched.id);
                    }}
                    className="mt-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] py-1 h-7 text-indigo-400 uppercase font-bold"
                  >
                    Set as Default
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Pane: Periods Editor */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-200 flex items-center gap-2">
              <Clock className="h-4 w-4 text-indigo-400" />
              Timeline Editor
            </h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleAddPeriod}
                className="border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-900 hover:text-slate-100 text-xs px-3 flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" /> Add Period
              </Button>
              <Button
                onClick={handleSavePeriods}
                disabled={setPeriodsMutation.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-xs px-4 flex items-center gap-1.5"
              >
                <Save className="h-3.5 w-3.5" />
                {setPeriodsMutation.isPending ? 'Saving...' : 'Save Timeline'}
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 space-y-4">
            {periods.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-slate-500 space-y-2">
                <Clock className="h-8 w-8 opacity-40" />
                <p className="text-xs">No periods created yet in this schedule.</p>
                <Button variant="link" onClick={handleAddPeriod} className="text-indigo-400 text-xs mt-1">
                  Add your first period slot
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-12 gap-3 text-[10px] font-bold text-slate-400 uppercase px-2 border-b border-slate-900 pb-2">
                  <div className="col-span-3">Period Label</div>
                  <div className="col-span-2">Number</div>
                  <div className="col-span-3">Type</div>
                  <div className="col-span-2">Start Time</div>
                  <div className="col-span-2">End Time</div>
                </div>

                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {periods.map((p, index) => (
                    <div key={index} className="grid grid-cols-12 gap-3 items-center p-2 rounded bg-slate-900/30 border border-slate-900/50 hover:bg-slate-900/60 transition-colors">
                      {/* Name */}
                      <div className="col-span-3">
                        <input
                          type="text"
                          value={p.name}
                          onChange={(e) => handlePeriodChange(index, 'name', e.target.value)}
                          placeholder="e.g. Period 1, Break"
                          className="w-full rounded bg-slate-950 border border-slate-800 p-2 text-xs text-slate-200 outline-none"
                        />
                      </div>

                      {/* Number */}
                      <div className="col-span-2">
                        <input
                          type="number"
                          value={p.periodNumber || ''}
                          disabled={p.periodType !== 'TEACHING'}
                          onChange={(e) => handlePeriodChange(index, 'periodNumber', e.target.value)}
                          placeholder="-"
                          className="w-full rounded bg-slate-950 border border-slate-800 p-2 text-xs text-slate-200 outline-none disabled:opacity-40"
                        />
                      </div>

                      {/* Type */}
                      <div className="col-span-3">
                        <select
                          value={p.periodType}
                          onChange={(e) => handlePeriodChange(index, 'periodType', e.target.value)}
                          className="w-full rounded bg-slate-950 border border-slate-800 p-2 text-xs text-slate-200 outline-none"
                        >
                          <option value="TEACHING">Teaching Slot</option>
                          <option value="BREAK">Short Break</option>
                          <option value="LUNCH">Lunch Period</option>
                          <option value="ASSEMBLY">Morning Assembly</option>
                          <option value="ACTIVITY">Co-curricular Activity</option>
                          <option value="OTHER">Other</option>
                        </select>
                      </div>

                      {/* Start Time */}
                      <div className="col-span-2">
                        <input
                          type="text"
                          value={p.startTime}
                          onChange={(e) => handlePeriodChange(index, 'startTime', e.target.value)}
                          placeholder="HH:MM"
                          className="w-full rounded bg-slate-950 border border-slate-800 p-2 text-xs text-slate-200 outline-none"
                        />
                      </div>

                      {/* End Time & Delete Button */}
                      <div className="col-span-2 flex items-center gap-2">
                        <input
                          type="text"
                          value={p.endTime}
                          onChange={(e) => handlePeriodChange(index, 'endTime', e.target.value)}
                          placeholder="HH:MM"
                          className="w-full rounded bg-slate-950 border border-slate-800 p-2 text-xs text-slate-200 outline-none"
                        />
                        <button 
                          onClick={() => handleRemovePeriod(index)}
                          className="rounded p-2 text-slate-500 hover:bg-slate-900 hover:text-red-400"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
