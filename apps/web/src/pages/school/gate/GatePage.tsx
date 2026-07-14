import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { visitorGateApi, type VisitRecord, type StudentGatePass } from '@/api/visitorGate';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PageLoader } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { ShieldCheck, ShieldAlert, LogIn, LogOut, UserPlus, ClipboardList, Plus } from 'lucide-react';
import { toast } from 'sonner';

const checkInSchema = z.object({
  fullName: z.string().min(1, 'Visitor name is required'),
  phone: z.string().optional(),
  purpose: z.string().min(1, 'Visit purpose is required'),
  badgeNumber: z.string().optional()
});

export default function GatePage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = React.useState<'dashboard' | 'visits' | 'passes'>('dashboard');
  const [isCheckInModalOpen, setIsCheckInModalOpen] = React.useState(false);

  // Queries
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['gateDashboard'],
    queryFn: visitorGateApi.getDashboardStats
  });

  const { data: visits, isLoading: loadingVisits } = useQuery({
    queryKey: ['gateVisits'],
    queryFn: () => visitorGateApi.listVisits()
  });

  const { data: passes, isLoading: loadingPasses } = useQuery({
    queryKey: ['studentPasses'],
    queryFn: () => visitorGateApi.listGatePasses()
  });

  // Forms
  const checkInForm = useForm({ resolver: zodResolver(checkInSchema) });

  // Mutations
  const checkInMutation = useMutation({
    mutationFn: visitorGateApi.checkInVisitor,
    onSuccess: () => {
      toast.success('Visitor checked in successfully');
      queryClient.invalidateQueries({ queryKey: ['gateDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['gateVisits'] });
      setIsCheckInModalOpen(false);
      checkInForm.reset();
    }
  });

  const checkOutMutation = useMutation({
    mutationFn: visitorGateApi.checkOutVisitor,
    onSuccess: () => {
      toast.success('Visitor checked out successfully');
      queryClient.invalidateQueries({ queryKey: ['gateDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['gateVisits'] });
    }
  });

  const approvePassMutation = useMutation({
    mutationFn: ({ id, comment }: { id: string; comment?: string }) => visitorGateApi.approveGatePass(id, comment),
    onSuccess: () => {
      toast.success('Gate pass approved');
      queryClient.invalidateQueries({ queryKey: ['gateDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['studentPasses'] });
    }
  });

  const recordExitMutation = useMutation({
    mutationFn: visitorGateApi.recordExit,
    onSuccess: () => {
      toast.success('Student exit recorded');
      queryClient.invalidateQueries({ queryKey: ['studentPasses'] });
    }
  });

  if (loadingStats) {
    return <PageLoader />;
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Visitor Management & Gate Pass</h1>
          <p className="text-muted-foreground">Monitor school entry gates, verify visitor logs, and authorize student early exits.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsCheckInModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Guest Check-In
          </Button>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex gap-2 border-b pb-px">
        <Button variant={activeTab === 'dashboard' ? 'default' : 'ghost'} onClick={() => setActiveTab('dashboard')}>
          <ShieldCheck className="mr-2 h-4 w-4" /> Overview
        </Button>
        <Button variant={activeTab === 'visits' ? 'default' : 'ghost'} onClick={() => setActiveTab('visits')}>
          <ClipboardList className="mr-2 h-4 w-4" /> Visitor Register
        </Button>
        <Button variant={activeTab === 'passes' ? 'default' : 'ghost'} onClick={() => setActiveTab('passes')}>
          <ShieldAlert className="mr-2 h-4 w-4" /> Student Gate Passes
        </Button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Inside Campus</CardTitle>
                <LogIn className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.insideCount || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Today Visitors</CardTitle>
                <UserPlus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.todayVisitors || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pending Gate Passes</CardTitle>
                <ShieldAlert className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{stats?.pendingPasses || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Exited Students Today</CardTitle>
                <LogOut className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.exitedStudents || 0}</div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'visits' && (
        <Card>
          <CardHeader>
            <CardTitle>Visitor Entries Register</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingVisits ? (
              <PageLoader />
            ) : !visits || visits.length === 0 ? (
              <EmptyState icon={ClipboardList} title="No Visitor entries" description="Create a guest entry record for campus visitors." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Visitor Name</TableHead>
                    <TableHead>Badge #</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Check-in At</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visits.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell className="font-medium">{v.visitor.fullName}</TableCell>
                      <TableCell>{v.badgeNumber || '-'}</TableCell>
                      <TableCell>{v.purpose}</TableCell>
                      <TableCell>{new Date(v.checkInAt).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={v.status === 'CHECKED_IN' ? 'default' : 'outline'}>{v.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {v.status === 'CHECKED_IN' && (
                          <Button size="sm" onClick={() => checkOutMutation.mutate(v.id)}>
                            Check-Out
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'passes' && (
        <Card>
          <CardHeader>
            <CardTitle>Student Gate Pass Log</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingPasses ? (
              <PageLoader />
            ) : !passes || passes.length === 0 ? (
              <EmptyState icon={ShieldAlert} title="No Gate Passes" description="Early exits requested by parents will appear here." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Request Type</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {passes.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.student?.firstName} {p.student?.lastName}</TableCell>
                      <TableCell>{p.requestType}</TableCell>
                      <TableCell>{p.reason}</TableCell>
                      <TableCell>
                        <Badge>{p.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        {p.status === 'PENDING' && (
                          <Button size="sm" onClick={() => approvePassMutation.mutate({ id: p.id })}>
                            Approve
                          </Button>
                        )}
                        {p.status === 'APPROVED' && (
                          <Button size="sm" onClick={() => recordExitMutation.mutate(p.id)}>
                            Record Exit
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Guest Check-in Modal */}
      {isCheckInModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Guest Entry Form</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={checkInForm.handleSubmit((data) => checkInMutation.mutate(data))} className="space-y-4">
                <div>
                  <Label>Full Name</Label>
                  <Input {...checkInForm.register('fullName')} placeholder="Guest Full Name" />
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <Input {...checkInForm.register('phone')} placeholder="e.g. 9876543210" />
                </div>
                <div>
                  <Label>Visit Purpose</Label>
                  <Input {...checkInForm.register('purpose')} placeholder="e.g. Meet with Principal" />
                </div>
                <div>
                  <Label>Badge Number</Label>
                  <Input {...checkInForm.register('badgeNumber')} placeholder="e.g. B-012" />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="ghost" onClick={() => setIsCheckInModalOpen(false)}>Cancel</Button>
                  <Button type="submit">Check-In</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
