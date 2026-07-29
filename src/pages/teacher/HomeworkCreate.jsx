import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookMarked, ArrowLeft, Send, Loader2 } from 'lucide-react'
import { Button, Alert } from '@/components/shared'
import axiosClient from '@/config/axiosClient'

export default function HomeworkCreate() {
  const navigate = useNavigate()

  const [myClasses, setMyClasses] = useState([])
  const [formData, setFormData] = useState({
    classId: '',
    className: '',
    subjectId: '',
    subjectName: '',
    title: '',
    description: '',
    dueDate: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    const loadClasses = async () => {
      try {
        const res = await axiosClient.get('/teacher/my-classes')
        if (res.data?.success) setMyClasses(res.data.data || [])
      } catch (_) {}
    }
    loadClasses()
  }, [])

  const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }))

  const handleClassChange = (e) => {
    const selected = myClasses.find(c => c.classId === e.target.value || c.className === e.target.value)
    setFormData(prev => ({
      ...prev,
      classId: selected?.classId || e.target.value,
      className: selected?.className || e.target.value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title || !formData.dueDate) {
      setError('Assignment title and due date are required.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await axiosClient.post('/teacher/homework', formData)
      setSuccessMsg('Homework task successfully assigned to class.')
      setTimeout(() => navigate('/teacher/homework'), 1200)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign homework. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 p-4 md:p-6 animate-in fade-in duration-200">
      
      <div className="flex items-center gap-3 border-b border-border pb-5">
        <Button variant="outline" size="sm" onClick={() => navigate('/teacher/homework')}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <BookMarked className="h-6 w-6 text-primary" />
            Assign Homework Task
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Create a new homework assignment for your assigned class section.</p>
        </div>
      </div>

      {successMsg && <Alert variant="success">{successMsg}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">Target Class &amp; Section</label>
              <select
                onChange={handleClassChange}
                className="w-full mt-1.5 px-3 py-2 text-sm border border-border rounded-lg bg-background"
                required
              >
                <option value="">Select a class...</option>
                {myClasses.length > 0 ? myClasses.map((c, i) => (
                  <option key={i} value={c.classId || c.className}>{c.className}{c.section ? ` - ${c.section}` : ''}</option>
                )) : (
                  <>
                    <option value="Grade 10-A">Grade 10 - Section A</option>
                    <option value="Grade 9-A">Grade 9 - Section A</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">Subject</label>
              <input
                type="text"
                placeholder="e.g. Mathematics"
                value={formData.subjectName}
                onChange={e => handleChange('subjectName', e.target.value)}
                className="w-full mt-1.5 px-3 py-2 text-sm border border-border rounded-lg bg-background"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase">Assignment Title</label>
            <input
              type="text"
              placeholder="e.g. Chapter 4 Practice Problems"
              value={formData.title}
              onChange={e => handleChange('title', e.target.value)}
              className="w-full mt-1.5 px-3 py-2 text-sm border border-border rounded-lg bg-background"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase">Submission Due Date</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={e => handleChange('dueDate', e.target.value)}
              className="w-full mt-1.5 px-3 py-2 text-sm border border-border rounded-lg bg-background"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase">Instructions &amp; Description</label>
            <textarea
              rows={4}
              placeholder="Provide detailed instructions for student submission..."
              value={formData.description}
              onChange={e => handleChange('description', e.target.value)}
              className="w-full mt-1.5 px-3 py-2 text-sm border border-border rounded-lg bg-background resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => navigate('/teacher/homework')}>Cancel</Button>
            <Button type="submit" disabled={submitting} className="flex items-center gap-1.5">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {submitting ? 'Assigning...' : 'Assign Homework'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
