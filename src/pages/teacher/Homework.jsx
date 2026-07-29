import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  BookMarked, 
  Plus, 
  ArrowLeft, 
  RefreshCw, 
  Clock, 
  CheckCircle2,
  Trash2,
  Eye
} from 'lucide-react'
import { Button, Badge, Alert } from '@/components/shared'
import axiosClient from '@/config/axiosClient'

const statusColor = (status) => {
  if (status === 'evaluated') return 'success'
  if (status === 'submitted') return 'info'
  return 'warning'
}

export default function Homework() {
  const navigate = useNavigate()

  const [homeworkList, setHomeworkList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchHomework = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await axiosClient.get('/teacher/homework')
      if (res.data?.success) {
        setHomeworkList(Array.isArray(res.data.data) ? res.data.data : [])
      } else {
        setHomeworkList([])
      }
    } catch (err) {
      setError('Failed to load homework list. Please try again.')
      setHomeworkList([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchHomework() }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this homework assignment?')) return
    try {
      await axiosClient.delete(`/teacher/homework/${id}`)
      setHomeworkList(prev => prev.filter(hw => hw._id !== id && hw.id !== id))
    } catch (err) {
      setError('Failed to delete homework.')
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <RefreshCw className="h-8 w-8 text-primary animate-spin" />
        <p className="text-sm font-medium text-muted-foreground">Loading Homework Management...</p>
      </div>
    )
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
              <BookMarked className="h-6 w-6 text-blue-600" />
              Classroom Homework Logs
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">Assign daily homework tasks, evaluate student submissions, and manage deadlines.</p>
          </div>
        </div>
        <Button onClick={() => navigate('/teacher/homework/create')} className="flex items-center gap-1.5">
          <Plus className="h-4 w-4" /> Assign New Homework
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Homework Cards */}
      {homeworkList.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <BookMarked className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="font-semibold text-foreground mb-1">No Homework Assigned Yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Click &quot;Assign New Homework&quot; to create your first assignment.</p>
          <Button onClick={() => navigate('/teacher/homework/create')}>
            <Plus className="h-4 w-4 mr-1" /> Create Assignment
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {homeworkList.map((hw) => (
            <div key={hw._id || hw.id} className="bg-card border border-border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary/50 transition-colors">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-foreground">{hw.title}</h3>
                  <Badge variant="outline" className="text-xs">{hw.subjectId?.subjectName || 'Subject'}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Due: <span className="font-semibold text-foreground">{hw.dueDate ? new Date(hw.dueDate).toLocaleDateString() : 'N/A'}</span>
                  {' • '}
                  Submissions: <span className="font-semibold text-primary">{hw.submittedCount || 0}/{hw.submissionsCount || 0}</span>
                </p>
                {hw.description && <p className="text-xs text-muted-foreground line-clamp-1">{hw.description}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/teacher/homework/${hw._id || hw.id}`)}
                  className="flex items-center gap-1"
                >
                  <Eye className="h-3.5 w-3.5" /> Submissions
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(hw._id || hw.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
