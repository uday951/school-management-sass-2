import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { feesApi, type RefundRecord } from '@/api/fees';
import { classesApi } from '@/api/classes';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { PageLoader } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { toast } from 'sonner';
import { Plus, RotateCcw, AlertTriangle, CreditCard } from 'lucide-react';

const paymentMethods = [
  { value: 'CASH', label: 'Cash' },
  { value: 'UPI', label: 'UPI Reference' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'CHEQUE', label: 'Cheque' },
  { value: 'CARD_OFFLINE', label: 'Card Offline' },
  { value: 'OTHER', label: 'Other' }
];

export default function RefundsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = React.useState<'record' | 'history'>('record');

  // Form states
  const [form, setForm] = React.useState({
    classId: '',
    studentId: '',
    amountMinor: 0,
    refundDate: new Date().toISOString().split('T')[0],
    refundMethod: 'CASH' as any,
    referenceNumber: '',
    reason: ''
  });

  const { data: classes } = useQuery({
    queryKey: ['classes'],
    queryFn: () => classesApi.listClasses()
  });

  // Fetch students in class
  const { data: studentRoster } = useQuery({
    queryKey: ['rosterForRefunds', form.classId],
    queryFn: () => feesApi.previewBulkAssignmentStudents(form.classId, null),
    enabled: !!form.classId
  });

  // Fetch refunds history
  const { data: refunds, isLoading: loadingRefunds } = useQuery({
    queryKey: ['refundsHistory'],
    queryFn: () => feesApi.listRefunds()
  });

  // Mutations
  const recordMutation = useMutation({
    mutationFn: (data: any) => feesApi.recordRefund(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['refundsHistory'] });
      toast.success('Refund logged successfully!');
      // Reset form
      setForm({
        classId: form.classId,
        studentId: '',
        amountMinor: 0,
        refundDate: new Date().toISOString().split('T')[0],
        refundMethod: 'CASH',
        referenceNumber: '',
        reason: ''
      });
      setActiveTab('history');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to record refund');
    }
  });

  const handleRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.studentId || form.amountMinor <= 0 || !form.reason.trim()) {
      toast.error('Student, amount, and reason are required');
      return;
    }

    recordMutation.mutate({
      studentId: form.studentId,
      amountMinor: form.amountMinor,
      refundDate: new Date(form.refundDate),
      refundMethod: form.refundMethod,
      referenceNumber: form.referenceNumber || undefined,
      reason: form.reason
    });
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount / 100);
  };

  if (loadingRefunds) return <PageLoader />;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Refund Recording Desk</h1>
        <p className="text-slate-400 text-sm">Reimburse or refund manual overpayments directly to parents or student balances.</p>
      </div>

      {/* Tab Selectors */}
      <div className="flex border-b border-slate-800 gap-6">
        <button
          onClick={() => setActiveTab('record')}
          className={`pb-3 text-sm font-semibold transition-colors ${activeTab === 'record' ? 'border-b-2 border-violet-500 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          Issue Fee Refund
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 text-sm font-semibold transition-colors ${activeTab === 'history' ? 'border-b-2 border-violet-500 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          Refund History Log
        </button>
      </div>

      {/* Tab Content: Issue Fee Refund */}
      {activeTab === 'record' && (
        <Card className="border-slate-800 bg-slate-900/40 max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Log Offline Refund
            </CardTitle>
            <CardDescription className="text-slate-400">Record a payout. Note: This does not trigger bank payout gateway integration.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRecord} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">Class</Label>
                  <Select value={form.classId} onValueChange={(val) => setForm({ ...form, classId: val, studentId: '' })}>
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
                {form.classId && (
                  <div>
                    <Label className="text-slate-300">Student</Label>
                    <Select value={form.studentId} onValueChange={(val) => setForm({ ...form, studentId: val })}>
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
              </div>

              <div>
                <Label className="text-slate-300">Refund Amount (INR)</Label>
                <Input
                  type="number"
                  value={form.amountMinor / 100}
                  onChange={(e) => setForm({ ...form, amountMinor: Math.round(Number(e.target.value) * 100) })}
                  className="bg-slate-950 border-slate-800 text-white mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">Refund Date</Label>
                  <Input
                    type="date"
                    value={form.refundDate}
                    onChange={(e) => setForm({ ...form, refundDate: e.target.value })}
                    className="bg-slate-950 border-slate-800 text-white mt-1"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Refund Method</Label>
                  <Select value={form.refundMethod} onValueChange={(val: any) => setForm({ ...form, refundMethod: val })}>
                    <SelectTrigger className="bg-slate-950 border-slate-800 mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-white">
                      {paymentMethods.map((m) => (
                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-slate-300">Transaction Reference (UPI Txn / Cheque No / Bank Ref)</Label>
                <Input
                  value={form.referenceNumber}
                  onChange={(e) => setForm({ ...form, referenceNumber: e.target.value })}
                  className="bg-slate-950 border-slate-800 text-white mt-1"
                  placeholder="e.g. UTR654321"
                />
              </div>

              <div>
                <Label className="text-slate-300">Reason for Refund</Label>
                <Input
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  className="bg-slate-950 border-slate-800 text-white mt-1"
                  placeholder="e.g. Duplicate Term 1 tuition payment"
                />
              </div>

              <Button type="submit" disabled={recordMutation.isPending} className="w-full bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/20">
                {recordMutation.isPending ? 'Logging Refund...' : 'Confirm and Log Refund'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tab Content: Refund History Log */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {!refunds || refunds.length === 0 ? (
            <EmptyState icon={CreditCard} title="No Refund Logs Found" description="Reimbursed payouts will appear here once logged." />
          ) : (
            <Card className="border-slate-800 bg-slate-900/40">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-800 hover:bg-transparent">
                      <TableHead className="text-slate-400">Date</TableHead>
                      <TableHead className="text-slate-400">Student</TableHead>
                      <TableHead className="text-slate-400">Method</TableHead>
                      <TableHead className="text-slate-400">Reference</TableHead>
                      <TableHead className="text-slate-400">Reason</TableHead>
                      <TableHead className="text-slate-400 text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {refunds.map((r) => (
                      <TableRow key={r.id} className="border-slate-800 hover:bg-slate-800/20">
                        <TableCell className="text-slate-400">{new Date(r.refundDate).toLocaleDateString()}</TableCell>
                        <TableCell className="font-semibold text-slate-200">
                          {r.student?.firstName} {r.student?.lastName}
                          <span className="block text-xs font-normal text-slate-500">Admn: {r.student?.admissionNumber}</span>
                        </TableCell>
                        <TableCell className="text-slate-400 font-semibold">{r.refundMethod}</TableCell>
                        <TableCell className="text-slate-400">{r.referenceNumber || '-'}</TableCell>
                        <TableCell className="text-slate-400">{r.reason}</TableCell>
                        <TableCell className="text-right text-rose-400 font-bold">{formatMoney(r.amountMinor)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
