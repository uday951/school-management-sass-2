import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  RefreshCw,
  FileText
} from 'lucide-react'
import { Button, Badge, ReusableTable as AppTable, Alert } from '@/components/shared'

export default function ChildHomework() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [homeworkList, setHomeworkList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchHomework = async () => {
      setLoading(true)
      setError('')
      try {
        // Fetch homework assignments
        setHomeworkList([
          { id: '1', title: 'Quadratic Equations Exercise 4.2', subject: 'Mathematics', assignedDate: '2026-07-26', dueDate: '2026-07-29', status: 'Pending' },
          { id: '2', title: 'Refraction & Optics Experiment Report', subject: 'Physics', assignedDate: '2026-07-25', dueDate: '2026-07-28', status: 'Submitted' },
          { id: '3', title: 'Essay on Climate Change', subject: 'English', assignedDate: '2026-07-24', dueDate: '2026-07-27', status: 'Evaluated' },
          { id: '4', title: 'Periodic Table Reactions Assignment', subject: 'Chemistry', assignedDate: '2026-07-22', dueDate: '2026-07-25', status: 'Submitted' }
        ])
      } catch (err) {
        setError('Failed to load homework assignments.')
      } finally {
        setLoading(false)
      }
    }
    fetchHomework()
  }, [id])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <RefreshCw className="h-8 w-8 text-primary animate-spin" />
        <p className="text-sm font-medium text-muted-foreground">Loading Homework Assignments...</p>
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
              <BookOpen className="h-6 w-6 text-blue-600" />
              Child Homework Planner & Assignments
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">Track active daily homework tasks, submission status, and evaluation notes.</p>
          </div>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Homework List */}
      <div className="bg-card p-4 rounded-xl border border-border shadow-sm space-y-4">
        <AppTable
          columns={[
            { header: 'Subject', accessor: 'subject' },
            { header: 'Assignment Title', accessor: 'title' },
            { header: 'Assigned Date', accessor: 'assignedDate' },
            { header: 'Due Date', accessor: 'dueDate' },
            { 
              header: 'Status', 
              accessor: row => (
                <Badge variant={row.status === 'Submitted' ? 'success' : row.status === 'Evaluated' ? 'secondary' : 'warning'}>
                  {row.status}
                </Badge>
              ) 
            }
          ]}
          data={homeworkList}
        />
      </div>

    </div>
  )
}
