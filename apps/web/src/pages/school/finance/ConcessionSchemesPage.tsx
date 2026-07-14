import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { feesApi, type ConcessionScheme, type StudentConcession } from '@/api/fees';
import { academicYearsApi } from '@/api/academicYears';
import { classesApi } from '@/api/classes';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PageLoader } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { toast } from 'sonner';
import { Plus, Check, X, ShieldAlert, Award, UserPlus } from 'lucide-react';

export default function ConcessionSchemesPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = React.useState<'schemes' | 'students' | 'approval'>('schemes');
  const [isSchemeOpen, setIsSchemeOpen] = React.useState(false);
  const [isApplyOpen, setIsApplyOpen] = React.useState(false);
  
  // Forms state
  const [schemeForm, setSchemeForm] = React.useState({
    name: '',
    code: '',
    description: '',
    concessionType: 'FIXED_AMOUNT' as 'FIXED_AMOUNT' | 'PERCENTAGE',
    value: 0,
    maximumAmountMinor: 0
  });

  const [applyForm, setApplyForm] = React.useState({
    classId: '',
    studentId: '',
    concessionSchemeId: '',
    applicableFeeComponentId: '',
    approvedAmountMinor: 0,
    percentageBasisPoints: 0,
    reason: ''
  });

  const { data: currentYear } = useQuery({
    queryKey: ['currentAcademicYear'],
    queryFn: async () => {
      const list = await academicYearsApi.list();
      return list.find(y => y.isCurrent) || list[0] || null;
    }
  });

  const academicYearId = currentYear?.id || '';

  // Core Queries
  const { data: schemes, isLoading: loadingSchemes } = useQuery({
    queryKey: ['concessionSchemes'],
    queryFn: () => feesApi.listConcessionSchemes()
  });

  const { data: studentConcessions, isLoading: loadingStudentConcessions } = useQuery({
    queryKey: ['studentConcessions', academicYearId],
    queryFn: () => feesApi.listStudentConcessions(academicYearId),
    enabled: !!academicYearId
  });

  const { data: classes } = useQuery({
    queryKey: ['classes'],
    queryFn: () => classesApi.listClasses()
  });

  const { data: components } = useQuery({
    queryKey: ['feeComponents'],
    queryFn: () => feesApi.listComponents()
  });

  const { data: studentRoster } = useQuery({
    queryKey: ['rosterForConcessions', applyForm.classId],
    queryFn: () => feesApi.previewBulkAssignmentStudents(applyForm.classId, null),
    enabled: !!applyForm.classId
  });

  // Mutations
  const schemeMutation = useMutation({
    mutationFn: (data: any) => feesApi.createConcessionScheme(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['concessionSchemes'] });
      toast.success('Concession scheme created successfully');
      setIsSchemeOpen(false);
      setSchemeForm({ name: '', code: '', description: '', concessionType: 'FIXED_AMOUNT', value: 0, maximumAmountMinor: 0 });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to create concession scheme');
    }
  });

  const applyMutation = useMutation({
    mutationFn: (data: any) => feesApi.applyStudentConcession(academicYearId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentConcessions', academicYearId] });
      toast.success('Student concession applied and queued for approval');
      setIsApplyOpen(false);
      setApplyForm({ classId: '', studentId: '', concessionSchemeId: '', applicableFeeComponentId: '', approvedAmountMinor: 0, percentageBasisPoints: 0, reason: '' });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to apply student concession');
    }
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => feesApi.approveConcession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentConcessions', academicYearId] });
      toast.success('Student concession approved and applied');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to approve concession');
    }
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => feesApi.rejectConcession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentConcessions', academicYearId] });
      toast.success('Student concession request rejected');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to reject concession');
    }
  });

  const handleCreateScheme = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schemeForm.name.trim() || schemeForm.value <= 0) {
      toast.error('Name and Value are required');
      return;
    }
    schemeMutation.mutate(schemeForm);
  };

  const handleApplyConcession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyForm.studentId || !applyForm.concessionSchemeId) {
      toast.error('Student and Scheme are required');
      return;
    }

    const payload: any = {
      studentId: applyForm.studentId,
      concessionSchemeId: applyForm.concessionSchemeId,
      applicableFeeComponentId: applyForm.applicableFeeComponentId || null,
      reason: applyForm.reason
    };

    if (applyForm.approvedAmountMinor > 0) {
      payload.approvedAmountMinor = applyForm.approvedAmountMinor;
    }
    if (applyForm.percentageBasisPoints > 0) {
      payload.percentageBasisPoints = applyForm.percentageBasisPoints;
    }

    applyMutation.mutate(payload);
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount / 100);
  };

  if (loadingSchemes || loadingStudentConcessions) return <PageLoader />;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Concessions & Scholarships</h1>
          <p className="text-slate-400 text-sm">Manage discount schemes, merit scholarships, sibling concessions, and approve fee adjustments.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsApplyOpen(true)} className="bg-slate-950 border border-slate-800 text-slate-300 hover:text-white">
            <UserPlus className="w-4 h-4 mr-2" /> Apply to Student
          </Button>
          <Button onClick={() => setIsSchemeOpen(true)} className="bg-violet-600 hover:bg-violet-500 text-white">
            <Plus className="w-4 h-4 mr-2" /> Add Scheme
          </Button>
        </div>
      </div>

      {/* Tab Selectors */}
      <div className="flex border-b border-slate-800 gap-6">
        <button
          onClick={() => setActiveTab('schemes')}
          className={`pb-3 text-sm font-semibold transition-colors ${activeTab === 'schemes' ? 'border-b-2 border-violet-500 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          Concession Schemes
        </button>
        <button
          onClick={() => setActiveTab('students')}
          className={`pb-3 text-sm font-semibold transition-colors ${activeTab === 'students' ? 'border-b-2 border-violet-500 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          All Assigned Concessions
        </button>
        <button
          onClick={() => setActiveTab('approval')}
          className={`pb-3 text-sm font-semibold transition-colors ${activeTab === 'approval' ? 'border-b-2 border-violet-500 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          Approval Queue
        </button>
      </div>

      {/* Tab Content: Concession Schemes */}
      {activeTab === 'schemes' && (
        <div className="space-y-4">
          {!schemes || schemes.length === 0 ? (
            <EmptyState icon={Award} title="No Schemes Setup" description="Create concession templates like sibling discounts, merit scholarship schemes, etc." />
          ) : (
            <Card className="border-slate-800 bg-slate-900/40">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-800 hover:bg-transparent">
                      <TableHead className="text-slate-400">Name</TableHead>
                      <TableHead className="text-slate-400">Code</TableHead>
                      <TableHead className="text-slate-400">Type</TableHead>
                      <TableHead className="text-slate-400">Value</TableHead>
                      <TableHead className="text-slate-400">Max Limit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schemes.map((scheme) => (
                      <TableRow key={scheme.id} className="border-slate-800 hover:bg-slate-800/20">
                        <TableCell className="font-semibold text-slate-200">
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-violet-400" />
                            {scheme.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-400">{scheme.code || '-'}</TableCell>
                        <TableCell className="text-slate-400">{scheme.concessionType}</TableCell>
                        <TableCell className="text-white font-bold">
                          {scheme.concessionType === 'PERCENTAGE' ? `${scheme.value / 100}%` : formatMoney(scheme.value)}
                        </TableCell>
                        <TableCell className="text-slate-400">
                          {scheme.maximumAmountMinor ? formatMoney(scheme.maximumAmountMinor) : 'Unrestricted'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Tab Content: All Assigned Concessions */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          {!studentConcessions || studentConcessions.filter(c => c.status === 'APPROVED').length === 0 ? (
            <EmptyState icon={Award} title="No Approved Concessions" description="Use Apply to Student configuration to schedule concessions." />
          ) : (
            <Card className="border-slate-800 bg-slate-900/40">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-800 hover:bg-transparent">
                      <TableHead className="text-slate-400">Admission No</TableHead>
                      <TableHead className="text-slate-400">Student</TableHead>
                      <TableHead className="text-slate-400">Scheme</TableHead>
                      <TableHead className="text-slate-400">Value applied</TableHead>
                      <TableHead className="text-slate-400">Reason</TableHead>
                      <TableHead className="text-slate-400">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentConcessions.filter(c => c.status === 'APPROVED').map((sc) => (
                      <TableRow key={sc.id} className="border-slate-800 hover:bg-slate-800/20">
                        <TableCell className="text-slate-400">{sc.student?.admissionNumber}</TableCell>
                        <TableCell className="font-semibold text-slate-200">{sc.student?.firstName} {sc.student?.lastName}</TableCell>
                        <TableCell className="text-slate-400">{sc.scheme?.name}</TableCell>
                        <TableCell className="text-white font-bold">
                          {sc.approvedAmountMinor ? formatMoney(sc.approvedAmountMinor) : `${(sc.percentageBasisPoints || 0) / 100}%`}
                        </TableCell>
                        <TableCell className="text-slate-400">{sc.reason || '-'}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400">
                            {sc.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Tab Content: Approval Queue */}
      {activeTab === 'approval' && (
        <div className="space-y-4">
          {!studentConcessions || studentConcessions.filter(c => c.status === 'PENDING').length === 0 ? (
            <EmptyState icon={ShieldAlert} title="Approval Queue Empty" description="Outstanding concession requests needing review will appear here." />
          ) : (
            <Card className="border-slate-800 bg-slate-900/40">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-800 hover:bg-transparent">
                      <TableHead className="text-slate-400">Student</TableHead>
                      <TableHead className="text-slate-400">Scheme</TableHead>
                      <TableHead className="text-slate-400">Proposed Value</TableHead>
                      <TableHead className="text-slate-400">Reason</TableHead>
                      <TableHead className="text-right text-slate-400">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentConcessions.filter(c => c.status === 'PENDING').map((sc) => (
                      <TableRow key={sc.id} className="border-slate-800 hover:bg-slate-800/20">
                        <TableCell className="font-semibold text-slate-200">
                          {sc.student?.firstName} {sc.student?.lastName}
                          <span className="block text-xs font-normal text-slate-500">Admn: {sc.student?.admissionNumber}</span>
                        </TableCell>
                        <TableCell className="text-slate-400">{sc.scheme?.name}</TableCell>
                        <TableCell className="text-white font-bold">
                          {sc.approvedAmountMinor ? formatMoney(sc.approvedAmountMinor) : `${(sc.percentageBasisPoints || 0) / 100}%`}
                        </TableCell>
                        <TableCell className="text-slate-400">{sc.reason || '-'}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button size="sm" onClick={() => approveMutation.mutate(sc.id)} className="bg-emerald-600 hover:bg-emerald-500 text-white">
                            <Check className="w-4 h-4 mr-1" /> Approve
                          </Button>
                          <Button size="sm" onClick={() => rejectMutation.mutate(sc.id)} className="bg-rose-600 hover:bg-rose-500 text-white">
                            <X className="w-4 h-4 mr-1" /> Reject
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Scheme Creator Dialog */}
      <Dialog open={isSchemeOpen} onOpenChange={setIsSchemeOpen}>
        <DialogContent className="border-slate-800 bg-slate-900 text-white">
          <form onSubmit={handleCreateScheme} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Create Concession Scheme</DialogTitle>
              <DialogDescription className="text-slate-400">Configure global concession policies.</DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <div>
                <Label className="text-slate-300">Scheme Name</Label>
                <Input
                  value={schemeForm.name}
                  onChange={(e) => setSchemeForm({ ...schemeForm, name: e.target.value })}
                  className="bg-slate-950 border-slate-800 text-white mt-1"
                  placeholder="e.g. Sibling Discount 10%"
                />
              </div>

              <div>
                <Label className="text-slate-300">Code (Optional)</Label>
                <Input
                  value={schemeForm.code}
                  onChange={(e) => setSchemeForm({ ...schemeForm, code: e.target.value })}
                  className="bg-slate-950 border-slate-800 text-white mt-1"
                  placeholder="e.g. SIB_10"
                />
              </div>

              <div>
                <Label className="text-slate-300">Calculation Basis</Label>
                <Select
                  value={schemeForm.concessionType}
                  onValueChange={(val: any) => setSchemeForm({ ...schemeForm, concessionType: val })}
                >
                  <SelectTrigger className="bg-slate-950 border-slate-800 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-white">
                    <SelectItem value="FIXED_AMOUNT">Fixed Absolute Amount</SelectItem>
                    <SelectItem value="PERCENTAGE">Percentage Basis</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-slate-300">
                  {schemeForm.concessionType === 'PERCENTAGE' ? 'Percentage (e.g. 1000 = 10%)' : 'Amount Value (INR)'}
                </Label>
                <Input
                  type="number"
                  value={schemeForm.concessionType === 'PERCENTAGE' ? schemeForm.value / 100 : schemeForm.value / 100}
                  onChange={(e) => setSchemeForm({ 
                    ...schemeForm, 
                    value: schemeForm.concessionType === 'PERCENTAGE' ? Math.round(Number(e.target.value) * 100) : Math.round(Number(e.target.value) * 100) 
                  })}
                  className="bg-slate-950 border-slate-800 text-white mt-1"
                />
              </div>

              {schemeForm.concessionType === 'PERCENTAGE' && (
                <div>
                  <Label className="text-slate-300">Maximum Amount Limit (INR)</Label>
                  <Input
                    type="number"
                    value={schemeForm.maximumAmountMinor / 100}
                    onChange={(e) => setSchemeForm({ ...schemeForm, maximumAmountMinor: Math.round(Number(e.target.value) * 100) })}
                    className="bg-slate-950 border-slate-800 text-white mt-1"
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsSchemeOpen(false)} className="border-slate-800 bg-slate-950 text-slate-400 hover:text-white">
                Cancel
              </Button>
              <Button type="submit" disabled={schemeMutation.isPending} className="bg-violet-600 hover:bg-violet-500 text-white">
                {schemeMutation.isPending ? 'Saving...' : 'Save Scheme'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Apply Concession to Student Dialog */}
      <Dialog open={isApplyOpen} onOpenChange={setIsApplyOpen}>
        <DialogContent className="border-slate-800 bg-slate-900 text-white">
          <form onSubmit={handleApplyConcession} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Apply Concession to Student</DialogTitle>
              <DialogDescription className="text-slate-400">Map a concession scheme to an active student account.</DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <div>
                <Label className="text-slate-300">Class</Label>
                <Select
                  value={applyForm.classId}
                  onValueChange={(val) => setApplyForm({ ...applyForm, classId: val, studentId: '' })}
                >
                  <SelectTrigger className="bg-slate-950 border-slate-800 mt-1">
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-white">
                    {classes?.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {applyForm.classId && (
                <div>
                  <Label className="text-slate-300">Student</Label>
                  <Select
                    value={applyForm.studentId}
                    onValueChange={(val) => setApplyForm({ ...applyForm, studentId: val })}
                  >
                    <SelectTrigger className="bg-slate-950 border-slate-800 mt-1">
                      <SelectValue placeholder="Select Student" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-white">
                      {studentRoster?.map((s) => (
                        <SelectItem key={s.studentId} value={s.studentId}>{s.firstName} {s.lastName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label className="text-slate-300">Concession Scheme</Label>
                <Select
                  value={applyForm.concessionSchemeId}
                  onValueChange={(val) => {
                    const sc = schemes?.find(s => s.id === val);
                    setApplyForm({ 
                      ...applyForm, 
                      concessionSchemeId: val,
                      approvedAmountMinor: sc && sc.concessionType === 'FIXED_AMOUNT' ? sc.value : 0,
                      percentageBasisPoints: sc && sc.concessionType === 'PERCENTAGE' ? sc.value : 0
                    });
                  }}
                >
                  <SelectTrigger className="bg-slate-950 border-slate-800 mt-1">
                    <SelectValue placeholder="Select Scheme" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-white">
                    {schemes?.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-slate-300">Target Component (Optional Override)</Label>
                <Select
                  value={applyForm.applicableFeeComponentId}
                  onValueChange={(val) => setApplyForm({ ...applyForm, applicableFeeComponentId: val })}
                >
                  <SelectTrigger className="bg-slate-950 border-slate-800 mt-1">
                    <SelectValue placeholder="All Components" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-white">
                    <SelectItem value="all">All Components</SelectItem>
                    {components?.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {applyForm.percentageBasisPoints > 0 ? (
                <div>
                  <Label className="text-slate-300">Percentage Value (e.g. 1000 = 10%)</Label>
                  <Input
                    type="number"
                    value={applyForm.percentageBasisPoints / 100}
                    onChange={(e) => setApplyForm({ ...applyForm, percentageBasisPoints: Math.round(Number(e.target.value) * 100) })}
                    className="bg-slate-950 border-slate-800 text-white mt-1"
                  />
                </div>
              ) : (
                <div>
                  <Label className="text-slate-300">Absolute Amount Value (INR)</Label>
                  <Input
                    type="number"
                    value={applyForm.approvedAmountMinor / 100}
                    onChange={(e) => setApplyForm({ ...applyForm, approvedAmountMinor: Math.round(Number(e.target.value) * 100) })}
                    className="bg-slate-950 border-slate-800 text-white mt-1"
                  />
                </div>
              )}

              <div>
                <Label className="text-slate-300">Reason / Details</Label>
                <Input
                  value={applyForm.reason}
                  onChange={(e) => setApplyForm({ ...applyForm, reason: e.target.value })}
                  className="bg-slate-950 border-slate-800 text-white mt-1"
                  placeholder="Reason for concession"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsApplyOpen(false)} className="border-slate-800 bg-slate-950 text-slate-400 hover:text-white">
                Cancel
              </Button>
              <Button type="submit" disabled={applyMutation.isPending} className="bg-violet-600 hover:bg-violet-500 text-white">
                {applyMutation.isPending ? 'Submitting...' : 'Apply'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
