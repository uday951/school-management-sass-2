import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useChildStore } from '@/store'
import axiosClient from '@/config/axiosClient'
import {
  PageContainer,
  PageHeader,
  SimpleCard,
  Button,
  Badge,
  ReusableTable,
  SkeletonLoader
} from '@/components/shared'
import { FileText, Download, ShieldCheck, Award } from 'lucide-react'

export default function Documents() {
  const navigate = useNavigate()
  const { activeChild } = useChildStore()
  const [documents, setDocuments] = useState([])
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchDocuments = async () => {
    if (!activeChild) return
    setLoading(true)
    try {
      const childId = activeChild.id || activeChild._id
      const res = await axiosClient.get(`/portal/child/${childId}/documents`)
      if (res.data.success) {
        setDocuments(res.data.data.documents || [])
        setCertificates(res.data.data.certificates || [])
      }
    } catch (err) {
      console.error('Error fetching child documents:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [activeChild])

  const docColumns = [
    {
      header: 'Document Name',
      accessor: (row) => (
        <span className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary shrink-0" />
          <span className="font-bold text-foreground">{row.name}</span>
        </span>
      )
    },
    {
      header: 'Category',
      accessor: (row) => (
        <Badge className="bg-primary/10 text-primary capitalize font-bold text-[9px]">
          {row.category || 'Other'}
        </Badge>
      )
    },
    { header: 'File Type', accessor: 'fileType' },
    { header: 'Size', accessor: 'size' },
    {
      header: 'Download',
      accessor: (row) => (
        <a
          href={row.url}
          download
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center rounded-lg text-xs font-bold border border-input bg-background hover:bg-accent text-primary px-3 py-1.5 gap-1"
        >
          <Download className="h-3.5 w-3.5" /> Download
        </a>
      )
    }
  ]

  const certColumns = [
    {
      header: 'Certificate Type',
      accessor: (row) => (
        <span className="flex items-center gap-2">
          <Award className="h-4 w-4 text-amber-500 shrink-0" />
          <span className="font-bold text-foreground">{row.certificateType}</span>
        </span>
      )
    },
    {
      header: 'Status',
      accessor: (row) => (
        <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold text-[9px]">
          {row.status || 'Issued'}
        </Badge>
      )
    },
    {
      header: 'Issue Date',
      accessor: (row) => new Date(row.issueDate || row.createdAt).toLocaleDateString()
    },
    {
      header: 'Download',
      accessor: (row) => (
        <a
          href={row.fileUrl || '#'}
          download
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center rounded-lg text-xs font-bold border border-input bg-background hover:bg-accent text-primary px-3 py-1.5 gap-1"
        >
          <Download className="h-3.5 w-3.5" /> Get Certificate
        </a>
      )
    }
  ]

  return (
    <PageContainer>
      <PageHeader
        title="Student Digital Locker"
        subtitle="Manage official transcripts, medical clearances, bonafide declarations, and registration folders."
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate('/parent/dashboard')}>
            Back to Dashboard
          </Button>
        }
      />

      <div className="space-y-6">
        {/* Uploaded Documents */}
        {loading ? (
          <SkeletonLoader count={3} className="h-14 mb-4" />
        ) : (
          <SimpleCard title="Linked student documents list">
            {documents.length === 0 ? (
              <p className="text-xs text-muted-foreground p-2">No documents currently uploaded to the locker.</p>
            ) : (
              <ReusableTable columns={docColumns} data={documents} />
            )}
          </SimpleCard>
        )}

        {/* Certificates */}
        {loading ? (
          <SkeletonLoader count={2} className="h-14 mb-4" />
        ) : (
          <SimpleCard title="Official certificates roster">
            {certificates.length === 0 ? (
              <p className="text-xs text-muted-foreground p-2">No institution certificates have been issued yet.</p>
            ) : (
              <ReusableTable columns={certColumns} data={certificates} />
            )}
          </SimpleCard>
        )}
      </div>
    </PageContainer>
  )
}
