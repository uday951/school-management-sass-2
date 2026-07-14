import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { examsApi } from '@/api/exams';
import { studentsApi } from '@/api/students';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { PageLoader } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Award, BookOpen, ChevronRight, FileText, Users } from 'lucide-react';

export default function GuardianChildResultsPage() {
  // Fetch linked children list
  const { data: children, isLoading: loadingChildren } = useQuery({
    queryKey: ['guardianChildren'],
    queryFn: async () => {
      // In Phase 3/5, guardian children links are loaded from students api or profile details
      // We can fetch from school profile/students context
      const res = await apiClient.get('/guardian/profile'); // we can resolve from api
      return res.data.data.children || [];
    },
    // Fallback query if profile endpoint differs: query students directly
    retry: false
  });

  // Alternative fallback query: fetch students list to select child
  const { data: studentsFallback } = useQuery({
    queryKey: ['studentsFallbackList'],
    queryFn: () => examsApi.getTeacherMarksContexts(), // dummy query just to verify permissions
    enabled: !children || children.length === 0
  });

  const [selectedChildId, setSelectedChildId] = React.useState<string>('');

  const { data: results, isLoading: loadingList } = useQuery({
    queryKey: ['guardianChildResultsList', selectedChildId],
    queryFn: () => examsApi.getGuardianResults(selectedChildId),
    enabled: !!selectedChildId
  });

  const [selectedExamId, setSelectedExamId] = React.useState<string | null>(null);

  const { data: detailData, isLoading: loadingDetail } = useQuery({
    queryKey: ['guardianChildResultDetail', selectedChildId, selectedExamId],
    queryFn: () => examsApi.getGuardianResultDetail(selectedChildId, selectedExamId!),
    enabled: !!selectedChildId && !!selectedExamId
  });

  // Since we are running in express mockup db environment, we resolve the first child or students roster
  // Let's resolve the actual kids from the database using a custom query if children list is empty
  const { data: resolvedKids, isLoading: loadingKids } = useQuery({
    queryKey: ['resolvedGuardianKids'],
    queryFn: async () => {
      // Fetch matching student profile mappings
      try {
        const res = await apiClient.get('/guardian/children');
        return res.data.data || [];
      } catch {
        return [];
      }
    }
  });

  const activeKids = resolvedKids && resolvedKids.length > 0 ? resolvedKids : (children || []);

  React.useEffect(() => {
    if (activeKids && activeKids.length > 0 && !selectedChildId) {
      setSelectedChildId(activeKids[0].id || activeKids[0].studentId);
    }
  }, [activeKids]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-200">Children Academic Results</h1>
          <p className="text-sm text-slate-400">Select child to review published assessment totals, ranks, and scholastic performance cards.</p>
        </div>
        <Users className="w-8 h-8 text-violet-400" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left selector sidebar */}
        <div className="space-y-4 md:col-span-1">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-base">Child Selector</CardTitle>
            </CardHeader>
            <CardContent>
              <Label>Select Child</Label>
              <Select value={selectedChildId} onValueChange={(val) => {
                setSelectedChildId(val);
                setSelectedExamId(null);
              }}>
                <SelectTrigger className="bg-slate-950 border-slate-850 mt-1">
                  <SelectValue placeholder="Choose Child" />
                </SelectTrigger>
                <SelectContent className="bg-slate-950 border-slate-800 text-slate-100">
                  {activeKids.map((kid: any) => (
                    <SelectItem key={kid.id || kid.studentId} value={kid.id || kid.studentId}>
                      {kid.firstName} {kid.lastName}
                    </SelectItem>
                  ))}
                  {activeKids.length === 0 && <SelectItem value="" disabled>No linked children found</SelectItem>}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Child Exams List */}
          {selectedChildId && (
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-sm">Exam Transcripts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {loadingList ? (
                  <PageLoader />
                ) : results && results.length > 0 ? (
                  results.map((res: any) => (
                    <div 
                      key={res.id}
                      onClick={() => setSelectedExamId(res.examId)}
                      className={`flex justify-between items-center p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                        selectedExamId === res.examId 
                          ? 'bg-violet-600/10 border-violet-500' 
                          : 'bg-slate-950/40 border-slate-850 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <h4 className="font-semibold text-xs text-slate-200 truncate">{res.exam.name}</h4>
                        <p className="text-[10px] text-slate-400 mt-1">Score: {res.totalMarksObtained}/{res.totalMaximumMarks}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    </div>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 block text-center py-6">No published results</span>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Details Display Panel */}
        <div className="md:col-span-3">
          <Card className="bg-slate-900 border-slate-800 min-h-[350px]">
            {selectedExamId ? (
              loadingDetail ? (
                <PageLoader />
              ) : detailData ? (
                <>
                  <CardHeader className="flex flex-row justify-between items-start border-b border-slate-800 pb-6">
                    <div>
                      <CardTitle className="text-xl text-slate-200">{detailData.overall.exam.name}</CardTitle>
                      <CardDescription>Academic Term: {detailData.overall.exam.academicTerm?.name || 'N/A'}</CardDescription>
                    </div>
                    <div className="text-right space-y-1">
                      <span className="text-2xl font-black text-violet-400">{detailData.overall.percentage.toFixed(1)}%</span>
                      <div className="flex gap-1 justify-end">
                        <Badge className="bg-emerald-600">{detailData.overall.resultStatus}</Badge>
                        <Badge variant="outline" className="text-slate-400">Rank: {detailData.overall.rank || 'N/A'}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    {/* Scholastic Table */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-slate-200">Scholastic Area Results</h3>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Subject</TableHead>
                              <TableHead className="text-center">Max Marks</TableHead>
                              <TableHead className="text-center">Obtained Marks</TableHead>
                              <TableHead className="text-center">Percentage</TableHead>
                              <TableHead className="text-center">Grade</TableHead>
                              <TableHead className="text-right">Result</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {detailData.subjects.map((sr: any) => (
                              <TableRow key={sr.id}>
                                <TableCell className="font-semibold text-slate-200">{sr.examSubject.subject.name}</TableCell>
                                <TableCell className="text-center">{sr.maximumMarks}</TableCell>
                                <TableCell className="text-center font-bold text-indigo-400">{sr.totalMarksObtained}</TableCell>
                                <TableCell className="text-center">{sr.percentage.toFixed(1)}%</TableCell>
                                <TableCell className="text-center font-bold text-violet-400">{sr.grade || '-'}</TableCell>
                                <TableCell className="text-right">
                                  <Badge variant={sr.resultStatus === 'PASS' ? 'default' : 'destructive'} className="text-[10px]">{sr.resultStatus}</Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    {/* Scholastic and comments */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-850">
                      {detailData.coScholastic && detailData.coScholastic.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-semibold text-xs text-slate-400 uppercase">Co-Scholastic Grades</h4>
                          <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl space-y-2 text-xs">
                            {detailData.coScholastic.map((ent: any) => (
                              <div key={ent.id} className="flex justify-between border-b border-slate-900 pb-1 last:border-b-0">
                                <span className="text-slate-400">{ent.area.name}</span>
                                <span className="font-bold text-violet-400">{ent.grade}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="space-y-3">
                        <h4 className="font-semibold text-xs text-slate-400 uppercase">Attendance & Remarks</h4>
                        <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Presence Ratio:</span>
                            <span className="font-semibold">{detailData.attendance.presentDays} / {detailData.attendance.totalDays} Days ({detailData.attendance.percentage}%)</span>
                          </div>
                          {detailData.remarks && (
                            <div className="pt-2 border-t border-slate-900">
                              <span className="text-[10px] text-slate-500 font-semibold block uppercase">Remarks</span>
                              <p className="italic text-slate-300 mt-1">{detailData.remarks.classTeacherRemark || 'Good progress.'}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </>
              ) : null
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <FileText className="w-12 h-12 text-slate-700 mb-3" />
                <h3 className="text-sm font-semibold text-slate-350">Select child and exam cycle</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-[240px]">Select a student and an exam cycle from the selectors on the left.</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

// Inline apiClient import context fallback
import apiClient from '@/lib/axios';
