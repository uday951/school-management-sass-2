import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeesApi, type Employee } from '@/api/employees';
import { departmentsApi } from '@/api/departments';
import { Card, CardContent } from '@/components/ui/card';
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
import { Users, Plus, Search, Eye, Edit, UserMinus } from 'lucide-react';
import { toast } from 'sonner';

export default function EmployeesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState('');
  const [filterType, setFilterType] = React.useState('ALL');
  const [filterEmpType, setFilterEmpType] = React.useState('ALL');
  const [filterDept, setFilterDept] = React.useState('ALL');
  const [filterStatus, setFilterStatus] = React.useState('ALL');

  // Departments list for select
  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentsApi.list,
  });

  // Employees directory query
  const { data: result, isLoading, error } = useQuery({
    queryKey: ['employees', page, search, filterType, filterEmpType, filterDept, filterStatus],
    queryFn: () =>
      employeesApi.list({
        search: search || undefined,
        employeeType: filterType !== 'ALL' ? filterType : undefined,
        employmentType: filterEmpType !== 'ALL' ? filterEmpType : undefined,
        departmentId: filterDept !== 'ALL' ? filterDept : undefined,
        status: filterStatus !== 'ALL' ? filterStatus : undefined,
        page,
        limit: 10,
      }),
  });

  // Archive mutation
  const archiveMutation = useMutation({
    mutationFn: (id: string) => employeesApi.updateStatus(id, { status: 'ARCHIVED', reason: 'Archived via directory' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employee record archived successfully');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to archive employee');
    },
  });

  if (isLoading) return <PageLoader />;
  if (error) return <div className="text-center py-12 text-destructive">Failed to load employee list.</div>;

  const employees = result?.data || [];
  const meta = result?.meta;

  const getStatusBadge = (status: string) => {
    const maps: Record<string, { variant: 'default' | 'success' | 'secondary' | 'warning' | 'destructive' }> = {
      ACTIVE: { variant: 'success' },
      ON_LEAVE: { variant: 'warning' },
      SUSPENDED: { variant: 'destructive' },
      RESIGNED: { variant: 'secondary' },
      TERMINATED: { variant: 'destructive' },
      RETIRED: { variant: 'secondary' },
    };
    const config = maps[status] || { variant: 'secondary' };
    return <Badge variant={config.variant as any}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Staff & Faculty Directory</h1>
          <p className="text-sm text-muted-foreground">Manage school employee records, academic teaching assignments, and roles.</p>
        </div>
        <Button onClick={() => navigate('/school/employees/new')} className="gap-2">
          <Plus className="h-4 w-4" /> Add Employee
        </Button>
      </div>

      {/* Filters Row */}
      <Card className="border-border">
        <CardContent className="pt-6 grid gap-4 grid-cols-2 md:grid-cols-5">
          <div className="space-y-1.5 col-span-2 md:col-span-1">
            <Label className="text-xs font-semibold text-muted-foreground uppercase">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Name, EMP No, or Post..."
                className="pl-9"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase">Staff Category</Label>
            <Select value={filterType} onValueChange={(val) => { setFilterType(val); setPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Categories</SelectItem>
                <SelectItem value="TEACHING">Teaching Faculty</SelectItem>
                <SelectItem value="ADMINISTRATIVE">Administrative</SelectItem>
                <SelectItem value="SUPPORT">Support Staff</SelectItem>
                <SelectItem value="MANAGEMENT">Management</SelectItem>
                <SelectItem value="OTHER">Other Type</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase">Employment Mode</Label>
            <Select value={filterEmpType} onValueChange={(val) => { setFilterEmpType(val); setPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="All Modes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Modes</SelectItem>
                <SelectItem value="FULL_TIME">Full Time</SelectItem>
                <SelectItem value="PART_TIME">Part Time</SelectItem>
                <SelectItem value="CONTRACT">Contract Basis</SelectItem>
                <SelectItem value="TEMPORARY">Temporary</SelectItem>
                <SelectItem value="INTERN">Internship</SelectItem>
                <SelectItem value="VISITING">Visiting Faculty</SelectItem>
                <SelectItem value="OTHER">Other Mode</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase">Department</Label>
            <Select value={filterDept} onValueChange={(val) => { setFilterDept(val); setPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Departments</SelectItem>
                {departments?.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
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
                <SelectItem value="ON_LEAVE">ON LEAVE</SelectItem>
                <SelectItem value="SUSPENDED">SUSPENDED</SelectItem>
                <SelectItem value="RESIGNED">RESIGNED</SelectItem>
                <SelectItem value="TERMINATED">TERMINATED</SelectItem>
                <SelectItem value="RETIRED">RETIRED</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Directory table */}
      {employees.length === 0 ? (
        <Card className="border-border py-12">
          <EmptyState
            icon={Users}
            title="No Employees Found"
            description="Onboard your first school employee to build departments and academic classrooms."
            action={
              <Button onClick={() => navigate('/school/employees/new')}>
                Add Employee
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
                  <TableHead>EMP Number</TableHead>
                  <TableHead>Employee Name</TableHead>
                  <TableHead>Designation / Post</TableHead>
                  <TableHead>Staff Category</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Employment Type</TableHead>
                  <TableHead>Login Account</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell className="font-mono text-xs font-semibold text-foreground">
                      {emp.employeeNumber}
                    </TableCell>
                    <TableCell className="font-semibold text-foreground">
                      {emp.firstName} {emp.lastName}
                    </TableCell>
                    <TableCell>{emp.designation}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">
                        {emp.employeeType}
                      </Badge>
                    </TableCell>
                    <TableCell>{emp.primaryDepartment?.name || '—'}</TableCell>
                    <TableCell>{emp.employmentType}</TableCell>
                    <TableCell>
                      {emp.user ? (
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                          Linked ({emp.user.role?.name || 'User'})
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">No Login Access</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(emp.status)}</TableCell>
                    <TableCell className="text-right flex items-center justify-end gap-1.5">
                      <Button variant="ghost" size="icon" asChild title="View Profile">
                        <Link to={`/school/employees/${emp.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <ConfirmDialog
                        title="Archive Employee Record"
                        description={`Are you sure you want to archive employee '${emp.firstName} ${emp.lastName}'? This will disable any linked login user accounts and clear current workload mappings.`}
                        confirmLabel="Archive"
                        variant="destructive"
                        onConfirm={() => archiveMutation.mutate(emp.id)}
                        isLoading={archiveMutation.isPending}
                        trigger={
                          <Button variant="ghost" size="icon" className="hover:text-destructive" title="Archive Employee">
                            <UserMinus className="h-4 w-4" />
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
