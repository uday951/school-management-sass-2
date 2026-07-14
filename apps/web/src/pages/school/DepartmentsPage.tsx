import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { departmentsApi, type Department } from '@/api/departments';
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
import { Building, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const departmentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  code: z.string().min(2, 'Code must be at least 2 characters').toUpperCase(),
  type: z.enum(['ACADEMIC', 'ADMINISTRATIVE', 'SUPPORT', 'OTHER']),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).optional(),
});

type FormValues = z.infer<typeof departmentSchema>;

export default function DepartmentsPage() {
  const queryClient = useQueryClient();
  const [editingDept, setEditingDept] = React.useState<Department | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const { data: depts, isLoading, error } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentsApi.list,
  });

  const createMutation = useMutation({
    mutationFn: (data: FormValues) => departmentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Department created successfully');
      setIsModalOpen(false);
      reset();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to create department');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormValues }) => departmentsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Department updated successfully');
      setEditingDept(null);
      setIsModalOpen(false);
      reset();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update department');
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => departmentsApi.update(id, { status: 'ARCHIVED' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Department archived successfully');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to archive department');
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(departmentSchema),
  });

  React.useEffect(() => {
    if (editingDept) {
      reset({
        name: editingDept.name,
        code: editingDept.code,
        type: editingDept.type,
        description: editingDept.description || '',
        status: editingDept.status,
      });
      setIsModalOpen(true);
    } else {
      reset({
        name: '',
        code: '',
        type: 'ACADEMIC',
        description: '',
        status: 'ACTIVE',
      });
    }
  }, [editingDept, reset]);

  if (isLoading) return <PageLoader />;
  if (error) {
    return <div className="text-center py-12 text-destructive">Failed to load departments.</div>;
  }

  const values = watch();

  const onSubmit = (data: FormValues) => {
    if (editingDept) {
      updateMutation.mutate({ id: editingDept.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Departments</h1>
          <p className="text-sm text-muted-foreground">Manage academic, administrative, and supporting departments.</p>
        </div>
        <Button onClick={() => { setEditingDept(null); setIsModalOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> Add Department
        </Button>
      </div>

      {isModalOpen && (
        <Card className="border-border animate-fade-in">
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle>{editingDept ? 'Edit Department' : 'Create Department'}</CardTitle>
              <CardDescription>Setup operational divisions of the institution.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Department Name *</Label>
                  <Input id="name" placeholder="e.g. Mathematics" {...register('name')} />
                  {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Department Code *</Label>
                  <Input id="code" placeholder="e.g. MATH" {...register('code')} />
                  {errors.code && <p className="text-xs text-destructive">{errors.code.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Division Type *</Label>
                  <Select
                    value={values.type}
                    onValueChange={(val) => setValue('type', val as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACADEMIC">ACADEMIC</SelectItem>
                      <SelectItem value="ADMINISTRATIVE">ADMINISTRATIVE</SelectItem>
                      <SelectItem value="SUPPORT">SUPPORT</SelectItem>
                      <SelectItem value="OTHER">OTHER</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {editingDept && (
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={values.status}
                      onValueChange={(val) => setValue('status', val as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                        <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                        <SelectItem value="ARCHIVED">ARCHIVED</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" placeholder="Brief details about department operations..." {...register('description')} />
              </div>
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

      {depts?.length === 0 ? (
        <Card className="border-border py-12">
          <EmptyState
            icon={Building}
            title="No Departments Found"
            description="Create your first department to assign courses and academic courses."
            action={
              <Button onClick={() => setIsModalOpen(true)}>
                Add Department
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {depts?.map((dept) => (
                <TableRow key={dept.id}>
                  <TableCell className="font-semibold text-foreground">{dept.name}</TableCell>
                  <TableCell className="font-mono text-xs">{dept.code}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{dept.type}</Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-muted-foreground" title={dept.description || ''}>
                    {dept.description || '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={dept.status === 'ACTIVE' ? 'success' : 'secondary' as any}>
                      {dept.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setEditingDept(dept)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <ConfirmDialog
                      title="Archive Department"
                      description={`Are you sure you want to archive department '${dept.name}'? This is permanent.`}
                      confirmLabel="Archive"
                      variant="destructive"
                      onConfirm={() => archiveMutation.mutate(dept.id)}
                      isLoading={archiveMutation.isPending}
                      trigger={
                        <Button variant="ghost" size="icon" className="hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      }
                    />
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
