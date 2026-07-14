import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { feesApi } from '@/api/fees';
import { academicYearsApi } from '@/api/academicYears';
import { classesApi } from '@/api/classes';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageLoader } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { toast } from 'sonner';
import { Download, Search, FileSpreadsheet, Calendar, UserX, BarChart3 } from 'lucide-react';

export default function ReportsPage() {
  const [activeReport, setActiveReport] = React.useState<'daily' | 'outstanding' | 'classwise'>('daily');
  const [dailyDate, setDailyDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = React.useState('');

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

  // Daily Collection Query
  const { data: dailyReport, isLoading: loadingDaily } = useQuery({
    queryKey: ['dailyCollectionReport', dailyDate],
    queryFn: () => feesApi.getDailyCollectionReport(dailyDate),
    enabled: activeReport === 'daily' && !!dailyDate
  });

  // Defaulters Outstanding Query
  const { data: outstandingReport, isLoading: loadingOutstanding } = useQuery({
    queryKey: ['outstandingReport', academicYearId],
    queryFn: () => feesApi.getOutstandingReport(academicYearId),
    enabled: activeReport === 'outstanding' && !!academicYearId
  });

  // Classwise Query: we reuse outstanding and mapping, or query specifically.
  // Wait, let's fetch outstandingReport and filter by class if class is selected, or calculate classwise details.
  // For class-wise report: let's resolve roster and map account overview per student
  const { data: studentRoster } = useQuery({
    queryKey: ['rosterForClasswiseReport', selectedClass],
    queryFn: () => feesApi.previewBulkAssignmentStudents(selectedClass, null),
    enabled: activeReport === 'classwise' && !!selectedClass
  });

  const [classwiseReportData, setClasswiseReportData] = React.useState<any[]>([]);
  const [loadingClasswise, setLoadingClasswise] = React.useState(false);

  React.useEffect(() => {
    async function fetchClasswiseDetails() {
      if (!selectedClass || !studentRoster || studentRoster.length === 0 || !academicYearId) return;
      setLoadingClasswise(true);
      try {
        const resolved: any[] = [];
        for (const s of studentRoster) {
          const acc = await feesApi.getStudentFeeAccount(s.studentId, academicYearId);
          resolved.push({
            admissionNumber: s.admissionNumber,
            studentName: `${s.firstName} ${s.lastName}`,
            totalDue: acc.totalCharges,
            paid: acc.totalPaid,
            concession: acc.totalConcessions,
            outstanding: acc.outstandingBalance
          });
        }
        setClasswiseReportData(resolved);
      } catch (err) {
        toast.error('Failed to fetch classwise fee summaries');
      } finally {
        setLoadingClasswise(false);
      }
    }
    if (activeReport === 'classwise') {
      fetchClasswiseDetails();
    }
  }, [selectedClass, studentRoster, activeReport, academicYearId]);

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount / 100);
  };

  // CSV Export utility with simple escaping against CSV formula injection
  const exportToCSV = (headers: string[], rows: any[][], fileName: string) => {
    const escapeCSV = (val: any) => {
      let str = String(val === null || val === undefined ? '' : val);
      if (str.startsWith('=') || str.startsWith('+') || str.startsWith('-') || str.startsWith('@')) {
        str = `'${str}`; // Prefix with single quote to prevent execution
      }
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        str = `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csvContent = [
      headers.map(escapeCSV).join(','),
      ...rows.map(row => row.map(escapeCSV).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportDaily = () => {
    if (!dailyReport || dailyReport.length === 0) return;
    const headers = ['Receipt Number', 'Student Name', 'Admission No', 'Payment Method', 'Reference', 'Amount (INR)'];
    const rows = dailyReport.map(r => [
      r.receiptNumber,
      r.studentName,
      r.admissionNumber,
      r.method,
      r.reference,
      (r.amount / 100).toFixed(2)
    ]);
    exportToCSV(headers, rows, `daily_collection_${dailyDate}`);
  };

  const handleExportOutstanding = () => {
    if (!outstandingReport || outstandingReport.length === 0) return;
    const headers = ['Admission No', 'Student Name', 'Total Due (INR)', 'Paid (INR)', 'Outstanding (INR)'];
    const rows = outstandingReport.map(r => [
      r.admissionNumber,
      r.studentName,
      (r.totalDue / 100).toFixed(2),
      (r.paid / 100).toFixed(2),
      (r.outstanding / 100).toFixed(2)
    ]);
    exportToCSV(headers, rows, `defaulters_outstanding_list`);
  };

  const handleExportClasswise = () => {
    if (classwiseReportData.length === 0) return;
    const headers = ['Admission No', 'Student Name', 'Total Due (INR)', 'Concessions (INR)', 'Paid (INR)', 'Outstanding (INR)'];
    const rows = classwiseReportData.map(r => [
      r.admissionNumber,
      r.studentName,
      (r.totalDue / 100).toFixed(2),
      (r.concession / 100).toFixed(2),
      (r.paid / 100).toFixed(2),
      (r.outstanding / 100).toFixed(2)
    ]);
    exportToCSV(headers, rows, `class_fee_report_${selectedClass}`);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Finance Reports</h1>
          <p className="text-slate-400 text-sm">Download fee metrics, defaulter sheets, and class collection registers.</p>
        </div>
      </div>

      {/* Tab Selectors */}
      <div className="flex border-b border-slate-800 gap-6">
        <button
          onClick={() => setActiveReport('daily')}
          className={`pb-3 text-sm font-semibold transition-colors ${activeReport === 'daily' ? 'border-b-2 border-violet-500 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          Daily Collection Report
        </button>
        <button
          onClick={() => setActiveReport('outstanding')}
          className={`pb-3 text-sm font-semibold transition-colors ${activeReport === 'outstanding' ? 'border-b-2 border-violet-500 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          Outstanding Defaulters List
        </button>
        <button
          onClick={() => setActiveReport('classwise')}
          className={`pb-3 text-sm font-semibold transition-colors ${activeReport === 'classwise' ? 'border-b-2 border-violet-500 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          Class Collection Register
        </button>
      </div>

      {/* Daily Report tab */}
      {activeReport === 'daily' && (
        <div className="space-y-4">
          <Card className="border-slate-800 bg-slate-900/40">
            <CardContent className="pt-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="w-64">
                <Label className="text-slate-300">Choose Collection Date</Label>
                <Input
                  type="date"
                  value={dailyDate}
                  onChange={(e) => setDailyDate(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-white mt-1"
                />
              </div>
              {dailyReport && dailyReport.length > 0 && (
                <Button onClick={handleExportDaily} className="bg-emerald-600 hover:bg-emerald-500 text-white shadow">
                  <FileSpreadsheet className="w-4 h-4 mr-2" /> Export CSV
                </Button>
              )}
            </CardContent>
          </Card>

          {loadingDaily ? <PageLoader /> : !dailyReport || dailyReport.length === 0 ? (
            <EmptyState icon={Calendar} title="No Payments Found" description="There are no payments recorded on this date." />
          ) : (
            <Card className="border-slate-800 bg-slate-900/40">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-800 hover:bg-transparent">
                      <TableHead className="text-slate-400">Receipt No</TableHead>
                      <TableHead className="text-slate-400">Student</TableHead>
                      <TableHead className="text-slate-400">Admn No</TableHead>
                      <TableHead className="text-slate-400">Method</TableHead>
                      <TableHead className="text-slate-400">Reference</TableHead>
                      <TableHead className="text-slate-400 text-right">Amount Paid</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dailyReport.map((r, i) => (
                      <TableRow key={i} className="border-slate-800 hover:bg-slate-800/20">
                        <TableCell className="font-semibold text-slate-200">{r.receiptNumber}</TableCell>
                        <TableCell className="text-slate-300">{r.studentName}</TableCell>
                        <TableCell className="text-slate-400">{r.admissionNumber}</TableCell>
                        <TableCell className="text-slate-400">{r.method}</TableCell>
                        <TableCell className="text-slate-400">{r.reference}</TableCell>
                        <TableCell className="text-right text-emerald-400 font-bold">{formatMoney(r.amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Outstanding tab */}
      {activeReport === 'outstanding' && (
        <div className="space-y-4">
          <Card className="border-slate-800 bg-slate-900/40">
            <CardContent className="pt-6 flex justify-between items-center">
              <span className="text-sm text-slate-400">Lists students with non-zero outstanding fee balances for the current term.</span>
              {outstandingReport && outstandingReport.length > 0 && (
                <Button onClick={handleExportOutstanding} className="bg-emerald-600 hover:bg-emerald-500 text-white shadow">
                  <FileSpreadsheet className="w-4 h-4 mr-2" /> Export CSV
                </Button>
              )}
            </CardContent>
          </Card>

          {loadingOutstanding ? <PageLoader /> : !outstandingReport || outstandingReport.length === 0 ? (
            <EmptyState icon={UserX} title="No Defaulters Found" description="Amazing! All students have completed mapping payments." />
          ) : (
            <Card className="border-slate-800 bg-slate-900/40">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-800 hover:bg-transparent">
                      <TableHead className="text-slate-400">Admission No</TableHead>
                      <TableHead className="text-slate-400">Student</TableHead>
                      <TableHead className="text-slate-400 text-right">Total Due</TableHead>
                      <TableHead className="text-slate-400 text-right">Paid Amount</TableHead>
                      <TableHead className="text-slate-400 text-right">Pending Outstanding</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {outstandingReport.map((r, i) => (
                      <TableRow key={i} className="border-slate-800 hover:bg-slate-800/20">
                        <TableCell className="text-slate-400 font-semibold">{r.admissionNumber}</TableCell>
                        <TableCell className="font-medium text-slate-200">{r.studentName}</TableCell>
                        <TableCell className="text-right text-slate-300">{formatMoney(r.totalDue)}</TableCell>
                        <TableCell className="text-right text-emerald-400">{formatMoney(r.paid)}</TableCell>
                        <TableCell className="text-right text-rose-400 font-bold">{formatMoney(r.outstanding)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Classwise tab */}
      {activeReport === 'classwise' && (
        <div className="space-y-4">
          <Card className="border-slate-800 bg-slate-900/40">
            <CardContent className="pt-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="w-64">
                <Label className="text-slate-300">Choose Class</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="bg-slate-950 border-slate-800 text-white mt-1">
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-white">
                    {classes?.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {classwiseReportData.length > 0 && (
                <Button onClick={handleExportClasswise} className="bg-emerald-600 hover:bg-emerald-500 text-white shadow">
                  <FileSpreadsheet className="w-4 h-4 mr-2" /> Export CSV
                </Button>
              )}
            </CardContent>
          </Card>

          {loadingClasswise ? <PageLoader /> : !selectedClass ? (
            <EmptyState icon={Search} title="Select Target Class" description="Please choose a targeted classroom to resolve the fee register table." />
          ) : classwiseReportData.length === 0 ? (
            <EmptyState icon={UserX} title="No Student Records" description="No active enrollments mapping target structures in this class." />
          ) : (
            <Card className="border-slate-800 bg-slate-900/40">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-800 hover:bg-transparent">
                      <TableHead className="text-slate-400">Admission No</TableHead>
                      <TableHead className="text-slate-400">Student</TableHead>
                      <TableHead className="text-slate-400 text-right">Total Due</TableHead>
                      <TableHead className="text-slate-400 text-right">Concessions</TableHead>
                      <TableHead className="text-slate-400 text-right">Paid Amount</TableHead>
                      <TableHead className="text-slate-400 text-right">Outstanding Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classwiseReportData.map((r, i) => (
                      <TableRow key={i} className="border-slate-800 hover:bg-slate-800/20">
                        <TableCell className="text-slate-400 font-semibold">{r.admissionNumber}</TableCell>
                        <TableCell className="font-medium text-slate-200">{r.studentName}</TableCell>
                        <TableCell className="text-right text-slate-300">{formatMoney(r.totalDue)}</TableCell>
                        <TableCell className="text-right text-amber-400">{formatMoney(r.concession)}</TableCell>
                        <TableCell className="text-right text-emerald-400">{formatMoney(r.paid)}</TableCell>
                        <TableCell className="text-right text-rose-400 font-bold">{formatMoney(r.outstanding)}</TableCell>
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
