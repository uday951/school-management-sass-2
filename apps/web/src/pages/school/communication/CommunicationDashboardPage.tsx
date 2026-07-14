import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communicationApi, type Announcement } from '@/api/communication';
import { classesApi } from '@/api/classes';
import { departmentsApi } from '@/api/departments';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmptyState } from '@/components/EmptyState';
import { PageLoader } from '@/components/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  Megaphone, 
  Bell, 
  Plus, 
  Check, 
  Eye, 
  Trash, 
  Send,
  BarChart3,
  Mail,
  User,
  Users,
  ShieldCheck,
  CheckSquare
} from 'lucide-react';

export default function CommunicationDashboardPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isAdmin = user?.userType === 'SCHOOL_ADMIN';

  const [activeTab, setActiveTab] = React.useState<'notices' | 'notifications' | 'admin'>('notices');

  // Load Data
  const { data: notices, isLoading: isNoticesLoading } = useQuery({
    queryKey: ['myNotices'],
    queryFn: communicationApi.listMyNoticeBoard
  });

  const { data: notifications, isLoading: isNotificationsLoading } = useQuery({
    queryKey: ['myNotifications'],
    queryFn: communicationApi.listNotifications
  });

  const { data: adminNotices, isLoading: isAdminNoticesLoading } = useQuery({
    queryKey: ['adminNotices'],
    queryFn: communicationApi.listAdminAnnouncements,
    enabled: isAdmin
  });

  const { data: classes } = useQuery({
    queryKey: ['classes'],
    queryFn: classesApi.listClasses
  });

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentsApi.list
  });

  // Mutators
  const markReadMutation = useMutation({
    mutationFn: communicationApi.markNoticeRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myNotices'] });
    }
  });

  const acknowledgeMutation = useMutation({
    mutationFn: communicationApi.acknowledgeNotice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myNotices'] });
      toast.success('Notice acknowledged');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to acknowledge')
  });

  const readNotificationMutation = useMutation({
    mutationFn: communicationApi.markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myNotifications'] });
    }
  });

  const readAllNotificationsMutation = useMutation({
    mutationFn: communicationApi.markAllRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myNotifications'] });
      toast.success('All notifications marked read');
    }
  });

  const publishAnnouncementMutation = useMutation({
    mutationFn: communicationApi.publishAnnouncement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminNotices'] });
      toast.success('Announcement notice published!');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to publish')
  });

  const archiveAnnouncementMutation = useMutation({
    mutationFn: communicationApi.archiveAnnouncement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminNotices'] });
      toast.success('Announcement notice archived');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to archive')
  });

  // Create Announcement form state
  const [isOpen, setIsOpen] = React.useState(false);
  const [form, setForm] = React.useState({
    title: '',
    body: '',
    announcementType: 'GENERAL',
    priority: 'NORMAL',
    requiresAcknowledgement: false,
    audienceType: 'ALL_SCHOOL',
    targetId: ''
  });

  const createAnnouncementMutation = useMutation({
    mutationFn: (data: typeof form) => communicationApi.createAnnouncement({
      title: data.title,
      body: data.body,
      announcementType: data.announcementType,
      priority: data.priority,
      requiresAcknowledgement: data.requiresAcknowledgement,
      audiences: [
        { audienceType: data.audienceType, targetId: data.targetId || null }
      ]
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminNotices'] });
      toast.success('Announcement draft created successfully');
      setIsOpen(false);
      setForm({ title: '', body: '', announcementType: 'GENERAL', priority: 'NORMAL', requiresAcknowledgement: false, audienceType: 'ALL_SCHOOL', targetId: '' });
    },
    onError: (err: any) => toast.error(err.message || 'Failed to create announcement')
  });

  const [analyticsNotice, setAnalyticsNotice] = React.useState<string | null>(null);
  const { data: noticeAnalytics } = useQuery({
    queryKey: ['noticeAnalytics', analyticsNotice],
    queryFn: () => communicationApi.getAnalytics(analyticsNotice!),
    enabled: !!analyticsNotice
  });

  if (isNoticesLoading || isNotificationsLoading || (isAdmin && isAdminNoticesLoading)) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto text-slate-100 bg-slate-950 min-h-screen">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-800 pb-5 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-200 via-slate-100 to-indigo-100 bg-clip-text text-transparent">
            Communications Board
          </h1>
          <p className="text-sm text-slate-400">View public notice boards, alerts, and in-app system notifications.</p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Button onClick={() => setIsOpen(true)} className="bg-primary hover:bg-primary/95 text-white flex items-center gap-2">
              <Plus className="h-4 w-4" /> Create Announcement
            </Button>
          )}
          <Button variant="outline" className="border-slate-800 hover:bg-slate-900" onClick={() => readAllNotificationsMutation.mutate()}>
            Mark All Notifications Read
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 overflow-x-auto gap-2">
        <Button variant={activeTab === 'notices' ? 'default' : 'ghost'} onClick={() => setActiveTab('notices')} className="rounded-none border-b-2 border-transparent data-[active=true]:border-primary" data-active={activeTab === 'notices'}>
          Notice Board ({notices?.length || 0})
        </Button>
        <Button variant={activeTab === 'notifications' ? 'default' : 'ghost'} onClick={() => setActiveTab('notifications')} className="rounded-none border-b-2 border-transparent data-[active=true]:border-primary" data-active={activeTab === 'notifications'}>
          Notifications Center ({notifications?.filter(n => !n.readAt).length || 0} Unread)
        </Button>
        {isAdmin && (
          <Button variant={activeTab === 'admin' ? 'default' : 'ghost'} onClick={() => setActiveTab('admin')} className="rounded-none border-b-2 border-transparent data-[active=true]:border-primary" data-active={activeTab === 'admin'}>
            Manage Announcements
          </Button>
        )}
      </div>

      {/* Tab content: Notice Board */}
      {activeTab === 'notices' && (
        <div className="space-y-4">
          {notices?.length === 0 ? (
            <EmptyState icon={Megaphone} title="Notice Board Empty" description="There are no active school announcements targeted to you right now." />
          ) : (
            <div className="grid gap-6">
              {notices?.map(notice => (
                <Card key={notice.id} className="border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md flex flex-col justify-between" onMouseEnter={() => !notice.readAt && markReadMutation.mutate(notice.id)}>
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            notice.priority === 'URGENT' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                            notice.priority === 'IMPORTANT' ? 'bg-amber-500/10 text-amber-400' :
                            'bg-slate-800 text-slate-300'
                          }`}>
                            {notice.priority}
                          </span>
                          <span className="text-xs text-slate-400">{notice.announcementType}</span>
                        </div>
                        <h3 className="text-lg font-black text-slate-200 mt-2">{notice.title}</h3>
                      </div>
                      <span className="text-xs text-slate-500">{new Date(notice.publishedAt || notice.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{notice.body}</p>
                  </div>

                  {notice.requiresAcknowledgement && (
                    <div className="mt-6 flex justify-end border-t border-slate-800/60 pt-4">
                      {notice.acknowledgedAt ? (
                        <div className="text-xs text-emerald-400 flex items-center gap-1.5 font-semibold">
                          <Check className="h-4 w-4" /> Acknowledged on {new Date(notice.acknowledgedAt).toLocaleString()}
                        </div>
                      ) : (
                        <Button className="bg-primary hover:bg-primary/95 text-white" size="sm" onClick={() => acknowledgeMutation.mutate(notice.id)}>
                          Acknowledge Receipt
                        </Button>
                      )}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab content: Notifications Center */}
      {activeTab === 'notifications' && (
        <div className="space-y-4 max-w-2xl">
          {notifications?.length === 0 ? (
            <EmptyState icon={Bell} title="Inbox Clean" description="You have no notifications or system alerts right now." />
          ) : (
            <div className="space-y-2">
              {notifications?.map(n => (
                <div key={n.id} className={`rounded-xl border border-slate-800/80 p-4 transition-all duration-300 ${
                  n.readAt ? 'bg-slate-900/10 opacity-75' : 'bg-indigo-500/5 ring-1 ring-indigo-500/20'
                }`} onClick={() => !n.readAt && readNotificationMutation.mutate(n.id)}>
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider">{n.type}</div>
                      <h4 className="font-bold text-slate-200 mt-1">{n.title}</h4>
                      <p className="text-xs text-slate-400 mt-1">{n.message}</p>
                    </div>
                    <div className="text-[10px] text-slate-500 whitespace-nowrap font-mono">{new Date(n.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab content: Admin Manage announcements */}
      {activeTab === 'admin' && isAdmin && (
        <div className="space-y-6">
          <Card className="border-slate-800 bg-slate-900/40">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Manage School Announcements</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-slate-400">Notice Title</TableHead>
                    <TableHead className="text-slate-400">Type / Priority</TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                    <TableHead className="text-slate-400">Created At</TableHead>
                    <TableHead className="text-slate-400 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adminNotices?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-slate-500 italic">No announcements created yet. Click Create Announcement to start.</TableCell>
                    </TableRow>
                  ) : (
                    adminNotices?.map(notice => (
                      <TableRow key={notice.id} className="border-slate-800 hover:bg-slate-900/20">
                        <TableCell className="font-semibold">{notice.title}</TableCell>
                        <TableCell>
                          <div className="text-xs font-semibold text-indigo-400">{notice.announcementType}</div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">{notice.priority}</div>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                            notice.status === 'PUBLISHED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-300'
                          }`}>
                            {notice.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-slate-400 text-xs font-mono">{new Date(notice.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button size="sm" variant="outline" className="border-slate-800 hover:bg-slate-950 text-xs" onClick={() => setAnalyticsNotice(notice.id)}>
                            Analytics
                          </Button>
                          {notice.status === 'DRAFT' && (
                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-xs" onClick={() => publishAnnouncementMutation.mutate(notice.id)}>
                              Publish
                            </Button>
                          )}
                          <Button size="sm" variant="destructive" className="text-xs" onClick={() => archiveAnnouncementMutation.mutate(notice.id)}>
                            Archive
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Analytics Panel */}
          {analyticsNotice && noticeAnalytics && (
            <Card className="border-slate-800 bg-slate-900/40 p-6 space-y-4 max-w-xl">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="font-bold text-slate-200 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-indigo-400" /> Readership Analytics
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setAnalyticsNotice(null)}>Close</Button>
              </div>
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
                <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 text-center">
                  <div className="text-xs text-slate-400">Total Scoped</div>
                  <div className="text-2xl font-black text-slate-100 mt-2">{noticeAnalytics.total}</div>
                </div>
                <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 text-center">
                  <div className="text-xs text-slate-400">Read Count</div>
                  <div className="text-2xl font-black text-emerald-400 mt-2">{noticeAnalytics.read}</div>
                </div>
                <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 text-center">
                  <div className="text-xs text-slate-400">Unread</div>
                  <div className="text-2xl font-black text-rose-400 mt-2">{noticeAnalytics.unread}</div>
                </div>
                <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 text-center">
                  <div className="text-xs text-slate-400">Acknowledged</div>
                  <div className="text-2xl font-black text-indigo-400 mt-2">{noticeAnalytics.acknowledged}</div>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Announcement Dialog Form */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg border-slate-800 bg-slate-900 text-slate-100">
            <CardHeader>
              <CardTitle className="text-lg font-bold">New School Announcement Notice</CardTitle>
              <CardDescription className="text-slate-400">Draft notices and assign targeting scope.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Notice Title *</Label>
                <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Rainy Day Closure Notice" className="bg-slate-950 border-slate-800" />
              </div>
              <div>
                <Label>Message Body *</Label>
                <Input value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} placeholder="Enter detailed text details..." className="bg-slate-950 border-slate-800" />
              </div>
              <div className="grid gap-4 grid-cols-2">
                <div>
                  <Label>Notice Type</Label>
                  <Select value={form.announcementType} onValueChange={val => setForm({ ...form, announcementType: val })}>
                    <SelectTrigger className="bg-slate-950 border-slate-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-950 border-slate-800 text-slate-100">
                      <SelectItem value="GENERAL">General Notice</SelectItem>
                      <SelectItem value="ACADEMIC">Academic</SelectItem>
                      <SelectItem value="EXAM">Exams Schedule</SelectItem>
                      <SelectItem value="HOLIDAY">Holidays</SelectItem>
                      <SelectItem value="EVENT">Events</SelectItem>
                      <SelectItem value="EMERGENCY">Emergency Notice</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Priority Level</Label>
                  <Select value={form.priority} onValueChange={val => setForm({ ...form, priority: val })}>
                    <SelectTrigger className="bg-slate-950 border-slate-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-950 border-slate-800 text-slate-100">
                      <SelectItem value="NORMAL">Normal</SelectItem>
                      <SelectItem value="IMPORTANT">Important</SelectItem>
                      <SelectItem value="URGENT">Urgent Alerts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-3 flex items-center justify-between">
                <Label>Requires Read Acknowledgement?</Label>
                <input type="checkbox" checked={form.requiresAcknowledgement} onChange={e => setForm({ ...form, requiresAcknowledgement: e.target.checked })} className="h-4 w-4 rounded border-slate-800 bg-slate-950 text-primary" />
              </div>

              <div className="border-t border-slate-800 pt-3 space-y-4">
                <h4 className="font-bold text-sm text-slate-200">Target Audience Scope</h4>
                <div className="grid gap-4 grid-cols-2">
                  <div>
                    <Label>Scope Type</Label>
                    <Select value={form.audienceType} onValueChange={val => setForm({ ...form, audienceType: val, targetId: '' })}>
                      <SelectTrigger className="bg-slate-950 border-slate-800">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-950 border-slate-800 text-slate-100">
                        <SelectItem value="ALL_SCHOOL">All School</SelectItem>
                        <SelectItem value="ALL_STUDENTS">All Students</SelectItem>
                        <SelectItem value="ALL_GUARDIANS">All Guardians</SelectItem>
                        <SelectItem value="ALL_EMPLOYEES">All Employees</SelectItem>
                        <SelectItem value="TEACHERS">Teachers Only</SelectItem>
                        <SelectItem value="CLASS">Target Class</SelectItem>
                        <SelectItem value="DEPARTMENT">Target Department</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {form.audienceType === 'CLASS' && (
                    <div>
                      <Label>Target Class *</Label>
                      <Select value={form.targetId} onValueChange={val => setForm({ ...form, targetId: val })}>
                        <SelectTrigger className="bg-slate-950 border-slate-800">
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-950 border-slate-800 text-slate-100">
                          {((classes || []) as any).map((c: any) => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {form.audienceType === 'DEPARTMENT' && (
                    <div>
                      <Label>Target Department *</Label>
                      <Select value={form.targetId} onValueChange={val => setForm({ ...form, targetId: val })}>
                        <SelectTrigger className="bg-slate-950 border-slate-800">
                          <SelectValue placeholder="Select dept" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-950 border-slate-800 text-slate-100">
                          {((departments || []) as any).map((d: any) => (
                            <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 border-t border-slate-800 pt-4">
              <Button variant="outline" className="border-slate-800 hover:bg-slate-950" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button className="bg-primary hover:bg-primary/95 text-white" disabled={!form.title || !form.body || ((form.audienceType === 'CLASS' || form.audienceType === 'DEPARTMENT') && !form.targetId)} onClick={() => createAnnouncementMutation.mutate(form)}>
                Save Draft
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
