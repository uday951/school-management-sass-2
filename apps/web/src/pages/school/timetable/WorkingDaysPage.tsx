import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { timetableApi, WorkingDay } from '@/api/timetable';
import { Button } from '@/components/ui/button';
import { PageLoader } from '@/components/LoadingSpinner';
import { toast } from 'sonner';
import { ArrowLeft, Save, Calendar, CheckSquare, Square } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function WorkingDaysPage() {
  const queryClient = useQueryClient();
  const [workingDays, setWorkingDays] = React.useState<WorkingDay[]>([]);

  const { data: fetchedDays, isLoading } = useQuery({
    queryKey: ['workingDaysList'],
    queryFn: () => timetableApi.getWorkingDays()
  });

  React.useEffect(() => {
    if (fetchedDays) {
      setWorkingDays(fetchedDays);
    }
  }, [fetchedDays]);

  const updateMutation = useMutation({
    mutationFn: (payload: { dayOfWeek: string; isWorkingDay: boolean }[]) =>
      timetableApi.updateWorkingDays(payload),
    onSuccess: () => {
      toast.success('School working days successfully updated!');
      queryClient.invalidateQueries({ queryKey: ['workingDaysList'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update working days');
    }
  });

  const toggleDay = (dayOfWeek: string) => {
    setWorkingDays(prev => 
      prev.map(d => d.dayOfWeek === dayOfWeek ? { ...d, isWorkingDay: !d.isWorkingDay } : d)
    );
  };

  const handleSave = () => {
    const payload = workingDays.map(d => ({
      dayOfWeek: d.dayOfWeek,
      isWorkingDay: d.isWorkingDay
    }));
    updateMutation.mutate(payload);
  };

  if (isLoading) {
    return <PageLoader />;
  }

  // Pre-defined day order
  const dayOrder = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
  const orderedDays = [...workingDays].sort((a, b) => dayOrder.indexOf(a.dayOfWeek) - dayOrder.indexOf(b.dayOfWeek));

  return (
    <div className="space-y-6 p-6 text-slate-100 max-w-3xl">
      {/* Back Header */}
      <div className="flex items-center gap-4">
        <Link to="/timetable" className="rounded-lg bg-slate-900 border border-slate-800 p-2 text-slate-400 hover:text-slate-200">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Configure Working Days</h1>
          <p className="text-xs text-slate-400">Specify which days the school is active and accepting class timetables.</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <Calendar className="h-5 w-5 text-indigo-400" />
          <h2 className="text-lg font-semibold">Working Days Checklist</h2>
        </div>

        <div className="space-y-3">
          {orderedDays.map(day => (
            <div 
              key={day.id} 
              onClick={() => toggleDay(day.dayOfWeek)}
              className="flex items-center justify-between p-4 rounded-lg border border-slate-900 bg-slate-900/30 hover:bg-slate-900/60 cursor-pointer select-none transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                {day.isWorkingDay ? (
                  <CheckSquare className="h-5 w-5 text-indigo-400" />
                ) : (
                  <Square className="h-5 w-5 text-slate-600" />
                )}
                <span className={`font-medium ${day.isWorkingDay ? 'text-slate-100' : 'text-slate-500'}`}>
                  {day.dayOfWeek}
                </span>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${day.isWorkingDay ? 'bg-indigo-500/10 text-indigo-400' : 'bg-slate-800 text-slate-500'}`}>
                {day.isWorkingDay ? 'WORKING' : 'CLOSED'}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-900">
          <Link to="/timetable">
            <Button variant="ghost" className="text-slate-400 hover:text-slate-200">
              Cancel
            </Button>
          </Link>
          <Button 
            onClick={handleSave} 
            disabled={updateMutation.isPending}
            className="bg-indigo-600 hover:bg-indigo-700 text-slate-100 flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {updateMutation.isPending ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
}
