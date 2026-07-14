import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { examsApi } from '@/api/exams';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageLoader } from '@/components/LoadingSpinner';
import { Printer, ArrowLeft, ShieldAlert } from 'lucide-react';

export default function ReportCardPreviewPage() {
  const { examId, studentId, templateId } = useParams<{ examId: string; studentId: string; templateId: string }>();
  const [searchParams] = useSearchParams();
  const schoolId = searchParams.get('schoolId') || '';

  const { data: previewData, isLoading, error } = useQuery({
    queryKey: ['reportCardPreview', examId, studentId, templateId],
    queryFn: () => examsApi.previewReportCard({
      examId: examId!,
      studentId: studentId!,
      templateId: templateId!
    }),
    enabled: !!examId && !!studentId && !!templateId
  });

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return <PageLoader />;
  }

  if (error || !previewData) {
    return (
      <div className="container mx-auto p-12 text-center space-y-4">
        <ShieldAlert className="w-16 h-16 text-red-500 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-200">Failed to load report card preview</h2>
        <p className="text-slate-400">Please make sure result calculations have been computed for this student first.</p>
        <Link to="/school/exams">
          <Button className="bg-violet-600 hover:bg-violet-750">Return to Workspace</Button>
        </Link>
      </div>
    );
  }

  const { student, overallResult, subjectResults, remarks, coScholastic, attendance, templateSettings } = previewData;

  return (
    <div className="min-h-screen bg-slate-950 p-6 print:bg-white print:p-0">
      {/* Control bar (Hidden on Print) */}
      <div className="container mx-auto max-w-4xl bg-slate-900 border border-slate-800 p-4 rounded-2xl flex justify-between items-center mb-6 print:hidden">
        <Link to="/school/exams">
          <Button variant="ghost" className="text-slate-350">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to workspace
          </Button>
        </Link>
        <Button className="bg-violet-600 hover:bg-violet-700 text-white font-semibold" onClick={handlePrint}>
          <Printer className="w-4 h-4 mr-2" /> Print / Save PDF
        </Button>
      </div>

      {/* Printable Report Card Frame */}
      <div className="container mx-auto max-w-4xl bg-white text-slate-900 p-10 rounded-xl shadow-2xl border border-slate-200 print:shadow-none print:border-none print:p-0 print:m-0 font-sans">
        
        {/* School Branding Header */}
        <div className="flex justify-between items-start border-b-2 border-violet-900 pb-6 mb-6">
          <div className="space-y-2">
            {templateSettings.showLogo && previewData.schoolLogo && (
              <img src={previewData.schoolLogo} alt="School Logo" className="w-16 h-16 object-contain" />
            )}
            <h1 className="text-2xl font-extrabold tracking-tight text-violet-950 uppercase">{previewData.schoolName}</h1>
            {templateSettings.showAddress && (
              <p className="text-xs text-slate-600 max-w-md">{previewData.schoolAddress}</p>
            )}
            <p className="text-[10px] text-slate-500 font-medium">{previewData.schoolContact}</p>
          </div>
          <div className="text-right space-y-1">
            <Badge className="bg-violet-950 text-white font-bold py-1 px-3 uppercase text-xs">ACADEMIC REPORT CARD</Badge>
            <p className="text-xs font-semibold text-slate-700 mt-2">Academic Session: {student.academicYear}</p>
            <p className="text-xs text-slate-600 font-medium">Exam: {previewData.examName}</p>
          </div>
        </div>

        {/* Student Profile Block */}
        <div className="grid grid-cols-3 gap-6 bg-slate-50 p-5 rounded-lg border border-slate-200 mb-6">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Student Name</span>
            <span className="font-bold text-slate-800 text-base">{student.firstName} {student.lastName}</span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Class & Section</span>
            <span className="font-semibold text-slate-700">{student.class} - {student.section}</span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Admission No</span>
            <span className="font-semibold text-slate-700">{student.admissionNumber}</span>
          </div>
          {templateSettings.showRollNumber && (
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Roll Number</span>
              <span className="font-semibold text-slate-750">{student.rollNumber || '-'}</span>
            </div>
          )}
          {templateSettings.showDateOfBirth && (
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Date of Birth</span>
              <span className="font-semibold text-slate-700">
                {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : '-'}
              </span>
            </div>
          )}
        </div>

        {/* Scholastic Assessment Results Table */}
        <div className="space-y-2 mb-6">
          <h3 className="text-sm font-extrabold text-violet-950 uppercase tracking-wider">I. Scholastic Areas</h3>
          <table className="w-full text-left border-collapse border border-slate-200">
            <thead>
              <tr className="bg-slate-100 text-[10px] text-slate-700 uppercase font-bold border-b border-slate-200">
                <th className="p-3 border-r border-slate-200">Subject</th>
                <th className="p-3 border-r border-slate-200 text-center">Max Marks</th>
                <th className="p-3 border-r border-slate-200 text-center">Marks Obtained</th>
                {templateSettings.showPercentage && <th className="p-3 border-r border-slate-200 text-center">Percentage</th>}
                {templateSettings.showGrades && <th className="p-3 border-r border-slate-200 text-center">Grade</th>}
                <th className="p-3 text-center">Result</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {subjectResults.map((sr: any) => (
                <tr key={sr.id} className="border-b border-slate-200 hover:bg-slate-50/50">
                  <td className="p-3 border-r border-slate-250 font-bold text-slate-800">{sr.examSubject.subject.name}</td>
                  <td className="p-3 border-r border-slate-200 text-center">{sr.maximumMarks}</td>
                  <td className="p-3 border-r border-slate-200 text-center font-semibold">{sr.totalMarksObtained}</td>
                  {templateSettings.showPercentage && (
                    <td className="p-3 border-r border-slate-200 text-center">{sr.percentage.toFixed(1)}%</td>
                  )}
                  {templateSettings.showGrades && (
                    <td className="p-3 border-r border-slate-200 text-center font-bold text-violet-850">{sr.grade || '-'}</td>
                  )}
                  <td className="p-3 text-center">
                    <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                      sr.resultStatus === 'PASS' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>{sr.resultStatus}</span>
                  </td>
                </tr>
              ))}

              {/* Totals Summary Row */}
              <tr className="bg-slate-100 font-bold border-t border-slate-300">
                <td className="p-3 border-r border-slate-200 text-violet-950 uppercase text-xs">Total Marks / Percent</td>
                <td className="p-3 border-r border-slate-200 text-center">{overallResult.totalMaximumMarks}</td>
                <td className="p-3 border-r border-slate-200 text-center">{overallResult.totalMarksObtained}</td>
                {templateSettings.showPercentage && (
                  <td className="p-3 border-r border-slate-200 text-center text-violet-900">{overallResult.percentage.toFixed(1)}%</td>
                )}
                {templateSettings.showGrades && (
                  <td className="p-3 border-r border-slate-200 text-center font-bold text-violet-900">{overallResult.overallGrade || '-'}</td>
                )}
                <td className="p-3 text-center">
                  <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                    overallResult.resultStatus === 'PASS' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}>{overallResult.resultStatus}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Co-Scholastic & Ranks Block */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Scholastic grades list */}
          {coScholastic && coScholastic.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-extrabold text-violet-950 uppercase tracking-wider">II. Co-Scholastic Grades</h3>
              <table className="w-full text-left border border-slate-200">
                <thead>
                  <tr className="bg-slate-100 text-[10px] text-slate-700 uppercase font-bold border-b border-slate-200">
                    <th className="p-2 border-r border-slate-200">Activity Area</th>
                    <th className="p-2 text-center">Grade</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {coScholastic.map((ent: any) => (
                    <tr key={ent.id} className="border-b border-slate-200">
                      <td className="p-2 border-r border-slate-200 text-slate-700">{ent.area.name}</td>
                      <td className="p-2 text-center font-bold text-violet-900">{ent.grade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Ranks & Attendance Info block */}
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-extrabold text-violet-950 uppercase tracking-wider">III. Attendance & Ranks</h3>
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg space-y-2 text-xs">
                {templateSettings.showAttendance && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Period Presence:</span>
                    <span className="font-semibold text-slate-800">
                      {attendance.presentDays} / {attendance.totalDays} Days ({attendance.percentage}%)
                    </span>
                  </div>
                )}
                {templateSettings.showRank && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Class Rank:</span>
                    <span className="font-semibold text-slate-850">
                      {overallResult.rank || 'N/A'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Remarks Section */}
        <div className="grid grid-cols-2 gap-6 border-t border-slate-200 pt-6 mb-12">
          {templateSettings.showTeacherRemarks && (
            <div className="space-y-2">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Class Teacher Remarks</span>
              <p className="text-xs text-slate-700 italic border-l-2 border-slate-300 pl-3 min-h-[50px]">
                {remarks?.classTeacherRemark || 'Performance is satisfactory.'}
              </p>
            </div>
          )}
          {templateSettings.showPrincipalRemarks && (
            <div className="space-y-2">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Principal Remarks</span>
              <p className="text-xs text-slate-700 italic border-l-2 border-slate-300 pl-3 min-h-[50px]">
                {remarks?.principalRemark || 'Promoted to next class session.'}
              </p>
            </div>
          )}
        </div>

        {/* Signatures & branding footer */}
        {templateSettings.showSignatureAreas && (
          <div className="grid grid-cols-3 gap-6 text-center text-xs text-slate-600 pt-6">
            <div className="space-y-10">
              <div className="border-t border-slate-400 pt-2 font-medium">Class Teacher Signature</div>
            </div>
            <div className="space-y-10">
              <div className="border-t border-slate-400 pt-2 font-medium">Principal Signature</div>
            </div>
            <div className="space-y-10">
              <div className="border-t border-slate-400 pt-2 font-medium">Parent Acknowledgment</div>
            </div>
          </div>
        )}

        {/* Footer text */}
        {templateSettings.footerText && (
          <div className="text-center text-[10px] text-slate-500 mt-12 border-t border-slate-100 pt-4">
            {templateSettings.footerText}
          </div>
        )}

      </div>
    </div>
  );
}
