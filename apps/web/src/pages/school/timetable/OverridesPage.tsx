import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { timetableApi } from '@/api/timetable';
import { academicYearsApi } from '@/api/academicYears';
import { classesApi } from '@/api/classes';
import { Button } from '@/components/ui/button';
import { PageLoader } from '@/components/LoadingSpinner';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  AlertTriangle, 
  Calendar, 
  Trash, 
  Save, 
  Plus, 
  BookOpen,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function OverridesPage() {
  const queryClient = useQueryClient();
  const [dateStr, setDateStr] = React.useState(new Date().toISOString().split('T')[0]);

  // Form states
  const [targetDate, setTargetDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [selectedYearId, setSelectedYearId] = React.useState('');
  const [selectedClassId, setSelectedClassId] = React.useState('');
  const [selectedSectionId, setSelectedSectionId] = React.useState('');
  const [bellScheduleId, setBellScheduleId] = React.useState('');
  const [reason, setReason] = React.useState('');

  // Fetch Academic Years
  const { data: years } = useQuery({
    queryKey: ['academicYearsList'],
    queryFn: () => academicYearsApi.list()
  });

  // Fetch Classes
  const { data: classes } = useQuery({
    queryKey: ['classesList'],
    queryFn: () => classesApi.listClasses()
  });

  // Fetch Sections (depends on class)
  const { data: sections } = useQuery({
    queryKey: ['sectionsList', selectedClassId],
    queryFn: () => classesApi.listSections(selectedClassId),
    enabled: !!selectedClassId
  });

  // Fetch Bell Schedules
  const { data: bellSchedules } = useQuery({
    queryKey: ['bellSchedulesList'],
    queryFn: () => timetableApi.listBellSchedules()
  });

  // Fetch active overrides
  const { data: overrides, isLoading: oLoading } = useQuery({
    queryKey: ['overridesList', dateStr],
    queryFn: () => timetableApi.listOverrides(dateStr)
  });

  React.useEffect(() => {
    if (years && years.length > 0 && !selectedYearId) {
      const current = years.find(y => y.isCurrent) || years[0];
      setSelectedYearId(current.id);
    }
  }, [years]);

  const createOverrideMutation = useMutation({
    mutationFn: (data: any) => timetableApi.createOverride(data),
    onSuccess: () => {
      toast.success('Temporary schedule override logged successfully!');
      setReason('');
      setBellScheduleId('');
      setSelectedClassId('');
      setSelectedSectionId('');
      queryClient.invalidateQueries({ queryKey: ['overridesList', dateStr] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create override');
    }
  });

  const cancelOverrideMutation = useMutation({
    mutationFn: (id: string) => timetableApi.cancelOverride(id),
    onSuccess: () => {
      toast.success('Schedule override canceled.');
      queryClient.invalidateQueries({ queryKey: ['overridesList', dateStr] });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetDate || !selectedYearId || !selectedClassId || !selectedSectionId || !bellScheduleId) {
      toast.error('All asterisk fields are required');
      return;
    }

    createOverrideMutation.mutate({
      date: targetDate,
      academicYearId: selectedYearId,
      classId: selectedClassId,
      sectionId: selectedSectionId,
      bellScheduleId,
      reason: reason || undefined
    });
  };

  if (oLoading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-8 p-6 text-slate-100">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/timetable" className="rounded-lg bg-slate-900 border border-slate-800 p-2 text-slate-400 hover:text-slate-200">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Temporary Schedule Overrides</h1>
          <p className="text-xs text-slate-400">Map custom bell schedule schemes for specific class sections on targeted calendar dates.</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Side: Create Form */}
        <div className="space-y-6">
          <h3 className="font-bold text-slate-200 flex items-center gap-2">
            <Plus className="h-4 w-4 text-amber-400" />
            Add Calendar Override
          </h3>

          <form onSubmit={handleSubmit} className="rounded-xl border border-slate-800 bg-slate-950 p-6 space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Target Date *</label>
              <input
                type="date"
                required
                value={targetDate}
                style={{ colorScheme: 'dark' }}
                onChange={(e) => setTargetDate(e.target.value)}
                className="mt-1 w-full rounded bg-slate-900 border border-slate-800 p-2 text-sm text-slate-200 outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Academic Year *</label>
              <select
                required
                value={selectedYearId}
                onChange={(e) => setSelectedYearId(e.target.value)}
                className="mt-1 w-full rounded bg-slate-900 border border-slate-800 p-2 text-sm text-slate-200 outline-none"
              >
                <option value="">Select Year...</option>
                {years?.map(y => (
                  <option key={y.id} value={y.id}>{y.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Class Grade Level *</label>
              <select
                required
                value={selectedClassId}
                onChange={(e) => { setSelectedClassId(e.target.value); setSelectedSectionId(''); }}
                className="mt-1 w-full rounded bg-slate-900 border border-slate-800 p-2 text-sm text-slate-200 outline-none"
              >
                <option value="">Select Class...</option>
                {classes?.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Section Room *</label>
              <select
                required
                value={selectedSectionId}
                disabled={!selectedClassId}
                onChange={(e) => setSelectedSectionId(e.target.value)}
                className="mt-1 w-full rounded bg-slate-900 border border-slate-800 p-2 text-sm text-slate-200 outline-none disabled:opacity-40"
              >
                <option value="">Select Section...</option>
                {sections?.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Override Bell Schedule *</label>
              <select
                required
                value={bellScheduleId}
                onChange={(e) => setBellScheduleId(e.target.value)}
                className="mt-1 w-full rounded bg-slate-900 border border-slate-800 p-2 text-sm text-slate-200 outline-none"
              >
                <option value="">Select Schedule...</option>
                {bellSchedules?.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Notes / Reason</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Sports Day Schedule, Half Day"
                className="mt-1 w-full rounded bg-slate-900 border border-slate-800 p-2 text-sm text-slate-200 outline-none"
              />
            </div>

            <Button
              type="submit"
              disabled={createOverrideMutation.isPending || !bellScheduleId}
              className="w-full bg-amber-600 hover:bg-amber-700 text-slate-100 py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold transition-colors mt-2"
            >
              <Save className="h-4 w-4" />
              {createOverrideMutation.isPending ? 'Logging Overwrite...' : 'Log Overwrite'}
            </Button>
          </form>
        </div>

        {/* Right Side: Overrides Log */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center bg-slate-950 p-4 rounded-xl border border-slate-900">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-indigo-400" />
              Filter Override Date
            </span>
            <input
              type="date"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              style={{ colorScheme: 'dark' }}
              className="rounded bg-slate-900 border border-slate-800 p-2 text-xs text-slate-200 outline-none w-48"
            />
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-6">
            {overrides?.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-slate-500 space-y-2">
                <AlertTriangle className="h-8 w-8 opacity-40" />
                <p className="text-xs">No active timetable overrides on this date.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {overrides?.map(over => (
                  <div key={over.id} className="p-4 rounded-xl border border-slate-900 bg-slate-900/10 flex justify-between items-center hover:border-slate-800 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-slate-900 border border-slate-800 p-2.5 text-slate-400">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-200">
                          {over.class.name} - {over.section.name} &bull; {over.bellSchedule.name}
                        </h4>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                          <span className="font-semibold text-slate-350">Date: {new Date(over.date).toLocaleDateString()}</span>
                          {over.reason && <span className="text-slate-500 italic">"{over.reason}"</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${over.status === 'ACTIVE' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-850 text-slate-550'}`}>
                        {over.status}
                      </span>
                      {over.status === 'ACTIVE' && (
                        <button
                          onClick={() => cancelOverrideMutation.mutate(over.id)}
                          className="rounded p-2 text-slate-500 hover:bg-slate-900 hover:text-red-400"
                          title="Cancel Override"
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
    </div>
  );
}
