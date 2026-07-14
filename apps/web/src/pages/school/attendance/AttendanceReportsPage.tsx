import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { attendanceApi } from '@/api/attendance';
import { academicYearsApi } from '@/api/academicYears';
import { classesApi } from '@/api/classes';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Calendar, AlertTriangle, Users, FileSpreadsheet, Info, Download } from 'lucide-react';
import { PageLoader } from '@/components/LoadingSpinner';
import { toast } from 'sonner';

export default function AttendanceReportsPage() {
  const [activeTab, setActiveTab] = React.useState<'class' | 'low' | 'absentees'>('class');

  // Filters state
  const [selectedYear, setSelectedYear] = React.useState('');
  const [selectedClass, setSelectedClass] = React.useState('');
  const [selectedSection, setSelectedSection] = React.useState('');
  const [startDate, setStartDate] = React.useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = React.useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [absenteeDate, setAbsenteeDate] = React.useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Queries
  const { data: years } = useQuery({
    queryKey: ['academicYearsList'],
    queryFn: academicYearsApi.list
  });

  const { data: classesList } = useQuery({
    queryKey: ['classesList'],
    queryFn: classesApi.listClasses
  });

  const { data: sectionsList } = useQuery({
    queryKey: ['sectionsList', selectedClass],
    queryFn: () => classesApi.listSections(selectedClass),
    enabled: !!selectedClass
  });

  // Auto-select defaults
  React.useEffect(() => {
    if (years && years.length > 0 && !selectedYear) {
      const active = years.find((y: any) => y.isCurrent) || years[0];
      setSelectedYear(active.id);
    }
  }, [years, selectedYear]);

  React.useEffect(() => {
    if (classesList && classesList.length > 0 && !selectedClass) {
      setSelectedClass(classesList[0].id);
    }
  }, [classesList, selectedClass]);

  React.useEffect(() => {
    if (sectionsList && sectionsList.length > 0) {
      setSelectedSection(sectionsList[0].id);
    } else {
      setSelectedSection('');
    }
  }, [sectionsList]);

  // Main reports queries
  const { data: classReport, isLoading: loadingClass } = useQuery({
    queryKey: ['classReport', selectedYear, selectedClass, selectedSection, startDate, endDate],
    queryFn: () =>
      attendanceApi.getClassReport({
        academicYearId: selectedYear,
        classId: selectedClass,
        sectionId: selectedSection,
        startDate,
        endDate
      }),
    enabled: activeTab === 'class' && !!selectedYear && !!selectedClass && !!selectedSection
  });

  const { data: lowList, isLoading: loadingLow } = useQuery({
    queryKey: ['lowAttendanceReport', selectedYear],
    queryFn: () => attendanceApi.getLowAttendance(selectedYear),
    enabled: activeTab === 'low' && !!selectedYear
  });

  const { data: absenteesList, isLoading: loadingAbsentees } = useQuery({
    queryKey: ['absenteesReport', absenteeDate],
    queryFn: () => attendanceApi.getAbsentees(absenteeDate),
    enabled: activeTab === 'absentees' && !!absenteeDate
  });

  // CSV Export utility
  const exportToCSV = (data: any[], filename: string, headers: string[], keys: string[]) => {
    if (!data || data.length === 0) {
      toast.error('No report data available to export');
      return;
    }

    // Escape formulas using safe quoting
    const escapeCSV = (val: any) => {
      if (val === null || val === undefined) return '';
      let str = String(val);
      if (str.startsWith('=') || str.startsWith('+') || str.startsWith('-') || str.startsWith('@')) {
        str = `'${str}`; // Prefix with single quote to prevent injection
      }
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csvRows = [];
    csvRows.push(headers.join(','));

    for (const item of data) {
      const values = keys.map(k => {
        const parts = k.split('.');
        let val = item;
        for (const p of parts) {
          val = val?.[p];
        }
        return escapeCSV(val);
      });
      csvRows.push(values.join(','));
    }

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`${filename}.csv exported successfully!`);
  };

  const handleExportClassReport = () => {
    if (!classReport) return;
    const headers = ['Roll No', 'Admission No', 'First Name', 'Last Name', 'Present', 'Absent', 'Late', 'Half Day', 'Percentage'];
    const keys = ['rollNumber', 'admissionNumber', 'firstName', 'lastName', 'present', 'absent', 'late', 'halfDay', 'percentage'];
    exportToCSV(classReport, 'Class_Attendance_Report', headers, keys);
  };

  const handleExportLowAttendance = () => {
    if (!lowList) return;
    const headers = ['Admission No', 'Name', 'Class', 'Section', 'Percentage %', 'Finalized Sessions'];
    const keys = ['admissionNumber', 'firstName', 'className', 'sectionName', 'percentage', 'denominator'];
    exportToCSV(lowList, 'Low_Attendance_Alerts', headers, keys);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-100">Attendance Reports</h1>
        <p className="text-sm text-slate-400">Class registers, absent trends, and low-attendance triggers</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-4">
        {(['class', 'low', 'absentees'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 text-sm font-semibold border-b-2 px-1 transition-all capitalize
              ${activeTab === tab ? 'border-indigo-500 text-indigo-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'}
            `}
          >
            {tab === 'class' && 'Class Grid Summary'}
            {tab === 'low' && 'Low Attendance (<75%)'}
            {tab === 'absentees' && 'Daily Absentee List'}
          </button>
        ))}
      </div>

      {/* Filters Area */}
      <div className="grid gap-4 md:grid-cols-4 bg-slate-900/40 p-4 rounded-xl border border-slate-800">
        {activeTab !== 'absentees' && (
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Academic Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full rounded-md border border-slate-800 bg-slate-950 p-2 text-sm text-slate-100 outline-none"
            >
              {years?.map((y: any) => (
                <option key={y.id} value={y.id}>{y.name} {y.isCurrent ? '(Current)' : ''}</option>
              ))}
            </select>
          </div>
        )}

        {activeTab === 'class' && (
          <>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Class</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full rounded-md border border-slate-800 bg-slate-950 p-2 text-sm text-slate-100 outline-none"
              >
                {classesList?.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Section</label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full rounded-md border border-slate-800 bg-slate-950 p-2 text-sm text-slate-100 outline-none"
              >
                <option value="">-- select section --</option>
                {sectionsList?.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date Range</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  style={{ colorScheme: 'dark' }}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="rounded-md border border-slate-800 bg-slate-950 p-2 text-xs text-slate-100 outline-none w-1/2"
                />
                <input
                  type="date"
                  style={{ colorScheme: 'dark' }}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="rounded-md border border-slate-800 bg-slate-950 p-2 text-xs text-slate-100 outline-none w-1/2"
                />
              </div>
            </div>
          </>
        )}

        {activeTab === 'absentees' && (
          <div className="space-y-1.5 col-span-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Date</label>
            <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 w-full">
              <Calendar className="h-4 w-4 text-indigo-400" />
              <input
                type="date"
                style={{ colorScheme: 'dark' }}
                value={absenteeDate}
                onChange={(e) => setAbsenteeDate(e.target.value)}
                className="bg-transparent text-sm text-slate-100 outline-none w-full"
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Table Context */}
      {activeTab === 'class' && (
        <Card className="border-slate-800 bg-slate-900/50 text-slate-100">
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle className="text-lg font-bold text-slate-200">Class Performance Grid</CardTitle>
            <Button
              onClick={handleExportClassReport}
              disabled={loadingClass || !classReport || classReport.length === 0}
              variant="outline"
              size="sm"
              className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 gap-2"
            >
              <Download className="h-4 w-4" /> Export CSV
            </Button>
          </CardHeader>
          <CardContent>
            {loadingClass ? (
              <div className="py-12 flex justify-center"><PageLoader /></div>
            ) : classReport && classReport.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-950 text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-3">Roll No</th>
                      <th className="px-6 py-3">Name</th>
                      <th className="px-6 py-3 text-center">P</th>
                      <th className="px-6 py-3 text-center">A</th>
                      <th className="px-6 py-3 text-center">L</th>
                      <th className="px-6 py-3 text-center">H</th>
                      <th className="px-6 py-3 text-center">Leave</th>
                      <th className="px-6 py-3 text-center">Excused</th>
                      <th className="px-6 py-3 text-right">Attendance %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {classReport.map((row: any) => (
                      <tr key={row.studentId} className="hover:bg-slate-900/30">
                        <td className="px-6 py-4">{row.rollNumber}</td>
                        <td className="px-6 py-4 font-bold text-slate-200">{row.firstName} {row.lastName}</td>
                        <td className="px-6 py-4 text-center text-emerald-400 font-semibold">{row.present}</td>
                        <td className="px-6 py-4 text-center text-rose-400 font-semibold">{row.absent}</td>
                        <td className="px-6 py-4 text-center text-amber-400">{row.late}</td>
                        <td className="px-6 py-4 text-center text-blue-400">{row.halfDay}</td>
                        <td className="px-6 py-4 text-center text-slate-400">{row.leave}</td>
                        <td className="px-6 py-4 text-center text-slate-400">{row.excused}</td>
                        <td className={`px-6 py-4 text-right font-black
                          ${row.percentage >= 75 ? 'text-emerald-400' : 'text-rose-400'}
                        `}>
                          {row.percentage}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 flex flex-col items-center gap-2">
                <Info className="h-8 w-8 text-slate-600" />
                Select Academic Year, Class, Section, and click Filter to compile grid.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'low' && (
        <Card className="border-slate-800 bg-slate-900/50 text-slate-100">
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle className="text-lg font-bold text-rose-300">Chronic Low Attendance Detection</CardTitle>
            <Button
              onClick={handleExportLowAttendance}
              disabled={loadingLow || !lowList || lowList.length === 0}
              variant="outline"
              size="sm"
              className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 gap-2"
            >
              <Download className="h-4 w-4" /> Export CSV
            </Button>
          </CardHeader>
          <CardContent>
            {loadingLow ? (
              <div className="py-12 flex justify-center"><PageLoader /></div>
            ) : lowList && lowList.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {lowList.map((student: any) => (
                  <div key={student.studentId} className="border border-rose-500/25 bg-rose-500/5 p-4 rounded-xl space-y-3">
                    <div>
                      <h4 className="font-bold text-slate-200">{student.firstName} {student.lastName}</h4>
                      <p className="text-xs text-slate-400">Class Stream: {student.className} - {student.sectionName}</p>
                      <p className="text-[10px] text-slate-500 mt-1 uppercase">Adm: {student.admissionNumber}</p>
                    </div>
                    <div className="flex justify-between items-center border-t border-slate-800/60 pt-2">
                      <span className="text-xs text-slate-400">Finalized Sessions: {student.denominator}</span>
                      <span className="text-lg font-black text-rose-400">{student.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                No active students flagged below the required attendance threshold.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'absentees' && (
        <Card className="border-slate-800 bg-slate-900/50 text-slate-100">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-200">Daily Absentee Directory</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingAbsentees ? (
              <div className="py-12 flex justify-center"><PageLoader /></div>
            ) : absenteesList && absenteesList.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-950 text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-3">Adm No</th>
                      <th className="px-6 py-3">Student Name</th>
                      <th className="px-6 py-3">Stream</th>
                      <th className="px-6 py-3">Marker</th>
                      <th className="px-6 py-3">Primary Guardian</th>
                      <th className="px-6 py-3">Phone</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {absenteesList.map((row: any) => (
                      <tr key={row.studentId} className="hover:bg-slate-900/30">
                        <td className="px-6 py-4">{row.admissionNumber}</td>
                        <td className="px-6 py-4 font-bold text-slate-200">{row.firstName} {row.lastName}</td>
                        <td className="px-6 py-4">{row.className} - {row.sectionName}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase
                            ${row.status === 'ABSENT' ? 'bg-rose-500/10 text-rose-400' : 'bg-blue-500/10 text-blue-400'}
                          `}>
                            {row.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">{row.guardianName || 'N/A'}</td>
                        <td className="px-6 py-4 font-semibold text-slate-300">{row.guardianPhone || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                No absentee details reported on this date.
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
