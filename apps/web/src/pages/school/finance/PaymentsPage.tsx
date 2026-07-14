import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { feesApi } from '@/api/fees';
import { academicYearsApi } from '@/api/academicYears';
import { classesApi } from '@/api/classes';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { PageLoader } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { Plus, CreditCard, RotateCcw, Printer, FileText } from 'lucide-react';
import ReceiptModal from './components/ReceiptModal';

const paymentMethods = [
  { value: 'CASH', label: 'Cash' },
  { value: 'UPI', label: 'UPI Reference' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'CHEQUE', label: 'Cheque' },
  { value: 'CARD_OFFLINE', label: 'Card Offline' },
  { value: 'DEMAND_DRAFT', label: 'Demand Draft' },
  { value: 'OTHER', label: 'Other Offline' }
];

export default function PaymentsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = React.useState<'record' | 'history'>('record');
  const [selectedReceiptPaymentId, setSelectedReceiptPaymentId] = React.useState<string | null>(null);

  // Form states
  const [form, setForm] = React.useState({
    classId: '',
    studentId: '',
    amountMinor: 0,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'CASH' as any,
    referenceNumber: '',
    bankName: '',
    chequeNumber: '',
    chequeDate: '',
    notes: ''
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

  // Fetch students in class
  const { data: studentRoster } = useQuery({
    queryKey: ['rosterForPayments', form.classId],
    queryFn: () => feesApi.previewBulkAssignmentStudents(form.classId, null),
    enabled: !!form.classId
  });

  // Fetch payments history
  const { data: payments, isLoading: loadingPayments } = useQuery({
    queryKey: ['paymentsHistory', academicYearId],
    queryFn: () => feesApi.listPayments(academicYearId),
    enabled: !!academicYearId
  });

  // Mutations
  const recordMutation = useMutation({
    mutationFn: (data: any) => feesApi.recordPayment(academicYearId, data),
    onSuccess: (payment) => {
      queryClient.invalidateQueries({ queryKey: ['paymentsHistory', academicYearId] });
      toast.success('Payment recorded successfully!');
      // Reset form (keep classId)
      setForm({
        classId: form.classId,
        studentId: '',
        amountMinor: 0,
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'CASH',
        referenceNumber: '',
        bankName: '',
        chequeNumber: '',
        chequeDate: '',
        notes: ''
      });
      // Show receipt modal
      setSelectedReceiptPaymentId(payment.id);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to record payment');
    }
  });

  const reverseMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => feesApi.reversePayment(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentsHistory', academicYearId] });
      toast.success('Payment reversed successfully');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to reverse payment');
    }
  });

  const handleRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.studentId || form.amountMinor <= 0) {
      toast.error('Student and positive amount are required');
      return;
    }

    recordMutation.mutate({
      studentId: form.studentId,
      amountMinor: form.amountMinor,
      paymentDate: new Date(form.paymentDate),
      paymentMethod: form.paymentMethod,
      referenceNumber: form.referenceNumber || undefined,
      bankName: form.bankName || undefined,
      chequeNumber: form.chequeNumber || undefined,
      chequeDate: form.chequeDate ? new Date(form.chequeDate) : undefined,
      notes: form.notes || undefined
    });
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount / 100);
  };

  if (loadingPayments) return <PageLoader />;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Payments Desk</h1>
        <p className="text-slate-400 text-sm">Record offline fee collection, view logs, print receipts, and manage reversals.</p>
      </div>

      {/* Tab Selectors */}
      <div className="flex border-b border-slate-800 gap-6">
        <button
          onClick={() => setActiveTab('record')}
          className={`pb-3 text-sm font-semibold transition-colors ${activeTab === 'record' ? 'border-b-2 border-violet-500 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          Record Fee Collection
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 text-sm font-semibold transition-colors ${activeTab === 'history' ? 'border-b-2 border-violet-500 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          Collection Logs
        </button>
      </div>

      {/* Tab Content: Record Fee Collection */}
      {activeTab === 'record' && (
        <Card className="border-slate-800 bg-slate-900/40 max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-violet-400" />
              Collect Dues
            </CardTitle>
            <CardDescription className="text-slate-400">Log offline collections. Dues will automatically allocate to oldest open charges.</CardDescription>
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
                <Label className="text-slate-300">Amount Collected (INR)</Label>
                <Input
                  type="number"
                  value={form.amountMinor / 100}
                  onChange={(e) => setForm({ ...form, amountMinor: Math.round(Number(e.target.value) * 100) })}
                  className="bg-slate-950 border-slate-800 text-white mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">Payment Date</Label>
                  <Input
                    type="date"
                    value={form.paymentDate}
                    onChange={(e) => setForm({ ...form, paymentDate: e.target.value })}
                    className="bg-slate-950 border-slate-800 text-white mt-1"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Payment Method</Label>
                  <Select value={form.paymentMethod} onValueChange={(val: any) => setForm({ ...form, paymentMethod: val })}>
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

              {/* Reference fields */}
              {form.paymentMethod !== 'CASH' && (
                <div className="grid grid-cols-2 gap-4 bg-slate-950 p-4 rounded border border-slate-800">
                  <div className="col-span-2">
                    <Label className="text-slate-300">Reference Number (UPI Txn / Bank Ref)</Label>
                    <Input
                      value={form.referenceNumber}
                      onChange={(e) => setForm({ ...form, referenceNumber: e.target.value })}
                      className="bg-slate-900 border-slate-800 text-white mt-1"
                      placeholder="e.g. UTR12345678"
                    />
                  </div>
                  {form.paymentMethod === 'CHEQUE' && (
                    <>
                      <div>
                        <Label className="text-slate-300">Cheque Number</Label>
                        <Input
                          value={form.chequeNumber}
                          onChange={(e) => setForm({ ...form, chequeNumber: e.target.value })}
                          className="bg-slate-900 border-slate-800 text-white mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300">Cheque Date</Label>
                        <Input
                          type="date"
                          value={form.chequeDate}
                          onChange={(e) => setForm({ ...form, chequeDate: e.target.value })}
                          className="bg-slate-900 border-slate-800 text-white mt-1"
                        />
                      </div>
                    </>
                  )}
                  {['BANK_TRANSFER', 'CHEQUE', 'CARD_OFFLINE'].includes(form.paymentMethod) && (
                    <div className="col-span-2">
                      <Label className="text-slate-300">Bank Name / Merchant Name</Label>
                      <Input
                        value={form.bankName}
                        onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                        className="bg-slate-900 border-slate-800 text-white mt-1"
                      />
                    </div>
                  )}
                </div>
              )}

              <div>
                <Label className="text-slate-300">Notes / Remarks</Label>
                <Input
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="bg-slate-950 border-slate-800 text-white mt-1"
                  placeholder="Optional payment notes"
                />
              </div>

              <Button type="submit" disabled={recordMutation.isPending} className="w-full bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/20">
                {recordMutation.isPending ? 'Logging Payment...' : 'Confirm and Log Payment'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tab Content: Collection Logs */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {!payments || payments.length === 0 ? (
            <EmptyState icon={CreditCard} title="No Collection Logs Found" description="Log payments in the Record tab." />
          ) : (
            <Card className="border-slate-800 bg-slate-900/40">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-800 hover:bg-transparent">
                      <TableHead className="text-slate-400">Date</TableHead>
                      <TableHead className="text-slate-400">Student</TableHead>
                      <TableHead className="text-slate-400">Method</TableHead>
                      <TableHead className="text-slate-400">Ref / Cheque</TableHead>
                      <TableHead className="text-slate-400">Status</TableHead>
                      <TableHead className="text-slate-400 text-right">Amount</TableHead>
                      <TableHead className="text-slate-400 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((p) => (
                      <TableRow key={p.id} className="border-slate-800 hover:bg-slate-800/20">
                        <TableCell className="text-slate-400">{new Date(p.paymentDate).toLocaleDateString()}</TableCell>
                        <TableCell className="font-semibold text-slate-200">
                          {p.student?.firstName} {p.student?.lastName}
                          <span className="block text-xs font-normal text-slate-500">Admn: {p.student?.admissionNumber}</span>
                        </TableCell>
                        <TableCell className="text-slate-400 font-semibold">{p.paymentMethod}</TableCell>
                        <TableCell className="text-slate-400">
                          {p.referenceNumber || p.chequeNumber || '-'}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            p.status === 'CONFIRMED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                          }`}>
                            {p.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-white font-bold">{formatMoney(p.amountMinor)}</TableCell>
                        <TableCell className="text-right space-x-1.5">
                          <Button size="sm" variant="ghost" onClick={() => setSelectedReceiptPaymentId(p.id)} className="text-slate-400 hover:text-white hover:bg-slate-800">
                            <Printer className="w-4 h-4 mr-1" /> Receipt
                          </Button>
                          {p.status === 'CONFIRMED' && (
                            <ConfirmDialog
                              trigger={
                                <Button size="sm" variant="ghost" className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/20">
                                  <RotateCcw className="w-4 h-4 mr-1" /> Reverse
                                </Button>
                              }
                              title="Reverse Payment Collection"
                              description="Are you sure you want to reverse this payment? This voids the receipt and returns allocated charges back to open status."
                              onConfirm={() => reverseMutation.mutate({ id: p.id, reason: 'Manual desk reversal' })}
                            />
                          )}
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

      {selectedReceiptPaymentId && (
        <ReceiptModal
          isOpen={!!selectedReceiptPaymentId}
          onClose={() => setSelectedReceiptPaymentId(null)}
          paymentId={selectedReceiptPaymentId}
        />
      )}
    </div>
  );
}
