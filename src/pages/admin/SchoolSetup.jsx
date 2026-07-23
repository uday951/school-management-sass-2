import React, { useState, useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { 
  Building2, 
  Phone, 
  Mail, 
  Globe, 
  MapPin, 
  User, 
  Calendar, 
  ShieldCheck, 
  FileBadge, 
  Edit, 
  Trash2, 
  Eye, 
  Plus, 
  Search, 
  Check, 
  X, 
  RotateCcw,
  Sparkles,
  Image as ImageIcon,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { 
  Button, 
  LoadingButton,
  FormLayout as AppForm, 
  FormInput as AppInput, 
  FormTextarea, 
  FormSelect, 
  FileUpload,
  ReusableTable as AppTable, 
  TablePagination as Pagination,
  FormDialog as AppDialog, 
  DeleteDialog,
  StatusChip as StatusBadge,
  Alert,
  SuccessDialog
} from '@/components/shared'

// --- DUMMY DATA CONSTANTS ---

const initialInstitutionData = {
  name: "Springdale International School",
  code: "SIS-1024",
  affiliationNumber: "CBSE-193021",
  registrationNumber: "REG-2005-9981",
  establishedYear: "2005",
  type: "co-educational",
  phone: "+1 (555) 123-4567",
  mobile: "+1 (555) 987-6543",
  email: "info@springdale.edu",
  website: "https://www.springdale.edu",
  country: "United States",
  state: "California",
  city: "San Francisco",
  pinCode: "94107",
  address: "456 Learning Way, Suite 100, San Francisco, CA 94107",
  principalName: "Dr. Evelyn Harper",
  principalContact: "+1 (555) 234-5678",
  principalEmail: "principal@springdale.edu",
  logo: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=120&fit=crop&q=80",
  favicon: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=32&fit=crop&q=80",
  banner: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200&auto=format&fit=crop&q=80"
}

const initialCampusesData = []

// --- LOCAL CUSTOM INTERACTION COMPONENTS ---

function SearchBar({ value, onChange, placeholder = "Search..." }) {
  return (
    <div className="relative flex-1 min-w-[200px]">
      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-9 pl-9 pr-4 rounded-md border border-input bg-background text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground"
      />
    </div>
  )
}

function Filter({ value, onChange, options = [], label = "Filter By Status" }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold text-muted-foreground uppercase whitespace-nowrap">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer text-foreground"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}

function BrandingImageUploader({ label, value, onChange, onRemove, disabled }) {
  const [previewUrl, setPreviewUrl] = useState('')

  useEffect(() => {
    if (!value) {
      setPreviewUrl('')
      return
    }
    if (typeof value === 'string') {
      setPreviewUrl(value)
    } else if (value instanceof File) {
      const url = URL.createObjectURL(value)
      setPreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    }
  }, [value])

  return (
    <div className="flex flex-col gap-2 p-4 border border-border rounded-lg bg-card shadow-sm">
      <span className="text-xs font-semibold text-muted-foreground uppercase">{label}</span>
      
      {previewUrl ? (
        <div className="relative border border-border rounded overflow-hidden bg-muted/20 flex items-center justify-center h-28 w-full group">
          <img src={previewUrl} alt={label} className="max-h-full max-w-full object-contain" />
          
          {!disabled && (
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity duration-200">
              <label className="cursor-pointer bg-primary text-primary-foreground px-2.5 py-1.5 rounded hover:bg-primary/90 text-xs font-semibold select-none">
                Replace
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0]
                    if (file) onChange(file)
                  }}
                  accept="image/*"
                />
              </label>
              <button
                type="button"
                onClick={onRemove}
                className="bg-destructive text-destructive-foreground px-2.5 py-1.5 rounded hover:bg-destructive/90 text-xs font-semibold cursor-pointer"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="border border-dashed border-border rounded flex flex-col items-center justify-center h-28 bg-muted/10">
          {disabled ? (
            <span className="text-xs text-muted-foreground">No image uploaded</span>
          ) : (
            <label className="cursor-pointer flex flex-col items-center gap-1 select-none">
              <ImageIcon className="h-6 w-6 text-muted-foreground mb-1" />
              <span className="text-xs text-foreground font-semibold">Upload Image</span>
              <input
                type="file"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files[0]
                  if (file) onChange(file)
                }}
                accept="image/*"
              />
            </label>
          )}
        </div>
      )}
    </div>
  )
}

// --- MAIN SCHOOL SETUP PAGE COMPONENT ---
>>>>>>> Stashed changes
=======
>>>>>>> 433c6f7ee699dc36594f37ea9de773c6384172e3

// --- INITIAL EMPTY DATA CONSTANTS ---

