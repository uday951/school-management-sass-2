import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { staffOpsApi } from '@/api/staffOps';
import { departmentsApi } from '@/api/departments';
import { academicYearsApi } from '@/api/academicYears';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageLoader } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { toast } from 'sonner';
import { 
  Users, 
  Calendar, 
  Settings, 
  Check, 
  X, 
  Clock, 
  Plus, 
  FileText, 
  CheckSquare,
  AlertTriangle
} from 'lucide-react';

export default function StaffOperationsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = React.useState<'attendance' | 'requests' | 'types' | 'policies' | 'settings'>('attendance');

  // Filters
  const [dateFilter, setDateFilter] = React.useState<string>(new Date().toISOString().split('T')[0]);
  const [deptFilter, setDeptFilter] = React.useState<string>('all');
  const [typeFilter, setTypeFilter] = React.useState<string>('all');

  // Load Data
  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentsApi.list
  });

  const { data: academicYears } = useQuery({
    queryKey: ['academicYears'],
    queryFn: academicYearsApi.list
  });
  const currentAcademicYear = (academicYears as any)?.find((y: any) => y.isCurrent);

  const { data: staffList, isLoading: isStaffLoading } = useQuery({
    queryKey: ['staffAttendance', dateFilter, deptFilter, typeFilter],
    queryFn: () => staffOpsApi.listAttendance({
      date: dateFilter,
      departmentId: deptFilter === 'all' ? undefined : deptFilter,
      employeeType: typeFilter === 'all' ? undefined : typeFilter
    })
  });

  const { data: leaveRequests, isLoading: isRequestsLoading } = useQuery({
    queryKey: ['leaveRequests'],
    queryFn: staffOpsApi.getLeaveRequests
  });

  const { data: leaveTypes, isLoading: isTypesLoading } = useQuery({
    queryKey: ['leaveTypes'],
    queryFn: staffOpsApi.listLeaveTypes
  });

  const { data: leavePolicies, isLoading: isPoliciesLoading } = useQuery({
    queryKey: ['leavePolicies'],
    queryFn: staffOpsApi.listLeavePolicies
  });

  const { data: settings, isLoading: isSettingsLoading } = useQuery({
    queryKey: ['attendanceSettings'],
    queryFn: staffOpsApi.getSettings
  });

  // Mutators
  const markAttendanceMutation = useMutation({
    mutationFn: staffOpsApi.markAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staffAttendance'] });
      toast.success('Attendance recorded');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to record attendance')
  });

  const updateSettingsMutation = useMutation({
    mutationFn: staffOpsApi.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendanceSettings'] });
      toast.success('Settings updated');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to update settings')
  });

  const approveLeaveMutation = useMutation({
    mutationFn: (variables: { id: string; comment: string }) => staffOpsApi.reviewLeaveRequest(variables.id, {
      status: 'APPROVED',
      comment: variables.comment,
      academicYearId: currentAcademicYear?.id || ''
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
      queryClient.invalidateQueries({ queryKey: ['staffAttendance'] });
      toast.success('Leave request approved');
    },
    onError: (err: any) => toast.error(err.message || 'Approval failed')
  });

  const rejectLeaveMutation = useMutation({
    mutationFn: (variables: { id: string; comment: string }) => staffOpsApi.reviewLeaveRequest(variables.id, {
      status: 'REJECTED',
      comment: variables.comment,
      academicYearId: currentAcademicYear?.id || ''
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
      toast.success('Leave request rejected');
    },
    onError: (err: any) => toast.error(err.message || 'Rejection failed')
  });

  // Form states
  const [newType, setNewType] = React.useState({ name: '', code: '', description: '', isPaid: true, requiresApproval: true });
  const createTypeMutation = useMutation({
    mutationFn: staffOpsApi.createLeaveType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaveTypes'] });
      toast.success('Leave type created');
      setNewType({ name: '', code: '', description: '', isPaid: true, requiresApproval: true });
    },
    onError: (err: any) => toast.error(err.message || 'Failed to create leave type')
  });

  const [impactRequest, setImpactRequest] = React.useState<string | null>(null);
  const { data: leaveImpact } = useQuery({
    queryKey: ['leaveImpact', impactRequest],
    queryFn: () => staffOpsApi.getLeaveImpact(impactRequest!),
    enabled: !!impactRequest
  });

  if (isStaffLoading || isRequestsLoading || isTypesLoading || isPoliciesLoading || isSettingsLoading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto text-slate-100 bg-slate-950 min-h-screen">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-800 pb-5 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-200 via-slate-100 to-indigo-100 bg-clip-text text-transparent">
            Staff Operations Desk
          </h1>
          <p className="text-sm text-slate-400">Manage school employee attendance, leave balances, policy rules, and approvals.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 overflow-x-auto gap-2">
        <Button variant={activeTab === 'attendance' ? 'default' : 'ghost'} onClick={() => setActiveTab('attendance')} className="rounded-none border-b-2 border-transparent data-[active=true]:border-primary" data-active={activeTab === 'attendance'}>
          Attendance Monitor
        </Button>
        <Button variant={activeTab === 'requests' ? 'default' : 'ghost'} onClick={() => setActiveTab('requests')} className="rounded-none border-b-2 border-transparent data-[active=true]:border-primary" data-active={activeTab === 'requests'}>
          Leave Approval Queue
        </Button>
        <Button variant={activeTab === 'types' ? 'default' : 'ghost'} onClick={() => setActiveTab('types')} className="rounded-none border-b-2 border-transparent data-[active=true]:border-primary" data-active={activeTab === 'types'}>
          Leave Types
        </Button>
        <Button variant={activeTab === 'policies' ? 'default' : 'ghost'} onClick={() => setActiveTab('policies')} className="rounded-none border-b-2 border-transparent data-[active=true]:border-primary" data-active={activeTab === 'policies'}>
          Leave Policies
        </Button>
        <Button variant={activeTab === 'settings' ? 'default' : 'ghost'} onClick={() => setActiveTab('settings')} className="rounded-none border-b-2 border-transparent data-[active=true]:border-primary" data-active={activeTab === 'settings'}>
          Settings
        </Button>
      </div>

      {/* Tab content: Attendance Monitor */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          <Card className="border-slate-800 bg-slate-900/40">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Filters</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-4">
              <div>
                <Label>Date</Label>
                <Input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="bg-slate-950 border-slate-800" />
              </div>
              <div>
                <Label>Department</Label>
                <Select value={deptFilter} onValueChange={setDeptFilter}>
                  <SelectTrigger className="bg-slate-950 border-slate-800">
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-950 border-slate-800 text-slate-100">
                    <SelectItem value="all">All Departments</SelectItem>
                    {((departments || []) as any).map((d: any) => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Staff Type</Label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="bg-slate-950 border-slate-800">
                    <SelectValue placeholder="All Staff" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-950 border-slate-800 text-slate-100">
                    <SelectItem value="all">All Staff Types</SelectItem>
                    <SelectItem value="TEACHING">Teaching Staff</SelectItem>
                    <SelectItem value="ADMINISTRATIVE">Administrative</SelectItem>
                    <SelectItem value="SUPPORT">Support Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/40">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-slate-400">Employee No</TableHead>
                    <TableHead className="text-slate-400">Name</TableHead>
                    <TableHead className="text-slate-400">Department</TableHead>
                    <TableHead className="text-slate-400">Role/Designation</TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                    <TableHead className="text-slate-400 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staffList?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-slate-500 italic">No matching employees found.</TableCell>
                    </TableRow>
                  ) : (
                    staffList?.map((item) => (
                      <TableRow key={item.employeeId} className="border-slate-800 hover:bg-slate-900/20">
                        <TableCell className="font-mono text-xs">{item.employeeNumber}</TableCell>
                        <TableCell className="font-semibold">{item.firstName} {item.lastName}</TableCell>
                        <TableCell>{item.departmentName}</TableCell>
                        <TableCell className="text-slate-400">{item.designation}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.attendance?.status === 'PRESENT' ? 'bg-emerald-500/10 text-emerald-400' :
                            item.attendance?.status === 'LATE' ? 'bg-amber-500/10 text-amber-400' :
                            item.attendance?.status === 'ON_LEAVE' ? 'bg-indigo-500/10 text-indigo-400' :
                            item.attendance?.status === 'HALF_DAY' ? 'bg-blue-500/10 text-blue-400' :
                            'bg-rose-500/10 text-rose-400'
                          }`}>
                            {item.attendance?.status || 'NOT MARKED'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button size="sm" variant="outline" className="bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500 hover:text-white" onClick={() => markAttendanceMutation.mutate({
                            employeeId: item.employeeId,
                            date: dateFilter,
                            status: 'PRESENT'
                          })}>
                            Present
                          </Button>
                          <Button size="sm" variant="outline" className="bg-rose-500/10 border-rose-500/30 hover:bg-rose-500 hover:text-white" onClick={() => markAttendanceMutation.mutate({
                            employeeId: item.employeeId,
                            date: dateFilter,
                            status: 'ABSENT'
                          })}>
                            Absent
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab content: Leave Approval Queue */}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          <Card className="border-slate-800 bg-slate-900/40">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Pending Leave Requests</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-slate-400">Employee</TableHead>
                    <TableHead className="text-slate-400">Type</TableHead>
                    <TableHead className="text-slate-400">Dates</TableHead>
                    <TableHead className="text-slate-400">Reason</TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                    <TableHead className="text-slate-400 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaveRequests?.filter(r => r.status === 'PENDING').length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-slate-500 italic">No pending leave requests found.</TableCell>
                    </TableRow>
                  ) : (
                    leaveRequests?.filter(r => r.status === 'PENDING').map((req) => (
                      <TableRow key={req.id} className="border-slate-800 hover:bg-slate-900/20">
                        <TableCell>
                          <div className="font-semibold">{req.employee?.firstName} {req.employee?.lastName}</div>
                          <div className="text-xs text-slate-400 font-mono">{req.employee?.employeeNumber}</div>
                        </TableCell>
                        <TableCell>{req.leaveType?.name}</TableCell>
                        <TableCell>{new Date(req.startDate).toLocaleDateString()} to {new Date(req.endDate).toLocaleDateString()}</TableCell>
                        <TableCell className="max-w-xs truncate">{req.reason}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400">PENDING</span>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button size="sm" variant="outline" className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10" onClick={() => setImpactRequest(req.id)}>
                            Inspect Schedule
                          </Button>
                          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500" onClick={() => approveLeaveMutation.mutate({ id: req.id, comment: 'Approved' })}>
                            Approve
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => rejectLeaveMutation.mutate({ id: req.id, comment: 'Rejected' })}>
                            Reject
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Schedule Impact Drawer/Panel */}
          {impactRequest && (
            <Card className="border-slate-800 bg-slate-900/40 p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="font-bold text-slate-200 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-400" /> Timetable & Substitution Impact
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setImpactRequest(null)}>Close</Button>
              </div>

              {!leaveImpact || leaveImpact.length === 0 ? (
                <p className="text-sm text-slate-400 italic">No scheduled teaching periods are affected during this leave period.</p>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-slate-400">The teacher is scheduled for the following periods. You may need to allocate substitute teachers in Substitution Management.</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {leaveImpact.map((imp, idx) => (
                      <div key={idx} className="rounded-lg bg-slate-950 p-4 border border-slate-800 flex justify-between items-start">
                        <div>
                          <div className="text-xs font-semibold text-indigo-400">{imp.date} &bull; {imp.dayOfWeek}</div>
                          <div className="text-sm font-bold mt-1 text-slate-100">{imp.className} - {imp.sectionName}</div>
                          <div className="text-xs text-slate-400">{imp.subjectName}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold text-slate-200">{imp.periodName}</div>
                          <div className="text-[10px] text-slate-500 mt-1">{imp.startTime} - {imp.endTime}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>
      )}

      {/* Tab content: Leave Types */}
      {activeTab === 'types' && (
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-slate-800 bg-slate-900/40 h-fit">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Add Leave Type</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Leave Type Name *</Label>
                <Input value={newType.name} onChange={e => setNewType({ ...newType, name: e.target.value })} placeholder="e.g. Sick Leave" className="bg-slate-950 border-slate-800" />
              </div>
              <div>
                <Label>Code (Short name)</Label>
                <Input value={newType.code} onChange={e => setNewType({ ...newType, code: e.target.value })} placeholder="e.g. SL" className="bg-slate-950 border-slate-800" />
              </div>
              <div>
                <Label>Description</Label>
                <Input value={newType.description} onChange={e => setNewType({ ...newType, description: e.target.value })} placeholder="Optional notes" className="bg-slate-950 border-slate-800" />
              </div>
              <div className="flex items-center justify-between border-t border-slate-800 pt-3">
                <Label>Is Paid Leave?</Label>
                <input type="checkbox" checked={newType.isPaid} onChange={e => setNewType({ ...newType, isPaid: e.target.checked })} className="h-4 w-4 rounded border-slate-800 bg-slate-950 text-primary" />
              </div>
              <div className="flex items-center justify-between border-t border-slate-800 pt-3">
                <Label>Requires Admin Approval?</Label>
                <input type="checkbox" checked={newType.requiresApproval} onChange={e => setNewType({ ...newType, requiresApproval: e.target.checked })} className="h-4 w-4 rounded border-slate-800 bg-slate-950 text-primary" />
              </div>
              <Button onClick={() => createTypeMutation.mutate(newType)} className="w-full bg-primary hover:bg-primary/95 text-white mt-4" disabled={!newType.name}>
                Create Leave Type
              </Button>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/40 md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Configured Leave Types</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-slate-400">Name</TableHead>
                    <TableHead className="text-slate-400">Code</TableHead>
                    <TableHead className="text-slate-400">Paid?</TableHead>
                    <TableHead className="text-slate-400">Needs Approval</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaveTypes?.map(type => (
                    <TableRow key={type.id} className="border-slate-800 hover:bg-slate-900/20">
                      <TableCell className="font-semibold">{type.name}</TableCell>
                      <TableCell className="font-mono text-xs text-indigo-400">{type.code || 'N/A'}</TableCell>
                      <TableCell>{type.isPaid ? 'YES' : 'NO'}</TableCell>
                      <TableCell>{type.requiresApproval ? 'YES' : 'NO'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab content: Leave Policies */}
      {activeTab === 'policies' && (
        <Card className="border-slate-800 bg-slate-900/40">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Leave Policies & Allowances</CardTitle>
            <CardDescription className="text-slate-400">Define active annual allowances (days) per leave type and employee type.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-400">Policy Name</TableHead>
                  <TableHead className="text-slate-400">Employee Scope</TableHead>
                  <TableHead className="text-slate-400">Rules (Leave Type & Allowance)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leavePolicies?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-6 text-slate-500 italic">No leave policies defined. Create a policy to initialize allowances.</TableCell>
                  </TableRow>
                ) : (
                  leavePolicies?.map(policy => (
                    <TableRow key={policy.id} className="border-slate-800 hover:bg-slate-900/20">
                      <TableCell className="font-semibold">{policy.name}</TableCell>
                      <TableCell className="text-indigo-400">{policy.employeeType || 'All Staff'}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {policy.rules?.map(rule => (
                            <span key={rule.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-slate-950 text-slate-300 mr-2">
                              {rule.leaveType?.name}: {rule.annualAllowance} Days
                            </span>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Tab content: Settings */}
      {activeTab === 'settings' && (
        <Card className="border-slate-800 bg-slate-900/40 max-w-xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Staff Attendance Configurations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <Label className="text-base">Allow Staff Self Check-In</Label>
                <p className="text-xs text-slate-400">Enables self service attendance logging via the teacher/employee portal dashboard.</p>
              </div>
              <input type="checkbox" checked={!!settings?.selfCheckInEnabled} onChange={e => updateSettingsMutation.mutate({ selfCheckInEnabled: e.target.checked })} className="h-4 w-4 rounded border-slate-800 bg-slate-950 text-primary" />
            </div>

            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <Label className="text-base">Allow Staff Self Check-Out</Label>
                <p className="text-xs text-slate-400">Requires employees to record checkout times at the end of their shifts.</p>
              </div>
              <input type="checkbox" checked={!!settings?.selfCheckOutEnabled} onChange={e => updateSettingsMutation.mutate({ selfCheckOutEnabled: e.target.checked })} className="h-4 w-4 rounded border-slate-800 bg-slate-950 text-primary" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 pt-2">
              <div>
                <Label>Mark Late After Time</Label>
                <Input type="text" value={settings?.lateAfterTime || '09:15'} placeholder="e.g. 09:15" className="bg-slate-950 border-slate-800" onChange={e => updateSettingsMutation.mutate({ lateAfterTime: e.target.value })} />
              </div>
              <div>
                <Label>Mark Half Day After Time</Label>
                <Input type="text" value={settings?.halfDayAfterTime || '13:00'} placeholder="e.g. 13:00" className="bg-slate-950 border-slate-800" onChange={e => updateSettingsMutation.mutate({ halfDayAfterTime: e.target.value })} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
