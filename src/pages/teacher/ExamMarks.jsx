import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileSpreadsheet, ArrowLeft, Save, Loader2, AlertCircle } from 'lucide-react'
import { Button, Badge, Alert } from '@/components/shared'
import axiosClient from '@/config/axiosClient'

const calcGrade = (marks) => {
  if (marks >= 90) return 'A+'
  if (marks >= 80) return 'A'
  if (marks >= 70) return 'B+'
  if (marks >= 60) return 'B'
  if (marks >= 50) return 'C'
  return 'F'
}

export default function ExamMarks() {
  const navigate = useNavigate()

  const [exams, setExams] = useState([])
  const [myClasses, setMyClasses] = useState([])
  const [students, setStudents] = useState([])
  const [selectedExamId, setSelectedExamId] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [subject, setSubject] = useState('')
  const [marksData, setMarksData] = useState([])
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState('')
  const [error, setError] = useState('')

  // Load exams and teacher's classes on mount
  useEffect(() => {
    const load = async () => {
      try {
        const [examsRes, classesRes] = await Promise.all([
          axiosClient.get('/teacher/exams'),
          axiosClient.get('/teacher/my-classes')
        ])
        if (examsRes.data?.success) setExams(examsRes.data.data || [])
        if (classesRes.data?.success) setMyClasses(classesRes.data.data || [])
      } catch (_) {}
    }
    load()
  }, [])

  // Load students when class changes
  useEffect(() => {
    if (!selectedClass) { setStudents([]); setMarksData([]); return }
    const loadStudents = async () => {
      try {
        const res = await axiosClient.get('/teacher/my-students', { params: { class: selectedClass, limit: 100 } })
        const studentList = res.data?.data?.data || res.data?.data || []
        setStudents(studentList)
        setMarksData(studentList.map(s => ({
          studentId: s._id || s.id,
          name: `${s.firstName || ''} ${s.lastName || ''}`.trim() || 'Student',
          rollNo: s.rollNo || '',
          maxMarks: 100,
          marksObtained: 0,
          grade: 'F'
        })))
      } catch (_) { setStudents([]); setMarksData([]) }
    }
    loadStudents()
  }, [selectedClass])

  const handleMarksChange = (studentId, val) => {
    const num = Math.min(100, Math.max(0, parseInt(val, 10) || 0))
    setMarksData(prev => prev.map(m =>
      m.studentId === studentId ? { ...m, marksObtained: num, grade: calcGrade(num) } : m
    ))
  }

  const handleSaveMarks = async () => {
    if (!selectedExamId) { setError('Please select an examination term first.'); return }
    if (marksData.length === 0) { setError('No students loaded. Please select a class first.'); return }
    setSaving(true)
    setError('')
    try {
      await Promise.all(marksData.map(m =>
        axiosClient.post('/teacher/marks', {
          studentId: m.studentId,
          examId: selectedExamId,
          subjectId: subject || 'General',
          marksObtained: m.marksObtained,
          maxMarks: m.maxMarks
        })
      ))
      setSavedMsg(`Successfully saved marks for ${marksData.length} students.`)
      setTimeout(() => setSavedMsg(''), 4000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save marks. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 p-4 md:p-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-5 gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate('/teacher/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <FileSpreadsheet className="h-6 w-6 text-purple-600" />
              Examination Grades &amp; Marks Entry
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">Enter and evaluate student examination scores for subject grade calculations.</p>
          </div>
        </div>
        <Button onClick={handleSaveMarks} disabled={saving} className="flex items-center gap-1.5">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Saving...' : 'Save All Marks'}
        </Button>
      </div>

      {savedMsg && <Alert variant="success">{savedMsg}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      {/* Selectors */}
      <div className="bg-card p-6 rounded-xl border border-border shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase">Select Class</label>
          <select
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
            className="w-full mt-1.5 px-3 py-2 text-sm border border-border rounded-lg bg-background"
          >
            <option value="">-- Select Class --</option>
            {myClasses.map((c, i) => (
              <option key={i} value={c.className}>{c.className}{c.section ? ` - ${c.section}` : ''}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase">Examination Term</label>
          <select
            value={selectedExamId}
            onChange={e => setSelectedExamId(e.target.value)}
            className="w-full mt-1.5 px-3 py-2 text-sm border border-border rounded-lg bg-background"
          >
            <option value="">-- Select Exam --</option>
            {exams.map(ex => (
              <option key={ex._id} value={ex._id}>{ex.name} ({ex.type})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase">Subject</label>
          <input
            type="text"
            placeholder="e.g. Mathematics"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            className="w-full mt-1.5 px-3 py-2 text-sm border border-border rounded-lg bg-background"
          />
        </div>
      </div>

      {/* Marks Table */}
      {marksData.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Select a class to load the student roster for marks entry.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase">Roll No</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase">Student Name</th>
                <th className="px-4 py-3 text-center font-semibold text-muted-foreground text-xs uppercase">Max Marks</th>
                <th className="px-4 py-3 text-center font-semibold text-muted-foreground text-xs uppercase">Marks Obtained</th>
                <th className="px-4 py-3 text-center font-semibold text-muted-foreground text-xs uppercase">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {marksData.map((m) => (
                <tr key={m.studentId} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground">{m.rollNo || '—'}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{m.name}</td>
                  <td className="px-4 py-3 text-center text-muted-foreground">{m.maxMarks}</td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="number"
                      min="0"
                      max={m.maxMarks}
                      value={m.marksObtained}
                      onChange={e => handleMarksChange(m.studentId, e.target.value)}
                      className="w-24 px-3 py-1 text-sm border border-border rounded bg-background font-bold text-emerald-600 focus:outline-none focus:ring-2 focus:ring-primary text-center"
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={m.grade === 'F' ? 'danger' : m.grade.startsWith('A') ? 'success' : 'secondary'} className="font-bold">
                      {m.grade}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
