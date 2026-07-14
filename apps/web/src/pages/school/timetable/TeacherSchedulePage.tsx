import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { timetableApi } from '@/api/timetable';
import { PageLoader } from '@/components/LoadingSpinner';
import { 
  Clock, 
  MapPin, 
  Calendar, 
  BookOpen,
  ArrowRight,
  Info
} from 'lucide-react';

export default function TeacherSchedulePage() {
  const [dateStr, setDateStr] = React.useState(new Date().toISOString().split('T')[0]);

  // Fetch teacher's schedule on selected date
  const { data: schedule, isLoading } = useQuery({
    queryKey: ['teacherSchedule', dateStr],
    queryFn: () => timetableApi.getTeacherSchedule(dateStr)
  });

  const dateObj = new Date(dateStr);
  const daysOfWeek = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const dayName = daysOfWeek[dateObj.getDay()];

  return (
    <div className="space-y-6 p-6 text-slate-100 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          My Teaching Schedule
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review your scheduled classes, room assignments, and temporary substitution covers.
        </p>
      </div>

      {/* Date Filter Bar */}
      <div className="flex items-center gap-4 bg-slate-950 p-4 rounded-xl border border-slate-900">
        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
          <Calendar className="h-4 w-4 text-indigo-400" />
          Selected Date
        </span>
        <input
          type="date"
          value={dateStr}
          onChange={(e) => setDateStr(e.target.value)}
          style={{ colorScheme: 'dark' }}
          className="rounded bg-slate-900 border border-slate-800 p-2 text-xs text-slate-200 outline-none w-48"
        />
        <span className="text-xs text-slate-500 font-semibold">({dayName})</span>
      </div>

      {isLoading ? (
        <PageLoader />
      ) : (
        <div className="space-y-4">
          {schedule?.length === 0 ? (
            <div className="rounded-xl border border-slate-900 bg-slate-950 p-12 text-center text-slate-500 space-y-2">
              <Calendar className="h-8 w-8 opacity-45 mx-auto animate-pulse" />
              <p className="text-xs font-semibold">No scheduled slots or cover classes assigned today.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {schedule?.map((item: any) => (
                <div 
                  key={item.id}
                  className={`p-4 rounded-xl border transition-all ${item.isSubstitution ? 'border-pink-500/30 bg-pink-500/5' : 'border-slate-900 bg-slate-950 hover:border-slate-850'}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          {item.bellPeriod.name} &bull; {item.bellPeriod.startTime} - {item.bellPeriod.endTime}
                        </span>
                        {item.isSubstitution && (
                          <span className="bg-pink-500/10 text-pink-400 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-0.5">
                            <Info className="h-2.5 w-2.5" /> Substitution Cover
                          </span>
                        )}
                      </div>

                      <h3 className="font-extrabold text-slate-100 text-lg leading-snug">
                        {item.subject.name} ({item.subject.code})
                      </h3>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-450">
                        <span className="font-bold text-slate-300">
                          Class: {item.timetable.class.name} - {item.timetable.section.name}
                        </span>
                        {item.room && (
                          <span className="flex items-center gap-1 text-indigo-400/80">
                            <MapPin className="h-3.5 w-3.5" /> Room: {item.room.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
