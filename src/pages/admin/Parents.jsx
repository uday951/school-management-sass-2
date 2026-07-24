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
  StatusChip, 
  Avatar, 
  FormInput, 
  FormSelect, 
  FormTextarea 
} from '@/components/shared'
import { 
  Plus, 
  Search, 
  Users, 
  Phone, 
  Mail, 
  Eye, 
  Edit3, 
  Trash2, 
  AlertCircle,
  Upload,
  Download,
  FileSpreadsheet
} from 'lucide-react'
import { parentService } from '@/services/parentService'
import { FileUpload } from '@/components/shared'

export default function Parents() {
  const navigate = useNavigate()

  // State Management
  const [parents, setParents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  // Dialog & Modal States
  const [selectedParent, setSelectedParent] = useState(null)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [isSuccessOpen, setIsSuccessOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Bulk Import State
  const [importText, setImportText] = useState('')
  const [importing, setImporting] = useState(false)

  // Form State
  const initialFormState = {
    name: '',
    relationship: 'Father',
    email: '',
    phone: '',
    altPhone: '',
    address: '',
    city: '',
    state: '',
    occupation: '',
    guardianName: '',
    guardianRelation: 'Guardian',
    guardianPhone: ''
  }
  const [formData, setFormData] = useState(initialFormState)
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  // CSV Template download
  const handleDownloadTemplate = () => {
    const csvHeader = "name,relationship,email,phone,altPhone,address,city,state,occupation,studentAdmissionNo\n"
    const sampleRow1 = "David Miller,Father,david.miller@example.com,(555) 444-1111,,123 Elm St,Springfield,IL,Architect,ADM001\n"
    const sampleRow2 = "Sarah Miller,Mother,sarah.miller@example.com,(555) 444-2222,,123 Elm St,Springfield,IL,Engineer,ADM002\n"
    const blob = new Blob([csvHeader + sampleRow1 + sampleRow2], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'parents_bulk_import_template.csv'
    a.click()
  }

  // Parse CSV records
  const parseCSV = (text) => {
    const lines = text.split('\n').filter(l => l.trim().length > 0)
    if (lines.length <= 1) return []
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
    const records = []

    for (let i = 1; i < lines.length; i++) {
      const vals = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''))
      if (vals.length === 0 || !vals[0]) continue
      const obj = {}
      headers.forEach((h, idx) => {
        obj[h] = vals[idx] || ''
      })
      records.push(obj)
    }
    return records
  }

  const handleBulkImportSubmit = async (e) => {
    e.preventDefault()
    if (!importText.trim()) {
      alert('Please paste CSV text or select a template file.')
      return
    }

    setImporting(true)
    try {
      let records = []
      if (importText.trim().startsWith('[')) {
        records = JSON.parse(importText)
      } else {
        records = parseCSV(importText)
      }

      if (records.length === 0) {
        throw new Error('No valid parent rows were parsed from the CSV data.')
      }

      const res = await parentService.importParents(records)
      setIsImportOpen(false)
      setImportText('')
      setSuccessMessage(`Bulk import complete! Imported ${res.importedCount || records.length} parent records and linked ${res.linkedCount || 0} student(s).`)
      setIsSuccessOpen(true)
      fetchParents()
    } catch (err) {
      alert(err.message || 'Error processing bulk import.')
    } finally {
      setImporting(false)
    }
  }

  // Fetch Parent list
  const fetchParents = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await parentService.getParents({ search: searchQuery, status: statusFilter })
      setParents(data.parents || [])
    } catch (err) {
      setError(err.message || 'Failed to load parent records.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchParents()
  }, [searchQuery, statusFilter])

  // Validation
  const validateForm = () => {
    const errors = {}
    if (!formData.name?.trim()) errors.name = 'Full name is required'
    if (!formData.phone?.trim()) errors.phone = 'Phone number is required'
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format'
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handlers
  const handleOpenAdd = () => {
    setFormData(initialFormState)
    setFormErrors({})
    setIsAddOpen(true)
  }

  const handleOpenEdit = (parent) => {
    setSelectedParent(parent)
    setFormData({
      name: parent.name || '',
      relationship: parent.relationship || 'Father',
      email: parent.email || '',
      phone: parent.phone || '',
      altPhone: parent.altPhone || '',
      address: parent.address || '',
      city: parent.city || '',
      state: parent.state || '',
      occupation: parent.occupation || '',
      guardianName: '',
      guardianRelation: 'Guardian',
      guardianPhone: ''
    })
    setFormErrors({})
    setIsEditOpen(true)
  }

  const handleOpenDelete = (parent) => {
    setSelectedParent(parent)
    setIsDeleteOpen(true)
  }

  const handleAddSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setSubmitting(true)
    try {
      await parentService.createParent(formData)
      setIsAddOpen(false)
      setSuccessMessage(`Successfully registered ${formData.name}.`)
      setIsSuccessOpen(true)
      fetchParents()
    } catch (err) {
      setFormErrors({ submit: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setSubmitting(true)
    try {
      await parentService.updateParent(selectedParent.id || selectedParent._id, formData)
      setIsEditOpen(false)
      setSuccessMessage(`Successfully updated ${formData.name}'s profile.`)
      setIsSuccessOpen(true)
      fetchParents()
    } catch (err) {
      setFormErrors({ submit: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!selectedParent) return
    try {
      await parentService.deleteParent(selectedParent.id || selectedParent._id)
      setIsDeleteOpen(false)
      setSuccessMessage(`Successfully deleted record for ${selectedParent.name}.`)
      setIsSuccessOpen(true)
      fetchParents()
    } catch (err) {
      alert(err.message || 'Error deleting parent record.')
    }
  }

  // Table Columns Setup
  const columns = [
    {
      header: 'Parent Name',
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.name} size="sm" />
          <div>
            <div className="font-bold text-foreground capitalize flex items-center gap-1.5">
              {row.name}
              <span className="text-[10px] font-normal px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                {row.relationship || 'Parent'}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">{row.occupation || 'N/A'}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Contact Info',
      accessor: (row) => (
        <div className="space-y-0.5 text-xs">
          <div className="flex items-center gap-1 text-foreground font-medium">
            <Phone className="h-3 w-3 text-muted-foreground" /> {row.phone}
          </div>
          {row.email && (
            <div className="flex items-center gap-1 text-muted-foreground truncate max-w-[180px]">
              <Mail className="h-3 w-3 text-muted-foreground" /> {row.email}
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Location',
      accessor: (row) => (
        <div className="text-xs text-muted-foreground">
          {row.city && row.state ? `${row.city}, ${row.state}` : row.address || 'Not specified'}
        </div>
      )
    },
    {
      header: 'Children Linked',
      accessor: (row) => (
        <div className="text-xs font-semibold text-primary">
          {row.linkedStudents?.length || 0} student(s)
        </div>
      )
    },
    {
      header: 'Status',
      accessor: (row) => <StatusChip status={row.status || 'active'} />
    }
  ]

  return (
    <PageContainer>
      <PageHeader 
        title="Parent & Guardian Directory"
        subtitle="Manage parent profiles, emergency contacts, documents, and student linkages"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="flex items-center gap-1.5" onClick={() => setIsImportOpen(true)}>
              <Upload className="h-4 w-4" /> Bulk Import Parents
            </Button>
            <Button className="flex items-center gap-1.5" onClick={handleOpenAdd}>
              <Plus className="h-4 w-4" /> Add Parent / Guardian
            </Button>
          </div>
        }
      />

      {/* Filter and Search Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-card p-4 rounded-lg border border-border shadow-sm mb-6">
        <div className="relative md:col-span-2">
          <input 
            type="text" 
            placeholder="Search Parent Name, Phone or Email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 rounded-md border border-input pl-8 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring bg-background"
          />
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>

        <FormSelect 
          placeholder="Filter by Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: '', label: 'All Statuses' },
            { value: 'active', label: 'Active Parents' },
            { value: 'inactive', label: 'Inactive Records' }
          ]}
          className="h-9 space-y-0"
        />
      </div>

      {/* Master Data Table */}
      <div className="bg-card rounded-lg border border-border p-4 shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading parent directory...</div>
        ) : error ? (
          <div className="p-6 text-center text-sm text-rose-500 bg-rose-500/10 rounded-lg flex items-center justify-center gap-2">
            <AlertCircle className="h-4 w-4" /> {error}
          </div>
        ) : (
          <>
            <ReusableTable 
              columns={columns}
              data={parents}
              onView={(row) => navigate(`/admin/parents/${row.id || row._id}`)}
              onDelete={(rows) => handleOpenDelete(rows[0])}
              actions={[
                {
                  label: 'Edit Profile',
                  onClick: (rows) => handleOpenEdit(rows[0])
                }
              ]}
            />
            <TablePagination currentPage={1} totalPages={1} />
          </>
        )}
      </div>

      {/* Add Parent Form Dialog */}
      <FormDialog 
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Register New Parent & Guardian"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          {formErrors.submit && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-md">
              {formErrors.submit}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormInput 
              label="Full Name"
              required
              placeholder="e.g. Robert Vance"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              error={formErrors.name}
            />
            <FormSelect 
              label="Relationship"
              value={formData.relationship}
              onChange={(e) => setFormData(prev => ({ ...prev, relationship: e.target.value }))}
              options={[
                { value: 'Father', label: 'Father' },
                { value: 'Mother', label: 'Mother' },
                { value: 'Guardian', label: 'Legal Guardian' },
                { value: 'Other', label: 'Other Relative' }
              ]}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormInput 
              label="Phone Number"
              required
              placeholder="(555) 000-0000"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              error={formErrors.phone}
            />
            <FormInput 
              label="Alternate Phone"
              placeholder="(555) 000-0000"
              value={formData.altPhone}
              onChange={(e) => setFormData(prev => ({ ...prev, altPhone: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormInput 
              label="Email Address"
              type="email"
              placeholder="parent@example.com"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              error={formErrors.email}
            />
            <FormInput 
              label="Occupation"
              placeholder="e.g. Engineer, Business"
              value={formData.occupation}
              onChange={(e) => setFormData(prev => ({ ...prev, occupation: e.target.value }))}
            />
          </div>

          <FormTextarea 
            label="Residential Address"
            placeholder="Street address, apartment, or house number"
            value={formData.address}
            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            rows={2}
          />

          <div className="grid grid-cols-2 gap-3">
            <FormInput 
              label="City"
              placeholder="Springfield"
              value={formData.city}
              onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
            />
            <FormInput 
              label="State"
              placeholder="IL"
              value={formData.state}
              onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
            />
          </div>

          {/* Emergency Guardian Details */}
          <div className="border-t border-border pt-3 mt-3">
            <h4 className="font-semibold text-xs text-foreground uppercase tracking-wider mb-2">Emergency Contact / Guardian Info</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormInput 
                label="Guardian Name"
                placeholder="Emergency contact person"
                value={formData.guardianName}
                onChange={(e) => setFormData(prev => ({ ...prev, guardianName: e.target.value }))}
              />
              <FormInput 
                label="Emergency Phone"
                placeholder="(555) 000-0000"
                value={formData.guardianPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, guardianPhone: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Register Parent'}
            </Button>
          </div>
        </form>
      </FormDialog>

      {/* Edit Parent Form Dialog */}
      <FormDialog 
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Edit Parent Details: ${selectedParent?.name}`}
      >
        <form onSubmit={handleEditSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          {formErrors.submit && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-md">
              {formErrors.submit}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormInput 
              label="Full Name"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              error={formErrors.name}
            />
            <FormSelect 
              label="Relationship"
              value={formData.relationship}
              onChange={(e) => setFormData(prev => ({ ...prev, relationship: e.target.value }))}
              options={[
                { value: 'Father', label: 'Father' },
                { value: 'Mother', label: 'Mother' },
                { value: 'Guardian', label: 'Legal Guardian' },
                { value: 'Other', label: 'Other Relative' }
              ]}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormInput 
              label="Phone Number"
              required
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              error={formErrors.phone}
            />
            <FormInput 
              label="Alternate Phone"
              value={formData.altPhone}
              onChange={(e) => setFormData(prev => ({ ...prev, altPhone: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormInput 
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              error={formErrors.email}
            />
            <FormInput 
              label="Occupation"
              value={formData.occupation}
              onChange={(e) => setFormData(prev => ({ ...prev, occupation: e.target.value }))}
            />
          </div>

          <FormTextarea 
            label="Residential Address"
            value={formData.address}
            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            rows={2}
          />

          <div className="grid grid-cols-2 gap-3">
            <FormInput 
              label="City"
              value={formData.city}
              onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
            />
            <FormInput 
              label="State"
              value={formData.state}
              onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
            />
          </div>

          <div className="flex gap-2 justify-end border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Updating...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </FormDialog>

      {/* Delete Confirmation Modal */}
      <DeleteDialog 
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={selectedParent?.name}
      />

      {/* Success Notification Modal */}
      <SuccessDialog 
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        message={successMessage}
      />

      {/* Bulk Import Parents Form Dialog */}
      <FormDialog 
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        title="Bulk Parent Registration & Student Linking"
      >
        <form onSubmit={handleBulkImportSubmit} className="space-y-4">
          <div className="flex items-center justify-between p-3 border border-border rounded bg-muted/30">
            <div>
              <h4 className="font-bold text-xs text-foreground">Download CSV Template Sheet</h4>
              <p className="text-[11px] text-muted-foreground">Pre-formatted header CSV for parent details & student admission numbers</p>
            </div>
            <Button 
              type="button" 
              size="sm" 
              variant="outline" 
              onClick={handleDownloadTemplate} 
              className="flex items-center gap-1 shrink-0"
            >
              <Download className="h-3.5 w-3.5" /> Sample.csv
            </Button>
          </div>

          <FormTextarea 
            label="Paste CSV / JSON Payload"
            required
            placeholder={`name,relationship,email,phone,address,occupation,studentAdmissionNo\nDavid Miller,Father,david@example.com,(555) 444-1111,123 Elm St,Architect,ADM001\nSarah Miller,Mother,sarah@example.com,(555) 444-2222,123 Elm St,Engineer,ADM002`}
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            rows={6}
          />

          <div className="flex gap-2 justify-end border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={() => setIsImportOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={importing}>
              {importing ? 'Processing Import...' : 'Run Bulk Import & Link Students'}
            </Button>
          </div>
        </form>
      </FormDialog>
    </PageContainer>
  )
}
