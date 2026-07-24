import React, { useState, useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { 
  CalendarClock, 
  Clock, 
  Building2, 
  BookOpen, 
  UserCheck, 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Printer, 
  Check, 
  X, 
  RotateCcw,
  Sparkles,
  AlertTriangle,
  Calendar,
  Layers,
  MapPin
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { 
  Button, 
  LoadingButton,
  FormLayout as AppForm, 
  FormInput as AppInput, 
  FormSelect, 
  FormTextarea,
  ReusableTable as AppTable, 
  TablePagination as Pagination,
  FormDialog as AppDialog, 
  DeleteDialog,
  StatusChip as StatusBadge,
  Alert,
  SuccessDialog
} from '@/components/shared'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

// --- INITIAL EMPTY STATES ---

const initialPeriodForm = { name: '', startTime: '', endTime: '', duration: 45, isBreak: false, status: 'active' }
const initialTimetableForm = { academicYear: '2026-2027', campus: 'Main Campus', class: 'Grade 10', section: 'A', day: 'Monday', period: 'Period 1', subject: 'Mathematics', teacher: 'Dr. Evelyn Vance', room: 'R-101' }
const initialRoomForm = { roomNumber: '', capacity: 40, roomType: 'Classroom' }
const initialSubjectAllocationForm = { subject: '', teacher: '', class: 'Grade 10', weeklyHours: 5 }
const initialSubstituteForm = { originalTeacher: '', substituteTeacher: '', date: '', reason: '' }

export default function Timetable() {
  const location = useLocation()
  const navigate = useNavigate()

  // Extract active sub-tab from URL pathname
  const activeTab = useMemo(() => {
    const path = location.pathname
    if (path.includes('/create')) return 'create'
    if (path.includes('/teacher')) return 'teacher'
    if (path.includes('/class')) return 'class'
    if (path.includes('/rooms')) return 'rooms'
    if (path.includes('/periods')) return 'periods'
    if (path.includes('/subjects')) return 'subjects'
    if (path.includes('/substitutes')) return 'substitutes'
    return 'list'
  }, [location.pathname])

  // --- STATE FOR PERIODS ---
  const [periods, setPeriods] = useState([
    { _id: '1', name: 'Period 1', startTime: '08:00 AM', endTime: '08:45 AM', duration: 45, isBreak: false, status: 'active' },
    { _id: '2', name: 'Period 2', startTime: '08:45 AM', endTime: '09:30 AM', duration: 45, isBreak: false, status: 'active' },
    { _id: '3', name: 'Morning Break', startTime: '09:30 AM', endTime: '09:45 AM', duration: 15, isBreak: true, status: 'active' },
    { _id: '4', name: 'Period 3', startTime: '09:45 AM', endTime: '10:30 AM', duration: 45, isBreak: false, status: 'active' },
    { _id: '5', name: 'Period 4', startTime: '10:30 AM', endTime: '11:15 AM', duration: 45, isBreak: false, status: 'active' },
    { _id: '6', name: 'Lunch Break', startTime: '11:15 AM', endTime: '12:00 PM', duration: 45, isBreak: true, status: 'active' }
  ])

  // --- STATE FOR TIMETABLE ENTRIES ---
  const [timetables, setTimetables] = useState([
    { _id: '101', academicYear: '2026-2027', campus: 'Main Campus', class: 'Grade 10', section: 'A', day: 'Monday', period: 'Period 1', subject: 'Mathematics', teacher: 'Dr. Evelyn Vance', room: 'R-101' },
    { _id: '102', academicYear: '2026-2027', campus: 'Main Campus', class: 'Grade 10', section: 'A', day: 'Monday', period: 'Period 2', subject: 'Physics', teacher: 'Prof. Alan Turing', room: 'R-102' },
    { _id: '103', academicYear: '2026-2027', campus: 'Main Campus', class: 'Grade 10', section: 'A', day: 'Tuesday', period: 'Period 1', subject: 'Chemistry', teacher: 'Dr. Marie Curie', room: 'Lab-1' },
    { _id: '104', academicYear: '2026-2027', campus: 'Main Campus', class: 'Grade 9', section: 'B', day: 'Monday', period: 'Period 1', subject: 'English', teacher: 'Ms. Clara Oswald', room: 'R-201' }
  ])

  // --- STATE FOR ROOMS ---
  const [rooms, setRooms] = useState([
    { _id: 'r1', roomNumber: 'R-101', capacity: 40, roomType: 'Classroom' },
    { _id: 'r2', roomNumber: 'R-102', capacity: 45, roomType: 'Classroom' },
    { _id: 'r3', roomNumber: 'Lab-1', capacity: 30, roomType: 'Lab' },
    { _id: 'r4', roomNumber: 'Aud-Main', capacity: 200, roomType: 'Auditorium' }
  ])

  // --- STATE FOR SUBJECT ALLOCATIONS ---
  const [subjectAllocations, setSubjectAllocations] = useState([
    { _id: 'sa1', subject: 'Mathematics', teacher: 'Dr. Evelyn Vance', class: 'Grade 10', weeklyHours: 6 },
    { _id: 'sa2', subject: 'Physics', teacher: 'Prof. Alan Turing', class: 'Grade 10', weeklyHours: 5 },
    { _id: 'sa3', subject: 'Chemistry', teacher: 'Dr. Marie Curie', class: 'Grade 10', weeklyHours: 5 }
  ])

  // --- STATE FOR SUBSTITUTES ---
  const [substitutes, setSubstitutes] = useState([
    { _id: 'sub1', originalTeacher: 'Dr. Evelyn Vance', substituteTeacher: 'Mr. John Smith', date: '2026-07-25', reason: 'Medical Leave' }
  ])

  // FETCH BACKEND DATA ON MOUNT
  useEffect(() => {
    const fetchBackendData = async () => {
      try {
        const [resP, resT, resR, resSA, resS] = await Promise.all([
          fetch(`${API_BASE}/periods`),
          fetch(`${API_BASE}/timetables`),
          fetch(`${API_BASE}/rooms`),
          fetch(`${API_BASE}/subject-allocation`),
          fetch(`${API_BASE}/substitutes`)
        ])
        const [jsonP, jsonT, jsonR, jsonSA, jsonS] = await Promise.all([
          resP.json(), resT.json(), resR.json(), resSA.json(), resS.json()
        ])

        if (jsonP.success && Array.isArray(jsonP.data) && jsonP.data.length > 0) setPeriods(jsonP.data)
        if (jsonT.success && Array.isArray(jsonT.data) && jsonT.data.length > 0) setTimetables(jsonT.data)
        if (jsonR.success && Array.isArray(jsonR.data) && jsonR.data.length > 0) setRooms(jsonR.data)
        if (jsonSA.success && Array.isArray(jsonSA.data) && jsonSA.data.length > 0) setSubjectAllocations(jsonSA.data)
        if (jsonS.success && Array.isArray(jsonS.data) && jsonS.data.length > 0) setSubstitutes(jsonS.data)
      } catch (_err) {
        // Fallback to initial mock datasets
      }
    }
    fetchBackendData()
  }, [])

  // SEARCH & FILTER STATES FOR EACH TAB
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedClass, setSelectedClass] = useState('Grade 10')
  const [selectedSection, setSelectedSection] = useState('A')
  const [selectedTeacher, setSelectedTeacher] = useState('Dr. Evelyn Vance')
  const [selectedDay, setSelectedDay] = useState('All')
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'table'

  // MODAL FORM STATES
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogType, setDialogType] = useState('') // 'period' | 'timetable' | 'room' | 'subject' | 'substitute'
  const [isEditing, setIsEditing] = useState(false)
  const [activeItem, setActiveItem] = useState(null)
  
  const [periodForm, setPeriodForm] = useState(initialPeriodForm)
  const [timetableForm, setTimetableForm] = useState(initialTimetableForm)
  const [roomForm, setRoomForm] = useState(initialRoomForm)
  const [subjectForm, setSubjectForm] = useState(initialSubjectAllocationForm)
  const [substituteForm, setSubstituteForm] = useState(initialSubstituteForm)

  const [formError, setFormError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)

  const [showSuccess, setShowSuccess] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  // PRINT HANDLER
  const handlePrint = () => {
    window.print()
  }

  // FRONTEND CONFLICT CHECKER FOR TIMETABLE
  const checkTimetableConflict = (form, excludeId = null) => {
    const teacherConflict = timetables.find(t => 
      t._id !== excludeId && t.day === form.day && t.period === form.period && t.teacher === form.teacher
    )
    if (teacherConflict) {
      return `Teacher Conflict: Teacher '${form.teacher}' is already assigned to ${teacherConflict.class}-${teacherConflict.section} during ${form.period} on ${form.day}.`
    }

    const roomConflict = timetables.find(t => 
      t._id !== excludeId && t.day === form.day && t.period === form.period && t.room === form.room
    )
    if (roomConflict) {
      return `Room Conflict: Room '${form.room}' is already allocated to ${roomConflict.class}-${roomConflict.section} during ${form.period} on ${form.day}.`
    }

    const classConflict = timetables.find(t => 
      t._id !== excludeId && t.day === form.day && t.period === form.period && t.class === form.class && t.section === form.section
    )
    if (classConflict) {
      return `Class Schedule Conflict: Class ${form.class}-${form.section} already has '${classConflict.subject}' assigned during ${form.period} on ${form.day}.`
    }

    return null
  }

  // --- SUBMIT HANDLERS ---

  const handleSavePeriod = async (e) => {
    e.preventDefault()
    if (!periodForm.name || !periodForm.startTime || !periodForm.endTime) {
      setFormError('Please fill in all required period fields.')
      return
    }
    setFormError('')
    setIsSaving(true)

    try {
      if (isEditing && activeItem?._id) {
        const res = await fetch(`${API_BASE}/periods/${activeItem._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(periodForm)
        })
        const json = await res.json()
        if (json.success) {
          setPeriods(periods.map(p => p._id === activeItem._id ? json.data : p))
        } else {
          setPeriods(periods.map(p => p._id === activeItem._id ? { ...periodForm, _id: activeItem._id } : p))
        }
      } else {
        const res = await fetch(`${API_BASE}/periods`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(periodForm)
        })
        const json = await res.json()
        if (json.success) {
          setPeriods([...periods, json.data])
        } else {
          setPeriods([...periods, { ...periodForm, _id: String(Date.now()) }])
        }
      }
      setSuccessMsg('Period saved successfully.')
      setShowSuccess(true)
      setDialogOpen(false)
    } catch (_err) {
      setPeriods([...periods, { ...periodForm, _id: String(Date.now()) }])
      setSuccessMsg('Period saved locally.')
      setShowSuccess(true)
      setDialogOpen(false)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveTimetable = async (e) => {
    if (e) e.preventDefault()
    const conflict = checkTimetableConflict(timetableForm, isEditing ? activeItem?._id : null)
    if (conflict) {
      setFormError(conflict)
      return
    }
    setFormError('')
    setIsSaving(true)

    try {
      if (isEditing && activeItem?._id) {
        const res = await fetch(`${API_BASE}/timetables/${activeItem._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(timetableForm)
        })
        const json = await res.json()
        if (json.success) {
          setTimetables(timetables.map(t => t._id === activeItem._id ? json.data : t))
        } else {
          setTimetables(timetables.map(t => t._id === activeItem._id ? { ...timetableForm, _id: activeItem._id } : t))
        }
      } else {
        const res = await fetch(`${API_BASE}/timetables`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(timetableForm)
        })
        const json = await res.json()
        if (json.success) {
          setTimetables([...timetables, json.data])
        } else {
          setTimetables([...timetables, { ...timetableForm, _id: String(Date.now()) }])
        }
      }
      setSuccessMsg('Timetable entry saved without conflicts.')
      setShowSuccess(true)
      setDialogOpen(false)
      navigate('/admin/timetables/list')
    } catch (_err) {
      setTimetables([...timetables, { ...timetableForm, _id: String(Date.now()) }])
      setSuccessMsg('Timetable saved locally.')
      setShowSuccess(true)
      setDialogOpen(false)
      navigate('/admin/timetables/list')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveRoom = async (e) => {
    e.preventDefault()
    if (!roomForm.roomNumber || !roomForm.capacity) {
      setFormError('Room Number and Capacity are required.')
      return
    }
    setFormError('')
    setIsSaving(true)

    try {
      if (isEditing && activeItem?._id) {
        const res = await fetch(`${API_BASE}/rooms/${activeItem._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(roomForm)
        })
        const json = await res.json()
        if (json.success) {
          setRooms(rooms.map(r => r._id === activeItem._id ? json.data : r))
        } else {
          setRooms(rooms.map(r => r._id === activeItem._id ? { ...roomForm, _id: activeItem._id } : r))
        }
      } else {
        const res = await fetch(`${API_BASE}/rooms`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(roomForm)
        })
        const json = await res.json()
        if (json.success) {
          setRooms([...rooms, json.data])
        } else {
          setRooms([...rooms, { ...roomForm, _id: String(Date.now()) }])
        }
      }
      setSuccessMsg('Room allocation saved successfully.')
      setShowSuccess(true)
      setDialogOpen(false)
    } catch (_err) {
      setRooms([...rooms, { ...roomForm, _id: String(Date.now()) }])
      setSuccessMsg('Room allocation saved locally.')
      setShowSuccess(true)
      setDialogOpen(false)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveSubjectAllocation = async (e) => {
    e.preventDefault()
    if (!subjectForm.subject || !subjectForm.teacher || !subjectForm.class) {
      setFormError('Subject, Teacher, and Class are required.')
      return
    }
    setFormError('')
    setIsSaving(true)

    try {
      if (isEditing && activeItem?._id) {
        const res = await fetch(`${API_BASE}/subject-allocation/${activeItem._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subjectForm)
        })
        const json = await res.json()
        if (json.success) {
          setSubjectAllocations(subjectAllocations.map(s => s._id === activeItem._id ? json.data : s))
        } else {
          setSubjectAllocations(subjectAllocations.map(s => s._id === activeItem._id ? { ...subjectForm, _id: activeItem._id } : s))
        }
      } else {
        const res = await fetch(`${API_BASE}/subject-allocation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subjectForm)
        })
        const json = await res.json()
        if (json.success) {
          setSubjectAllocations([...subjectAllocations, json.data])
        } else {
          setSubjectAllocations([...subjectAllocations, { ...subjectForm, _id: String(Date.now()) }])
        }
      }
      setSuccessMsg('Subject allocation assigned successfully.')
      setShowSuccess(true)
      setDialogOpen(false)
    } catch (_err) {
      setSubjectAllocations([...subjectAllocations, { ...subjectForm, _id: String(Date.now()) }])
      setSuccessMsg('Subject allocation assigned locally.')
      setShowSuccess(true)
      setDialogOpen(false)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveSubstitute = async (e) => {
    e.preventDefault()
    if (!substituteForm.originalTeacher || !substituteForm.substituteTeacher || !substituteForm.date) {
      setFormError('Original Teacher, Substitute Teacher, and Date are required.')
      return
    }
    if (substituteForm.originalTeacher === substituteForm.substituteTeacher) {
      setFormError('Substitute teacher cannot be the same as the original teacher.')
      return
    }
    setFormError('')
    setIsSaving(true)

    try {
      if (isEditing && activeItem?._id) {
        const res = await fetch(`${API_BASE}/substitutes/${activeItem._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(substituteForm)
        })
        const json = await res.json()
        if (json.success) {
          setSubstitutes(substitutes.map(s => s._id === activeItem._id ? json.data : s))
        } else {
          setSubstitutes(substitutes.map(s => s._id === activeItem._id ? { ...substituteForm, _id: activeItem._id } : s))
        }
      } else {
        const res = await fetch(`${API_BASE}/substitutes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(substituteForm)
        })
        const json = await res.json()
        if (json.success) {
          setSubstitutes([...substitutes, json.data])
        } else {
          setSubstitutes([...substitutes, { ...substituteForm, _id: String(Date.now()) }])
        }
      }
      setSuccessMsg('Substitute teacher assigned successfully.')
      setShowSuccess(true)
      setDialogOpen(false)
    } catch (_err) {
      setSubstitutes([...substitutes, { ...substituteForm, _id: String(Date.now()) }])
      setSuccessMsg('Substitute teacher assigned locally.')
      setShowSuccess(true)
      setDialogOpen(false)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return
    setIsSaving(true)
    const { type, id } = itemToDelete

    try {
      if (type === 'period') {
        await fetch(`${API_BASE}/periods/${id}`, { method: 'DELETE' }).catch(() => {})
        setPeriods(periods.filter(p => p._id !== id))
      } else if (type === 'timetable') {
        await fetch(`${API_BASE}/timetables/${id}`, { method: 'DELETE' }).catch(() => {})
        setTimetables(timetables.filter(t => t._id !== id))
      } else if (type === 'room') {
        await fetch(`${API_BASE}/rooms/${id}`, { method: 'DELETE' }).catch(() => {})
        setRooms(rooms.filter(r => r._id !== id))
      } else if (type === 'subject') {
        await fetch(`${API_BASE}/subject-allocation/${id}`, { method: 'DELETE' }).catch(() => {})
        setSubjectAllocations(subjectAllocations.filter(s => s._id !== id))
      } else if (type === 'substitute') {
        await fetch(`${API_BASE}/substitutes/${id}`, { method: 'DELETE' }).catch(() => {})
        setSubstitutes(substitutes.filter(s => s._id !== id))
      }
      setSuccessMsg('Record deleted successfully.')
      setShowSuccess(true)
    } catch (_err) {
      // Fallback
    } finally {
      setIsSaving(false)
      setDeleteDialogOpen(false)
      setItemToDelete(null)
    }
  }

  // --- RENDER TIMETABLE GRID MATRIX FOR CLASS OR TEACHER ---

  const renderTimetableGrid = (filterKey, filterVal) => {
    const activePeriods = periods.filter(p => !p.isBreak)

    return (
      <div className="overflow-x-auto border border-border rounded-lg bg-card shadow-sm">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-muted/50 text-xs font-bold uppercase border-b border-border">
            <tr>
              <th className="px-4 py-3 border-r border-border">Day / Period</th>
              {activePeriods.map(p => (
                <th key={p._id} className="px-4 py-3 border-r border-border min-w-[140px] text-center">
                  <div>{p.name}</div>
                  <div className="text-[10px] text-muted-foreground font-normal">{p.startTime} - {p.endTime}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {DAYS_OF_WEEK.map(day => (
              <tr key={day} className="hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3 font-semibold border-r border-border bg-muted/10">{day}</td>
                {activePeriods.map(p => {
                  const entry = timetables.find(t => 
                    t.day === day && 
                    t.period === p.name && 
                    t[filterKey] === filterVal
                  )
                  return (
                    <td key={p._id} className="px-3 py-2.5 border-r border-border text-center align-top">
                      {entry ? (
                        <div className="bg-primary/10 border border-primary/20 rounded p-2 text-left space-y-1">
                          <div className="font-bold text-xs text-primary">{entry.subject}</div>
                          <div className="text-[11px] text-foreground font-medium">{filterKey === 'teacher' ? `${entry.class}-${entry.section}` : entry.teacher}</div>
                          <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Building2 className="h-3 w-3 inline" /> {entry.room}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">— Free —</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 p-4 md:p-6 animate-in fade-in duration-200">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5 mb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CalendarClock className="h-6 w-6 text-primary" />
            Timetable Management Module
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Configure period schedules, class timetables, room allocations, and teacher substitutes.</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handlePrint} className="flex items-center gap-1.5">
            <Printer className="h-4 w-4" />
            Print Timetable
          </Button>
          <Button onClick={() => navigate('/admin/timetables/create')} className="flex items-center gap-1.5">
            <Plus className="h-4 w-4" />
            Create Entry
          </Button>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex border-b border-border overflow-x-auto">
        {[
          { key: 'list', label: 'Master Timetable', icon: CalendarClock },
          { key: 'create', label: 'Create / Edit', icon: Plus },
          { key: 'teacher', label: 'Teacher Timetable', icon: UserCheck },
          { key: 'class', label: 'Class Timetable', icon: Users },
          { key: 'periods', label: 'Period Management', icon: Clock },
          { key: 'rooms', label: 'Room Allocation', icon: Building2 },
          { key: 'subjects', label: 'Subject Allocation', icon: BookOpen },
          { key: 'substitutes', label: 'Substitute Management', icon: Layers }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => navigate(`/admin/timetables/${tab.key === 'list' ? '' : tab.key}`)}
            className={cn(
              "px-4 py-2.5 border-b-2 text-sm font-semibold transition-colors cursor-pointer select-none flex items-center gap-2 whitespace-nowrap",
              activeTab === tab.key 
                ? "border-primary text-primary bg-primary/5" 
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* --- TAB 1: MASTER TIMETABLE LIST --- */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-card p-4 rounded-lg border border-border shadow-sm">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="relative min-w-[200px]">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search subject, teacher, room..."
                  className="w-full h-9 pl-9 pr-4 rounded-md border border-input bg-background text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
                />
              </div>

              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm cursor-pointer text-foreground"
              >
                <option value="Grade 10">Grade 10</option>
                <option value="Grade 9">Grade 9</option>
                <option value="Grade 8">Grade 8</option>
              </select>

              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm cursor-pointer text-foreground"
              >
                <option value="All">All Days</option>
                {DAYS_OF_WEEK.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Button variant={viewMode === 'grid' ? 'default' : 'outline'} onClick={() => setViewMode('grid')} className="text-xs">
                Weekly Grid View
              </Button>
              <Button variant={viewMode === 'table' ? 'default' : 'outline'} onClick={() => setViewMode('table')} className="text-xs">
                List Table View
              </Button>
            </div>
          </div>

          {viewMode === 'grid' ? (
            renderTimetableGrid('class', selectedClass)
          ) : (
            <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
              <AppTable
                columns={[
                  { header: 'Academic Year', accessor: 'academicYear' },
                  { header: 'Class & Section', accessor: row => `${row.class} - ${row.section}` },
                  { header: 'Day', accessor: 'day' },
                  { header: 'Period', accessor: 'period' },
                  { header: 'Subject', accessor: 'subject' },
                  { header: 'Teacher', accessor: 'teacher' },
                  { header: 'Room', accessor: 'room' },
                  {
                    header: 'Actions',
                    accessor: row => (
                      <button
                        onClick={() => {
                          setItemToDelete({ type: 'timetable', id: row._id, name: `${row.subject} (${row.day})` })
                          setDeleteDialogOpen(true)
                        }}
                        className="h-7 w-7 inline-flex items-center justify-center rounded border border-border hover:bg-destructive/10 text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )
                  }
                ]}
                data={timetables.filter(t => 
                  (selectedDay === 'All' || t.day === selectedDay) &&
                  (t.subject.toLowerCase().includes(searchQuery.toLowerCase()) || t.teacher.toLowerCase().includes(searchQuery.toLowerCase()))
                )}
              />
            </div>
          )}
        </div>
      )}

      {/* --- TAB 2: CREATE / EDIT TIMETABLE ENTRY --- */}
      {activeTab === 'create' && (
        <div className="bg-card p-6 rounded-lg border border-border shadow-sm max-w-4xl mx-auto space-y-6">
          <div className="border-b border-border pb-3">
            <h3 className="text-base font-bold text-foreground">Create Timetable Entry</h3>
            <p className="text-xs text-muted-foreground">Assign periods, subjects, teachers, and rooms with automatic conflict prevention checks.</p>
          </div>

          {formError && (
            <Alert variant="danger" title="Schedule Conflict Warning">
              {formError}
            </Alert>
          )}

          <AppForm onSubmit={handleSaveTimetable} className="gap-4">
            <FormSelect
              label="Academic Year"
              value={timetableForm.academicYear}
              onChange={e => setTimetableForm({ ...timetableForm, academicYear: e.target.value })}
              options={[
                { value: '2026-2027', label: '2026-2027' },
                { value: '2025-2026', label: '2025-2026' }
              ]}
            />

            <FormSelect
              label="Campus"
              value={timetableForm.campus}
              onChange={e => setTimetableForm({ ...timetableForm, campus: e.target.value })}
              options={[
                { value: 'Main Campus', label: 'Main Campus' },
                { value: 'North Extension', label: 'North Extension' }
              ]}
            />

            <FormSelect
              label="Class"
              value={timetableForm.class}
              onChange={e => setTimetableForm({ ...timetableForm, class: e.target.value })}
              options={[
                { value: 'Grade 10', label: 'Grade 10' },
                { value: 'Grade 9', label: 'Grade 9' },
                { value: 'Grade 8', label: 'Grade 8' }
              ]}
            />

            <FormSelect
              label="Section"
              value={timetableForm.section}
              onChange={e => setTimetableForm({ ...timetableForm, section: e.target.value })}
              options={[
                { value: 'A', label: 'Section A' },
                { value: 'B', label: 'Section B' },
                { value: 'C', label: 'Section C' }
              ]}
            />

            <FormSelect
              label="Day"
              value={timetableForm.day}
              onChange={e => setTimetableForm({ ...timetableForm, day: e.target.value })}
              options={DAYS_OF_WEEK.map(d => ({ value: d, label: d }))}
            />

            <FormSelect
              label="Period"
              value={timetableForm.period}
              onChange={e => setTimetableForm({ ...timetableForm, period: e.target.value })}
              options={periods.filter(p => !p.isBreak).map(p => ({ value: p.name, label: `${p.name} (${p.startTime} - ${p.endTime})` }))}
            />

            <AppInput
              label="Subject"
              value={timetableForm.subject}
              onChange={e => setTimetableForm({ ...timetableForm, subject: e.target.value })}
            />

            <AppInput
              label="Teacher Name"
              value={timetableForm.teacher}
              onChange={e => setTimetableForm({ ...timetableForm, teacher: e.target.value })}
            />

            <FormSelect
              label="Room"
              value={timetableForm.room}
              onChange={e => setTimetableForm({ ...timetableForm, room: e.target.value })}
              options={rooms.map(r => ({ value: r.roomNumber, label: `${r.roomNumber} (${r.roomType})` }))}
              className="md:col-span-2"
            />

            <div className="flex justify-end gap-2 md:col-span-2 border-t border-border pt-4 mt-2">
              <Button variant="outline" type="button" onClick={() => navigate('/admin/timetables/list')}>
                Cancel
              </Button>
              <LoadingButton type="submit" loading={isSaving}>
                Save Timetable Entry
              </LoadingButton>
            </div>
          </AppForm>
        </div>
      )}

      {/* --- TAB 3: TEACHER TIMETABLE --- */}
      {activeTab === 'teacher' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card p-4 rounded-lg border border-border shadow-sm">
            <div className="flex items-center gap-3">
              <UserCheck className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold">Select Teacher:</span>
              <select
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm font-medium cursor-pointer text-foreground"
              >
                <option value="Dr. Evelyn Vance">Dr. Evelyn Vance</option>
                <option value="Prof. Alan Turing">Prof. Alan Turing</option>
                <option value="Dr. Marie Curie">Dr. Marie Curie</option>
                <option value="Ms. Clara Oswald">Ms. Clara Oswald</option>
              </select>
            </div>

            <Button variant="outline" onClick={handlePrint} className="flex items-center gap-1.5">
              <Printer className="h-4 w-4" />
              Print Schedule
            </Button>
          </div>

          {renderTimetableGrid('teacher', selectedTeacher)}
        </div>
      )}

      {/* --- TAB 4: CLASS TIMETABLE --- */}
      {activeTab === 'class' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card p-4 rounded-lg border border-border shadow-sm">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold">Select Class:</span>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm font-medium cursor-pointer text-foreground"
              >
                <option value="Grade 10">Grade 10</option>
                <option value="Grade 9">Grade 9</option>
                <option value="Grade 8">Grade 8</option>
              </select>
            </div>

            <Button variant="outline" onClick={handlePrint} className="flex items-center gap-1.5">
              <Printer className="h-4 w-4" />
              Print Class Timetable
            </Button>
          </div>

          {renderTimetableGrid('class', selectedClass)}
        </div>
      )}

      {/* --- TAB 5: PERIOD MANAGEMENT --- */}
      {activeTab === 'periods' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-card p-4 rounded-lg border border-border shadow-sm">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Period Schedule Configuration
            </h3>
            <Button onClick={() => {
              setPeriodForm(initialPeriodForm)
              setIsEditing(false)
              setDialogType('period')
              setDialogOpen(true)
            }} className="flex items-center gap-1.5">
              <Plus className="h-4 w-4" />
              Add Period
            </Button>
          </div>

          <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
            <AppTable
              columns={[
                { header: 'Period Name', accessor: 'name' },
                { header: 'Start Time', accessor: 'startTime' },
                { header: 'End Time', accessor: 'endTime' },
                { header: 'Duration', accessor: row => `${row.duration} mins` },
                { header: 'Break Period', accessor: row => row.isBreak ? <span className="text-xs px-2 py-0.5 bg-warning/20 text-warning-foreground font-semibold rounded">Break</span> : <span className="text-xs text-muted-foreground">Class Period</span> },
                { header: 'Status', accessor: row => <StatusBadge status={row.status} /> },
                {
                  header: 'Actions',
                  accessor: row => (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setActiveItem(row)
                          setPeriodForm(row)
                          setIsEditing(true)
                          setDialogType('period')
                          setDialogOpen(true)
                        }}
                        className="h-7 w-7 inline-flex items-center justify-center rounded border border-border hover:bg-muted text-primary"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setItemToDelete({ type: 'period', id: row._id, name: row.name })
                          setDeleteDialogOpen(true)
                        }}
                        className="h-7 w-7 inline-flex items-center justify-center rounded border border-border hover:bg-destructive/10 text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )
                }
              ]}
              data={periods}
            />
          </div>
        </div>
      )}

      {/* --- TAB 6: ROOM ALLOCATION --- */}
      {activeTab === 'rooms' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-card p-4 rounded-lg border border-border shadow-sm">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Room Allocation & Capacity
            </h3>
            <Button onClick={() => {
              setRoomForm(initialRoomForm)
              setIsEditing(false)
              setDialogType('room')
              setDialogOpen(true)
            }} className="flex items-center gap-1.5">
              <Plus className="h-4 w-4" />
              Add Room
            </Button>
          </div>

          <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
            <AppTable
              columns={[
                { header: 'Room Number', accessor: 'roomNumber' },
                { header: 'Capacity', accessor: row => `${row.capacity} students` },
                { header: 'Room Type', accessor: 'roomType' },
                {
                  header: 'Actions',
                  accessor: row => (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setActiveItem(row)
                          setRoomForm(row)
                          setIsEditing(true)
                          setDialogType('room')
                          setDialogOpen(true)
                        }}
                        className="h-7 w-7 inline-flex items-center justify-center rounded border border-border hover:bg-muted text-primary"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setItemToDelete({ type: 'room', id: row._id, name: row.roomNumber })
                          setDeleteDialogOpen(true)
                        }}
                        className="h-7 w-7 inline-flex items-center justify-center rounded border border-border hover:bg-destructive/10 text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )
                }
              ]}
              data={rooms}
            />
          </div>
        </div>
      )}

      {/* --- TAB 7: SUBJECT ALLOCATION --- */}
      {activeTab === 'subjects' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-card p-4 rounded-lg border border-border shadow-sm">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Subject & Teacher Allocation
            </h3>
            <Button onClick={() => {
              setSubjectForm(initialSubjectAllocationForm)
              setIsEditing(false)
              setDialogType('subject')
              setDialogOpen(true)
            }} className="flex items-center gap-1.5">
              <Plus className="h-4 w-4" />
              Assign Subject
            </Button>
          </div>

          <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
            <AppTable
              columns={[
                { header: 'Subject', accessor: 'subject' },
                { header: 'Teacher', accessor: 'teacher' },
                { header: 'Class', accessor: 'class' },
                { header: 'Weekly Hours', accessor: row => `${row.weeklyHours} hrs/week` },
                {
                  header: 'Actions',
                  accessor: row => (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setActiveItem(row)
                          setSubjectForm(row)
                          setIsEditing(true)
                          setDialogType('subject')
                          setDialogOpen(true)
                        }}
                        className="h-7 w-7 inline-flex items-center justify-center rounded border border-border hover:bg-muted text-primary"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setItemToDelete({ type: 'subject', id: row._id, name: `${row.subject} (${row.class})` })
                          setDeleteDialogOpen(true)
                        }}
                        className="h-7 w-7 inline-flex items-center justify-center rounded border border-border hover:bg-destructive/10 text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )
                }
              ]}
              data={subjectAllocations}
            />
          </div>
        </div>
      )}

      {/* --- TAB 8: SUBSTITUTE MANAGEMENT --- */}
      {activeTab === 'substitutes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-card p-4 rounded-lg border border-border shadow-sm">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              Substitute Teacher Management
            </h3>
            <Button onClick={() => {
              setSubstituteForm(initialSubstituteForm)
              setIsEditing(false)
              setDialogType('substitute')
              setDialogOpen(true)
            }} className="flex items-center gap-1.5">
              <Plus className="h-4 w-4" />
              Assign Substitute
            </Button>
          </div>

          <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
            <AppTable
              columns={[
                { header: 'Original Teacher', accessor: 'originalTeacher' },
                { header: 'Substitute Teacher', accessor: 'substituteTeacher' },
                { header: 'Date', accessor: 'date' },
                { header: 'Reason', accessor: 'reason' },
                {
                  header: 'Actions',
                  accessor: row => (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setActiveItem(row)
                          setSubstituteForm(row)
                          setIsEditing(true)
                          setDialogType('substitute')
                          setDialogOpen(true)
                        }}
                        className="h-7 w-7 inline-flex items-center justify-center rounded border border-border hover:bg-muted text-primary"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setItemToDelete({ type: 'substitute', id: row._id, name: `Substitute for ${row.originalTeacher}` })
                          setDeleteDialogOpen(true)
                        }}
                        className="h-7 w-7 inline-flex items-center justify-center rounded border border-border hover:bg-destructive/10 text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )
                }
              ]}
              data={substitutes}
            />
          </div>
        </div>
      )}

      {/* --- DIALOG MODALS FOR CRUD ACTIONS --- */}

      {/* PERIOD DIALOG */}
      {dialogType === 'period' && (
        <AppDialog
          isOpen={dialogOpen}
          onClose={() => setDialogOpen(false)}
          title={isEditing ? 'Edit Period' : 'Add Period'}
        >
          <AppForm onSubmit={handleSavePeriod} className="gap-4 mt-2">
            {formError && <Alert variant="danger">{formError}</Alert>}
            <AppInput
              label="Period Name"
              value={periodForm.name}
              onChange={e => setPeriodForm({ ...periodForm, name: e.target.value })}
              className="md:col-span-2"
            />
            <AppInput
              label="Start Time"
              type="time"
              value={periodForm.startTime}
              onChange={e => setPeriodForm({ ...periodForm, startTime: e.target.value })}
            />
            <AppInput
              label="End Time"
              type="time"
              value={periodForm.endTime}
              onChange={e => setPeriodForm({ ...periodForm, endTime: e.target.value })}
            />
            <AppInput
              label="Duration (mins)"
              type="number"
              value={periodForm.duration}
              onChange={e => setPeriodForm({ ...periodForm, duration: parseInt(e.target.value, 10) || 0 })}
            />
            <FormSelect
              label="Period Type"
              value={periodForm.isBreak ? 'break' : 'class'}
              onChange={e => setPeriodForm({ ...periodForm, isBreak: e.target.value === 'break' })}
              options={[
                { value: 'class', label: 'Regular Class Period' },
                { value: 'break', label: 'Break Interval' }
              ]}
            />
            <div className="flex justify-end gap-2 md:col-span-2 border-t border-border pt-4 mt-2">
              <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <LoadingButton type="submit" loading={isSaving}>Save Period</LoadingButton>
            </div>
          </AppForm>
        </AppDialog>
      )}

      {/* ROOM DIALOG */}
      {dialogType === 'room' && (
        <AppDialog
          isOpen={dialogOpen}
          onClose={() => setDialogOpen(false)}
          title={isEditing ? 'Edit Room' : 'Add Room'}
        >
          <AppForm onSubmit={handleSaveRoom} className="gap-4 mt-2">
            {formError && <Alert variant="danger">{formError}</Alert>}
            <AppInput
              label="Room Number"
              value={roomForm.roomNumber}
              onChange={e => setRoomForm({ ...roomForm, roomNumber: e.target.value })}
            />
            <AppInput
              label="Capacity"
              type="number"
              value={roomForm.capacity}
              onChange={e => setRoomForm({ ...roomForm, capacity: parseInt(e.target.value, 10) || 0 })}
            />
            <FormSelect
              label="Room Type"
              value={roomForm.roomType}
              onChange={e => setRoomForm({ ...roomForm, roomType: e.target.value })}
              options={[
                { value: 'Classroom', label: 'Classroom' },
                { value: 'Lab', label: 'Lab' },
                { value: 'Auditorium', label: 'Auditorium' },
                { value: 'Library', label: 'Library' },
                { value: 'Sports Hall', label: 'Sports Hall' },
                { value: 'Other', label: 'Other' }
              ]}
              className="md:col-span-2"
            />
            <div className="flex justify-end gap-2 md:col-span-2 border-t border-border pt-4 mt-2">
              <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <LoadingButton type="submit" loading={isSaving}>Save Room</LoadingButton>
            </div>
          </AppForm>
        </AppDialog>
      )}

      {/* SUBJECT ALLOCATION DIALOG */}
      {dialogType === 'subject' && (
        <AppDialog
          isOpen={dialogOpen}
          onClose={() => setDialogOpen(false)}
          title={isEditing ? 'Edit Subject Assignment' : 'Assign Subject'}
        >
          <AppForm onSubmit={handleSaveSubjectAllocation} className="gap-4 mt-2">
            {formError && <Alert variant="danger">{formError}</Alert>}
            <AppInput
              label="Subject Name"
              value={subjectForm.subject}
              onChange={e => setSubjectForm({ ...subjectForm, subject: e.target.value })}
            />
            <AppInput
              label="Teacher Name"
              value={subjectForm.teacher}
              onChange={e => setSubjectForm({ ...subjectForm, teacher: e.target.value })}
            />
            <FormSelect
              label="Class"
              value={subjectForm.class}
              onChange={e => setSubjectForm({ ...subjectForm, class: e.target.value })}
              options={[
                { value: 'Grade 10', label: 'Grade 10' },
                { value: 'Grade 9', label: 'Grade 9' },
                { value: 'Grade 8', label: 'Grade 8' }
              ]}
            />
            <AppInput
              label="Weekly Hours"
              type="number"
              value={subjectForm.weeklyHours}
              onChange={e => setSubjectForm({ ...subjectForm, weeklyHours: parseInt(e.target.value, 10) || 0 })}
            />
            <div className="flex justify-end gap-2 md:col-span-2 border-t border-border pt-4 mt-2">
              <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <LoadingButton type="submit" loading={isSaving}>Save Assignment</LoadingButton>
            </div>
          </AppForm>
        </AppDialog>
      )}

      {/* SUBSTITUTE DIALOG */}
      {dialogType === 'substitute' && (
        <AppDialog
          isOpen={dialogOpen}
          onClose={() => setDialogOpen(false)}
          title={isEditing ? 'Edit Substitute Assignment' : 'Assign Substitute Teacher'}
        >
          <AppForm onSubmit={handleSaveSubstitute} className="gap-4 mt-2">
            {formError && <Alert variant="danger">{formError}</Alert>}
            <AppInput
              label="Original Teacher"
              value={substituteForm.originalTeacher}
              onChange={e => setSubstituteForm({ ...substituteForm, originalTeacher: e.target.value })}
            />
            <AppInput
              label="Substitute Teacher"
              value={substituteForm.substituteTeacher}
              onChange={e => setSubstituteForm({ ...substituteForm, substituteTeacher: e.target.value })}
            />
            <AppInput
              label="Date"
              type="date"
              value={substituteForm.date}
              onChange={e => setSubstituteForm({ ...substituteForm, date: e.target.value })}
            />
            <FormTextarea
              label="Reason"
              value={substituteForm.reason}
              onChange={e => setSubstituteForm({ ...substituteForm, reason: e.target.value })}
              rows={2}
              className="md:col-span-2"
            />
            <div className="flex justify-end gap-2 md:col-span-2 border-t border-border pt-4 mt-2">
              <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <LoadingButton type="submit" loading={isSaving}>Assign Substitute</LoadingButton>
            </div>
          </AppForm>
        </AppDialog>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      <DeleteDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={itemToDelete?.name || 'this item'}
        loading={isSaving}
      />

      {/* SUCCESS NOTIFICATION DIALOG */}
      <SuccessDialog
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Action Successful"
        message={successMsg}
      />

    </div>
  )
}
