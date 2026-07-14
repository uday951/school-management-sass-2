import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { timetableApi } from '@/api/timetable';
import { PageLoader } from '@/components/LoadingSpinner';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Lock,
  BookOpen
} from 'lucide-react';

export default function StudentTimetablePage() {
  const { data: timetable, isLoading } = useQuery({
    queryKey: ['studentTimetable'],
    queryFn: () => timetableApi.getStudentTimetable()
  });

  if (isLoading) {
    return <PageLoader />;
  }

  const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

  // Resolve unique periods listed in timetable
  const periodsMap = new Map<string, any>();
  timetable?.entries?.forEach((e: any) => {
    periodsMap.set(e.bellPeriod.id, e.bellPeriod);
  });
  const bellPeriods = Array.from(periodsMap.values()).sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="space-y-6 p-6 text-slate-100">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-sky-400 bg-clip-text text-transparent">
          My Class Timetable
        </h1>
        {timetable?.class && (
          <p className="text-xs text-slate-400 mt-1">
            Weekly schedule for Class <span className="font-bold text-slate-350">{timetable.class.name} - {timetable.section.name}</span>
          </p>
        )}
      </div>

      {!timetable?.entries || timetable.entries.length === 0 ? (
        <div className="rounded-xl border border-slate-900 bg-slate-950 p-12 text-center text-slate-500 space-y-2 max-w-xl">
          <Calendar className="h-8 w-8 opacity-45 mx-auto" />
          <p className="text-xs">No active published timetable is scheduled for your section enrollment yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
          <table className="w-full border-collapse text-left min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50">
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-36 border-r border-slate-800">
                  Time Slot
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
                    {/* Time Slot Label */}
                    <td className="p-4 text-xs font-semibold text-slate-350 border-r border-slate-800 bg-slate-900/10 flex flex-col justify-center h-24">
                      <span className="font-bold text-slate-200">{period.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {period.startTime} - {period.endTime}
                      </span>
                    </td>

                    {/* Day Schedule Slots */}
                    {daysOfWeek.map(day => {
                      const entry = timetable.entries.find((e: any) => e.dayOfWeek === day && e.bellPeriodId === period.id);

                      if (!isTeaching) {
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
                        <td key={day} className="p-2 border-r border-slate-900 align-middle">
                          {entry ? (
                            <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/50 space-y-1.5">
                              <div className="text-xs font-bold text-slate-200 leading-tight">
                                {entry.subject?.name}
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
                            <div className="p-4 rounded bg-slate-950/20 border border-slate-900/30 h-20" />
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
      )}
    </div>
  );
}
