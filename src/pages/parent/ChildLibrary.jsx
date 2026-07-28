import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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
import { Book, Calendar, CreditCard, AlertCircle } from 'lucide-react'

export default function ChildLibrary() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [issuedBooks, setIssuedBooks] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchLibraryRecords = async () => {
    setLoading(true)
    try {
      const res = await axiosClient.get(`/portal/child/${id}/library`)
      if (res.data.success) {
        setIssuedBooks(res.data.data)
      }
    } catch (err) {
      console.error('Error fetching child library records:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLibraryRecords()
  }, [id])

  const columns = [
    {
      header: 'Book Title',
      accessor: (row) => (
        <span className="flex items-center gap-2">
          <Book className="h-4 w-4 text-primary shrink-0" />
          <span className="font-bold text-foreground">{row.book}</span>
        </span>
      )
    },
    { header: 'ISBN', accessor: 'isbn' },
    {
      header: 'Issue Date',
      accessor: (row) => row.issueDate
    },
    {
      header: 'Due Date',
      accessor: (row) => (
        <span className="flex items-center gap-1 font-semibold text-foreground">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
          {row.dueDate}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: (row) => {
        let style = 'bg-blue-50 text-blue-600 border border-blue-100'
        if (row.status === 'overdue') style = 'bg-rose-50 text-rose-600 border border-rose-100'
        if (row.status === 'returned') style = 'bg-emerald-50 text-emerald-600 border border-emerald-100'
        return (
          <Badge className={`capitalize font-bold text-[10px] ${style}`}>
            {row.status}
          </Badge>
        )
      }
    }
  ]

  // Calculate overdue count
  const overdueCount = issuedBooks.filter(b => b.status === 'overdue').length

  return (
    <PageContainer>
      <PageHeader
        title="Library Books Dossier"
        subtitle="Track issued textbook registries, due date timelines, and library account statements."
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate('/parent/dashboard')}>
            Back to Dashboard
          </Button>
        }
      />

      {overdueCount > 0 && (
        <div className="flex gap-3 items-start p-4 rounded-xl border border-rose-200 bg-rose-500/5 text-xs font-semibold text-rose-800 mb-6 animate-pulse">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          <div>
            <h4 className="font-bold mb-0.5">Library Due Date Alerts</h4>
            <p>You have {overdueCount} book(s) past their due date. Please return them as soon as possible to avoid fines.</p>
          </div>
        </div>
      )}

      {loading ? (
        <SkeletonLoader count={3} className="h-14 mb-4" />
      ) : (
        <SimpleCard title="Library borrow logs list">
          <ReusableTable columns={columns} data={issuedBooks} />
        </SimpleCard>
      )}
    </PageContainer>
  )
}
