import React, { useState, useEffect } from 'react'
import { Plus, BookOpen, CheckCircle, XCircle, Award } from 'lucide-react'
import { academicService } from '@/services/academicService'
import { 
  Button, 
  StatCard, 
  ReusableTable, 
  TablePagination, 
  DeleteDialog,
  SearchBar,
  Filter,
  StatusChip,
  Alert
} from '@/components/shared'
import SubjectForm from './SubjectForm'
import AssignSubjectDialog from './AssignSubjectDialog'

const ITEMS_PER_PAGE = 5

export default function SubjectList() {
  const [subjects, setSubjects] = useState([])
  const [classes, setClasses] = useState([])
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Search & Filter State
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)

  // Modals & Notifications State
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [assignOpen, setAssignOpen] = useState(false)
  const [notification, setNotification] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [subjectList, classList, teacherList] = await Promise.all([
        academicService.getSubjects(),
        academicService.getClasses(),
        academicService.getTeachers()
      ])
      setSubjects(subjectList)
      setClasses(classList)
      setTeachers(teacherList)
    } catch (err) {
      setError(err.message || 'Failed to retrieve subject configurations.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Auto-clear notifications
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  const handleSearchChange = (val) => {
    setSearch(val)
    setPage(1)
  }

  const handleDeptChange = (val) => {
    setDepartment(val)
    setPage(1)
  }

  const handleStatusChange = (val) => {
    setStatus(val)
    setPage(1)
  }

  // Toggle Enable/Disable
  const handleToggleStatus = async (row) => {
    try {
      const updated = await academicService.toggleSubjectStatus(row.id)
      setSubjects(prev => prev.map(s => s.id === row.id ? updated : s))
      setNotification({
        variant: 'success',
        title: 'Status Updated',
        message: `Subject "${row.name}" status set to ${updated.status === 'active' ? 'Active' : 'Inactive'}.`
      })
    } catch (err) {
      setNotification({ variant: 'danger', title: 'Toggle Status Failed', message: err.message })
    }
  }

  // Filter and Search logic
  const filteredSubjects = subjects.filter((subj) => {
    const matchesSearch = 
      subj.name.toLowerCase().includes(search.toLowerCase()) ||
      subj.code.toLowerCase().includes(search.toLowerCase())
    const matchesDept = department ? subj.department === department : true
    const matchesStatus = status ? subj.status === status : true
    return matchesSearch && matchesDept && matchesStatus
  })

  // Departments List for filter dropdown
  const departments = Array.from(new Set(subjects.map(s => s.department))).filter(Boolean)
  const deptOptions = departments.map(d => ({ value: d, label: d }))

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredSubjects.length / ITEMS_PER_PAGE))
  const paginatedSubjects = filteredSubjects.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  )

  // KPI Calculations
  const totalCount = subjects.length
  const activeCount = subjects.filter(s => s.status === 'active').length
  const inactiveCount = subjects.filter(s => s.status === 'inactive').length
  const totalCredits = subjects.reduce((sum, s) => sum + (Number(s.credits) || 0), 0)

  // Actions
  const handleAddClick = () => {
    setSelectedSubject(null)
    setFormOpen(true)
  }

  const handleEditClick = (subj) => {
    setSelectedSubject(subj)
    setFormOpen(true)
  }

  const handleDeleteClick = (rows) => {
    if (rows && rows.length > 0) {
      setSelectedSubject(rows[0])
      setDeleteOpen(true)
    }
  }

  const handleAssignClick = (subj) => {
    setSelectedSubject(subj)
    setAssignOpen(true)
  }

  const handleFormSubmit = async (formData) => {
    setActionLoading(true)
    try {
      if (selectedSubject) {
        // Edit Mode
        const updated = await academicService.updateSubject(selectedSubject.id, formData)
        setSubjects(prev => prev.map(s => s.id === selectedSubject.id ? updated : s))
        setNotification({ variant: 'success', title: 'Subject Updated', message: `Subject "${updated.name}" updated successfully.` })
      } else {
        // Create Mode
        const created = await academicService.addSubject(formData)
        setSubjects(prev => [created, ...prev])
        setNotification({ variant: 'success', title: 'Subject Created', message: `Subject "${created.name}" created successfully.` })
      }
      setFormOpen(false)
    } catch (err) {
      setNotification({ variant: 'danger', title: 'Operation Failed', message: err.message })
    } finally {
      setActionLoading(false)
    }
  }

  const handleAssignSubmit = async (assignmentData) => {
    setActionLoading(true)
    try {
      const updated = await academicService.assignSubjectDetails(selectedSubject.id, assignmentData)
      setSubjects(prev => prev.map(s => s.id === selectedSubject.id ? updated : s))
      setNotification({
        variant: 'success',
        title: 'Assignments Updated',
        message: `Teacher and Class assignments updated for subject "${updated.name}".`
      })
      setAssignOpen(false)
    } catch (err) {
      setNotification({ variant: 'danger', title: 'Assignment Failed', message: err.message })
    } finally {
      setActionLoading(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedSubject) return
    setActionLoading(true)
    try {
      await academicService.deleteSubject(selectedSubject.id)
      setSubjects(prev => prev.filter(s => s.id !== selectedSubject.id))
      setNotification({ 
        variant: 'success', 
        title: 'Subject Deleted', 
        message: `Subject "${selectedSubject.name}" was permanently deleted.` 
      })
      setDeleteOpen(false)
      if (paginatedSubjects.length === 1 && page > 1) {
        setPage(page - 1)
      }
    } catch (err) {
      setNotification({ variant: 'danger', title: 'Deletion Error', message: err.message })
    } finally {
      setActionLoading(false)
    }
  }

  const getTeacherName = (teacherId) => {
    if (!teacherId) return <span className="text-muted-foreground italic text-xs">Unassigned</span>
    const teacher = teachers.find(t => t.id === teacherId)
    return teacher ? teacher.name : <span className="text-destructive font-semibold">Unknown</span>
  }

  // Define Table Columns
  const columns = [
    { header: 'Subject Name', accessor: 'name', sortable: true },
    { header: 'Subject Code', accessor: 'code', sortable: true },
    { header: 'Department', accessor: 'department', sortable: true },
    { header: 'Credits', accessor: 'credits', sortable: true },
    { 
      header: 'Assigned Teacher', 
      accessor: (row) => getTeacherName(row.teacherId), 
      sortable: false 
    },
    {
      header: 'Assigned Classes',
      accessor: (row) => {
        if (!row.assignedClasses || row.assignedClasses.length === 0) {
          return <span className="text-muted-foreground italic text-xs">None</span>
        }
        return (
          <div className="flex flex-wrap gap-1 max-w-[200px]">
            {row.assignedClasses.map(cId => {
              const cls = classes.find(c => c.id === cId)
              return (
                <span key={cId} className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-semibold whitespace-nowrap">
                  {cls ? cls.name : cId}
                </span>
              )
            })}
          </div>
        )
      },
      sortable: false
    },
    { 
      header: 'Status', 
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <StatusChip status={row.status} label={row.status === 'active' ? 'Active' : 'Inactive'} />
          <button
            onClick={() => handleToggleStatus(row)}
            className="text-[10px] uppercase font-bold text-primary hover:underline cursor-pointer select-none"
            title="Toggle status active/inactive"
          >
            Toggle
          </button>
        </div>
      ),
      sortable: true 
    },
    {
      header: 'Mappings',
      accessor: (row) => (
        <Button
          variant="outline"
          size="sm"
          className="text-xs h-7 py-1 px-2 flex items-center gap-1 select-none"
          onClick={() => handleAssignClick(row)}
        >
          Assign
        </Button>
      ),
      sortable: false
    }
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-lg border border-border bg-card p-6 animate-pulse" />
          ))}
        </div>
        <div className="h-64 rounded-lg border border-border bg-card animate-pulse" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="danger" title="Error Loading Data">
        {error}
        <div className="mt-2">
          <Button variant="outline" size="sm" onClick={fetchData}>Retry Loading</Button>
        </div>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <Alert 
          variant={notification.variant} 
          title={notification.title} 
          onClose={() => setNotification(null)}
          className="mb-4"
        >
          {notification.message}
        </Alert>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
        <StatCard title="Total Subjects" value={totalCount} icon={BookOpen} />
        <StatCard title="Active Courses" value={activeCount} icon={CheckCircle} className="border-l-4 border-l-emerald-500" />
        <StatCard title="Inactive Courses" value={inactiveCount} icon={XCircle} className="border-l-4 border-l-rose-500" />
        <StatCard title="Total Credit Hours" value={totalCredits} icon={Award} />
      </div>

      {/* Control panel & Action bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-card p-4 border border-border rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full sm:w-auto">
          <SearchBar 
            value={search} 
            onChange={handleSearchChange} 
            placeholder="Search by subject name or code..." 
          />
          <Filter
            value={department}
            onChange={handleDeptChange}
            placeholder="All Departments"
            options={deptOptions}
          />
          <Filter
            value={status}
            onChange={handleStatusChange}
            placeholder="All Statuses"
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' }
            ]}
          />
        </div>
        <Button onClick={handleAddClick} className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
          <Plus className="h-4 w-4" /> Add Subject
        </Button>
      </div>

      {/* Subjects Table */}
      <div className="bg-card border border-border rounded-lg shadow-sm p-4">
        <ReusableTable
          columns={columns}
          data={paginatedSubjects}
          selectable={false}
          onView={handleEditClick}
          onDelete={handleDeleteClick}
        />
        
        {filteredSubjects.length > 0 && (
          <TablePagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
          />
        )}
      </div>

      {/* Add / Edit Subject Modal Form */}
      {formOpen && (
        <SubjectForm
          isOpen={formOpen}
          onClose={() => setFormOpen(false)}
          onSubmit={handleFormSubmit}
          initialData={selectedSubject}
          loading={actionLoading}
        />
      )}

      {/* Assign Teacher & Classes Modal Dialog */}
      {assignOpen && selectedSubject && (
        <AssignSubjectDialog
          isOpen={assignOpen}
          onClose={() => setAssignOpen(false)}
          onSubmit={handleAssignSubmit}
          subject={selectedSubject}
          classes={classes}
          teachers={teachers}
          loading={actionLoading}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteOpen && selectedSubject && (
        <DeleteDialog
          isOpen={deleteOpen}
          onClose={() => setDeleteOpen(false)}
          onConfirm={handleConfirmDelete}
          itemName={`Subject "${selectedSubject.name}" (${selectedSubject.code})`}
          loading={actionLoading}
        />
      )}
    </div>
  )
}
