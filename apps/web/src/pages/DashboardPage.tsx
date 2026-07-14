import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/api/dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { School, UserCheck, ShieldAlert, Archive, FileText, CheckCircle } from 'lucide-react';
import { PageLoader } from '@/components/LoadingSpinner';
import { StatusBadge } from '@/components/StatusBadge';
import { formatDateTime } from '@/lib/utils';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: dashboardApi.getStats,
  });

  if (isLoading) return <PageLoader />;
  if (error) {
    return (
      <div className="text-center py-12 text-destructive">
        Failed to load dashboard data. Please try again.
      </div>
    );
  }

  const { stats, recentSchools, recentActivity } = data!;

  const statCards = [
    {
      title: 'Total Schools',
      value: stats.totalSchools,
      description: 'Onboarded schools',
      icon: School,
      color: 'text-primary',
    },
    {
      title: 'Active Schools',
      value: stats.activeSchools,
      description: 'Schools operating normally',
      icon: CheckCircle,
      color: 'text-emerald-400',
    },
    {
      title: 'Suspended Schools',
      value: stats.suspendedSchools,
      description: 'Suspended customer accounts',
      icon: ShieldAlert,
      color: 'text-amber-500',
    },
    {
      title: 'Archived Schools',
      value: stats.archivedSchools,
      description: 'Historical records (read-only)',
      icon: Archive,
      color: 'text-muted-foreground',
    },
    {
      title: 'School Admins',
      value: stats.totalSchoolAdmins,
      description: 'Total active administrators',
      icon: UserCheck,
      color: 'text-blue-400',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Platform Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Real-time metrics and recently onboarded schools.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
        {/* Recent Schools */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Recently Added Schools</CardTitle>
            <CardDescription>The latest schools added to the platform.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentSchools.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No schools onboarded yet.</p>
            ) : (
              <div className="space-y-4">
                {recentSchools.map((school) => (
                  <div key={school.id} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
                    <div>
                      <Link to={`/schools/${school.id}`} className="text-sm font-semibold hover:underline text-primary">
                        {school.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {school.code} | {school.city}, {school.state}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(school.createdAt)}
                      </span>
                      <StatusBadge status={school.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Audit Log Activity */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Recent Activity Logs</CardTitle>
            <CardDescription>Platform management audit trail.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No recent actions recorded.</p>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 border-b border-border/50 pb-3 last:border-0 last:pb-0">
                    <FileText className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {log.action.replace(/_/g, ' ')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Actor: {log.actorEmail}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatDateTime(log.createdAt)}
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
