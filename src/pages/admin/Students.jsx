import React, { useState, useMemo } from 'react'
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
  PreviewDialog,
  Badge, 
  StatusChip, 
  Avatar, 
  FormLayout, 
  FormInput, 
  FormSelect, 
  FileUpload,
  PrintableCertificateLayout,
  PrintableTable,
  PrintableReportLayout
} from '@/components/shared'
import { 
  Plus, 
  Download, 
  Upload, 
  Users, 
  ArrowUpRight, 
  Printer, 
  FileText, 
  Search, 
  GraduationCap, 
  Share2 
} from 'lucide-react'

// Dummy Initial Data
const INITIAL_STUDENTS = [
  { id: '1', admissionNo: 'ADM001', rollNo: '101', name: 'Alex Rivera', class: 'Grade 10', section: 'A', parentName: 'Carlos Rivera', phone: '(555) 019-2834', status: 'active', email: 'alex@rivera.com', passoutYear: null },
  { id: '2', admissionNo: 'ADM002', rollNo: '102', name: 'Chloe Chen', class: 'Grade 10', section: 'A', parentName: 'David Chen', phone: '(555) 012-8374', status: 'active', email: 'chloe@chen.com', passoutYear: null },
  { id: '3', admissionNo: 'ADM003', rollNo: '103', name: 'Marcus Brody', class: 'Grade 9', section: 'B', parentName: 'Elena Brody', phone: '(555) 014-9281', status: 'active', email: 'marcus@brody.com', passoutYear: null },
  { id: '4', admissionNo: 'ADM004', rollNo: '104', name: 'Sophia Martinez', class: 'Grade 9', section: 'B', parentName: 'Luiz Martinez', phone: '(555) 017-3829', status: 'active', email: 'sophia@martinez.com', passoutYear: null },
  { id: '5', admissionNo: 'ADM005', rollNo: '105', name: 'Ethan Hunt', class: 'Grade 12', section: 'A', parentName: 'Sarah Hunt', phone: '(555) 011-2834', status: 'inactive', email: 'ethan@hunt.com', passoutYear: '2025' },
]

