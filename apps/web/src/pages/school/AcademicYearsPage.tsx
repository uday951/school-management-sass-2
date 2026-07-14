import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { academicYearsApi, type AcademicYear } from '@/api/academicYears';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { PageLoader } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { formatDate } from '@/lib/utils';
import { Calendar, Plus, Edit, Star, StarOff, Check } from 'lucide-react';
import { toast } from 'sonner';

const academicYearSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters (e.g. 2026-27)'),
  code: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  status: z.enum(['PLANNED', 'ACTIVE', 'COMPLETED', 'ARCHIVED']).optional(),
});

type FormValues = z.infer<typeof academicYearSchema>;

export default function AcademicYearsPage() {
  const queryClient = useQueryClient();
  const [editingYear, setEditingYear] = React.useState<AcademicYear | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const { data: years, isLoading, error } = useQuery({
    queryKey: ['academicYears'],
    queryFn: academicYearsApi.list,
  });

  const createMutation = useMutation({
    mutationFn: (data: FormValues) => academicYearsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academicYears'] });
      toast.success('Academic session created successfully');
      setIsModalOpen(false);
      reset();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to create academic year');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormValues }) => academicYearsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academicYears'] });
      toast.success('Academic session updated successfully');
      setEditingYear(null);
      setIsModalOpen(false);
      reset();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update academic year');
    },
  });

  const setCurrentMutation = useMutation({
    mutationFn: (id: string) => academicYearsApi.setCurrent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academicYears'] });
      queryClient.invalidateQueries({ queryKey: ['schoolDashboard'] });
      toast.success('Current academic session updated successfully');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to set current academic year');
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(academicYearSchema),
  });

  React.useEffect(() => {
    if (editingYear) {
      reset({
        name: editingYear.name,
        code: editingYear.code || '',
        startDate: editingYear.startDate.substring(0, 10),
        endDate: editingYear.endDate.substring(0, 10),
        status: editingYear.status,
      });
      setIsModalOpen(true);
    } else {
      reset({
        name: '',
        code: '',
        startDate: '',
        endDate: '',
        status: 'PLANNED',
      });
    }
  }, [editingYear, reset]);

  if (isLoading) return <PageLoader />;
  if (error) {
    return <div className="text-center py-12 text-destructive">Failed to load academic years.</div>;
  }

  const onSubmit = (data: FormValues) => {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    if (start >= end) {
      toast.error('Start date must be strictly before end date');
      return;
    }

    if (editingYear) {
      updateMutation.mutate({ id: editingYear.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const getStatusBadge = (status: string) => {
    const maps: Record<string, { variant: 'default' | 'success' | 'secondary' | 'warning' }> = {
      PLANNED: { variant: 'secondary' },
      ACTIVE: { variant: 'success' },
      COMPLETED: { variant: 'default' },
      ARCHIVED: { variant: 'destructive' as any },
    };
    const config = maps[status] || { variant: 'secondary' };
    return <Badge variant={config.variant as any}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Academic Sessions</h1>
          <p className="text-sm text-muted-foreground">Manage and track institutional academic years.</p>
        </div>
        <Button onClick={() => { setEditingYear(null); setIsModalOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> Add Academic Year
        </Button>
      </div>

      {isModalOpen && (
        <Card className="border-border">
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle>{editingYear ? 'Edit Session' : 'Create Session'}</CardTitle>
              <CardDescription>Specify dates and operational lifecycle status.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Session Name *</Label>
                  <Input id="name" placeholder="e.g. 2026-27" {...register('name')} />
                  {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Code (Optional)</Label>
                  <Input id="code" placeholder="e.g. AY26" {...register('code')} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input id="startDate" type="date" {...register('startDate')} />
                  {errors.startDate && <p className="text-xs text-destructive">{errors.startDate.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input id="endDate" type="date" {...register('endDate')} />
                  {errors.endDate && <p className="text-xs text-destructive">{errors.endDate.message}</p>}
                </div>
              </div>

              {editingYear && (
                <div className="space-y-2">
                  <Label>Lifecycle Status</Label>
                  <Select
                    defaultValue={editingYear.status}
                    onValueChange={(val) => setValue('status', val as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PLANNED">PLANNED</SelectItem>
                      <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                      <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                      <SelectItem value="ARCHIVED">ARCHIVED (read-only)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end gap-3 border-t border-border pt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                Save
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {years?.length === 0 ? (
        <Card className="border-border py-12">
          <EmptyState
            icon={Calendar}
            title="No Academic Sessions Found"
            description="Create your first academic year to begin initial school setup."
            action={
              <Button onClick={() => setIsModalOpen(true)}>
                Create Academic Year
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Session Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Current Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {years?.map((year) => (
                <TableRow key={year.id}>
                  <TableCell className="font-semibold text-foreground">{year.name}</TableCell>
                  <TableCell className="font-mono text-xs">{year.code || '—'}</TableCell>
                  <TableCell>{formatDate(year.startDate)}</TableCell>
                  <TableCell>{formatDate(year.endDate)}</TableCell>
                  <TableCell>{getStatusBadge(year.status)}</TableCell>
                  <TableCell>
                    {year.isCurrent ? (
                      <Badge variant="success" className="gap-1.5 py-0.5">
                        <Check className="h-3 w-3" /> Current Active
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right flex items-center justify-end gap-2">
                    {!year.isCurrent && year.status !== 'ARCHIVED' && (
                      <ConfirmDialog
                        title="Set Current Active Session"
                        description={`Are you sure you want to activate '${year.name}' as the current session? This will deactivate the previous current year.`}
                        confirmLabel="Set Current"
                        onConfirm={() => setCurrentMutation.mutate(year.id)}
                        isLoading={setCurrentMutation.isPending}
                        trigger={
                          <Button variant="ghost" size="icon" title="Set Current">
                            <Star className="h-4 w-4 text-amber-500" />
                          </Button>
                        }
                      />
                    )}
                    {year.status !== 'ARCHIVED' && (
                      <Button variant="ghost" size="icon" onClick={() => setEditingYear(year)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
