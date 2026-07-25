import React, { useState, useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { 
  BookOpen, 
  BookMarked, 
  Library as LibraryIcon, 
  UserCheck, 
  Building2, 
  FileText, 
  DollarSign, 
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
  Bookmark,
  Calendar,
  Layers,
  Users,
  PieChart,
  BarChart3,
  BookCopy,
  Clock
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

// --- INITIAL FORM STATES ---

const initialCategoryForm = { categoryName: '', description: '', status: 'active' }
const initialBookForm = { isbn: '', title: '', category: 'General', author: '', publisher: '', edition: '1st Edition', language: 'English', shelfNumber: 'A-1', quantity: 1, availableCopies: 1 }
const initialAuthorForm = { name: '', biography: '', nationality: 'International' }
const initialPublisherForm = { publisherName: '', contact: '', address: '' }
const initialIssueForm = { member: '', memberType: 'Student', book: '', isbn: '', issueDate: new Date().toISOString().split('T')[0], dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0] }
const initialReturnForm = { issueId: '', returnDate: new Date().toISOString().split('T')[0], damageStatus: 'None', remarks: '' }
const initialReservationForm = { member: '', book: '', reservationDate: new Date().toISOString().split('T')[0] }

export default function Library() {
  const location = useLocation()
  const navigate = useNavigate()

  // Extract active sub-tab from URL pathname
  const activeTab = useMemo(() => {
    const path = location.pathname
    if (path.includes('/dashboard')) return 'dashboard'
    if (path.includes('/categories')) return 'categories'
    if (path.includes('/books')) return 'books'
    if (path.includes('/authors')) return 'authors'
    if (path.includes('/publishers')) return 'publishers'
    if (path.includes('/issues')) return 'issues'
    if (path.includes('/returns')) return 'returns'
    if (path.includes('/reservations')) return 'reservations'
    if (path.includes('/fines')) return 'fines'
    if (path.includes('/members')) return 'members'
    if (path.includes('/reports')) return 'reports'
    return 'books'
  }, [location.pathname])

  // --- REAL DATA STATES (NO MOCK DATA) ---
  const [categories, setCategories] = useState([])
  const [books, setBooks] = useState([])
  const [authors, setAuthors] = useState([])
  const [publishers, setPublishers] = useState([])
  const [issues, setIssues] = useState([])
  const [returns, setReturns] = useState([])
  const [reservations, setReservations] = useState([])
  const [fines, setFines] = useState([])
  const [dashboardMetrics, setDashboardMetrics] = useState({ totalBooks: 0, availableBooks: 0, issuedBooks: 0, overdueBooks: 0, finesCollected: 0 })

  // FETCH LIVE DATA FROM BACKEND API
  useEffect(() => {
    const fetchLibraryData = async () => {
      try {
        const [resDash, resCat, resBooks, resAuth, resPub, resIss, resRet, resRes, resFin] = await Promise.all([
          fetch(`${API_BASE}/library/dashboard`),
          fetch(`${API_BASE}/categories`),
          fetch(`${API_BASE}/books`),
          fetch(`${API_BASE}/authors`),
          fetch(`${API_BASE}/publishers`),
          fetch(`${API_BASE}/book-issues`),
          fetch(`${API_BASE}/book-returns`),
          fetch(`${API_BASE}/reservations`),
          fetch(`${API_BASE}/fines`)
        ])

        const [jDash, jCat, jBooks, jAuth, jPub, jIss, jRet, jRes, jFin] = await Promise.all([
          resDash.json(), resCat.json(), resBooks.json(), resAuth.json(), resPub.json(),
          resIss.json(), resRet.json(), resRes.json(), resFin.json()
        ])

        if (jDash.success && jDash.data?.summary) setDashboardMetrics(jDash.data.summary)
        if (jCat.success && Array.isArray(jCat.data)) setCategories(jCat.data)
        if (jBooks.success && Array.isArray(jBooks.data)) setBooks(jBooks.data)
        if (jAuth.success && Array.isArray(jAuth.data)) setAuthors(jAuth.data)
        if (jPub.success && Array.isArray(jPub.data)) setPublishers(jPub.data)
        if (jIss.success && Array.isArray(jIss.data)) setIssues(jIss.data)
        if (jRet.success && Array.isArray(jRet.data)) setReturns(jRet.data)
        if (jRes.success && Array.isArray(jRes.data)) setReservations(jRes.data)
        if (jFin.success && Array.isArray(jFin.data)) setFines(jFin.data)
      } catch (_err) {
        // Quiet network handle
      }
    }
    fetchLibraryData()
  }, [])

  // UI COMMON STATES
  const [searchQuery, setSearchQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogType, setDialogType] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [activeItem, setActiveItem] = useState(null)

  const [categoryForm, setCategoryForm] = useState(initialCategoryForm)
  const [bookForm, setBookForm] = useState(initialBookForm)
  const [authorForm, setAuthorForm] = useState(initialAuthorForm)
  const [publisherForm, setPublisherForm] = useState(initialPublisherForm)
  const [issueForm, setIssueForm] = useState(initialIssueForm)
  const [returnForm, setReturnForm] = useState(initialReturnForm)
  const [reservationForm, setReservationForm] = useState(initialReservationForm)

  const [formError, setFormError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)

  const [showSuccess, setShowSuccess] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const handlePrint = () => {
    window.print()
  }

  // --- SUBMIT HANDLERS WITH BACKEND CONNECTIVITY ---

  const handleSaveCategory = async (e) => {
    e.preventDefault()
    if (!categoryForm.categoryName) {
      setFormError('Category Name is required.')
      return
    }
    setFormError('')
    setIsSaving(true)

    try {
      if (isEditing && activeItem?._id) {
        const res = await fetch(`${API_BASE}/categories/${activeItem._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(categoryForm)
        })
        const json = await res.json()
        if (json.success) setCategories(categories.map(c => c._id === activeItem._id ? json.data : c))
      } else {
        const res = await fetch(`${API_BASE}/categories`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(categoryForm)
        })
        const json = await res.json()
        if (json.success) setCategories([...categories, json.data])
      }
      setSuccessMsg('Book Category saved successfully.')
      setShowSuccess(true)
      setDialogOpen(false)
    } catch (_err) {
      setFormError('Failed to save category. Check backend connection.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveBook = async (e) => {
    e.preventDefault()
    if (!bookForm.isbn || !bookForm.title || !bookForm.category || !bookForm.author || !bookForm.publisher) {
      setFormError('ISBN, Title, Category, Author, and Publisher are required.')
      return
    }
    setFormError('')
    setIsSaving(true)

    try {
      if (isEditing && activeItem?._id) {
        const res = await fetch(`${API_BASE}/books/${activeItem._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookForm)
        })
        const json = await res.json()
        if (json.success) setBooks(books.map(b => b._id === activeItem._id ? json.data : b))
        else setFormError(json.message || 'Error updating book.')
      } else {
        const res = await fetch(`${API_BASE}/books`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookForm)
        })
        const json = await res.json()
        if (json.success) setBooks([...books, json.data])
        else setFormError(json.message || 'Error adding book.')
      }
      if (!formError) {
        setSuccessMsg('Book added to library catalog successfully.')
        setShowSuccess(true)
        setDialogOpen(false)
      }
    } catch (_err) {
      setFormError('Failed to save book record.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveAuthor = async (e) => {
    e.preventDefault()
    if (!authorForm.name) {
      setFormError('Author Name is required.')
      return
    }
    setFormError('')
    setIsSaving(true)

    try {
      const res = await fetch(`${API_BASE}/authors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authorForm)
      })
      const json = await res.json()
      if (json.success) setAuthors([...authors, json.data])

      setSuccessMsg('Author record created successfully.')
      setShowSuccess(true)
      setDialogOpen(false)
    } catch (_err) {
      setFormError('Error saving author.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSavePublisher = async (e) => {
    e.preventDefault()
    if (!publisherForm.publisherName) {
      setFormError('Publisher Name is required.')
      return
    }
    setFormError('')
    setIsSaving(true)

    try {
      const res = await fetch(`${API_BASE}/publishers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(publisherForm)
      })
      const json = await res.json()
      if (json.success) setPublishers([...publishers, json.data])

      setSuccessMsg('Publisher saved successfully.')
      setShowSuccess(true)
      setDialogOpen(false)
    } catch (_err) {
      setFormError('Error saving publisher.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleIssueBook = async (e) => {
    e.preventDefault()
    if (!issueForm.member || !issueForm.book || !issueForm.isbn) {
      setFormError('Member Name, Book Title, and ISBN are required.')
      return
    }
    setFormError('')
    setIsSaving(true)

    try {
      const res = await fetch(`${API_BASE}/book-issues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(issueForm)
      })
      const json = await res.json()
      if (json.success) {
        setIssues([...issues, json.data])
        // Refresh books to update available copies
        const bRes = await fetch(`${API_BASE}/books`)
        const bJson = await bRes.json()
        if (bJson.success) setBooks(bJson.data)

        setSuccessMsg(`Book '${issueForm.book}' issued to ${issueForm.member} successfully.`)
        setShowSuccess(true)
        setDialogOpen(false)
      } else {
        setFormError(json.message || 'Failed to issue book.')
      }
    } catch (_err) {
      setFormError('Error connecting to issue service.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReturnBook = async (e) => {
    e.preventDefault()
    if (!returnForm.issueId) {
      setFormError('Please select a valid Book Issue record to return.')
      return
    }
    setFormError('')
    setIsSaving(true)

    try {
      const res = await fetch(`${API_BASE}/book-returns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(returnForm)
      })
      const json = await res.json()
      if (json.success) {
        setReturns([...returns, json.data])
        // Refresh issues and books
        const [iRes, bRes, fRes] = await Promise.all([
          fetch(`${API_BASE}/book-issues`),
          fetch(`${API_BASE}/books`),
          fetch(`${API_BASE}/fines`)
        ])
        const [iJson, bJson, fJson] = await Promise.all([iRes.json(), bRes.json(), fRes.json()])
        if (iJson.success) setIssues(iJson.data)
        if (bJson.success) setBooks(bJson.data)
        if (fJson.success) setFines(fJson.data)

        setSuccessMsg('Book return recorded and stock replenished.')
        setShowSuccess(true)
        setDialogOpen(false)
      } else {
        setFormError(json.message || 'Failed to return book.')
      }
    } catch (_err) {
      setFormError('Error processing book return.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveReservation = async (e) => {
    e.preventDefault()
    if (!reservationForm.member || !reservationForm.book) {
      setFormError('Member Name and Book Title are required.')
      return
    }
    setFormError('')
    setIsSaving(true)

    try {
      const res = await fetch(`${API_BASE}/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reservationForm)
      })
      const json = await res.json()
      if (json.success) {
        setReservations([...reservations, json.data])
        setSuccessMsg(`Reservation queued for '${reservationForm.book}'.`)
        setShowSuccess(true)
        setDialogOpen(false)
      } else {
        setFormError(json.message || 'Error processing reservation.')
      }
    } catch (_err) {
      setFormError('Failed to queue reservation.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return
    setIsSaving(true)
    const { type, id } = itemToDelete

    try {
      if (type === 'category') {
        await fetch(`${API_BASE}/categories/${id}`, { method: 'DELETE' })
        setCategories(categories.filter(c => c._id !== id))
      } else if (type === 'book') {
        await fetch(`${API_BASE}/books/${id}`, { method: 'DELETE' })
        setBooks(books.filter(b => b._id !== id))
      } else if (type === 'author') {
        await fetch(`${API_BASE}/authors/${id}`, { method: 'DELETE' })
        setAuthors(authors.filter(a => a._id !== id))
      } else if (type === 'publisher') {
        await fetch(`${API_BASE}/publishers/${id}`, { method: 'DELETE' })
        setPublishers(publishers.filter(p => p._id !== id))
      } else if (type === 'reservation') {
        await fetch(`${API_BASE}/reservations/${id}`, { method: 'DELETE' })
        setReservations(reservations.filter(r => r._id !== id))
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

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 p-4 md:p-6 animate-in fade-in duration-200">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5 mb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            Library Management Module
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage book catalog, author directories, member issues, returns, reservations, and overdue fines.</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handlePrint} className="flex items-center gap-1.5">
            <Printer className="h-4 w-4" />
            Print Report
          </Button>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex border-b border-border overflow-x-auto">
        {[
          { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
          { key: 'categories', label: 'Book Categories', icon: Layers },
          { key: 'books', label: 'Books Directory', icon: BookOpen },
          { key: 'authors', label: 'Authors', icon: UserCheck },
          { key: 'publishers', label: 'Publishers', icon: Building2 },
          { key: 'issues', label: 'Book Issue', icon: BookMarked },
          { key: 'returns', label: 'Book Return', icon: RotateCcw },
          { key: 'reservations', label: 'Reservations', icon: Bookmark },
          { key: 'fines', label: 'Fine Management', icon: DollarSign },
          { key: 'members', label: 'Library Members', icon: Users },
          { key: 'reports', label: 'Library Reports', icon: PieChart }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => navigate(`/admin/library/${tab.key}`)}
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

      {/* --- TAB 1: LIBRARY DASHBOARD --- */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card p-5 rounded-lg border border-border shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase">Total Books</span>
                <h3 className="text-2xl font-bold text-foreground mt-1">{dashboardMetrics.totalBooks || books.length}</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <BookOpen className="h-5 w-5" />
              </div>
            </div>

            <div className="bg-card p-5 rounded-lg border border-border shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase">Available Copies</span>
                <h3 className="text-2xl font-bold text-emerald-600 mt-1">{dashboardMetrics.availableBooks || books.reduce((a,c) => a + (c.availableCopies||0), 0)}</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <Check className="h-5 w-5" />
              </div>
            </div>

            <div className="bg-card p-5 rounded-lg border border-border shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase">Issued Books</span>
                <h3 className="text-2xl font-bold text-blue-600 mt-1">{dashboardMetrics.issuedBooks || issues.filter(i=>i.status==='issued').length}</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
                <BookMarked className="h-5 w-5" />
              </div>
            </div>

            <div className="bg-card p-5 rounded-lg border border-border shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase">Overdue Books</span>
                <h3 className="text-2xl font-bold text-rose-600 mt-1">{dashboardMetrics.overdueBooks || issues.filter(i=>i.status==='overdue').length}</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-600">
                <Clock className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: BOOK CATEGORIES --- */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-card p-4 rounded-lg border border-border shadow-sm">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              Book Categories & Sections
            </h3>
            <Button onClick={() => {
              setCategoryForm(initialCategoryForm)
              setIsEditing(false)
              setDialogType('category')
              setDialogOpen(true)
            }} className="flex items-center gap-1.5">
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          </div>

          <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
            <AppTable
              columns={[
                { header: 'Category Name', accessor: 'categoryName' },
                { header: 'Description', accessor: 'description' },
                { header: 'Status', accessor: row => <StatusBadge status={row.status} /> },
                {
                  header: 'Actions',
                  accessor: row => (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setActiveItem(row)
                          setCategoryForm(row)
                          setIsEditing(true)
                          setDialogType('category')
                          setDialogOpen(true)
                        }}
                        className="h-7 w-7 inline-flex items-center justify-center rounded border border-border hover:bg-muted text-primary"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setItemToDelete({ type: 'category', id: row._id, name: row.categoryName })
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
              data={categories}
            />
          </div>
        </div>
      )}

      {/* --- TAB 3: BOOKS DIRECTORY --- */}
      {activeTab === 'books' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-card p-4 rounded-lg border border-border shadow-sm">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Books Inventory & Availability
            </h3>
            <Button onClick={() => {
              setBookForm(initialBookForm)
              setIsEditing(false)
              setDialogType('book')
              setDialogOpen(true)
            }} className="flex items-center gap-1.5">
              <Plus className="h-4 w-4" />
              Add Book
            </Button>
          </div>

          <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
            <AppTable
              columns={[
                { header: 'ISBN', accessor: 'isbn' },
                { header: 'Title', accessor: 'title' },
                { header: 'Category', accessor: 'category' },
                { header: 'Author', accessor: 'author' },
                { header: 'Publisher', accessor: 'publisher' },
                { header: 'Shelf', accessor: 'shelfNumber' },
                { header: 'Total Quantity', accessor: 'quantity' },
                { header: 'Available Copies', accessor: row => <span className={cn("font-bold", row.availableCopies > 0 ? "text-emerald-600" : "text-rose-600")}>{row.availableCopies}</span> },
                {
                  header: 'Actions',
                  accessor: row => (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setActiveItem(row)
                          setBookForm(row)
                          setIsEditing(true)
                          setDialogType('book')
                          setDialogOpen(true)
                        }}
                        className="h-7 w-7 inline-flex items-center justify-center rounded border border-border hover:bg-muted text-primary"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setItemToDelete({ type: 'book', id: row._id, name: row.title })
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
              data={books}
            />
          </div>
        </div>
      )}

      {/* --- TAB 4: AUTHORS --- */}
      {activeTab === 'authors' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-card p-4 rounded-lg border border-border shadow-sm">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-primary" />
              Authors Directory
            </h3>
            <Button onClick={() => {
              setAuthorForm(initialAuthorForm)
              setIsEditing(false)
              setDialogType('author')
              setDialogOpen(true)
            }} className="flex items-center gap-1.5">
              <Plus className="h-4 w-4" />
              Add Author
            </Button>
          </div>

          <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
            <AppTable
              columns={[
                { header: 'Author Name', accessor: 'name' },
                { header: 'Nationality', accessor: 'nationality' },
                { header: 'Biography', accessor: 'biography' },
                {
                  header: 'Actions',
                  accessor: row => (
                    <button
                      onClick={() => {
                        setItemToDelete({ type: 'author', id: row._id, name: row.name })
                        setDeleteDialogOpen(true)
                      }}
                      className="h-7 w-7 inline-flex items-center justify-center rounded border border-border hover:bg-destructive/10 text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )
                }
              ]}
              data={authors}
            />
          </div>
        </div>
      )}

      {/* --- TAB 5: PUBLISHERS --- */}
      {activeTab === 'publishers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-card p-4 rounded-lg border border-border shadow-sm">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Publishers Registry
            </h3>
            <Button onClick={() => {
              setPublisherForm(initialPublisherForm)
              setIsEditing(false)
              setDialogType('publisher')
              setDialogOpen(true)
            }} className="flex items-center gap-1.5">
              <Plus className="h-4 w-4" />
              Add Publisher
            </Button>
          </div>

          <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
            <AppTable
              columns={[
                { header: 'Publisher Name', accessor: 'publisherName' },
                { header: 'Contact', accessor: 'contact' },
                { header: 'Address', accessor: 'address' },
                {
                  header: 'Actions',
                  accessor: row => (
                    <button
                      onClick={() => {
                        setItemToDelete({ type: 'publisher', id: row._id, name: row.publisherName })
                        setDeleteDialogOpen(true)
                      }}
                      className="h-7 w-7 inline-flex items-center justify-center rounded border border-border hover:bg-destructive/10 text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )
                }
              ]}
              data={publishers}
            />
          </div>
        </div>
      )}

      {/* --- TAB 6: BOOK ISSUE --- */}
      {activeTab === 'issues' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-card p-4 rounded-lg border border-border shadow-sm">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <BookMarked className="h-5 w-5 text-primary" />
              Book Issue Log
            </h3>
            <Button onClick={() => {
              setIssueForm(initialIssueForm)
              setIsEditing(false)
              setDialogType('issue')
              setDialogOpen(true)
            }} className="flex items-center gap-1.5">
              <Plus className="h-4 w-4" />
              Issue Book
            </Button>
          </div>

          <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
            <AppTable
              columns={[
                { header: 'Member Name', accessor: 'member' },
                { header: 'Member Type', accessor: 'memberType' },
                { header: 'Book Title', accessor: 'book' },
                { header: 'ISBN', accessor: 'isbn' },
                { header: 'Issue Date', accessor: 'issueDate' },
                { header: 'Due Date', accessor: 'dueDate' },
                { header: 'Status', accessor: row => <StatusBadge status={row.status} /> }
              ]}
              data={issues}
            />
          </div>
        </div>
      )}

      {/* --- TAB 7: BOOK RETURN --- */}
      {activeTab === 'returns' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-card p-4 rounded-lg border border-border shadow-sm">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-primary" />
              Book Return Records
            </h3>
            <Button onClick={() => {
              setReturnForm(initialReturnForm)
              setIsEditing(false)
              setDialogType('return')
              setDialogOpen(true)
            }} className="flex items-center gap-1.5">
              <Plus className="h-4 w-4" />
              Process Return
            </Button>
          </div>

          <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
            <AppTable
              columns={[
                { header: 'Member Name', accessor: 'member' },
                { header: 'Book Title', accessor: 'book' },
                { header: 'Return Date', accessor: 'returnDate' },
                { header: 'Overdue Fine', accessor: row => row.fineAmount ? <span className="text-rose-600 font-bold">${row.fineAmount}</span> : '$0' },
                { header: 'Damage Condition', accessor: 'damageStatus' }
              ]}
              data={returns}
            />
          </div>
        </div>
      )}

      {/* --- TAB 8: RESERVATIONS --- */}
      {activeTab === 'reservations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-card p-4 rounded-lg border border-border shadow-sm">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Bookmark className="h-5 w-5 text-primary" />
              Book Reservations & Waiting Queue
            </h3>
            <Button onClick={() => {
              setReservationForm(initialReservationForm)
              setIsEditing(false)
              setDialogType('reservation')
              setDialogOpen(true)
            }} className="flex items-center gap-1.5">
              <Plus className="h-4 w-4" />
              Reserve Book
            </Button>
          </div>

          <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
            <AppTable
              columns={[
                { header: 'Member Name', accessor: 'member' },
                { header: 'Book Title', accessor: 'book' },
                { header: 'Reservation Date', accessor: 'reservationDate' },
                { header: 'Status', accessor: row => <StatusBadge status={row.status} /> },
                {
                  header: 'Actions',
                  accessor: row => (
                    <button
                      onClick={() => {
                        setItemToDelete({ type: 'reservation', id: row._id, name: `${row.book} (${row.member})` })
                        setDeleteDialogOpen(true)
                      }}
                      className="h-7 w-7 inline-flex items-center justify-center rounded border border-border hover:bg-destructive/10 text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )
                }
              ]}
              data={reservations}
            />
          </div>
        </div>
      )}

      {/* --- TAB 9: FINE MANAGEMENT --- */}
      {activeTab === 'fines' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-card p-4 rounded-lg border border-border shadow-sm">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-rose-600" />
              Library Fines & Overdue Collections
            </h3>
          </div>

          <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
            <AppTable
              columns={[
                { header: 'Member Name', accessor: 'member' },
                { header: 'Book Title', accessor: 'book' },
                { header: 'Fine Amount', accessor: row => <span className="font-bold text-rose-600">${row.amount}</span> },
                { header: 'Status', accessor: row => <StatusBadge status={row.status} /> },
                { header: 'Paid Date', accessor: row => row.paidDate || '—' }
              ]}
              data={fines}
            />
          </div>
        </div>
      )}

      {/* --- TAB 10: LIBRARY MEMBERS --- */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-card p-4 rounded-lg border border-border shadow-sm">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Registered Library Members
            </h3>
          </div>

          <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
            <AppTable
              columns={[
                { header: 'Member Name', accessor: 'member' },
                { header: 'Member Type', accessor: 'memberType' },
                { header: 'Total Issued Books', accessor: row => issues.filter(i => i.member === row.member).length },
                { header: 'Active Status', accessor: () => <StatusBadge status="active" /> }
              ]}
              data={Array.from(new Set(issues.map(i => i.member))).map(m => ({
                member: m,
                memberType: issues.find(i => i.member === m)?.memberType || 'Student'
              }))}
            />
          </div>
        </div>
      )}

      {/* --- TAB 11: REPORTS --- */}
      {activeTab === 'reports' && (
        <div className="bg-card p-6 rounded-lg border border-border shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <PieChart className="h-5 w-5 text-primary" />
                Library Audit & Inventory Reports
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">Comprehensive audit reports for book circulation, issue frequency, returns, and fine collections.</p>
            </div>
            <Button variant="outline" onClick={handlePrint} className="flex items-center gap-1.5">
              <Printer className="h-4 w-4" />
              Export PDF Report
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-border rounded-lg bg-muted/20 space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Inventory Volume</span>
              <p className="text-2xl font-bold text-foreground">{books.reduce((a,c)=>a+(c.quantity||0),0)} Copies</p>
            </div>

            <div className="p-4 border border-border rounded-lg bg-muted/20 space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Total Circulation</span>
              <p className="text-2xl font-bold text-primary">{issues.length} Book Issues</p>
            </div>

            <div className="p-4 border border-border rounded-lg bg-muted/20 space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Total Late Fines</span>
              <p className="text-2xl font-bold text-rose-600">${fines.reduce((a,c)=>a+(c.amount||0),0)}</p>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL DIALOGS --- */}

      {/* CATEGORY DIALOG */}
      {dialogType === 'category' && (
        <AppDialog isOpen={dialogOpen} onClose={() => setDialogOpen(false)} title="Book Category">
          <AppForm onSubmit={handleSaveCategory} className="gap-4 mt-2">
            {formError && <Alert variant="danger">{formError}</Alert>}
            <AppInput label="Category Name" value={categoryForm.categoryName} onChange={e => setCategoryForm({ ...categoryForm, categoryName: e.target.value })} className="md:col-span-2" />
            <FormTextarea label="Description" value={categoryForm.description} onChange={e => setCategoryForm({ ...categoryForm, description: e.target.value })} rows={2} className="md:col-span-2" />
            <div className="flex justify-end gap-2 md:col-span-2 border-t border-border pt-4 mt-2">
              <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <LoadingButton type="submit" loading={isSaving}>Save Category</LoadingButton>
            </div>
          </AppForm>
        </AppDialog>
      )}

      {/* BOOK DIALOG */}
      {dialogType === 'book' && (
        <AppDialog isOpen={dialogOpen} onClose={() => setDialogOpen(false)} title="Book Inventory Entry">
          <AppForm onSubmit={handleSaveBook} className="gap-4 mt-2">
            {formError && <Alert variant="danger">{formError}</Alert>}
            <AppInput label="ISBN Number" value={bookForm.isbn} onChange={e => setBookForm({ ...bookForm, isbn: e.target.value })} />
            <AppInput label="Book Title" value={bookForm.title} onChange={e => setBookForm({ ...bookForm, title: e.target.value })} />
            <AppInput label="Category" value={bookForm.category} onChange={e => setBookForm({ ...bookForm, category: e.target.value })} />
            <AppInput label="Author" value={bookForm.author} onChange={e => setBookForm({ ...bookForm, author: e.target.value })} />
            <AppInput label="Publisher" value={bookForm.publisher} onChange={e => setBookForm({ ...bookForm, publisher: e.target.value })} />
            <AppInput label="Shelf Number" value={bookForm.shelfNumber} onChange={e => setBookForm({ ...bookForm, shelfNumber: e.target.value })} />
            <AppInput label="Quantity" type="number" value={bookForm.quantity} onChange={e => setBookForm({ ...bookForm, quantity: parseInt(e.target.value, 10) || 1, availableCopies: parseInt(e.target.value, 10) || 1 })} />
            <div className="flex justify-end gap-2 md:col-span-2 border-t border-border pt-4 mt-2">
              <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <LoadingButton type="submit" loading={isSaving}>Save Book</LoadingButton>
            </div>
          </AppForm>
        </AppDialog>
      )}

      {/* AUTHOR DIALOG */}
      {dialogType === 'author' && (
        <AppDialog isOpen={dialogOpen} onClose={() => setDialogOpen(false)} title="Author Information">
          <AppForm onSubmit={handleSaveAuthor} className="gap-4 mt-2">
            {formError && <Alert variant="danger">{formError}</Alert>}
            <AppInput label="Author Name" value={authorForm.name} onChange={e => setAuthorForm({ ...authorForm, name: e.target.value })} className="md:col-span-2" />
            <AppInput label="Nationality" value={authorForm.nationality} onChange={e => setAuthorForm({ ...authorForm, nationality: e.target.value })} className="md:col-span-2" />
            <FormTextarea label="Biography" value={authorForm.biography} onChange={e => setAuthorForm({ ...authorForm, biography: e.target.value })} rows={2} className="md:col-span-2" />
            <div className="flex justify-end gap-2 md:col-span-2 border-t border-border pt-4 mt-2">
              <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <LoadingButton type="submit" loading={isSaving}>Save Author</LoadingButton>
            </div>
          </AppForm>
        </AppDialog>
      )}

      {/* PUBLISHER DIALOG */}
      {dialogType === 'publisher' && (
        <AppDialog isOpen={dialogOpen} onClose={() => setDialogOpen(false)} title="Publisher Registry">
          <AppForm onSubmit={handleSavePublisher} className="gap-4 mt-2">
            {formError && <Alert variant="danger">{formError}</Alert>}
            <AppInput label="Publisher Name" value={publisherForm.publisherName} onChange={e => setPublisherForm({ ...publisherForm, publisherName: e.target.value })} className="md:col-span-2" />
            <AppInput label="Contact Information" value={publisherForm.contact} onChange={e => setPublisherForm({ ...publisherForm, contact: e.target.value })} />
            <AppInput label="Address" value={publisherForm.address} onChange={e => setPublisherForm({ ...publisherForm, address: e.target.value })} />
            <div className="flex justify-end gap-2 md:col-span-2 border-t border-border pt-4 mt-2">
              <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <LoadingButton type="submit" loading={isSaving}>Save Publisher</LoadingButton>
            </div>
          </AppForm>
        </AppDialog>
      )}

      {/* ISSUE DIALOG */}
      {dialogType === 'issue' && (
        <AppDialog isOpen={dialogOpen} onClose={() => setDialogOpen(false)} title="Issue Book to Member">
          <AppForm onSubmit={handleIssueBook} className="gap-4 mt-2">
            {formError && <Alert variant="danger">{formError}</Alert>}
            
            {books.length > 0 && (
              <FormSelect
                label="Select Registered Book"
                value={issueForm.isbn}
                onChange={e => {
                  const selected = books.find(b => b.isbn === e.target.value)
                  if (selected) {
                    setIssueForm({ ...issueForm, book: selected.title, isbn: selected.isbn })
                  }
                }}
                options={[
                  { value: '', label: 'Select Book from Catalog...' },
                  ...books.map(b => ({
                    value: b.isbn,
                    label: `${b.title} (ISBN: ${b.isbn} | Available: ${b.availableCopies})`
                  }))
                ]}
                className="md:col-span-2"
              />
            )}

            <AppInput label="Member Name" value={issueForm.member} onChange={e => setIssueForm({ ...issueForm, member: e.target.value })} />
            <FormSelect label="Member Type" value={issueForm.memberType} onChange={e => setIssueForm({ ...issueForm, memberType: e.target.value })} options={[
              { value: 'Student', label: 'Student' },
              { value: 'Teacher', label: 'Teacher' }
            ]} />
            <AppInput label="Book Title" value={issueForm.book} onChange={e => setIssueForm({ ...issueForm, book: e.target.value })} />
            <AppInput label="ISBN" value={issueForm.isbn} onChange={e => setIssueForm({ ...issueForm, isbn: e.target.value })} />
            <AppInput label="Issue Date" type="date" value={issueForm.issueDate} onChange={e => setIssueForm({ ...issueForm, issueDate: e.target.value })} />
            <AppInput label="Due Date" type="date" value={issueForm.dueDate} onChange={e => setIssueForm({ ...issueForm, dueDate: e.target.value })} />
            <div className="flex justify-end gap-2 md:col-span-2 border-t border-border pt-4 mt-2">
              <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <LoadingButton type="submit" loading={isSaving}>Issue Book</LoadingButton>
            </div>
          </AppForm>
        </AppDialog>
      )}

      {/* RETURN DIALOG */}
      {dialogType === 'return' && (
        <AppDialog isOpen={dialogOpen} onClose={() => setDialogOpen(false)} title="Process Book Return">
          <AppForm onSubmit={handleReturnBook} className="gap-4 mt-2">
            {formError && <Alert variant="danger">{formError}</Alert>}
            <FormSelect
              label="Select Active Issue"
              value={returnForm.issueId}
              onChange={e => setReturnForm({ ...returnForm, issueId: e.target.value })}
              options={[
                { value: '', label: 'Select Active Issue...' },
                ...issues.filter(i => i.status === 'issued').map(i => ({
                  value: i._id,
                  label: `${i.book} - ${i.member} (Due: ${i.dueDate})`
                }))
              ]}
              className="md:col-span-2"
            />
            <AppInput label="Return Date" type="date" value={returnForm.returnDate} onChange={e => setReturnForm({ ...returnForm, returnDate: e.target.value })} />
            <FormSelect label="Damage Condition" value={returnForm.damageStatus} onChange={e => setReturnForm({ ...returnForm, damageStatus: e.target.value })} options={[
              { value: 'None', label: 'None (Good Condition)' },
              { value: 'Minor', label: 'Minor Wear' },
              { value: 'Severe', label: 'Severe Damage' },
              { value: 'Lost', label: 'Lost Book' }
            ]} />
            <div className="flex justify-end gap-2 md:col-span-2 border-t border-border pt-4 mt-2">
              <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <LoadingButton type="submit" loading={isSaving}>Process Return</LoadingButton>
            </div>
          </AppForm>
        </AppDialog>
      )}

      {/* RESERVATION DIALOG */}
      {dialogType === 'reservation' && (
        <AppDialog isOpen={dialogOpen} onClose={() => setDialogOpen(false)} title="Book Reservation">
          <AppForm onSubmit={handleSaveReservation} className="gap-4 mt-2">
            {formError && <Alert variant="danger">{formError}</Alert>}
            <AppInput label="Member Name" value={reservationForm.member} onChange={e => setReservationForm({ ...reservationForm, member: e.target.value })} />
            <AppInput label="Book Title" value={reservationForm.book} onChange={e => setReservationForm({ ...reservationForm, book: e.target.value })} />
            <AppInput label="Reservation Date" type="date" value={reservationForm.reservationDate} onChange={e => setReservationForm({ ...reservationForm, reservationDate: e.target.value })} className="md:col-span-2" />
            <div className="flex justify-end gap-2 md:col-span-2 border-t border-border pt-4 mt-2">
              <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <LoadingButton type="submit" loading={isSaving}>Queue Reservation</LoadingButton>
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
        title="Library Log Updated"
        message={successMsg}
      />

    </div>
  )
}
