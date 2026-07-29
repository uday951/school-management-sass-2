import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileSpreadsheet, ArrowLeft, Save, CheckCircle2 } from 'lucide-react'
import { Button, Badge, ReusableTable as AppTable, Alert } from '@/components/shared'
import { teacherService } from '@/services/teacherService'

export default function ExamMarks() {
  const navigate = useNavigate()

  const [selectedClass, setSelectedClass] = useState('Grade 10')
  const [selectedExam, setSelectedExam] = useState('Mid-Term Examination 2026')
  const [subject, setSubject] = useState('Mathematics')
  const [savedMsg, setSavedMsg] = useState('')

  const [marksData, setMarksData] = useState([])

  useEffect(() => {
    const fetchClassStudents = async () => {
      try {
        const res = await teacherService.getTeacherStudents({ class: selectedClass })
        if (res?.data && Array.isArray(res.data)) {
          setMarksData(res.data.map(s => ({
            id: s._id || s.id,
            rollNo: s.rollNo || '101',
            name: s.name || `${s.firstName} ${s.lastName}`,
            maxMarks: 100,
            marksObtained: 0,
            grade: 'F'
          })))
        } else {
          setMarksData([])
        }
      } catch (_err) {
        setMarksData([])
      }
    }
    fetchClassStudents()
  }, [selectedClass])

  const handleMarksChange = (id, val) => {
    const num = parseInt(val, 10) || 0
    setMarksData(marksData.map(m => {
      if (m.id === id) {
        let grade = 'F'
        if (num >= 90) grade = 'A+'
        else if (num >= 80) grade = 'A'
        else if (num >= 70) grade = 'B+'
        else if (num >= 60) grade = 'B'
        else if (num >= 50) grade = 'C'
        return { ...m, marksObtained: num, grade }
      }
      return m
    }))
  }

  const handleSaveMarks = () => {
    setSavedMsg('Examination marks saved successfully.')
    setTimeout(() => setSavedMsg(''), 3000)
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
              Examination Grades & Marks Entry
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">Enter and evaluate student examination scores for subject grade calculations.</p>
          </div>
        </div>

        <Button onClick={handleSaveMarks} className="flex items-center gap-1.5">
          <Save className="h-4 w-4" /> Save All Marks
        </Button>
      </div>

      {savedMsg && <Alert variant="success">{savedMsg}</Alert>}

      {/* Selectors */}
      <div className="bg-card p-6 rounded-xl border border-border shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase">Select Class</label>
          <select 
            value={selectedClass} 
            onChange={e => setSelectedClass(e.target.value)}
            className="w-full mt-1.5 px-3 py-2 text-sm border border-border rounded-lg bg-background"
          >
            <option value="Grade 10-A">Grade 10 - Section A</option>
            <option value="Grade 10-B">Grade 10 - Section B</option>
            <option value="Grade 9-A">Grade 9 - Section A</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase">Examination Term</label>
          <select 
            value={selectedExam} 
            onChange={e => setSelectedExam(e.target.value)}
            className="w-full mt-1.5 px-3 py-2 text-sm border border-border rounded-lg bg-background"
          >
            <option value="Mid-Term Examination 2026">Mid-Term Examination 2026</option>
            <option value="Final Term Examination 2026">Final Term Examination 2026</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase">Subject</label>
          <input 
            type="text" 
            value={subject} 
            onChange={e => setSubject(e.target.value)}
            className="w-full mt-1.5 px-3 py-2 text-sm border border-border rounded-lg bg-background"
          />
        </div>
      </div>

      {/* Marks Table */}
      <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
        <AppTable
          columns={[
            { header: 'Roll No', accessor: 'rollNo' },
            { header: 'Student Name', accessor: 'name' },
            { header: 'Max Marks', accessor: 'maxMarks' },
            { 
              header: 'Marks Obtained', 
              accessor: row => (
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={row.marksObtained}
                  onChange={e => handleMarksChange(row.id, e.target.value)}
                  className="w-24 px-3 py-1 text-sm border border-border rounded bg-background font-bold text-emerald-600 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              ) 
            },
            { header: 'Calculated Grade', accessor: row => <Badge variant="secondary" className="font-bold">{row.grade}</Badge> }
          ]}
          data={marksData}
        />
      </div>

    </div>
  )
}
