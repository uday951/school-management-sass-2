import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assignmentsApi } from '@/api/assignments';
import { employeesApi } from '@/api/employees';
import { classesApi } from '@/api/classes';
import { academicYearsApi } from '@/api/academicYears';
import { subjectsApi } from '@/api/subjects';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PageLoader } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { NotebookPen, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function TeacherAssignmentsPage() {
  const queryClient = useQueryClient();
  const [activeSessionId, setActiveSessionId] = React.useState('ALL');
  const [activeClassId, setActiveClassId] = React.useState('ALL');
  const [activeTeacherId, setActiveTeacherId] = React.useState('ALL');

  // Form states for creating a new assignment
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [formSessionId, setFormSessionId] = React.useState('');
  const [formTeacherId, setFormTeacherId] = React.useState('');
  const [formClassId, setFormClassId] = React.useState('');
  const [formSectionId, setFormSectionId] = React.useState('');
  const [formSubjectId, setFormSubjectId] = React.useState('');

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

  const { data: formClassSubjects } = useQuery({
    queryKey: ['formClassSubjects', formSessionId, formClassId],
    queryFn: () => subjectsApi.listMappings(formSessionId, formClassId),
    enabled: !!formSessionId && !!formClassId,
  });

  const { data: teachers } = useQuery({
    queryKey: ['teachingStaff'],
    queryFn: () => employeesApi.list({ employeeType: 'TEACHING', page: 1, limit: 100 }),
  });

  const { data: assignments, isLoading, error } = useQuery({
    queryKey: ['teacherAssignments', activeSessionId, activeClassId, activeTeacherId],
    queryFn: () =>
      assignmentsApi.listTeacherAssignments({
        academicYearId: activeSessionId !== 'ALL' ? activeSessionId : undefined,
        gradeLevelId: activeClassId !== 'ALL' ? activeClassId : undefined,
        employeeId: activeTeacherId !== 'ALL' ? activeTeacherId : undefined,
      }),
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

  const createMutation = useMutation({
    mutationFn: (data: any) => assignmentsApi.createTeacherAssignment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacherAssignments'] });
      toast.success('Teacher assigned successfully');
      setIsAddOpen(false);
      setFormTeacherId('');
      setFormClassId('');
      setFormSectionId('');
      setFormSubjectId('');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to create teacher assignment');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => assignmentsApi.deleteTeacherAssignment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacherAssignments'] });
      toast.success('Assignment deleted successfully');
    },
  });

  if (isLoading) return <PageLoader />;
  if (error) return <div className="text-center py-12 text-destructive">Failed to load teacher assignments.</div>;

  const list = assignments || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Academic Teaching Assignments</h1>
          <p className="text-sm text-muted-foreground">Map teaching faculty to academic class subjects and sections.</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Add Teaching Assignment
        </Button>
      </div>

      {/* Quick filters */}
      <Card className="border-border">
        <CardContent className="pt-6 grid gap-4 grid-cols-3">
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

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase">Class level</Label>
            <Select value={activeClassId} onValueChange={setActiveClassId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Classes</SelectItem>
                {classes?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase">Teacher</Label>
            <Select value={activeTeacherId} onValueChange={setActiveTeacherId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose Teacher" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Teachers</SelectItem>
                {teachers?.data.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.firstName} {t.lastName} ({t.employeeNumber})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Add Assignment Modal Form */}
      {isAddOpen && (
        <Card className="border-border bg-card animate-fade-in">
          <CardHeader>
            <CardTitle className="text-base">Create Teacher Subject Assignment</CardTitle>
            <CardDescription>Link teaching faculty to class standard sections.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4 pt-2">
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
                  setFormSubjectId('');
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
              <Label>Class Section Room *</Label>
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

            <div className="space-y-1.5 col-span-2">
              <Label>Subject (Select mapped subjects) *</Label>
              <Select value={formSubjectId} onValueChange={setFormSubjectId} disabled={!formClassId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose Subject" />
                </SelectTrigger>
                <SelectContent>
                  {formClassSubjects?.filter((cs: any) => cs.subject).map((cs: any) => (
                    <SelectItem key={cs.subject.id} value={cs.subject.id}>
                      {cs.subject.name} ({cs.subject.code})
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
              disabled={createMutation.isPending || !formSessionId || !formTeacherId || !formClassId || !formSectionId || !formSubjectId}
              onClick={() =>
                createMutation.mutate({
                  academicYearId: formSessionId,
                  employeeId: formTeacherId,
                  gradeLevelId: formClassId,
                  sectionId: formSectionId,
                  subjectId: formSubjectId,
                })
              }
            >
              Assign Teacher
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Table grid listing */}
      {list.length === 0 ? (
        <Card className="border-border py-12">
          <EmptyState
            icon={NotebookPen}
            title="No Assignments Found"
            description="Assign teachers to classes and subjects to map school schedules."
          />
        </Card>
      ) : (
        <div className="border border-border bg-card rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Teacher Name</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Subject Name</TableHead>
                <TableHead>Class standard</TableHead>
                <TableHead>Section Room</TableHead>
                <TableHead>Role Mode</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-semibold text-foreground">
                    {a.employee.firstName} {a.employee.lastName}
                  </TableCell>
                  <TableCell>{a.employee.designation}</TableCell>
                  <TableCell className="font-semibold text-primary">{a.subject.name}</TableCell>
                  <TableCell>{a.gradeLevel.name}</TableCell>
                  <TableCell>{a.section.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-[10px]">
                      {a.assignmentType}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <ConfirmDialog
                      title="Remove Assignment"
                      description={`Are you sure you want to remove teaching assignment for '${a.employee.firstName}' in '${a.subject.name}'?`}
                      confirmLabel="Delete"
                      variant="destructive"
                      onConfirm={() => deleteMutation.mutate(a.id)}
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