const initialInstitutionData = {
  name: "",
  code: "",
  affiliationNumber: "",
  registrationNumber: "",
  establishedYear: "",
  type: "co-educational",
  phone: "",
  mobile: "",
  email: "",
  website: "",
  country: "",
  state: "",
  city: "",
  pinCode: "",
  address: "",
  principalName: "",
  principalContact: "",
  principalEmail: "",
  logo: null,
  favicon: null,
  banner: null
}

const initialCampusesData = []

// --- LOCAL CUSTOM INTERACTION COMPONENTS ---

function SearchBar({ value, onChange, placeholder = "Search..." }) {
  return (
    <div className="relative flex-1 min-w-[200px]">
      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-9 pl-9 pr-4 rounded-md border border-input bg-background text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground"
      />
    </div>
  )
}

function Filter({ value, onChange, options = [], label = "Filter By Status" }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold text-muted-foreground uppercase whitespace-nowrap">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer text-foreground"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}

function BrandingImageUploader({ label, value, onChange, onRemove, disabled }) {
  const [previewUrl, setPreviewUrl] = useState('')

  useEffect(() => {
    if (!value) {
      setPreviewUrl('')
      return
    }
    if (typeof value === 'string') {
      setPreviewUrl(value)
    } else if (value instanceof File) {
      const url = URL.createObjectURL(value)
      setPreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    }
  }, [value])

  return (
    <div className="flex flex-col gap-2 p-4 border border-border rounded-lg bg-card shadow-sm">
      <span className="text-xs font-semibold text-muted-foreground uppercase">{label}</span>
      
      {previewUrl ? (
        <div className="relative border border-border rounded overflow-hidden bg-muted/20 flex items-center justify-center h-28 w-full group">
          <img src={previewUrl} alt={label} className="max-h-full max-w-full object-contain" />
          
          {!disabled && (
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity duration-200">
              <label className="cursor-pointer bg-primary text-primary-foreground px-2.5 py-1.5 rounded hover:bg-primary/90 text-xs font-semibold select-none">
                Replace
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0]
                    if (file) onChange(file)
                  }}
                  accept="image/*"
                />
              </label>
              <button
                type="button"
                onClick={onRemove}
                className="bg-destructive text-destructive-foreground px-2.5 py-1.5 rounded hover:bg-destructive/90 text-xs font-semibold cursor-pointer"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="border border-dashed border-border rounded flex flex-col items-center justify-center h-28 bg-muted/10">
          {disabled ? (
            <span className="text-xs text-muted-foreground">No image uploaded</span>
          ) : (
            <label className="cursor-pointer flex flex-col items-center gap-1 select-none">
              <ImageIcon className="h-6 w-6 text-muted-foreground mb-1" />
              <span className="text-xs text-foreground font-semibold">Upload Image</span>
              <input
                type="file"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files[0]
                  if (file) onChange(file)
                }}
                accept="image/*"
              />
            </label>
          )}
        </div>
      )}
    </div>
  )
}

// --- MAIN SCHOOL SETUP PAGE COMPONENT ---

