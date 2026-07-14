import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { schoolApi } from '@/api/school';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageLoader } from '@/components/LoadingSpinner';
import { formatTimeAgo, cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Building,
  Layers,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  FileText,
} from 'lucide-react';

// Simulating Radix UI progress bar if not fully in workspace
function LocalProgress({ value }: { value: number }) {
  return (
    <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
      <div className="bg-primary h-full transition-all duration-300" style={{ width: `${value}%` }} />
    </div>
  );
}

export default function SchoolDashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['schoolDashboard'],
    queryFn: schoolApi.getDashboardData,
  });

  if (isLoading) return <PageLoader />;
  if (error || !data) {
    return (
      <div className="text-center py-12 text-destructive">
        Failed to load school workspace dashboard data. Please try again.
      </div>
    );
  }

  const { stats, setupSteps, currentAcademicYear, recentActivity } = data;

  const statCards = [
    {
      title: 'Academic Years',
      value: stats.academicYearsCount,
      description: 'Setup sessions',
      icon: Calendar,
      color: 'text-primary',
    },
    {
      title: 'Departments',
      value: stats.departmentsCount,
      description: 'Academic/Admin divisions',
      icon: Building,
      color: 'text-emerald-400',
    },
    {
      title: 'Classes/Grades',
      value: stats.classesCount,
      description: 'Registered standard levels',
      icon: Layers,
      color: 'text-blue-400',
    },
    {
      title: 'Mapped Subjects',
      value: stats.classSubjectsCount,
      description: 'Active subject class associations',
      icon: BookOpen,
      color: 'text-purple-400',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">School Workspace</h1>
          <p className="text-sm text-muted-foreground">
            Manage your school core master data and configurations.
          </p>
        </div>
        {currentAcademicYear ? (
          <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-lg text-primary text-sm font-semibold">
            <Calendar className="h-4 w-4" /> Current Session: {currentAcademicYear.name}
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg text-amber-500 text-sm font-semibold">
            <AlertCircle className="h-4 w-4" /> No Current Session Active
          </div>
        )}
      </div>

      {/* Progress Section */}
      {stats.setupPercentage < 100 && (
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base text-foreground font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-amber-500" /> Initial Workspace Setup Progress
                </CardTitle>
                <CardDescription>
                  Complete these basic modules to activate faculty and student registration.
                </CardDescription>
              </div>
              <span className="text-sm font-bold text-amber-500">{stats.setupPercentage}%</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <LocalProgress value={stats.setupPercentage} />
            <div className="flex justify-end">
              <Button asChild size="sm" variant="outline" className="text-xs gap-1">
                <Link to="/school/setup">
                  Open Checklist <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Setup Checklist Summary */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Setup Checklist Summary</CardTitle>
            <CardDescription>Quick overview of your setup modules.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className={cn('h-4 w-4', setupSteps.academicYear ? 'text-emerald-500' : 'text-muted')} />
                  Academic Session Setup
                </span>
                {!setupSteps.academicYear && (
                  <Link to="/school/academic-years" className="text-xs text-primary hover:underline font-semibold">
                    Set up
                  </Link>
                )}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className={cn('h-4 w-4', setupSteps.department ? 'text-emerald-500' : 'text-muted')} />
                  Departments Setup
                </span>
                {!setupSteps.department && (
                  <Link to="/school/departments" className="text-xs text-primary hover:underline font-semibold">
                    Set up
                  </Link>
                )}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className={cn('h-4 w-4', setupSteps.class ? 'text-emerald-500' : 'text-muted')} />
                  Classes & Grade Levels
                </span>
                {!setupSteps.class && (
                  <Link to="/school/classes" className="text-xs text-primary hover:underline font-semibold">
                    Set up
                  </Link>
                )}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className={cn('h-4 w-4', setupSteps.section ? 'text-emerald-500' : 'text-muted')} />
                  Sections Setup
                </span>
                {!setupSteps.section && (
                  <Link to="/school/classes" className="text-xs text-primary hover:underline font-semibold">
                    Set up
                  </Link>
                )}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className={cn('h-4 w-4', setupSteps.subject ? 'text-emerald-500' : 'text-muted')} />
                  Subjects Setup
                </span>
                {!setupSteps.subject && (
                  <Link to="/school/subjects" className="text-xs text-primary hover:underline font-semibold">
                    Set up
                  </Link>
                )}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className={cn('h-4 w-4', setupSteps.mapping ? 'text-emerald-500' : 'text-muted')} />
                  Subject Mappings Setup
                </span>
                {!setupSteps.mapping && (
                  <Link to="/school/subjects" className="text-xs text-primary hover:underline font-semibold">
                    Set up
                  </Link>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent logs */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Recent Workspace Logs</CardTitle>
            <CardDescription>Audited master data changes.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No recent actions recorded.</p>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 border-b border-border/50 pb-3 last:border-0 last:pb-0">
                    <FileText className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {log.action.replace(/_/g, ' ')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Actor: {log.actorEmail}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatTimeAgo(log.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
