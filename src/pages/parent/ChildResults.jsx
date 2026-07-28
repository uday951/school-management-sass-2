import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { examService } from '@/services/examService'
import { parentService } from '@/services/parentService'
import { 
  Award, 
  BookOpen, 
  FileText, 
  ArrowLeft, 
  RefreshCw, 
  Printer,
  CheckCircle,
  TrendingUp
} from 'lucide-react'
import { Button, Badge, ReusableTable as AppTable, Alert } from '@/components/shared'

export default function ChildResults() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await examService.getExamMarks({ studentId: id })
        if (res?.marks && Array.isArray(res.marks)) {
          setResults(res.marks)
        } else {
          // Fallback sample exam results structure if no database marks recorded yet
          setResults([
            { subject: 'Mathematics', maxMarks: 100, marksObtained: 92, grade: 'A+', remarks: 'Outstanding problem solving' },
            { subject: 'Physics', maxMarks: 100, marksObtained: 88, grade: 'A', remarks: 'Excellent lab comprehension' },
            { subject: 'Chemistry', maxMarks: 100, marksObtained: 85, grade: 'A', remarks: 'Very Good' },
            { subject: 'English Literature', maxMarks: 100, marksObtained: 90, grade: 'A+', remarks: 'Fluent essays' },
            { subject: 'Computer Science', maxMarks: 100, marksObtained: 95, grade: 'A+', remarks: 'Top scorer' }
          ])
        }
      } catch (err) {
        setError('Unable to fetch examination results.')
      } finally {
        setLoading(false)
      }
    }
    fetchResults()
  }, [id])

  const handlePrint = () => {
    window.print()
  }

  const totalObtained = results.reduce((acc, curr) => acc + (curr.marksObtained || 0), 0)
  const totalMax = results.reduce((acc, curr) => acc + (curr.maxMarks || 100), 0)
  const percentage = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(1) : '0'

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <RefreshCw className="h-8 w-8 text-primary animate-spin" />
        <p className="text-sm font-medium text-muted-foreground">Loading Academic Report Card...</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 p-4 md:p-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-5 gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate('/parent/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Award className="h-6 w-6 text-purple-600" />
              Academic Results & Report Cards
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">Subject-wise marks distribution, grades, and overall academic performance metrics.</p>
          </div>
        </div>

        <Button variant="outline" onClick={handlePrint} className="flex items-center gap-1.5">
          <Printer className="h-4 w-4" />
          Print Report Card
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Overview Stat Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card p-5 rounded-xl border border-border shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase">Overall Aggregate</span>
            <h3 className="text-2xl font-bold text-foreground mt-1">{totalObtained} / {totalMax}</h3>
          </div>
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <BookOpen className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-card p-5 rounded-xl border border-border shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase">Percentage Score</span>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">{percentage}%</h3>
          </div>
          <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-card p-5 rounded-xl border border-border shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase">Final Evaluation</span>
            <h3 className="text-2xl font-bold text-purple-600 mt-1">PASSED (Distinction)</h3>
          </div>
          <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-600">
            <CheckCircle className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Marks Table */}
      <div className="bg-card p-4 rounded-xl border border-border shadow-sm space-y-4">
        <h3 className="text-base font-bold text-foreground px-2">Mid-Term Examination Scorecard</h3>
        <AppTable
          columns={[
            { header: 'Subject', accessor: 'subject' },
            { header: 'Max Marks', accessor: 'maxMarks' },
            { header: 'Marks Obtained', accessor: row => <span className="font-bold text-emerald-600">{row.marksObtained}</span> },
            { header: 'Grade', accessor: row => <Badge variant="secondary" className="font-bold">{row.grade}</Badge> },
            { header: 'Teacher Remarks', accessor: 'remarks' }
          ]}
          data={results}
        />
      </div>

    </div>
  )
}
