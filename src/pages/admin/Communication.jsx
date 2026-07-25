import React, { useState, useEffect } from 'react'
import axiosClient from '@/config/axiosClient'
import { 
  PageHeader, 
  PageContainer, 
  SimpleCard, 
  StatCard, 
  Button, 
  FormInput, 
  FormSelect, 
  Badge, 
  StatusChip,
  ReusableTable
} from '@/components/shared'
import { 
  MessageSquare, 
  Mail, 
  Bell, 
  Calendar, 
  Plus, 
  CheckCircle, 
  Send, 
  FileText, 
  Search, 
  Sparkles, 
  Volume2, 
  Clipboard,
  History,
  Trash2,
  Play
} from 'lucide-react'

export default function Communication({ defaultTab = 'dashboard' }) {
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  // ─── STATE HOARDS ──────────────────────────────────────────────────────────
  const [dashboardStats, setDashboardStats] = useState({
    totalNotifications: 0,
    scheduledMessages: 0,
    deliveredMessages: 0,
    failedMessages: 0,
    smsCount: 0,
    emailCount: 0,
    pushNotificationCount: 0,
    recentActivities: []
  })

  const [announcements, setAnnouncements] = useState([])
  const [notices, setNotices] = useState([])
  const [events, setEvents] = useState([])
  const [templates, setTemplates] = useState([])
  const [historyLogs, setHistoryLogs] = useState([])
  const [pushNotifications, setPushNotifications] = useState([])

  // Modal / Form States
  const [showAnnounceModal, setShowAnnounceModal] = useState(false)
  const [showNoticeModal, setShowNoticeModal] = useState(false)
  const [showEventModal, setShowEventModal] = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [showSMSCampaignModal, setShowSMSCampaignModal] = useState(false)
  const [showEmailCampaignModal, setShowEmailCampaignModal] = useState(false)

  // Form Fields
  const [announceForm, setAnnounceForm] = useState({ title: '', content: '', targetAudience: 'all', priority: 'medium' })
  const [noticeForm, setNoticeForm] = useState({ title: '', content: '', category: 'general', visibility: 'internal', priority: 'medium' })
  const [eventForm, setEventForm] = useState({ name: '', description: '', venue: '', date: '', time: '', organizer: 'School Admin' })
  const [templateForm, setTemplateForm] = useState({ name: '', type: 'email', subject: '', content: '' })
  const [smsCampaignForm, setSmsCampaignForm] = useState({ targetAudience: 'teacher', message: '' })
  const [emailCampaignForm, setEmailCampaignForm] = useState({ targetAudience: 'teacher', subject: '', content: '' })

  // ─── DATA FETCHING ─────────────────────────────────────────────────────────
  const fetchDashboardStats = async () => {
    try {
      const res = await axiosClient.get('/communication/dashboard-stats')
      if (res.data.success) setDashboardStats(res.data.data)
    } catch (err) { console.error(err) }
  }

  const fetchAnnouncements = async () => {
    try {
      const res = await axiosClient.get('/communication/announcements')
      if (res.data.success) setAnnouncements(res.data.data)
    } catch (err) { console.error(err) }
  }

  const fetchNotices = async () => {
    try {
      const res = await axiosClient.get('/communication/notices')
      if (res.data.success) setNotices(res.data.data)
    } catch (err) { console.error(err) }
  }

  const fetchEvents = async () => {
    try {
      const res = await axiosClient.get('/communication/events')
      if (res.data.success) setEvents(res.data.data)
    } catch (err) { console.error(err) }
  }

  const fetchTemplates = async () => {
    try {
      const res = await axiosClient.get('/communication/templates')
      if (res.data.success) setTemplates(res.data.data)
    } catch (err) { console.error(err) }
  }

  const fetchHistoryLogs = async () => {
    try {
      const res = await axiosClient.get('/communication/history')
      if (res.data.success) setHistoryLogs(res.data.data)
    } catch (err) { console.error(err) }
  }

  const fetchPushNotifications = async () => {
    try {
      const res = await axiosClient.get('/communication/notifications')
      if (res.data.success) setPushNotifications(res.data.data)
    } catch (err) { console.error(err) }
  }

  const triggerToast = (msg) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  useEffect(() => {
    if (activeTab === 'dashboard') fetchDashboardStats()
    if (activeTab === 'announcements') fetchAnnouncements()
    if (activeTab === 'notices') fetchNotices()
    if (activeTab === 'events') fetchEvents()
    if (activeTab === 'templates') fetchTemplates()
    if (activeTab === 'history') fetchHistoryLogs()
    if (activeTab === 'push') fetchPushNotifications()
  }, [activeTab])

  // ─── ACTION HANDLERS ───────────────────────────────────────────────────────
  const handleCreateAnnouncement = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const res = await axiosClient.post('/communication/announcements', announceForm)
      if (res.data.success) {
        triggerToast('Announcement created and published successfully!')
        setShowAnnounceModal(false)
        fetchAnnouncements()
      }
    } catch (err) {
      console.error(err)
    } finally { setLoading(false) }
  }

  const handleCreateNotice = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const res = await axiosClient.post('/communication/notices', noticeForm)
      if (res.data.success) {
        triggerToast('Notice Board entry created successfully!')
        setShowNoticeModal(false)
        fetchNotices()
      }
    } catch (err) {
      console.error(err)
    } finally { setLoading(false) }
  }

  const handleCreateEvent = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const res = await axiosClient.post('/communication/events', eventForm)
      if (res.data.success) {
        triggerToast('Event created and broadcast notifications dispatched!')
        setShowEventModal(false)
        fetchEvents()
      }
    } catch (err) {
      console.error(err)
    } finally { setLoading(false) }
  }

  const handleCreateTemplate = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const res = await axiosClient.post('/communication/templates', templateForm)
      if (res.data.success) {
        triggerToast('Communication Template saved successfully!')
        setShowTemplateModal(false)
        fetchTemplates()
      }
    } catch (err) {
      console.error(err)
    } finally { setLoading(false) }
  }

  const handleSMSCampaign = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const res = await axiosClient.post('/communication/campaign/sms', smsCampaignForm)
      if (res.data.success) {
        triggerToast(`Bulk SMS dispatched to ${res.data.data.success} recipients successfully!`)
        setShowSMSCampaignModal(false)
        fetchDashboardStats()
      }
    } catch (err) {
      console.error(err)
    } finally { setLoading(false) }
  }

  const handleEmailCampaign = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const res = await axiosClient.post('/communication/campaign/email', emailCampaignForm)
      if (res.data.success) {
        triggerToast(`Bulk Email Campaign dispatched to ${res.data.data.success} recipients!`)
        setShowEmailCampaignModal(false)
        fetchDashboardStats()
      }
    } catch (err) {
      console.error(err)
    } finally { setLoading(false) }
  }

  const handleDeleteAnnouncement = async (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        await axiosClient.delete(`/communication/announcements/${id}`)
        triggerToast('Announcement archived.')
        fetchAnnouncements()
      } catch (err) { console.error(err) }
    }
  }

  const handleDeleteNotice = async (id) => {
    if (window.confirm('Are you sure you want to delete this notice board entry?')) {
      try {
        await axiosClient.delete(`/communication/notices/${id}`)
        triggerToast('Notice deleted.')
        fetchNotices()
      } catch (err) { console.error(err) }
    }
  }

  const handleDeleteEvent = async (id) => {
    if (window.confirm('Are you sure you want to cancel this event?')) {
      try {
        await axiosClient.delete(`/communication/events/${id}`)
        triggerToast('Event cancelled.')
        fetchEvents()
      } catch (err) { console.error(err) }
    }
  }

  const handleDeleteTemplate = async (id) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await axiosClient.delete(`/communication/templates/${id}`)
        triggerToast('Template deleted.')
        fetchTemplates()
      } catch (err) { console.error(err) }
    }
  }

  return (
    <PageContainer>
      <PageHeader 
        title="Communication & Campaign Center"
        subtitle="Manage broadcast announcements, configure rich email templates, dispatch bulk SMS alerts, organize school events, and track delivery status."
        actions={
          <div className="flex gap-2 select-none">
            <Button variant="outline" onClick={() => setShowSMSCampaignModal(true)} className="flex items-center gap-1.5"><MessageSquare className="h-4 w-4" /> Send Bulk SMS</Button>
            <Button onClick={() => setShowEmailCampaignModal(true)} className="flex items-center gap-1.5"><Mail className="h-4 w-4" /> Compose Email Campaign</Button>
          </div>
        }
      />

      {successMsg && (
        <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 p-4 rounded-lg text-sm font-semibold flex items-center gap-2 mb-6 animate-fadeIn">
          <CheckCircle className="h-4 w-4" /> {successMsg}
        </div>
      )}

      {/* Tabs Header */}
      <div className="flex border-b border-border select-none overflow-x-auto gap-1 mb-6 pb-1">
        {[
          { id: 'dashboard', label: 'Dashboard Stats', icon: Sparkles },
          { id: 'announcements', label: 'Announcements', icon: Volume2 },
          { id: 'notices', label: 'Notice Board', icon: Clipboard },
          { id: 'events', label: 'Event Planner', icon: Calendar },
          { id: 'push', label: 'Push Notifications', icon: Bell },
          { id: 'templates', label: 'Templates', icon: FileText },
          { id: 'history', label: 'Campaign History', icon: History }
        ].map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-t-lg transition-colors border-b-2 ${
                activeTab === tab.id 
                  ? 'border-primary text-primary bg-primary/5' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* ─── TAB PANELS ───────────────────────────────────────────────────────── */}

      {/* 1. Dashboard Overview */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6 animate-fadeIn select-none">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard title="Total Dispatch Logs" value={`${dashboardStats.totalNotifications}`} icon={Bell} />
            <StatCard title="Total SMS Logs" value={`${dashboardStats.smsCount}`} icon={MessageSquare} />
            <StatCard title="Total Emails Dispatched" value={`${dashboardStats.emailCount}`} icon={Mail} />
            <StatCard title="Push Alerts Sent" value={`${dashboardStats.pushNotificationCount}`} icon={Sparkles} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SimpleCard title="Campaign History Feed">
                <div className="space-y-4">
                  {dashboardStats.recentActivities && dashboardStats.recentActivities.map(act => (
                    <div key={act._id} className="flex justify-between items-center p-3 border border-border rounded-lg bg-card text-xs font-semibold">
                      <div className="space-y-1">
                        <h4 className="text-foreground">{act.subject}</h4>
                        <p className="text-muted-foreground text-[10px] uppercase font-bold">Channel: {act.type} | Sent By: {act.sender}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={act.failedCount > 0 ? 'warning' : 'success'}>
                          Delivered: {act.successCount} / {act.recipientCount}
                        </Badge>
                        <span className="block text-[10px] text-muted-foreground pt-1">{new Date(act.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                  {(!dashboardStats.recentActivities || dashboardStats.recentActivities.length === 0) && (
                    <div className="text-center py-12 text-xs text-muted-foreground font-semibold">No recent campaigns. Compose bulk messages to trigger history logs.</div>
                  )}
                </div>
              </SimpleCard>
            </div>

            <div className="lg:col-span-1 space-y-4">
              <SimpleCard title="Communication Channels Matrix">
                <div className="space-y-3 text-xs font-semibold text-foreground">
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Immediate Dispatch Delivery Rate</span>
                    <span className="text-emerald-500 font-bold">100%</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Failed Broadcasts count</span>
                    <span className="text-rose-500 font-bold">{dashboardStats.failedMessages}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground">Successful Bulk Delivery Logs</span>
                    <span className="text-primary font-bold">{dashboardStats.deliveredMessages}</span>
                  </div>
                </div>
              </SimpleCard>
            </div>
          </div>
        </div>
      )}

      {/* 2. Announcements */}
      {activeTab === 'announcements' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex justify-between items-center select-none">
            <h2 className="text-base font-bold text-foreground">Broadcast Announcements</h2>
            <Button size="sm" onClick={() => setShowAnnounceModal(true)} className="flex items-center gap-1.5"><Plus className="h-4 w-4" /> Create Broadcast</Button>
          </div>
          <ReusableTable 
            columns={[
              { header: 'Title Header', accessor: 'title' },
              { header: 'Content Body', accessor: 'content' },
              { header: 'Target Audience', accessor: (row) => <Badge>{row.targetAudience.toUpperCase()}</Badge> },
              { header: 'Publish Date', accessor: (row) => new Date(row.publishDate).toLocaleDateString() },
              { header: 'Priority', accessor: (row) => <Badge variant={row.priority === 'high' ? 'danger' : 'outline'}>{row.priority.toUpperCase()}</Badge> },
              { header: 'Status', accessor: (row) => <StatusChip status={row.status || 'published'} /> },
              { header: 'Actions', accessor: (row) => (
                <Button variant="danger" size="sm" onClick={() => handleDeleteAnnouncement(row._id)}><Trash2 className="h-3.5 w-3.5" /></Button>
              )}
            ]}
            data={Array.isArray(announcements) ? announcements : []}
          />
        </div>
      )}

      {/* 3. Notice Board */}
      {activeTab === 'notices' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex justify-between items-center select-none">
            <h2 className="text-base font-bold text-foreground">Notice Board Board Register</h2>
            <Button size="sm" onClick={() => setShowNoticeModal(true)} className="flex items-center gap-1.5"><Plus className="h-4 w-4" /> Add Notice</Button>
          </div>
          <ReusableTable 
            columns={[
              { header: 'Title Header', accessor: 'title' },
              { header: 'Content Detail', accessor: 'content' },
              { header: 'Notice Category', accessor: 'category' },
              { header: 'Visibility', accessor: (row) => <Badge>{row.visibility.toUpperCase()}</Badge> },
              { header: 'Publish Date', accessor: (row) => new Date(row.publishDate).toLocaleDateString() },
              { header: 'Actions', accessor: (row) => (
                <Button variant="danger" size="sm" onClick={() => handleDeleteNotice(row._id)}><Trash2 className="h-3.5 w-3.5" /></Button>
              )}
            ]}
            data={Array.isArray(notices) ? notices : []}
          />
        </div>
      )}

      {/* 4. Event Planner */}
      {activeTab === 'events' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex justify-between items-center select-none">
            <h2 className="text-base font-bold text-foreground">Academic & Social Events Calendar</h2>
            <Button size="sm" onClick={() => setShowEventModal(true)} className="flex items-center gap-1.5"><Plus className="h-4 w-4" /> Add Event</Button>
          </div>
          <ReusableTable 
            columns={[
              { header: 'Event Name', accessor: 'name' },
              { header: 'Description', accessor: 'description' },
              { header: 'Venue Location', accessor: 'venue' },
              { header: 'Date', accessor: (row) => new Date(row.date).toLocaleDateString() },
              { header: 'Timing Schedule', accessor: 'time' },
              { header: 'Organizer', accessor: 'organizer' },
              { header: 'Actions', accessor: (row) => (
                <Button variant="danger" size="sm" onClick={() => handleDeleteEvent(row._id)}><Trash2 className="h-3.5 w-3.5" /></Button>
              )}
            ]}
            data={Array.isArray(events) ? events : []}
          />
        </div>
      )}

      {/* 5. Push Notifications */}
      {activeTab === 'push' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex justify-between items-center select-none">
            <h2 className="text-base font-bold text-foreground">Push Notifications Register</h2>
            <Button size="sm" variant="outline" onClick={() => fetchPushNotifications()} className="flex items-center gap-1.5"><Sparkles className="h-4 w-4" /> Refresh Logs</Button>
          </div>
          <ReusableTable 
            columns={[
              { header: 'Title Header', accessor: 'title' },
              { header: 'Message Details', accessor: 'message' },
              { header: 'Target Role', accessor: (row) => <Badge>{row.recipientRole.toUpperCase()}</Badge> },
              { header: 'Read status', accessor: (row) => <StatusChip status={row.status || 'unread'} /> },
              { header: 'Timestamp', accessor: (row) => new Date(row.createdAt).toLocaleString() }
            ]}
            data={Array.isArray(pushNotifications) ? pushNotifications : []}
          />
        </div>
      )}

      {/* 6. Templates */}
      {activeTab === 'templates' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex justify-between items-center select-none">
            <h2 className="text-base font-bold text-foreground">Message Templates configurations</h2>
            <Button size="sm" onClick={() => setShowTemplateModal(true)} className="flex items-center gap-1.5"><Plus className="h-4 w-4" /> Add Template</Button>
          </div>
          <ReusableTable 
            columns={[
              { header: 'Template Name', accessor: 'name' },
              { header: 'Channel Type', accessor: (row) => <Badge variant="outline">{row.type.toUpperCase()}</Badge> },
              { header: 'Subject Line', accessor: (row) => row.subject || 'N/A' },
              { header: 'Message content Schema', accessor: 'content' },
              { header: 'Actions', accessor: (row) => (
                <Button variant="danger" size="sm" onClick={() => handleDeleteTemplate(row._id)}><Trash2 className="h-3.5 w-3.5" /></Button>
              )}
            ]}
            data={Array.isArray(templates) ? templates : []}
          />
        </div>
      )}

      {/* 7. Campaign History */}
      {activeTab === 'history' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex justify-between items-center select-none">
            <h2 className="text-base font-bold text-foreground">Campaign Log Ledger</h2>
            <Button size="sm" variant="outline" onClick={() => fetchHistoryLogs()} className="flex items-center gap-1.5"><History className="h-4 w-4" /> Refresh ledger</Button>
          </div>
          <ReusableTable 
            columns={[
              { header: 'Timestamp', accessor: (row) => new Date(row.date).toLocaleString() },
              { header: 'Channel', accessor: (row) => <Badge>{row.type.toUpperCase()}</Badge> },
              { header: 'Subject Header', accessor: 'subject' },
              { header: 'Message Content Body', accessor: 'content' },
              { header: 'Audience size', accessor: 'recipientCount' },
              { header: 'Delivery Rate', accessor: (row) => `${Math.round((row.successCount / row.recipientCount) * 100)}%` }
            ]}
            data={Array.isArray(historyLogs) ? historyLogs : []}
          />
        </div>
      )}

      {/* ─── MODAL DIALOGS / POPUPS ───────────────────────────────────────────── */}

      {/* Create Broadcast Announcement Modal */}
      {showAnnounceModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn select-none">
          <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-foreground mb-4">Create Broadcast Announcement</h3>
            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <FormInput 
                label="Announcement Title" 
                placeholder="e.g. Science Fair Postponed"
                value={announceForm.title} 
                onChange={(e) => setAnnounceForm(prev => ({ ...prev, title: e.target.value }))}
                required
              />
              <FormInput 
                label="Content details" 
                placeholder="Write clear notification alert message content..."
                value={announceForm.content} 
                onChange={(e) => setAnnounceForm(prev => ({ ...prev, content: e.target.value }))}
                required
              />
              <FormSelect 
                label="Target Audience"
                value={announceForm.targetAudience}
                onChange={(e) => setAnnounceForm(prev => ({ ...prev, targetAudience: e.target.value }))}
                options={[
                  { value: 'all', label: 'All Users' },
                  { value: 'student', label: 'Students' },
                  { value: 'teacher', label: 'Faculty / Teachers' },
                  { value: 'parent', label: 'Parents' }
                ]}
              />
              <FormSelect 
                label="Priority Level"
                value={announceForm.priority}
                onChange={(e) => setAnnounceForm(prev => ({ ...prev, priority: e.target.value }))}
                options={[
                  { value: 'low', label: 'Low priority' },
                  { value: 'medium', label: 'Medium priority' },
                  { value: 'high', label: 'High priority' }
                ]}
              />
              <div className="flex gap-2 justify-end pt-2">
                <Button type="button" variant="outline" onClick={() => setShowAnnounceModal(false)}>Cancel</Button>
                <Button type="submit" disabled={loading}>{loading ? 'Broadcasting...' : 'Publish broadcast'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Notice Board Entry Modal */}
      {showNoticeModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn select-none">
          <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-foreground mb-4">Add Notice Board Entry</h3>
            <form onSubmit={handleCreateNotice} className="space-y-4">
              <FormInput 
                label="Notice Title" 
                placeholder="e.g. Annual Sports Registration Details"
                value={noticeForm.title} 
                onChange={(e) => setNoticeForm(prev => ({ ...prev, title: e.target.value }))}
                required
              />
              <FormInput 
                label="Notice Content Description" 
                placeholder="Write formal notice board content details..."
                value={noticeForm.content} 
                onChange={(e) => setNoticeForm(prev => ({ ...prev, content: e.target.value }))}
                required
              />
              <FormInput 
                label="Category classification" 
                placeholder="e.g. Sports, Exams, Holidays"
                value={noticeForm.category} 
                onChange={(e) => setNoticeForm(prev => ({ ...prev, category: e.target.value }))}
                required
              />
              <FormSelect 
                label="Visibility Scope"
                value={noticeForm.visibility}
                onChange={(e) => setNoticeForm(prev => ({ ...prev, visibility: e.target.value }))}
                options={[
                  { value: 'internal', label: 'Internal Staff & Students' },
                  { value: 'public', label: 'Public domain' }
                ]}
              />
              <div className="flex gap-2 justify-end pt-2">
                <Button type="button" variant="outline" onClick={() => setShowNoticeModal(false)}>Cancel</Button>
                <Button type="submit" disabled={loading}>{loading ? 'Creating Notice...' : 'Publish Notice'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn select-none">
          <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-foreground mb-4">Add New Calendar Event</h3>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <FormInput 
                label="Event Name" 
                placeholder="e.g. Annual Science Fair Finals"
                value={eventForm.name} 
                onChange={(e) => setEventForm(prev => ({ ...prev, name: e.target.value }))}
                required
              />
              <FormInput 
                label="Description" 
                placeholder="e.g. Science exhibits and award distribution..."
                value={eventForm.description} 
                onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
              />
              <FormInput 
                label="Event Venue Location" 
                placeholder="e.g. Main Playground Auditorium"
                value={eventForm.venue} 
                onChange={(e) => setEventForm(prev => ({ ...prev, venue: e.target.value }))}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <FormInput 
                  label="Date" 
                  type="date"
                  value={eventForm.date} 
                  onChange={(e) => setEventForm(prev => ({ ...prev, date: e.target.value }))}
                  required
                />
                <FormInput 
                  label="Timing Schedule" 
                  placeholder="e.g. 09:30 AM"
                  value={eventForm.time} 
                  onChange={(e) => setEventForm(prev => ({ ...prev, time: e.target.value }))}
                  required
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button type="button" variant="outline" onClick={() => setShowEventModal(false)}>Cancel</Button>
                <Button type="submit" disabled={loading}>{loading ? 'Creating Event...' : 'Schedule Event'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn select-none">
          <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-foreground mb-4">Add Message Template</h3>
            <form onSubmit={handleCreateTemplate} className="space-y-4">
              <FormInput 
                label="Template Name" 
                placeholder="e.g. Admission Success Mail"
                value={templateForm.name} 
                onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                required
              />
              <FormSelect 
                label="Channel Type"
                value={templateForm.type}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, type: e.target.value }))}
                options={[
                  { value: 'email', label: 'Email content template' },
                  { value: 'sms', label: 'SMS text template' },
                  { value: 'notification', label: 'Push alert template' }
                ]}
              />
              <FormInput 
                label="Subject Line (Email only)" 
                placeholder="e.g. Admission confirmation details"
                value={templateForm.subject} 
                onChange={(e) => setTemplateForm(prev => ({ ...prev, subject: e.target.value }))}
              />
              <FormInput 
                label="Template content layout text" 
                placeholder="e.g. Welcome {{name}}! Your admission is confirmed..."
                value={templateForm.content} 
                onChange={(e) => setTemplateForm(prev => ({ ...prev, content: e.target.value }))}
                required
              />
              <div className="flex gap-2 justify-end pt-2">
                <Button type="button" variant="outline" onClick={() => setShowTemplateModal(false)}>Cancel</Button>
                <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Template Schema'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Send Bulk SMS Campaign Modal */}
      {showSMSCampaignModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn select-none">
          <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-foreground mb-4"><MessageSquare className="h-5 w-5 text-primary inline mr-2" /> Dispatch Bulk SMS Campaign</h3>
            <form onSubmit={handleSMSCampaign} className="space-y-4">
              <FormSelect 
                label="Target Audience Group"
                value={smsCampaignForm.targetAudience}
                onChange={(e) => setSmsCampaignForm(prev => ({ ...prev, targetAudience: e.target.value }))}
                options={[
                  { value: 'teacher', label: 'All Faculty Teachers' },
                  { value: 'student', label: 'All Students' }
                ]}
              />
              <FormInput 
                label="SMS Message content" 
                placeholder="Enter SMS alert message text..."
                value={smsCampaignForm.message} 
                onChange={(e) => setSmsCampaignForm(prev => ({ ...prev, message: e.target.value }))}
                required
              />
              <div className="flex gap-2 justify-end pt-2">
                <Button type="button" variant="outline" onClick={() => setShowSMSCampaignModal(false)}>Cancel</Button>
                <Button type="submit" disabled={loading} className="flex items-center gap-1"><Send className="h-4 w-4" /> Run Campaign</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Send Bulk Email Campaign Modal */}
      {showEmailCampaignModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn select-none">
          <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-foreground mb-4"><Mail className="h-5 w-5 text-primary inline mr-2" /> Dispatch Bulk Email Campaign</h3>
            <form onSubmit={handleEmailCampaign} className="space-y-4">
              <FormSelect 
                label="Target Audience Group"
                value={emailCampaignForm.targetAudience}
                onChange={(e) => setEmailCampaignForm(prev => ({ ...prev, targetAudience: e.target.value }))}
                options={[
                  { value: 'teacher', label: 'All Faculty Teachers' },
                  { value: 'student', label: 'All Students' }
                ]}
              />
              <FormInput 
                label="Email Subject Header" 
                placeholder="e.g. Mid-term Assessment Examination instructions"
                value={emailCampaignForm.subject} 
                onChange={(e) => setEmailCampaignForm(prev => ({ ...prev, subject: e.target.value }))}
                required
              />
              <FormInput 
                label="Email Message HTML Content" 
                placeholder="Write rich HTML email content..."
                value={emailCampaignForm.content} 
                onChange={(e) => setEmailCampaignForm(prev => ({ ...prev, content: e.target.value }))}
                required
              />
              <div className="flex gap-2 justify-end pt-2">
                <Button type="button" variant="outline" onClick={() => setShowEmailCampaignModal(false)}>Cancel</Button>
                <Button type="submit" disabled={loading} className="flex items-center gap-1"><Play className="h-4 w-4" /> Dispatch Emails</Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </PageContainer>
  )
}
