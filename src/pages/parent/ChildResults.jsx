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
import { Printer, Download, Award, TrendingUp, BookOpen, FileText } from 'lucide-react'
import { LineChart } from '@/components/shared/Charts'

export default function ChildResults() {
  const { id: paramId } = useParams()
  const { activeChild } = useChildStore()
  const id = paramId || activeChild?._id || activeChild?.id
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('results')
  const [resultsList, setResultsList] = useState([])
  const [reportCards, setReportCards] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    if (!id) { setLoading(false); return }
    setLoading(true)
    try {
      const [res1, res2] = await Promise.all([
        axiosClient.get(`/portal/child/${id}/results`),
        axiosClient.get(`/portal/child/${id}/report-card`)
      ])
      if (res1.data.success) {
        setResultsList(res1.data.data)
      }
      if (res2.data.success) {
        setReportCards(res2.data.data)
      }
    } catch (err) {
      console.error('Error fetching child results:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [id])

  // Process results list for a trend chart
  const getChartData = () => {
    // Group marks by exam name
    const grouped = {}
    resultsList.forEach(r => {
      const name = r.examName
      if (!grouped[name]) {
        grouped[name] = { name, totalObtained: 0, totalMax: 0 }
      }
      grouped[name].totalObtained += r.marksObtained
      grouped[name].totalMax += r.maxMarks
    })

    return Object.values(grouped).map(g => ({
      name: g.name,
      percentage: g.totalMax > 0 ? Math.round((g.totalObtained / g.totalMax) * 100) : 0
    }))
  }

  const chartData = getChartData()

  const columns = [
    { header: 'Exam', accessor: 'examName' },
    { header: 'Subject', accessor: 'subject' },
    {
      header: 'Marks',
      accessor: (row) => `${row.marksObtained} / ${row.maxMarks}`
    },
    {
      header: 'Percentage',
      accessor: (row) => `${row.percentage}%`
    },
    {
      header: 'Grade',
      accessor: (row) => (
        <Badge className="bg-primary/10 text-primary font-bold">
          {row.grade}
        </Badge>
      )
    },
    {
      header: 'Remarks',
      accessor: 'remarks'
    },
    {
      header: 'Status',
      accessor: (row) => {
        const statusStr = row.status || row.resultStatus || ''
        const isPass = statusStr.toLowerCase() === 'passed' || statusStr.toLowerCase() === 'pass'
        return (
          <Badge className={isPass ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}>
            {isPass ? 'Pass' : 'Fail'}
          </Badge>
        )
      }
    }
  ]

  const printReportCard = (card) => {
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html>
        <head><title>Report Card</title>
          <style>body{font-family:sans-serif;padding:32px} table{width:100%;border-collapse:collapse} th,td{border:1px solid #ddd;padding:8px;text-align:left} h2{color:#333}</style>
        </head>
        <body>
          <h2>Report Card</h2>
          <p><strong>Student:</strong> ${card.studentName || ''}</p>
          <p><strong>Exam:</strong> ${card.examName || ''}</p>
          <p><strong>Grade:</strong> ${card.finalGrade || card.grade || 'N/A'}</p>
          <p><strong>Attendance:</strong> ${card.attendancePercentage || 'N/A'}%</p>
          <p><strong>Status:</strong> ${card.resultStatus || card.status || 'N/A'}</p>
          <p><strong>Teacher Remarks:</strong> ${card.teacherRemarks || 'N/A'}</p>
          <br/><script>window.print()</script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  return (
    <PageContainer>
      <PageHeader
        title="Exam Results & Report Cards"
        subtitle="View graded subject mark sheets, performance analytics, and terminal transcripts."
        actions={
          <div className="flex gap-2">
            <Button
              variant={activeTab === 'results' ? 'primary' : 'outline'}
              className="flex items-center gap-1.5"
              onClick={() => setActiveTab('results')}
            >
              <TrendingUp className="h-4 w-4" /> Exam Results
            </Button>
            <Button
              variant={activeTab === 'report-card' ? 'primary' : 'outline'}
              className="flex items-center gap-1.5"
              onClick={() => setActiveTab('report-card')}
            >
              <Award className="h-4 w-4" /> Report Cards
            </Button>
          </div>
        }
      />

      {loading ? (
        <SkeletonLoader count={4} className="h-16 mb-4" />
      ) : activeTab === 'results' ? (
        <div className="space-y-6">
          {/* Performance Trend chart */}
          {chartData.length > 0 && (
            <SimpleCard title="Exam-over-Exam Progress Chart">
              <LineChart data={chartData.map(d => ({ label: d.name, value: d.percentage }))} />
            </SimpleCard>
          )}

          {/* Graded mark sheets */}
          <SimpleCard title="Term Graded Subject Mark Sheets">
            <ReusableTable columns={columns} data={resultsList} />
          </SimpleCard>
        </div>
      ) : (
        /* Report Cards Tab */
        <div className="space-y-6">
          {reportCards.length === 0 ? (
            <div className="p-6 bg-card border border-border rounded-2xl text-center">
              <p className="text-muted-foreground text-sm font-semibold">No report cards generated yet for this student.</p>
            </div>
          ) : (
            reportCards.map((card) => (
              <SimpleCard
                key={card._id}
                title={`${card.examId?.name || 'Report Card'} (${card.academicYear || '2026-2027'})`}
                actions={
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex items-center gap-1.5" onClick={() => printReportCard(card)}>
                      <Printer className="h-3.5 w-3.5" /> Print
                    </Button>
                    <a
                      href={card.pdfUrl || '#'}
                      download
                      className="inline-flex items-center justify-center rounded-md text-xs font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 gap-1.5 text-primary"
                    >
                      <Download className="h-3.5 w-3.5" /> Download PDF
                    </a>
                  </div>
                }
              >
                <div className="space-y-4 text-xs font-semibold leading-relaxed">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 border border-border/80 rounded-xl bg-muted/20">
                    <div>
                      <p className="text-muted-foreground uppercase text-[9px] mb-0.5">GPA / Score</p>
                      <p className="text-foreground text-sm font-bold">{card.gpa || card.percentage || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground uppercase text-[9px] mb-0.5">Final Grade</p>
                      <p className="text-foreground text-sm font-bold">{card.finalGrade || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground uppercase text-[9px] mb-0.5">Attendance Rate</p>
                      <p className="text-foreground text-sm font-bold">{card.attendancePercentage || 'N/A'}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground uppercase text-[9px] mb-0.5">Result Status</p>
                      <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-xs">
                        {card.resultStatus || 'N/A'}
                      </Badge>
                    </div>
                  </div>

                  {card.teacherRemarks && (
                    <div className="p-3 border border-border/80 rounded-xl bg-card">
                      <p className="text-muted-foreground uppercase text-[9px] mb-1 font-bold">Class Teacher Comments</p>
                      <p className="text-foreground font-medium italic">"{card.teacherRemarks}"</p>
                    </div>
                  )}
                </div>
              </SimpleCard>
            ))
          )}
        </div>
      )}
    </PageContainer>
  )
}
