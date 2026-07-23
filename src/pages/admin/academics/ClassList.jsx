import React, { useState, useEffect } from 'react'
import { Plus, Users, CheckCircle, XCircle, Home } from 'lucide-react'
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
import ClassForm from './ClassForm'

const ITEMS_PER_PAGE = 5

export default function ClassList() {
  const [classes, setClasses] = useState([])
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Search & Filter State
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)

  // Modals & Notifications State
  const [selectedClass, setSelectedClass] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [notification, setNotification] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [classList, teacherList] = await Promise.all([
        academicService.getClasses(),
        academicService.getTeachers()
      ])
      setClasses(classList)
      setTeachers(teacherList)
    } catch (err) {
      setError(err.message || 'Failed to retrieve academic records.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Auto-clear notification after 4 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  // Reset page on search or filter change
  const handleSearchChange = (val) => {
    setSearch(val)
    setPage(1)
  }

  const handleStatusChange = (val) => {
    setStatus(val)
    setPage(1)
  }

  // Filter and Search logic
  const filteredClasses = classes.filter((cls) => {
    const matchesSearch = 
      cls.name.toLowerCase().includes(search.toLowerCase()) ||
      cls.code.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = status ? cls.status === status : true
    return matchesSearch && matchesStatus
  })

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredClasses.length / ITEMS_PER_PAGE))
  const paginatedClasses = filteredClasses.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  )

  // KPI calculations
  const totalCount = classes.length
  const activeCount = classes.filter(c => c.status === 'active').length
  const inactiveCount = classes.filter(c => c.status === 'inactive').length
  const totalCapacity = classes.reduce((sum, c) => sum + (c.capacity || 0), 0)

  // Actions
  const handleAddClick = () => {
    setSelectedClass(null)
    setFormOpen(true)
  }

  const handleEditClick = (cls) => {
    setSelectedClass(cls)
    setFormOpen(true)
  }

  const handleDeleteClick = (rows) => {
    // ReusableTable onDelete passes an array of selected rows or a single row
    if (rows && rows.length > 0) {
      setSelectedClass(rows[0])
      setDeleteOpen(true)
    }
  }

  const handleFormSubmit = async (formData) => {
    setActionLoading(true)
    try {
      if (selectedClass) {
        // Edit Mode
        const updated = await academicService.updateClass(selectedClass.id, formData)
        setNotification({ variant: 'success', title: 'Class Updated', message: `Class "${updated.name}" updated successfully.` })
      } else {
        // Create Mode
        const created = await academicService.addClass(formData)
        setNotification({ variant: 'success', title: 'Class Created', message: `Class "${created.name}" created successfully.` })
      }
      await fetchData()
      setFormOpen(false)
    } catch (err) {
      setNotification({ variant: 'danger', title: 'Operation Failed', message: err.message })
    } finally {
      setActionLoading(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedClass) return
    setActionLoading(true)
    try {
      await academicService.deleteClass(selectedClass.id)
      setNotification({ 
        variant: 'success', 
        title: 'Class Deleted', 
        message: `Class "${selectedClass.name}" was removed from the system.` 
      })
      await fetchData()
      setDeleteOpen(false)
      if (paginatedClasses.length === 1 && page > 1) {
        setPage(page - 1)
      }
    } catch (err) {
      setNotification({ variant: 'danger', title: 'Deletion Error', message: err.message })
    } finally {
      setActionLoading(false)
    }
  }

  // Resolve Teacher Name for the table columns
  const getTeacherName = (teacherId) => {
    if (!teacherId) return <span className="text-muted-foreground italic">Unassigned</span>
    const teacher = teachers.find(t => t.id === teacherId)
    return teacher ? teacher.name : <span className="text-destructive font-semibold">Unknown ({teacherId})</span>
  }

  // Define Table Columns
  const columns = [
    { header: 'Class Name', accessor: 'name', sortable: true },
    { header: 'Class Code', accessor: 'code', sortable: true },
    { header: 'Room', accessor: 'roomNumber', sortable: true },
    { header: 'Capacity', accessor: 'capacity', sortable: true },
    { header: 'Class Teacher', accessor: (row) => getTeacherName(row.teacherId), sortable: false },
    { 
      header: 'Status', 
      accessor: (row) => <StatusChip status={row.status} label={row.status === 'active' ? 'Active' : 'Inactive'} />,
      sortable: true 
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
        <StatCard title="Total Classes" value={totalCount} icon={Users} />
        <StatCard title="Active Registers" value={activeCount} icon={CheckCircle} className="border-l-4 border-l-emerald-500" />
        <StatCard title="Inactive Registers" value={inactiveCount} icon={XCircle} className="border-l-4 border-l-rose-500" />
        <StatCard title="Total Capacity Space" value={totalCapacity} icon={Home} />
      </div>

      {/* Control panel & Action bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-card p-4 border border-border rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full sm:w-auto">
          <SearchBar 
            value={search} 
            onChange={handleSearchChange} 
            placeholder="Search by class name or code..." 
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
          <Plus className="h-4 w-4" /> Add Class
        </Button>
      </div>

      {/* Classes Table */}
      <div className="bg-card border border-border rounded-lg shadow-sm p-4">
        <ReusableTable
          columns={columns}
          data={paginatedClasses}
          selectable={false}
          onView={handleEditClick} // Reuse edit for viewing/updating details
          onDelete={handleDeleteClick}
        />
        
        {filteredClasses.length > 0 && (
          <TablePagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
          />
        )}
      </div>

      {/* Add / Edit Class Modal Form */}
      {formOpen && (
        <ClassForm
          isOpen={formOpen}
          onClose={() => setFormOpen(false)}
          onSubmit={handleFormSubmit}
          initialData={selectedClass}
          teachers={teachers}
          loading={actionLoading}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteOpen && selectedClass && (
        <DeleteDialog
          isOpen={deleteOpen}
          onClose={() => setDeleteOpen(false)}
          onConfirm={handleConfirmDelete}
          itemName={`Class "${selectedClass.name}" (${selectedClass.code})`}
          loading={actionLoading}
        />
      )}
    </div>
  )
}
