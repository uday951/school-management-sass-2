import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { onboardingApi } from '@/api/onboarding';
import { PageLoader } from '@/components/LoadingSpinner';
import { GraduationCap, Calendar, Layers, MapPin, Mail, Phone, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function StudentDashboardPage() {
  const { logout } = useAuth();
  const { data: student, isLoading, error } = useQuery({
    queryKey: ['studentSummary'],
    queryFn: onboardingApi.getStudentSummary
  });

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
  };

  if (isLoading) return <PageLoader />;

  if (error || !student) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-6 text-slate-100">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/50 p-8 text-center backdrop-blur-md">
          <GraduationCap className="mx-auto h-16 w-16 text-destructive animate-pulse" />
          <h2 className="mt-6 text-2xl font-bold tracking-tight">Access Denied</h2>
          <p className="mt-4 text-slate-400">Could not resolve your student profile registration. Please contact your school administrator.</p>
          <Button onClick={handleLogout} className="mt-8 w-full bg-destructive text-destructive-foreground hover:bg-destructive/90">Logout</Button>
        </div>
      </div>
    );
  }

  const currentEnrollment = student.enrollments?.find((e: any) => e.isCurrent);

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/30 via-slate-950 to-slate-950 p-6 text-slate-100 md:p-12">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <header className="flex flex-col justify-between gap-6 border-b border-slate-800 pb-8 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/30">
              <GraduationCap className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-200 via-slate-100 to-indigo-100 bg-clip-text text-transparent">
                Welcome back, {student.firstName}!
              </h1>
              <p className="text-sm text-slate-400">Student Portal &bull; Admission No: {student.admissionNumber}</p>
            </div>
          </div>
          <Button onClick={handleLogout} variant="outline" className="border-slate-800 bg-slate-900/50 hover:bg-slate-900 hover:text-destructive">
            Logout
          </Button>
        </header>

        {/* Overview Grid */}
        <div className="mt-8 grid gap-8 md:grid-cols-3">
          {/* Profile Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md">
            <h2 className="text-lg font-bold text-slate-200">Personal Information</h2>
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <Mail className="h-4 w-4 text-indigo-400" />
                <span className="truncate">{student.personalEmail || 'No personal email mapped'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <Phone className="h-4 w-4 text-indigo-400" />
                <span>{student.personalPhone || 'No phone registered'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <Calendar className="h-4 w-4 text-indigo-400" />
                <span>Born: {new Date(student.dateOfBirth).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Academic Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md md:col-span-2">
            <h2 className="text-lg font-bold text-slate-200">Academic Placement</h2>
            {currentEnrollment ? (
              <div className="mt-6 grid gap-6 sm:grid-cols-3">
                <div className="rounded-xl bg-slate-950 p-4 border border-slate-900">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
                    <Calendar className="h-4 w-4" /> Academic Year
                  </div>
                  <p className="mt-2 text-lg font-bold text-slate-100">{currentEnrollment.academicYear?.name}</p>
                </div>
                <div className="rounded-xl bg-slate-950 p-4 border border-slate-900">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
                    <Layers className="h-4 w-4" /> Class / Grade
                  </div>
                  <p className="mt-2 text-lg font-bold text-slate-100">{currentEnrollment.gradeLevel?.name}</p>
                </div>
                <div className="rounded-xl bg-slate-950 p-4 border border-slate-900">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
                    <Layers className="h-4 w-4" /> Section / Homeroom
                  </div>
                  <p className="mt-2 text-lg font-bold text-slate-100">{currentEnrollment.section?.name}</p>
                </div>
              </div>
            ) : (
              <div className="mt-6 text-center py-6 border border-dashed border-slate-800 rounded-xl">
                <p className="text-slate-400 text-sm">No active academic placement found.</p>
              </div>
            )}
          </div>
        </div>

        {/* Attendance Banner */}
        <div className="mt-8 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-6 backdrop-blur-md flex flex-col justify-between sm:flex-row sm:items-center gap-4">
          <div>
            <h3 className="text-md font-bold text-indigo-300 flex items-center gap-2">
              <Percent className="h-5 w-5" /> Attendance Record Active
            </h3>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              Your daily presence logs are active. View your compliance history, percentages, monthly details and status flags.
            </p>
          </div>
          <Button asChild className="bg-indigo-600 hover:bg-indigo-500 text-white shrink-0">
            <Link to="/student/attendance">
              View My Attendance
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
