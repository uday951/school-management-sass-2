import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { importsApi } from '@/api/imports';
import { Button } from '@/components/ui/button';
import { PageLoader } from '@/components/LoadingSpinner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle, CheckCircle2, Play, RefreshCw, AlertTriangle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function ImportDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filter, setFilter] = React.useState<string>('');
  const [page, setPage] = React.useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['importJobDetails', id, filter, page],
    queryFn: () => importsApi.getJobDetails(id!, {
      validationStatus: filter || undefined,
      page,
      limit: 10
    }),
    enabled: !!id
  });

  const validateMutation = useMutation({
    mutationFn: () => importsApi.validateJob(id!),
    onSuccess: () => {
      toast.success('Validation completed successfully!');
      queryClient.invalidateQueries({ queryKey: ['importJobDetails', id] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Validation failed');
    }
  });

  const executeMutation = useMutation({
    mutationFn: (strategy: 'SKIP' | 'ERROR') => importsApi.executeImport(id!, strategy),
    onSuccess: (updated) => {
      toast.success(`Import complete! Successfully imported ${updated.importedRows} students.`);
      queryClient.invalidateQueries({ queryKey: ['importJobDetails', id] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Execution failed');
    }
  });

  if (isLoading) return <PageLoader />;
  if (!data) return <div className="p-6 text-center text-destructive">Import job details could not be resolved.</div>;

  const { job, rows, totalRows } = data;
  const totalPages = Math.ceil(totalRows / 10);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <header className="flex flex-col gap-4 border-b border-slate-800 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button onClick={() => navigate('/school/onboarding/imports')} variant="ghost" size="icon" className="hover:bg-slate-800/80">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">{job.fileName}</h1>
            <p className="text-xs text-slate-400 mt-1">Status: <span className="font-semibold text-indigo-400">{job.status}</span> &bull; Created by: {job.createdBy.firstName} {job.createdBy.lastName}</p>
          </div>
        </div>

        <div className="flex gap-2">
          {job.status === 'UPLOADED' && (
            <Button onClick={() => validateMutation.mutate()} disabled={validateMutation.isPending} className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2">
              <RefreshCw className={`h-4 w-4 ${validateMutation.isPending ? 'animate-spin' : ''}`} /> Run Row-Level Validation
            </Button>
          )}

          {job.status === 'READY' && job.validRows > 0 && (
            <>
              <Button onClick={() => executeMutation.mutate('SKIP')} disabled={executeMutation.isPending} className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2">
                <Play className="h-4 w-4" /> Import Staged Rows (Skip Duplicates)
              </Button>
              <Button onClick={() => executeMutation.mutate('ERROR')} disabled={executeMutation.isPending} variant="outline" className="border-destructive text-destructive hover:bg-destructive/10 gap-2">
                <Play className="h-4 w-4" /> Import (Fail on Duplicates)
              </Button>
            </>
          )}
        </div>
      </header>

      {/* Metrics Banner */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl bg-slate-900/40 border border-slate-800 p-5 backdrop-blur-md">
          <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Total Rows</p>
          <p className="text-3xl font-black text-slate-100 mt-2">{job.totalRows}</p>
        </div>
        <div className="rounded-xl bg-slate-900/40 border border-slate-800 p-5 backdrop-blur-md">
          <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Valid Rows</p>
          <p className="text-3xl font-black text-emerald-400 mt-2">{job.validRows}</p>
        </div>
        <div className="rounded-xl bg-slate-900/40 border border-slate-800 p-5 backdrop-blur-md">
          <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Invalid Rows</p>
          <p className="text-3xl font-black text-destructive mt-2">{job.invalidRows}</p>
        </div>
        <div className="rounded-xl bg-slate-900/40 border border-slate-800 p-5 backdrop-blur-md">
          <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Imported Success</p>
          <p className="text-3xl font-black text-indigo-400 mt-2">{job.importedRows}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 border-b border-slate-800 pb-3">
        <Button onClick={() => { setFilter(''); setPage(1); }} variant={filter === '' ? 'default' : 'ghost'} size="sm" className="rounded-lg text-xs font-semibold">
          All Rows ({job.totalRows})
        </Button>
        <Button onClick={() => { setFilter('VALID'); setPage(1); }} variant={filter === 'VALID' ? 'default' : 'ghost'} size="sm" className="rounded-lg text-xs font-semibold text-emerald-400 hover:text-emerald-300">
          Valid ({job.validRows})
        </Button>
        <Button onClick={() => { setFilter('INVALID'); setPage(1); }} variant={filter === 'INVALID' ? 'default' : 'ghost'} size="sm" className="rounded-lg text-xs font-semibold text-destructive hover:text-destructive-prev">
          Invalid ({job.invalidRows})
        </Button>
      </div>

      {/* Rows Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/10 backdrop-blur-md">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-800 hover:bg-transparent">
              <TableHead className="w-16">Row</TableHead>
              <TableHead>Admission No</TableHead>
              <TableHead>Student Name</TableHead>
              <TableHead>Placement (Standard & Sec)</TableHead>
              <TableHead>Validation Status</TableHead>
              <TableHead>Errors / Warnings</TableHead>
              <TableHead className="text-right">Import Result</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <TableRow key={row.id} className="border-slate-800 hover:bg-slate-900/15">
                  <TableCell className="font-mono text-slate-400 text-xs">#{row.rowNumber}</TableCell>
                  <TableCell className="font-semibold text-slate-300">{row.rawData.admissionNumber || 'N/A'}</TableCell>
                  <TableCell className="text-slate-200">{row.rawData.firstName} {row.rawData.lastName}</TableCell>
                  <TableCell className="text-slate-300 text-sm">{row.rawData.class} &bull; {row.rawData.section}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold border ${
                      row.validationStatus === 'VALID' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      'bg-destructive/10 text-destructive border-destructive/20'
                    }`}>
                      {row.validationStatus}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-xs text-xs text-slate-400 leading-relaxed">
                    {row.errors && row.errors.length > 0 && (
                      <div className="space-y-1 text-destructive">
                        {row.errors.map((e, idx) => <p key={idx} className="flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {e}</p>)}
                      </div>
                    )}
                    {(!row.errors || row.errors.length === 0) && (
                      <p className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Row OK</p>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold border ${
                      row.importStatus === 'IMPORTED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      row.importStatus === 'FAILED' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                      'bg-slate-500/10 text-slate-400 border-slate-500/20'
                    }`}>
                      {row.importStatus}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                  No staged rows found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <footer className="flex items-center justify-between border-t border-slate-800 p-4">
            <span className="text-xs text-slate-400">Page {page} of {totalPages} &bull; Total Rows: {totalRows}</span>
            <div className="flex gap-2">
              <Button disabled={page === 1} onClick={() => setPage(page - 1)} variant="outline" size="sm" className="border-slate-800 bg-slate-950 text-slate-300">
                Prev
              </Button>
              <Button disabled={page === totalPages} onClick={() => setPage(page + 1)} variant="outline" size="sm" className="border-slate-800 bg-slate-950 text-slate-300">
                Next
              </Button>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}
