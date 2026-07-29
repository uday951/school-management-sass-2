import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { BookMarked, ArrowLeft } from 'lucide-react'
import { Button, Badge, ReusableTable as AppTable } from '@/components/shared'
import axiosClient from '@/config/axiosClient'

export default function HomeworkSubmissions() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [submissions, setSubmissions] = useState([])

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await axiosClient.get(`/homework/${id}/submissions`)
        if (res.data?.success && Array.isArray(res.data.data)) {
          setSubmissions(res.data.data)
        } else {
          setSubmissions([])
        }
      } catch (_err) {
        setSubmissions([])
      }
    }
    if (id) fetchSubmissions()
  }, [id])

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
            <p className="text-sm text-muted-foreground mt-0.5">Evaluate submitted homework assignments and grade student submissions.</p>
          </div>
        </div>
      </div>

      <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
        <AppTable
          columns={[
            { header: 'Roll No', accessor: 'rollNo' },
            { header: 'Student Name', accessor: 'studentName' },
            { header: 'Submission Date', accessor: 'submissionDate' },
            { 
              header: 'Status', 
              accessor: row => (
                <Badge variant={row.status === 'Submitted' ? 'success' : 'warning'}>
                  {row.status}
                </Badge>
              ) 
            },
            { header: 'Evaluation Score', accessor: row => <span className="font-bold text-primary">{row.score}</span> }
          ]}
          data={submissions}
        />
      </div>

    </div>
  )
}
