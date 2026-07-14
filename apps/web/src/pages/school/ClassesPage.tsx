import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { classesApi, type GradeLevel, type Section } from '@/api/classes';
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
import { Layers, Plus, Edit, Trash2, LayoutGrid, Server } from 'lucide-react';
import { toast } from 'sonner';

const classSchema = z.object({
  name: z.string().min(1, 'Class name is required (e.g. Class 10, Standard I)'),
  code: z.string().min(1, 'Code is required').toUpperCase(),
  displayOrder: z.number().min(0).default(0),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).optional(),
});

const sectionSchema = z.object({
  gradeLevelId: z.string().min(1, 'Parent Class is required'),
  name: z.string().min(1, 'Section name is required (e.g. Section A, A)'),
  code: z.string().optional(),
  capacity: z.number().min(1, 'Capacity must be at least 1').optional(),
  displayOrder: z.number().min(0).default(0),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).optional(),
});

export default function ClassesPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = React.useState<'classes' | 'sections'>('classes');
  
  // Modals / Editing States
  const [isClassModalOpen, setIsClassModalOpen] = React.useState(false);
  const [editingClass, setEditingClass] = React.useState<GradeLevel | null>(null);

  const [isSectionModalOpen, setIsSectionModalOpen] = React.useState(false);
  const [editingSection, setEditingSection] = React.useState<Section | null>(null);

  // Filter for sections view
  const [filterClassId, setFilterClassId] = React.useState<string>('ALL');

  // Queries
  const { data: classes, isLoading: isClassesLoading } = useQuery({
    queryKey: ['classes'],
    queryFn: classesApi.listClasses,
  });

  const { data: sections, isLoading: isSectionsLoading } = useQuery({
    queryKey: ['sections', filterClassId],
    queryFn: () => classesApi.listSections(filterClassId !== 'ALL' ? filterClassId : undefined),
  });

  // Mutations
  const createClassMutation = useMutation({
    mutationFn: (data: z.infer<typeof classSchema>) => classesApi.createClass(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast.success('Class created successfully');
      setIsClassModalOpen(false);
      resetClassForm();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to create class');
    },
  });

  const updateClassMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: z.infer<typeof classSchema> }) => classesApi.updateClass(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast.success('Class updated successfully');
      setEditingClass(null);
      setIsClassModalOpen(false);
      resetClassForm();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update class');
    },
  });

  const createSectionMutation = useMutation({
    mutationFn: (data: z.infer<typeof sectionSchema>) => classesApi.createSection(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections'] });
      toast.success('Section mapped successfully');
      setIsSectionModalOpen(false);
      resetSectionForm();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to map section');
    },
  });

  const updateSectionMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: z.infer<typeof sectionSchema> }) => classesApi.updateSection(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections'] });
      toast.success('Section updated successfully');
      setEditingSection(null);
      setIsSectionModalOpen(false);
      resetSectionForm();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update section');
    },
  });

  // React Hook Forms
  const {
    register: registerClass,
    handleSubmit: handleSubmitClass,
    setValue: setClassValue,
    reset: resetClassForm,
    watch: watchClass,
    formState: { errors: classErrors },
  } = useForm<z.infer<typeof classSchema>>({
    resolver: zodResolver(classSchema),
  });

  const {
    register: registerSection,
    handleSubmit: handleSubmitSection,
    setValue: setSectionValue,
    reset: resetSectionForm,
    watch: watchSection,
    formState: { errors: sectionErrors },
  } = useForm<z.infer<typeof sectionSchema>>({
    resolver: zodResolver(sectionSchema),
  });

  const classValues = watchClass();
  const sectionValues = watchSection();

  // Pre-fill Class Modal
  React.useEffect(() => {
    if (editingClass) {
      resetClassForm({
        name: editingClass.name,
        code: editingClass.code,
        displayOrder: editingClass.displayOrder,
        description: editingClass.description || '',
        status: editingClass.status,
      });
      setIsClassModalOpen(true);
    } else {
      resetClassForm({
        name: '',
        code: '',
        displayOrder: 0,
        description: '',
        status: 'ACTIVE',
      });
    }
  }, [editingClass, resetClassForm]);

  // Pre-fill Section Modal
  React.useEffect(() => {
    if (editingSection) {
      resetSectionForm({
        gradeLevelId: editingSection.gradeLevelId,
        name: editingSection.name,
        code: editingSection.code || '',
        capacity: editingSection.capacity || undefined,
        displayOrder: editingSection.displayOrder,
        status: editingSection.status,
      });
      setIsSectionModalOpen(true);
    } else {
      resetSectionForm({
        gradeLevelId: classes && classes.length > 0 ? classes[0].id : '',
        name: '',
        code: '',
        capacity: undefined,
        displayOrder: 0,
        status: 'ACTIVE',
      });
    }
  }, [editingSection, resetSectionForm, classes]);

  if (isClassesLoading || isSectionsLoading) return <PageLoader />;

  const onClassSubmit = (data: z.infer<typeof classSchema>) => {
    if (editingClass) {
      updateClassMutation.mutate({ id: editingClass.id, data });
    } else {
      createClassMutation.mutate(data);
    }
  };

  const onSectionSubmit = (data: z.infer<typeof sectionSchema>) => {
    if (editingSection) {
      updateSectionMutation.mutate({ id: editingSection.id, data });
    } else {
      createSectionMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Classes & Sections</h1>
          <p className="text-sm text-muted-foreground">Manage classes, grade levels, and their classroom divisions.</p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'classes' ? (
            <Button onClick={() => { setEditingClass(null); setIsClassModalOpen(true); }} className="gap-2">
              <Plus className="h-4 w-4" /> Add Class
            </Button>
          ) : (
            <Button onClick={() => { setEditingSection(null); setIsSectionModalOpen(true); }} className="gap-2" disabled={!classes || classes.length === 0}>
              <Plus className="h-4 w-4" /> Add Section
            </Button>
          )}
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('classes')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'classes'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Classes / Grade Levels
        </button>
        <button
          onClick={() => setActiveTab('sections')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'sections'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Class Sections
        </button>
      </div>

      {/* CLASS WIZARD MODAL */}
      {isClassModalOpen && activeTab === 'classes' && (
        <Card className="border-border animate-fade-in">
          <form onSubmit={handleSubmitClass(onClassSubmit)}>
            <CardHeader>
              <CardTitle>{editingClass ? 'Edit Class' : 'Create Class'}</CardTitle>
              <CardDescription>Setup grade levels or standard classes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="className">Class Name *</Label>
                  <Input id="className" placeholder="e.g. Class 10" {...registerClass('name')} />
                  {classErrors.name && <p className="text-xs text-destructive">{classErrors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="classCode">Class Code *</Label>
                  <Input id="classCode" placeholder="e.g. CL10" {...registerClass('code')} />
                  {classErrors.code && <p className="text-xs text-destructive">{classErrors.code.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="displayOrder">Display Order *</Label>
                  <Input
                    id="displayOrder"
                    type="number"
                    value={classValues.displayOrder}
                    onChange={(e) => setClassValue('displayOrder', Number(e.target.value))}
                  />
                  {classErrors.displayOrder && <p className="text-xs text-destructive">{classErrors.displayOrder.message}</p>}
                </div>
                {editingClass && (
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={classValues.status} onValueChange={(val) => setClassValue('status', val as any)}>
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
                <Label htmlFor="classDesc">Description (Optional)</Label>
                <Input id="classDesc" placeholder="Brief notes about this grade level..." {...registerClass('description')} />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-3 border-t border-border pt-4">
              <Button type="button" variant="outline" onClick={() => setIsClassModalOpen(false)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {/* SECTION WIZARD MODAL */}
      {isSectionModalOpen && activeTab === 'sections' && (
        <Card className="border-border animate-fade-in">
          <form onSubmit={handleSubmitSection(onSectionSubmit)}>
            <CardHeader>
              <CardTitle>{editingSection ? 'Edit Section' : 'Create Section'}</CardTitle>
              <CardDescription>Configure section mappings under standard classes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Parent Class *</Label>
                  <Select
                    value={sectionValues.gradeLevelId}
                    onValueChange={(val) => setSectionValue('gradeLevelId', val)}
                    disabled={!!editingSection} // Prevent changing parent class on edit
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose parent class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes?.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {sectionErrors.gradeLevelId && <p className="text-xs text-destructive">{sectionErrors.gradeLevelId.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secName">Section Name *</Label>
                  <Input id="secName" placeholder="e.g. Section A" {...registerSection('name')} />
                  {sectionErrors.name && <p className="text-xs text-destructive">{sectionErrors.name.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="secCode">Code (Optional)</Label>
                  <Input id="secCode" placeholder="e.g. A" {...registerSection('code')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secCapacity">Capacity</Label>
                  <Input
                    id="secCapacity"
                    type="number"
                    value={sectionValues.capacity || ''}
                    onChange={(e) => setSectionValue('capacity', e.target.value ? Number(e.target.value) : undefined)}
                  />
                  {sectionErrors.capacity && <p className="text-xs text-destructive">{sectionErrors.capacity.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secDisplayOrder">Display Order</Label>
                  <Input
                    id="secDisplayOrder"
                    type="number"
                    value={sectionValues.displayOrder}
                    onChange={(e) => setSectionValue('displayOrder', Number(e.target.value))}
                  />
                </div>
              </div>

              {editingSection && (
                <div className="space-y-2 col-span-3">
                  <Label>Status</Label>
                  <Select value={sectionValues.status} onValueChange={(val) => setSectionValue('status', val as any)}>
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
            </CardContent>
            <CardFooter className="flex justify-end gap-3 border-t border-border pt-4">
              <Button type="button" variant="outline" onClick={() => setIsSectionModalOpen(false)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {/* MAIN VIEW: CLASSES TAB */}
      {activeTab === 'classes' && (
        classes?.length === 0 ? (
          <Card className="border-border py-12">
            <EmptyState
              icon={Layers}
              title="No Classes Setup"
              description="Onboard classes or grade levels to populate sections and subjects mapping."
              action={<Button onClick={() => setIsClassModalOpen(true)}>Create Class</Button>}
            />
          </Card>
        ) : (
          <div className="border border-border rounded-lg overflow-hidden bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class Name</TableHead>
                  <TableHead>Class Code</TableHead>
                  <TableHead>Display Order</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes?.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-semibold text-foreground">{c.name}</TableCell>
                    <TableCell className="font-mono text-xs">{c.code}</TableCell>
                    <TableCell>{c.displayOrder}</TableCell>
                    <TableCell className="text-muted-foreground truncate max-w-[220px]" title={c.description || ''}>
                      {c.description || '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={c.status === 'ACTIVE' ? 'success' : 'secondary' as any}>{c.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => setEditingClass(c)}>
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

      {/* MAIN VIEW: SECTIONS TAB */}
      {activeTab === 'sections' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Label className="text-xs uppercase text-muted-foreground font-bold shrink-0">Filter by Class:</Label>
            <Select value={filterClassId} onValueChange={setFilterClassId}>
              <SelectTrigger className="w-[180px]">
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

          {!sections || sections.length === 0 ? (
            <Card className="border-border py-12">
              <EmptyState
                icon={Layers}
                title="No Sections Mapped"
                description="Assign classroom sections under your grade levels to continue setup."
                action={
                  <Button onClick={() => setIsSectionModalOpen(true)} disabled={!classes || classes.length === 0}>
                    Add Section
                  </Button>
                }
              />
            </Card>
          ) : (
            <div className="border border-border rounded-lg overflow-hidden bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Section Name</TableHead>
                    <TableHead>Section Code</TableHead>
                    <TableHead>Parent Class</TableHead>
                    <TableHead>Capacity Limit</TableHead>
                    <TableHead>Display Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sections.map((sec) => (
                    <TableRow key={sec.id}>
                      <TableCell className="font-semibold text-foreground">{sec.name}</TableCell>
                      <TableCell className="font-mono text-xs">{sec.code || '—'}</TableCell>
                      <TableCell className="font-medium">{sec.gradeLevel?.name || '—'}</TableCell>
                      <TableCell>{sec.capacity || 'Unlimited'}</TableCell>
                      <TableCell>{sec.displayOrder}</TableCell>
                      <TableCell>
                        <Badge variant={sec.status === 'ACTIVE' ? 'success' : 'secondary' as any}>{sec.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setEditingSection(sec)}>
                          <Edit className="h-4 w-4" />
                        </Button>
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
