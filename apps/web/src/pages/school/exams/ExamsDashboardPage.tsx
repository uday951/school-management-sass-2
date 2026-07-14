import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { examsApi, type Exam, type AcademicTerm, type ExamCycle, type GradeScale, type ExamSubject, type CoScholasticArea } from '@/api/exams';
import { academicYearsApi } from '@/api/academicYears';
import { classesApi } from '@/api/classes';
import { subjectsApi } from '@/api/subjects';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { PageLoader } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  Plus, Edit, Trash2, Calendar, Target, Award, ListFilter, Lock, Unlock, 
  CheckCircle2, AlertTriangle, FileText, UserCheck, RefreshCw, Printer 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const TabsContext = React.createContext<{ value: string; onValueChange: (val: string) => void }>({ value: '', onValueChange: () => {} });

export function Tabs({ children, value, onValueChange, className }: { children: React.ReactNode; value: string; onValueChange: (val: string) => void; className?: string }) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

export function TabsTrigger({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  const { value: activeValue, onValueChange } = React.useContext(TabsContext);
  const isActive = activeValue === value;
  return (
    <button
      type="button"
      onClick={() => onValueChange(value)}
      className={`${className} ${isActive ? 'bg-violet-600 text-white font-semibold shadow' : 'text-slate-400 hover:text-slate-200'}`}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  const { value: activeValue } = React.useContext(TabsContext);
  if (activeValue !== value) return null;
  return <div className={className}>{children}</div>;
}

export function Checkbox({ checked, onCheckedChange, id, disabled, name, defaultChecked }: { checked?: boolean; onCheckedChange?: (checked: boolean) => void; id?: string; disabled?: boolean; name?: string; defaultChecked?: boolean }) {
  return (
    <input
      type="checkbox"
      id={id}
      name={name}
      checked={checked}
      defaultChecked={defaultChecked}
      disabled={disabled}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      className="w-4 h-4 rounded border-slate-800 bg-slate-900 text-violet-600 focus:ring-violet-500 focus:ring-offset-slate-900 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
    />
  );
}

export default function ExamsDashboardPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = React.useState('overview');

  // Fetch current academic year
  const { data: currentYear, isLoading: loadingYear, isError: yearError } = useQuery({
    queryKey: ['currentAcademicYear'],
    queryFn: async () => {
      const list = await academicYearsApi.list();
      return list.find(y => y.isCurrent) || list[0] || null;
    },
    retry: 1
  });

  const academicYearId = currentYear?.id || '';

  // Core Queries
  const { data: exams, isLoading: loadingExams } = useQuery({
    queryKey: ['exams', academicYearId],
    queryFn: () => examsApi.listExams(academicYearId),
    enabled: !!academicYearId
  });

  const { data: terms, isLoading: loadingTerms } = useQuery({
    queryKey: ['terms', academicYearId],
    queryFn: () => examsApi.listAcademicTerms(academicYearId),
    enabled: !!academicYearId
  });

  const { data: cycles, isLoading: loadingCycles } = useQuery({
    queryKey: ['cycles', academicYearId],
    queryFn: () => examsApi.listExamCycles(academicYearId),
    enabled: !!academicYearId
  });

  const { data: scales, isLoading: loadingScales } = useQuery({
    queryKey: ['scales'],
    queryFn: () => examsApi.listGradeScales()
  });

  const { data: classes } = useQuery({
    queryKey: ['classes'],
    queryFn: () => classesApi.listClasses()
  });

  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => subjectsApi.list()
  });

  const { data: corrections } = useQuery({
    queryKey: ['corrections'],
    queryFn: () => examsApi.listCorrectionQueue()
  });

  const { data: templates } = useQuery({
    queryKey: ['templates'],
    queryFn: () => examsApi.listReportCardTemplates()
  });

  // State for Modals
  const [isTermModalOpen, setIsTermModalOpen] = React.useState(false);
  const [editingTerm, setEditingTerm] = React.useState<AcademicTerm | null>(null);

  const [isCycleModalOpen, setIsCycleModalOpen] = React.useState(false);
  const [editingCycle, setEditingCycle] = React.useState<ExamCycle | null>(null);

  const [isExamModalOpen, setIsExamModalOpen] = React.useState(false);
  const [editingExam, setEditingExam] = React.useState<Exam | null>(null);

  const [isTargetsModalOpen, setIsTargetsModalOpen] = React.useState(false);
  const [selectedExamForTargets, setSelectedExamForTargets] = React.useState<Exam | null>(null);
  const [selectedTargets, setSelectedTargets] = React.useState<Record<string, boolean>>({});

  const [isSubjectsModalOpen, setIsSubjectsModalOpen] = React.useState(false);
  const [selectedExamForSubjects, setSelectedExamForSubjects] = React.useState<Exam | null>(null);
  const [subjectForm, setSubjectForm] = React.useState({
    subjectId: '',
    classId: '',
    maximumMarks: 100,
    passMarks: 33,
    gradingMode: 'MARKS_AND_GRADE' as 'MARKS' | 'GRADE_ONLY' | 'MARKS_AND_GRADE',
    weightage: 100
  });

  const [isScaleModalOpen, setIsScaleModalOpen] = React.useState(false);
  const [editingScale, setEditingScale] = React.useState<GradeScale | null>(null);

  const [isBoundariesModalOpen, setIsBoundariesModalOpen] = React.useState(false);
  const [selectedScaleForBoundaries, setSelectedScaleForBoundaries] = React.useState<GradeScale | null>(null);
  const [boundariesInput, setBoundariesInput] = React.useState<any[]>([]);

  const [isResultCalcOpen, setIsResultCalcOpen] = React.useState(false);
  const [selectedExamForCalc, setSelectedExamForCalc] = React.useState<Exam | null>(null);
  const [calcForm, setCalcForm] = React.useState({ classId: '', sectionId: '' });

  // ------------------------------------------
  // Term Mutations
  // ------------------------------------------
  const termMutation = useMutation({
    mutationFn: (data: any) => editingTerm 
      ? examsApi.updateAcademicTerm(editingTerm.id, data) 
      : examsApi.createAcademicTerm({ ...data, academicYearId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['terms'] });
      toast.success(editingTerm ? 'Term updated' : 'Term created');
      setIsTermModalOpen(false);
      setEditingTerm(null);
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Action failed')
  });

  // ------------------------------------------
  // Cycle Mutations
  // ------------------------------------------
  const cycleMutation = useMutation({
    mutationFn: (data: any) => editingCycle 
      ? examsApi.updateExamCycle(editingCycle.id, data) 
      : examsApi.createExamCycle({ ...data, academicYearId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cycles'] });
      toast.success(editingCycle ? 'Cycle updated' : 'Cycle created');
      setIsCycleModalOpen(false);
      setEditingCycle(null);
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Action failed')
  });

  // ------------------------------------------
  // Exam Mutations
  // ------------------------------------------
  const examMutation = useMutation({
    mutationFn: (data: any) => editingExam 
      ? examsApi.updateExam(editingExam.id, data) 
      : examsApi.createExam({ ...data, academicYearId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast.success(editingExam ? 'Exam updated' : 'Exam created');
      setIsExamModalOpen(false);
      setEditingExam(null);
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Action failed')
  });

  const archiveExamMutation = useMutation({
    mutationFn: (id: string) => examsApi.archiveExam(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast.success('Exam archived successfully');
    }
  });

  // ------------------------------------------
  // Targets Mutations
  // ------------------------------------------
  const targetsMutation = useMutation({
    mutationFn: ({ examId, targets }: { examId: string; targets: any[] }) => examsApi.setExamTargets(examId, targets),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast.success('Exam targets updated successfully');
      setIsTargetsModalOpen(false);
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to update targets')
  });

  // ------------------------------------------
  // Subject Mutations
  // ------------------------------------------
  const addSubjectMutation = useMutation({
    mutationFn: (data: any) => examsApi.addExamSubject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast.success('Exam subject mapping added');
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to add subject mapping')
  });

  const deleteSubjectMutation = useMutation({
    mutationFn: (id: string) => examsApi.deleteExamSubject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast.success('Exam subject mapping deleted');
    }
  });

  // ------------------------------------------
  // Scale & Boundaries Mutations
  // ------------------------------------------
  const scaleMutation = useMutation({
    mutationFn: (data: any) => editingScale
      ? examsApi.updateGradeScale(editingScale.id, data)
      : examsApi.createGradeScale(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scales'] });
      toast.success(editingScale ? 'Grade scale updated' : 'Grade scale created');
      setIsScaleModalOpen(false);
      setEditingScale(null);
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Action failed')
  });

  const boundariesMutation = useMutation({
    mutationFn: ({ id, boundaries }: { id: string; boundaries: any[] }) => examsApi.setGradeBoundaries(id, boundaries),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scales'] });
      toast.success('Grade boundaries updated successfully');
      setIsBoundariesModalOpen(false);
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to set boundaries')
  });

  // ------------------------------------------
  // Correction Mutations
  // ------------------------------------------
  const approveCorrection = useMutation({
    mutationFn: ({ id, comment }: { id: string; comment: string }) => examsApi.approveCorrection(id, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['corrections'] });
      toast.success('Correction approved');
    }
  });

  const rejectCorrection = useMutation({
    mutationFn: ({ id, comment }: { id: string; comment: string }) => examsApi.rejectCorrection(id, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['corrections'] });
      toast.success('Correction rejected');
    }
  });

  // ------------------------------------------
  // Calculate Results
  // ------------------------------------------
  const calculateMutation = useMutation({
    mutationFn: ({ examId, classId, sectionId }: { examId: string; classId: string; sectionId: string }) => 
      examsApi.calculateResults(examId, classId, sectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast.success('Results computed and ranked successfully');
      setIsResultCalcOpen(false);
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to compute results')
  });

  const publishMutation = useMutation({
    mutationFn: (examId: string) => examsApi.publishResults(examId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast.success('Results published successfully');
    }
  });

  const unpublishMutation = useMutation({
    mutationFn: (examId: string) => examsApi.unpublishResults(examId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast.success('Results unpublished successfully');
    }
  });

  const approveResultsMutation = useMutation({
    mutationFn: (examId: string) => examsApi.approveResults(examId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast.success('Results approved successfully');
    }
  });

  if (loadingYear) {
    return <PageLoader />;
  }

  if (yearError || !currentYear) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-violet-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">No Academic Year Found</h2>
          <p className="text-slate-400 text-sm mb-6">
            {yearError
              ? 'Could not load academic year data. Please check your connection or log in again.'
              : 'You need to set up an academic year before using the Exams module. Go to School Settings → Academic Years.'}
          </p>
          <button
            onClick={() => window.location.href = '/school/settings'}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Go to Settings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-violet-900 to-indigo-900 text-white p-6 rounded-2xl shadow-xl">
        <div>
          <h1 className="text-3xl font-bold font-sans tracking-tight">Exams & Results Workspace</h1>
          <p className="text-violet-200 mt-1">Manage term cycles, grading bounds, teacher marks, deterministic calculations, and report cardsnapshots.</p>
        </div>
        <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md">
          <Calendar className="w-5 h-5 text-violet-300" />
          <span className="font-semibold text-sm">Active Session: {currentYear.name}</span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-8 gap-2 bg-slate-900 p-2 rounded-xl border border-slate-800">
          <TabsTrigger value="overview" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white">Overview</TabsTrigger>
          <TabsTrigger value="terms" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white">Terms</TabsTrigger>
          <TabsTrigger value="cycles" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white">Cycles</TabsTrigger>
          <TabsTrigger value="exams" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white">Exams</TabsTrigger>
          <TabsTrigger value="scales" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white">Grade Scales</TabsTrigger>
          <TabsTrigger value="corrections" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white">Corrections</TabsTrigger>
          <TabsTrigger value="results" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white">Results Engine</TabsTrigger>
          <TabsTrigger value="templates" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white">Templates</TabsTrigger>
        </TabsList>

        {/* 1. OVERVIEW TAB */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-lg hover:border-violet-500/50 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-slate-400">Total Exams</CardTitle>
                <Award className="w-5 h-5 text-violet-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{exams?.length || 0}</div>
                <p className="text-xs text-slate-500 mt-1">Configured exam targets this session</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-lg hover:border-violet-500/50 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-slate-400">Terms & cycles</CardTitle>
                <Calendar className="w-5 h-5 text-indigo-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{(terms?.length || 0) + (cycles?.length || 0)}</div>
                <p className="text-xs text-slate-500 mt-1">{terms?.length || 0} terms / {cycles?.length || 0} cycles active</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-lg hover:border-violet-500/50 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-slate-400">Pending Corrections</CardTitle>
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {corrections?.filter(c => c.status === 'PENDING').length || 0}
                </div>
                <p className="text-xs text-slate-500 mt-1">Locked marks correction requests</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-lg hover:border-violet-500/50 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-slate-400">Report Templates</CardTitle>
                <FileText className="w-5 h-5 text-emerald-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{templates?.length || 0}</div>
                <p className="text-xs text-slate-500 mt-1">Branded report configurations</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="col-span-2 bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle>Active Exam Cycles</CardTitle>
                <CardDescription>Status and grading configurations for current session</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingExams ? (
                  <PageLoader />
                ) : exams && exams.length > 0 ? (
                  <div className="space-y-4">
                    {exams.map(ex => (
                      <div key={ex.id} className="flex justify-between items-center p-4 rounded-xl bg-slate-800/40 border border-slate-800">
                        <div>
                          <h4 className="font-semibold text-slate-200">{ex.name}</h4>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className="text-slate-400">{ex.examType}</Badge>
                            <Badge variant="secondary">{ex.status}</Badge>
                            <Badge variant="outline" className="text-slate-400">Results: {ex.resultStatus}</Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => {
                            setSelectedExamForCalc(ex);
                            setIsResultCalcOpen(true);
                          }}>
                            <RefreshCw className="w-4 h-5 mr-1" /> Calc
                          </Button>
                          <Link to={`/school/exams/marks-status`}>
                            <Button size="sm" variant="secondary"><Lock className="w-4 h-4 mr-1" /> Lock Status</Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No active exams" description="Go to the Exams tab to schedule academic assessments." icon={Award} />
                )}
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle>Quick Links & Portals</CardTitle>
                <CardDescription>Academic assessment portals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/school/exams/marks-entry" className="block">
                  <Button className="w-full bg-violet-600 hover:bg-violet-700 text-white py-6 rounded-xl flex justify-between px-4">
                    <span className="font-semibold text-left">Teacher Marks Entry Grid</span>
                    <Plus className="w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/school/exams/results" className="block">
                  <Button className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-6 rounded-xl flex justify-between px-4">
                    <span className="font-semibold text-left">Results Approval & Publish</span>
                    <UserCheck className="w-5 h-5 text-indigo-400" />
                  </Button>
                </Link>
                <Link to="/school/exams/co-scholastic" className="block">
                  <Button className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-6 rounded-xl flex justify-between px-4">
                    <span className="font-semibold text-left">Co-Scholastic & Remarks</span>
                    <Award className="w-5 h-5 text-emerald-400" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 2. ACADEMIC TERMS TAB */}
        <TabsContent value="terms" className="mt-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">Academic Terms</h2>
              <p className="text-sm text-slate-400">Configure school semesters, terms, or quarters</p>
            </div>
            <Button className="bg-violet-600 hover:bg-violet-700" onClick={() => {
              setEditingTerm(null);
              setIsTermModalOpen(true);
            }}>
              <Plus className="w-4 h-4 mr-2" /> Add Term
            </Button>
          </div>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              {loadingTerms ? (
                <PageLoader />
              ) : terms && terms.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date Range</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {terms.map(t => (
                      <TableRow key={t.id}>
                        <TableCell className="font-semibold text-slate-200">{t.name}</TableCell>
                        <TableCell>{t.code || '-'}</TableCell>
                        <TableCell><Badge variant="outline">{t.termType}</Badge></TableCell>
                        <TableCell>{new Date(t.startDate).toLocaleDateString()} - {new Date(t.endDate).toLocaleDateString()}</TableCell>
                        <TableCell><Badge variant={t.status === 'ACTIVE' ? 'default' : 'secondary'}>{t.status}</Badge></TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button size="icon" variant="ghost" onClick={() => {
                            setEditingTerm(t);
                            setIsTermModalOpen(true);
                          }}>
                            <Edit className="w-4 h-4 text-violet-400" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <EmptyState title="No Academic Terms" description="Click Add Term to schedule semesters / terms." icon={Calendar} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. EXAM CYCLES TAB */}
        <TabsContent value="cycles" className="mt-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">Exam Cycles</h2>
              <p className="text-sm text-slate-400">Mid-term assessments, finals, monthly tests categories</p>
            </div>
            <Button className="bg-violet-600 hover:bg-violet-700" onClick={() => {
              setEditingCycle(null);
              setIsCycleModalOpen(true);
            }}>
              <Plus className="w-4 h-4 mr-2" /> Add Cycle
            </Button>
          </div>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              {loadingCycles ? (
                <PageLoader />
              ) : cycles && cycles.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cycle Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Academic Term</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cycles.map(c => (
                      <TableRow key={c.id}>
                        <TableCell className="font-semibold text-slate-200">{c.name}</TableCell>
                        <TableCell>{c.code || '-'}</TableCell>
                        <TableCell>{c.academicTerm?.name || 'Full Year'}</TableCell>
                        <TableCell><Badge variant="outline">{c.status}</Badge></TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button size="icon" variant="ghost" onClick={() => {
                            setEditingCycle(c);
                            setIsCycleModalOpen(true);
                          }}>
                            <Edit className="w-4 h-4 text-violet-400" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <EmptyState title="No Exam Cycles" description="Create exam cycles to group assessments." icon={Target} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. EXAMS MANAGER TAB */}
        <TabsContent value="exams" className="mt-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">Exams</h2>
              <p className="text-sm text-slate-400">Configure exam instances, subjects, target classes, and assessment splits</p>
            </div>
            <Button className="bg-violet-600 hover:bg-violet-700" onClick={() => {
              setEditingExam(null);
              setIsExamModalOpen(true);
            }}>
              <Plus className="w-4 h-4 mr-2" /> Add Exam
            </Button>
          </div>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              {loadingExams ? (
                <PageLoader />
              ) : exams && exams.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Exam Name</TableHead>
                      <TableHead>Term / Cycle</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Targets</TableHead>
                      <TableHead>Subjects</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exams.map(ex => (
                      <TableRow key={ex.id}>
                        <TableCell className="font-semibold text-slate-200">{ex.name}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-xs text-slate-400">Term: {ex.academicTerm?.name || 'N/A'}</span>
                            <span className="text-xs text-slate-400">Cycle: {ex.examCycle?.name || 'N/A'}</span>
                          </div>
                        </TableCell>
                        <TableCell><Badge variant="outline">{ex.examType}</Badge></TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {ex.targets.map(t => (
                              <Badge key={t.id} variant="secondary" className="text-[10px]">
                                {t.class.name} {t.section?.name || ''}
                              </Badge>
                            ))}
                            {ex.targets.length === 0 && <span className="text-xs text-slate-500">None targeted</span>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-violet-400">{ex.subjects.length} mapped</Badge>
                        </TableCell>
                        <TableCell><Badge variant={ex.status === 'COMPLETED' ? 'default' : 'secondary'}>{ex.status}</Badge></TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button size="sm" variant="ghost" title="Edit Targets" onClick={() => {
                            setSelectedExamForTargets(ex);
                            const tMap: Record<string, boolean> = {};
                            ex.targets.forEach(t => {
                              tMap[`${t.classId}-${t.sectionId || ''}`] = true;
                            });
                            setSelectedTargets(tMap);
                            setIsTargetsModalOpen(true);
                          }}>
                            <Target className="w-4 h-4 text-indigo-400" />
                          </Button>
                          <Button size="sm" variant="ghost" title="Configure Subjects" onClick={() => {
                            setSelectedExamForSubjects(ex);
                            setIsSubjectsModalOpen(true);
                          }}>
                            <ListFilter className="w-4 h-4 text-emerald-400" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => {
                            setEditingExam(ex);
                            setIsExamModalOpen(true);
                          }}>
                            <Edit className="w-4 h-4 text-violet-400" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => archiveExamMutation.mutate(ex.id)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <EmptyState title="No exams configured" description="Click Add Exam to create your first exam structure." icon={Award} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 5. GRADE SCALES TAB */}
        <TabsContent value="scales" className="mt-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">Grading Scales</h2>
              <p className="text-sm text-slate-400">Configure HSL tailored grade boundaries, marks percentages, and GPA mappings</p>
            </div>
            <Button className="bg-violet-600 hover:bg-violet-700" onClick={() => {
              setEditingScale(null);
              setIsScaleModalOpen(true);
            }}>
              <Plus className="w-4 h-4 mr-2" /> Add Scale
            </Button>
          </div>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              {loadingScales ? (
                <PageLoader />
              ) : scales && scales.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Scale Name</TableHead>
                      <TableHead>Calculation Basis</TableHead>
                      <TableHead>Grade Ranges</TableHead>
                      <TableHead>Default</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scales.map(sc => (
                      <TableRow key={sc.id}>
                        <TableCell className="font-semibold text-slate-200">{sc.name}</TableCell>
                        <TableCell><Badge variant="outline">{sc.calculationBasis}</Badge></TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1 max-w-[400px]">
                            {sc.boundaries.map(b => (
                              <Badge key={b.id} variant="secondary" className="text-[10px]">
                                {b.grade}: {b.minimumValue}% - {b.maximumValue}% (GP: {b.gradePoint || '0'})
                              </Badge>
                            ))}
                            {sc.boundaries.length === 0 && <span className="text-xs text-slate-500">None defined</span>}
                          </div>
                        </TableCell>
                        <TableCell>{sc.isDefault ? <Badge className="bg-emerald-600">Yes</Badge> : <Badge variant="outline">No</Badge>}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button size="icon" variant="ghost" title="Set boundaries" onClick={() => {
                            setSelectedScaleForBoundaries(sc);
                            setBoundariesInput(sc.boundaries);
                            setIsBoundariesModalOpen(true);
                          }}>
                            <Target className="w-4 h-4 text-emerald-400" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => {
                            setEditingScale(sc);
                            setIsScaleModalOpen(true);
                          }}>
                            <Edit className="w-4 h-4 text-violet-400" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <EmptyState title="No Grade Scales" description="Add scales like percentage boundaries (A+, A, B, etc.)" icon={Award} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 6. CORRECTIONS TAB */}
        <TabsContent value="corrections" className="mt-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold">Locked Marks Correction Queue</h2>
            <p className="text-sm text-slate-400">Approve or reject teacher requests to edit finalized student marks</p>
          </div>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              {corrections && corrections.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Subject / Component</TableHead>
                      <TableHead>Old Mark</TableHead>
                      <TableHead>New Requested</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {corrections.map(c => (
                      <TableRow key={c.id}>
                        <TableCell className="font-semibold text-slate-200">
                          {c.marksEntry.student.firstName} {c.marksEntry.student.lastName}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm">{c.marksEntry.examSubject.subject.name}</span>
                            <span className="text-xs text-slate-400">
                              {c.marksEntry.assessmentComponent?.name || 'Direct Subject Marks'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-400">{c.oldValue !== null ? c.oldValue : 'N/A'}</TableCell>
                        <TableCell className="text-emerald-400 font-bold">{c.requestedValue !== null ? c.requestedValue : 'N/A'}</TableCell>
                        <TableCell className="max-w-[150px] truncate" title={c.reason}>{c.reason}</TableCell>
                        <TableCell><Badge variant="outline">{c.status}</Badge></TableCell>
                        <TableCell className="text-right space-x-2">
                          {c.status === 'PENDING' ? (
                            <>
                              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => {
                                const comment = prompt('Enter review approval comment:');
                                if (comment) approveCorrection.mutate({ id: c.id, comment });
                              }}>Approve</Button>
                              <Button size="sm" variant="destructive" onClick={() => {
                                const comment = prompt('Enter review rejection reason:');
                                if (comment) rejectCorrection.mutate({ id: c.id, comment });
                              }}>Reject</Button>
                            </>
                          ) : (
                            <span className="text-xs text-slate-500">Reviewed</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <EmptyState title="Corrections queue empty" description="No locked marks edit requests pending." icon={CheckCircle2} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 7. RESULTS CALCULATION TAB */}
        <TabsContent value="results" className="mt-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold">Deterministic Results Computation Engine</h2>
            <p className="text-sm text-slate-400">Trigger deterministic totals calculations, compute dense student rankings, and publish report portals</p>
          </div>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6 space-y-4">
              {exams && exams.length > 0 ? (
                exams.map(ex => (
                  <div key={ex.id} className="p-6 rounded-2xl bg-slate-800/30 border border-slate-800/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-200">{ex.name}</h3>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">Calculation: {ex.resultStatus}</Badge>
                        <Badge variant="secondary">Exam Status: {ex.status}</Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button className="bg-violet-600 hover:bg-violet-700" onClick={() => {
                        setSelectedExamForCalc(ex);
                        setIsResultCalcOpen(true);
                      }}>
                        <RefreshCw className="w-4 h-4 mr-2" /> Calculate Class Results
                      </Button>
                      
                      {ex.resultStatus === 'CALCULATED' && (
                        <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => approveResultsMutation.mutate(ex.id)}>
                          Approve Results
                        </Button>
                      )}

                      {ex.resultStatus === 'APPROVED' && (
                        <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => publishMutation.mutate(ex.id)}>
                          Publish Results
                        </Button>
                      )}

                      {ex.resultStatus === 'PUBLISHED' && (
                        <Button variant="destructive" onClick={() => unpublishMutation.mutate(ex.id)}>
                          Unpublish Results
                        </Button>
                      )}

                      <Link to={`/school/exams/results-viewer/${ex.id}`}>
                        <Button variant="secondary">View Result Grid</Button>
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState title="No active exams found" description="Configure exams to compute academic totals." icon={Award} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 8. TEMPLATES TAB */}
        <TabsContent value="templates" className="mt-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">Report Card Templates</h2>
              <p className="text-sm text-slate-400">Configure printable template settings (Logo displays, photocards, ranks, remarks, signatures)</p>
            </div>
            <Link to="/school/exams/templates/new">
              <Button className="bg-violet-600 hover:bg-violet-700">
                <Plus className="w-4 h-4 mr-2" /> Create Template
              </Button>
            </Link>
          </div>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              {templates && templates.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Template Name</TableHead>
                      <TableHead>Paper Size</TableHead>
                      <TableHead>Orientation</TableHead>
                      <TableHead>Default</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {templates.map(temp => (
                      <TableRow key={temp.id}>
                        <TableCell className="font-semibold text-slate-200">{temp.name}</TableCell>
                        <TableCell>{temp.paperSize}</TableCell>
                        <TableCell>{temp.orientation}</TableCell>
                        <TableCell>{temp.isDefault ? <Badge className="bg-emerald-600">Yes</Badge> : <Badge variant="outline">No</Badge>}</TableCell>
                        <TableCell className="text-right">
                          <Link to={`/school/exams/templates/${temp.id}`}>
                            <Button size="icon" variant="ghost"><Edit className="w-4 h-4 text-violet-400" /></Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <EmptyState title="No templates" description="Create a custom Report Card printable snapshot template." icon={FileText} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ==========================================
          MODALS / DIALOGS
          ========================================== */}
      
      {/* A. Academic Term Modal */}
      <Dialog open={isTermModalOpen} onOpenChange={setIsTermModalOpen}>
        <DialogContent className="bg-slate-950 border-slate-800 text-slate-100">
          <DialogHeader>
            <DialogTitle>{editingTerm ? 'Update Term' : 'Create Term'}</DialogTitle>
            <DialogDescription>Setup date range boundaries for terms/semesters</DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            termMutation.mutate({
              name: formData.get('name'),
              code: formData.get('code'),
              termType: formData.get('termType'),
              startDate: formData.get('startDate'),
              endDate: formData.get('endDate'),
              sortOrder: Number(formData.get('sortOrder') || 0)
            });
          }} className="space-y-4">
            <div>
              <Label htmlFor="name">Term Name</Label>
              <Input id="name" name="name" defaultValue={editingTerm?.name || ''} required className="bg-slate-900 border-slate-800 mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="code">Code (Optional)</Label>
                <Input id="code" name="code" defaultValue={editingTerm?.code || ''} className="bg-slate-900 border-slate-800 mt-1" />
              </div>
              <div>
                <Label htmlFor="termType">Term Type</Label>
                <Select name="termType" defaultValue={editingTerm?.termType || 'TERM'}>
                  <SelectTrigger className="bg-slate-900 border-slate-800 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-950 border-slate-800 text-slate-100">
                    <SelectItem value="TERM">TERM</SelectItem>
                    <SelectItem value="SEMESTER">SEMESTER</SelectItem>
                    <SelectItem value="QUARTER">QUARTER</SelectItem>
                    <SelectItem value="CUSTOM">CUSTOM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input id="startDate" name="startDate" type="date" defaultValue={editingTerm?.startDate ? new Date(editingTerm.startDate).toISOString().substring(0, 10) : ''} required className="bg-slate-900 border-slate-800 mt-1" />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input id="endDate" name="endDate" type="date" defaultValue={editingTerm?.endDate ? new Date(editingTerm.endDate).toISOString().substring(0, 10) : ''} required className="bg-slate-900 border-slate-800 mt-1" />
              </div>
            </div>
            <div>
              <Label htmlFor="sortOrder">Sort Order</Label>
              <Input id="sortOrder" name="sortOrder" type="number" defaultValue={editingTerm?.sortOrder || 0} className="bg-slate-900 border-slate-800 mt-1" />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsTermModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* B. Exam Cycle Modal */}
      <Dialog open={isCycleModalOpen} onOpenChange={setIsCycleModalOpen}>
        <DialogContent className="bg-slate-950 border-slate-800 text-slate-100">
          <DialogHeader>
            <DialogTitle>{editingCycle ? 'Update Exam Cycle' : 'Create Exam Cycle'}</DialogTitle>
            <DialogDescription>Group exams under Unit tests, Mid-Terms, etc.</DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            cycleMutation.mutate({
              name: formData.get('name'),
              code: formData.get('code'),
              description: formData.get('description'),
              academicTermId: formData.get('academicTermId') || undefined,
              startDate: formData.get('startDate') || undefined,
              endDate: formData.get('endDate') || undefined
            });
          }} className="space-y-4">
            <div>
              <Label htmlFor="name">Cycle Name</Label>
              <Input id="name" name="name" defaultValue={editingCycle?.name || ''} required className="bg-slate-900 border-slate-800 mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="code">Code (Optional)</Label>
                <Input id="code" name="code" defaultValue={editingCycle?.code || ''} className="bg-slate-900 border-slate-800 mt-1" />
              </div>
              <div>
                <Label htmlFor="academicTermId">Academic Term Link</Label>
                <Select name="academicTermId" defaultValue={editingCycle?.academicTermId || ''}>
                  <SelectTrigger className="bg-slate-900 border-slate-800 mt-1">
                    <SelectValue placeholder="Full Academic Year" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-950 border-slate-800 text-slate-100">
                    <SelectItem value="">Full Academic Year</SelectItem>
                    {terms?.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input id="startDate" name="startDate" type="date" defaultValue={editingCycle?.startDate ? new Date(editingCycle.startDate).toISOString().substring(0, 10) : ''} className="bg-slate-900 border-slate-800 mt-1" />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input id="endDate" name="endDate" type="date" defaultValue={editingCycle?.endDate ? new Date(editingCycle.endDate).toISOString().substring(0, 10) : ''} className="bg-slate-900 border-slate-800 mt-1" />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" defaultValue={editingCycle?.description || ''} className="bg-slate-900 border-slate-800 mt-1" />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsCycleModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* C. Exam Modal */}
      <Dialog open={isExamModalOpen} onOpenChange={setIsExamModalOpen}>
        <DialogContent className="bg-slate-950 border-slate-800 text-slate-100">
          <DialogHeader>
            <DialogTitle>{editingExam ? 'Update Exam' : 'Create Exam'}</DialogTitle>
            <DialogDescription>Schedule assessment instances</DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            examMutation.mutate({
              name: formData.get('name'),
              code: formData.get('code'),
              description: formData.get('description'),
              academicTermId: formData.get('academicTermId') || undefined,
              examCycleId: formData.get('examCycleId') || undefined,
              examType: formData.get('examType'),
              startDate: formData.get('startDate') || undefined,
              endDate: formData.get('endDate') || undefined
            });
          }} className="space-y-4">
            <div>
              <Label htmlFor="name">Exam Name</Label>
              <Input id="name" name="name" defaultValue={editingExam?.name || ''} required className="bg-slate-900 border-slate-800 mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="examType">Exam Type</Label>
                <Select name="examType" defaultValue={editingExam?.examType || 'FINAL'}>
                  <SelectTrigger className="bg-slate-900 border-slate-800 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-950 border-slate-800 text-slate-100">
                    <SelectItem value="UNIT_TEST">UNIT TEST</SelectItem>
                    <SelectItem value="MID_TERM">MID TERM</SelectItem>
                    <SelectItem value="FINAL">FINAL</SelectItem>
                    <SelectItem value="PRACTICAL">PRACTICAL</SelectItem>
                    <SelectItem value="INTERNAL">INTERNAL</SelectItem>
                    <SelectItem value="EXTERNAL">EXTERNAL</SelectItem>
                    <SelectItem value="CUSTOM">CUSTOM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="code">Code (Optional)</Label>
                <Input id="code" name="code" defaultValue={editingExam?.code || ''} className="bg-slate-900 border-slate-800 mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="academicTermId">Academic Term</Label>
                <Select name="academicTermId" defaultValue={editingExam?.academicTermId || ''}>
                  <SelectTrigger className="bg-slate-900 border-slate-800 mt-1">
                    <SelectValue placeholder="Full Year" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-950 border-slate-800 text-slate-100">
                    <SelectItem value="">Full Year</SelectItem>
                    {terms?.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="examCycleId">Exam Cycle Link</Label>
                <Select name="examCycleId" defaultValue={editingExam?.examCycleId || ''}>
                  <SelectTrigger className="bg-slate-900 border-slate-800 mt-1">
                    <SelectValue placeholder="No Cycle" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-950 border-slate-800 text-slate-100">
                    <SelectItem value="">No Cycle</SelectItem>
                    {cycles?.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input id="startDate" name="startDate" type="date" defaultValue={editingExam?.startDate ? new Date(editingExam.startDate).toISOString().substring(0, 10) : ''} className="bg-slate-900 border-slate-800 mt-1" />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input id="endDate" name="endDate" type="date" defaultValue={editingExam?.endDate ? new Date(editingExam.endDate).toISOString().substring(0, 10) : ''} className="bg-slate-900 border-slate-800 mt-1" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsExamModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* D. Exam Targets Modal */}
      <Dialog open={isTargetsModalOpen} onOpenChange={setIsTargetsModalOpen}>
        <DialogContent className="bg-slate-950 border-slate-800 text-slate-100 max-w-lg">
          <DialogHeader>
            <DialogTitle>Configure Target Classes for {selectedExamForTargets?.name}</DialogTitle>
            <DialogDescription>Select which school classes this exam targets</DialogDescription>
          </DialogHeader>
          <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2">
            {classes?.map(cls => (
              <div key={cls.id} className="space-y-1 p-2 rounded-lg bg-slate-900 border border-slate-850">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id={`class-${cls.id}`} 
                    checked={!!selectedTargets[`${cls.id}-`]} 
                    onCheckedChange={(checked: boolean) => {
                      setSelectedTargets(prev => {
                        const next = { ...prev };
                        if (checked) next[`${cls.id}-`] = true;
                        else delete next[`${cls.id}-`];
                        return next;
                      });
                    }}
                  />
                  <Label htmlFor={`class-${cls.id}`} className="font-semibold text-slate-200">Entire {cls.name}</Label>
                </div>
                
                {/* Sections */}
                <div className="pl-6 grid grid-cols-2 gap-2 mt-1">
                  {(cls as any).sections?.map((sec: any) => (
                    <div key={sec.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`sec-${sec.id}`}
                        checked={!!selectedTargets[`${cls.id}-${sec.id}`]}
                        onCheckedChange={(checked: boolean) => {
                          setSelectedTargets(prev => {
                            const next = { ...prev };
                            if (checked) next[`${cls.id}-${sec.id}`] = true;
                            else delete next[`${cls.id}-${sec.id}`];
                            return next;
                          });
                        }}
                      />
                      <label htmlFor={`sec-${sec.id}`} className="text-xs text-slate-300">{sec.name}</label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsTargetsModalOpen(false)}>Cancel</Button>
            <Button className="bg-violet-600 hover:bg-violet-700" onClick={() => {
              if (!selectedExamForTargets) return;
              const targetsList = Object.keys(selectedTargets).map(key => {
                const [classId, sectionId] = key.split('-');
                return { classId, sectionId: sectionId || null };
              });
              targetsMutation.mutate({ examId: selectedExamForTargets.id, targets: targetsList });
            }}>Save Targets</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* E. Exam Subjects Modal */}
      <Dialog open={isSubjectsModalOpen} onOpenChange={setIsSubjectsModalOpen}>
        <DialogContent className="bg-slate-950 border-slate-800 text-slate-100 max-w-3xl">
          <DialogHeader>
            <DialogTitle>Configure Subjects for {selectedExamForSubjects?.name}</DialogTitle>
            <DialogDescription>Map subjects, maximum marks, and sub-components splits</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Form */}
            <div className="space-y-4 bg-slate-900/50 p-4 rounded-xl border border-slate-850">
              <h3 className="font-semibold text-slate-200">Add Subject Mapping</h3>
              
              <div>
                <Label htmlFor="sub-class">Class</Label>
                <Select value={subjectForm.classId} onValueChange={(val) => setSubjectForm(p => ({ ...p, classId: val }))}>
                  <SelectTrigger id="sub-class" className="bg-slate-900 border-slate-800 mt-1">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-950 border-slate-800 text-slate-100">
                    {selectedExamForSubjects?.targets.map(t => (
                      <SelectItem key={t.class.id} value={t.class.id}>{t.class.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="sub-subject">Subject</Label>
                <Select value={subjectForm.subjectId} onValueChange={(val) => setSubjectForm(p => ({ ...p, subjectId: val }))}>
                  <SelectTrigger id="sub-subject" className="bg-slate-900 border-slate-800 mt-1">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-950 border-slate-800 text-slate-100">
                    {subjects?.map((s: any) => (
                      <SelectItem key={s.id} value={s.id}>{s.name} ({s.code})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="max-marks">Max Marks</Label>
                  <Input id="max-marks" type="number" value={subjectForm.maximumMarks} onChange={(e) => setSubjectForm(p => ({ ...p, maximumMarks: Number(e.target.value) }))} className="bg-slate-900 border-slate-800 mt-1" />
                </div>
                <div>
                  <Label htmlFor="pass-marks">Pass Marks</Label>
                  <Input id="pass-marks" type="number" value={subjectForm.passMarks} onChange={(e) => setSubjectForm(p => ({ ...p, passMarks: Number(e.target.value) }))} className="bg-slate-900 border-slate-800 mt-1" />
                </div>
              </div>

              <Button className="w-full bg-violet-600 hover:bg-violet-700" onClick={() => {
                if (!selectedExamForSubjects) return;
                addSubjectMutation.mutate({
                  examId: selectedExamForSubjects.id,
                  ...subjectForm
                });
              }}>Add Subject</Button>
            </div>

            {/* List */}
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-200">Mapped Subjects</h3>
              <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
                {selectedExamForSubjects?.subjects.map(es => (
                  <div key={es.id} className="flex justify-between items-center p-3 rounded-lg bg-slate-900 border border-slate-850">
                    <div>
                      <h4 className="font-semibold text-xs text-slate-200">{es.subject.name}</h4>
                      <p className="text-[10px] text-slate-400">Class: {es.class.name}</p>
                      <p className="text-[10px] text-violet-400">Max: {es.maximumMarks} | Pass: {es.passMarks}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => {
                        const compString = prompt('Enter components JSON (e.g. [{"name":"Written","componentType":"THEORY","maximumMarks":80},{"name":"Practical","componentType":"PRACTICAL","maximumMarks":20}])');
                        if (compString) {
                          try {
                            const comps = JSON.parse(compString);
                            examsApi.setAssessmentComponents(es.id, comps).then(() => {
                              queryClient.invalidateQueries({ queryKey: ['exams'] });
                              toast.success('Components configured');
                            }).catch(err => toast.error(err?.message || 'Setup components failed'));
                          } catch {
                            toast.error('Invalid JSON format');
                          }
                        }
                      }} title="Setup Components">
                        <Plus className="w-4 h-4 text-emerald-400" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => deleteSubjectMutation.mutate(es.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
                {selectedExamForSubjects?.subjects.length === 0 && (
                  <span className="text-xs text-slate-500 block text-center py-6">No subjects mapped</span>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* F. Grade Scale Modal */}
      <Dialog open={isScaleModalOpen} onOpenChange={setIsScaleModalOpen}>
        <DialogContent className="bg-slate-950 border-slate-800 text-slate-100">
          <DialogHeader>
            <DialogTitle>{editingScale ? 'Update Scale' : 'Create Scale'}</DialogTitle>
            <DialogDescription>Define calculation mode (Percentage vs GPA)</DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            scaleMutation.mutate({
              name: formData.get('name'),
              description: formData.get('description'),
              calculationBasis: formData.get('calculationBasis'),
              isDefault: formData.get('isDefault') === 'on'
            });
          }} className="space-y-4">
            <div>
              <Label htmlFor="scale-name">Scale Name</Label>
              <Input id="scale-name" name="name" defaultValue={editingScale?.name || ''} required className="bg-slate-900 border-slate-800 mt-1" />
            </div>
            <div>
              <Label htmlFor="calculationBasis">Basis</Label>
              <Select name="calculationBasis" defaultValue={editingScale?.calculationBasis || 'PERCENTAGE'}>
                <SelectTrigger className="bg-slate-900 border-slate-800 mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-950 border-slate-800 text-slate-100">
                  <SelectItem value="PERCENTAGE">PERCENTAGE</SelectItem>
                  <SelectItem value="MARKS">MARKS</SelectItem>
                  <SelectItem value="GPA">GPA</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="scale-desc">Description</Label>
              <Input id="scale-desc" name="description" defaultValue={editingScale?.description || ''} className="bg-slate-900 border-slate-800 mt-1" />
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox id="isDefault" name="isDefault" defaultChecked={editingScale?.isDefault} />
              <Label htmlFor="isDefault">Set as Default Scale</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsScaleModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* G. Grade Boundaries Modal */}
      <Dialog open={isBoundariesModalOpen} onOpenChange={setIsBoundariesModalOpen}>
        <DialogContent className="bg-slate-950 border-slate-800 text-slate-100 max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configure Boundaries for {selectedScaleForBoundaries?.name}</DialogTitle>
            <DialogDescription>Define non-overlapping grade thresholds (e.g. A+ = 90-100%)</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
            {boundariesInput.map((b, idx) => (
              <div key={idx} className="grid grid-cols-5 gap-2 items-end bg-slate-900 p-2 rounded-lg border border-slate-850">
                <div>
                  <Label className="text-xs">Grade</Label>
                  <Input value={b.grade} onChange={(e) => {
                    const next = [...boundariesInput];
                    next[idx].grade = e.target.value;
                    setBoundariesInput(next);
                  }} className="bg-slate-950 border-slate-800 mt-1 text-xs" />
                </div>
                <div>
                  <Label className="text-xs">Min Value (%)</Label>
                  <Input type="number" value={b.minimumValue} onChange={(e) => {
                    const next = [...boundariesInput];
                    next[idx].minimumValue = Number(e.target.value);
                    setBoundariesInput(next);
                  }} className="bg-slate-950 border-slate-800 mt-1 text-xs" />
                </div>
                <div>
                  <Label className="text-xs">Max Value (%)</Label>
                  <Input type="number" value={b.maximumValue} onChange={(e) => {
                    const next = [...boundariesInput];
                    next[idx].maximumValue = Number(e.target.value);
                    setBoundariesInput(next);
                  }} className="bg-slate-950 border-slate-800 mt-1 text-xs" />
                </div>
                <div>
                  <Label className="text-xs">GP</Label>
                  <Input type="number" step="0.1" value={b.gradePoint || 0} onChange={(e) => {
                    const next = [...boundariesInput];
                    next[idx].gradePoint = Number(e.target.value);
                    setBoundariesInput(next);
                  }} className="bg-slate-950 border-slate-800 mt-1 text-xs" />
                </div>
                <Button variant="ghost" className="text-red-500 hover:bg-red-900/20" onClick={() => {
                  setBoundariesInput(p => p.filter((_, i) => i !== idx));
                }}><Trash2 className="w-4 h-4" /></Button>
              </div>
            ))}
            <Button variant="outline" className="w-full text-xs" onClick={() => {
              setBoundariesInput(p => [...p, { grade: '', minimumValue: 0, maximumValue: 100, gradePoint: 0, sortOrder: p.length }]);
            }}><Plus className="w-4 h-4 mr-2" /> Add Range row</Button>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsBoundariesModalOpen(false)}>Cancel</Button>
            <Button className="bg-violet-600 hover:bg-violet-700" onClick={() => {
              if (!selectedScaleForBoundaries) return;
              boundariesMutation.mutate({ id: selectedScaleForBoundaries.id, boundaries: boundariesInput });
            }}>Save Boundaries</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* H. Result Calculation Selection Modal */}
      <Dialog open={isResultCalcOpen} onOpenChange={setIsResultCalcOpen}>
        <DialogContent className="bg-slate-950 border-slate-800 text-slate-100">
          <DialogHeader>
            <DialogTitle>Calculate Results for {selectedExamForCalc?.name}</DialogTitle>
            <DialogDescription>Trigger deterministic results calculation & rankings for a specific class section</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Class</Label>
              <Select value={calcForm.classId} onValueChange={(val) => setCalcForm(p => ({ ...p, classId: val }))}>
                <SelectTrigger className="bg-slate-900 border-slate-800 mt-1">
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent className="bg-slate-950 border-slate-800 text-slate-100">
                  {selectedExamForCalc?.targets.map(t => (
                    <SelectItem key={t.class.id} value={t.class.id}>{t.class.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {calcForm.classId && (
              <div>
                <Label>Section</Label>
                <Select value={calcForm.sectionId} onValueChange={(val) => setCalcForm(p => ({ ...p, sectionId: val }))}>
                  <SelectTrigger className="bg-slate-900 border-slate-800 mt-1">
                    <SelectValue placeholder="Select Section" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-950 border-slate-800 text-slate-100">
                    {(classes?.find(c => c.id === calcForm.classId) as any)?.sections?.map((sec: any) => (
                      <SelectItem key={sec.id} value={sec.id}>{sec.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsResultCalcOpen(false)}>Cancel</Button>
            <Button className="bg-violet-600 hover:bg-violet-700" onClick={() => {
              if (!selectedExamForCalc || !calcForm.classId || !calcForm.sectionId) {
                toast.error('Please select both class and section');
                return;
              }
              calculateMutation.mutate({
                examId: selectedExamForCalc.id,
                classId: calcForm.classId,
                sectionId: calcForm.sectionId
              });
            }}>Compute Results</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
