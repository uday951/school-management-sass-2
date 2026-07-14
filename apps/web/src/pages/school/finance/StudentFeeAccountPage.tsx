import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { feesApi } from '@/api/fees';
import { academicYearsApi } from '@/api/academicYears';
import { classesApi } from '@/api/classes';
import { studentsApi } from '@/api/students';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PageLoader } from '@/components/LoadingSpinner';
import { toast } from 'sonner';
import { Printer, RefreshCw, FileText, ArrowRightLeft, DollarSign, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function StudentFeeAccountPage() {
  const queryClient = useQueryClient();
  const [selectedClass, setSelectedClass] = React.useState('');
  const [selectedStudentId, setSelectedStudentId] = React.useState('');
  const [isAdjustmentOpen, setIsAdjustmentOpen] = React.useState(false);
  const [adjustmentForm, setAdjustmentForm] = React.useState({
    feeComponentId: '',
    amountMinor: 0,
    description: '',
    dueDate: ''
  });

  const { data: currentYear } = useQuery({
    queryKey: ['currentAcademicYear'],
    queryFn: async () => {
      const list = await academicYearsApi.list();
      return list.find(y => y.isCurrent) || list[0] || null;
    }
  });

  const academicYearId = currentYear?.id || '';

  const { data: classes } = useQuery({
    queryKey: ['classes'],
    queryFn: () => classesApi.listClasses()
  });

  // Fetch components for manual charges
  const { data: components } = useQuery({
    queryKey: ['feeComponents'],
    queryFn: () => feesApi.listComponents()
  });

  // Fetch students in class
  const { data: studentRoster } = useQuery({
    queryKey: ['rosterForFees', selectedClass],
    queryFn: () => feesApi.previewBulkAssignmentStudents(selectedClass, null),
    enabled: !!selectedClass
  });

  // Fetch Student Fee Account Overview
  const { data: account, isLoading: loadingAccount, refetch: refetchAccount } = useQuery({
    queryKey: ['studentFeeAccount', selectedStudentId, academicYearId],
    queryFn: () => feesApi.getStudentFeeAccount(selectedStudentId, academicYearId),
    enabled: !!selectedStudentId && !!academicYearId
  });

  // Fetch Student Ledger
  const { data: ledger, isLoading: loadingLedger, refetch: refetchLedger } = useQuery({
    queryKey: ['studentFeeLedger', selectedStudentId, academicYearId],
    queryFn: () => feesApi.getStudentLedger(selectedStudentId, academicYearId),
    enabled: !!selectedStudentId && !!academicYearId
  });

  // Manual Adjustment Mutation
  const chargeMutation = useMutation({
    mutationFn: (data: any) => feesApi.createManualCharge(academicYearId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentFeeAccount', selectedStudentId] });
      queryClient.invalidateQueries({ queryKey: ['studentFeeLedger', selectedStudentId] });
      toast.success('Manual charge generated successfully');
      setIsAdjustmentOpen(false);
      setAdjustmentForm({ feeComponentId: '', amountMinor: 0, description: '', dueDate: '' });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to generate manual charge');
    }
  });

  const handleCreateCharge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustmentForm.feeComponentId || !adjustmentForm.description || adjustmentForm.amountMinor <= 0) {
      toast.error('All fields are required');
      return;
    }
    chargeMutation.mutate({
      studentId: selectedStudentId,
      academicYearId,
      ...adjustmentForm
    });
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount / 100);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Student Fee Ledger</h1>
        <p className="text-slate-400 text-sm">Review, adjust, and reconcile individual student ledger balances.</p>
      </div>

      {/* Selector Section */}
      <Card className="border-slate-800 bg-slate-900/40">
        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="text-slate-300">Filter by Class</Label>
            <Select value={selectedClass} onValueChange={(val) => { setSelectedClass(val); setSelectedStudentId(''); }}>
              <SelectTrigger className="bg-slate-950 border-slate-800 text-white mt-1">
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 text-white">
                {classes?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedClass && (
            <div>
              <Label className="text-slate-300">Select Student</Label>
              <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                <SelectTrigger className="bg-slate-950 border-slate-800 text-white mt-1">
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-white">
                  {studentRoster?.map((s) => (
                    <SelectItem key={s.studentId} value={s.studentId}>{s.firstName} {s.lastName} ({s.admissionNumber})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedStudentId && (
        <div className="space-y-6">
          {/* Account Metrics */}
          {loadingAccount ? <PageLoader /> : account && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-slate-900/40 p-4 rounded-lg border border-slate-800 text-center">
                <div className="text-xs text-slate-400 font-semibold uppercase">Total Billed</div>
                <div className="text-xl font-bold text-white mt-1">{formatMoney(account.totalCharges)}</div>
              </div>
              <div className="bg-slate-900/40 p-4 rounded-lg border border-slate-800 text-center">
                <div className="text-xs text-slate-400 font-semibold uppercase">Scholarships/Concessions</div>
                <div className="text-xl font-bold text-amber-400 mt-1">{formatMoney(account.totalConcessions)}</div>
              </div>
              <div className="bg-slate-900/40 p-4 rounded-lg border border-slate-800 text-center">
                <div className="text-xs text-slate-400 font-semibold uppercase">Paid Amount</div>
                <div className="text-xl font-bold text-emerald-400 mt-1">{formatMoney(account.totalPaid)}</div>
              </div>
              <div className="bg-slate-900/40 p-4 rounded-lg border border-slate-800 text-center">
                <div className="text-xs text-slate-400 font-semibold uppercase">Total Refunded</div>
                <div className="text-xl font-bold text-indigo-400 mt-1">{formatMoney(account.totalRefunded)}</div>
              </div>
              <div className="bg-slate-900/40 p-4 rounded-lg border border-slate-800 text-center">
                <div className="text-xs text-slate-400 font-semibold uppercase">Outstanding Balance</div>
                <div className="text-xl font-bold text-rose-400 mt-1">{formatMoney(account.outstandingBalance)}</div>
              </div>
            </div>
          )}

          {/* Ledger Actions */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-violet-400" />
              Chronological Ledger Timeline
            </h2>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={() => setIsAdjustmentOpen(true)} className="bg-slate-950 border border-slate-800 text-slate-300 hover:text-white">
                <Plus className="w-4 h-4 mr-1" /> Add Manual Charge
              </Button>
              <Button size="sm" onClick={() => { refetchAccount(); refetchLedger(); }} className="bg-slate-950 border border-slate-800 text-slate-300 hover:text-white">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Ledger Table */}
          {loadingLedger ? <PageLoader /> : ledger && (
            <Card className="border-slate-800 bg-slate-900/40">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-800 hover:bg-transparent">
                      <TableHead className="text-slate-400">Date</TableHead>
                      <TableHead className="text-slate-400">Description</TableHead>
                      <TableHead className="text-slate-400 text-right">Debit (+)</TableHead>
                      <TableHead className="text-slate-400 text-right">Credit (-)</TableHead>
                      <TableHead className="text-slate-400 text-right">Running Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ledger.map((item, idx) => (
                      <TableRow key={idx} className="border-slate-800 hover:bg-slate-800/20">
                        <TableCell className="text-slate-400">{new Date(item.date).toLocaleDateString()}</TableCell>
                        <TableCell className="font-semibold text-slate-200">{item.description}</TableCell>
                        <TableCell className="text-right text-rose-400 font-bold">
                          {item.type === 'DEBIT' ? formatMoney(item.amount) : '-'}
                        </TableCell>
                        <TableCell className="text-right text-emerald-400 font-bold">
                          {item.type === 'CREDIT' ? formatMoney(item.amount) : '-'}
                        </TableCell>
                        <TableCell className="text-right text-white font-bold">{formatMoney(item.balance)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Manual Adjustment Dialog */}
      <Dialog open={isAdjustmentOpen} onOpenChange={setIsAdjustmentOpen}>
        <DialogContent className="border-slate-800 bg-slate-900 text-white">
          <form onSubmit={handleCreateCharge} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Generate Manual Charge</DialogTitle>
              <DialogDescription className="text-slate-400">Apply a one-off debit charge to this student's ledger.</DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <div>
                <Label className="text-slate-300">Fee Component</Label>
                <Select
                  value={adjustmentForm.feeComponentId}
                  onValueChange={(val) => setAdjustmentForm({ ...adjustmentForm, feeComponentId: val })}
                >
                  <SelectTrigger className="bg-slate-950 border-slate-800 mt-1">
                    <SelectValue placeholder="Select Component" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-white">
                    {components?.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-slate-300">Amount (INR)</Label>
                <Input
                  type="number"
                  value={adjustmentForm.amountMinor / 100}
                  onChange={(e) => setAdjustmentForm({ ...adjustmentForm, amountMinor: Math.round(Number(e.target.value) * 100) })}
                  className="bg-slate-950 border-slate-800 text-white mt-1"
                />
              </div>

              <div>
                <Label className="text-slate-300">Description / Reason</Label>
                <Input
                  value={adjustmentForm.description}
                  onChange={(e) => setAdjustmentForm({ ...adjustmentForm, description: e.target.value })}
                  className="bg-slate-950 border-slate-800 text-white mt-1"
                  placeholder="e.g. Fine for late book return"
                />
              </div>

              <div>
                <Label className="text-slate-300">Due Date (Optional)</Label>
                <Input
                  type="date"
                  value={adjustmentForm.dueDate}
                  onChange={(e) => setAdjustmentForm({ ...adjustmentForm, dueDate: e.target.value })}
                  className="bg-slate-950 border-slate-800 text-white mt-1"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAdjustmentOpen(false)} className="border-slate-800 bg-slate-950 text-slate-400 hover:text-white">
                Cancel
              </Button>
              <Button type="submit" disabled={chargeMutation.isPending} className="bg-violet-600 hover:bg-violet-500 text-white">
                {chargeMutation.isPending ? 'Generating...' : 'Apply Charge'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
