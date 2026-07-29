import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  BookMarked, 
  Plus, 
  ArrowLeft, 
  RefreshCw, 
  CheckCircle2, 
  Clock 
} from 'lucide-react'
import { Button, Badge, ReusableTable as AppTable, Alert } from '@/components/shared'

export default function Homework() {
  const navigate = useNavigate()

  const [homeworkList, setHomeworkList] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHomework = async () => {
      setLoading(true)
      try {
        const res = await axiosClient.get('/homework')
        if (res.data?.success && Array.isArray(res.data.data)) {
          setHomeworkList(res.data.data)
        } else {
          setHomeworkList([])
        }
      } catch (_err) {
        setHomeworkList([])
      } finally {
        setLoading(false)
      }
    }
    fetchHomework()
  }, [])

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

      {/* Homework Table */}
      <div className="bg-card p-4 rounded-xl border border-border shadow-sm space-y-4">
        <AppTable
          columns={[
            { header: 'Class & Section', accessor: 'className' },
            { header: 'Subject', accessor: 'subject' },
            { header: 'Assignment Title', accessor: 'title' },
            { header: 'Assigned Date', accessor: 'assignedDate' },
            { header: 'Due Date', accessor: 'dueDate' },
            { header: 'Submissions', accessor: row => <Badge variant="secondary">{row.submissions}</Badge> },
            {
              header: 'Actions',
              accessor: row => (
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => navigate(`/teacher/homework/${row.id}`)}
                >
                  View Submissions
                </Button>
              )
            }
          ]}
          data={homeworkList}
        />
      </div>

    </div>
  )
}
