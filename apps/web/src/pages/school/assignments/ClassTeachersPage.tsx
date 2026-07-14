import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assignmentsApi } from '@/api/assignments';
import { employeesApi } from '@/api/employees';
import { classesApi } from '@/api/classes';
import { academicYearsApi } from '@/api/academicYears';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PageLoader } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Users, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ClassTeachersPage() {
  const queryClient = useQueryClient();
  const [activeSessionId, setActiveSessionId] = React.useState('ALL');

  // Form states
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [formSessionId, setFormSessionId] = React.useState('');
  const [formTeacherId, setFormTeacherId] = React.useState('');
  const [formClassId, setFormClassId] = React.useState('');
  const [formSectionId, setFormSectionId] = React.useState('');

  // Queries
  const { data: years } = useQuery({
    queryKey: ['academicYears'],
    queryFn: academicYearsApi.list,
  });

  const { data: classes } = useQuery({
    queryKey: ['classes'],
    queryFn: classesApi.listClasses,
  });

  const { data: formSections } = useQuery({
    queryKey: ['formSections', formClassId],
    queryFn: () => classesApi.listSections(formClassId || undefined),
    enabled: !!formClassId,
  });

  const { data: teachers } = useQuery({
    queryKey: ['teachingStaff'],
    queryFn: () => employeesApi.list({ employeeType: 'TEACHING', page: 1, limit: 100 }),
  });

  const { data: list, isLoading, error } = useQuery({
    queryKey: ['classTeachers', activeSessionId],
    queryFn: () => assignmentsApi.listClassTeachers(activeSessionId !== 'ALL' ? activeSessionId : undefined),
  });

  // Set default session on load
  React.useEffect(() => {
    if (years && years.length > 0 && activeSessionId === 'ALL') {
      const current = years.find((y) => y.isCurrent);
      if (current) {
        setActiveSessionId(current.id);
        setFormSessionId(current.id);
      }
    }
  }, [years]);

  const assignMutation = useMutation({
    mutationFn: (data: any) => assignmentsApi.assignClassTeacher(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classTeachers'] });
      toast.success('Class teacher assigned successfully');
      setIsAddOpen(false);
      setFormTeacherId('');
      setFormClassId('');
      setFormSectionId('');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Assignment failed');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => assignmentsApi.deleteClassTeacher(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classTeachers'] });
      toast.success('Class teacher unassigned');
    },
  });

  if (isLoading) return <PageLoader />;
  if (error) return <div className="text-center py-12 text-destructive">Failed to load class teachers.</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Class Teachers / Homeroom Management</h1>
          <p className="text-sm text-muted-foreground">Assign primary homeroom class teachers to academic sections.</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Assign Class Teacher
        </Button>
      </div>

      {/* Quick session filter */}
      <Card className="border-border max-w-xs">
        <CardContent className="pt-6">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase">Academic Session</Label>
            <Select value={activeSessionId} onValueChange={setActiveSessionId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose Session" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Sessions</SelectItem>
                {years?.map((y) => (
                  <SelectItem key={y.id} value={y.id}>
                    {y.name} {y.isCurrent && '(Active)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Add Assignment form */}
      {isAddOpen && (
        <Card className="border-border bg-card animate-fade-in">
          <CardHeader>
            <CardTitle className="text-base">Assign Homeroom Class Teacher</CardTitle>
            <CardDescription>Designate a teacher as the primary class representative.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label>Session *</Label>
              <Select value={formSessionId} onValueChange={setFormSessionId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years?.map((y) => (
                    <SelectItem key={y.id} value={y.id}>
                      {y.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Teacher *</Label>
              <Select value={formTeacherId} onValueChange={setFormTeacherId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers?.data.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.firstName} {t.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Class Standard *</Label>
              <Select
                value={formClassId}
                onValueChange={(val) => {
                  setFormClassId(val);
                  setFormSectionId('');
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose Class" />
                </SelectTrigger>
                <SelectContent>
                  {classes?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Section Standard *</Label>
              <Select value={formSectionId} onValueChange={setFormSectionId} disabled={!formClassId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose Section" />
                </SelectTrigger>
                <SelectContent>
                  {formSections?.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2 border-t pt-3">
            <Button variant="outline" size="sm" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button
              size="sm"
              disabled={assignMutation.isPending || !formSessionId || !formTeacherId || !formClassId || !formSectionId}
              onClick={() =>
                assignMutation.mutate({
                  academicYearId: formSessionId,
                  employeeId: formTeacherId,
                  gradeLevelId: formClassId,
                  sectionId: formSectionId,
                  isPrimary: true,
                })
              }
            >
              Assign Homeroom Head
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Listing Grid */}
      {list?.length === 0 ? (
        <Card className="border-border py-12">
          <EmptyState
            icon={Users}
            title="No Homeroom Heads Assigned"
            description="Assign homeroom teachers to sections for administrative tracking."
          />
        </Card>
      ) : (
        <div className="border border-border bg-card rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class Room</TableHead>
                <TableHead>Section Name</TableHead>
                <TableHead>Homeroom Teacher</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Type Role</TableHead>
                <th className="p-3 text-right">Action</th>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-semibold text-foreground">{item.gradeLevel.name}</TableCell>
                  <TableCell>{item.section.name}</TableCell>
                  <TableCell className="font-semibold text-primary">
                    {item.employee.firstName} {item.employee.lastName}
                  </TableCell>
                  <TableCell>{item.employee.designation}</TableCell>
                  <TableCell>
                    <Badge variant={item.isPrimary ? 'success' : 'secondary' as any} className="text-[10px]">
                      {item.isPrimary ? 'Primary Class Teacher' : 'Assistant Teacher'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <ConfirmDialog
                      title="Unassign Class Teacher"
                      description={`Are you sure you want to remove homeroom head '${item.employee.firstName}' from '${item.gradeLevel.name}-${item.section.name}'?`}
                      confirmLabel="Unassign"
                      variant="destructive"
                      onConfirm={() => deleteMutation.mutate(item.id)}
                      isLoading={deleteMutation.isPending}
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
