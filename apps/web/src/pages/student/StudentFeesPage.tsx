import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { onboardingApi } from '@/api/onboarding';
import { feesApi } from '@/api/fees';
import { PageLoader } from '@/components/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { GraduationCap, ArrowLeft, Printer, AlertTriangle, FileText } from 'lucide-react';
import ReceiptModal from '../school/finance/components/ReceiptModal';

export default function StudentFeesPage() {
  const [selectedReceiptPaymentId, setSelectedReceiptPaymentId] = React.useState<string | null>(null);

  const { data: student, isLoading: loadingStudent } = useQuery({
    queryKey: ['studentSummary'],
    queryFn: onboardingApi.getStudentSummary
  });

  const studentId = student?.id || '';
  const currentEnrollment = student?.enrollments?.find((e: any) => e.isCurrent);
  const academicYearId = currentEnrollment?.academicYearId || '';

  const { data: account, isLoading: loadingAccount } = useQuery({
    queryKey: ['studentFeeAccount', studentId, academicYearId],
    queryFn: () => feesApi.getStudentFeeAccount(studentId, academicYearId),
    enabled: !!studentId && !!academicYearId
  });

  const { data: ledger, isLoading: loadingLedger } = useQuery({
    queryKey: ['studentFeeLedger', studentId, academicYearId],
    queryFn: () => feesApi.getStudentLedger(studentId, academicYearId),
    enabled: !!studentId && !!academicYearId
  });

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount / 100);
  };

  if (loadingStudent || loadingAccount || loadingLedger) return <PageLoader />;

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-100 md:p-12">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
          <Link to="/student">
            <Button variant="ghost" className="text-slate-400 hover:text-white hover:bg-slate-800">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-200 via-slate-100 to-indigo-100 bg-clip-text text-transparent">
              My Fees & Financial Ledger
            </h1>
            <p className="text-sm text-slate-400">Manage, view details, and track your dues payment history.</p>
          </div>
        </div>

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
            No active fee assignments mapped to your student profile.
          </div>
        )}

        {/* Ledger logs */}
        {ledger && ledger.length > 0 && (
          <Card className="border-slate-800 bg-slate-900/40 mt-6">
            <CardHeader>
              <CardTitle className="text-white">Chronological Fee Statement</CardTitle>
              <CardDescription className="text-slate-400">Statement of debits, credits, and waivers on your account.</CardDescription>
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
