import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookMarked, ArrowLeft, Send } from 'lucide-react'
import { Button, Alert } from '@/components/shared'

export default function HomeworkCreate() {
  const navigate = useNavigate()

  const [className, setClassName] = useState('Grade 10-A')
  const [subject, setSubject] = useState('Mathematics')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title || !dueDate) return

    setSuccessMsg('Homework task successfully assigned to class.')
    setTimeout(() => {
      navigate('/teacher/homework')
    }, 1200)
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

      <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">Target Class & Section</label>
              <select
                value={className}
                onChange={e => setClassName(e.target.value)}
                className="w-full mt-1.5 px-3 py-2 text-sm border border-border rounded-lg bg-background"
              >
                <option value="Grade 10-A">Grade 10 - Section A</option>
                <option value="Grade 10-B">Grade 10 - Section B</option>
                <option value="Grade 9-A">Grade 9 - Section A</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">Subject</label>
              <select
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full mt-1.5 px-3 py-2 text-sm border border-border rounded-lg bg-background"
              >
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase">Assignment Title</label>
            <input
              type="text"
              placeholder="e.g. Chapter 4 Practice Problems"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full mt-1.5 px-3 py-2 text-sm border border-border rounded-lg bg-background"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase">Submission Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full mt-1.5 px-3 py-2 text-sm border border-border rounded-lg bg-background"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase">Instructions & Description</label>
            <textarea
              rows={4}
              placeholder="Provide detailed instructions for student submission..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full mt-1.5 px-3 py-2 text-sm border border-border rounded-lg bg-background resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => navigate('/teacher/homework')}>Cancel</Button>
            <Button type="submit" className="flex items-center gap-1.5">
              <Send className="h-4 w-4" /> Assign Homework
            </Button>
          </div>
        </form>
      </div>

    </div>
  )
}
