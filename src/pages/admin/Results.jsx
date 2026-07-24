import React, { useState, useEffect } from 'react'
import { 
  PageHeader, 
  PageContainer, 
  ReusableTable, 
  TablePagination, 
  Button, 
  FormDialog, 
  FormInput, 
  FormSelect, 
  StatusChip,
  PrintableReportLayout
} from '@/components/shared'
import { 
  BookOpen, 
  User, 
  Sliders, 
  Award, 
  FileText, 
  Printer, 
  CheckCircle, 
  Plus, 
  Search, 
  Download,
  AlertCircle
} from 'lucide-react'
import { examService } from '@/services/examService'

export default function Results() {
  const [activeTab, setActiveTab] = useState('marks')
  const [classes, setClasses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [exams, setExams] = useState([])
  const [students, setStudents] = useState([])

  useEffect(() => {
    const fetchReferences = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

        // Fetch classes
        const clRes = await fetch(`${API_BASE}/classes?limit=100`).then(r => r.json()).catch(() => null);
        if (clRes?.success) {
          const items = Array.isArray(clRes.data) ? clRes.data : (clRes.data?.items || []);
          const normalized = items.map(item => ({
            ...item,
            _id: item._id || item.id,
            id: item.id || item._id,
            className: item.className || item.name,
            name: item.name || item.className
          }));
          setClasses(normalized);
        } else {
          setClasses([{ _id: 'c101', className: 'Grade 10' }, { _id: 'c102', className: 'Grade 11' }]);
        }

        // Fetch subjects
        const subRes = await fetch(`${API_BASE}/subjects?limit=100`).then(r => r.json()).catch(() => null);
        if (subRes?.success) {
          const items = Array.isArray(subRes.data) ? subRes.data : (subRes.data?.items || []);
          const normalized = items.map(item => ({
            ...item,
            _id: item._id || item.id,
            id: item.id || item._id,
            subjectName: item.subjectName || item.name,
            name: item.name || item.subjectName
          }));
          setSubjects(normalized);
        } else {
          setSubjects([{ _id: 's201', subjectName: 'Mathematics', subjectCode: 'MATH' }, { _id: 's202', subjectName: 'Science', subjectCode: 'SCI' }]);
        }

        // Fetch exams
        const exRes = await examService.getExams({ limit: 100 });
        setExams(exRes.items || []);

        // Fetch students
        const stRes = await fetch(`${API_BASE}/students?limit=200`).then(r => r.json()).catch(() => null);
        if (stRes?.success) {
          const items = Array.isArray(stRes.data) ? stRes.data : (stRes.data?.items || []);
          const normalized = items.map(item => ({
            ...item,
            _id: item._id || item.id,
            id: item.id || item._id,
            firstName: item.firstName,
            lastName: item.lastName,
            rollNo: item.rollNo,
            admissionNo: item.admissionNo
          }));
          setStudents(normalized);
        } else {
          setStudents([{ _id: 'st301', firstName: 'Alex', lastName: 'Rivera', admissionNo: 'ADM001', rollNo: '101' }]);
        }
      } catch (err) {
        console.warn('Reference load failed.');
      }
    };
    fetchReferences();
  }, []);

  return (
    <PageContainer>
      <PageHeader 
        title="Grade & Assessment Results Manager"
        subtitle="Manage student marks, process results, view ranks, and publish report cards"
      />

      {/* Tabs Menu Navigation */}
      <div className="flex flex-wrap border-b border-border mb-6">
        <button 
          onClick={() => setActiveTab('marks')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'marks' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <BookOpen className="h-4 w-4" /> Subject Marks Entry
        </button>
        <button 
          onClick={() => setActiveTab('process')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'process' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Sliders className="h-4 w-4" /> Result Processing
        </button>
        <button 
          onClick={() => setActiveTab('reportcards')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'reportcards' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <FileText className="h-4 w-4" /> Report Cards
        </button>
        <button 
          onClick={() => setActiveTab('ranklist')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'ranklist' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Award className="h-4 w-4" /> Rank List
        </button>
        <button 
          onClick={() => setActiveTab('publishing')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'publishing' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <CheckCircle className="h-4 w-4" /> Result Publishing
        </button>
      </div>

      {activeTab === 'marks' && <MarksEntryTab exams={exams} subjects={subjects} students={students} />}
      {activeTab === 'process' && <ResultProcessingTab exams={exams} students={students} />}
      {activeTab === 'reportcards' && <ReportCardsTab exams={exams} students={students} />}
      {activeTab === 'ranklist' && <RankListTab exams={exams} students={students} />}
      {activeTab === 'publishing' && <ResultPublishingTab exams={exams} />}
    </PageContainer>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. SUBJECT MARKS ENTRY TAB
// ─────────────────────────────────────────────────────────────────────────────
function MarksEntryTab({ exams, subjects, students }) {
  const [marks, setMarks] = useState([])
  const [examId, setExamId] = useState('')
  const [studentId, setStudentId] = useState('')
  const [loading, setLoading] = useState(false)

  // Dialogs
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [form, setForm] = useState({ studentId: '', examId: '', subjectId: '', marksObtained: 0, maxMarks: 100, remarks: '' })

  const fetchMarks = async () => {
    setLoading(true);
    try {
      const res = await examService.getMarks({ examId, studentId });
      setMarks(res);
    } catch (err) {
      alert('Error fetching marks.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMarks();
  }, [examId, studentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await examService.saveMarks(form);
      setIsAddOpen(false);
      fetchMarks();
    } catch (err) {
      alert(err.message || 'Error recording marks.');
    }
  }

  const columns = [
    { 
      header: 'Student Name', 
      accessor: (row) => {
        const match = students.find(s => s._id === row.studentId);
        return match ? `${match.firstName} ${match.lastName} (${match.admissionNo})` : 'N/A';
      }
    },
    { header: 'Subject Code', accessor: (row) => row.subjectId?.subjectCode || 'N/A' },
    { header: 'Subject Name', accessor: (row) => row.subjectId?.subjectName || 'N/A' },
    { header: 'Marks Obtained', accessor: 'marksObtained' },
    { header: 'Maximum Marks', accessor: 'maxMarks' },
    { 
      header: 'Grade Awarded', 
      accessor: (row) => <span className="font-bold text-primary">{row.grade}</span> 
    },
    { header: 'Remarks', accessor: 'remarks' }
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card p-4 rounded-lg border border-border">
        <div className="flex flex-wrap items-center gap-3">
          <FormSelect 
            value={examId}
            onChange={(e) => setExamId(e.target.value)}
            options={[
              { value: '', label: 'Select Exam Cycle' },
              ...exams.map(e => ({ value: e._id, label: e.name }))
            ]}
          />
          <FormSelect 
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            options={[
              { value: '', label: 'Select Student' },
              ...students.map(s => ({ value: s._id, label: `${s.firstName} ${s.lastName}` }))
            ]}
          />
        </div>
        <Button onClick={() => { setForm({ studentId: '', examId: '', subjectId: '', marksObtained: 0, maxMarks: 100, remarks: '' }); setIsAddOpen(true); }} className="flex items-center gap-1.5">
          <Plus className="h-4 w-4" /> Enter Subject Marks
        </Button>
      </div>

      <ReusableTable 
        columns={columns}
        data={marks}
        loading={loading}
      />

      <FormDialog isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Record Student Subject Marks">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormSelect 
            label="Student"
            required
            value={form.studentId}
            onChange={(e) => setForm(p => ({ ...p, studentId: e.target.value }))}
            options={[
              { value: '', label: 'Select Student' },
              ...students.map(s => ({ value: s._id, label: `${s.firstName} ${s.lastName} (Adm: ${s.admissionNo})` }))
            ]}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormSelect 
              label="Exam Cycle"
              required
              value={form.examId}
              onChange={(e) => setForm(p => ({ ...p, examId: e.target.value }))}
              options={[
                { value: '', label: 'Select Exam' },
                ...exams.map(e => ({ value: e._id, label: e.name }))
              ]}
            />
            <FormSelect 
              label="Subject"
              required
              value={form.subjectId}
              onChange={(e) => setForm(p => ({ ...p, subjectId: e.target.value }))}
              options={[
                { value: '', label: 'Select Subject' },
                ...subjects.map(s => ({ value: s._id, label: s.subjectName }))
              ]}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormInput 
              type="number"
              label="Marks Obtained"
              required
              value={form.marksObtained}
              onChange={(e) => setForm(p => ({ ...p, marksObtained: Number(e.target.value) }))}
            />
            <FormInput 
              type="number"
              label="Max Marks Allowed"
              required
              value={form.maxMarks}
              onChange={(e) => setForm(p => ({ ...p, maxMarks: Number(e.target.value) }))}
            />
          </div>
          <FormInput 
            label="Remarks / Feedback"
            value={form.remarks}
            onChange={(e) => setForm(p => ({ ...p, remarks: e.target.value }))}
          />
          <div className="flex gap-2 justify-end pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button type="submit">Save Marks</Button>
          </div>
        </form>
      </FormDialog>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. RESULT PROCESSING TAB
// ─────────────────────────────────────────────────────────────────────────────
function ResultProcessingTab({ exams, students }) {
  const [results, setResults] = useState([])
  const [examId, setExamId] = useState('')
  const [processing, setProcessing] = useState(false)
  const [loading, setLoading] = useState(false)

  const fetchResults = async () => {
    if (!examId) return;
    setLoading(true);
    try {
      const res = await examService.getResults({ examId });
      setResults(res.items);
    } catch (err) {
      alert('Error fetching processed results.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchResults();
  }, [examId]);

  const handleProcess = async () => {
    if (!examId) {
      alert('Please select an Exam Cycle first.');
      return;
    }
    setProcessing(true);
    try {
      await examService.processResults(examId);
      alert('Results and ranks calculated successfully for all class students.');
      fetchResults();
    } catch (err) {
      alert(err.message || 'Error processing results.');
    } finally {
      setProcessing(false);
    }
  }

  const columns = [
    { 
      header: 'Rank', 
      accessor: (row) => <span className="font-extrabold text-amber-700">#{row.rank || '-'}</span> 
    },
    { 
      header: 'Student Name', 
      accessor: (row) => {
        const match = students.find(s => s._id === row.studentId);
        return match ? `${match.firstName} ${match.lastName} (${match.admissionNo})` : 'N/A';
      }
    },
    { header: 'Total Marks', accessor: (row) => `${row.totalMarks} / ${row.maxMarks}` },
    { header: 'Percentage', accessor: (row) => `${row.percentage}%` },
    { header: 'GPA Score', accessor: 'gpa' },
    { 
      header: 'Overall Grade', 
      accessor: (row) => <span className="font-bold text-primary">{row.grade}</span> 
    },
    {
      header: 'Pass/Fail Status',
      accessor: (row) => (
        <span className={`px-2 py-1 text-xs font-bold rounded ${row.status === 'Pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {row.status}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 bg-card p-4 rounded-lg border border-border">
        <div className="max-w-sm flex-1">
          <FormSelect 
            value={examId}
            onChange={(e) => setExamId(e.target.value)}
            options={[
              { value: '', label: 'Select Exam Cycle' },
              ...exams.map(e => ({ value: e._id, label: e.name }))
            ]}
          />
        </div>
        <Button onClick={handleProcess} disabled={processing} className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white">
          <Sliders className="h-4 w-4" /> {processing ? 'Consolidating & Ranking...' : 'Consolidate Marks & Ranks'}
        </Button>
      </div>

      {examId ? (
        <ReusableTable 
          columns={columns}
          data={results}
          loading={loading}
        />
      ) : (
        <div className="flex flex-col items-center justify-center p-8 bg-muted/20 border border-dashed rounded-lg text-center">
          <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm font-semibold text-muted-foreground">Select an Exam Cycle above to view processed class standings</p>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. REPORT CARDS PREVIEW & PRINT TAB
// ─────────────────────────────────────────────────────────────────────────────
function ReportCardsTab({ exams, students }) {
  const [examId, setExamId] = useState('')
  const [studentId, setStudentId] = useState('')
  const [details, setDetails] = useState(null)
  const [loading, setLoading] = useState(false)

  const loadReportCard = async () => {
    if (!examId || !studentId) return;
    setLoading(true);
    try {
      const res = await examService.getReportCardDetails(studentId, examId);
      setDetails(res);
    } catch (err) {
      alert(err.message || 'Report card details not calculated.');
      setDetails(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReportCard();
  }, [examId, studentId]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-card p-4 rounded-lg border border-border mb-4">
        <FormSelect 
          label="Exam Cycle"
          value={examId}
          onChange={(e) => setExamId(e.target.value)}
          options={[
            { value: '', label: 'Select Exam' },
            ...exams.map(e => ({ value: e._id, label: e.name }))
          ]}
        />
        <FormSelect 
          label="Student Name"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          options={[
            { value: '', label: 'Select Student' },
            ...students.map(s => ({ value: s._id, label: `${s.firstName} ${s.lastName} (Roll: ${s.rollNo})` }))
          ]}
        />
      </div>

      {loading && <div className="text-center p-8 text-sm text-muted-foreground">Compiling report card records...</div>}

      {!loading && details && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => window.print()} className="flex items-center gap-1.5">
              <Printer className="h-4 w-4" /> Print / Export PDF
            </Button>
          </div>

          {/* Printable Report Layout */}
          <PrintableReportLayout title={details.exam?.name || 'Academic Report'}>
            <div className="space-y-6">
              {/* Student Metadata Card */}
              <div className="grid grid-cols-2 gap-4 border-b border-black pb-4 text-xs font-serif text-black">
                <div>
                  <div><strong className="uppercase">Student Name:</strong> {details.student?.firstName} {details.student?.lastName}</div>
                  <div><strong className="uppercase">Admission Number:</strong> {details.student?.admissionNo}</div>
                  <div><strong className="uppercase">Roll Number:</strong> {details.student?.rollNo}</div>
                </div>
                <div className="text-right">
                  <div><strong className="uppercase">Exam Cycle:</strong> {details.exam?.name} ({details.exam?.type})</div>
                  <div><strong className="uppercase">Term Year:</strong> {details.exam?.academicYear}</div>
                  <div><strong className="uppercase">Evaluation Date:</strong> {new Date(details.generatedDate).toLocaleDateString()}</div>
                </div>
              </div>

              {/* Subject Marks Table */}
              <table className="w-full border-collapse border border-black text-xs font-serif text-black">
                <thead>
                  <tr className="bg-slate-100 border-b border-black uppercase text-left font-bold">
                    <th className="border-r border-black p-2">Subject Name</th>
                    <th className="border-r border-black p-2 text-center">Marks Obtained</th>
                    <th className="border-r border-black p-2 text-center">Max Marks</th>
                    <th className="p-2 text-center">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {details.subjectMarks?.map((m, idx) => (
                    <tr key={idx} className="border-b border-black">
                      <td className="border-r border-black p-2">{m.subjectId?.subjectName || 'Subject'}</td>
                      <td className="border-r border-black p-2 text-center">{m.marksObtained}</td>
                      <td className="border-r border-black p-2 text-center">{m.maxMarks}</td>
                      <td className="p-2 text-center font-bold">{m.grade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Consolidated Metrics Footer */}
              <div className="border border-black p-4 bg-slate-50 grid grid-cols-3 gap-4 text-center text-xs font-serif text-black">
                <div>
                  <div className="font-bold uppercase text-[10px] text-slate-600">Total Marks</div>
                  <div className="text-lg font-extrabold">{details.result?.totalMarks} / {details.result?.maxMarks}</div>
                </div>
                <div>
                  <div className="font-bold uppercase text-[10px] text-slate-600">Overall Percentage</div>
                  <div className="text-lg font-extrabold text-indigo-800">{details.result?.percentage}%</div>
                </div>
                <div>
                  <div className="font-bold uppercase text-[10px] text-slate-600">Class Rank</div>
                  <div className="text-lg font-extrabold text-amber-800">#{details.result?.rank || '-'}</div>
                </div>
                <div>
                  <div className="font-bold uppercase text-[10px] text-slate-600">GPA Score</div>
                  <div className="text-lg font-extrabold">{details.result?.gpa}</div>
                </div>
                <div>
                  <div className="font-bold uppercase text-[10px] text-slate-600">Final Grade</div>
                  <div className="text-lg font-extrabold text-primary">{details.result?.grade}</div>
                </div>
                <div>
                  <div className="font-bold uppercase text-[10px] text-slate-600">Evaluation Outcome</div>
                  <div className={`text-lg font-extrabold ${details.result?.status === 'Pass' ? 'text-green-700' : 'text-red-700'}`}>
                    {details.result?.status}
                  </div>
                </div>
              </div>
            </div>
          </PrintableReportLayout>
        </div>
      )}

      {!loading && !details && examId && studentId && (
        <div className="text-center p-8 bg-muted/10 border border-dashed rounded text-sm text-muted-foreground">
          No report card records generated yet. Click "Consolidate Marks & Ranks" under the processing tab.
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. RANK LIST TAB
// ─────────────────────────────────────────────────────────────────────────────
function RankListTab({ exams, students }) {
  const [examId, setExamId] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchRanks = async () => {
    if (!examId) return;
    setLoading(true);
    try {
      const res = await examService.getResults({ examId });
      setResults(res.items);
    } catch (err) {
      alert('Error fetching rank list.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRanks();
  }, [examId]);

  const columns = [
    { header: 'Class Rank Placement', accessor: (row) => <span className="font-extrabold text-amber-700">Rank #{row.rank || '-'}</span> },
    { 
      header: 'Student Name', 
      accessor: (row) => {
        const match = students.find(s => s._id === row.studentId);
        return match ? `${match.firstName} ${match.lastName} (Roll: ${match.rollNo})` : 'N/A';
      }
    },
    { header: 'Total Marks Score', accessor: (row) => `${row.totalMarks} / ${row.maxMarks}` },
    { header: 'Percentage Summary', accessor: (row) => `${row.percentage}%` },
    { header: 'Calculated Grade Letter', accessor: (row) => <span className="font-bold text-primary">{row.grade}</span> },
    { header: 'GPA Factor', accessor: 'gpa' }
  ];

  return (
    <div className="space-y-4">
      <div className="max-w-sm bg-card p-4 rounded border border-border">
        <FormSelect 
          label="Filter Rank by Exam Cycle"
          value={examId}
          onChange={(e) => setExamId(e.target.value)}
          options={[
            { value: '', label: 'Select Exam' },
            ...exams.map(e => ({ value: e._id, label: e.name }))
          ]}
        />
      </div>

      {examId ? (
        <ReusableTable 
          columns={columns}
          data={results}
          loading={loading}
        />
      ) : (
        <div className="text-center p-8 bg-muted/10 border border-dashed rounded text-sm text-muted-foreground">
          Select an Exam Cycle above to inspect the student standings and ranking table.
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. RESULT PUBLISHING TAB
// ─────────────────────────────────────────────────────────────────────────────
function ResultPublishingTab({ exams }) {
  const [statuses, setStatuses] = useState({})
  const [toggling, setToggling] = useState({})

  const loadPublishStatuses = async () => {
    const data = {};
    for (const ex of exams) {
      try {
        const res = await examService.getResults({ examId: ex._id });
        const hasPublished = res.items?.some(r => r.isPublished);
        data[ex._id] = hasPublished;
      } catch {
        data[ex._id] = false;
      }
    }
    setStatuses(data);
  }

  useEffect(() => {
    if (exams.length > 0) {
      loadPublishStatuses();
    }
  }, [exams]);

  const handleTogglePublish = async (examId, currentStatus) => {
    setToggling(prev => ({ ...prev, [examId]: true }));
    try {
      await examService.publishResults(examId, !currentStatus);
      setStatuses(prev => ({ ...prev, [examId]: !currentStatus }));
      alert(`Results have been successfully ${!currentStatus ? 'published' : 'unpublished'}!`);
    } catch {
      alert('Error updating publication status.');
    } finally {
      setToggling(prev => ({ ...prev, [examId]: false }));
    }
  }

  const columns = [
    { header: 'Exam Cycle Name', accessor: 'name' },
    { header: 'Exam Type', accessor: 'type' },
    { header: 'Academic Year', accessor: 'academicYear' },
    {
      header: 'Publication Visibility',
      accessor: (row) => (
        <span className={`px-2 py-1 text-xs font-bold rounded ${statuses[row._id] ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
          {statuses[row._id] ? 'Published (Live)' : 'Draft (Hidden from Parents/Students)'}
        </span>
      )
    },
    {
      header: 'Action',
      accessor: (row) => (
        <Button 
          size="sm"
          disabled={toggling[row._id]}
          onClick={() => handleTogglePublish(row._id, !!statuses[row._id])}
          className={`${statuses[row._id] ? 'bg-amber-600 hover:bg-amber-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
        >
          {statuses[row._id] ? 'Unpublish Results' : 'Publish Results'}
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-4">
      <ReusableTable 
        columns={columns}
        data={exams}
        loading={exams.length === 0}
      />
    </div>
  )
}
