import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { onboardingApi } from '@/api/onboarding';
import { feesApi } from '@/api/fees';
import { PageLoader } from '@/components/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'react-router-dom';
import { GraduationCap, ArrowLeft, Printer } from 'lucide-react';
import ReceiptModal from '../school/finance/components/ReceiptModal';

export default function GuardianChildFeesPage() {
  const [selectedChildId, setSelectedChildId] = React.useState('');
  const [selectedReceiptPaymentId, setSelectedReceiptPaymentId] = React.useState<string | null>(null);

  const { data: children, isLoading: loadingChildren } = useQuery({
    queryKey: ['parentChildren'],
    queryFn: onboardingApi.getLinkedChildren
  });

  // Set default selected child when data is ready
  React.useEffect(() => {
    if (children && children.length > 0 && !selectedChildId) {
      setSelectedChildId(children[0].student.id);
    }
  }, [children, selectedChildId]);

  const selectedChildObj = children?.find((c: any) => c.student.id === selectedChildId);
  const currentEnrollment = selectedChildObj?.student?.enrollments?.find((e: any) => e.isCurrent);
  const academicYearId = currentEnrollment?.academicYearId || '';

  const { data: account, isLoading: loadingAccount } = useQuery({
    queryKey: ['studentFeeAccount', selectedChildId, academicYearId],
    queryFn: () => feesApi.getStudentFeeAccount(selectedChildId, academicYearId),
    enabled: !!selectedChildId && !!academicYearId
  });

  const { data: ledger, isLoading: loadingLedger } = useQuery({
    queryKey: ['studentFeeLedger', selectedChildId, academicYearId],
    queryFn: () => feesApi.getStudentLedger(selectedChildId, academicYearId),
    enabled: !!selectedChildId && !!academicYearId
  });

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount / 100);
  };

  if (loadingChildren) return <PageLoader />;

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-100 md:p-12">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-4">
            <Link to="/guardian">
              <Button variant="ghost" className="text-slate-400 hover:text-white hover:bg-slate-800">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-200 via-slate-100 to-indigo-100 bg-clip-text text-transparent">
                Child Fees & Statements
              </h1>
              <p className="text-sm text-slate-400">View and track billing statements and payment histories for linked children.</p>
            </div>
          </div>

          {/* Child Switcher */}
          {children && children.length > 0 && (
            <div className="w-64">
              <Label className="text-slate-400 text-xs font-semibold uppercase">Switch Child Context</Label>
              <Select value={selectedChildId} onValueChange={setSelectedChildId}>
                <SelectTrigger className="bg-slate-900 border-slate-800 text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-white">
                  {children.map((c: any) => (
                    <SelectItem key={c.student.id} value={c.student.id}>
                      {c.student.firstName} {c.student.lastName} ({c.student.admissionNumber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {loadingAccount || loadingLedger ? (
          <PageLoader />
        ) : selectedChildId ? (
          <div className="space-y-6">
            {account ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-900/40 p-4 rounded-lg border border-slate-800 text-center">
                  <div className="text-xs text-slate-400 font-semibold uppercase">Total Fee Charged</div>
                  <div className="text-xl font-bold text-white mt-1">{formatMoney(account.totalCharges)}</div>
                </div>
                <div className="bg-slate-900/40 p-4 rounded-lg border border-slate-800 text-center">
                  <div className="text-xs text-slate-400 font-semibold uppercase">Scholarships & Waivers</div>
                  <div className="text-xl font-bold text-amber-400 mt-1">{formatMoney(account.totalConcessions)}</div>
                </div>
                <div className="bg-slate-900/40 p-4 rounded-lg border border-slate-800 text-center">
                  <div className="text-xs text-slate-400 font-semibold uppercase">Paid Amount</div>
                  <div className="text-xl font-bold text-emerald-400 mt-1">{formatMoney(account.totalPaid)}</div>
                </div>
                <div className="bg-slate-900/40 p-4 rounded-lg border border-slate-800 text-center">
                  <div className="text-xs text-slate-400 font-semibold uppercase">Outstanding Balance</div>
                  <div className="text-xl font-bold text-rose-400 mt-1">{formatMoney(account.outstandingBalance)}</div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/40 p-6 rounded-lg text-center text-slate-400 border border-slate-800">
                No active fee assignments mapped to selected child.
              </div>
            )}

            {/* Ledger logs */}
            {ledger && ledger.length > 0 && (
              <Card className="border-slate-800 bg-slate-900/40 mt-6">
                <CardHeader>
                  <CardTitle className="text-white">Fee Statement Timeline</CardTitle>
                  <CardDescription className="text-slate-400">Detailed list of debits, collections, and waivers applied.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-800 hover:bg-transparent">
                        <TableHead className="text-slate-400">Date</TableHead>
                        <TableHead className="text-slate-400">Description</TableHead>
                        <TableHead className="text-slate-400 text-right">Debit (+)</TableHead>
                        <TableHead className="text-slate-400 text-right">Credit (-)</TableHead>
                        <TableHead className="text-slate-400 text-right">Balance</TableHead>
                        <TableHead className="text-slate-400 text-right">Receipt</TableHead>
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
                          <TableCell className="text-right">
                            {item.type === 'CREDIT' && item.refId && (
                              <Button size="sm" variant="ghost" onClick={() => setSelectedReceiptPaymentId(item.refId)} className="text-slate-400 hover:text-white">
                                <Printer className="w-4 h-4" />
                              </Button>
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
        ) : (
          <div className="bg-slate-900/40 p-6 rounded-lg text-center text-slate-400 border border-slate-800">
            No children profiles currently linked to this guardian registration.
          </div>
        )}
      </div>

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
