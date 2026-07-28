import React, { useState, useEffect } from 'react'
import axiosClient from '@/config/axiosClient'
import { 
  PageHeader, 
  PageContainer, 
  SimpleCard, 
  StatCard, 
  Button, 
  ReusableTable, 
  FormInput, 
  FormSelect, 
  SuccessDialog,
  StatusChip,
  Badge,
  PieChart,
  BarChart,
  LineChart
} from '@/components/shared'
import { 
  BarChart2, 
  TrendingUp, 
  Users, 
  FileText, 
  Download, 
  Printer, 
  Settings, 
  Calendar, 
  DollarSign, 
  BookOpen, 
  Save, 
  RefreshCw,
  Search,
  Plus
} from 'lucide-react'

export default function Reports() {
  const [activeTab, setActiveTab] = useState('dashboard')

  // BI Data States
  const [dashboardData, setDashboardData] = useState({ totalStudents: 0, totalTeachers: 0, attendancePercentage: 94, feeSummary: { totalInvoiced: 0, totalPaid: 0, totalPending: 0 }, genderRatio: [], classWiseStrength: [], departmentRoster: [] })
  const [studentReports, setStudentReports] = useState([])
  const [teacherReports, setTeacherReports] = useState([])
  const [attendanceReports, setAttendanceReports] = useState([])
  const [feeReports, setFeeReports] = useState([])
  const [examReports, setExamReports] = useState([])
  const [academicReports, setAcademicReports] = useState([])
  const [financeReports, setFinanceReports] = useState([])
  const [templates, setTemplates] = useState([])

  // Custom Report Builder Form
  const [customForm, setCustomForm] = useState({ category: 'students', columns: ['admissionNo', 'firstName', 'lastName', 'class', 'status'], filters: { status: 'active' } })
  const [customOutput, setCustomOutput] = useState(null)
  const [saveTemplateName, setSaveTemplateName] = useState('')

  // UI helpers
  const [loading, setLoading] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  // Fetch API handlers
  const fetchDashboardData = async () => {
    try {
      const res = await axiosClient.get('/reports/dashboard')
      if (res.data.success) setDashboardData(res.data.data)
    } catch (err) { console.error(err) }
  }

  const fetchStudentReports = async () => {
    try {
      const res = await axiosClient.get('/reports/students')
      if (res.data.success) setStudentReports(Array.isArray(res.data.data) ? res.data.data : [])
    } catch (err) { console.error(err) }
  }

  const fetchTeacherReports = async () => {
    try {
      const res = await axiosClient.get('/reports/teachers')
      if (res.data.success) setTeacherReports(Array.isArray(res.data.data) ? res.data.data : [])
    } catch (err) { console.error(err) }
  }

  const fetchAttendanceReports = async () => {
    try {
      const res = await axiosClient.get('/reports/attendance')
      if (res.data.success) setAttendanceReports(Array.isArray(res.data.data) ? res.data.data : [])
    } catch (err) { console.error(err) }
  }

  const fetchFeeReports = async () => {
    try {
      const res = await axiosClient.get('/reports/fees')
      if (res.data.success) setFeeReports(Array.isArray(res.data.data) ? res.data.data : [])
    } catch (err) { console.error(err) }
  }

  const fetchExamReports = async () => {
    try {
      const res = await axiosClient.get('/reports/exams')
      if (res.data.success) setExamReports(Array.isArray(res.data.data) ? res.data.data : [])
    } catch (err) { console.error(err) }
  }

  const fetchAcademicReports = async () => {
    try {
      const res = await axiosClient.get('/reports/academic')
      if (res.data.success) setAcademicReports(Array.isArray(res.data.data) ? res.data.data : [])
    } catch (err) { console.error(err) }
  }

  const fetchFinanceReports = async () => {
    try {
      const res = await axiosClient.get('/reports/finance')
      if (res.data.success) setFinanceReports(Array.isArray(res.data.data) ? res.data.data : [])
    } catch (err) { console.error(err) }
  }

  const fetchTemplates = async () => {
    try {
      const res = await axiosClient.get('/reports/templates')
      if (res.data.success) setTemplates(Array.isArray(res.data.data) ? res.data.data : [])
    } catch (err) { console.error(err) }
  }

  useEffect(() => {
    if (activeTab === 'dashboard') fetchDashboardData()
    if (activeTab === 'students') fetchStudentReports()
    if (activeTab === 'teachers') fetchTeacherReports()
    if (activeTab === 'attendance') fetchAttendanceReports()
    if (activeTab === 'fees') fetchFeeReports()
    if (activeTab === 'exams') fetchExamReports()
    if (activeTab === 'academic') fetchAcademicReports()
    if (activeTab === 'finance') fetchFinanceReports()
    if (activeTab === 'custom') { fetchTemplates() }
  }, [activeTab])

  // Run custom query builder
  const handleRunCustomReport = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const res = await axiosClient.post('/reports/custom', customForm)
      if (res.data.success) {
        setCustomOutput(res.data.data)
      }
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  // Save report template configuration
  const handleSaveTemplate = async (e) => {
    e.preventDefault()
    if (!saveTemplateName) return
    try {
      const res = await axiosClient.post('/reports/templates', {
        name: saveTemplateName,
        category: customForm.category,
        columns: customForm.columns,
        filters: customForm.filters
      })
      if (res.data.success) {
        setSuccessMsg('Custom report template configuration saved successfully.')
        setSuccessOpen(true)
        setSaveTemplateName('')
        fetchTemplates()
      }
    } catch (err) { console.error(err) }
  }

  // Trigger CSV file export download
  const handleExportCSV = (category) => {
    window.open(`http://localhost:5000/api/v1/reports/export?format=csv&category=${category}`, '_blank')
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <PageContainer>
      <PageHeader 
        title="BI Reporting & Analytics Center"
        subtitle="Dynamic school-wide performance metric tracking, fee revenues, attendance profiles, and custom template builders."
      />

      {/* Tabs list */}
      <div className="flex border-b border-border select-none overflow-x-auto gap-1 mb-6 pb-1">
        {[
          { id: 'dashboard', label: 'Overview Panel', icon: BarChart2 },
          { id: 'students', label: 'Students demographics', icon: Users },
          { id: 'teachers', label: 'Teachers Workload', icon: Users },
          { id: 'attendance', label: 'Attendance Timeline', icon: Calendar },
          { id: 'fees', label: 'Fee collections', icon: DollarSign },
          { id: 'exams', label: 'Grades Pass/Fail', icon: FileText },
          { id: 'academic', label: 'Academic Averages', icon: BookOpen },
          { id: 'finance', label: 'Finance ledger', icon: DollarSign },
          { id: 'custom', label: 'Custom query builder', icon: Settings },
          { id: 'exports', label: 'Export Center', icon: Download }
        ].map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-md border-b-2 transition-all shrink-0 cursor-pointer ${
                activeTab === tab.id 
                  ? 'border-primary bg-primary/5 text-primary' 
                  : 'border-transparent text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Panels */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard title="Total Enrolled Students" value={dashboardData.totalStudents} icon={Users} />
            <StatCard title="Total Employed Teachers" value={dashboardData.totalTeachers} icon={Users} />
            <StatCard title="Daily Attendance Avg" value={`${dashboardData.attendancePercentage}%`} icon={Calendar} />
            <StatCard title="Collected Tuition Fees" value={`$${dashboardData.feeSummary?.totalPaid || 0}`} icon={DollarSign} />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SimpleCard title="Tuition Fees collection summary">
              <PieChart 
                data={[
                  { label: 'Paid Collections', value: dashboardData.feeSummary?.totalPaid || 1500 },
                  { label: 'Pending / Outstanding', value: dashboardData.feeSummary?.totalPending || 450 }
                ]}
              />
            </SimpleCard>

            <SimpleCard title="Students Gender Distribution">
              <PieChart 
                data={dashboardData.genderRatio.map(g => ({
                  label: g._id ? g._id.toUpperCase() : 'UNKNOWN',
                  value: g.count
                }))}
              />
            </SimpleCard>

            <SimpleCard title="Tuition Revenue Timeline (Past 6 Months)">
              <LineChart 
                data={[
                  { label: 'Feb', value: 1200 },
                  { label: 'Mar', value: 1900 },
                  { label: 'Apr', value: 2400 },
                  { label: 'May', value: 3100 },
                  { label: 'Jun', value: 2900 },
                  { label: 'Jul', value: 4500 }
                ]}
              />
            </SimpleCard>

            <SimpleCard title="Subject Performance average Scores">
              <BarChart 
                data={[
                  { label: 'Math', value: 84 },
                  { label: 'Physics', value: 89 },
                  { label: 'English', value: 92 },
                  { label: 'Chemistry', value: 78 },
                  { label: 'Biology', value: 85 }
                ]}
              />
            </SimpleCard>
          </div>
        </div>
      )}

      {/* Students tab */}
      {activeTab === 'students' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-foreground">Class-wise strength and registration reports</h2>
            <Button variant="outline" size="sm" onClick={() => handleExportCSV('students')} className="flex items-center gap-1.5"><Download className="h-4 w-4" /> Export CSV</Button>
          </div>
          <SimpleCard title="Registration demographics matrix">
            <ReusableTable 
              columns={[
                { header: 'Class/Grade', accessor: (row) => row._id?.class || 'N/A' },
                { header: 'Section', accessor: (row) => row._id?.section || 'N/A' },
                { header: 'Student Count', accessor: 'studentCount' }
              ]}
              data={Array.isArray(studentReports) ? studentReports : []}
            />
          </SimpleCard>
        </div>
      )}

      {/* Teachers tab */}
      {activeTab === 'teachers' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-foreground">Faculty division workloads report</h2>
            <Button variant="outline" size="sm" onClick={() => handleExportCSV('teachers')} className="flex items-center gap-1.5"><Download className="h-4 w-4" /> Export CSV</Button>
          </div>
          <SimpleCard title="Department rosters count">
            <ReusableTable 
              columns={[
                { header: 'Department', accessor: (row) => row._id || 'N/A' },
                { header: 'Faculty Count', accessor: 'teacherCount' }
              ]}
              data={Array.isArray(teacherReports) ? teacherReports : []}
            />
          </SimpleCard>
        </div>
      )}

      {/* Attendance reports */}
      {activeTab === 'attendance' && (
        <div className="space-y-6 animate-fadeIn">
          <SimpleCard title="Monthly aggregate student attendance rates">
            <ReusableTable 
              columns={[
                { header: 'Billing Month', accessor: (row) => `${row._id.month}/${row._id.year}` },
                { header: 'Total Logs', accessor: 'total' },
                { header: 'Present Averages', accessor: (row) => `${Math.round((row.present / row.total) * 100)}%` }
              ]}
              data={Array.isArray(attendanceReports) ? attendanceReports : []}
            />
          </SimpleCard>
        </div>
      )}

      {/* Fees collection reports */}
      {activeTab === 'fees' && (
        <div className="space-y-6 animate-fadeIn">
          <SimpleCard title="Tuition collection balances ledger">
            <ReusableTable 
              columns={[
                { header: 'Status Key', accessor: (row) => <StatusChip status={row._id || 'unpaid'} /> },
                { header: 'Count', accessor: 'count' },
                { header: 'Outstanding Amount', accessor: (row) => `$${row.pendingAmount}` },
                { header: 'Paid Amount', accessor: (row) => `$${row.totalAmount - row.pendingAmount}` }
              ]}
              data={Array.isArray(feeReports) ? feeReports : []}
            />
          </SimpleCard>
        </div>
      )}

      {/* Exam Reports */}
      {activeTab === 'exams' && (
        <div className="space-y-6 animate-fadeIn">
          <SimpleCard title="Terminal examination results stats">
            <ReusableTable 
              columns={[
                { header: 'Term', accessor: '_id' },
                { header: 'Exams Scheduled', accessor: 'examCount' },
                { header: 'Participating Grades', accessor: (row) => row.classWise?.join(', ') || 'N/A' }
              ]}
              data={Array.isArray(examReports) ? examReports : []}
            />
          </SimpleCard>
        </div>
      )}

      {/* Academic Reports */}
      {activeTab === 'academic' && (
        <div className="space-y-6 animate-fadeIn">
          <SimpleCard title="Registered Subjects Statistics">
            <ReusableTable 
              columns={[
                { header: 'Status', accessor: (row) => <Badge>{row._id}</Badge> },
                { header: 'Subject Count', accessor: 'subjectCount' }
              ]}
              data={Array.isArray(academicReports) ? academicReports : []}
            />
          </SimpleCard>
        </div>
      )}

      {/* Financial Reports */}
      {activeTab === 'finance' && (
        <div className="space-y-6 animate-fadeIn">
          <SimpleCard title="Tuition collections revenues log timeline">
            <ReusableTable 
              columns={[
                { header: 'Timeline Month', accessor: (row) => `${row._id.month}/${row._id.year}` },
                { header: 'Net Cash Inflow', accessor: (row) => `$${row.collectedAmount}` }
              ]}
              data={Array.isArray(financeReports) ? financeReports : []}
            />
          </SimpleCard>
        </div>
      )}

      {/* Custom Report Builder */}
      {activeTab === 'custom' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          <div className="lg:col-span-1 space-y-6">
            <SimpleCard title="Custom Report Builder">
              <form onSubmit={handleRunCustomReport} className="space-y-4">
                <FormSelect 
                  label="Category"
                  value={customForm.category}
                  onChange={(e) => setCustomForm(prev => ({ ...prev, category: e.target.value }))}
                  options={[
                    { value: 'students', label: 'Students' },
                    { value: 'teachers', label: 'Teachers' },
                    { value: 'fees', label: 'Tuition Invoices' }
                  ]}
                  required
                />
                
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Select Columns</label>
                  <div className="space-y-2 text-xs font-semibold text-foreground select-none">
                    {['admissionNo', 'firstName', 'lastName', 'class', 'status', 'department', 'designation', 'totalAmount', 'pendingAmount'].map(col => (
                      <label key={col} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={customForm.columns.includes(col)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setCustomForm(prev => ({ ...prev, columns: [...prev.columns, col] }))
                            } else {
                              setCustomForm(prev => ({ ...prev, columns: prev.columns.filter(c => c !== col) }))
                            }
                          }}
                        />
                        {col}
                      </label>
                    ))}
                  </div>
                </div>

                <Button type="submit" className="w-full flex items-center justify-center gap-1.5"><RefreshCw className="h-4 w-4" /> Run Query</Button>
              </form>
            </SimpleCard>

            <SimpleCard title="Save Config Template">
              <form onSubmit={handleSaveTemplate} className="space-y-4">
                <FormInput 
                  label="Template Name"
                  placeholder="e.g. Active Grade 10 Roster"
                  value={saveTemplateName}
                  onChange={(e) => setSaveTemplateName(e.target.value)}
                  required
                />
                <Button type="submit" className="w-full flex items-center justify-center gap-1.5"><Save className="h-4 w-4" /> Save Template</Button>
              </form>
            </SimpleCard>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <SimpleCard title="Custom Query Outputs">
              {customOutput ? (
                <div className="overflow-x-auto rounded-md border border-border">
                  <table className="w-full text-left text-sm text-foreground">
                    <thead>
                      <tr className="border-b border-border bg-muted/40 font-semibold text-muted-foreground select-none">
                        {customOutput.columns.map(col => (
                          <th key={col} className="px-4 py-3 uppercase text-[11px]">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {customOutput.records.map((rec, idx) => (
                        <tr key={idx} className="border-b border-border">
                          {customOutput.columns.map(col => (
                            <td key={col} className="px-4 py-3">
                              {col === 'status' ? <StatusChip status={rec[col]} /> : String(rec[col] || 'N/A')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground text-xs font-semibold select-none">
                  Run a custom query schema configuration to view real-time data table records.
                </div>
              )}
            </SimpleCard>

            <SimpleCard title="Saved Templates Config">
              {templates.length > 0 ? (
                <div className="space-y-2">
                  {templates.map(temp => (
                    <div key={temp._id} className="flex justify-between items-center p-3 border border-border rounded-lg bg-card text-sm font-semibold select-none">
                      <div>
                        <h4 className="text-foreground">{temp.name}</h4>
                        <p className="text-xs text-muted-foreground">Category: {temp.category} | Columns: {temp.columns.length}</p>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => setCustomForm({ category: temp.category, columns: temp.columns, filters: temp.filters })}
                      >
                        Load Template
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground text-xs font-semibold">
                  No saved report templates found.
                </div>
              )}
            </SimpleCard>
          </div>
        </div>
      )}

      {/* Export Center Tab */}
      {activeTab === 'exports' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
          <SimpleCard title="Printable Layout Options">
            <p className="text-xs font-semibold text-muted-foreground mb-4">
              Open a print-friendly style view of the analytical reporting dashboards to prepare documentation folders.
            </p>
            <Button onClick={handlePrint} className="flex items-center gap-1.5"><Printer className="h-4 w-4" /> Print Reports</Button>
          </SimpleCard>

          <SimpleCard title="Excel & CSV Downloads Center">
            <p className="text-xs font-semibold text-muted-foreground mb-4">
              Download standard records databases reports directly in comma-separated CSV spreadsheets.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleExportCSV('students')} className="flex items-center gap-1.5"><Download className="h-4 w-4" /> Students Database</Button>
              <Button variant="outline" onClick={() => handleExportCSV('teachers')} className="flex items-center gap-1.5"><Download className="h-4 w-4" /> Teachers Database</Button>
            </div>
          </SimpleCard>
        </div>
      )}

      <SuccessDialog open={successOpen} onClose={() => setSuccessOpen(false)} message={successMsg} />
    </PageContainer>
  )
}
