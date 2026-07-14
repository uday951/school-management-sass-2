import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { timetableApi } from '@/api/timetable';
import { employeesApi } from '@/api/employees';
import { Button } from '@/components/ui/button';
import { PageLoader } from '@/components/LoadingSpinner';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  UserX, 
  Plus, 
  Trash, 
  Save, 
  User,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TeacherAvailabilityPage() {
  const queryClient = useQueryClient();
  
  // Form states
  const [employeeId, setEmployeeId] = React.useState('');
  const [dayOfWeek, setDayOfWeek] = React.useState('MONDAY');
  const [startTime, setStartTime] = React.useState('09:00');
  const [endTime, setEndTime] = React.useState('10:00');
  const [availabilityType, setAvailabilityType] = React.useState<'AVAILABLE' | 'UNAVAILABLE' | 'PREFERRED'>('UNAVAILABLE');
  const [reason, setReason] = React.useState('');

  // Fetch availabilities
  const { data: availabilities, isLoading: aLoading } = useQuery({
    queryKey: ['availabilitiesList'],
    queryFn: () => timetableApi.listTeacherAvailability()
  });

  // Fetch teaching staff
  const { data: staff, isLoading: sLoading } = useQuery({
    queryKey: ['employeesList'],
    queryFn: () => employeesApi.list({ page: 1, limit: 1000 })
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => timetableApi.createTeacherAvailability(data),
    onSuccess: () => {
      toast.success('Teacher availability restriction added!');
      setEmployeeId('');
      setReason('');
      queryClient.invalidateQueries({ queryKey: ['availabilitiesList'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to add availability restriction');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => timetableApi.deleteTeacherAvailability(id),
    onSuccess: () => {
      toast.success('Availability restriction removed');
      queryClient.invalidateQueries({ queryKey: ['availabilitiesList'] });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || !startTime || !endTime) {
      toast.error('Teacher and Time intervals are required');
      return;
    }

    if (startTime >= endTime) {
      toast.error('Start time must be before end time');
      return;
    }

    createMutation.mutate({
      employeeId,
      dayOfWeek,
      startTime,
      endTime,
      availabilityType,
      reason: reason || undefined
    });
  };

  const isLoading = aLoading || sLoading;

  if (isLoading) {
    return <PageLoader />;
  }

  // Filter teaching staff only
  const teachers = (staff?.data || []).filter((emp: any) => emp.employeeType === 'TEACHING') || [];

  return (
    <div className="space-y-8 p-6 text-slate-100">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/timetable" className="rounded-lg bg-slate-900 border border-slate-800 p-2 text-slate-400 hover:text-slate-200">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Teacher Availability Restrictions</h1>
          <p className="text-xs text-slate-400">Configure time intervals when a teacher is unavailable or preferred to teach.</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Pane: Form */}
        <div className="space-y-6">
          <h3 className="font-bold text-slate-200 flex items-center gap-2">
            <Plus className="h-4 w-4 text-amber-400" />
            Add Restriction
          </h3>

          <form onSubmit={handleSubmit} className="rounded-xl border border-slate-800 bg-slate-950 p-6 space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Select Teacher *</label>
              <select
                required
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="mt-1 w-full rounded bg-slate-900 border border-slate-800 p-2 text-sm text-slate-200 outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="">Choose teacher...</option>
                {teachers.map((t: any) => (
                  <option key={t.id} value={t.id}>{t.firstName} {t.lastName} ({t.employeeNumber})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Day of Week *</label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value)}
                className="mt-1 w-full rounded bg-slate-900 border border-slate-800 p-2 text-sm text-slate-200 outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="MONDAY">Monday</option>
                <option value="TUESDAY">Tuesday</option>
                <option value="WEDNESDAY">Wednesday</option>
                <option value="THURSDAY">Thursday</option>
                <option value="FRIDAY">Friday</option>
                <option value="SATURDAY">Saturday</option>
                <option value="SUNDAY">Sunday</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Start Time *</label>
                <input
                  type="text"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  placeholder="09:00"
                  className="mt-1 w-full rounded bg-slate-900 border border-slate-800 p-2 text-sm text-slate-200 outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">End Time *</label>
                <input
                  type="text"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  placeholder="10:30"
                  className="mt-1 w-full rounded bg-slate-900 border border-slate-800 p-2 text-sm text-slate-200 outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Availability Status</label>
              <select
                value={availabilityType}
                onChange={(e) => setAvailabilityType(e.target.value as any)}
                className="mt-1 w-full rounded bg-slate-900 border border-slate-800 p-2 text-sm text-slate-200 outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="UNAVAILABLE">Unavailable (Blocked)</option>
                <option value="PREFERRED">Preferred Slot</option>
                <option value="AVAILABLE">Available</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Reason / Notes</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Medical leave, Part-time shift"
                className="mt-1 w-full rounded bg-slate-900 border border-slate-800 p-2 text-sm text-slate-200 outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <Button
              type="submit"
              disabled={createMutation.isPending || !employeeId}
              className="w-full bg-amber-600 hover:bg-amber-700 text-slate-100 py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold transition-colors mt-2"
            >
              <Save className="h-4 w-4" />
              {createMutation.isPending ? 'Saving...' : 'Add Restriction'}
            </Button>
          </form>
        </div>

        {/* Right Pane: Catalog */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="font-bold text-slate-200 flex items-center gap-2">
            <UserX className="h-4 w-4 text-indigo-400" />
            Availability Constraints ({availabilities?.length || 0})
          </h3>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-6">
            {availabilities?.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-slate-500 space-y-2">
                <UserX className="h-8 w-8 opacity-40" />
                <p className="text-xs">No teacher availability restrictions added yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {availabilities?.map(avail => (
                  <div key={avail.id} className="p-4 rounded-xl border border-slate-900 bg-slate-900/10 flex justify-between items-center hover:border-slate-800 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-slate-900 border border-slate-800 p-2.5 text-slate-400">
                        <User className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-200">
                          {avail.employee.firstName} {avail.employee.lastName}
                        </h4>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                          <span className="font-semibold text-slate-350">{avail.dayOfWeek}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" /> {avail.startTime} - {avail.endTime}
                          </span>
                          {avail.reason && (
                            <span className="text-slate-500 italic">"{avail.reason}"</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${avail.availabilityType === 'UNAVAILABLE' ? 'bg-red-500/10 text-red-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
                        {avail.availabilityType}
                      </span>
                      <button
                        onClick={() => deleteMutation.mutate(avail.id)}
                        className="rounded p-2 text-slate-500 hover:bg-slate-900 hover:text-red-400"
                        title="Delete Restriction"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
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
