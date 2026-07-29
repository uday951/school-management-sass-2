import React, { useState, useEffect } from 'react'
import axiosClient from '@/config/axiosClient'
import {
  PageContainer,
  PageHeader,
  SimpleCard,
  Badge,
  ReusableTable,
  SkeletonLoader
} from '@/components/shared'
import { FileText, Download, ShieldCheck, Award } from 'lucide-react'

export default function Documents() {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchDocuments = async () => {
    setLoading(true)
    try {
      const res = await axiosClient.get('/teacher/documents')
      if (res.data.success) {
        setDocuments(res.data.data || [])
      }
    } catch (err) {
      console.error('Error fetching teacher documents:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [])

  const columns = [
    {
      header: 'Document Title',
      accessor: (row) => (
        <span className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary shrink-0" />
          <span className="font-bold text-foreground text-xs">{row.title}</span>
        </span>
      )
    },
    {
      header: 'Category',
      accessor: (row) => (
        <Badge className="bg-primary/5 text-primary border border-primary/10 capitalize font-bold text-[9px]">
          {row.documentType || 'Other'}
        </Badge>
      )
    },
    {
      header: 'Upload Date',
      accessor: (row) => new Date(row.uploadDate || row.createdAt).toLocaleDateString()
    },
    {
      header: 'File Size',
      accessor: (row) => row.fileSize ? `${(row.fileSize / 1024).toFixed(1)} KB` : 'N/A'
    },
    {
      header: 'Action',
      accessor: (row) => (
        <a
          href={row.fileUrl}
          download
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center rounded-lg text-xs font-bold border border-input bg-background hover:bg-accent text-primary px-3 py-1.5 gap-1.5"
        >
          <Download className="h-3.5 w-3.5" /> Download
        </a>
      )
    }
  ]

  return (
    <PageContainer>
      <PageHeader
        title="Staff Digital Locker"
        subtitle="Manage your employment contracts, educational certificates, and validation documents."
      />

      {loading ? (
        <SkeletonLoader count={3} className="h-14 mb-4" />
      ) : documents.length === 0 ? (
        <div className="p-6 bg-card border border-border rounded-2xl text-center">
          <p className="text-muted-foreground text-xs font-semibold">No uploaded documents found in your profile.</p>
        </div>
      ) : (
        <SimpleCard title="Employment documents list">
          <ReusableTable columns={columns} data={documents} />
        </SimpleCard>
      )}
    </PageContainer>
  )
}
