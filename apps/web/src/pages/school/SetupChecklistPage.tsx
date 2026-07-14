import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { schoolApi } from '@/api/school';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageLoader } from '@/components/LoadingSpinner';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Building,
  Layers,
  BookOpen,
  CheckCircle,
  XCircle,
  ArrowRight,
  Shield,
} from 'lucide-react';

export default function SetupChecklistPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['schoolSetupStatus'],
    queryFn: schoolApi.getSetupStatus,
  });

  if (isLoading) return <PageLoader />;
  if (error || !data) {
    return (
      <div className="text-center py-12 text-destructive">
        Failed to load setup details.
      </div>
    );
  }

  const { percentage, steps } = data;

  const checklistItems = [
    {
      title: 'Review School Profile',
      description: 'Confirm address, website, official phone number, and location parameters.',
      completed: steps.profile,
      to: '/school/profile',
      icon: Shield,
    },
    {
      title: 'Create Academic Year',
      description: 'Define your operational session years (e.g. 2026-27) and mark the current active session.',
      completed: steps.academicYear,
      to: '/school/academic-years',
      icon: Calendar,
    },
    {
      title: 'Create Departments',
      description: 'Establish academic and administration divisions (e.g. Mathematics, Examination Cell).',
      completed: steps.department,
      to: '/school/departments',
      icon: Building,
    },
    {
      title: 'Create Classes & Grade Levels',
      description: 'Configure standard class levels of the institution (e.g. Class 1, Grade 12).',
      completed: steps.class,
      to: '/school/classes',
      icon: Layers,
    },
    {
      title: 'Create Sections',
      description: 'Map classroom divisions under registered grade levels (e.g. Class 10 - Section A).',
      completed: steps.section,
      to: '/school/classes',
      icon: Layers,
    },
    {
      title: 'Create Subjects',
      description: 'Define courses and topics taught across different departments.',
      completed: steps.subject,
      to: '/school/subjects',
      icon: BookOpen,
    },
    {
      title: 'Map Subjects to Classes',
      description: 'Formulate curriculum associations by linking subjects to respective class structures.',
      completed: steps.mapping,
      to: '/school/subjects',
      icon: BookOpen,
    },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Onboarding Checklist</h1>
        <p className="text-sm text-muted-foreground">
          Configure these setup steps to successfully prepare your workspace database.
        </p>
      </div>

      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle>Completion Progress</CardTitle>
            <CardDescription>Real-time setup step evaluation</CardDescription>
          </div>
          <div className="text-3xl font-extrabold text-primary">{percentage}%</div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {checklistItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 border rounded-lg bg-card/50 border-border/80 hover:bg-card transition-colors duration-150"
                >
                  <div className="mt-1 shrink-0">
                    {item.completed ? (
                      <CheckCircle className="h-5 w-5 text-emerald-500 fill-emerald-500/10" />
                    ) : (
                      <XCircle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground text-sm sm:text-base">
                        {item.title}
                      </span>
                      {item.completed ? (
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
                          Completed
                        </span>
                      ) : (
                        <span className="text-[10px] bg-muted text-muted-foreground border px-2 py-0.5 rounded-full font-medium">
                          Pending
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">{item.description}</p>
                  </div>
                  <Button asChild size="sm" variant="ghost" className="shrink-0 gap-1 text-xs">
                    <Link to={item.to}>
                      Go <ArrowRight className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
