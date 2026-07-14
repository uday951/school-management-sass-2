import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { schoolsApi } from '@/api/schools';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { PageLoader } from '@/components/LoadingSpinner';
import { formatDateTime, formatDate } from '@/lib/utils';
import { SCHOOL_TYPE_LABELS, BOARD_TYPE_LABELS } from '@/types';
import { ArrowLeft, Edit, ShieldAlert, Archive, CheckCircle, RefreshCcw, Mail, Phone, Globe, MapPin } from 'lucide-react';
import { toast } from 'sonner';

export default function SchoolDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: school, isLoading, error } = useQuery({
    queryKey: ['school', id],
    queryFn: () => schoolsApi.get(id!),
    enabled: !!id,
  });

  const statusMutation = useMutation({
    mutationFn: ({ schoolId, status, reason }: { schoolId: string; status: any; reason?: string }) =>
      schoolsApi.updateStatus(schoolId, { status, reason }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['school', id] });
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      toast.success(`School status transitioned to ${data.status}`);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update status');
    },
  });

  if (isLoading) return <PageLoader />;
  if (error || !school) {
    return (
      <div className="text-center py-12 text-destructive">
        School not found or server error.
      </div>
    );
  }

  const isArchived = school.status === 'ARCHIVED';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" asChild>
            <Link to="/schools">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{school.name}</h1>
              <StatusBadge status={school.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              Onboarded Code: <span className="font-mono">{school.code}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {!isArchived && (
            <Button asChild variant="outline" size="sm">
              <Link to={`/schools/${school.id}/edit`} className="gap-1.5">
                <Edit className="h-4 w-4" /> Edit
              </Link>
            </Button>
          )}

          {/* Status Actions */}
          {school.status === 'ACTIVE' && (
            <ConfirmDialog
              title="Suspend School"
              description="Are you sure you want to suspend this school? Users will be immediately blocked from accessing their dashboard."
              confirmLabel="Suspend School"
              variant="destructive"
              onConfirm={async () => {
                await statusMutation.mutateAsync({ schoolId: school.id, status: 'SUSPENDED' });
              }}
              isLoading={statusMutation.isPending}
              trigger={
                <Button variant="outline" size="sm" className="border-amber-500/30 text-amber-500 hover:bg-amber-500/10">
                  <ShieldAlert className="h-4 w-4 mr-1.5" /> Suspend
                </Button>
              }
            />
          )}

          {school.status === 'SUSPENDED' && (
            <ConfirmDialog
              title="Reactivate School"
              description="Reactivating this school will restore dashboard login access for all mapped tenant admins and staff."
              confirmLabel="Activate"
              onConfirm={async () => {
                await statusMutation.mutateAsync({ schoolId: school.id, status: 'ACTIVE' });
              }}
              isLoading={statusMutation.isPending}
              trigger={
                <Button variant="outline" size="sm" className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10">
                  <CheckCircle className="h-4 w-4 mr-1.5" /> Reactivate
                </Button>
              }
            />
          )}

          {!isArchived && (
            <ConfirmDialog
              title="Archive School"
              description="Warning: Archiving is a terminal lifecycle state. Access will be blocked permanently. Mapped data is preserved in historical mode. This cannot be undone."
              confirmLabel="Archive Permanently"
              variant="destructive"
              onConfirm={async () => {
                await statusMutation.mutateAsync({ schoolId: school.id, status: 'ARCHIVED' });
              }}
              isLoading={statusMutation.isPending}
              trigger={
                <Button variant="destructive" size="sm">
                  <Archive className="h-4 w-4 mr-1.5" /> Archive
                </Button>
              }
            />
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Core School Details */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>School Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground uppercase font-bold tracking-wide">Board & Type</span>
                <p className="text-sm font-medium text-foreground">
                  {BOARD_TYPE_LABELS[school.board]} — {SCHOOL_TYPE_LABELS[school.schoolType]}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground uppercase font-bold tracking-wide">Established Year</span>
                <p className="text-sm font-medium text-foreground">{school.establishedYear || 'Not Specified'}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-muted-foreground uppercase font-bold tracking-wide">Official Contact Info</span>
                <p className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" /> {school.officialEmail}
                </p>
                <p className="text-sm font-medium text-foreground flex items-center gap-2 mt-1">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" /> {school.officialPhone}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground uppercase font-bold tracking-wide">Website</span>
                <p className="text-sm font-medium text-foreground">
                  {school.website ? (
                    <a href={school.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:underline text-primary">
                      <Globe className="h-3.5 w-3.5" /> {school.website}
                    </a>
                  ) : (
                    'None'
                  )}
                </p>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <span className="text-xs text-muted-foreground uppercase font-bold tracking-wide">Address</span>
                <p className="text-sm font-medium text-foreground flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                  <span>
                    {school.addressLine1}
                    {school.addressLine2 && `, ${school.addressLine2}`}
                    <br />
                    {school.city}, {school.state} — {school.postalCode}
                    <br />
                    {school.country}
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Primary Administrator */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle>School Administrator</CardTitle>
              <CardDescription>Primary administrative contact provisioned during onboarding.</CardDescription>
            </CardHeader>
            <CardContent>
              {school.primaryAdmin ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <span className="text-xs text-muted-foreground block">Name</span>
                    <p className="text-sm font-semibold text-foreground">
                      {school.primaryAdmin.firstName} {school.primaryAdmin.lastName}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Email</span>
                    <p className="text-sm font-semibold text-foreground">{school.primaryAdmin.email}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Phone</span>
                    <p className="text-sm font-semibold text-foreground">{school.primaryAdmin.phone || '—'}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Last Login</span>
                    <p className="text-sm font-semibold text-foreground">
                      {school.primaryAdmin.lastLoginAt ? formatDateTime(school.primaryAdmin.lastLoginAt) : 'Never'}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-destructive font-medium">No admin user found.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Audit Log / Metadata Sidebar */}
        <div className="space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base">System Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div>
                <span className="text-muted-foreground uppercase block font-bold">Tenant ID</span>
                <span className="font-mono text-foreground block">{school.tenantId}</span>
              </div>
              <div>
                <span className="text-muted-foreground uppercase block font-bold">Created At</span>
                <span className="text-foreground block">{formatDateTime(school.createdAt)}</span>
              </div>
              <div>
                <span className="text-muted-foreground uppercase block font-bold">Last Modified</span>
                <span className="text-foreground block">{formatDateTime(school.updatedAt)}</span>
              </div>
              {school.archivedAt && (
                <div>
                  <span className="text-destructive uppercase block font-bold">Archived At</span>
                  <span className="text-foreground block">{formatDateTime(school.archivedAt)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base">Recent Audit Logs</CardTitle>
            </CardHeader>
            <CardContent>
              {!school.recentActivity || school.recentActivity.length === 0 ? (
                <p className="text-xs text-muted-foreground">No audits logged.</p>
              ) : (
                <div className="space-y-3">
                  {school.recentActivity.map((log) => (
                    <div key={log.id} className="text-xs border-b border-border/40 pb-2 last:border-0 last:pb-0">
                      <div className="flex justify-between font-medium">
                        <span className="text-foreground">{log.action.replace(/_/g, ' ')}</span>
                        <span className="text-muted-foreground shrink-0">{formatDate(log.createdAt)}</span>
                      </div>
                      <p className="text-muted-foreground mt-0.5 truncate">by {log.actorEmail}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
