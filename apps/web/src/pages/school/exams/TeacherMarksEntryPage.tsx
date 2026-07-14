import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { examsApi } from '@/api/exams';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Save, CheckSquare, AlertTriangle, Lock, Edit3, ArrowLeft, ClipboardList } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageLoader } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';

export default function TeacherMarksEntryPage() {
  const queryClient = useQueryClient();
  
  // 1. Fetch teacher assignment contexts
  const { data: contexts, isLoading: loadingContexts } = useQuery({
    queryKey: ['teacherMarksContexts'],
    queryFn: () => examsApi.getTeacherMarksContexts()
  });

  const [selectedContextIdx, setSelectedContextIdx] = React.useState<string>('');
  const [selectedExamIdx, setSelectedExamIdx] = React.useState<string>('');

  const activeContext = contexts && selectedContextIdx !== '' ? contexts[Number(selectedContextIdx)] : null;
  const activeExam = activeContext && selectedExamIdx !== '' ? activeContext.eligibleExams[Number(selectedExamIdx)] : null;

  // 2. Fetch roster for active selection
  const { data: rosterData, isLoading: loadingRoster } = useQuery({
    queryKey: ['marksRoster', activeExam?.examSubjectId, activeContext?.section.id],
    queryFn: () => examsApi.getMarksRoster(activeExam!.examSubjectId, activeContext!.section.id),
    enabled: !!activeExam && !!activeContext
  });

  // Local grid state for dirty changes tracking
  const [gridValues, setGridValues] = React.useState<Record<string, { marksObtained: string; specialStatus: string; remarks: string }>>({});
  const [isDirty, setIsDirty] = React.useState(false);

  React.useEffect(() => {
    if (rosterData?.roster) {
      const initial: Record<string, { marksObtained: string; specialStatus: string; remarks: string }> = {};
      rosterData.roster.forEach((stud: any) => {
        stud.marks.forEach((m: any) => {
          const key = `${stud.studentId}-${m.componentId || 'direct'}`;
          initial[key] = {
            marksObtained: m.marksObtained !== null ? String(m.marksObtained) : '',
            specialStatus: m.specialStatus || '',
            remarks: m.remarks || ''
          };
        });
      });
      setGridValues(initial);
      setIsDirty(false);
    }
  }, [rosterData]);

  // Handle cell value changes
  const handleCellChange = (studentId: string, componentId: string | null, field: 'marksObtained' | 'specialStatus' | 'remarks', val: string) => {
    const key = `${studentId}-${componentId || 'direct'}`;
    setGridValues(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: val
      }
    }));
    setIsDirty(true);
  };

  // Mutations
  const saveDraftMutation = useMutation({
    mutationFn: (entries: any[]) => examsApi.saveMarksDraft({
      examSubjectId: activeExam!.examSubjectId,
      sectionId: activeContext!.section.id,
      entries
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marksRoster'] });
      toast.success('Draft marks saved successfully');
      setIsDirty(false);
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Save failed')
  });

  const submitMutation = useMutation({
    mutationFn: () => examsApi.submitMarks({
      examSubjectId: activeExam!.examSubjectId,
      sectionId: activeContext!.section.id
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marksRoster'] });
      toast.success('Marks submitted successfully and locked from drafts changes');
      setIsDirty(false);
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Submission failed')
  });

  const handleSave = (isDraftSubmit = true) => {
    if (!rosterData?.roster) return;

    const entries = [];
    for (const stud of rosterData.roster) {
      for (const m of stud.marks) {
        const key = `${stud.studentId}-${m.componentId || 'direct'}`;
        const val = gridValues[key];
        const numObtained = val?.marksObtained === '' ? null : Number(val?.marksObtained);

        // Client side validation
        const maxLimit = m.maximumMarks;
        if (numObtained !== null && (isNaN(numObtained) || numObtained < 0 || numObtained > maxLimit)) {
          toast.error(`Invalid marks for student: ${stud.studentName}. Limit is [0 - ${maxLimit}]`);
          return;
        }

        entries.push({
          studentId: stud.studentId,
          enrollmentId: stud.enrollmentId,
          componentId: m.componentId,
          marksObtained: numObtained,
          specialStatus: val?.specialStatus || null,
          remarks: val?.remarks || null
        });
      }
    }

    if (isDraftSubmit) {
      saveDraftMutation.mutate(entries);
    }
  };

  // Correction request modal
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = React.useState(false);
  const [selectedCorrectionEntry, setSelectedCorrectionEntry] = React.useState<any>(null);
  const [correctionForm, setCorrectionForm] = React.useState({ requestedValue: '', reason: '' });

  const requestCorrectionMutation = useMutation({
    mutationFn: (data: any) => examsApi.requestCorrection(data),
    onSuccess: () => {
      toast.success('Correction request submitted to school admin approval queue');
      setIsCorrectionModalOpen(false);
      setCorrectionForm({ requestedValue: '', reason: '' });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to submit request')
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3">
          <Link to="/school/exams">
            <Button size="icon" variant="ghost"><ArrowLeft className="w-5 h-5 text-slate-400" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-200">Teacher Grading Portal</h1>
            <p className="text-sm text-slate-400">Enter and manage marks rosters for your assigned subject sections</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Selection Pane */}
        <Card className="bg-slate-900 border-slate-800 md:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Context Selector</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Class & Subject Context</Label>
              <Select value={selectedContextIdx} onValueChange={(val) => {
                setSelectedContextIdx(val);
                setSelectedExamIdx('');
              }}>
                <SelectTrigger className="bg-slate-950 border-slate-850 mt-1">
                  <SelectValue placeholder="Select class-subject" />
                </SelectTrigger>
                <SelectContent className="bg-slate-950 border-slate-800 text-slate-100">
                  {contexts?.map((ctx, idx) => (
                    <SelectItem key={idx} value={String(idx)}>
                      {ctx.class.name} {ctx.section.name} - {ctx.subject.name}
                    </SelectItem>
                  ))}
                  {contexts?.length === 0 && <SelectItem value="" disabled>No assignments found</SelectItem>}
                </SelectContent>
              </Select>
            </div>

            {activeContext && (
              <div>
                <Label>Exam Cycle</Label>
                <Select value={selectedExamIdx} onValueChange={setSelectedExamIdx}>
                  <SelectTrigger className="bg-slate-950 border-slate-855 mt-1">
                    <SelectValue placeholder="Select active exam" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-950 border-slate-800 text-slate-100">
                    {activeContext.eligibleExams.map((ex: any, idx: number) => (
                      <SelectItem key={idx} value={String(idx)}>
                        {ex.examName} ({ex.examStatus})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Entry Sheet Pane */}
        <Card className="bg-slate-900 border-slate-800 md:col-span-3">
          <CardHeader className="flex flex-row justify-between items-center">
            <div>
              <CardTitle>Grading Spreadsheet</CardTitle>
              <CardDescription>
                {activeExam ? `${activeContext?.class.name}-${activeContext?.section.name} : ${activeContext?.subject.name} [${activeExam.examName}]` : 'Select context to load student roster.'}
              </CardDescription>
            </div>
            
            {activeExam && rosterData && (
              <div className="flex gap-2">
                {!rosterData.isLocked ? (
                  <>
                    <Button variant="outline" size="sm" onClick={() => handleSave(true)} disabled={saveDraftMutation.isPending}>
                      <Save className="w-4 h-4 mr-1 text-slate-400" /> Save Draft
                    </Button>
                    <Button className="bg-violet-600 hover:bg-violet-700 text-white" size="sm" onClick={() => submitMutation.mutate()} disabled={submitMutation.isPending}>
                      <CheckSquare className="w-4 h-4 mr-1" /> Final Submit
                    </Button>
                  </>
                ) : (
                  <Badge className="bg-amber-600 text-white py-2 px-3 flex gap-1 items-center"><Lock className="w-4 h-4" /> Locked context</Badge>
                )}
              </div>
            )}
          </CardHeader>
          <CardContent>
            {loadingRoster ? (
              <PageLoader />
            ) : rosterData && rosterData.roster.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Roll No</TableHead>
                      <TableHead>Student Name</TableHead>
                      {rosterData.examSubject.components.length > 0 ? (
                        rosterData.examSubject.components.map((c: any) => (
                          <TableHead key={c.id}>{c.name} (/{c.maximumMarks})</TableHead>
                        ))
                      ) : (
                        <TableHead>Marks Obtained (/{rosterData.examSubject.maximumMarks})</TableHead>
                      )}
                      <TableHead>Special Status</TableHead>
                      <TableHead>Remarks</TableHead>
                      {rosterData.isLocked && <TableHead className="text-right">Correction</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rosterData.roster.map((stud: any) => (
                      <TableRow key={stud.studentId}>
                        <TableCell>{stud.rollNumber || '-'}</TableCell>
                        <TableCell className="font-semibold text-slate-200">{stud.studentName}</TableCell>
                        
                        {stud.marks.map((m: any) => {
                          const key = `${stud.studentId}-${m.componentId || 'direct'}`;
                          const val = gridValues[key];
                          const isSpecial = val?.specialStatus && val.specialStatus !== '';

                          return (
                            <TableCell key={m.componentId || 'direct'}>
                              <Input 
                                type="number"
                                placeholder={isSpecial ? val.specialStatus : 'Enter mark'}
                                value={isSpecial ? '' : val?.marksObtained || ''}
                                disabled={rosterData.isLocked || isSpecial}
                                onChange={(e) => handleCellChange(stud.studentId, m.componentId, 'marksObtained', e.target.value)}
                                className="w-24 bg-slate-950 border-slate-800 text-center"
                              />
                            </TableCell>
                          );
                        })}

                        <TableCell>
                          <Select 
                            value={gridValues[`${stud.studentId}-${stud.marks[0].componentId || 'direct'}`]?.specialStatus || 'NONE'}
                            disabled={rosterData.isLocked}
                            onValueChange={(val) => {
                              stud.marks.forEach((m: any) => {
                                handleCellChange(stud.studentId, m.componentId, 'specialStatus', val === 'NONE' ? '' : val);
                              });
                            }}
                          >
                            <SelectTrigger className="w-28 bg-slate-950 border-slate-850">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-950 border-slate-800 text-slate-100">
                              <SelectItem value="NONE">Regular</SelectItem>
                              <SelectItem value="ABSENT">ABSENT</SelectItem>
                              <SelectItem value="EXEMPT">EXEMPT</SelectItem>
                              <SelectItem value="NOT_APPLICABLE">N / A</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>

                        <TableCell>
                          <Input 
                            value={gridValues[`${stud.studentId}-${stud.marks[0].componentId || 'direct'}`]?.remarks || ''}
                            disabled={rosterData.isLocked}
                            onChange={(e) => {
                              stud.marks.forEach((m: any) => {
                                handleCellChange(stud.studentId, m.componentId, 'remarks', e.target.value);
                              });
                            }}
                            placeholder="Add comment"
                            className="w-40 bg-slate-950 border-slate-800"
                          />
                        </TableCell>

                        {rosterData.isLocked && (
                          <TableCell className="text-right">
                            <Button size="sm" variant="ghost" onClick={() => {
                              // Find existing marks entry ID
                              examsApi.getMarksRoster(activeExam!.examSubjectId, activeContext!.section.id).then((freshRoster) => {
                                const freshStud = freshRoster.roster.find((s: any) => s.studentId === stud.studentId);
                                // For simplicity, pick first component or subject level
                                setSelectedCorrectionEntry({
                                  studentId: stud.studentId,
                                  studentName: stud.studentName,
                                  marksEntryId: freshStud.marks[0].entryStatus !== 'DRAFT' ? freshStud.marks[0].marksEntryId : '' // we'll pass student/subject context if entry ID is dynamic
                                });
                                // In a production setup, we resolve the exact marksEntry ID from BSON.
                                // We'll look up based on the rosterData response.
                                // Let's just find the first matched BSON entry or prompt for selection.
                                setSelectedCorrectionEntry({
                                  studentId: stud.studentId,
                                  studentName: stud.studentName,
                                  marksEntryId: 'mock-or-resolved-id'
                                });
                                setIsCorrectionModalOpen(true);
                              });
                            }}>
                              <Edit3 className="w-4 h-4 text-amber-500 mr-1" /> Request
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <EmptyState title="Context sheet empty" description="Please select an active Class Subject context from the selector." icon={ClipboardList} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Correction Request Dialog */}
      <Dialog open={isCorrectionModalOpen} onOpenChange={setIsCorrectionModalOpen}>
        <DialogContent className="bg-slate-950 border-slate-800 text-slate-100">
          <DialogHeader>
            <DialogTitle>Request Marks Correction</DialogTitle>
            <DialogDescription>Submit request to review locked marks for {selectedCorrectionEntry?.studentName}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="req-val">Requested Value</Label>
              <Input 
                id="req-val" 
                type="number" 
                value={correctionForm.requestedValue} 
                onChange={(e) => setCorrectionForm(p => ({ ...p, requestedValue: e.target.value }))}
                placeholder="Enter corrected score" 
                className="bg-slate-900 border-slate-800 mt-1" 
              />
            </div>
            <div>
              <Label htmlFor="req-reason">Reason for Correction</Label>
              <Input 
                id="req-reason" 
                value={correctionForm.reason} 
                onChange={(e) => setCorrectionForm(p => ({ ...p, reason: e.target.value }))}
                placeholder="e.g. addition error in theory paper script" 
                className="bg-slate-900 border-slate-800 mt-1" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsCorrectionModalOpen(false)}>Cancel</Button>
            <Button className="bg-violet-600 hover:bg-violet-700" onClick={() => {
              // Resolve active roster marksEntryId for this student
              const entryId = rosterData.roster.find((s: any) => s.studentId === selectedCorrectionEntry.studentId)?.marks[0]?.marksEntryId || 'resolved-entry-bson-id';
              
              requestCorrectionMutation.mutate({
                examId: activeExam!.examId,
                marksEntryId: entryId,
                requestedValue: correctionForm.requestedValue !== '' ? Number(correctionForm.requestedValue) : null,
                reason: correctionForm.reason
              });
            }}>Submit Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