export default function SchoolSetup() {
  const location = useLocation()
  const navigate = useNavigate()

  const isCampuses = location.pathname.includes('/campuses')

  // --- STATE FOR INSTITUTION INFO ---
  const [institution, setInstitution] = useState(() => {
    const saved = localStorage.getItem('school_setup_institution')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Clear cached mock data if present
        if (parsed.name === "Springdale International School") {
          localStorage.removeItem('school_setup_institution')
          return initialInstitutionData
        }
        return parsed
      } catch (e) {
        return initialInstitutionData
      }
    }
    return initialInstitutionData
  })
  const [instForm, setInstForm] = useState({ ...institution })
  const [isEditingInst, setIsEditingInst] = useState(() => !institution.name)
  const [instErrors, setInstErrors] = useState({})
  const [isSavingInst, setIsSavingInst] = useState(false)
  const [showInstSuccess, setShowInstSuccess] = useState(false)

  useEffect(() => {
    setInstForm({ ...institution })
  }, [institution])

  // --- STATE FOR CAMPUS MANAGEMENT ---
  const [campuses, setCampuses] = useState(() => {
    const saved = localStorage.getItem('school_setup_campuses')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Clear cached mock campuses if present
        if (Array.isArray(parsed) && parsed.some(c => c.name?.includes("Springdale"))) {
          localStorage.removeItem('school_setup_campuses')
          return initialCampusesData
        }
        return parsed
      } catch (e) {
        return initialCampusesData
      }
    }
    return initialCampusesData
  })

  // Persistence to localstorage
  useEffect(() => {
    localStorage.setItem('school_setup_institution', JSON.stringify(institution))
  }, [institution])

  useEffect(() => {
    localStorage.setItem('school_setup_campuses', JSON.stringify(campuses))
  }, [campuses])

  // Campus CRUD states
  const [campusSearch, setCampusSearch] = useState('')
  const [campusFilter, setCampusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  
  const emptyCampus = { name: '', code: '', address: '', principal: '', contactNumber: '', email: '', status: 'active' }
  const [activeCampus, setActiveCampus] = useState({ ...emptyCampus })
  const [campusErrors, setCampusErrors] = useState({})
  const [isSavingCampus, setIsSavingCampus] = useState(false)
  const [showCampusSuccess, setShowCampusSuccess] = useState(false)
  const [campusSuccessMessage, setCampusSuccessMessage] = useState('')

  // Filter & Search campuses
  const filteredCampuses = useMemo(() => {
    return campuses.filter(camp => {
      const matchesSearch = 
        camp.name.toLowerCase().includes(campusSearch.toLowerCase()) ||
        camp.code.toLowerCase().includes(campusSearch.toLowerCase()) ||
        camp.principal.toLowerCase().includes(campusSearch.toLowerCase()) ||
        camp.email.toLowerCase().includes(campusSearch.toLowerCase())

      const matchesFilter = campusFilter === 'all' || camp.status === campusFilter

      return matchesSearch && matchesFilter
    })
  }, [campuses, campusSearch, campusFilter])

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredCampuses.length / itemsPerPage))
  const paginatedCampuses = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredCampuses.slice(start, start + itemsPerPage)
  }, [filteredCampuses, currentPage])

  // Reset page when filtering or searching
  useEffect(() => {
    setCurrentPage(1)
  }, [campusSearch, campusFilter])

  // --- INSTITUTION VALIDATION AND ACTION HANDLERS ---
  
  const validateInstitution = (data) => {
    const err = {}
    if (!data.name?.trim()) err.name = "School Name is required"
    if (!data.code?.trim()) err.code = "School Code is required"
    if (!data.affiliationNumber?.trim()) err.affiliationNumber = "Affiliation Number is required"
    if (!data.registrationNumber?.trim()) err.registrationNumber = "Registration Number is required"
    
    const year = parseInt(data.establishedYear, 10)
    if (!data.establishedYear) {
      err.establishedYear = "Established Year is required"
    } else if (isNaN(year) || year < 1000 || year > 2026) {
      err.establishedYear = "Established Year must be a valid 4-digit year (1000-2026)"
    }
    if (!data.type) err.type = "School Type is required"
    
    // Contact Info
    if (!data.phone?.trim()) {
      err.phone = "Phone number is required"
    } else if (!/^\+?[0-9\s\-()]{7,15}$/.test(data.phone)) {
      err.phone = "Invalid phone number format"
    }
    if (data.mobile && !/^\+?[0-9\s\-()]{7,15}$/.test(data.mobile)) {
      err.mobile = "Invalid mobile number format"
    }
    if (!data.email?.trim()) {
      err.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      err.email = "Invalid email format"
    }
    if (!data.website?.trim()) {
      err.website = "Website URL is required"
    } else if (!/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/.test(data.website)) {
      err.website = "Invalid website URL format"
    }
    if (!data.country?.trim()) err.country = "Country is required"
    if (!data.state?.trim()) err.state = "State is required"
    if (!data.city?.trim()) err.city = "City is required"
    if (!data.pinCode?.trim()) {
      err.pinCode = "PIN Code is required"
    } else if (!/^[0-9a-zA-Z\s\-]{3,10}$/.test(data.pinCode)) {
      err.pinCode = "Invalid PIN code format"
    }
    if (!data.address?.trim()) err.address = "Full Address is required"
    
    // Principal Info
    if (!data.principalName?.trim()) err.principalName = "Principal Name is required"
    if (!data.principalContact?.trim()) {
      err.principalContact = "Principal Contact number is required"
    } else if (!/^\+?[0-9\s\-()]{7,15}$/.test(data.principalContact)) {
      err.principalContact = "Invalid contact number format"
    }
    if (!data.principalEmail?.trim()) {
      err.principalEmail = "Principal Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.principalEmail)) {
      err.principalEmail = "Invalid email format"
    }

    return err
  }

  const handleSaveInstitution = (e) => {
    e.preventDefault()
    const errs = validateInstitution(instForm)
    if (Object.keys(errs).length > 0) {
      setInstErrors(errs)
      return
    }
    setInstErrors({})
    setIsSavingInst(true)
    
    // Simulate API Saving
    setTimeout(() => {
      setInstitution({ ...instForm })
      setIsSavingInst(false)
      setIsEditingInst(false)
      setShowInstSuccess(true)
    }, 1000)
  }

  const handleCancelInstEdit = () => {
    setInstForm({ ...institution })
    setInstErrors({})
    setIsEditingInst(false)
  }

  const handleResetInstForm = () => {
    setInstForm({ ...initialInstitutionData })
    setInstErrors({})
  }

  // --- CAMPUS CRUD ACTION HANDLERS ---

  const validateCampus = (data) => {
    const err = {}
    if (!data.name?.trim()) err.name = "Campus Name is required"
    if (!data.code?.trim()) err.code = "Campus Code is required"
    if (!data.address?.trim()) err.address = "Address is required"
    if (!data.principal?.trim()) err.principal = "Principal is required"
    if (!data.contactNumber?.trim()) {
      err.contactNumber = "Contact Number is required"
    } else if (!/^\+?[0-9\s\-()]{7,15}$/.test(data.contactNumber)) {
      err.contactNumber = "Invalid phone number format"
    }
    if (!data.email?.trim()) {
      err.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      err.email = "Invalid email format"
    }
    if (!data.status) err.status = "Status is required"
    return err
  }

  const handleAddCampus = (e) => {
    e.preventDefault()
    const errs = validateCampus(activeCampus)
    if (Object.keys(errs).length > 0) {
      setCampusErrors(errs)
      return
    }
    setCampusErrors({})
    setIsSavingCampus(true)

    setTimeout(() => {
      const newId = campuses.length > 0 ? Math.max(...campuses.map(c => c.id)) + 1 : 1
      const newCampus = { ...activeCampus, id: newId }
      setCampuses([...campuses, newCampus])
      setIsSavingCampus(false)
      setIsAddOpen(false)
      setCampusSuccessMessage(`Campus "${newCampus.name}" has been created successfully.`)
      setShowCampusSuccess(true)
    }, 800)
  }

  const handleEditCampus = (e) => {
    e.preventDefault()
    const errs = validateCampus(activeCampus)
    if (Object.keys(errs).length > 0) {
      setCampusErrors(errs)
      return
    }
    setCampusErrors({})
    setIsSavingCampus(true)

    setTimeout(() => {
      setCampuses(campuses.map(c => c.id === activeCampus.id ? { ...activeCampus } : c))
      setIsSavingCampus(false)
      setIsEditOpen(false)
      setCampusSuccessMessage(`Campus "${activeCampus.name}" details updated successfully.`)
      setShowCampusSuccess(true)
    }, 800)
  }

  const handleDeleteCampus = () => {
    setIsSavingCampus(true)
    setTimeout(() => {
      setCampuses(campuses.filter(c => c.id !== activeCampus.id))
      setIsSavingCampus(false)
      setIsDeleteOpen(false)
      setCampusSuccessMessage(`Campus "${activeCampus.name}" has been permanently deleted.`)
      setShowCampusSuccess(true)
    }, 800)
  }

  const handleToggleStatus = (campusId) => {
    const campus = campuses.find(c => c.id === campusId)
    if (!campus) return
    const updatedStatus = campus.status === 'active' ? 'inactive' : 'active'
    setCampuses(campuses.map(c => c.id === campusId ? { ...c, status: updatedStatus } : c))
  }

  const handleStartAdd = () => {
    setActiveCampus({ ...emptyCampus })
    setCampusErrors({})
    setIsAddOpen(true)
  }

  const handleStartEdit = (campus) => {
    setActiveCampus({ ...campus })
    setCampusErrors({})
    setIsEditOpen(true)
  }

  const handleStartView = (campus) => {
    setActiveCampus({ ...campus })
    setIsViewOpen(true)
  }

  const handleStartDelete = (campus) => {
    setActiveCampus({ ...campus })
    setIsDeleteOpen(true)
  }

  // Column settings for Campus ReusableTable
  const campusTableColumns = [
    {
      header: 'Campus Name',
      accessor: 'name',
      sortable: true
    },
    {
      header: 'Campus Code',
      accessor: 'code',
      sortable: true
    },
    {
      header: 'Address',
      accessor: 'address'
    },
    {
      header: 'Principal',
      accessor: 'principal',
      sortable: true
    },
    {
      header: 'Contact Number',
      accessor: 'contactNumber'
    },
    {
      header: 'Email',
      accessor: 'email',
      sortable: true
    },
    {
      header: 'Status',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <StatusBadge status={row.status} />
          <button
            onClick={() => handleToggleStatus(row.id)}
            className="text-[10px] font-bold text-primary hover:text-primary/80 hover:underline cursor-pointer select-none"
          >
            {row.status === 'active' ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      )
    },
    {
      header: 'Edit',
      accessor: (row) => (
        <button 
          onClick={() => handleStartEdit(row)} 
          className="h-7 w-7 inline-flex items-center justify-center rounded border border-border hover:bg-muted text-primary cursor-pointer transition-colors"
          title="Edit Campus"
        >
          <Edit className="h-3.5 w-3.5" />
        </button>
      )
    }
  ]

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 p-4 md:p-6 animate-in fade-in duration-200">
      
      {/* Page Header */}
      <div className="flex flex-col gap-2 border-b border-border pb-5 mb-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">School Setup Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your central institution profiles, branding identity, and satellite campuses.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border mb-6">
        <button
          onClick={() => navigate('/admin/setup/institution')}
          className={cn(
            "px-4 py-2 border-b-2 text-sm font-semibold transition-colors cursor-pointer select-none flex items-center gap-2",
            !isCampuses 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Building2 className="h-4 w-4" />
          Institution Information
        </button>
        <button
          onClick={() => navigate('/admin/setup/campuses')}
          className={cn(
            "px-4 py-2 border-b-2 text-sm font-semibold transition-colors cursor-pointer select-none flex items-center gap-2",
            isCampuses 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <MapPin className="h-4 w-4" />
          Campus Management
        </button>
      </div>

      {/* --- TAB CONTENT 1: INSTITUTION INFO --- */}
      {!isCampuses && (
        <div className="space-y-6">
          
          {Object.keys(instErrors).length > 0 && (
            <Alert variant="danger" title="Validation Failures">
              Please correct the highlighted fields in the form before attempting to save.
            </Alert>
          )}

          <AppForm onSubmit={handleSaveInstitution} className="gap-6">
            
            {/* Section 1: General Info */}
            <div className="bg-card text-card-foreground p-6 rounded-lg border border-border shadow-sm space-y-4 md:col-span-2">
              <div className="flex items-center gap-2 border-b border-border/80 pb-3 mb-2">
                <Building2 className="h-5 w-5 text-primary" />
                <h3 className="text-base font-bold text-foreground">General Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <AppInput
                  label="School Name"
                  id="instName"
                  name="schoolName"
                  value={instForm.name}
                  onChange={(e) => setInstForm({ ...instForm, name: e.target.value })}
                  error={instErrors.name}
                  disabled={!isEditingInst || isSavingInst}
                />
                
                <AppInput
                  label="School Code"
                  id="instCode"
                  name="schoolCode"
                  value={instForm.code}
                  onChange={(e) => setInstForm({ ...instForm, code: e.target.value })}
                  error={instErrors.code}
                  disabled={!isEditingInst || isSavingInst}
                />

                <AppInput
                  label="Established Year"
                  id="establishedYear"
                  name="establishedYear"
                  value={instForm.establishedYear}
                  onChange={(e) => setInstForm({ ...instForm, establishedYear: e.target.value })}
                  error={instErrors.establishedYear}
                  disabled={!isEditingInst || isSavingInst}
                />

                <AppInput
                  label="Affiliation Number"
                  id="affiliationNumber"
                  name="affiliationNumber"
                  value={instForm.affiliationNumber}
                  onChange={(e) => setInstForm({ ...instForm, affiliationNumber: e.target.value })}
                  error={instErrors.affiliationNumber}
                  disabled={!isEditingInst || isSavingInst}
                />

                <AppInput
                  label="Registration Number"
                  id="registrationNumber"
                  name="registrationNumber"
                  value={instForm.registrationNumber}
                  onChange={(e) => setInstForm({ ...instForm, registrationNumber: e.target.value })}
                  error={instErrors.registrationNumber}
                  disabled={!isEditingInst || isSavingInst}
                />

                <FormSelect
                  label="School Type"
                  id="schoolType"
                  name="schoolType"
                  value={instForm.type}
                  onChange={(e) => setInstForm({ ...instForm, type: e.target.value })}
                  options={[
                    { value: 'co-educational', label: 'Co-Educational' },
                    { value: 'boys', label: 'Boys School' },
                    { value: 'girls', label: 'Girls School' }
                  ]}
                  error={instErrors.type}
                  disabled={!isEditingInst || isSavingInst}
                />
              </div>
            </div>

            {/* Section 2: Contact Info */}
            <div className="bg-card text-card-foreground p-6 rounded-lg border border-border shadow-sm space-y-4 md:col-span-2">
              <div className="flex items-center gap-2 border-b border-border/80 pb-3 mb-2">
                <Phone className="h-5 w-5 text-primary" />
                <h3 className="text-base font-bold text-foreground">Contact Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <AppInput
                  label="Phone"
                  id="instPhone"
                  name="schoolPhone"
                  value={instForm.phone}
                  onChange={(e) => setInstForm({ ...instForm, phone: e.target.value })}
                  error={instErrors.phone}
                  disabled={!isEditingInst || isSavingInst}
                  className="md:col-span-2"
                />

                <AppInput
                  label="Mobile"
                  id="instMobile"
                  name="schoolMobile"
                  value={instForm.mobile || ''}
                  onChange={(e) => setInstForm({ ...instForm, mobile: e.target.value })}
                  error={instErrors.mobile}
                  disabled={!isEditingInst || isSavingInst}
                  className="md:col-span-2"
                />

                <AppInput
                  label="Email"
                  id="instEmail"
                  name="schoolEmail"
                  type="email"
                  value={instForm.email}
                  onChange={(e) => setInstForm({ ...instForm, email: e.target.value })}
                  error={instErrors.email}
                  disabled={!isEditingInst || isSavingInst}
                  className="md:col-span-2"
                />

                <AppInput
                  label="Website"
                  id="instWebsite"
                  name="schoolWebsite"
                  value={instForm.website}
                  onChange={(e) => setInstForm({ ...instForm, website: e.target.value })}
                  error={instErrors.website}
                  disabled={!isEditingInst || isSavingInst}
                  className="md:col-span-2"
                />

                <AppInput
                  label="Country"
                  id="instCountry"
                  name="schoolCountry"
                  value={instForm.country}
                  onChange={(e) => setInstForm({ ...instForm, country: e.target.value })}
                  error={instErrors.country}
                  disabled={!isEditingInst || isSavingInst}
                />

                <AppInput
                  label="State"
                  id="instState"
                  name="schoolState"
                  value={instForm.state}
                  onChange={(e) => setInstForm({ ...instForm, state: e.target.value })}
                  error={instErrors.state}
                  disabled={!isEditingInst || isSavingInst}
                />

                <AppInput
                  label="City"
                  id="instCity"
                  name="schoolCity"
                  value={instForm.city}
                  onChange={(e) => setInstForm({ ...instForm, city: e.target.value })}
                  error={instErrors.city}
                  disabled={!isEditingInst || isSavingInst}
                />

                <AppInput
                  label="PIN Code"
                  id="instPin"
                  name="schoolPinCode"
                  value={instForm.pinCode}
                  onChange={(e) => setInstForm({ ...instForm, pinCode: e.target.value })}
                  error={instErrors.pinCode}
                  disabled={!isEditingInst || isSavingInst}
                />

                <FormTextarea
                  label="Full Address"
                  id="instAddress"
                  name="schoolAddress"
                  value={instForm.address}
                  onChange={(e) => setInstForm({ ...instForm, address: e.target.value })}
                  error={instErrors.address}
                  disabled={!isEditingInst || isSavingInst}
                  rows={2}
                  className="md:col-span-4"
                />
              </div>
            </div>

            {/* Section 3: Principal Info */}
            <div className="bg-card text-card-foreground p-6 rounded-lg border border-border shadow-sm space-y-4 md:col-span-2">
              <div className="flex items-center gap-2 border-b border-border/80 pb-3 mb-2">
                <User className="h-5 w-5 text-primary" />
                <h3 className="text-base font-bold text-foreground">Principal Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <AppInput
                  label="Principal Name"
                  id="principalName"
                  name="principalName"
                  value={instForm.principalName}
                  onChange={(e) => setInstForm({ ...instForm, principalName: e.target.value })}
                  error={instErrors.principalName}
                  disabled={!isEditingInst || isSavingInst}
                />

                <AppInput
                  label="Principal Contact"
                  id="principalContact"
                  name="principalContact"
                  value={instForm.principalContact}
                  onChange={(e) => setInstForm({ ...instForm, principalContact: e.target.value })}
                  error={instErrors.principalContact}
                  disabled={!isEditingInst || isSavingInst}
                />

                <AppInput
                  label="Principal Email"
                  id="principalEmail"
                  name="principalEmail"
                  type="email"
                  value={instForm.principalEmail}
                  onChange={(e) => setInstForm({ ...instForm, principalEmail: e.target.value })}
                  error={instErrors.principalEmail}
                  disabled={!isEditingInst || isSavingInst}
                />
              </div>
            </div>

            {/* Section 4: Branding */}
            <div className="bg-card text-card-foreground p-6 rounded-lg border border-border shadow-sm space-y-4 md:col-span-2">
              <div className="flex items-center gap-2 border-b border-border/80 pb-3 mb-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="text-base font-bold text-foreground">School Branding Assets</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <BrandingImageUploader
                  label="Institution Logo"
                  value={instForm.logo}
                  onChange={(file) => setInstForm({ ...instForm, logo: file })}
                  onRemove={() => setInstForm({ ...instForm, logo: null })}
                  disabled={!isEditingInst || isSavingInst}
                />

                <BrandingImageUploader
                  label="Browser Favicon"
                  value={instForm.favicon}
                  onChange={(file) => setInstForm({ ...instForm, favicon: file })}
                  onRemove={() => setInstForm({ ...instForm, favicon: null })}
                  disabled={!isEditingInst || isSavingInst}
                />

                <BrandingImageUploader
                  label="Hero Banner"
                  value={instForm.banner}
                  onChange={(file) => setInstForm({ ...instForm, banner: file })}
                  onRemove={() => setInstForm({ ...instForm, banner: null })}
                  disabled={!isEditingInst || isSavingInst}
                />
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-3 md:col-span-2 border-t border-border pt-4">
              {!isEditingInst ? (
                <Button 
                  onClick={() => setIsEditingInst(true)}
                  className="flex items-center gap-2 px-6"
                >
                  <Edit className="h-4 w-4" />
                  Edit Settings
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleCancelInstEdit} 
                    disabled={isSavingInst}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="secondary" 
                    onClick={handleResetInstForm} 
                    disabled={isSavingInst}
                    className="flex items-center gap-1.5"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset Defaults
                  </Button>
                  <LoadingButton 
                    type="submit"
                    loading={isSavingInst}
                    className="px-6"
                  >
                    Save Details
                  </LoadingButton>
                </div>
              )}
            </div>

          </AppForm>
        </div>
      )}

      {/* --- TAB CONTENT 2: CAMPUS MANAGEMENT --- */}
      {isCampuses && (
        <div className="space-y-4">
          
          {/* Toolbar */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-card p-4 rounded-lg border border-border shadow-sm">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
              <SearchBar 
                value={campusSearch} 
                onChange={setCampusSearch} 
                placeholder="Search by campus, code, principal..." 
              />
              <Filter 
                value={campusFilter} 
                onChange={setCampusFilter} 
                options={[
                  { value: 'all', label: 'All Statuses' },
                  { value: 'active', label: 'Active Only' },
                  { value: 'inactive', label: 'Inactive Only' }
                ]} 
              />
            </div>
            <Button 
              onClick={handleStartAdd}
              className="flex items-center justify-center gap-1.5 shrink-0"
            >
              <Plus className="h-4 w-4" />
              Add Campus
            </Button>
          </div>

          {/* AppTable List rendering */}
          <div className="w-full bg-card rounded-lg border border-border shadow-sm p-4">
            <AppTable
              columns={campusTableColumns}
              data={paginatedCampuses}
              onView={(row) => handleStartView(row)}
              onDelete={(rows) => handleStartDelete(rows[0])}
            />

            {/* Pagination Component */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
              />
            )}
          </div>
        </div>
      )}

      {/* --- SUCCESS DIALOGS --- */}
      <SuccessDialog
        isOpen={showInstSuccess}
        onClose={() => setShowInstSuccess(false)}
        title="Institution Saved"
        message="The school setup profile and branding assets have been updated successfully."
      />

      <SuccessDialog
        isOpen={showCampusSuccess}
        onClose={() => setShowCampusSuccess(false)}
        title="Campus Log Saved"
        message={campusSuccessMessage}
      />

      {/* --- CRUD MODALS FOR CAMPUS --- */}

      {/* VIEW DIALOG */}
      <AppDialog
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Campus Overview Details"
      >
        <div className="space-y-4 text-sm mt-2">
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 pb-3 border-b border-border/60">
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Campus Name</span>
              <p className="font-semibold text-foreground mt-0.5">{activeCampus.name}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Campus Code</span>
              <p className="font-mono font-semibold text-foreground mt-0.5">{activeCampus.code}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Principal In-Charge</span>
              <p className="font-semibold text-foreground mt-0.5">{activeCampus.principal}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Status Badge</span>
              <div className="mt-1">
                <StatusBadge status={activeCampus.status} />
              </div>
            </div>
            <div className="col-span-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Email Address</span>
              <p className="font-semibold text-foreground mt-0.5">{activeCampus.email}</p>
            </div>
            <div className="col-span-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Contact Number</span>
              <p className="font-semibold text-foreground mt-0.5">{activeCampus.contactNumber}</p>
            </div>
            <div className="col-span-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Full Campus Address</span>
              <p className="font-semibold text-foreground mt-0.5">{activeCampus.address}</p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="outline" onClick={() => setIsViewOpen(false)}>Close View</Button>
          </div>
        </div>
      </AppDialog>

      {/* ADD DIALOG */}
      <AppDialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Satellite Campus"
      >
        <AppForm onSubmit={handleAddCampus} className="gap-4 mt-2">
          <AppInput
            label="Campus Name"
            id="addCampusName"
            name="campusName"
            value={activeCampus.name}
            onChange={(e) => setActiveCampus({ ...activeCampus, name: e.target.value })}
            error={campusErrors.name}
            disabled={isSavingCampus}
            className="md:col-span-2"
          />

          <AppInput
            label="Campus Code"
            id="addCampusCode"
            name="campusCode"
            value={activeCampus.code}
            onChange={(e) => setActiveCampus({ ...activeCampus, code: e.target.value })}
            error={campusErrors.code}
            disabled={isSavingCampus}
          />

          <FormSelect
            label="Initial Status"
            id="addCampusStatus"
            name="campusStatus"
            value={activeCampus.status}
            onChange={(e) => setActiveCampus({ ...activeCampus, status: e.target.value })}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' }
            ]}
            error={campusErrors.status}
            disabled={isSavingCampus}
          />

          <AppInput
            label="Principal Name"
            id="addCampusPrincipal"
            name="campusPrincipal"
            value={activeCampus.principal}
            onChange={(e) => setActiveCampus({ ...activeCampus, principal: e.target.value })}
            error={campusErrors.principal}
            disabled={isSavingCampus}
            className="md:col-span-2"
          />

          <AppInput
            label="Contact Number"
            id="addCampusContact"
            name="campusContact"
            value={activeCampus.contactNumber}
            onChange={(e) => setActiveCampus({ ...activeCampus, contactNumber: e.target.value })}
            error={campusErrors.contactNumber}
            disabled={isSavingCampus}
          />

          <AppInput
            label="Campus Email"
            id="addCampusEmail"
            name="campusEmail"
            type="email"
            value={activeCampus.email}
            onChange={(e) => setActiveCampus({ ...activeCampus, email: e.target.value })}
            error={campusErrors.email}
            disabled={isSavingCampus}
          />

          <FormTextarea
            label="Full Postal Address"
            id="addCampusAddress"
            name="campusAddress"
            value={activeCampus.address}
            onChange={(e) => setActiveCampus({ ...activeCampus, address: e.target.value })}
            error={campusErrors.address}
            disabled={isSavingCampus}
            rows={2}
            className="md:col-span-2"
          />

          <div className="flex justify-end gap-2 md:col-span-2 border-t border-border pt-4 mt-2">
            <Button variant="outline" onClick={() => setIsAddOpen(false)} disabled={isSavingCampus}>
              Cancel
            </Button>
            <LoadingButton type="submit" loading={isSavingCampus}>
              Create Campus
            </LoadingButton>
          </div>
        </AppForm>
      </AppDialog>

      {/* EDIT DIALOG */}
      <AppDialog
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Campus Details"
      >
        <AppForm onSubmit={handleEditCampus} className="gap-4 mt-2">
          <AppInput
            label="Campus Name"
            id="editCampusName"
            name="campusName"
            value={activeCampus.name}
            onChange={(e) => setActiveCampus({ ...activeCampus, name: e.target.value })}
            error={campusErrors.name}
            disabled={isSavingCampus}
            className="md:col-span-2"
          />

          <AppInput
            label="Campus Code"
            id="editCampusCode"
            name="campusCode"
            value={activeCampus.code}
            onChange={(e) => setActiveCampus({ ...activeCampus, code: e.target.value })}
            error={campusErrors.code}
            disabled={isSavingCampus}
          />

          <FormSelect
            label="Status"
            id="editCampusStatus"
            name="campusStatus"
            value={activeCampus.status}
            onChange={(e) => setActiveCampus({ ...activeCampus, status: e.target.value })}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' }
            ]}
            error={campusErrors.status}
            disabled={isSavingCampus}
          />

          <AppInput
            label="Principal Name"
            id="editCampusPrincipal"
            name="campusPrincipal"
            value={activeCampus.principal}
            onChange={(e) => setActiveCampus({ ...activeCampus, principal: e.target.value })}
            error={campusErrors.principal}
            disabled={isSavingCampus}
            className="md:col-span-2"
          />

          <AppInput
            label="Contact Number"
            id="editCampusContact"
            name="campusContact"
            value={activeCampus.contactNumber}
            onChange={(e) => setActiveCampus({ ...activeCampus, contactNumber: e.target.value })}
            error={campusErrors.contactNumber}
            disabled={isSavingCampus}
          />

          <AppInput
            label="Campus Email"
            id="editCampusEmail"
            name="campusEmail"
            type="email"
            value={activeCampus.email}
            onChange={(e) => setActiveCampus({ ...activeCampus, email: e.target.value })}
            error={campusErrors.email}
            disabled={isSavingCampus}
          />

          <FormTextarea
            label="Full Postal Address"
            id="editCampusAddress"
            name="campusAddress"
            value={activeCampus.address}
            onChange={(e) => setActiveCampus({ ...activeCampus, address: e.target.value })}
            error={campusErrors.address}
            disabled={isSavingCampus}
            rows={2}
            className="md:col-span-2"
          />

          <div className="flex justify-end gap-2 md:col-span-2 border-t border-border pt-4 mt-2">
            <Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={isSavingCampus}>
              Cancel
            </Button>
            <LoadingButton type="submit" loading={isSavingCampus}>
              Save Changes
            </LoadingButton>
          </div>
        </AppForm>
      </AppDialog>

      {/* DELETE CONFIRM DIALOG */}
      <DeleteDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteCampus}
        itemName={`the campus "${activeCampus.name}" (${activeCampus.code})`}
        loading={isSavingCampus}
      />

    </div>
  )
}
