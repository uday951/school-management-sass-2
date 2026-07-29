import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { teacherService } from '@/services/teacherService'
import { 
  BookOpen, 
  Users, 
  Search, 
  Filter, 
  ArrowLeft, 
  RefreshCw, 
  CheckCircle2, 
  XCircle,
  FileSpreadsheet
} from 'lucide-react'
import { Button, Badge, ReusableTable as AppTable, Alert } from '@/components/shared'

export default function Classes() {
  const navigate = useNavigate()

  const [classes, setClasses] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Search, filter, pagination states
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 })

  // Fetch classes and students roster
  useEffect(() => {
    const fetchClassData = async () => {
      setLoading(true)
      setError('')
      try {
        const classList = await teacherService.getTeacherClasses()
        setClasses(classList || [])

        const res = await teacherService.getTeacherStudents({
          page,
          limit: 10,
          search: searchTerm,
          class: selectedClass,
          section: selectedSection
        })

        if (res?.data) {
          setStudents(res.data)
          if (res.pagination) setPagination(res.pagination)
        }
      } catch (err) {
        setError('Failed to load classroom roster.')
      } finally {
        setLoading(false)
      }
    }
    fetchClassData()
  }, [page, searchTerm, selectedClass, selectedSection])

  if (loading && classes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <RefreshCw className="h-8 w-8 text-primary animate-spin" />
        <p className="text-sm font-medium text-muted-foreground">Loading Classroom & Student Roster...</p>
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
              <BookOpen className="h-6 w-6 text-primary" />
              Assigned Classes & Student Roster
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              View your assigned subject allocations, class sections, and student classroom rosters.
            </p>
          </div>
        </div>

        <Button 
          onClick={() => navigate('/teacher/attendance/mark')}
          className="flex items-center gap-1.5"
        >
          <CheckCircle2 className="h-4 w-4" />
          Take Attendance
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Assigned Classes Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map((cls) => (
          <div 
            key={cls.id} 
            className="bg-card p-5 rounded-xl border border-border shadow-sm space-y-3 hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">{cls.className} - {cls.section}</h3>
              <Badge variant="secondary">{cls.subject}</Badge>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
              <span><strong>Enrolled Students:</strong> {cls.studentCount}</span>
              <span><strong>Room:</strong> {cls.room}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Student Roster Table Section */}
      <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-4">
        
        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Classroom Student Roster ({pagination.total || students.length})
          </h3>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search name or roll no..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-4 py-1.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Class Filter */}
            <select
              value={selectedClass}
              onChange={(e) => { setSelectedClass(e.target.value); setPage(1); }}
              className="px-3 py-1.5 text-sm bg-background border border-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Classes</option>
              <option value="Grade 10">Grade 10</option>
              <option value="Grade 9">Grade 9</option>
            </select>
          </div>
        </div>

        {/* Roster Table */}
        <AppTable
          columns={[
            { header: 'Roll No', accessor: 'rollNo' },
            { header: 'Student Name', accessor: 'name' },
            { header: 'Class', accessor: 'class' },
            { header: 'Section', accessor: 'section' },
            { header: 'Gender', accessor: 'gender' },
            { 
              header: 'Today\'s Attendance', 
              accessor: row => (
                <Badge variant={row.attendanceStatus === 'Present' ? 'success' : 'danger'}>
                  {row.attendanceStatus}
                </Badge>
              ) 
            },
            { header: 'Guardian Phone', accessor: 'guardianPhone' }
          ]}
          data={students}
        />

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <span className="text-xs text-muted-foreground">
              Page {page} of {pagination.totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}

      </div>

    </div>
  )
}
