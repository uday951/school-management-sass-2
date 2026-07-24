import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PageHeader,
  PageContainer,
  ReusableTable,
  TablePagination,
  Button,
  DeleteDialog,
  SuccessDialog,
  FormDialog,
  Badge,
  StatusChip,
  Avatar,
  FormLayout,
  FormInput,
  FormSelect,
  FormTextarea,
  SearchBar
} from '@/components/shared'
import {
  Plus,
  Building2,
  Briefcase,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  GraduationCap,
  BookOpen,
  Filter,
  CheckCircle,
  XCircle,
  MoreVertical
} from 'lucide-react'
import teacherService from '@/services/teacherService'

export default function Teachers() {
  const navigate = useNavigate()

  // State
  const [teachers, setTeachers] = useState([])
  const [departments, setDepartments] = useState([])
  const [designations, setDesignations] = useState([])
  const [loading, setLoading] = useState(true)

  // Filters & Search State
  const [searchQuery, setSearchQuery] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [designationFilter, setDesignationFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  // Dialog States
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isSuccessOpen, setIsSuccessOpen] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [selectedTeacher, setSelectedTeacher] = useState(null)

  // Sub-resource Dialogs
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false)
  const [isDesigModalOpen, setIsDesigModalOpen] = useState(false)
  const [isAssignClassOpen, setIsAssignClassOpen] = useState(false)
  const [isAssignSubjectOpen, setIsAssignSubjectOpen] = useState(false)

  // Form States for Department & Designation creation
  const [deptForm, setDeptForm] = useState({ name: '', code: '', description: '' })
  const [desigForm, setDesigForm] = useState({ name: '', code: '', description: '' })
  const [assignClassForm, setAssignClassForm] = useState({ className: 'Grade 10', section: 'A', isClassTeacher: false })
  const [assignSubjectForm, setAssignSubjectForm] = useState({ subjectName: 'Mathematics', className: 'Grade 10' })

  // Initial Data Fetch
  const fetchData = async () => {
    setLoading(true)
    
    // Fetch teachers
    try {
      const tchRes = await teacherService.getTeachers({ page, limit, search: searchQuery, department: departmentFilter, designation: designationFilter, status: statusFilter })
      if (tchRes?.data) {
        setTeachers(tchRes.data)
      }
    } catch (err) {
      console.error('Failed to fetch teachers:', err)
    }

    // Fetch departments
    try {
      const deptData = await teacherService.getDepartments()
      if (deptData) {
        setDepartments(deptData)
      }
    } catch (err) {
      console.error('Failed to fetch departments:', err)
    }

    // Fetch designations
    try {
      const desigData = await teacherService.getDesignations()
      if (desigData) {
        setDesignations(desigData)
      }
    } catch (err) {
      console.error('Failed to fetch designations:', err)
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [page, limit, searchQuery, departmentFilter, designationFilter, statusFilter])

  // Filtered Teachers
  const filteredTeachers = useMemo(() => {
    return teachers.filter(t => {
      const name = `${t.firstName} ${t.lastName}`.toLowerCase()
      const empId = (t.employeeId || '').toLowerCase()
      const email = (t.email || '').toLowerCase()
      const q = searchQuery.toLowerCase()

      const matchesSearch = name.includes(q) || empId.includes(q) || email.includes(q)
      const matchesDept = departmentFilter ? t.department === departmentFilter : true
      const matchesDesig = designationFilter ? t.designation === designationFilter : true
      const matchesStatus = statusFilter ? t.status === statusFilter : true

      return matchesSearch && matchesDept && matchesDesig && matchesStatus
    })
  }, [teachers, searchQuery, departmentFilter, designationFilter, statusFilter])

  // Handlers
  const handleDeleteTrigger = (teacher) => {
    setSelectedTeacher(teacher)
    setIsDeleteOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedTeacher) return
    await teacherService.deleteTeacher(selectedTeacher._id || selectedTeacher.id)
    setIsDeleteOpen(false)
    setSuccessMsg(`Teacher '${selectedTeacher.firstName} ${selectedTeacher.lastName}' has been deleted.`)
    setIsSuccessOpen(true)
    fetchData()
  }

  const handleToggleStatus = async (teacher) => {
    const nextStatus = teacher.status === 'active' ? 'inactive' : 'active'
    await teacherService.toggleStatus(teacher._id || teacher.id, nextStatus)
    setSuccessMsg(`Status for ${teacher.firstName} updated to ${nextStatus}.`)
    setIsSuccessOpen(true)
    fetchData()
  }

  const handleAddDepartment = async (e) => {
    e.preventDefault()
    if (!deptForm.name || !deptForm.code) return
    await teacherService.createDepartment(deptForm)
    setDeptForm({ name: '', code: '', description: '' })
    setSuccessMsg('New Department created successfully.')
    setIsSuccessOpen(true)
    const depts = await teacherService.getDepartments()
    setDepartments(depts)
  }

  const handleDeleteDepartment = async (id) => {
    await teacherService.deleteDepartment(id)
    const depts = await teacherService.getDepartments()
    setDepartments(depts)
  }

  const handleAddDesignation = async (e) => {
    e.preventDefault()
    if (!desigForm.name || !desigForm.code) return
    await teacherService.createDesignation(desigForm)
    setDesigForm({ name: '', code: '', description: '' })
    setSuccessMsg('New Designation created successfully.')
    setIsSuccessOpen(true)
    const desigs = await teacherService.getDesignations()
    setDesignations(desigs)
  }

  const handleDeleteDesignation = async (id) => {
    await teacherService.deleteDesignation(id)
    const desigs = await teacherService.getDesignations()
    setDesignations(desigs)
  }

  const handleAssignClassSubmit = async (e) => {
    e.preventDefault()
    if (!selectedTeacher) return
    const currentClasses = selectedTeacher.assignedClasses || []
    const updated = [...currentClasses, { classId: `c_${Date.now()}`, ...assignClassForm }]
    await teacherService.assignClasses(selectedTeacher._id || selectedTeacher.id, updated)
    setIsAssignClassOpen(false)
    setSuccessMsg(`Class ${assignClassForm.className} ${assignClassForm.section} assigned successfully.`)
    setIsSuccessOpen(true)
    fetchData()
  }

  const handleAssignSubjectSubmit = async (e) => {
    e.preventDefault()
    if (!selectedTeacher) return
    const currentSubjects = selectedTeacher.assignedSubjects || []
    const updated = [...currentSubjects, { subjectId: `s_${Date.now()}`, ...assignSubjectForm }]
    await teacherService.assignSubjects(selectedTeacher._id || selectedTeacher.id, updated)
    setIsAssignSubjectOpen(false)
    setSuccessMsg(`Subject '${assignSubjectForm.subjectName}' assigned successfully.`)
    setIsSuccessOpen(true)
    fetchData()
  }

  // Table Columns Definition
  const columns = [
    {
      header: 'Teacher',
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <Avatar src={row.avatarUrl} fallback={`${row.firstName?.[0] || ''}${row.lastName?.[0] || ''}`} className="h-9 w-9 border border-border" />
          <div className="flex flex-col">
            <span className="font-semibold text-foreground hover:underline cursor-pointer" onClick={() => navigate(`/admin/teachers/${row._id || row.id}`)}>
              {row.firstName} {row.lastName}
            </span>
            <span className="text-xs text-muted-foreground">{row.email}</span>
          </div>
        </div>
      )
    },
    {
      header: 'ID',
      accessor: (row) => <Badge variant="outline" className="font-mono text-xs">{row.employeeId}</Badge>,
      sortable: true
    },
    {
      header: 'Department',
      accessor: 'department',
      sortable: true
    },
    {
      header: 'Designation',
      accessor: 'designation',
      sortable: true
    },
    {
      header: 'Phone',
      accessor: 'phone'
    },
    {
      header: 'Status',
      accessor: (row) => <StatusChip status={row.status} />
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            title="View Profile"
            onClick={() => navigate(`/admin/teachers/${row._id || row.id}`)}
          >
            <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            title="Edit Teacher"
            onClick={() => navigate(`/admin/teachers/create?edit=${row._id || row.id}`)}
          >
            <Edit className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            title="Assign Class"
            onClick={() => { setSelectedTeacher(row); setIsAssignClassOpen(true) }}
          >
            <GraduationCap className="h-4 w-4 text-primary" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            title="Assign Subject"
            onClick={() => { setSelectedTeacher(row); setIsAssignSubjectOpen(true) }}
          >
            <BookOpen className="h-4 w-4 text-primary" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            title={row.status === 'active' ? 'Deactivate' : 'Activate'}
            onClick={() => handleToggleStatus(row)}
          >
            {row.status === 'active' ? <UserX className="h-4 w-4 text-amber-500" /> : <UserCheck className="h-4 w-4 text-emerald-500" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            title="Delete"
            onClick={() => handleDeleteTrigger(row)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ]

  return (
    <PageContainer className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Teacher Management"
        description="Comprehensive directory for faculty onboarding, department setup, designations, and academic assignments."
      >
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => setIsDeptModalOpen(true)} className="flex items-center gap-2">
            <Building2 className="h-4 w-4" /> Departments
          </Button>
          <Button variant="outline" onClick={() => setIsDesigModalOpen(true)} className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" /> Designations
          </Button>
          <Button onClick={() => navigate('/admin/teachers/create')} className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Teacher
          </Button>
        </div>
      </PageHeader>

      {/* Filter Bar */}
      <div className="bg-card border border-border p-4 rounded-lg shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="w-full">
            <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">Search Faculty</label>
            <input
              type="text"
              placeholder="Search by name, ID, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">Department</label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm cursor-pointer"
            >
              <option value="">All Departments</option>
              {(departments && departments.length > 0
                ? departments
                : [
                    { name: 'Mathematics' },
                    { name: 'Science' },
                    { name: 'Humanities' },
                    { name: 'Languages' },
                    { name: 'Computer Science' }
                  ]
              ).map((d, i) => {
                const val = typeof d === 'string' ? d : d.name || d.code;
                return <option key={d._id || d.id || i} value={val}>{val}</option>
              })}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">Designation</label>
            <select
              value={designationFilter}
              onChange={(e) => setDesignationFilter(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm cursor-pointer"
            >
              <option value="">All Designations</option>
              {(designations && designations.length > 0
                ? designations
                : [
                    { name: 'Department Head' },
                    { name: 'Senior Teacher' },
                    { name: 'Assistant Teacher' },
                    { name: 'Lab Instructor' }
                  ]
              ).map((d, i) => {
                const val = typeof d === 'string' ? d : d.name || d.code;
                return <option key={d._id || d.id || i} value={val}>{val}</option>
              })}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on_leave">On Leave</option>
            </select>
          </div>
        </div>
      </div>

      {/* Teachers Directory Table */}
      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden p-4">
        <ReusableTable
          columns={columns}
          data={filteredTeachers}
        />
        <div className="mt-4">
          <TablePagination
            currentPage={page}
            totalPages={Math.ceil(filteredTeachers.length / limit) || 1}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      </div>

      {/* Department Management Dialog */}
      <FormDialog
        isOpen={isDeptModalOpen}
        onClose={() => setIsDeptModalOpen(false)}
        title="Department Management"
      >
        <div className="space-y-6">
          <form onSubmit={handleAddDepartment} className="space-y-3 p-3 bg-muted/30 rounded-lg border border-border">
            <h4 className="text-xs font-bold text-foreground uppercase">Add New Department</h4>
            <div className="grid grid-cols-2 gap-3">
              <FormInput label="Name" placeholder="e.g. Mathematics" value={deptForm.name} onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })} required />
              <FormInput label="Code" placeholder="e.g. MATH" value={deptForm.code} onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })} required />
            </div>
            <FormTextarea label="Description" placeholder="Brief department scope..." value={deptForm.description} onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })} rows={2} />
            <div className="flex justify-end">
              <Button size="sm" type="submit">Create Department</Button>
            </div>
          </form>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-muted-foreground uppercase">Existing Departments ({departments.length})</h4>
            <div className="divide-y divide-border border border-border rounded-md max-h-48 overflow-y-auto">
              {departments.map((d) => (
                <div key={d._id || d.id} className="p-2.5 flex items-center justify-between hover:bg-muted/20">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-foreground">{d.name}</span>
                      <Badge variant="outline">{d.code}</Badge>
                    </div>
                    {d.description && <p className="text-[11px] text-muted-foreground">{d.description}</p>}
                  </div>
                  <Button variant="ghost" size="sm" className="text-destructive h-7 w-7 p-0" onClick={() => handleDeleteDepartment(d._id || d.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </FormDialog>

      {/* Designation Management Dialog */}
      <FormDialog
        isOpen={isDesigModalOpen}
        onClose={() => setIsDesigModalOpen(false)}
        title="Designation Management"
      >
        <div className="space-y-6">
          <form onSubmit={handleAddDesignation} className="space-y-3 p-3 bg-muted/30 rounded-lg border border-border">
            <h4 className="text-xs font-bold text-foreground uppercase">Add New Designation</h4>
            <div className="grid grid-cols-2 gap-3">
              <FormInput label="Title" placeholder="e.g. Senior Lecturer" value={desigForm.name} onChange={(e) => setDesigForm({ ...desigForm, name: e.target.value })} required />
              <FormInput label="Code" placeholder="e.g. SL" value={desigForm.code} onChange={(e) => setDesigForm({ ...desigForm, code: e.target.value })} required />
            </div>
            <FormTextarea label="Description" placeholder="Role responsibilities..." value={desigForm.description} onChange={(e) => setDesigForm({ ...desigForm, description: e.target.value })} rows={2} />
            <div className="flex justify-end">
              <Button size="sm" type="submit">Create Designation</Button>
            </div>
          </form>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-muted-foreground uppercase">Existing Designations ({designations.length})</h4>
            <div className="divide-y divide-border border border-border rounded-md max-h-48 overflow-y-auto">
              {designations.map((d) => (
                <div key={d._id || d.id} className="p-2.5 flex items-center justify-between hover:bg-muted/20">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-foreground">{d.name}</span>
                      <Badge variant="outline">{d.code}</Badge>
                    </div>
                    {d.description && <p className="text-[11px] text-muted-foreground">{d.description}</p>}
                  </div>
                  <Button variant="ghost" size="sm" className="text-destructive h-7 w-7 p-0" onClick={() => handleDeleteDesignation(d._id || d.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </FormDialog>

      {/* Class Assignment Dialog */}
      <FormDialog
        isOpen={isAssignClassOpen}
        onClose={() => setIsAssignClassOpen(false)}
        title={`Assign Class to ${selectedTeacher ? selectedTeacher.firstName : ''}`}
      >
        <form onSubmit={handleAssignClassSubmit} className="space-y-4">
          <FormSelect
            label="Class Name"
            value={assignClassForm.className}
            onChange={(e) => setAssignClassForm({ ...assignClassForm, className: e.target.value })}
            options={[
              { value: 'Grade 8', label: 'Grade 8' },
              { value: 'Grade 9', label: 'Grade 9' },
              { value: 'Grade 10', label: 'Grade 10' },
              { value: 'Grade 11', label: 'Grade 11' },
              { value: 'Grade 12', label: 'Grade 12' }
            ]}
          />
          <FormSelect
            label="Section"
            value={assignClassForm.section}
            onChange={(e) => setAssignClassForm({ ...assignClassForm, section: e.target.value })}
            options={[
              { value: 'A', label: 'Section A' },
              { value: 'B', label: 'Section B' },
              { value: 'C', label: 'Section C' }
            ]}
          />
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isClassTeacher"
              checked={assignClassForm.isClassTeacher}
              onChange={(e) => setAssignClassForm({ ...assignClassForm, isClassTeacher: e.target.checked })}
              className="rounded border-input text-primary"
            />
            <label htmlFor="isClassTeacher" className="text-xs font-semibold text-foreground cursor-pointer">
              Designate as Class Teacher
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" type="button" onClick={() => setIsAssignClassOpen(false)}>Cancel</Button>
            <Button type="submit">Assign Class</Button>
          </div>
        </form>
      </FormDialog>

      {/* Subject Assignment Dialog */}
      <FormDialog
        isOpen={isAssignSubjectOpen}
        onClose={() => setIsAssignSubjectOpen(false)}
        title={`Assign Subject to ${selectedTeacher ? selectedTeacher.firstName : ''}`}
      >
        <form onSubmit={handleAssignSubjectSubmit} className="space-y-4">
          <FormInput
            label="Subject Name"
            placeholder="e.g. Mathematics, Physics, English"
            value={assignSubjectForm.subjectName}
            onChange={(e) => setAssignSubjectForm({ ...assignSubjectForm, subjectName: e.target.value })}
            required
          />
          <FormSelect
            label="Target Class"
            value={assignSubjectForm.className}
            onChange={(e) => setAssignSubjectForm({ ...assignSubjectForm, className: e.target.value })}
            options={[
              { value: 'Grade 8', label: 'Grade 8' },
              { value: 'Grade 9', label: 'Grade 9' },
              { value: 'Grade 10', label: 'Grade 10' },
              { value: 'Grade 11', label: 'Grade 11' },
              { value: 'Grade 12', label: 'Grade 12' }
            ]}
          />
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" type="button" onClick={() => setIsAssignSubjectOpen(false)}>Cancel</Button>
            <Button type="submit">Assign Subject</Button>
          </div>
        </form>
      </FormDialog>

      {/* Delete Confirmation & Success Dialogs */}
      <DeleteDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={selectedTeacher ? `${selectedTeacher.firstName} ${selectedTeacher.lastName}` : 'this teacher'}
      />
      <SuccessDialog
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        message={successMsg}
      />
    </PageContainer>
  )
}
