import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axiosClient from '@/config/axiosClient'
import {
  PageContainer,
  PageHeader,
  SimpleCard,
  Button,
  Badge,
  ReusableTable,
  SkeletonLoader
} from '@/components/shared'
import { Search, Eye, Calendar, Download, FileText, CheckCircle, Clock } from 'lucide-react'

export default function ChildHomework() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [homeworkList, setHomeworkList] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedHomework, setSelectedHomework] = useState(null)

  const fetchHomework = async () => {
    setLoading(true)
    try {
      const res = await axiosClient.get(`/portal/child/${id}/homework`)
      if (res.data.success) {
        setHomeworkList(res.data.data)
      }
    } catch (err) {
      console.error('Error fetching child homework:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHomework()
  }, [id])

  // Filter homework list
  const filteredList = homeworkList.filter(h => {
    const matchesSearch = h.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          h.subject.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || h.submissionStatus === statusFilter
    return matchesSearch && matchesStatus
  })

  const columns = [
    { header: 'Subject', accessor: 'subject' },
    { header: 'Title / Task Name', accessor: 'title' },
    {
      header: 'Due Date',
      accessor: (row) => (
        <span className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
          {new Date(row.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: (row) => {
        let style = 'bg-rose-50 text-rose-600 border-rose-100'
        if (row.submissionStatus === 'submitted') style = 'bg-blue-50 text-blue-600 border-blue-100'
        if (row.submissionStatus === 'evaluated') style = 'bg-emerald-50 text-emerald-600 border-emerald-100'
        return (
          <Badge className={`capitalize border ${style}`}>
            {row.submissionStatus}
          </Badge>
        )
      }
    },
    {
      header: 'Marks',
      accessor: (row) => row.marks > 0 ? `${row.marks} Marks` : 'N/A'
    },
    {
      header: 'Details',
      accessor: (row) => (
        <Button
          size="sm"
          variant="ghost"
          className="flex items-center gap-1 p-1 hover:bg-muted"
          onClick={() => setSelectedHomework(row)}
        >
          <Eye className="h-4 w-4" /> View Details
        </Button>
      )
    }
  ]

  return (
    <PageContainer>
      <PageHeader
        title="Child Homework Logs"
        subtitle="Review active tasks, evaluated assignments, grades, and teacher remarks."
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate('/parent/dashboard')}>
            Back to Dashboard
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 mb-6">
        <SimpleCard title="Homework Filtering and Search">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center text-xs font-semibold">
            {/* Search Input */}
            <div className="relative w-full sm:max-w-xs">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground" />
              </span>
              <input
                type="text"
                placeholder="Search homework or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Status Tabs Filter */}
            <div className="flex gap-1.5 border border-border/80 rounded-xl p-1 bg-muted/30 w-full sm:w-auto overflow-x-auto">
              {['all', 'pending', 'submitted', 'evaluated'].map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg capitalize cursor-pointer transition ${statusFilter === st ? 'bg-background shadow-sm text-primary font-bold' : 'text-muted-foreground'}`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </SimpleCard>

        {loading ? (
          <SkeletonLoader count={5} className="h-12" />
        ) : (
          <SimpleCard title="Assigned Homework tasks list">
            <ReusableTable columns={columns} data={filteredList} />
          </SimpleCard>
        )}
      </div>

      {/* Homework Details Modal */}
      {selectedHomework && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border shadow-lg rounded-2xl max-w-lg w-full p-6 relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-start mb-4">
              <div>
                <Badge className="bg-primary/10 text-primary font-bold mb-1.5">{selectedHomework.subject}</Badge>
                <h3 className="text-base font-bold text-foreground">{selectedHomework.title}</h3>
              </div>
              <button
                onClick={() => setSelectedHomework(null)}
                className="text-muted-foreground hover:text-foreground text-sm cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs leading-relaxed">
              <div className="p-3 bg-muted/30 rounded-xl border border-border/60">
                <p className="text-muted-foreground uppercase text-[9px] mb-1 font-bold">Task Description</p>
                <p className="text-foreground font-medium whitespace-pre-line">{selectedHomework.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground uppercase text-[9px] mb-0.5 font-bold">Due Date</p>
                  <p className="text-foreground font-semibold flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {new Date(selectedHomework.dueDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground uppercase text-[9px] mb-0.5 font-bold">Submission Status</p>
                  <p className="text-foreground font-semibold capitalize flex items-center gap-1.5">
                    {selectedHomework.submissionStatus === 'evaluated' ? (
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-amber-500" />
                    )}
                    {selectedHomework.submissionStatus}
                  </p>
                </div>
              </div>

              {selectedHomework.attachments.length > 0 && (
                <div>
                  <p className="text-muted-foreground uppercase text-[9px] mb-1.5 font-bold">Teacher Attachments</p>
                  <div className="space-y-1.5">
                    {selectedHomework.attachments.map((file, index) => (
                      <a
                        key={index}
                        href={file.url}
                        download
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-primary hover:underline font-bold"
                      >
                        <Download className="h-3.5 w-3.5" /> {file.name}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {selectedHomework.remarks && (
                <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                  <p className="text-emerald-700 uppercase text-[9px] mb-1 font-bold">Teacher Feedback</p>
                  <p className="text-emerald-800 font-medium">{selectedHomework.remarks}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={() => setSelectedHomework(null)}>Close Details</Button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  )
}
