import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  PageHeader, 
  PageContainer, 
  Button, 
  SuccessDialog, 
  FormDialog, 
  StatusChip, 
  Avatar, 
  FormInput, 
  FormSelect, 
  FormTextarea, 
  FileUpload,
  NoData 
} from '@/components/shared'
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  MapPin, 
  Briefcase, 
  Users, 
  FileText, 
  Send, 
  Plus, 
  Trash2, 
  Download, 
  Link as LinkIcon, 
  AlertCircle,
  ShieldCheck,
  Calendar,
  MessageSquare
} from 'lucide-react'
import { parentService } from '@/services/parentService'

export default function ParentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  // Parent State
  const [parent, setParent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  // Available Students List (for student linking)
  const [allStudents, setAllStudents] = useState([])
  const [loadingStudents, setLoadingStudents] = useState(false)

  // Dialog & Toast States
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isLinkOpen, setIsLinkOpen] = useState(false)
  const [isDocOpen, setIsDocOpen] = useState(false)
  const [isCommOpen, setIsCommOpen] = useState(false)
  const [isSuccessOpen, setIsSuccessOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Form States
  const [editForm, setEditForm] = useState({})
  const [linkForm, setLinkForm] = useState({ studentId: '', relationship: 'Parent', isPrimary: true })
  const [docForm, setDocForm] = useState({ documentName: '', documentType: 'Identity Proof', file: null })
  const [commForm, setCommForm] = useState({ type: 'SMS', title: '', message: '' })
  const [actionError, setActionError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Fetch Parent Details
  const fetchParentDetails = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await parentService.getParentById(id)
      setParent(data)
      setEditForm({
        name: data.name || '',
        relationship: data.relationship || 'Father',
        email: data.email || '',
        phone: data.phone || '',
        altPhone: data.altPhone || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        occupation: data.occupation || ''
      })
    } catch (err) {
      setError(err.message || 'Failed to load parent profile.')
    } finally {
      setLoading(false)
    }
  }

  // Fetch Students for dropdown selector
  const fetchAllStudents = async () => {
    setLoadingStudents(true)
    try {
      const res = await fetch('http://localhost:5000/api/v1/students')
      const data = await res.json()
      if (data.success && Array.isArray(data.data)) {
        setAllStudents(data.data)
      } else {
        // Fallback default student options if backend offline
        setAllStudents([
          { _id: '60d01b123432ab34523912a1', id: '60d01b123432ab34523912a1', name: 'Alex Rivera', admissionNo: 'ADM001', class: 'Grade 10', section: 'A' },
          { _id: '60d01b123432ab34523912a2', id: '60d01b123432ab34523912a2', name: 'Chloe Chen', admissionNo: 'ADM002', class: 'Grade 10', section: 'A' }
        ])
      }
    } catch (_err) {
      setAllStudents([
        { _id: '60d01b123432ab34523912a1', id: '60d01b123432ab34523912a1', name: 'Alex Rivera', admissionNo: 'ADM001', class: 'Grade 10', section: 'A' },
        { _id: '60d01b123432ab34523912a2', id: '60d01b123432ab34523912a2', name: 'Chloe Chen', admissionNo: 'ADM002', class: 'Grade 10', section: 'A' }
      ])
    } finally {
      setLoadingStudents(false)
    }
  }

  useEffect(() => {
    fetchParentDetails()
    fetchAllStudents()
  }, [id])

  // --- Handlers ---
  const handleEditSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setActionError('')
    try {
      await parentService.updateParent(id, editForm)
      setIsEditOpen(false)
      setSuccessMessage('Parent profile updated successfully.')
      setIsSuccessOpen(true)
      fetchParentDetails()
    } catch (err) {
      setActionError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleLinkSubmit = async (e) => {
    e.preventDefault()
    if (!linkForm.studentId) {
      setActionError('Please select a student to link.')
      return
    }

    // Find student details object
    const selectedStdObj = allStudents.find(s => s._id === linkForm.studentId || s.id === linkForm.studentId)
    const studentName = selectedStdObj ? (selectedStdObj.name || `${selectedStdObj.firstName || ''} ${selectedStdObj.lastName || ''}`.trim()) : 'Student'

    setSubmitting(true)
    setActionError('')
    try {
      await parentService.linkStudent(id, {
        studentId: linkForm.studentId,
        relationship: linkForm.relationship,
        isPrimary: linkForm.isPrimary,
        studentName,
        admissionNo: selectedStdObj?.admissionNo || 'ADM00' + Math.floor(Math.random() * 90 + 10),
        class: selectedStdObj?.class || 'Grade 10',
        section: selectedStdObj?.section || 'A'
      })
      setIsLinkOpen(false)
      setSuccessMessage(`Successfully linked ${studentName} to ${parent.name}.`)
      setIsSuccessOpen(true)
      fetchParentDetails()
    } catch (err) {
      setActionError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleUnlink = async (studentId, studentName) => {
    if (!window.confirm(`Are you sure you want to remove link for ${studentName}?`)) return
    try {
      await parentService.unlinkStudent(id, studentId)
      setSuccessMessage(`Unlinked student ${studentName}.`)
      setIsSuccessOpen(true)
      fetchParentDetails()
    } catch (err) {
      alert(err.message || 'Error unlinking student.')
    }
  }

  const handleDocSubmit = async (e) => {
    e.preventDefault()
    if (!docForm.documentName?.trim()) {
      setActionError('Document name is required.')
      return
    }

    setSubmitting(true)
    setActionError('')
    try {
      const formData = new FormData()
      formData.append('documentName', docForm.documentName)
      formData.append('documentType', docForm.documentType)
      if (docForm.file) {
        formData.append('document', docForm.file)
      }

      await parentService.addDocument(id, formData)
      setIsDocOpen(false)
      setDocForm({ documentName: '', documentType: 'Identity Proof', file: null })
      setSuccessMessage('Parent document added successfully.')
      setIsSuccessOpen(true)
      fetchParentDetails()
    } catch (err) {
      setActionError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteDoc = async (docId, docName) => {
    if (!window.confirm(`Delete document "${docName}"?`)) return
    try {
      await parentService.deleteDocument(id, docId)
      setSuccessMessage(`Deleted document ${docName}.`)
      setIsSuccessOpen(true)
      fetchParentDetails()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleCommSubmit = async (e) => {
    e.preventDefault()
    if (!commForm.title?.trim() || !commForm.message?.trim()) {
      setActionError('Title and message are required.')
      return
    }

    setSubmitting(true)
    setActionError('')
    try {
      await parentService.addCommunication(id, commForm)
      setIsCommOpen(false)
      setCommForm({ type: 'SMS', title: '', message: '' })
      setSuccessMessage('Communication log recorded successfully.')
      setIsSuccessOpen(true)
      fetchParentDetails()
    } catch (err) {
      setActionError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <PageContainer>
        <div className="p-12 text-center text-sm text-muted-foreground">Loading parent profile details...</div>
      </PageContainer>
    )
  }

  if (error || !parent) {
    return (
      <PageContainer>
        <div className="p-8 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-center space-y-4">
          <AlertCircle className="h-8 w-8 text-rose-500 mx-auto" />
          <h3 className="font-bold text-base">{error || 'Parent not found'}</h3>
          <Button variant="outline" onClick={() => navigate('/admin/parents')}>
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Return to Parent Directory
          </Button>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      {/* Top Navigation & Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
        <button 
          onClick={() => navigate('/admin/parents')}
          className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Parents Directory
        </button>
        <span>/</span>
        <span className="text-foreground font-medium">{parent.name}</span>
      </div>

      {/* Parent Header Card */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar name={parent.name} size="lg" className="h-16 w-16 text-lg border-2 border-primary" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground capitalize">{parent.name}</h1>
              <StatusChip status={parent.status || 'active'} />
              <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary font-semibold border border-primary/20">
                {parent.relationship || 'Parent'}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1 font-medium text-foreground">
                <Phone className="h-3.5 w-3.5 text-primary" /> {parent.phone}
              </span>
              {parent.email && (
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5 text-primary" /> {parent.email}
                </span>
              )}
              {parent.occupation && (
                <span className="flex items-center gap-1">
                  <Briefcase className="h-3.5 w-3.5 text-primary" /> {parent.occupation}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="flex items-center gap-1.5" onClick={() => setIsEditOpen(true)}>
            Edit Profile
          </Button>
          <Button className="flex items-center gap-1.5" onClick={() => setIsCommOpen(true)}>
            <Send className="h-4 w-4" /> Send Message
          </Button>
        </div>
      </div>

      {/* Tabs Navigation Header */}
      <div className="flex border-b border-border mb-6 gap-2 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-4 font-semibold text-xs border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
            activeTab === 'overview' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Contact & Profile
        </button>
        <button 
          onClick={() => setActiveTab('guardians')}
          className={`pb-3 px-4 font-semibold text-xs border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
            activeTab === 'guardians' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Guardians & Emergency Contacts
        </button>
        <button 
          onClick={() => setActiveTab('children')}
          className={`pb-3 px-4 font-semibold text-xs border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'children' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Linked Children
          <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-primary/10 text-primary font-bold">
            {parent.linkedStudents?.length || 0}
          </span>
        </button>
        <button 
          onClick={() => setActiveTab('documents')}
          className={`pb-3 px-4 font-semibold text-xs border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'documents' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Parent Documents
          <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-muted text-muted-foreground font-bold">
            {parent.documents?.length || 0}
          </span>
        </button>
        <button 
          onClick={() => setActiveTab('communications')}
          className={`pb-3 px-4 font-semibold text-xs border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'communications' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Communication History
        </button>
      </div>

      {/* Tab 1: Overview / Contact Information */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card rounded-lg border border-border p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2 border-b border-border pb-3">
              <Users className="h-4 w-4 text-primary" /> Personal & Contact Details
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground block font-medium">Full Name</span>
                <span className="font-semibold text-foreground">{parent.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground block font-medium">Relationship</span>
                <span className="font-semibold text-foreground">{parent.relationship || 'Father'}</span>
              </div>
              <div>
                <span className="text-muted-foreground block font-medium">Primary Phone</span>
                <span className="font-semibold text-foreground">{parent.phone}</span>
              </div>
              <div>
                <span className="text-muted-foreground block font-medium">Alternate Phone</span>
                <span className="font-semibold text-foreground">{parent.altPhone || 'Not provided'}</span>
              </div>
              <div>
                <span className="text-muted-foreground block font-medium">Email Address</span>
                <span className="font-semibold text-foreground">{parent.email || 'Not provided'}</span>
              </div>
              <div>
                <span className="text-muted-foreground block font-medium">Occupation</span>
                <span className="font-semibold text-foreground">{parent.occupation || 'Not provided'}</span>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2 border-b border-border pb-3">
              <MapPin className="h-4 w-4 text-primary" /> Address & Location Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="col-span-2">
                <span className="text-muted-foreground block font-medium">Street Address</span>
                <span className="font-semibold text-foreground">{parent.address || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-muted-foreground block font-medium">City</span>
                <span className="font-semibold text-foreground">{parent.city || 'N/A'}</span>
              </div>
              <div>
                <span className="text-muted-foreground block font-medium">State / Region</span>
                <span className="font-semibold text-foreground">{parent.state || 'N/A'}</span>
              </div>
              <div>
                <span className="text-muted-foreground block font-medium">Country</span>
                <span className="font-semibold text-foreground">{parent.country || 'USA'}</span>
              </div>
              <div>
                <span className="text-muted-foreground block font-medium">Record Created</span>
                <span className="font-semibold text-foreground">
                  {parent.createdAt ? new Date(parent.createdAt).toLocaleDateString() : 'Active'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Guardians & Emergency Contacts */}
      {activeTab === 'guardians' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-card p-4 rounded-lg border border-border shadow-sm">
            <div>
              <h3 className="font-bold text-sm text-foreground">Emergency Contacts & Alternate Guardians</h3>
              <p className="text-xs text-muted-foreground">Authorized personnel for emergency callouts and student pickup</p>
            </div>
          </div>

          {!parent.guardians || parent.guardians.length === 0 ? (
            <NoData 
              title="No Secondary Guardians Registered" 
              description="No additional emergency contact entries exist for this parent record." 
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {parent.guardians.map((g, idx) => (
                <div key={g.id || g._id || idx} className="bg-card rounded-lg border border-border p-4 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      <h4 className="font-bold text-sm text-foreground">{g.guardianName}</h4>
                    </div>
                    {g.isEmergencyContact && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-rose-500/10 text-rose-600 border border-rose-500/20">
                        Emergency Contact
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div>
                      <span>Relationship: </span>
                      <strong className="text-foreground">{g.relationship}</strong>
                    </div>
                    <div>
                      <span>Phone: </span>
                      <strong className="text-foreground">{g.phone || g.emergencyPhone}</strong>
                    </div>
                    {g.email && (
                      <div className="col-span-2">
                        <span>Email: </span>
                        <strong className="text-foreground">{g.email}</strong>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Linked Children */}
      {activeTab === 'children' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-card p-4 rounded-lg border border-border shadow-sm">
            <div>
              <h3 className="font-bold text-sm text-foreground">Linked Children / Students</h3>
              <p className="text-xs text-muted-foreground">Students mapped to this parent profile</p>
            </div>
            <Button className="flex items-center gap-1.5" onClick={() => setIsLinkOpen(true)}>
              <LinkIcon className="h-4 w-4" /> Link Student
            </Button>
          </div>

          {!parent.linkedStudents || parent.linkedStudents.length === 0 ? (
            <NoData 
              title="No Students Linked" 
              description="Click 'Link Student' to attach a student profile to this parent." 
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {parent.linkedStudents.map((item, idx) => {
                const s = item.student || {}
                const studentName = s.name || `${s.firstName || ''} ${s.lastName || ''}`.trim() || 'Student'
                return (
                  <div key={item.id || item._id || idx} className="bg-card rounded-lg border border-border p-4 shadow-sm flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={studentName} size="md" />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-foreground capitalize">{studentName}</h4>
                          <StatusChip status={s.status || 'active'} />
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <span className="font-semibold text-foreground">{s.class || 'Grade 10'} - Section {s.section || 'A'}</span> | Admission No: {s.admissionNo || 'N/A'}
                        </div>
                      </div>
                    </div>

                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-rose-600 border-rose-200 hover:bg-rose-50"
                      onClick={() => handleUnlink(s._id || s.id || item.studentId, studentName)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Parent Documents */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-card p-4 rounded-lg border border-border shadow-sm">
            <div>
              <h3 className="font-bold text-sm text-foreground">Parent Verification Documents</h3>
              <p className="text-xs text-muted-foreground">Identity proofs, certificates, and uploaded documentation</p>
            </div>
            <Button className="flex items-center gap-1.5" onClick={() => setIsDocOpen(true)}>
              <Plus className="h-4 w-4" /> Upload Document
            </Button>
          </div>

          {!parent.documents || parent.documents.length === 0 ? (
            <NoData 
              title="No Documents Uploaded" 
              description="Click 'Upload Document' to add identity cards or verification files." 
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {parent.documents.map((doc, idx) => (
                <div key={doc.id || doc._id || idx} className="bg-card rounded-lg border border-border p-4 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-primary" />
                    <div>
                      <h4 className="font-bold text-sm text-foreground">{doc.documentName}</h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="px-1.5 py-0.2 rounded bg-muted text-muted-foreground font-medium">{doc.documentType || 'Document'}</span>
                        <span>•</span>
                        <span>{doc.uploadedDate ? new Date(doc.uploadedDate).toLocaleDateString() : 'Recent'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {doc.fileUrl && (
                      <a 
                        href={doc.fileUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="p-2 border border-border rounded text-primary hover:bg-muted text-xs font-semibold flex items-center gap-1"
                      >
                        <Download className="h-3.5 w-3.5" /> Download
                      </a>
                    )}
                    <button 
                      onClick={() => handleDeleteDoc(doc.id || doc._id, doc.documentName)}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Communication History */}
      {activeTab === 'communications' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-card p-4 rounded-lg border border-border shadow-sm">
            <div>
              <h3 className="font-bold text-sm text-foreground">Communication Log & Sent History</h3>
              <p className="text-xs text-muted-foreground">Log of SMS messages, email notifications, and circulars dispatched to this parent</p>
            </div>
            <Button className="flex items-center gap-1.5" onClick={() => setIsCommOpen(true)}>
              <Send className="h-4 w-4" /> Log Communication
            </Button>
          </div>

          {!parent.communications || parent.communications.length === 0 ? (
            <NoData 
              title="No Communication Logs Found" 
              description="Click 'Log Communication' to record a message sent to the parent." 
            />
          ) : (
            <div className="space-y-3">
              {parent.communications.map((comm, idx) => (
                <div key={comm.id || comm._id || idx} className="bg-card rounded-lg border border-border p-4 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-primary" />
                      <h4 className="font-bold text-sm text-foreground">{comm.title}</h4>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                        {comm.type || 'SMS'}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {comm.sentAt ? new Date(comm.sentAt).toLocaleString() : 'Just now'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground bg-muted/30 p-2.5 rounded border border-border/40">
                    {comm.message}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                    <span>Status: <strong className="text-emerald-600">{comm.status || 'Delivered'}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Parent Form Dialog */}
      <FormDialog 
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Edit Parent Details: ${parent.name}`}
      >
        <form onSubmit={handleEditSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          {actionError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-md">
              {actionError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <FormInput 
              label="Full Name"
              required
              value={editForm.name}
              onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
            />
            <FormSelect 
              label="Relationship"
              value={editForm.relationship}
              onChange={(e) => setEditForm(prev => ({ ...prev, relationship: e.target.value }))}
              options={[
                { value: 'Father', label: 'Father' },
                { value: 'Mother', label: 'Mother' },
                { value: 'Guardian', label: 'Legal Guardian' }
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormInput 
              label="Phone Number"
              required
              value={editForm.phone}
              onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
            />
            <FormInput 
              label="Email Address"
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>

          <FormTextarea 
            label="Residential Address"
            value={editForm.address}
            onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
            rows={2}
          />

          <div className="grid grid-cols-2 gap-3">
            <FormInput 
              label="City"
              value={editForm.city}
              onChange={(e) => setEditForm(prev => ({ ...prev, city: e.target.value }))}
            />
            <FormInput 
              label="Occupation"
              value={editForm.occupation}
              onChange={(e) => setEditForm(prev => ({ ...prev, occupation: e.target.value }))}
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

      {/* Link Student Dialog */}
      <FormDialog 
        isOpen={isLinkOpen}
        onClose={() => setIsLinkOpen(false)}
        title="Link Student to Parent"
      >
        <form onSubmit={handleLinkSubmit} className="space-y-4">
          {actionError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-md">
              {actionError}
            </div>
          )}

          <p className="text-xs text-muted-foreground">Select an enrolled student to associate with {parent.name}.</p>
          
          <FormSelect 
            label="Select Student"
            required
            value={linkForm.studentId}
            onChange={(e) => setLinkForm(prev => ({ ...prev, studentId: e.target.value }))}
            options={[
              { value: '', label: '-- Choose Student --' },
              ...allStudents.map(s => ({
                value: s._id || s.id,
                label: `${s.name || `${s.firstName || ''} ${s.lastName || ''}`} (${s.admissionNo || 'No ID'}) - ${s.class || 'Grade 10'}`
              }))
            ]}
          />

          <FormSelect 
            label="Relationship"
            value={linkForm.relationship}
            onChange={(e) => setLinkForm(prev => ({ ...prev, relationship: e.target.value }))}
            options={[
              { value: 'Father', label: 'Father' },
              { value: 'Mother', label: 'Mother' },
              { value: 'Guardian', label: 'Legal Guardian' }
            ]}
          />

          <div className="flex gap-2 justify-end border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={() => setIsLinkOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Linking...' : 'Confirm Student Link'}
            </Button>
          </div>
        </form>
      </FormDialog>

      {/* Upload Document Dialog */}
      <FormDialog 
        isOpen={isDocOpen}
        onClose={() => setIsDocOpen(false)}
        title="Upload Parent Verification Document"
      >
        <form onSubmit={handleDocSubmit} className="space-y-4">
          {actionError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-md">
              {actionError}
            </div>
          )}

          <FormInput 
            label="Document Name / Title"
            required
            placeholder="e.g. Driver_License_Passport.pdf"
            value={docForm.documentName}
            onChange={(e) => setDocForm(prev => ({ ...prev, documentName: e.target.value }))}
          />

          <FormSelect 
            label="Document Category"
            value={docForm.documentType}
            onChange={(e) => setDocForm(prev => ({ ...prev, documentType: e.target.value }))}
            options={[
              { value: 'Identity Proof', label: 'Identity Proof (Passport / ID)' },
              { value: 'Address Proof', label: 'Address Proof (Utility bill / Rent agreement)' },
              { value: 'Income Proof', label: 'Income Certificate' },
              { value: 'Other', label: 'Other Document' }
            ]}
          />

          <FileUpload 
            label="Select Document File (PDF / Image)" 
            onFileSelect={(file) => setDocForm(prev => ({ ...prev, file }))} 
          />

          <div className="flex gap-2 justify-end border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={() => setIsDocOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Uploading...' : 'Save Document'}
            </Button>
          </div>
        </form>
      </FormDialog>

      {/* Add Communication Dialog */}
      <FormDialog 
        isOpen={isCommOpen}
        onClose={() => setIsCommOpen(false)}
        title="Log Communication with Parent"
      >
        <form onSubmit={handleCommSubmit} className="space-y-4">
          {actionError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-md">
              {actionError}
            </div>
          )}

          <FormSelect 
            label="Channel / Type"
            value={commForm.type}
            onChange={(e) => setCommForm(prev => ({ ...prev, type: e.target.value }))}
            options={[
              { value: 'SMS', label: 'SMS Dispatch' },
              { value: 'Email', label: 'Email Notification' },
              { value: 'Circular', label: 'School Circular' },
              { value: 'Notice', label: 'Formal Notice' }
            ]}
          />

          <FormInput 
            label="Subject / Title"
            required
            placeholder="e.g. Tuition Fee Reminder"
            value={commForm.title}
            onChange={(e) => setCommForm(prev => ({ ...prev, title: e.target.value }))}
          />

          <FormTextarea 
            label="Message Content"
            required
            placeholder="Type message summary or sent SMS body..."
            value={commForm.message}
            onChange={(e) => setCommForm(prev => ({ ...prev, message: e.target.value }))}
            rows={3}
          />

          <div className="flex gap-2 justify-end border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={() => setIsCommOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Recording...' : 'Record Communication'}
            </Button>
          </div>
        </form>
      </FormDialog>

      {/* Success Notification Modal */}
      <SuccessDialog 
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        message={successMessage}
      />
    </PageContainer>
  )
}
