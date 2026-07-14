import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceApi } from '@/api/attendance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowLeft, Save, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageLoader } from '@/components/LoadingSpinner';
import { toast } from 'sonner';

export default function AttendanceSettingsPage() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['attendanceSettings'],
    queryFn: attendanceApi.getSettings
  });

  const [form, setForm] = React.useState({
    dailyEnabled: true,
    periodEnabled: false,
    allowLate: true,
    allowHalfDay: true,
    allowExcused: true,
    allowLeave: true,
    minimumRequiredPercentage: 75,
    lateWeight: 1.0,
    halfDayWeight: 0.5,
    excusedWeight: 1.0,
    leaveWeight: 1.0
  });

  React.useEffect(() => {
    if (settings) {
      setForm({
        dailyEnabled: settings.dailyEnabled,
        periodEnabled: settings.periodEnabled,
        allowLate: settings.allowLate,
        allowHalfDay: settings.allowHalfDay,
        allowExcused: settings.allowExcused,
        allowLeave: settings.allowLeave,
        minimumRequiredPercentage: settings.minimumRequiredPercentage,
        lateWeight: settings.lateWeight,
        halfDayWeight: settings.halfDayWeight,
        excusedWeight: settings.excusedWeight,
        leaveWeight: settings.leaveWeight
      });
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => attendanceApi.updateSettings(data),
    onSuccess: () => {
      toast.success('Attendance policy settings updated successfully');
      queryClient.invalidateQueries({ queryKey: ['attendanceSettings'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update settings');
    }
  });

  const handleToggle = (key: keyof typeof form) => {
    setForm(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleInputChange = (key: keyof typeof form, val: string) => {
    const num = parseFloat(val);
    setForm(prev => ({
      ...prev,
      [key]: isNaN(num) ? val : num
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(form);
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" className="text-slate-400 hover:text-slate-100">
          <Link to="/attendance">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-100">Attendance Settings</h1>
          <p className="text-sm text-slate-400">Configure weighting parameters, status options, and minimum compliance thresholds</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        <Card className="border-slate-800 bg-slate-900/50 text-slate-100">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-200">Enabled Attendance Scopes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
              <div>
                <h4 className="font-bold text-slate-200">Daily Attendance</h4>
                <p className="text-xs text-slate-400">Mark student presence once per day at section level</p>
              </div>
              <input
                type="checkbox"
                checked={form.dailyEnabled}
                onChange={() => handleToggle('dailyEnabled')}
                className="h-5 w-5 rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
              <div>
                <h4 className="font-bold text-slate-200 font-bold">Period-Wise Attendance Foundation</h4>
                <p className="text-xs text-slate-400">Enable subject-specific markers for timetable classes</p>
              </div>
              <input
                type="checkbox"
                checked={form.periodEnabled}
                onChange={() => handleToggle('periodEnabled')}
                className="h-5 w-5 rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-indigo-500"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/50 text-slate-100">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-200">Mark Exceptions & Weight Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-300">Allow Late Entry</span>
                  <input
                    type="checkbox"
                    checked={form.allowLate}
                    onChange={() => handleToggle('allowLate')}
                    className="h-4.5 w-4.5 rounded border-slate-800 bg-slate-950 text-indigo-600"
                  />
                </div>
                {form.allowLate && (
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Late Weight multiplier (0.0 to 1.0)</label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      value={form.lateWeight}
                      onChange={(e) => handleInputChange('lateWeight', e.target.value)}
                      className="border-slate-800 bg-slate-950 text-slate-100 text-sm"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-300">Allow Half-Day Log</span>
                  <input
                    type="checkbox"
                    checked={form.allowHalfDay}
                    onChange={() => handleToggle('allowHalfDay')}
                    className="h-4.5 w-4.5 rounded border-slate-800 bg-slate-950 text-indigo-600"
                  />
                </div>
                {form.allowHalfDay && (
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Half-Day Weight multiplier (0.0 to 1.0)</label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      value={form.halfDayWeight}
                      onChange={(e) => handleInputChange('halfDayWeight', e.target.value)}
                      className="border-slate-800 bg-slate-950 text-slate-100 text-sm"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-slate-800/60 pt-4 space-y-4">
              <h4 className="text-sm font-semibold text-slate-300">Minimum Required Compliance</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Target Percentage Threshold (e.g. 75%)</label>
                  <Input
                    type="number"
                    min="50"
                    max="100"
                    value={form.minimumRequiredPercentage}
                    onChange={(e) => handleInputChange('minimumRequiredPercentage', e.target.value)}
                    className="border-slate-800 bg-slate-950 text-slate-100 text-sm"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="submit" disabled={updateMutation.isPending} className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2">
            <Save className="h-4 w-4" /> Save Configuration
          </Button>
        </div>
      </form>
    </div>
  );
}
