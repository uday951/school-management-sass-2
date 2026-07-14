import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subjectsApi, type Subject, type ClassSubject } from '@/api/subjects';
import { classesApi } from '@/api/classes';
import { academicYearsApi } from '@/api/academicYears';
import { departmentsApi } from '@/api/departments';
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
import { BookOpen, Plus, Edit, Trash2, Link, Layers } from 'lucide-react';
import { toast } from 'sonner';

const subjectSchema = z.object({
  name: z.string().min(2, 'Subject name is required'),
  code: z.string().min(1, 'Subject code is required').toUpperCase(),
  description: z.string().optional(),
  subjectType: z.enum(['CORE', 'ELECTIVE', 'OPTIONAL', 'ACTIVITY', 'OTHER']),
  departmentId: z.string().optional().or(z.literal('')),
});

const mapSchema = z.object({
  gradeLevelId: z.string().min(1, 'Class is required'),
  sectionId: z.string().optional().or(z.literal('')),
  subjectId: z.string().min(1, 'Subject is required'),
  isMandatory: z.boolean().default(true),
});

export default function SubjectsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = React.useState<'subjects' | 'mapping'>('subjects');

  // Modals / forms
  const [isSubjectModalOpen, setIsSubjectModalOpen] = React.useState(false);
  const [editingSubject, setEditingSubject] = React.useState<Subject | null>(null);

  const [isMappingModalOpen, setIsMappingModalOpen] = React.useState(false);

  // Mappings filters
  const [filterClassId, setFilterClassId] = React.useState<string>('ALL');
  const [filterYearId, setFilterYearId] = React.useState<string>('');

  // Auxiliary data queries
  const { data: academicYears } = useQuery({
    queryKey: ['academicYears'],
    queryFn: academicYearsApi.list,
  });

  const { data: classes } = useQuery({
    queryKey: ['classes'],
    queryFn: classesApi.listClasses,
  });

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentsApi.list,
  });

  // Automatically select current academic year as default filter
  React.useEffect(() => {
    if (academicYears && academicYears.length > 0 && !filterYearId) {
      const current = academicYears.find((y) => y.isCurrent);
      setFilterYearId(current ? current.id : academicYears[0].id);
    }
  }, [academicYears, filterYearId]);

  // Main Queries
  const { data: subjects, isLoading: isSubjectsLoading } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => subjectsApi.list(),
  });

  const { data: mappings, isLoading: isMappingsLoading } = useQuery({
    queryKey: ['classSubjects', filterYearId, filterClassId],
    queryFn: () =>
      subjectsApi.listMappings(
        filterYearId,
        filterClassId !== 'ALL' ? filterClassId : undefined,
      ),
    enabled: !!filterYearId,
  });

  // Mutations
  const createSubjectMutation = useMutation({
    mutationFn: (data: z.infer<typeof subjectSchema>) => subjectsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast.success('Subject created successfully');
      setIsSubjectModalOpen(false);
      resetSubjectForm();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to create subject');
    },
  });

  const updateSubjectMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: z.infer<typeof subjectSchema> }) => subjectsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast.success('Subject updated successfully');
      setEditingSubject(null);
      setIsSubjectModalOpen(false);
      resetSubjectForm();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update subject');
    },
  });

  const mapSubjectMutation = useMutation({
    mutationFn: (data: z.infer<typeof mapSchema>) =>
      subjectsApi.mapSubject({
        ...data,
        academicYearId: filterYearId,
        sectionId: data.sectionId || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classSubjects'] });
      queryClient.invalidateQueries({ queryKey: ['schoolDashboard'] });
      toast.success('Subject mapped to class successfully');
      setIsMappingModalOpen(false);
      resetMapForm();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to map subject');
    },
  });

  const unmapMutation = useMutation({
    mutationFn: (id: string) => subjectsApi.unmapSubject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classSubjects'] });
      queryClient.invalidateQueries({ queryKey: ['schoolDashboard'] });
      toast.success('Subject unmapped successfully');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to remove mapping');
    },
  });

  // Forms
  const {
    register: registerSubject,
    handleSubmit: handleSubmitSubject,
    setValue: setSubjectValue,
    reset: resetSubjectForm,
    watch: watchSubject,
    formState: { errors: subjectErrors },
  } = useForm<z.infer<typeof subjectSchema>>({
    resolver: zodResolver(subjectSchema),
  });

  const {
    register: registerMap,
    handleSubmit: handleSubmitMap,
    setValue: setMapValue,
    reset: resetMapForm,
    watch: watchMap,
    formState: { errors: mapErrors },
  } = useForm<z.infer<typeof mapSchema>>({
    resolver: zodResolver(mapSchema),
  });

  const subjectValues = watchSubject();
  const mapValues = watchMap();

  React.useEffect(() => {
    if (editingSubject) {
      resetSubjectForm({
        name: editingSubject.name,
        code: editingSubject.code,
        description: editingSubject.description || '',
        subjectType: editingSubject.subjectType,
        departmentId: editingSubject.departmentId || '',
      });
      setIsSubjectModalOpen(true);
    } else {
      resetSubjectForm({
        name: '',
        code: '',
        description: '',
        subjectType: 'CORE',
        departmentId: '',
      });
    }
  }, [editingSubject, resetSubjectForm]);

  React.useEffect(() => {
    resetMapForm({
      gradeLevelId: classes && classes.length > 0 ? classes[0].id : '',
      subjectId: subjects && subjects.length > 0 ? subjects[0].id : '',
      sectionId: '',
      isMandatory: true,
    });
  }, [isMappingModalOpen, resetMapForm, classes, subjects]);

  if (isSubjectsLoading || isMappingsLoading) return <PageLoader />;

  const onSubjectSubmit = (data: z.infer<typeof subjectSchema>) => {
    const formatted = {
      ...data,
      departmentId: data.departmentId || undefined,
    };
    if (editingSubject) {
      updateSubjectMutation.mutate({ id: editingSubject.id, data: formatted as any });
    } else {
      createSubjectMutation.mutate(formatted as any);
    }
  };

  const onMapSubmit = (data: z.infer<typeof mapSchema>) => {
    mapSubjectMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Subjects & Curriculum</h1>
          <p className="text-sm text-muted-foreground">Configure subjects and map them to class curricula.</p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'subjects' ? (
            <Button onClick={() => { setEditingSubject(null); setIsSubjectModalOpen(true); }} className="gap-2">
              <Plus className="h-4 w-4" /> Add Subject
            </Button>
          ) : (
            <Button
              onClick={() => setIsMappingModalOpen(true)}
              className="gap-2"
              disabled={!classes || classes.length === 0 || !subjects || subjects.length === 0 || !filterYearId}
            >
              <Plus className="h-4 w-4" /> Map Subject to Class
            </Button>
          )}
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('subjects')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'subjects'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Course Subjects
        </button>
        <button
          onClick={() => setActiveTab('mapping')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'mapping'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Class Curriculum Mapping
        </button>
      </div>

      {/* SUBJECT WIZARD MODAL */}
      {isSubjectModalOpen && activeTab === 'subjects' && (
        <Card className="border-border animate-fade-in">
          <form onSubmit={handleSubmitSubject(onSubjectSubmit)}>
            <CardHeader>
              <CardTitle>{editingSubject ? 'Edit Subject' : 'Create Subject'}</CardTitle>
              <CardDescription>Setup subject properties and map department.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subName">Subject Name *</Label>
                  <Input id="subName" placeholder="e.g. Mathematics" {...registerSubject('name')} />
                  {subjectErrors.name && <p className="text-xs text-destructive">{subjectErrors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subCode">Subject Code *</Label>
                  <Input id="subCode" placeholder="e.g. MATH10" {...registerSubject('code')} />
                  {subjectErrors.code && <p className="text-xs text-destructive">{subjectErrors.code.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Subject Type *</Label>
                  <Select
                    value={subjectValues.subjectType}
                    onValueChange={(val) => setSubjectValue('subjectType', val as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CORE">CORE</SelectItem>
                      <SelectItem value="ELECTIVE">ELECTIVE</SelectItem>
                      <SelectItem value="OPTIONAL">OPTIONAL</SelectItem>
                      <SelectItem value="ACTIVITY">ACTIVITY</SelectItem>
                      <SelectItem value="OTHER">OTHER</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Department Link</Label>
                  <Select
                    value={subjectValues.departmentId}
                    onValueChange={(val) => setSubjectValue('departmentId', val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {departments?.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subDesc">Description</Label>
                <Input id="subDesc" placeholder="Brief outline..." {...registerSubject('description')} />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-3 border-t border-border pt-4">
              <Button type="button" variant="outline" onClick={() => setIsSubjectModalOpen(false)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {/* CURRICULUM MAPPING MODAL */}
      {isMappingModalOpen && activeTab === 'mapping' && (
        <Card className="border-border animate-fade-in">
          <form onSubmit={handleSubmitMap(onMapSubmit)}>
            <CardHeader>
              <CardTitle>Map Subject to Class</CardTitle>
              <CardDescription>Associate a course subject under the active academic year.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Target Class *</Label>
                  <Select value={mapValues.gradeLevelId} onValueChange={(val) => setMapValue('gradeLevelId', val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose class" />
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
                <div className="space-y-2">
                  <Label>Subject to Map *</Label>
                  <Select value={mapValues.subjectId} onValueChange={(val) => setMapValue('subjectId', val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects?.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name} ({s.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Core Type Setting</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      id="isMandatory"
                      className="rounded border-border bg-background h-4 w-4"
                      checked={mapValues.isMandatory}
                      onChange={(e) => setMapValue('isMandatory', e.target.checked)}
                    />
                    <Label htmlFor="isMandatory" className="text-sm font-medium">Mandatory / Compulsory Course</Label>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-3 border-t border-border pt-4">
              <Button type="button" variant="outline" onClick={() => setIsMappingModalOpen(false)}>Cancel</Button>
              <Button type="submit">Map Subject</Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {/* VIEW: SUBJECTS TAB */}
      {activeTab === 'subjects' && (
        !subjects || subjects.length === 0 ? (
          <Card className="border-border py-12">
            <EmptyState
              icon={BookOpen}
              title="No Subjects Configured"
              description="Define course subjects taught across class sections."
              action={<Button onClick={() => setIsSubjectModalOpen(true)}>Add Subject</Button>}
            />
          </Card>
        ) : (
          <div className="border border-border rounded-lg overflow-hidden bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject Name</TableHead>
                  <TableHead>Subject Code</TableHead>
                  <TableHead>Subject Type</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjects.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-semibold text-foreground">{sub.name}</TableCell>
                    <TableCell className="font-mono text-xs">{sub.code}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{sub.subjectType}</Badge>
                    </TableCell>
                    <TableCell>{sub.department?.name || '—'}</TableCell>
                    <TableCell>
                      <Badge variant={sub.status === 'ACTIVE' ? 'success' : 'secondary' as any}>{sub.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => setEditingSubject(sub)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )
      )}

      {/* VIEW: CURRICULUM MAPPING TAB */}
      {activeTab === 'mapping' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label className="text-xs uppercase text-muted-foreground font-bold">Academic Session:</Label>
              <Select value={filterYearId} onValueChange={setFilterYearId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose Session" />
                </SelectTrigger>
                <SelectContent>
                  {academicYears?.map((y) => (
                    <SelectItem key={y.id} value={y.id}>
                      {y.name} {y.isCurrent && '(Active)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs uppercase text-muted-foreground font-bold">Class Level:</Label>
              <Select value={filterClassId} onValueChange={setFilterClassId}>
                <SelectTrigger>
                  <SelectValue placeholder="All Classes" />
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
          </div>

          {!mappings || mappings.length === 0 ? (
            <Card className="border-border py-12">
              <EmptyState
                icon={Link}
                title="No Subjects Mapped to Class"
                description="Formulate class curriculum by mapping subjects to specific class levels."
                action={
                  <Button onClick={() => setIsMappingModalOpen(true)} disabled={!classes || classes.length === 0 || !subjects || subjects.length === 0}>
                    Map Subject
                  </Button>
                }
              />
            </Card>
          ) : (
            <div className="border border-border rounded-lg overflow-hidden bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class</TableHead>
                    <TableHead>Subject Name</TableHead>
                    <TableHead>Subject Code</TableHead>
                    <TableHead>Subject Type</TableHead>
                    <TableHead>Mandatory Setting</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mappings.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-semibold">{m.gradeLevel?.name || '—'}</TableCell>
                      <TableCell className="font-medium text-foreground">{m.subject?.name || '—'}</TableCell>
                      <TableCell className="font-mono text-xs">{m.subject?.code || '—'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{m.subject?.subjectType || '—'}</Badge>
                      </TableCell>
                      <TableCell>
                        {m.isMandatory ? (
                          <Badge variant="success" className="py-0.5">Mandatory</Badge>
                        ) : (
                          <Badge variant="secondary" className="py-0.5">Elective</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <ConfirmDialog
                          title="Remove Class Subject Mapping"
                          description={`Are you sure you want to remove '${m.subject?.name}' from '${m.gradeLevel?.name}' curriculum?`}
                          confirmLabel="Remove Mapping"
                          variant="destructive"
                          onConfirm={() => unmapMutation.mutate(m.id)}
                          isLoading={unmapMutation.isPending}
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
      )}
    </div>
  );
}
