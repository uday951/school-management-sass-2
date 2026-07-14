import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { employeesApi } from '@/api/employees';
import { rolesApi } from '@/api/roles';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { PageLoader } from '@/components/LoadingSpinner';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { formatDate } from '@/lib/utils';
import {
  Users,
  ArrowLeft,
  Briefcase,
  GraduationCap,
  Shield,
  Trash2,
  Plus,
  Key,
} from 'lucide-react';
import { toast } from 'sonner';

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = React.useState<'overview' | 'qualifications' | 'experience' | 'assignments' | 'access'>('overview');

  // Modal / Form state toggles
  const [isQualOpen, setIsQualOpen] = React.useState(false);
  const [qualName, setQualName] = React.useState('');
  const [specialization, setSpecialization] = React.useState('');
  const [institution, setInstitution] = React.useState('');
  const [compYear, setCompYear] = React.useState('');

  const [isExpOpen, setIsExpOpen] = React.useState(false);
  const [orgName, setOrgName] = React.useState('');
  const [expRole, setExpRole] = React.useState('');
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [isCurrent, setIsCurrent] = React.useState(false);

  const [isAccountOpen, setIsAccountOpen] = React.useState(false);
  const [accountEmail, setAccountEmail] = React.useState('');
  const [accountRoleId, setAccountRoleId] = React.useState('');
  const [accountPassword, setAccountPassword] = React.useState('');

  const [targetRoleId, setTargetRoleId] = React.useState('');

  // Queries
  const { data: employee, isLoading, error } = useQuery({
    queryKey: ['employeeProfile', id],
    queryFn: () => employeesApi.getProfile(id!),
    enabled: !!id,
  });

  const { data: roles } = useQuery({
    queryKey: ['roles'],
    queryFn: rolesApi.list,
  });

  // Mutations
  const addQualMutation = useMutation({
    mutationFn: (data: any) => employeesApi.addQualification(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employeeProfile', id] });
      toast.success('Qualification added');
      setIsQualOpen(false);
      setQualName('');
      setSpecialization('');
      setInstitution('');
      setCompYear('');
    },
  });

  const deleteQualMutation = useMutation({
    mutationFn: (qualId: string) => employeesApi.deleteQualification(qualId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employeeProfile', id] });
      toast.success('Qualification deleted');
    },
  });

  const addExpMutation = useMutation({
    mutationFn: (data: any) => employeesApi.addExperience(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employeeProfile', id] });
      toast.success('Experience record added');
      setIsExpOpen(false);
      setOrgName('');
      setExpRole('');
      setStartDate('');
      setEndDate('');
      setIsCurrent(false);
    },
  });

  const deleteExpMutation = useMutation({
    mutationFn: (expId: string) => employeesApi.deleteExperience(expId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employeeProfile', id] });
      toast.success('Experience record removed');
    },
  });

  const createAccountMutation = useMutation({
    mutationFn: (data: any) => employeesApi.createAccount(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employeeProfile', id] });
      toast.success('Login account created');
      setIsAccountOpen(false);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to create login account');
    },
  });

  const toggleAccountMutation = useMutation({
    mutationFn: (active: boolean) => employeesApi.updateAccountStatus(id!, { active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employeeProfile', id] });
      toast.success('Account access modified');
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: (roleId: string) => employeesApi.updateRoles(id!, { schoolRoleId: roleId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employeeProfile', id] });
      toast.success('Assigned role updated');
    },
  });

  if (isLoading) return <PageLoader />;
  if (error || !employee) return <div className="text-center py-12 text-destructive">Employee profile not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/school/employees">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {employee.firstName} {employee.lastName}
            </h1>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              EMP Number: <strong className="font-mono text-foreground">{employee.employeeNumber}</strong> | Designation:{' '}
              <strong className="text-foreground">{employee.designation}</strong>
            </p>
          </div>
        </div>
        <Badge variant={employee.status === 'ACTIVE' ? 'success' : 'secondary' as any}>{employee.status}</Badge>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'overview'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Bio & Overview
        </button>
        <button
          onClick={() => setActiveTab('qualifications')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'qualifications'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Qualifications ({employee.qualifications.length})
        </button>
        <button
          onClick={() => setActiveTab('experience')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'experience'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Experience History ({employee.experiences.length})
        </button>
        <button
          onClick={() => setActiveTab('assignments')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'assignments'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Teaching workload ({employee.teacherAssignments.length})
        </button>
        <button
          onClick={() => setActiveTab('access')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'access'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Account Settings
        </button>
      </div>

      {/* TAB OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Bio Details</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground block text-xs uppercase">Employee Name</span>
                  <span className="font-semibold">{employee.firstName} {employee.middleName || ''} {employee.lastName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs uppercase">Category</span>
                  <span className="font-semibold">{employee.employeeType}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs uppercase">Designation</span>
                  <span className="font-semibold">{employee.designation}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs uppercase">Employment Mode</span>
                  <span>{employee.employmentType}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs uppercase">Joining Date</span>
                  <span>{formatDate(employee.joiningDate)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs uppercase">Primary Department</span>
                  <span>{employee.primaryDepartment?.name || '—'}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle>Contact details & Addresses</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-muted-foreground block text-xs uppercase">Personal Email</span>
                    <span>{employee.personalEmail || '—'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs uppercase">Work Email</span>
                    <span>{employee.workEmail || '—'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs uppercase">Personal Phone</span>
                    <span>{employee.personalPhone || '—'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs uppercase">Work Phone</span>
                    <span>{employee.workPhone || '—'}</span>
                  </div>
                </div>
                <div className="border-t pt-3">
                  <span className="text-muted-foreground block text-xs uppercase font-semibold">Current Address</span>
                  <span>{employee.currentAddressLine1 || '—'}, {employee.currentCity || '—'}, {employee.currentState || '—'}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar emergency info */}
          <div className="space-y-6">
            <Card className="border-border bg-muted/20">
              <CardHeader>
                <CardTitle className="text-base">Emergency Contacts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs sm:text-sm">
                <div>
                  <span className="text-muted-foreground block text-xs uppercase">Contact Name</span>
                  <span className="font-semibold">{employee.emergencyContactName || '—'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs uppercase">Relationship</span>
                  <span>{employee.emergencyContactRelationship || '—'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs uppercase">Phone Number</span>
                  <strong>{employee.emergencyContactPhone || '—'}</strong>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB QUALIFICATIONS */}
      {activeTab === 'qualifications' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={() => setIsQualOpen(true)} size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" /> Add Qualification
            </Button>
          </div>

          {isQualOpen && (
            <Card className="border-border p-4 bg-muted/10 space-y-4">
              <h4 className="font-bold text-sm">Add Qualification log</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Degree / Cert Title *</Label>
                  <Input placeholder="e.g. B.Ed" value={qualName} onChange={(e) => setQualName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Specialization</Label>
                  <Input placeholder="e.g. English Literature" value={specialization} onChange={(e) => setSpecialization(e.target.value)} />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <Label>Institution *</Label>
                  <Input placeholder="e.g. Delhi University" value={institution} onChange={(e) => setInstitution(e.target.value)} />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsQualOpen(false)}>Cancel</Button>
                <Button size="sm" onClick={() => addQualMutation.mutate({ qualificationName: qualName, specialization, institution })} disabled={addQualMutation.isPending || !qualName || !institution}>
                  Save
                </Button>
              </div>
            </Card>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {employee.qualifications.map((q) => (
              <Card key={q.id} className="border-border">
                <CardHeader className="flex flex-row justify-between items-start pb-2">
                  <div>
                    <CardTitle className="text-base flex items-center gap-1.5">
                      <GraduationCap className="h-4 w-4 text-primary" /> {q.qualificationName}
                    </CardTitle>
                    <CardDescription>{q.institution}</CardDescription>
                  </div>
                  <ConfirmDialog
                    title="Delete Qualification"
                    description={`Are you sure you want to remove qualification '${q.qualificationName}'?`}
                    confirmLabel="Delete"
                    variant="destructive"
                    onConfirm={() => deleteQualMutation.mutate(q.id)}
                    isLoading={deleteQualMutation.isPending}
                    trigger={
                      <Button variant="ghost" size="icon" className="hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    }
                  />
                </CardHeader>
                <CardContent className="text-xs sm:text-sm text-muted-foreground">
                  <p>Specialization: <strong className="text-foreground">{q.specialization || 'General'}</strong></p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB EXPERIENCE */}
      {activeTab === 'experience' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={() => setIsExpOpen(true)} size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" /> Add Experience Log
            </Button>
          </div>

          {isExpOpen && (
            <Card className="border-border p-4 bg-muted/10 space-y-4">
              <h4 className="font-bold text-sm">Add Previous Job Experience</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Organization Name *</Label>
                  <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Designation / Post *</Label>
                  <Input value={expRole} onChange={(e) => setExpRole(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Start Date *</Label>
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>End Date</Label>
                  <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsExpOpen(false)}>Cancel</Button>
                <Button size="sm" onClick={() => addExpMutation.mutate({ organizationName: orgName, designation: expRole, startDate, endDate })} disabled={addExpMutation.isPending || !orgName || !expRole || !startDate}>
                  Save Experience
                </Button>
              </div>
            </Card>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {employee.experiences.map((exp) => (
              <Card key={exp.id} className="border-border">
                <CardHeader className="flex flex-row justify-between items-start pb-2">
                  <div>
                    <CardTitle className="text-base flex items-center gap-1.5">
                      <Briefcase className="h-4 w-4 text-primary" /> {exp.designation}
                    </CardTitle>
                    <CardDescription>{exp.organizationName}</CardDescription>
                  </div>
                  <ConfirmDialog
                    title="Delete Experience record"
                    description={`Are you sure you want to remove experience record at '${exp.organizationName}'?`}
                    confirmLabel="Delete"
                    variant="destructive"
                    onConfirm={() => deleteExpMutation.mutate(exp.id)}
                    isLoading={deleteExpMutation.isPending}
                    trigger={
                      <Button variant="ghost" size="icon" className="hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    }
                  />
                </CardHeader>
                <CardContent className="text-xs sm:text-sm text-muted-foreground">
                  <p>Duration: <span className="text-foreground">{formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : 'Present'}</span></p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB TEACHER ASSIGNMENTS */}
      {activeTab === 'assignments' && (
        <div className="space-y-4">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Academic Teaching Workload Overview</CardTitle>
              <CardDescription>
                Employee is currently assigned to <strong className="text-foreground">{employee.teacherAssignments.length}</strong> active class rooms.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {employee.teacherAssignments.length === 0 ? (
                <p className="text-xs italic text-muted-foreground py-4 text-center">No active class subjects assigned.</p>
              ) : (
                <div className="border border-border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b">
                      <tr>
                        <th className="p-3 text-left">Academic Session</th>
                        <th className="p-3 text-left">Subject</th>
                        <th className="p-3 text-left">Class</th>
                        <th className="p-3 text-left">Section</th>
                        <th className="p-3 text-left">Assignment Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {employee.teacherAssignments.map((a) => (
                        <tr key={a.id}>
                          <td className="p-3">{a.academicYear.name}</td>
                          <td className="p-3 font-semibold">{a.subject.name}</td>
                          <td className="p-3">{a.gradeLevel.name}</td>
                          <td className="p-3">{a.section.name}</td>
                          <td className="p-3">
                            <Badge variant="outline" className="text-[10px]">{a.assignmentType}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB ACCOUNT SETTINGS */}
      {activeTab === 'access' && (
        <div className="space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Login Account Status</CardTitle>
              <CardDescription>Enable, disable, or re-assign permission roles.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {employee.user ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-muted/20 p-4 border rounded-lg">
                    <div>
                      <p className="font-semibold text-foreground">{employee.user.email}</p>
                      <p className="text-xs text-muted-foreground">Current Status: <Badge variant={employee.user.status === 'ACTIVE' ? 'success' : 'destructive' as any}>{employee.user.status}</Badge></p>
                    </div>
                    <Button
                      variant={employee.user.status === 'ACTIVE' ? 'destructive' : 'default'}
                      size="sm"
                      onClick={() => toggleAccountMutation.mutate(employee.user?.status !== 'ACTIVE')}
                      disabled={toggleAccountMutation.isPending}
                    >
                      {employee.user.status === 'ACTIVE' ? 'Disable Account Access' : 'Re-Enable Account'}
                    </Button>
                  </div>

                  <div className="space-y-2 border-t pt-4 max-w-sm">
                    <Label>Assigned Workspace Role</Label>
                    <div className="flex gap-2">
                      <Select
                        value={targetRoleId || employee.user.role?.id || ''}
                        onValueChange={setTargetRoleId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose Role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roles?.map((r) => (
                            <SelectItem key={r.id} value={r.id}>
                              {r.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        disabled={updateRoleMutation.isPending || !targetRoleId}
                        onClick={() => updateRoleMutation.mutate(targetRoleId)}
                      >
                        Change Role
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs sm:text-sm text-muted-foreground italic">This employee does not have workspace login credentials yet.</p>
                  
                  <Button onClick={() => setIsAccountOpen(true)} className="gap-1.5" size="sm">
                    <Key className="h-4 w-4" /> Create Login Account
                  </Button>

                  {isAccountOpen && (
                    <Card className="border p-4 bg-muted/10 space-y-4 max-w-md">
                      <h4 className="font-bold text-sm">Configure login credentials</h4>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <Label>Login Email</Label>
                          <Input value={accountEmail} onChange={(e) => setAccountEmail(e.target.value)} placeholder="e.g. user@school.com" />
                        </div>
                        <div className="space-y-1">
                          <Label>Role Access</Label>
                          <Select value={accountRoleId} onValueChange={setAccountRoleId}>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose Role" />
                            </SelectTrigger>
                            <SelectContent>
                              {roles?.map((r) => (
                                <SelectItem key={r.id} value={r.id}>
                                  {r.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label>Temporary Password</Label>
                          <Input type="password" value={accountPassword} onChange={(e) => setAccountPassword(e.target.value)} placeholder="Temp@2026" />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                          <Button variant="outline" size="sm" onClick={() => setIsAccountOpen(false)}>Cancel</Button>
                          <Button size="sm" onClick={() => createAccountMutation.mutate({ loginEmail: accountEmail, schoolRoleId: accountRoleId, temporaryPassword: accountPassword })} disabled={createAccountMutation.isPending || !accountEmail || !accountRoleId}>
                            Create Account
                          </Button>
                        </div>
                      </div>
                    </Card>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
