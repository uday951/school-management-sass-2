import React, { useState, useEffect } from 'react'
import { 
  PageHeader, 
  PageContainer, 
  ReusableTable, 
  TablePagination, 
  Button, 
  FormDialog, 
  DeleteDialog, 
  SuccessDialog, 
  FormInput, 
  FormSelect, 
  StatusChip 
} from '@/components/shared'
import { 
  Plus, 
  Search, 
  Calendar, 
  Award, 
  Clock, 
  Edit3, 
  Trash2, 
  Sliders 
} from 'lucide-react'
import { examService } from '@/services/examService'

export default function Exams() {
  const [activeTab, setActiveTab] = useState('types')

  // Classes & Subjects reference states for scheduling/exam dropdowns
  const [classes, setClasses] = useState([])
  const [subjects, setSubjects] = useState([])

  useEffect(() => {
    // Populate classes and subjects
    const fetchClassesAndSubjects = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
        const clRes = await fetch(`${API_BASE}/classes?limit=100`).then(r => r.json()).catch(() => null);
        const subRes = await fetch(`${API_BASE}/subjects?limit=100`).then(r => r.json()).catch(() => null);

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
          setClasses([
            { _id: 'c101', className: 'Grade 10', classCode: 'G10' },
            { _id: 'c102', className: 'Grade 11', classCode: 'G11' },
            { _id: 'c103', className: 'Grade 12', classCode: 'G12' }
          ]);
        }

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
          setSubjects([
            { _id: 's201', subjectName: 'Mathematics', subjectCode: 'MATH' },
            { _id: 's202', subjectName: 'Science', subjectCode: 'SCI' },
            { _id: 's203', subjectName: 'English Literature', subjectCode: 'ENG' }
          ]);
        }
      } catch (err) {
        console.warn('Fallback reference initialization failed.');
      }
    };
    fetchClassesAndSubjects();
  }, []);

  return (
    <PageContainer>
      <PageHeader 
        title="Assessment Cycle & Grade Configuration"
        subtitle="Manage exams, dates scheduling, class allocations, and grade setup scales"
      />

      {/* Tabs Menu Navigation */}
      <div className="flex border-b border-border mb-6">
        <button 
          onClick={() => setActiveTab('types')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'types' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Calendar className="h-4 w-4" /> Exam Cycles (Types)
        </button>
        <button 
          onClick={() => setActiveTab('schedule')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'schedule' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Clock className="h-4 w-4" /> Exam Schedule
        </button>
        <button 
          onClick={() => setActiveTab('grades')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'grades' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Sliders className="h-4 w-4" /> Grade Setup Scale
        </button>
      </div>

      {activeTab === 'types' && <ExamTypesTab classes={classes} />}
      {activeTab === 'schedule' && <ExamScheduleTab classes={classes} subjects={subjects} />}
      {activeTab === 'grades' && <GradeSetupTab />}
    </PageContainer>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. EXAM CYCLES / TYPES TAB
// ─────────────────────────────────────────────────────────────────────────────
function ExamTypesTab({ classes }) {
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 1 })

  // Dialog states
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedExam, setSelectedExam] = useState(null)

  // Form states
  const initialForm = {
    name: '',
    type: 'Mid Exam',
    academicYear: '2026-2027',
    classId: '',
    section: 'A',
    startDate: '',
    endDate: '',
    status: 'active'
  }
  const [form, setForm] = useState(initialForm)

  const fetchExams = async (page = 1) => {
    setLoading(true);
    try {
      const res = await examService.getExams({ search, page });
      setExams(res.items);
      setPagination(res.pagination);
    } catch (err) {
      alert('Error fetching exams list.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchExams();
  }, [search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await examService.createExam(form);
      setIsAddOpen(false);
      setForm(initialForm);
      fetchExams();
    } catch (err) {
      alert(err.message || 'Error creating exam.');
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await examService.updateExam(selectedExam._id, form);
      setIsEditOpen(false);
      fetchExams();
    } catch (err) {
      alert(err.message || 'Error updating exam details.');
    }
  }

  const handleDelete = async () => {
    try {
      await examService.deleteExam(selectedExam._id);
      setIsDeleteOpen(false);
      fetchExams();
    } catch (err) {
      alert('Error deleting exam.');
    }
  }

  const columns = [
    { header: 'Exam Cycle Name', accessor: 'name' },
    { header: 'Exam Type', accessor: 'type' },
    { 
      header: 'Assigned Class', 
      accessor: (row) => row.classId?.className || classes.find(c => c._id === row.classId)?.className || 'All Classes'
    },
    { header: 'Term Year', accessor: 'academicYear' },
    { 
      header: 'Start Date', 
      accessor: (row) => new Date(row.startDate).toLocaleDateString()
    },
    { 
      header: 'End Date', 
      accessor: (row) => new Date(row.endDate).toLocaleDateString()
    },
    {
      header: 'Status',
      accessor: (row) => <StatusChip status={row.status} />
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex items-center gap-1.5">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => {
              setSelectedExam(row);
              setForm({
                ...row,
                startDate: row.startDate ? new Date(row.startDate).toISOString().split('T')[0] : '',
                endDate: row.endDate ? new Date(row.endDate).toISOString().split('T')[0] : ''
              });
              setIsEditOpen(true);
            }}
          >
            <Edit3 className="h-3.5 w-3.5" />
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            className="text-destructive hover:bg-destructive/10"
            onClick={() => {
              setSelectedExam(row);
              setIsDeleteOpen(true);
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 bg-card p-4 rounded-lg border border-border">
        <div className="relative max-w-sm flex-1">
          <input 
            type="text" 
            placeholder="Search Exams..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 rounded-md border border-input pl-8 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring bg-background"
          />
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
        <Button onClick={() => { setForm(initialForm); setIsAddOpen(true); }} className="flex items-center gap-1.5">
          <Plus className="h-4 w-4" /> Add Exam Cycle
        </Button>
      </div>

      <ReusableTable 
        columns={columns}
        data={exams}
        loading={loading}
      />
      <TablePagination 
        pagination={pagination}
        onPageChange={(p) => fetchExams(p)}
      />

      {/* Add Dialog */}
      <FormDialog isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Create New Exam Cycle">
        <form onSubmit={handleCreate} className="space-y-4">
          <FormInput 
            label="Exam Name" 
            required 
            value={form.name} 
            onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} 
          />
          <div className="grid grid-cols-2 gap-4">
            <FormSelect 
              label="Exam Type"
              value={form.type}
              onChange={(e) => setForm(p => ({ ...p, type: e.target.value }))}
              options={[
                { value: 'Mid Exam', label: 'Mid Exam' },
                { value: 'Quarterly', label: 'Quarterly' },
                { value: 'Half Yearly', label: 'Half Yearly' },
                { value: 'Annual', label: 'Annual' }
              ]}
            />
            <FormSelect 
              label="Class Allocation"
              required
              value={form.classId}
              onChange={(e) => setForm(p => ({ ...p, classId: e.target.value }))}
              options={[
                { value: '', label: 'Select Class' },
                ...classes.map(c => ({ value: c._id, label: c.className }))
              ]}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormInput 
              type="date"
              label="Start Date"
              required
              value={form.startDate}
              onChange={(e) => setForm(p => ({ ...p, startDate: e.target.value }))}
            />
            <FormInput 
              type="date"
              label="End Date"
              required
              value={form.endDate}
              onChange={(e) => setForm(p => ({ ...p, endDate: e.target.value }))}
            />
          </div>
          <div className="flex gap-2 justify-end pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button type="submit">Create Cycle</Button>
          </div>
        </form>
      </FormDialog>

      {/* Edit Dialog */}
      <FormDialog isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Exam Cycle Details">
        <form onSubmit={handleUpdate} className="space-y-4">
          <FormInput 
            label="Exam Name" 
            required 
            value={form.name} 
            onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} 
          />
          <div className="grid grid-cols-2 gap-4">
            <FormSelect 
              label="Exam Type"
              value={form.type}
              onChange={(e) => setForm(p => ({ ...p, type: e.target.value }))}
              options={[
                { value: 'Mid Exam', label: 'Mid Exam' },
                { value: 'Quarterly', label: 'Quarterly' },
                { value: 'Half Yearly', label: 'Half Yearly' },
                { value: 'Annual', label: 'Annual' }
              ]}
            />
            <FormSelect 
              label="Class Allocation"
              required
              value={form.classId}
              onChange={(e) => setForm(p => ({ ...p, classId: e.target.value }))}
              options={[
                { value: '', label: 'Select Class' },
                ...classes.map(c => ({ value: c._id, label: c.className }))
              ]}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormInput 
              type="date"
              label="Start Date"
              required
              value={form.startDate}
              onChange={(e) => setForm(p => ({ ...p, startDate: e.target.value }))}
            />
            <FormInput 
              type="date"
              label="End Date"
              required
              value={form.endDate}
              onChange={(e) => setForm(p => ({ ...p, endDate: e.target.value }))}
            />
          </div>
          <div className="flex gap-2 justify-end pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </FormDialog>

      {/* Delete Dialog */}
      <DeleteDialog 
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        itemName={selectedExam?.name}
      />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. EXAM SCHEDULES TAB
// ─────────────────────────────────────────────────────────────────────────────
function ExamScheduleTab({ classes, subjects }) {
  const [schedules, setSchedules] = useState([])
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [examFilter, setExamFilter] = useState('')

  // Modal Dialogs
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedSched, setSelectedSched] = useState(null)

  // Form
  const initialForm = {
    examId: '',
    date: '',
    subjectId: '',
    classId: '',
    section: 'A',
    time: '09:00 AM - 12:00 PM',
    hall: 'Block A, Room 101'
  }
  const [form, setForm] = useState(initialForm)

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const res = await examService.getSchedules({ examId: examFilter });
      setSchedules(res);
    } catch (err) {
      alert('Error fetching exam schedules.');
    } finally {
      setLoading(false);
    }
  }

  const fetchAllExams = async () => {
    try {
      const res = await examService.getExams({ limit: 100 });
      setExams(res.items);
    } catch (err) {
      console.warn('Exams reference query failed.');
    }
  }

  useEffect(() => {
    fetchAllExams();
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [examFilter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await examService.createSchedule(form);
      setIsAddOpen(false);
      setForm(initialForm);
      fetchSchedules();
    } catch (err) {
      alert(err.message || 'Scheduling booking failed (Conflict detected).');
    }
  }

  const handleDelete = async () => {
    try {
      await examService.deleteSchedule(selectedSched._id);
      setIsDeleteOpen(false);
      fetchSchedules();
    } catch (err) {
      alert('Failed to delete schedule slot.');
    }
  }

  const columns = [
    { 
      header: 'Exam Cycle', 
      accessor: (row) => row.examId?.name || exams.find(e => e._id === row.examId)?.name || 'N/A'
    },
    { 
      header: 'Class & Section', 
      accessor: (row) => {
        const clsName = row.classId?.className || classes.find(c => c._id === row.classId)?.className || 'N/A';
        return `${clsName} (${row.section || 'A'})`;
      }
    },
    { 
      header: 'Subject Code', 
      accessor: (row) => row.subjectId?.subjectCode || subjects.find(s => s._id === row.subjectId)?.subjectCode || 'N/A'
    },
    { 
      header: 'Subject Name', 
      accessor: (row) => row.subjectId?.subjectName || subjects.find(s => s._id === row.subjectId)?.subjectName || 'N/A'
    },
    { 
      header: 'Schedule Date', 
      accessor: (row) => new Date(row.date).toLocaleDateString()
    },
    { header: 'Time Slot', accessor: 'time' },
    { header: 'Assigned Hall', accessor: 'hall' },
    {
      header: 'Actions',
      accessor: (row) => (
        <Button 
          size="sm" 
          variant="ghost" 
          className="text-destructive hover:bg-destructive/10"
          onClick={() => {
            setSelectedSched(row);
            setIsDeleteOpen(true);
          }}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 bg-card p-4 rounded-lg border border-border">
        <div className="flex items-center gap-2 max-w-sm flex-1">
          <FormSelect 
            value={examFilter}
            onChange={(e) => setExamFilter(e.target.value)}
            options={[
              { value: '', label: 'All Exam Cycles' },
              ...exams.map(e => ({ value: e._id, label: e.name }))
            ]}
          />
        </div>
        <Button onClick={() => { setForm(initialForm); setIsAddOpen(true); }} className="flex items-center gap-1.5">
          <Plus className="h-4 w-4" /> Book Schedule Date
        </Button>
      </div>

      <ReusableTable 
        columns={columns}
        data={schedules}
        loading={loading}
      />

      {/* Add Dialog */}
      <FormDialog isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Book Subject Exam Schedule slot">
        <form onSubmit={handleCreate} className="space-y-4">
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
              label="Assigned Class"
              required
              value={form.classId}
              onChange={(e) => setForm(p => ({ ...p, classId: e.target.value }))}
              options={[
                { value: '', label: 'Select Class' },
                ...classes.map(c => ({ value: c._id, label: c.className }))
              ]}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormSelect 
              label="Subject"
              required
              value={form.subjectId}
              onChange={(e) => setForm(p => ({ ...p, subjectId: e.target.value }))}
              options={[
                { value: '', label: 'Select Subject' },
                ...subjects.map(s => ({ value: s._id, label: `${s.subjectCode} - ${s.subjectName}` }))
              ]}
            />
            <FormInput 
              type="date"
              label="Schedule Date"
              required
              value={form.date}
              onChange={(e) => setForm(p => ({ ...p, date: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormInput 
              label="Time Slot Slot"
              required
              placeholder="e.g. 09:00 AM - 12:00 PM"
              value={form.time}
              onChange={(e) => setForm(p => ({ ...p, time: e.target.value }))}
            />
            <FormInput 
              label="Exam Hall Room"
              required
              placeholder="e.g. Hall A, Room 101"
              value={form.hall}
              onChange={(e) => setForm(p => ({ ...p, hall: e.target.value }))}
            />
          </div>
          <div className="flex gap-2 justify-end pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button type="submit">Publish Schedule</Button>
          </div>
        </form>
      </FormDialog>

      {/* Delete Dialog */}
      <DeleteDialog 
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        itemName="scheduled slot"
      />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. GRADE RANGE SETUP TAB
// ─────────────────────────────────────────────────────────────────────────────
function GradeSetupTab() {
  const [grades, setGrades] = useState([])
  const [loading, setLoading] = useState(true)

  // Dialogs
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedGrade, setSelectedGrade] = useState(null)

  // Form
  const initialForm = {
    gradeName: '',
    minMarks: 0,
    maxMarks: 100,
    gpa: 4.0,
    remarks: ''
  }
  const [form, setForm] = useState(initialForm)

  const fetchGrades = async () => {
    setLoading(true);
    try {
      const res = await examService.getGrades();
      setGrades(res);
    } catch (err) {
      alert('Error fetching grades configuration list.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchGrades();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await examService.createGrade(form);
      setIsAddOpen(false);
      setForm(initialForm);
      fetchGrades();
    } catch (err) {
      alert(err.message || 'Error creating grade scale.');
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await examService.updateGrade(selectedGrade._id, form);
      setIsEditOpen(false);
      fetchGrades();
    } catch (err) {
      alert('Error updating grade.');
    }
  }

  const handleDelete = async () => {
    try {
      await examService.deleteGrade(selectedGrade._id);
      setIsDeleteOpen(false);
      fetchGrades();
    } catch (err) {
      alert('Failed to delete grade level.');
    }
  }

  const columns = [
    { header: 'Grade Letter Name', accessor: 'gradeName' },
    { header: 'Min Marks Percentage', accessor: 'minMarks' },
    { header: 'Max Marks Percentage', accessor: 'maxMarks' },
    { header: 'GPA value Weight', accessor: 'gpa' },
    { header: 'Assessment Remarks', accessor: 'remarks' },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex items-center gap-1.5">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => {
              setSelectedGrade(row);
              setForm(row);
              setIsEditOpen(true);
            }}
          >
            <Edit3 className="h-3.5 w-3.5" />
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            className="text-destructive hover:bg-destructive/10"
            onClick={() => {
              setSelectedGrade(row);
              setIsDeleteOpen(true);
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end bg-card p-4 rounded-lg border border-border">
        <Button onClick={() => { setForm(initialForm); setIsAddOpen(true); }} className="flex items-center gap-1.5">
          <Plus className="h-4 w-4" /> Add Grade Scale
        </Button>
      </div>

      <ReusableTable 
        columns={columns}
        data={grades}
        loading={loading}
      />

      {/* Add Dialog */}
      <FormDialog isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Configure Grade Level Rule">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormInput 
              label="Grade Letter" 
              required 
              placeholder="e.g. A+"
              value={form.gradeName} 
              onChange={(e) => setForm(p => ({ ...p, gradeName: e.target.value }))} 
            />
            <FormInput 
              type="number"
              label="GPA Weight (0-4.0)"
              required
              step="0.01"
              value={form.gpa}
              onChange={(e) => setForm(p => ({ ...p, gpa: Number(e.target.value) }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormInput 
              type="number"
              label="Min Marks Range"
              required
              value={form.minMarks}
              onChange={(e) => setForm(p => ({ ...p, minMarks: Number(e.target.value) }))}
            />
            <FormInput 
              type="number"
              label="Max Marks Range"
              required
              value={form.maxMarks}
              onChange={(e) => setForm(p => ({ ...p, maxMarks: Number(e.target.value) }))}
            />
          </div>
          <FormInput 
            label="Evaluation Remarks"
            placeholder="e.g. Excellent / Pass"
            value={form.remarks}
            onChange={(e) => setForm(p => ({ ...p, remarks: e.target.value }))}
          />
          <div className="flex gap-2 justify-end pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button type="submit">Add Grade Rule</Button>
          </div>
        </form>
      </FormDialog>

      {/* Edit Dialog */}
      <FormDialog isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Modify Grade Level Rule">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormInput 
              label="Grade Letter" 
              required 
              value={form.gradeName} 
              onChange={(e) => setForm(p => ({ ...p, gradeName: e.target.value }))} 
            />
            <FormInput 
              type="number"
              label="GPA Weight"
              required
              step="0.01"
              value={form.gpa}
              onChange={(e) => setForm(p => ({ ...p, gpa: Number(e.target.value) }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormInput 
              type="number"
              label="Min Marks Range"
              required
              value={form.minMarks}
              onChange={(e) => setForm(p => ({ ...p, minMarks: Number(e.target.value) }))}
            />
            <FormInput 
              type="number"
              label="Max Marks Range"
              required
              value={form.maxMarks}
              onChange={(e) => setForm(p => ({ ...p, maxMarks: Number(e.target.value) }))}
            />
          </div>
          <FormInput 
            label="Evaluation Remarks"
            value={form.remarks}
            onChange={(e) => setForm(p => ({ ...p, remarks: e.target.value }))}
          />
          <div className="flex gap-2 justify-end pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </FormDialog>

      {/* Delete Dialog */}
      <DeleteDialog 
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        itemName={selectedGrade?.gradeName}
      />
    </div>
  )
}
