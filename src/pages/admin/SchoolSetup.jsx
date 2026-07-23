<<<<<<< Updated upstream
import React from 'react'
=======
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

export default function SchoolSetup() {
  return (
    <div className="p-6 bg-card rounded-lg border border-border shadow-sm">
      <h1 className="text-2xl font-bold text-foreground mb-2">School Setup Settings</h1>
      <p className="text-sm text-muted-foreground">Foundation Page for routing validation. Fully functional placeholder.</p>
    </div>
  )
}