export default function Students() {
  const navigate = useNavigate()
  
  // State
  const [students, setStudents] = useState(INITIAL_STUDENTS)
  const [searchQuery, setSearchQuery] = useState('')
  const [classFilter, setClassFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('active') // Default to active students
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [selectedList, setSelectedList] = useState([])
  
  // Modals & Dialogs States
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isSuccessOpen, setIsSuccessOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [isPromoteOpen, setIsPromoteOpen] = useState(false)
  const [isTransferOpen, setIsTransferOpen] = useState(false)
  const [isIdCardOpen, setIsIdCardOpen] = useState(false)
  const [isCertOpen, setIsCertOpen] = useState(false)
  const [certType, setCertType] = useState('bonafide')
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [isExportOpen, setIsExportOpen] = useState(false)

  // Promotion Form State
  const [promoteForm, setPromoteForm] = useState({ targetClass: '', targetSection: '', academicYear: '2026-2027' })
  
  // Transfer Form State
  const [transferForm, setTransferForm] = useState({ reason: '', date: '' })

  // Filters & Search
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            student.admissionNo.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesClass = classFilter ? student.class === classFilter : true
      const matchesStatus = statusFilter === 'alumni' 
        ? !!student.passoutYear 
        : student.status === statusFilter && !student.passoutYear
      return matchesSearch && matchesClass && matchesStatus
    })
  }, [students, searchQuery, classFilter, statusFilter])

  // Handlers
  const handleDeleteTrigger = (items) => {
    setSelectedStudent(items[0])
    setIsDeleteOpen(true)
  }

  const handleDeleteConfirm = () => {
    setStudents(prev => prev.filter(s => s.id !== selectedStudent.id))
    setIsDeleteOpen(false)
    setSuccessMessage(`Successfully deleted ${selectedStudent.name}'s record.`)
    setIsSuccessOpen(true)
  }

  const handlePromoteConfirm = (e) => {
    e.preventDefault()
    const targetIds = selectedStudent ? [selectedStudent.id] : selectedList.map(s => s.id)
    setStudents(prev => prev.map(s => {
      if (targetIds.includes(s.id)) {
        return { ...s, class: promoteForm.targetClass, section: promoteForm.targetSection }
      }
      return s
    }))
    setIsPromoteOpen(false)
    setSuccessMessage('Successfully promoted selected students.')
    setIsSuccessOpen(true)
  }

  const handleTransferConfirm = (e) => {
    e.preventDefault()
    setStudents(prev => prev.map(s => {
      if (s.id === selectedStudent.id) {
        return { ...s, status: 'inactive' }
      }
      return s
    }))
    setIsTransferOpen(false)
    setSuccessMessage(`Successfully transferred ${selectedStudent.name}.`)
    setIsSuccessOpen(true)
  }

  // Export handlers
  const triggerExport = (type) => {
    setIsExportOpen(false)
    setSuccessMessage(`Successfully exported data to ${type.toUpperCase()} format.`)
    setIsSuccessOpen(true)
  }

  const columns = [
    {
      header: 'Photo',
      accessor: (row) => <Avatar name={row.name} size="sm" />
    },
    { header: 'Admission No', accessor: 'admissionNo', sortable: true },
    { header: 'Roll No', accessor: 'rollNo', sortable: true },
    { header: 'Student Name', accessor: 'name', sortable: true },
    { header: 'Class', accessor: 'class' },
    { header: 'Section', accessor: 'section' },
    { header: 'Parent Name', accessor: 'parentName' },
    { header: 'Phone', accessor: 'phone' },
    {
      header: 'Status',
      accessor: (row) => <StatusChip status={row.status} />
    }
  ]

  return (
    <PageContainer>
      <PageHeader 
        title="Student Directory"
        subtitle="Manage student lists, credentials, transfers and promotions"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="flex items-center gap-1.5" onClick={() => setIsImportOpen(true)}>
              <Upload className="h-4 w-4" /> Bulk Import
            </Button>
            <Button variant="outline" className="flex items-center gap-1.5" onClick={() => setIsExportOpen(true)}>
              <Download className="h-4 w-4" /> Bulk Export
            </Button>
            <Button className="flex items-center gap-1.5" onClick={() => navigate('/admin/students/create')}>
              <Plus className="h-4 w-4" /> Add Student
            </Button>
          </div>
        }
      />

      {/* Directory Filter / Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-card p-4 rounded-lg border border-border shadow-sm mb-6">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search Name or Admission No..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 rounded-md border border-input pl-8 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring bg-background"
          />
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>

        <FormSelect 
          placeholder="Filter by Class"
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          options={[
            { value: 'Grade 9', label: 'Grade 9' },
            { value: 'Grade 10', label: 'Grade 10' },
            { value: 'Grade 12', label: 'Grade 12' }
          ]}
          className="h-9 space-y-0"
        />

        <FormSelect 
          placeholder="Filter by Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: 'active', label: 'Active Students' },
            { value: 'inactive', label: 'Suspended Students' },
            { value: 'alumni', label: 'Alumni Directory' }
          ]}
          className="h-9 space-y-0"
        />

        <div className="flex gap-2 justify-end items-center">
          {selectedList.length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1 text-primary border-primary/20 bg-primary/5 hover:bg-primary/10"
              onClick={() => {
                setSelectedStudent(null)
                setIsPromoteOpen(true)
              }}
            >
              <ArrowUpRight className="h-4 w-4" /> Bulk Promote
            </Button>
          )}
        </div>
      </div>

      {/* Master Data Table */}
      <div className="bg-card rounded-lg border border-border p-4 shadow-sm">
        <ReusableTable 
          columns={columns}
          data={filteredStudents}
          selectable={statusFilter !== 'alumni'}
          onSelectionChange={setSelectedList}
          onView={(row) => navigate(`/admin/students/${row.id}`)}
          onDelete={handleDeleteTrigger}
          actions={[
            {
              label: 'Promote',
              onClick: (items) => {
                setSelectedStudent(items[0])
                setIsPromoteOpen(true)
              }
            },
            {
              label: 'Transfer',
              onClick: (items) => {
                setSelectedStudent(items[0])
                setIsTransferOpen(true)
              }
            },
            {
              label: 'ID Card',
              onClick: (items) => {
                setSelectedStudent(items[0])
                setIsIdCardOpen(true)
              }
            },
            {
              label: 'Bonafide Cert',
              onClick: (items) => {
                setSelectedStudent(items[0])
                setCertType('bonafide')
                setIsCertOpen(true)
              }
            },
            {
              label: 'Transfer Cert',
              onClick: (items) => {
                setSelectedStudent(items[0])
                setCertType('transfer')
                setIsCertOpen(true)
              }
            }
          ]}
        />
        <TablePagination currentPage={1} totalPages={1} />
      </div>

      {/* 1. Delete Modal */}
      <DeleteDialog 
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={selectedStudent?.name}
      />

      {/* 2. Success Toast Modal */}
      <SuccessDialog 
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        message={successMessage}
      />

      {/* 3. Promotion Form Modal */}
      <FormDialog 
        isOpen={isPromoteOpen}
        onClose={() => setIsPromoteOpen(false)}
        title={selectedStudent ? `Promote Student: ${selectedStudent.name}` : `Bulk Promote ${selectedList.length} Students`}
      >
        <form onSubmit={handlePromoteConfirm} className="space-y-4">
          <p className="text-xs text-muted-foreground">Select the destination academic criteria for promotion allocation.</p>
          <FormSelect 
            label="Target Class"
            required
            value={promoteForm.targetClass}
            onChange={(e) => setPromoteForm(prev => ({ ...prev, targetClass: e.target.value }))}
            options={[
              { value: 'Grade 10', label: 'Grade 10' },
              { value: 'Grade 11', label: 'Grade 11' },
              { value: 'Grade 12', label: 'Grade 12' }
            ]}
          />
          <FormSelect 
            label="Target Section"
            required
            value={promoteForm.targetSection}
            onChange={(e) => setPromoteForm(prev => ({ ...prev, targetSection: e.target.value }))}
            options={[
              { value: 'A', label: 'A' },
              { value: 'B', label: 'B' },
              { value: 'C', label: 'C' }
            ]}
          />
          <FormSelect 
            label="Academic Year"
            required
            value={promoteForm.academicYear}
            onChange={(e) => setPromoteForm(prev => ({ ...prev, academicYear: e.target.value }))}
            options={[
              { value: '2026-2027', label: '2026-2027' },
              { value: '2027-2028', label: '2027-2028' }
            ]}
          />
          <div className="flex gap-2 justify-end border-t border-border pt-4">
            <Button variant="outline" onClick={() => setIsPromoteOpen(false)}>Cancel</Button>
            <Button type="submit">Promote Students</Button>
          </div>
        </form>
      </FormDialog>

      {/* 4. Transfer Form Modal */}
      <FormDialog 
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        title={`Initiate Student Transfer: ${selectedStudent?.name}`}
      >
        <form onSubmit={handleTransferConfirm} className="space-y-4">
          <p className="text-xs text-muted-foreground">Log the reason and schedule details for generating the Transfer Certificate (TC).</p>
          <FormInput 
            label="Transfer Date"
            type="date"
            required
            value={transferForm.date}
            onChange={(e) => setTransferForm(prev => ({ ...prev, date: e.target.value }))}
          />
          <FormInput 
            label="Reason for Transfer"
            placeholder="e.g. Relocating, Course completion"
            required
            value={transferForm.reason}
            onChange={(e) => setTransferForm(prev => ({ ...prev, reason: e.target.value }))}
          />
          <div className="flex gap-2 justify-end border-t border-border pt-4">
            <Button variant="outline" onClick={() => setIsTransferOpen(false)}>Cancel</Button>
            <Button type="submit" variant="danger">Approve Transfer & Generate TC</Button>
          </div>
        </form>
      </FormDialog>

      {/* 5. ID Card Preview Modal */}
      <PreviewDialog 
        isOpen={isIdCardOpen}
        onClose={() => setIsIdCardOpen(false)}
        title={`Student ID Card: ${selectedStudent?.name}`}
      >
        <div className="flex flex-col items-center justify-center p-4">
          <div className="w-80 border-2 border-primary rounded-xl overflow-hidden bg-card text-card-foreground shadow-lg flex flex-col items-center p-6 space-y-4">
            <div className="text-center w-full border-b border-border pb-2">
              <h4 className="font-bold text-sm tracking-wide text-primary uppercase">Metropolitan Academy</h4>
              <span className="text-[10px] text-muted-foreground uppercase">Student Identification</span>
            </div>
            
            <Avatar name={selectedStudent?.name || 'Student'} size="lg" className="border-2 border-primary h-20 w-20" />
            
            <div className="text-center space-y-1">
              <h3 className="font-bold text-base text-foreground capitalize">{selectedStudent?.name}</h3>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{selectedStudent?.class} - Section {selectedStudent?.section}</p>
            </div>

            <div className="w-full space-y-2 text-xs text-muted-foreground border-t border-border pt-4">
              <div className="flex justify-between">
                <span>Admission No:</span>
                <span className="font-semibold text-foreground">{selectedStudent?.admissionNo}</span>
              </div>
              <div className="flex justify-between">
                <span>Roll Number:</span>
                <span className="font-semibold text-foreground">{selectedStudent?.rollNo}</span>
              </div>
              <div className="flex justify-between">
                <span>Emergency Tel:</span>
                <span className="font-semibold text-foreground">{selectedStudent?.phone}</span>
              </div>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button size="sm" variant="outline" onClick={() => window.print()} className="flex items-center gap-1">
              <Printer className="h-4 w-4" /> Print ID Card
            </Button>
          </div>
        </div>
      </PreviewDialog>

      {/* 6. Certificate Generation Modal */}
      <PreviewDialog 
        isOpen={isCertOpen}
        onClose={() => setIsCertOpen(false)}
        title={`Generate Certificate: ${selectedStudent?.name}`}
      >
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {certType === 'bonafide' ? (
            <PrintableCertificateLayout 
              title="Bonafide Certificate"
              recipientName={selectedStudent?.name}
              subtitle="This is to certify that"
              description={`is a bonafide student of ${selectedStudent?.class}, Section ${selectedStudent?.section} in Metropolitan Academy under Admission ID ${selectedStudent?.admissionNo} for the academic session.`}
            />
          ) : (
            <PrintableCertificateLayout 
              title="Transfer Certificate"
              recipientName={selectedStudent?.name}
              subtitle="This is to certify that"
              description={`has completed the prescribed course of studies and is hereby granted transfer clearance from ${selectedStudent?.class} under roll number ${selectedStudent?.rollNo}.`}
            />
          )}
          <div className="mt-4 flex justify-center gap-2">
            <Button size="sm" variant="outline" onClick={() => window.print()} className="flex items-center gap-1">
              <Printer className="h-4 w-4" /> Print Certificate
            </Button>
          </div>
        </div>
      </PreviewDialog>

      {/* 7. Bulk Import Modal */}
      <FormDialog 
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        title="Bulk Student Admissions Import"
      >
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">Select a formatted Excel or CSV spreadsheet containing the student registration headers.</p>
          <div className="p-3 border border-border rounded bg-muted/40 flex items-center justify-between text-xs font-semibold">
            <span>Download CSV Template Sheet</span>
            <Button size="sm" variant="outline" className="flex items-center gap-1">
              <Download className="h-3.5 w-3.5" /> Template.csv
            </Button>
          </div>
          <FileUpload label="Select Import File" onFileSelect={(file) => console.log('Spreadsheet loaded', file)} />
          <div className="flex gap-2 justify-end border-t border-border pt-4">
            <Button variant="outline" onClick={() => setIsImportOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              setIsImportOpen(false)
              setSuccessMessage('Successfully imported 25 student profiles.')
              setIsSuccessOpen(true)
            }}>Run Spreadsheet Validation</Button>
          </div>
        </div>
      </FormDialog>

      {/* 8. Bulk Export Modal */}
      <FormDialog 
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        title="Export Directory Data"
      >
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">Choose the format to compile the current filtered students register list.</p>
          <div className="grid grid-cols-3 gap-2">
            <button 
              onClick={() => triggerExport('csv')}
              className="border border-border p-4 rounded hover:bg-muted flex flex-col items-center gap-2 cursor-pointer font-bold text-xs"
            >
              <FileText className="h-6 w-6 text-[#0EA5E9]" /> CSV Sheet
            </button>
            <button 
              onClick={() => triggerExport('xlsx')}
              className="border border-border p-4 rounded hover:bg-muted flex flex-col items-center gap-2 cursor-pointer font-bold text-xs"
            >
              <FileText className="h-6 w-6 text-emerald-600" /> Excel Sheet
            </button>
            <button 
              onClick={() => triggerExport('pdf')}
              className="border border-border p-4 rounded hover:bg-muted flex flex-col items-center gap-2 cursor-pointer font-bold text-xs"
            >
              <FileText className="h-6 w-6 text-rose-600" /> PDF Document
            </button>
          </div>
          <div className="flex justify-end border-t border-border pt-4">
            <Button variant="outline" onClick={() => setIsExportOpen(false)}>Cancel</Button>
          </div>
        </div>
      </FormDialog>
    </PageContainer>
  )
}
