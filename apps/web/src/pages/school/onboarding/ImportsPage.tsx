import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { importsApi } from '@/api/imports';
import { Button } from '@/components/ui/button';
import { PageLoader } from '@/components/LoadingSpinner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileUp, Calendar, AlertCircle, CheckCircle, Clock, ArrowRight, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function ImportsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const [fileContent, setFileContent] = React.useState('');
  const [fileName, setFileName] = React.useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['importJobs'],
    queryFn: () => importsApi.listJobs({ page: 1, limit: 10 })
  });

  const uploadMutation = useMutation({
    mutationFn: (payload: { fileName: string; content: string }) =>
      importsApi.uploadCSV(payload.fileName, payload.content),
    onSuccess: (job) => {
      toast.success('File uploaded and staged successfully!');
      setOpen(false);
      setFileContent('');
      setFileName('');
      queryClient.invalidateQueries({ queryKey: ['importJobs'] });
      // Redirect directly to details to run validation
      navigate(`/school/onboarding/imports/${job.id}`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to upload CSV file');
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFileContent(event.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName || !fileContent) {
      return toast.error('Please select a valid CSV template file first');
    }
    uploadMutation.mutate({ fileName, content: fileContent });
  };

  const downloadTemplate = () => {
    const csvContent = "admissionNumber,firstName,middleName,lastName,dateOfBirth,gender,admissionDate,academicYear,class,section,rollNumber,studentEmail,studentPhone,guardianFirstName,guardianLastName,guardianRelationship,guardianPhone,guardianEmail,addressLine1,addressLine2,city,state,country,postalCode\nADM-1001,Arjun,,Kumar,2010-05-15,MALE,2026-06-01,2026-27 A,Grade 10 A,Sec A,15,arjun@mail.local,9999999999,Ravi,Kumar,FATHER,8888888888,ravi@mail.local,123 Street,,City A,State A,India,110001";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "student_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bulk Student Imports</h1>
          <p className="text-sm text-muted-foreground">Upload and process student directory sheets dynamically.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={downloadTemplate} className="gap-2 border-slate-800 bg-slate-900/40">
            <Download className="h-4 w-4" /> Download Template
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground gap-2">
                <FileUp className="h-4 w-4" /> New Bulk Import
              </Button>
            </DialogTrigger>
            <DialogContent className="border-slate-800 bg-slate-900 text-slate-100 max-w-md">
              <DialogHeader>
                <DialogTitle>Upload Student CSV Sheet</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUploadSubmit} className="mt-4 space-y-5">
                <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950 p-8 text-center">
                  <FileUp className="mx-auto h-12 w-12 text-slate-500" />
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                    id="csv-file-input"
                  />
                  <label htmlFor="csv-file-input" className="mt-4 block cursor-pointer text-sm font-semibold text-indigo-400 hover:text-indigo-300">
                    {fileName ? fileName : 'Choose CSV sheet...'}
                  </label>
                  <p className="mt-2 text-xs text-slate-500">Only standard comma-separated .csv sheets supported (max 10MB)</p>
                </div>
                <Button type="submit" disabled={uploadMutation.isPending} className="w-full bg-primary text-primary-foreground py-6 text-md font-semibold">
                  {uploadMutation.isPending ? 'Uploading...' : 'Stage and Upload Sheet'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/10 backdrop-blur-md">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-800 hover:bg-transparent">
              <TableHead>File Name</TableHead>
              <TableHead>Staged Date</TableHead>
              <TableHead>Rows</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Outcome</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.jobs && data.jobs.length > 0 ? (
              data.jobs.map((job) => (
                <TableRow key={job.id} className="border-slate-800 hover:bg-slate-900/20">
                  <TableCell className="font-semibold text-slate-200">{job.fileName}</TableCell>
                  <TableCell className="text-sm text-slate-400">
                    <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {new Date(job.createdAt).toLocaleDateString()}</span>
                  </TableCell>
                  <TableCell className="text-slate-300">{job.totalRows} rows</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                      job.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      job.status === 'COMPLETED_WITH_ERRORS' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      job.status === 'READY' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                      job.status === 'IMPORTING' || job.status === 'VALIDATING' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                      'bg-slate-500/10 text-slate-400 border-slate-500/20'
                    }`}>
                      {job.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-slate-400 space-y-0.5">
                    {job.status === 'COMPLETED' || job.status === 'COMPLETED_WITH_ERRORS' ? (
                      <>
                        <p className="text-emerald-400/90 font-medium">✓ Imported: {job.importedRows}</p>
                        {job.failedRows > 0 && <p className="text-destructive font-medium">✗ Failed: {job.failedRows}</p>}
                      </>
                    ) : (
                      <p>Staged validation stats pending</p>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button onClick={() => navigate(`/school/onboarding/imports/${job.id}`)} variant="ghost" size="sm" className="hover:bg-slate-800/80 gap-1.5">
                      View Details <ArrowRight className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  <AlertCircle className="mx-auto h-8 w-8 text-slate-500 mb-3" />
                  No bulk imports have been run yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
