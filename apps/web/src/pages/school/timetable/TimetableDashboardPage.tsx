import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { timetableApi } from '@/api/timetable';
import { PageLoader } from '@/components/LoadingSpinner';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  UserX, 
  AlertTriangle, 
  BookOpen, 
  RefreshCw, 
  ArrowRight, 
  FileText,
  UserCheck
} from 'lucide-react';

export default function TimetableDashboardPage() {
  const { data: timetables, isLoading: tLoading } = useQuery({
    queryKey: ['timetablesList'],
    queryFn: () => timetableApi.listTimetables()
  });

  const { data: rooms, isLoading: rLoading } = useQuery({
    queryKey: ['roomsList'],
    queryFn: () => timetableApi.listRooms()
  });

  const { data: substitutions, isLoading: sLoading } = useQuery({
    queryKey: ['substitutionsList'],
    queryFn: () => timetableApi.listSubstitutions(new Date().toISOString().split('T')[0])
  });

  const { data: availabilities, isLoading: aLoading } = useQuery({
    queryKey: ['availabilitiesList'],
    queryFn: () => timetableApi.listTeacherAvailability()
  });

  const isLoading = tLoading || rLoading || sLoading || aLoading;

  if (isLoading) {
    return <PageLoader />;
  }

  // Calculate metrics
  const draftCount = timetables?.filter(t => t.status === 'DRAFT').length || 0;
  const publishedCount = timetables?.filter(t => t.status === 'PUBLISHED').length || 0;
  const roomCount = rooms?.filter(r => r.status === 'ACTIVE').length || 0;
  const todaySubs = substitutions?.length || 0;
  const unavailCount = availabilities?.length || 0;

  return (
    <div className="space-y-8 p-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Timetable & Scheduling
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage bell schedules, rooms, class timetables, teacher availability, and substitution schedules.
          </p>
        </div>
      </div>

      {/* Quick Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1 */}
        <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md transition-all hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Published Schedules</span>
            <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400">
              <Calendar className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold">{publishedCount}</span>
            <span className="text-xs text-emerald-400 font-medium">Active</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Official class schedules live</p>
        </div>

        {/* Metric 2 */}
        <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md transition-all hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Timetable Drafts</span>
            <div className="rounded-lg bg-purple-500/10 p-2 text-purple-400">
              <FileText className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold">{draftCount}</span>
            <span className="text-xs text-amber-400 font-medium">Pending</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Currently in planning mode</p>
        </div>

        {/* Metric 3 */}
        <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md transition-all hover:border-pink-500/50 hover:shadow-lg hover:shadow-pink-500/5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Today's Substitutions</span>
            <div className="rounded-lg bg-pink-500/10 p-2 text-pink-400">
              <RefreshCw className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold">{todaySubs}</span>
            <span className="text-xs text-indigo-400 font-medium">Assigned</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Absences handled today</p>
        </div>

        {/* Metric 4 */}
        <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md transition-all hover:border-sky-500/50 hover:shadow-lg hover:shadow-sky-500/5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Active Rooms</span>
            <div className="rounded-lg bg-sky-500/10 p-2 text-sky-400">
              <MapPin className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold">{roomCount}</span>
            <span className="text-xs text-slate-400">Classrooms</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Available physical slots</p>
        </div>
      </div>

      {/* Main Workspace Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Quick Links Column */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-bold text-slate-200">Management Modules</h3>
          <div className="grid gap-6 sm:grid-cols-2">
            
            {/* Timetables list */}
            <Link to="/timetable/list" className="group rounded-xl border border-slate-800 bg-slate-950 p-5 transition-all hover:bg-slate-900/40 hover:border-slate-700 flex flex-col justify-between h-44">
              <div>
                <div className="rounded-lg bg-indigo-500/10 text-indigo-400 p-2.5 w-fit">
                  <Calendar className="h-5 w-5" />
                </div>
                <h4 className="mt-3 font-bold text-slate-200 group-hover:text-indigo-400 transition-colors">Class Timetables</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Design weekly scheduling drafts for sections, map subject slots, and resolve conflicts.
                </p>
              </div>
              <div className="flex items-center text-xs text-indigo-400 font-semibold gap-1 mt-3">
                Manage Class Schedules <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Bell Schedules */}
            <Link to="/timetable/bell-schedules" className="group rounded-xl border border-slate-800 bg-slate-950 p-5 transition-all hover:bg-slate-900/40 hover:border-slate-700 flex flex-col justify-between h-44">
              <div>
                <div className="rounded-lg bg-purple-500/10 text-purple-400 p-2.5 w-fit">
                  <Clock className="h-5 w-5" />
                </div>
                <h4 className="mt-3 font-bold text-slate-200 group-hover:text-purple-400 transition-colors">Bell Schedules & Working Days</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Configure school working days and design bell timelines with non-overlapping period segments.
                </p>
              </div>
              <div className="flex items-center text-xs text-purple-400 font-semibold gap-1 mt-3">
                Configure Timelines <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Substitutions */}
            <Link to="/timetable/substitutions" className="group rounded-xl border border-slate-800 bg-slate-950 p-5 transition-all hover:bg-slate-900/40 hover:border-slate-700 flex flex-col justify-between h-44">
              <div>
                <div className="rounded-lg bg-pink-500/10 text-pink-400 p-2.5 w-fit">
                  <RefreshCw className="h-5 w-5" />
                </div>
                <h4 className="mt-3 font-bold text-slate-200 group-hover:text-pink-400 transition-colors">Substitution Planner</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Map replacements for absent teachers using availability calendars and conflict flags.
                </p>
              </div>
              <div className="flex items-center text-xs text-pink-400 font-semibold gap-1 mt-3">
                Handle Substitution <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Teacher Availability */}
            <Link to="/timetable/availability" className="group rounded-xl border border-slate-800 bg-slate-950 p-5 transition-all hover:bg-slate-900/40 hover:border-slate-700 flex flex-col justify-between h-44">
              <div>
                <div className="rounded-lg bg-sky-500/10 text-sky-400 p-2.5 w-fit">
                  <UserX className="h-5 w-5" />
                </div>
                <h4 className="mt-3 font-bold text-slate-200 group-hover:text-sky-400 transition-colors">Teacher Availability</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Mark unavailable slots or preferred hours to prevent builder scheduling blocks.
                </p>
              </div>
              <div className="flex items-center text-xs text-sky-400 font-semibold gap-1 mt-3">
                Configure Availability <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Physical Rooms */}
            <Link to="/timetable/rooms" className="group rounded-xl border border-slate-800 bg-slate-950 p-5 transition-all hover:bg-slate-900/40 hover:border-slate-700 flex flex-col justify-between h-44">
              <div>
                <div className="rounded-lg bg-emerald-500/10 text-emerald-400 p-2.5 w-fit">
                  <MapPin className="h-5 w-5" />
                </div>
                <h4 className="mt-3 font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">Physical Rooms</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Maintain classrooms, science labs, and auditoriums to verify room occupancy.
                </p>
              </div>
              <div className="flex items-center text-xs text-emerald-400 font-semibold gap-1 mt-3">
                Manage School Rooms <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Schedule Overrides */}
            <Link to="/timetable/overrides" className="group rounded-xl border border-slate-800 bg-slate-950 p-5 transition-all hover:bg-slate-900/40 hover:border-slate-700 flex flex-col justify-between h-44">
              <div>
                <div className="rounded-lg bg-amber-500/10 text-amber-400 p-2.5 w-fit">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <h4 className="mt-3 font-bold text-slate-200 group-hover:text-amber-400 transition-colors">Temporary Overrides</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Log single-day calendar changes, special assemblies, sports events, or exam sessions.
                </p>
              </div>
              <div className="flex items-center text-xs text-amber-400 font-semibold gap-1 mt-3">
                Log Temp Overrides <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

          </div>
        </div>

        {/* Sidebar/Recent Activity Column */}
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-6">
            <h3 className="font-bold text-slate-200 mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-400" />
              System Status Summary
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-900">
                <span className="text-xs text-slate-400 font-medium">Working Days Status</span>
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">Configured</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-900">
                <span className="text-xs text-slate-400 font-medium">Conflict Warnings</span>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${unavailCount > 0 ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                  {unavailCount > 0 ? `${unavailCount} Unavailable` : '0 Conflicts'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-900">
                <span className="text-xs text-slate-400 font-medium">Today's Substitute Assignments</span>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${todaySubs > 0 ? 'bg-indigo-500/10 text-indigo-400' : 'bg-slate-800 text-slate-500'}`}>
                  {todaySubs} Assigned
                </span>
              </div>
            </div>

            <div className="mt-8 rounded-lg bg-indigo-500/5 border border-indigo-500/10 p-4 text-xs text-indigo-300/80 leading-relaxed">
              <span className="font-bold text-indigo-300 block mb-1">Conflict-Free Promise</span>
              The builder automatically runs background checks on teacher slots, room double-bookings, and subject assignments to enforce structural integrity in your scheduling.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
