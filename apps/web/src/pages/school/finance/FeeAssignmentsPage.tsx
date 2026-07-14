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
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { PageLoader } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { toast } from 'sonner';
import { Plus, UserCheck, Layers, ClipboardList } from 'lucide-react';

export default function FeeAssignmentsPage() {
  const queryClient = useQueryClient();
  const [selectedClass, setSelectedClass] = React.useState('');
  const [selectedSection, setSelectedSection] = React.useState('all');
  const [selectedStructure, setSelectedStructure] = React.useState('');

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

  const { data: structures } = useQuery({
    queryKey: ['feeStructures', academicYearId],
    queryFn: () => feesApi.listStructures(academicYearId),
    enabled: !!academicYearId
  });

  const { data: assignments, isLoading: loadingAssignments } = useQuery({
    queryKey: ['feeAssignments', academicYearId],
    queryFn: () => feesApi.listAssignments(academicYearId),
    enabled: !!academicYearId
  });

  // Fetch preview students based on class selection
  const { data: previewStudents, isLoading: loadingPreview } = useQuery({
    queryKey: ['bulkAssignPreview', selectedClass, selectedSection],
    queryFn: () => feesApi.previewBulkAssignmentStudents(selectedClass, selectedSection === 'all' ? null : selectedSection),
    enabled: !!selectedClass
  });

  const assignMutation = useMutation({
    mutationFn: (studentIds: string[]) => feesApi.assignBulk({
      academicYearId,
      feeStructureId: selectedStructure,
      studentIds
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeAssignments', academicYearId] });
      toast.success('Fee structure assigned successfully to targeted students');
      setSelectedStructure('');
      setSelectedClass('');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to complete assignments');
    }
  });

  const handleBulkAssign = () => {
    if (!selectedStructure || !previewStudents || previewStudents.length === 0) {
      toast.error('Please configure structure and verify targeted students preview');
      return;
    }
    const studentIds = previewStudents.map(s => s.studentId);
    assignMutation.mutate(studentIds);
  };

  const matchedClass = classes?.find(c => c.id === selectedClass);
  const activeStructures = structures?.filter(s => s.status === 'ACTIVE') || [];

  if (loadingAssignments) return <PageLoader />;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Fee Assignments</h1>
        <p className="text-slate-400 text-sm">Assign created structures and schedule charges across classes, sections or individual students.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bulk Assignment Panel */}
        <Card className="border-slate-800 bg-slate-900/40">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-violet-400" />
              Bulk Assignment Config
            </CardTitle>
            <CardDescription className="text-slate-400">Map fee structures to targeted classrooms.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-slate-300">Target Class</Label>
              <Select
                value={selectedClass}
                onValueChange={(val) => { setSelectedClass(val); setSelectedSection('all'); }}
              >
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

            {selectedClass && (
              <div>
                <Label className="text-slate-300">Target Section</Label>
                <Select
                  value={selectedSection}
                  onValueChange={setSelectedSection}
                >
                  <SelectTrigger className="bg-slate-950 border-slate-800 text-white mt-1">
                    <SelectValue placeholder="All Sections" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-white">
                    <SelectItem value="all">All Sections</SelectItem>
                    {matchedClass?.sections?.map((s: any) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label className="text-slate-300">Fee Structure</Label>
              <Select
                value={selectedStructure}
                onValueChange={setSelectedStructure}
              >
                <SelectTrigger className="bg-slate-950 border-slate-800 text-white mt-1">
                  <SelectValue placeholder="Select Active Structure" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-white">
                  {activeStructures.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedClass && selectedStructure && previewStudents && previewStudents.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="text-xs font-semibold text-slate-400">Previewing target roster ({previewStudents.length} students):</div>
                <div className="bg-slate-950 p-3 rounded border border-slate-800 max-h-40 overflow-y-auto space-y-1.5">
                  {previewStudents.map((s) => (
                    <div key={s.studentId} className="text-xs text-slate-300 flex justify-between">
                      <span>{s.firstName} {s.lastName}</span>
                      <span className="text-slate-500">{s.admissionNumber}</span>
                    </div>
                  ))}
                </div>

                <ConfirmDialog
                  trigger={
                    <Button className="w-full bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/20">
                      <UserCheck className="w-4 h-4 mr-2" /> Assign Fee Structure
                    </Button>
                  }
                  title="Confirm Bulk Assignment"
                  description={`Are you sure you want to assign the structure to all ${previewStudents.length} targeted students? Original charges and installments will be generated.`}
                  onConfirm={handleBulkAssign}
                  isLoading={assignMutation.isPending}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Existing Assignments list */}
        <Card className="lg:col-span-2 border-slate-800 bg-slate-900/40">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-indigo-400" />
              Active Assignment Roll
            </CardTitle>
            <CardDescription className="text-slate-400">View students currently mapped to fee schedules.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {!assignments || assignments.length === 0 ? (
              <div className="p-6 text-center text-slate-500">No student fee assignments recorded yet. Use bulk setup configurations.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-slate-400">Admission No</TableHead>
                    <TableHead className="text-slate-400">Student</TableHead>
                    <TableHead className="text-slate-400">Fee Structure</TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((asg) => (
                    <TableRow key={asg.id} className="border-slate-800 hover:bg-slate-800/20">
                      <TableCell className="font-semibold text-slate-400">{asg.student?.admissionNumber}</TableCell>
                      <TableCell className="font-medium text-slate-200">
                        {asg.student?.firstName} {asg.student?.lastName}
                      </TableCell>
                      <TableCell className="text-slate-400">{asg.structure?.name}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400`}>
                          {asg.assignmentStatus}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
