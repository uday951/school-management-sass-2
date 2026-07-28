import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { parentService } from '@/services/parentService'
import { 
  FileText, 
  Upload, 
  Trash2, 
  ArrowLeft, 
  RefreshCw, 
  Download,
  FileCheck
} from 'lucide-react'
import { Button, ReusableTable as AppTable, Alert } from '@/components/shared'

export default function Documents() {
  const navigate = useNavigate()

  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [docName, setDocName] = useState('')
  const [docType, setDocType] = useState('Identity Proof')

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await parentService.getDocuments('default')
        setDocuments(data || [])
      } catch (err) {
        setError('Failed to load parent documents.')
      } finally {
        setLoading(false)
      }
    }
    fetchDocuments()
  }, [])

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!docName.trim()) return

    try {
      const added = await parentService.addDocument('default', {
        documentName: docName,
        documentType: docType
      })
      setDocuments([added, ...documents])
      setDocName('')
    } catch (_err) {
      setError('Failed to upload document.')
    }
  }

  const handleDelete = async (id) => {
    try {
      await parentService.deleteDocument('default', id)
      setDocuments(documents.filter(d => d.id !== id && d._id !== id))
    } catch (_err) {
      // Quiet
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <RefreshCw className="h-8 w-8 text-primary animate-spin" />
        <p className="text-sm font-medium text-muted-foreground">Loading Documents Repository...</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 p-4 md:p-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-5 gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate('/parent/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              Parent & Student Documents Repository
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">Upload identity proofs, medical certificates, and school records.</p>
          </div>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Upload Form */}
      <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-foreground">Upload New Document</h3>
        <form onSubmit={handleUpload} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Document Name (e.g. Birth Certificate)"
            value={docName}
            onChange={e => setDocName(e.target.value)}
            className="px-4 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <select
            value={docType}
            onChange={e => setDocType(e.target.value)}
            className="px-4 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="Identity Proof">Identity Proof</option>
            <option value="Birth Certificate">Birth Certificate</option>
            <option value="Medical Certificate">Medical Certificate</option>
            <option value="Transfer Certificate">Transfer Certificate</option>
          </select>
          <Button type="submit" className="flex items-center justify-center gap-1.5">
            <Upload className="h-4 w-4" /> Upload Document
          </Button>
        </form>
      </div>

      {/* Documents Table */}
      <div className="bg-card p-4 rounded-xl border border-border shadow-sm space-y-4">
        <AppTable
          columns={[
            { header: 'Document Name', accessor: 'documentName' },
            { header: 'Document Type', accessor: 'documentType' },
            { header: 'Uploaded Date', accessor: row => row.uploadedDate || 'Today' },
            {
              header: 'Actions',
              accessor: row => (
                <button
                  onClick={() => handleDelete(row.id || row._id)}
                  className="h-7 w-7 inline-flex items-center justify-center rounded border border-border hover:bg-destructive/10 text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )
            }
          ]}
          data={documents}
        />
      </div>

    </div>
  )
}
