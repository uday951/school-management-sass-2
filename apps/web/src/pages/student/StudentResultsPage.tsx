import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { examsApi } from '@/api/exams';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageLoader } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Award, BookOpen, Calendar, ChevronRight, FileText, ArrowLeft, Printer } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function StudentResultsPage() {
  const { data: results, isLoading: loadingList } = useQuery({
    queryKey: ['studentResultsList'],
    queryFn: () => examsApi.getStudentResults()
  });

  const [selectedExamId, setSelectedExamId] = React.useState<string | null>(null);

  const { data: detailData, isLoading: loadingDetail } = useQuery({
    queryKey: ['studentResultDetail', selectedExamId],
    queryFn: () => examsApi.getStudentResultDetail(selectedExamId!),
    enabled: !!selectedExamId
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-200">My Academic Results</h1>
          <p className="text-sm text-slate-400">View your published assessment marks, grading scales, teacher remarks, and reports cards.</p>
        </div>
        <BookOpen className="w-8 h-8 text-violet-400" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Results List */}
        <Card className="bg-slate-900 border-slate-800 md:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Published Exam Results</CardTitle>
            <CardDescription>Select an exam to view detailed transcript</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loadingList ? (
              <PageLoader />
            ) : results && results.length > 0 ? (
              results.map((res: any) => (
                <div 
                  key={res.id} 
                  onClick={() => setSelectedExamId(res.examId)}
                  className={`flex justify-between items-center p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                    selectedExamId === res.examId 
                      ? 'bg-violet-600/10 border-violet-500' 
                      : 'bg-slate-950/40 border-slate-850 hover:bg-slate-800/40'
                  }`}
                >
                  <div>
                    <h4 className="font-semibold text-slate-200">{res.exam.name}</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Score: <span className="font-bold text-violet-400">{res.totalMarksObtained}/{res.totalMaximumMarks}</span>
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-500" />
                </div>
              ))
            ) : (
              <EmptyState title="No published results" description="Your exam results will appear here once officially published by the school admin." icon={Award} />
            )}
          </CardContent>
        </Card>

        {/* Results Details Display */}
        <Card className="bg-slate-900 border-slate-800 md:col-span-2">
          {selectedExamId ? (
            loadingDetail ? (
              <PageLoader />
            ) : detailData ? (
              <>
                <CardHeader className="flex flex-row justify-between items-start border-b border-slate-800 pb-6">
                  <div>
                    <CardTitle className="text-xl text-slate-200">{detailData.overall.exam.name}</CardTitle>
                    <CardDescription>Published Date: {new Date(detailData.overall.publishedAt).toLocaleDateString()}</CardDescription>
                  </div>
                  <div className="text-right space-y-1">
                    <span className="text-2xl font-black text-violet-400">{detailData.overall.percentage.toFixed(1)}%</span>
                    <div className="flex gap-1 justify-end">
                      <Badge className="bg-emerald-600">{detailData.overall.resultStatus}</Badge>
                      <Badge variant="outline" className="text-slate-400">Grade: {detailData.overall.overallGrade || '-'}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {/* Scholastic Grades */}
                  <div className="space-y-3">
                    <h3 className="font-bold text-slate-300 flex items-center gap-2"><Award className="w-5 h-5 text-violet-400" /> Subject Grades</h3>
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

                  {/* Co-Scholastic & Attendance grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Co-scholastic */}
                    {detailData.coScholastic && detailData.coScholastic.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="font-bold text-slate-300">Co-Scholastic Areas</h3>
                        <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-850 space-y-2 text-xs">
                          {detailData.coScholastic.map((ent: any) => (
                            <div key={ent.id} className="flex justify-between border-b border-slate-900 pb-1 last:border-b-0">
                              <span className="text-slate-400">{ent.area.name}</span>
                              <span className="font-bold text-violet-400">{ent.grade}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Attendance and Remarks summary */}
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <h3 className="font-bold text-slate-300">Attendance Summary</h3>
                        <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-850 text-xs flex justify-between items-center">
                          <span className="text-slate-400">Total days present:</span>
                          <span className="font-semibold text-slate-200">
                            {detailData.attendance.presentDays} / {detailData.attendance.totalDays} Days ({detailData.attendance.percentage}%)
                          </span>
                        </div>
                      </div>
                      
                      {detailData.remarks && (
                        <div className="space-y-2">
                          <h3 className="font-bold text-xs text-slate-400">Class Teacher Remarks</h3>
                          <p className="text-xs text-slate-355 italic border-l-2 border-slate-800 pl-3">
                            {detailData.remarks.classTeacherRemark || 'Satisfactory performance.'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </>
            ) : null
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <FileText className="w-12 h-12 text-slate-700 mb-3" />
              <h3 className="text-sm font-semibold text-slate-300">No assessment selected</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-[240px]">Select an exam cycle on the left sidebar pane to inspect full transcripts.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
