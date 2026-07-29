import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { BookMarked, ArrowLeft, CheckCircle2, Clock, AlertCircle, Star } from 'lucide-react'
import { Button, Badge, Alert } from '@/components/shared'
import axiosClient from '@/config/axiosClient'

const statusVariant = { evaluated: 'success', submitted: 'info', pending: 'warning' }
const statusIcon = { evaluated: CheckCircle2, submitted: Clock, pending: AlertCircle }

export default function HomeworkSubmissions() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [homeworkInfo, setHomeworkInfo] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [evaluating, setEvaluating] = useState(null)
  const [marksInput, setMarksInput] = useState({})

  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoading(true)
      try {
        const res = await axiosClient.get(`/teacher/homework/${id}/submissions`)
        if (res.data?.success) {
          setHomeworkInfo(res.data.data?.homework || null)
          setSubmissions(res.data.data?.submissions || [])
          // Pre-populate marks input
          const marks = {}
          ;(res.data.data?.submissions || []).forEach(s => {
            marks[s.studentId] = s.marks || ''
          })
          setMarksInput(marks)
        }
      } catch (err) {
        setError('Failed to load submissions. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchSubmissions()
  }, [id])

  const handleEvaluate = async (studentId) => {
    setEvaluating(studentId)
    try {
      await axiosClient.put(`/teacher/homework/${id}/submissions/${studentId}`, {
        marks: parseInt(marksInput[studentId] || 0),
        status: 'evaluated'
      })
      setSubmissions(prev => prev.map(s =>
        s.studentId === studentId ? { ...s, marks: parseInt(marksInput[studentId] || 0), status: 'evaluated' } : s
      ))
    } catch (err) {
      setError('Failed to save evaluation.')
    } finally {
      setEvaluating(null)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Loading submissions...</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 p-4 md:p-6 animate-in fade-in duration-200">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-5 gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate('/teacher/homework')}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <BookMarked className="h-6 w-6 text-primary" />
              Student Submissions Review
            </h1>
            {homeworkInfo && (
              <p className="text-sm text-muted-foreground mt-0.5">
                <span className="font-semibold">{homeworkInfo.title}</span>
                {' · '}Due: {homeworkInfo.dueDate ? new Date(homeworkInfo.dueDate).toLocaleDateString() : 'N/A'}
              </p>
            )}
          </div>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {submissions.length === 0 ? (
          <div className="p-12 text-center">
            <BookMarked className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
            <h3 className="font-semibold text-foreground">No submissions yet</h3>
            <p className="text-sm text-muted-foreground mt-1">Students have not submitted this homework yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {submissions.map((sub) => {
              const Icon = statusIcon[sub.status] || Clock
              return (
                <div key={sub.studentId} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                      {(sub.studentName || 'S').split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{sub.studentName || 'Student'}</p>
                      <p className="text-xs text-muted-foreground">
                        {sub.rollNo && `Roll No: ${sub.rollNo} · `}
                        Submitted: {sub.submissionDate ? new Date(sub.submissionDate).toLocaleDateString() : 'Not submitted'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant={statusVariant[sub.status] || 'warning'} className="flex items-center gap-1">
                      <Icon className="h-3 w-3" /> {sub.status || 'pending'}
                    </Badge>

                    {sub.status !== 'pending' && (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          placeholder="Marks"
                          value={marksInput[sub.studentId] ?? ''}
                          onChange={e => setMarksInput(prev => ({ ...prev, [sub.studentId]: e.target.value }))}
                          className="w-20 px-2 py-1 text-sm border border-border rounded bg-background"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleEvaluate(sub.studentId)}
                          disabled={evaluating === sub.studentId}
                        >
                          {evaluating === sub.studentId ? '...' : <Star className="h-3.5 w-3.5" />}
                        </Button>
                      </div>
                    )}

                    {sub.marks !== undefined && sub.marks !== null && (
                      <span className="font-bold text-primary text-sm">{sub.marks}/100</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
