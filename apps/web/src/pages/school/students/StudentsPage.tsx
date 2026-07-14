import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentsApi, type Student } from '@/api/students';
import { classesApi } from '@/api/classes';
import { academicYearsApi } from '@/api/academicYears';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { PageLoader } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { Pagination } from '@/components/Pagination';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Plus, Search, Eye, Edit, UserX, UserCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function StudentsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState('');
  const [filterYear, setFilterYear] = React.useState('ALL');
  const [filterClass, setFilterClass] = React.useState('ALL');
  const [filterSection, setFilterSection] = React.useState('ALL');
  const [filterStatus, setFilterStatus] = React.useState('ALL');

  // Queries for selectors
  const { data: years } = useQuery({
    queryKey: ['academicYears'],
    queryFn: academicYearsApi.list,
  });

  const { data: classes } = useQuery({
    queryKey: ['classes'],
    queryFn: classesApi.listClasses,
  });

  const { data: sections } = useQuery({
    queryKey: ['sections', filterClass],
    queryFn: () => classesApi.listSections(filterClass !== 'ALL' ? filterClass : undefined),
    enabled: filterClass !== 'ALL',
  });

  // Main Students Query
  const { data: result, isLoading, error } = useQuery({
    queryKey: ['students', page, search, filterYear, filterClass, filterSection, filterStatus],
    queryFn: () =>
      studentsApi.list({
        search: search || undefined,
        academicYearId: filterYear !== 'ALL' ? filterYear : undefined,
        gradeLevelId: filterClass !== 'ALL' ? filterClass : undefined,
        sectionId: filterSection !== 'ALL' ? filterSection : undefined,
        status: filterStatus !== 'ALL' ? filterStatus : undefined,
        page,
        limit: 10,
      }),
  });

  // Archive mutation
  const archiveMutation = useMutation({
    mutationFn: (id: string) => studentsApi.updateStatus(id, { status: 'ARCHIVED', reason: 'Archived via directory' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Student archived successfully');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to archive student');
    },
  });

  if (isLoading) return <PageLoader />;
  if (error) return <div className="text-center py-12 text-destructive">Failed to load students.</div>;

  const students = result?.data || [];
  const meta = result?.meta;

  const getStatusBadge = (status: string) => {
    const maps: Record<string, { variant: 'default' | 'success' | 'secondary' | 'warning' }> = {
      ACTIVE: { variant: 'success' },
      INACTIVE: { variant: 'secondary' },
      WITHDRAWN: { variant: 'warning' },
      TRANSFERRED: { variant: 'warning' },
      GRADUATED: { variant: 'default' },
    };
    const config = maps[status] || { variant: 'secondary' };
    return <Badge variant={config.variant as any}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Student Registry</h1>
          <p className="text-sm text-muted-foreground">Manage student admission records and academic enrollments.</p>
        </div>
        <Button onClick={() => navigate('/school/students/new')} className="gap-2">
          <Plus className="h-4 w-4" /> Add Student
        </Button>
      </div>

      {/* Filter Row */}
      <Card className="border-border">
        <CardContent className="pt-6 grid gap-4 grid-cols-2 md:grid-cols-5">
          <div className="space-y-1.5 col-span-2 md:col-span-1">
            <Label className="text-xs font-semibold text-muted-foreground uppercase">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Name or Admission No."
                className="pl-9"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase">Session</Label>
            <Select value={filterYear} onValueChange={(val) => { setFilterYear(val); setPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="All Sessions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Sessions</SelectItem>
                {years?.map((y) => (
                  <SelectItem key={y.id} value={y.id}>
                    {y.name} {y.isCurrent && '(Current)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase">Class Standard</Label>
            <Select
              value={filterClass}
              onValueChange={(val) => {
                setFilterClass(val);
                setFilterSection('ALL');
                setPage(1);
              }}
            >
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

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase">Section</Label>
            <Select
              value={filterSection}
              onValueChange={(val) => { setFilterSection(val); setPage(1); }}
              disabled={filterClass === 'ALL'}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Sections" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Sections</SelectItem>
                {sections?.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase">Status</Label>
            <Select value={filterStatus} onValueChange={(val) => { setFilterStatus(val); setPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                <SelectItem value="WITHDRAWN">WITHDRAWN</SelectItem>
                <SelectItem value="TRANSFERRED">TRANSFERRED</SelectItem>
                <SelectItem value="GRADUATED">GRADUATED</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Directory Table */}
      {students.length === 0 ? (
        <Card className="border-border py-12">
          <EmptyState
            icon={GraduationCap}
            title="No Students Found"
            description="Add your first student enrollment to initialize school registers."
            action={
              <Button onClick={() => navigate('/school/students/new')}>
                Add Student
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="border border-border rounded-lg overflow-hidden bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Admission No.</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Class standard</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Roll Number</TableHead>
                  <TableHead>Primary Guardian</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-mono text-xs font-semibold text-foreground">
                      {student.admissionNumber}
                    </TableCell>
                    <TableCell className="font-semibold text-foreground">
                      {student.firstName} {student.lastName}
                    </TableCell>
                    <TableCell>{student.currentEnrollment?.class || '—'}</TableCell>
                    <TableCell>{student.currentEnrollment?.section || '—'}</TableCell>
                    <TableCell>{student.currentEnrollment?.rollNumber || '—'}</TableCell>
                    <TableCell>
                      {student.primaryGuardian ? (
                        <div>
                          <p className="text-xs font-medium text-foreground">{student.primaryGuardian.name}</p>
                          <p className="text-[10px] text-muted-foreground">{student.primaryGuardian.phone}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(student.status)}</TableCell>
                    <TableCell className="text-right flex items-center justify-end gap-1.5">
                      <Button variant="ghost" size="icon" asChild title="View Profile">
                        <Link to={`/school/students/${student.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild title="Edit Personal Details">
                        <Link to={`/school/students/${student.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <ConfirmDialog
                        title="Archive Student"
                        description={`Are you sure you want to archive student '${student.firstName} ${student.lastName}'? This will mark their status as ARCHIVED and withdraw active enrollments.`}
                        confirmLabel="Archive"
                        variant="destructive"
                        onConfirm={() => archiveMutation.mutate(student.id)}
                        isLoading={archiveMutation.isPending}
                        trigger={
                          <Button variant="ghost" size="icon" className="hover:text-destructive" title="Archive Student">
                            <UserX className="h-4 w-4" />
                          </Button>
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {meta && <Pagination meta={meta} onPageChange={setPage} />}
        </div>
      )}
    </div>
  );
}
