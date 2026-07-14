import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { learningApi, type Homework, type Assignment, type AssignmentSubmission, type StudyMaterial } from '@/api/learning';
import { classesApi } from '@/api/classes';
import { subjectsApi } from '@/api/subjects';
import { onboardingApi } from '@/api/onboarding';
import { academicYearsApi } from '@/api/academicYears';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageLoader } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  BookOpen, 
  FileText, 
  Plus, 
  Eye, 
  GraduationCap, 
  Check, 
  Calendar,
  Send,
  Download,
  AlertCircle
} from 'lucide-react';

export default function LearningWorkspacePage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // Resolve role status
  const isTeacher = (user?.userType as string) === 'SCHOOL_ADMIN'; // Administrative or Teaching Staff
  const isStudent = (user?.userType as string) === 'STUDENT';
  const isGuardian = (user?.userType as string) === 'GUARDIAN';

  const [activeTab, setActiveTab] = React.useState<'homework' | 'assignments' | 'materials'>('homework');

  // Load context parameters
  const [selectedChildId, setSelectedChildId] = React.useState<string>('');
  
  const { data: studentSummary } = useQuery({
    queryKey: ['studentSummary'],
    queryFn: onboardingApi.getStudentSummary,
    enabled: isStudent
  });
  
  const { data: parentChildren } = useQuery({
    queryKey: ['parentChildren'],
    queryFn: onboardingApi.getLinkedChildren,
    enabled: isGuardian
  });

  const children = (parentChildren || []).map((c: any) => c.student) || [];
  React.useEffect(() => {
    if (isGuardian && children.length > 0 && !selectedChildId) {
      setSelectedChildId(children[0].id);
    }
  }, [isGuardian, children, selectedChildId]);

  // Load Academics
  const { data: classes } = useQuery({
    queryKey: ['classes'],
    queryFn: classesApi.listClasses
  });

  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => subjectsApi.list()
  });

  // Current academic year details
  const { data: academicYears } = useQuery({
    queryKey: ['academicYears'],
    queryFn: academicYearsApi.list
  });
  const currentAcademicYear = (academicYears as any)?.find((y: any) => y.isCurrent);

  // Load Lists
  // 1. Homework Lists
  const { data: teacherHomework, isLoading: isHwLoading } = useQuery({
    queryKey: ['teacherHomework'],
    queryFn: learningApi.listTeacherHomework,
    enabled: isTeacher
  });

  const { data: studentHomework } = useQuery({
    queryKey: ['studentHomework', currentAcademicYear?.id],
    queryFn: () => learningApi.listStudentHomework(currentAcademicYear?.id || ''),
    enabled: isStudent && !!currentAcademicYear
  });

  const { data: childHomework } = useQuery({
    queryKey: ['childHomework', selectedChildId, currentAcademicYear?.id],
    queryFn: () => learningApi.listChildHomework(selectedChildId, currentAcademicYear?.id || ''),
    enabled: isGuardian && !!selectedChildId && !!currentAcademicYear
  });

  // 2. Assignment Lists
  const { data: teacherAssignments } = useQuery({
    queryKey: ['teacherAssignments'],
    queryFn: learningApi.listTeacherAssignments,
    enabled: isTeacher
  });

  const { data: studentAssignments } = useQuery({
    queryKey: ['studentAssignments', currentAcademicYear?.id],
    queryFn: () => learningApi.listStudentAssignments(currentAcademicYear?.id || ''),
    enabled: isStudent && !!currentAcademicYear
  });

  const { data: childAssignments } = useQuery({
    queryKey: ['childAssignments', selectedChildId, currentAcademicYear?.id],
    queryFn: () => learningApi.listChildAssignments(selectedChildId, currentAcademicYear?.id || ''),
    enabled: isGuardian && !!selectedChildId && !!currentAcademicYear
  });

  // 3. Study Materials
  const { data: teacherMaterials } = useQuery({
    queryKey: ['teacherMaterials'],
    queryFn: learningApi.listTeacherStudyMaterials,
    enabled: isTeacher
  });

  const { data: studentMaterials } = useQuery({
    queryKey: ['studentMaterials', currentAcademicYear?.id],
    queryFn: () => learningApi.listStudentStudyMaterials(currentAcademicYear?.id || ''),
    enabled: isStudent && !!currentAcademicYear
  });

  // Mutations
  const publishHwMutation = useMutation({
    mutationFn: learningApi.publishHomework,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacherHomework'] });
      toast.success('Homework published successfully');
    }
  });

  const publishAssignMutation = useMutation({
    mutationFn: learningApi.publishAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacherAssignments'] });
      toast.success('Assignment published successfully');
    }
  });

  // Modals / Detail Inspect states
  const [isHwOpen, setIsHwOpen] = React.useState(false);
  const [hwForm, setHwForm] = React.useState({
    classId: '',
    sectionId: '',
    subjectId: '',
    title: '',
    description: '',
    assignedDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    attachmentUrl: ''
  });

  const createHwMutation = useMutation({
    mutationFn: (data: typeof hwForm) => learningApi.createHomework({
      ...data,
      academicYearId: currentAcademicYear?.id || ''
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacherHomework'] });
      toast.success('Homework draft created');
      setIsHwOpen(false);
      setHwForm({ classId: '', sectionId: '', subjectId: '', title: '', description: '', assignedDate: new Date().toISOString().split('T')[0], dueDate: '', attachmentUrl: '' });
    },
    onError: (err: any) => toast.error(err.message || 'Failed to create homework')
  });

  const [isAssignOpen, setIsAssignOpen] = React.useState(false);
  const [assignForm, setAssignForm] = React.useState({
    classId: '',
    sectionId: '',
    subjectId: '',
    title: '',
    description: '',
    assignedAt: new Date().toISOString().substring(0, 16),
    dueAt: new Date().toISOString().substring(0, 16),
    maximumMarks: 100,
    allowLateSubmission: false,
    attachmentUrl: ''
  });

  const createAssignMutation = useMutation({
    mutationFn: (data: typeof assignForm) => learningApi.createAssignment({
      ...data,
      academicYearId: currentAcademicYear?.id || ''
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacherAssignments'] });
      toast.success('Assignment draft created');
      setIsAssignOpen(false);
      setAssignForm({ classId: '', sectionId: '', subjectId: '', title: '', description: '', assignedAt: new Date().toISOString().substring(0, 16), dueAt: new Date().toISOString().substring(0, 16), maximumMarks: 100, allowLateSubmission: false, attachmentUrl: '' });
    },
    onError: (err: any) => toast.error(err.message || 'Failed to create assignment')
  });

  const [isMaterialOpen, setIsMaterialOpen] = React.useState(false);
  const [matForm, setMatForm] = React.useState({
    classId: '',
    sectionId: '',
    subjectId: '',
    title: '',
    description: '',
    materialType: 'NOTES',
    fileAttachmentUrl: '',
    url: ''
  });

  const createMatMutation = useMutation({
    mutationFn: (data: typeof matForm) => learningApi.createStudyMaterial({
      ...data,
      academicYearId: currentAcademicYear?.id || ''
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacherMaterials'] });
      toast.success('Study material notes published!');
      setIsMaterialOpen(false);
      setMatForm({ classId: '', sectionId: '', subjectId: '', title: '', description: '', materialType: 'NOTES', fileAttachmentUrl: '', url: '' });
    },
    onError: (err: any) => toast.error(err.message || 'Failed to create study material')
  });

  // Student Submit Assignment Dialog state
  const [submitAssignId, setSubmitAssignId] = React.useState<string | null>(null);
  const [submitForm, setSubmitForm] = React.useState({ textResponse: '', attachmentUrl: '' });

  const submitWorkMutation = useMutation({
    mutationFn: (variables: { id: string; data: typeof submitForm }) => learningApi.submitAssignment(variables.id, {
      ...variables.data,
      academicYearId: currentAcademicYear?.id || ''
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentAssignments'] });
      toast.success('Assignment response submitted successfully');
      setSubmitAssignId(null);
      setSubmitForm({ textResponse: '', attachmentUrl: '' });
    },
    onError: (err: any) => toast.error(err.message || 'Submission failed')
  });

  // Teacher Review Submissions details state
  const [reviewAssignId, setReviewAssignId] = React.useState<string | null>(null);
  const { data: submissions } = useQuery({
    queryKey: ['assignmentSubmissions', reviewAssignId],
    queryFn: () => learningApi.listSubmissions(reviewAssignId!),
    enabled: !!reviewAssignId
  });

  const [gradingSubId, setGradingSubId] = React.useState<string | null>(null);
  const [gradeForm, setGradeForm] = React.useState({ marksAwarded: '', feedback: '' });

  const submitGradeMutation = useMutation({
    mutationFn: (variables: { id: string; data: typeof gradeForm }) => learningApi.gradeSubmission(variables.id, {
      marksAwarded: Number(variables.data.marksAwarded),
      feedback: variables.data.feedback
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignmentSubmissions', reviewAssignId] });
      toast.success('Submission graded successfully');
      setGradingSubId(null);
      setGradeForm({ marksAwarded: '', feedback: '' });
    },
    onError: (err: any) => toast.error(err.message || 'Grading failed')
  });

  const selectedClass = (classes as any)?.find((c: any) => c.id === (hwForm.classId || assignForm.classId || matForm.classId));

  if (isHwLoading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto text-slate-100 bg-slate-950 min-h-screen">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-800 pb-5 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-200 via-slate-100 to-indigo-100 bg-clip-text text-transparent">
            Learning Workspace
          </h1>
          <p className="text-sm text-slate-400">Class homework sheets, assignment submissions desk, and downloadable study materials notes.</p>
        </div>
        
        {isGuardian && (
          <div className="flex items-center gap-2">
            <Label className="text-slate-400 whitespace-nowrap text-xs">Select Child Homeroom:</Label>
            <Select value={selectedChildId} onValueChange={setSelectedChildId}>
              <SelectTrigger className="bg-slate-950 border-slate-800 w-44">
                <SelectValue placeholder="Select child" />
              </SelectTrigger>
              <SelectContent className="bg-slate-950 border-slate-800 text-slate-100">
                {children.map((c: any) => (
                  <SelectItem key={c.id} value={c.id}>{c.firstName} {c.lastName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {isTeacher && (
          <div className="flex gap-2">
            <Button onClick={() => setIsHwOpen(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2">
              <Plus className="h-4 w-4" /> Homework
            </Button>
            <Button onClick={() => setIsAssignOpen(true)} className="bg-primary hover:bg-primary/95 text-white flex items-center gap-2">
              <Plus className="h-4 w-4" /> Assignment
            </Button>
            <Button onClick={() => setIsMaterialOpen(true)} variant="outline" className="border-slate-800 hover:bg-slate-900 text-slate-300 flex items-center gap-2">
              <Plus className="h-4 w-4" /> Study Notes
            </Button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 overflow-x-auto gap-2">
        <Button variant={activeTab === 'homework' ? 'default' : 'ghost'} onClick={() => setActiveTab('homework')} className="rounded-none border-b-2 border-transparent data-[active=true]:border-primary" data-active={activeTab === 'homework'}>
          Homework Tasks
        </Button>
        <Button variant={activeTab === 'assignments' ? 'default' : 'ghost'} onClick={() => setActiveTab('assignments')} className="rounded-none border-b-2 border-transparent data-[active=true]:border-primary" data-active={activeTab === 'assignments'}>
          Assignments & Submissions
        </Button>
        <Button variant={activeTab === 'materials' ? 'default' : 'ghost'} onClick={() => setActiveTab('materials')} className="rounded-none border-b-2 border-transparent data-[active=true]:border-primary" data-active={activeTab === 'materials'}>
          Study Materials
        </Button>
      </div>

      {/* Tab content: Homework */}
      {activeTab === 'homework' && (
        <div className="space-y-4">
          {/* Teacher View */}
          {isTeacher && (
            <Card className="border-slate-800 bg-slate-900/40">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-800 hover:bg-transparent">
                      <TableHead className="text-slate-400">Class & Section</TableHead>
                      <TableHead className="text-slate-400">Subject</TableHead>
                      <TableHead className="text-slate-400">Homework Title</TableHead>
                      <TableHead className="text-slate-400">Assigned / Due</TableHead>
                      <TableHead className="text-slate-400">Status</TableHead>
                      <TableHead className="text-slate-400 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teacherHomework?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-slate-500 italic">No homework tasks defined.</TableCell>
                      </TableRow>
                    ) : (
                      teacherHomework?.map(hw => (
                        <TableRow key={hw.id} className="border-slate-800 hover:bg-slate-900/20">
                          <TableCell className="font-semibold">{hw.class?.name} - {hw.section?.name}</TableCell>
                          <TableCell className="text-indigo-400 font-bold">{hw.subject?.name}</TableCell>
                          <TableCell>{hw.title}</TableCell>
                          <TableCell className="text-xs text-slate-400 font-mono">
                            {new Date(hw.assignedDate).toLocaleDateString()} to {hw.dueDate ? new Date(hw.dueDate).toLocaleDateString() : 'No Limit'}
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                              hw.status === 'PUBLISHED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-300'
                            }`}>
                              {hw.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            {hw.status === 'DRAFT' && (
                              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500" onClick={() => publishHwMutation.mutate(hw.id)}>
                                Publish
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Student View */}
          {isStudent && (
            <div className="grid gap-6">
              {studentHomework?.length === 0 ? (
                <EmptyState icon={BookOpen} title="Homework Complete" description="You have no pending homework tasks mapped in your homeroom class feed." />
              ) : (
                studentHomework?.map(hw => (
                  <Card key={hw.id} className="border-slate-800 bg-slate-900/40 p-6 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400 uppercase tracking-wider">{hw.subject?.name}</span>
                          <h3 className="text-lg font-black text-slate-200 mt-2">{hw.title}</h3>
                        </div>
                        <span className="text-xs text-slate-500 font-mono">Due: {hw.dueDate ? new Date(hw.dueDate).toLocaleDateString() : 'No Due Date'}</span>
                      </div>
                      <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{hw.description}</p>
                    </div>
                    {hw.attachmentUrl && (
                      <div className="mt-6 flex justify-end border-t border-slate-800/60 pt-4">
                        <Button asChild variant="outline" className="border-slate-800 hover:bg-slate-950 text-xs gap-2">
                          <a href={hw.attachmentUrl} target="_blank" rel="noreferrer">
                            <Download className="h-4 w-4" /> Download Sheet Attachment
                          </a>
                        </Button>
                      </div>
                    )}
                  </Card>
                ))
              )}
            </div>
          )}

          {/* Guardian View */}
          {isGuardian && (
            <div className="grid gap-6">
              {!selectedChildId || childHomework?.length === 0 ? (
                <EmptyState icon={BookOpen} title="Homework Checked" description="This child has no pending homework sheets assigned." />
              ) : (
                childHomework?.map(hw => (
                  <Card key={hw.id} className="border-slate-800 bg-slate-900/40 p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400">{hw.subject?.name}</span>
                        <h3 className="text-md font-bold text-slate-200 mt-2">{hw.title}</h3>
                      </div>
                      <span className="text-xs text-slate-500">Due: {hw.dueDate ? new Date(hw.dueDate).toLocaleDateString() : 'No Limit'}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">{hw.description}</p>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab content: Assignments */}
      {activeTab === 'assignments' && (
        <div className="space-y-6">
          {/* Teacher View */}
          {isTeacher && (
            <Card className="border-slate-800 bg-slate-900/40">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-800 hover:bg-transparent">
                      <TableHead className="text-slate-400">Class & Section</TableHead>
                      <TableHead className="text-slate-400">Subject</TableHead>
                      <TableHead className="text-slate-400">Assignment Title</TableHead>
                      <TableHead className="text-slate-400">Status</TableHead>
                      <TableHead className="text-slate-400 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teacherAssignments?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-slate-500 italic">No assignments defined.</TableCell>
                      </TableRow>
                    ) : (
                      teacherAssignments?.map(assign => (
                        <TableRow key={assign.id} className="border-slate-800 hover:bg-slate-900/20">
                          <TableCell className="font-semibold">{assign.class?.name} - {assign.section?.name}</TableCell>
                          <TableCell className="text-indigo-400 font-bold">{assign.subject?.name}</TableCell>
                          <TableCell>{assign.title}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                              assign.status === 'PUBLISHED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-300'
                            }`}>
                              {assign.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            {assign.status === 'DRAFT' && (
                              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-xs" onClick={() => publishAssignMutation.mutate(assign.id)}>
                                Publish
                              </Button>
                            )}
                            {assign.status === 'PUBLISHED' && (
                              <Button size="sm" variant="outline" className="border-slate-800 hover:bg-slate-950 text-xs" onClick={() => setReviewAssignId(assign.id)}>
                                Submissions
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Submissions Panel (Teacher view) */}
          {isTeacher && reviewAssignId && (
            <Card className="border-slate-800 bg-slate-900/40 p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="font-bold text-slate-200">Student Submissions Queue</h3>
                <Button variant="ghost" size="sm" onClick={() => setReviewAssignId(null)}>Close</Button>
              </div>

              {!submissions || submissions.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No submissions uploaded for this assignment yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-800 hover:bg-transparent">
                      <TableHead className="text-slate-400">Student</TableHead>
                      <TableHead className="text-slate-400">Submitted Date</TableHead>
                      <TableHead className="text-slate-400">Status</TableHead>
                      <TableHead className="text-slate-400">Grade / Marks</TableHead>
                      <TableHead className="text-slate-400 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map(sub => (
                      <TableRow key={sub.id} className="border-slate-800 hover:bg-slate-900/20">
                        <TableCell>
                          <div className="font-semibold">{sub.student?.firstName} {sub.student?.lastName}</div>
                          <div className="text-xs text-slate-500 font-mono">{sub.student?.admissionNumber}</div>
                        </TableCell>
                        <TableCell className="text-xs font-mono text-slate-400">
                          {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                            sub.status === 'GRADED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                          }`}>
                            {sub.status}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {sub.grade?.marksAwarded !== undefined ? `${sub.grade.marksAwarded} Marks` : 'Unassigned'}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          {sub.attachmentUrl && (
                            <Button asChild size="sm" variant="outline" className="border-slate-800 hover:bg-slate-950 text-xs">
                              <a href={sub.attachmentUrl} target="_blank" rel="noreferrer">Download Attachment</a>
                            </Button>
                          )}
                          <Button size="sm" className="bg-primary hover:bg-primary/95 text-xs text-white" onClick={() => {
                            setGradingSubId(sub.id);
                            setGradeForm({ marksAwarded: String(sub.grade?.marksAwarded || ''), feedback: sub.grade?.feedback || '' });
                          }}>
                            Grade Response
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Card>
          )}

          {/* Student View */}
          {isStudent && (
            <div className="grid gap-6">
              {studentAssignments?.length === 0 ? (
                <EmptyState icon={FileText} title="Assignments Complete" description="You have no pending student assignments in your homeroom class feed." />
              ) : (
                studentAssignments?.map(a => (
                  <Card key={a.id} className="border-slate-800 bg-slate-900/40 p-6 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400 uppercase tracking-wider">{a.subjectName}</span>
                          <h3 className="text-lg font-black text-slate-200 mt-2">{a.title}</h3>
                        </div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                          a.submissionStatus === 'GRADED' ? 'bg-emerald-500/10 text-emerald-400' :
                          a.submissionStatus === 'SUBMITTED' ? 'bg-blue-500/10 text-blue-400' :
                          'bg-amber-500/10 text-amber-400'
                        }`}>
                          {a.submissionStatus || 'PENDING'}
                        </span>
                      </div>
                      <p className="text-slate-300 text-sm leading-relaxed">{a.description}</p>
                      <div className="text-xs text-slate-500 font-mono">
                        Due Date: {new Date(a.dueAt).toLocaleString()}
                      </div>

                      {a.submission?.grade && (
                        <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-4 mt-4">
                          <div className="font-bold text-emerald-400 text-sm">Graded: {a.submission.grade.marksAwarded} / {a.maximumMarks} Marks</div>
                          <p className="text-xs text-slate-400 mt-1 italic">Feedback: {a.submission.grade.feedback || 'No remarks provided.'}</p>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 flex justify-end gap-2 border-t border-slate-800/60 pt-4">
                      {a.attachmentUrl && (
                        <Button asChild variant="outline" className="border-slate-800 hover:bg-slate-950 text-xs">
                          <a href={a.attachmentUrl} target="_blank" rel="noreferrer">Download worksheet</a>
                        </Button>
                      )}
                      {(!a.submissionStatus || a.submissionStatus === 'PENDING') && (
                        <Button className="bg-primary hover:bg-primary/95 text-white" size="sm" onClick={() => setSubmitAssignId(a.id)}>
                          Upload Submission
                        </Button>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* Guardian View */}
          {isGuardian && (
            <div className="grid gap-6">
              {!selectedChildId || childAssignments?.length === 0 ? (
                <EmptyState icon={FileText} title="Assignments Checked" description="This child has no pending homework assignments." />
              ) : (
                childAssignments?.map(a => (
                  <Card key={a.id} className="border-slate-800 bg-slate-900/40 p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400">{a.subjectName}</span>
                        <h3 className="text-md font-bold text-slate-200 mt-2">{a.title}</h3>
                      </div>
                      <span className="text-xs text-slate-500">Status: {a.submissionStatus}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">{a.description}</p>
                    {a.submission?.grade && (
                      <div className="mt-3 text-xs font-bold text-emerald-400">Grade Score: {a.submission.grade.marksAwarded} Marks</div>
                    )}
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab content: Study Materials */}
      {activeTab === 'materials' && (
        <div className="space-y-4">
          {/* Teacher View */}
          {isTeacher && (
            <Card className="border-slate-800 bg-slate-900/40">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-800 hover:bg-transparent">
                      <TableHead className="text-slate-400">Class & Section</TableHead>
                      <TableHead className="text-slate-400">Subject</TableHead>
                      <TableHead className="text-slate-400">Material Title</TableHead>
                      <TableHead className="text-slate-400">Type</TableHead>
                      <TableHead className="text-slate-400">Published At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teacherMaterials?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-slate-500 italic">No study materials published yet.</TableCell>
                      </TableRow>
                    ) : (
                      teacherMaterials?.map(mat => (
                        <TableRow key={mat.id} className="border-slate-800 hover:bg-slate-900/20">
                          <TableCell className="font-semibold">{mat.class?.name} - {mat.section?.name || 'All sections'}</TableCell>
                          <TableCell className="text-indigo-400 font-bold">{mat.subject?.name}</TableCell>
                          <TableCell>{mat.title}</TableCell>
                          <TableCell className="font-mono text-xs text-indigo-400">{mat.materialType}</TableCell>
                          <TableCell className="text-slate-400 text-xs font-mono">{mat.publishedAt ? new Date(mat.publishedAt).toLocaleDateString() : 'N/A'}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Student View */}
          {isStudent && (
            <div className="grid gap-6 sm:grid-cols-2">
              {studentMaterials?.length === 0 ? (
                <EmptyState icon={BookOpen} title="No Materials" description="Your teachers haven't uploaded study materials notes for your class yet." />
              ) : (
                studentMaterials?.map(mat => (
                  <Card key={mat.id} className="border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400 uppercase tracking-wider">{mat.subject?.name}</span>
                        <span className="font-mono text-[10px] text-slate-500">{mat.materialType}</span>
                      </div>
                      <h3 className="font-bold text-slate-200 text-md truncate">{mat.title}</h3>
                      <p className="text-xs text-slate-400 line-clamp-2">{mat.description || 'No description provided.'}</p>
                    </div>

                    <div className="mt-6 flex justify-end gap-2 border-t border-slate-800/60 pt-4">
                      {mat.fileAttachmentUrl && (
                        <Button asChild variant="outline" className="border-slate-800 hover:bg-slate-950 text-xs">
                          <a href={mat.fileAttachmentUrl} target="_blank" rel="noreferrer">Open Attachment</a>
                        </Button>
                      )}
                      {mat.url && (
                        <Button asChild className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs">
                          <a href={mat.url} target="_blank" rel="noreferrer">Open External Link</a>
                        </Button>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Homework Creation Modal */}
      {isHwOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg border-slate-800 bg-slate-900 text-slate-100">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Create Homework Draft</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 grid-cols-2">
                <div>
                  <Label>Target Class *</Label>
                  <Select value={hwForm.classId} onValueChange={val => setHwForm({ ...hwForm, classId: val, sectionId: '' })}>
                    <SelectTrigger className="bg-slate-950 border-slate-800">
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-950 border-slate-800 text-slate-100">
                      {((classes || []) as any).map((c: any) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Section *</Label>
                  <Select value={hwForm.sectionId} onValueChange={val => setHwForm({ ...hwForm, sectionId: val })}>
                    <SelectTrigger className="bg-slate-950 border-slate-800">
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-950 border-slate-800 text-slate-100">
                      {((selectedClass as any)?.sections || []).map((s: any) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Subject *</Label>
                <Select value={hwForm.subjectId} onValueChange={val => setHwForm({ ...hwForm, subjectId: val })}>
                  <SelectTrigger className="bg-slate-950 border-slate-800">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-950 border-slate-800 text-slate-100">
                    {((subjects || []) as any).map((sub: any) => (
                      <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Homework Title *</Label>
                <Input value={hwForm.title} onChange={e => setHwForm({ ...hwForm, title: e.target.value })} placeholder="e.g. Chapter 4 Equations Worksheet" className="bg-slate-950 border-slate-800" />
              </div>
              <div>
                <Label>Instructions / Description *</Label>
                <Input value={hwForm.description} onChange={e => setHwForm({ ...hwForm, description: e.target.value })} placeholder="Specify details..." className="bg-slate-950 border-slate-800" />
              </div>
              <div className="grid gap-4 grid-cols-2">
                <div>
                  <Label>Assigned Date *</Label>
                  <Input type="date" value={hwForm.assignedDate} onChange={e => setHwForm({ ...hwForm, assignedDate: e.target.value })} className="bg-slate-950 border-slate-800" />
                </div>
                <div>
                  <Label>Due Date</Label>
                  <Input type="date" value={hwForm.dueDate} onChange={e => setHwForm({ ...hwForm, dueDate: e.target.value })} className="bg-slate-950 border-slate-800" />
                </div>
              </div>
              <div>
                <Label>Worksheet URL / Attachment Link</Label>
                <Input value={hwForm.attachmentUrl} onChange={e => setHwForm({ ...hwForm, attachmentUrl: e.target.value })} placeholder="https://drive.google.com/..." className="bg-slate-950 border-slate-800" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 border-t border-slate-800 pt-4">
              <Button variant="outline" className="border-slate-800 hover:bg-slate-950" onClick={() => setIsHwOpen(false)}>Cancel</Button>
              <Button className="bg-primary hover:bg-primary/95 text-white" disabled={!hwForm.classId || !hwForm.sectionId || !hwForm.subjectId || !hwForm.title || !hwForm.description} onClick={() => createHwMutation.mutate(hwForm)}>
                Create Draft
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* Assignment Creation Modal */}
      {isAssignOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg border-slate-800 bg-slate-900 text-slate-100">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Create Assignment Draft</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 grid-cols-2">
                <div>
                  <Label>Target Class *</Label>
                  <Select value={assignForm.classId} onValueChange={val => setAssignForm({ ...assignForm, classId: val, sectionId: '' })}>
                    <SelectTrigger className="bg-slate-950 border-slate-800">
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-950 border-slate-800 text-slate-100">
                      {((classes || []) as any).map((c: any) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Section *</Label>
                  <Select value={assignForm.sectionId} onValueChange={val => setAssignForm({ ...assignForm, sectionId: val })}>
                    <SelectTrigger className="bg-slate-950 border-slate-800">
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-950 border-slate-800 text-slate-100">
                      {((selectedClass as any)?.sections || []).map((s: any) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Subject *</Label>
                <Select value={assignForm.subjectId} onValueChange={val => setAssignForm({ ...assignForm, subjectId: val })}>
                  <SelectTrigger className="bg-slate-950 border-slate-800">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-950 border-slate-800 text-slate-100">
                    {((subjects || []) as any).map((sub: any) => (
                      <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Assignment Title *</Label>
                <Input value={assignForm.title} onChange={e => setAssignForm({ ...assignForm, title: e.target.value })} placeholder="e.g. Maths Mid-term Assignment" className="bg-slate-950 border-slate-800" />
              </div>
              <div>
                <Label>Instructions *</Label>
                <Input value={assignForm.description} onChange={e => setAssignForm({ ...assignForm, description: e.target.value })} placeholder="Provide response guidelines..." className="bg-slate-950 border-slate-800" />
              </div>
              <div className="grid gap-4 grid-cols-2">
                <div>
                  <Label>Assigned DateTime *</Label>
                  <Input type="datetime-local" value={assignForm.assignedAt} onChange={e => setAssignForm({ ...assignForm, assignedAt: e.target.value })} className="bg-slate-950 border-slate-800" />
                </div>
                <div>
                  <Label>Due DateTime *</Label>
                  <Input type="datetime-local" value={assignForm.dueAt} onChange={e => setAssignForm({ ...assignForm, dueAt: e.target.value })} className="bg-slate-950 border-slate-800" />
                </div>
              </div>
              <div className="grid gap-4 grid-cols-2">
                <div>
                  <Label>Maximum Marks Score</Label>
                  <Input type="number" value={assignForm.maximumMarks} onChange={e => setAssignForm({ ...assignForm, maximumMarks: Number(e.target.value) })} className="bg-slate-950 border-slate-800" />
                </div>
                <div className="flex items-center justify-between border border-slate-800 rounded-lg p-2 mt-4 bg-slate-950">
                  <Label className="text-xs">Allow Late submissions?</Label>
                  <input type="checkbox" checked={assignForm.allowLateSubmission} onChange={e => setAssignForm({ ...assignForm, allowLateSubmission: e.target.checked })} />
                </div>
              </div>
              <div>
                <Label>Assignment Question PDF Link</Label>
                <Input value={assignForm.attachmentUrl} onChange={e => setAssignForm({ ...assignForm, attachmentUrl: e.target.value })} placeholder="https://drive.google.com/..." className="bg-slate-950 border-slate-800" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 border-t border-slate-800 pt-4">
              <Button variant="outline" className="border-slate-800 hover:bg-slate-950" onClick={() => setIsAssignOpen(false)}>Cancel</Button>
              <Button className="bg-primary hover:bg-primary/95 text-white" disabled={!assignForm.classId || !assignForm.sectionId || !assignForm.subjectId || !assignForm.title || !assignForm.description} onClick={() => createAssignMutation.mutate(assignForm)}>
                Create Draft
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* Study Materials Modal */}
      {isMaterialOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg border-slate-800 bg-slate-900 text-slate-100">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Publish Study Material Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 grid-cols-2">
                <div>
                  <Label>Target Class *</Label>
                  <Select value={matForm.classId} onValueChange={val => setMatForm({ ...matForm, classId: val, sectionId: '' })}>
                    <SelectTrigger className="bg-slate-950 border-slate-800">
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-950 border-slate-800 text-slate-100">
                      {((classes || []) as any).map((c: any) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Section (Optional)</Label>
                  <Select value={matForm.sectionId} onValueChange={val => setMatForm({ ...matForm, sectionId: val })}>
                    <SelectTrigger className="bg-slate-950 border-slate-800">
                      <SelectValue placeholder="All sections" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-950 border-slate-800 text-slate-100">
                      <SelectItem value="all">All sections</SelectItem>
                      {((selectedClass as any)?.sections || []).map((s: any) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Subject *</Label>
                <Select value={matForm.subjectId} onValueChange={val => setMatForm({ ...matForm, subjectId: val })}>
                  <SelectTrigger className="bg-slate-950 border-slate-800">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-950 border-slate-800 text-slate-100">
                    {((subjects || []) as any).map((sub: any) => (
                      <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Material Title *</Label>
                <Input value={matForm.title} onChange={e => setMatForm({ ...matForm, title: e.target.value })} placeholder="e.g. Chapter 2 Algebra Notes" className="bg-slate-950 border-slate-800" />
              </div>
              <div>
                <Label>Description</Label>
                <Input value={matForm.description} onChange={e => setMatForm({ ...matForm, description: e.target.value })} placeholder="Enter brief overview notes..." className="bg-slate-950 border-slate-800" />
              </div>
              <div className="grid gap-4 grid-cols-2">
                <div>
                  <Label>Material Type</Label>
                  <Select value={matForm.materialType} onValueChange={val => setMatForm({ ...matForm, materialType: val })}>
                    <SelectTrigger className="bg-slate-950 border-slate-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-950 border-slate-800 text-slate-100">
                      <SelectItem value="NOTES">Handwritten Notes</SelectItem>
                      <SelectItem value="PDF">PDF eBook</SelectItem>
                      <SelectItem value="WORKSHEET">Worksheet Practice</SelectItem>
                      <SelectItem value="LINK">External Website Link</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Attachment Drive URL</Label>
                  <Input value={matForm.fileAttachmentUrl} onChange={e => setMatForm({ ...matForm, fileAttachmentUrl: e.target.value })} placeholder="https://drive.google.com/..." className="bg-slate-950 border-slate-800" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 border-t border-slate-800 pt-4">
              <Button variant="outline" className="border-slate-800 hover:bg-slate-950" onClick={() => setIsMaterialOpen(false)}>Cancel</Button>
              <Button className="bg-primary hover:bg-primary/95 text-white" disabled={!matForm.classId || !matForm.subjectId || !matForm.title} onClick={() => createMatMutation.mutate(matForm)}>
                Publish Notes
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* Student Submit Assignment Dialog */}
      {submitAssignId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg border-slate-800 bg-slate-900 text-slate-100">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Upload Assignment Work</CardTitle>
              <CardDescription className="text-slate-400">Post text responses and cloud storage folders links.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Text Response (Optional)</Label>
                <Input value={submitForm.textResponse} onChange={e => setSubmitForm({ ...submitForm, textResponse: e.target.value })} placeholder="Type any notes for the teacher..." className="bg-slate-950 border-slate-800" />
              </div>
              <div>
                <Label>Submission Link / Drive URL *</Label>
                <Input value={submitForm.attachmentUrl} onChange={e => setSubmitForm({ ...submitForm, attachmentUrl: e.target.value })} placeholder="https://drive.google.com/..." className="bg-slate-950 border-slate-800" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 border-t border-slate-800 pt-4">
              <Button variant="outline" className="border-slate-800 hover:bg-slate-950" onClick={() => setSubmitAssignId(null)}>Cancel</Button>
              <Button className="bg-primary hover:bg-primary/95 text-white" disabled={!submitForm.attachmentUrl} onClick={() => submitWorkMutation.mutate({ id: submitAssignId, data: submitForm })}>
                Confirm & Submit
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* Teacher Grading Dialog */}
      {gradingSubId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg border-slate-800 bg-slate-900 text-slate-100">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Grade Student Submission</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Marks Awarded</Label>
                <Input type="number" value={gradeForm.marksAwarded} onChange={e => setGradeForm({ ...gradeForm, marksAwarded: e.target.value })} placeholder="e.g. 85" className="bg-slate-950 border-slate-800" />
              </div>
              <div>
                <Label>Teacher Feedback Notes</Label>
                <Input value={gradeForm.feedback} onChange={e => setGradeForm({ ...gradeForm, feedback: e.target.value })} placeholder="e.g. Excellent work, neat equations!" className="bg-slate-950 border-slate-800" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 border-t border-slate-800 pt-4">
              <Button variant="outline" className="border-slate-800 hover:bg-slate-950" onClick={() => setGradingSubId(null)}>Cancel</Button>
              <Button className="bg-primary hover:bg-primary/95 text-white" onClick={() => submitGradeMutation.mutate({ id: gradingSubId, data: gradeForm })}>
                Save Grade
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
