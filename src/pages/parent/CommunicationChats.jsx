import React, { useState, useEffect, useRef } from 'react'
import axiosClient from '@/config/axiosClient'
import { 
  PageHeader, 
  PageContainer, 
  SimpleCard, 
  Badge,
  Button
} from '@/components/shared'
import { 
  Mail, Volume2, FileText, Bell, Send, User, Clock, Check, Download, AlertCircle
} from 'lucide-react'

export default function CommunicationChats() {
  const [activeTab, setActiveTab] = useState('messages')

  // Teachers and Chat states
  const [teachers, setTeachers] = useState([])
  const [activeTeacher, setActiveTeacher] = useState(null)
  const [messages, setMessages] = useState([])
  const [typedMessage, setTypedMessage] = useState('')
  const [loadingChat, setLoadingChat] = useState(false)
  const messagesEndRef = useRef(null)

  // Announcements and Notice States
  const [announcements, setAnnouncements] = useState([])
  const [circulars, setCirculars] = useState([])

  // Notifications State
  const [notifications, setNotifications] = useState([])

  // Loading States
  const [loading, setLoading] = useState(true)

  // Scroll chat window to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Fetch Teachers list
  const fetchTeachers = async () => {
    try {
      const res = await axiosClient.get('/portal/chat/teachers')
      if (res.data.success) {
        setTeachers(res.data.data || [])
      }
    } catch (err) {
      console.error('Error fetching teachers list:', err)
    }
  }

  // Fetch Announcements
  const fetchAnnouncements = async () => {
    try {
      const res = await axiosClient.get('/portal/announcements')
      if (res.data.success) {
        setAnnouncements(res.data.data || [])
      }
    } catch (err) {
      console.error('Error fetching announcements:', err)
    }
  }

  // Fetch Circulars
  const fetchCirculars = async () => {
    try {
      const res = await axiosClient.get('/portal/notices')
      if (res.data.success) {
        setCirculars(res.data.data || [])
      }
    } catch (err) {
      console.error('Error fetching circulars:', err)
    }
  }

  // Fetch Notifications
  const fetchNotifications = async () => {
    try {
      const res = await axiosClient.get('/portal/notifications')
      if (res.data.success) {
        setNotifications(res.data.data || [])
      }
    } catch (err) {
      console.error('Error fetching notifications:', err)
    }
  }

  // Fetch history for active teacher chat
  const fetchChatHistory = async (teacherId) => {
    if (!teacherId) return
    try {
      const res = await axiosClient.get(`/portal/chat/messages/${teacherId}`)
      if (res.data.success) {
        setMessages(res.data.data || [])
      }
    } catch (err) {
      console.error('Error fetching chat history:', err)
    }
  }

  // Trigger initial data load
  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true)
      await Promise.all([
        fetchTeachers(),
        fetchAnnouncements(),
        fetchCirculars(),
        fetchNotifications()
      ])
      setLoading(false)
    }
    loadAllData()
  }, [])

  // Auto-scroll on messages change
  useEffect(() => {
    if (activeTab === 'messages') {
      scrollToBottom()
    }
  }, [messages, activeTab])

  // Poll for messages in active chat every 4 seconds
  useEffect(() => {
    if (activeTab !== 'messages' || !activeTeacher) return
    
    fetchChatHistory(activeTeacher._id)
    const interval = setInterval(() => {
      fetchChatHistory(activeTeacher._id)
    }, 4000)

    return () => clearInterval(interval)
  }, [activeTeacher, activeTab])

  // Select a teacher to begin chat
  const handleTeacherSelect = async (teacher) => {
    setActiveTeacher(teacher)
    setLoadingChat(true)
    await fetchChatHistory(teacher._id)
    setLoadingChat(false)
  }

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!typedMessage.trim() || !activeTeacher) return

    const msgText = typedMessage.trim()
    setTypedMessage('')

    try {
      const res = await axiosClient.post('/portal/chat', {
        receiverId: activeTeacher._id,
        message: msgText
      })
      if (res.data.success) {
        // Optimistically add message
        setMessages(prev => [...prev, res.data.data])
      }
    } catch (err) {
      console.error('Error sending message:', err)
    }
  }

  // Mark notification read
  const handleMarkNotificationRead = async (notificationId) => {
    try {
      const res = await axiosClient.patch(`/portal/notifications/${notificationId}/read`)
      if (res.data.success) {
        setNotifications(prev => 
          prev.map(n => n._id === notificationId ? { ...n, status: 'read' } : n)
        )
      }
    } catch (err) {
      console.error('Error marking notification read:', err)
    }
  }

  const tabs = [
    { id: 'messages', label: 'Teacher Messages', icon: Mail },
    { id: 'announcements', label: 'Announcements', icon: Volume2 },
    { id: 'circulars', label: 'Circulars & Notices', icon: FileText },
    { id: 'notifications', label: 'Notifications', icon: Bell }
  ]

  return (
    <PageContainer>
      <PageHeader 
        title="Communication & Message Desk"
        subtitle="Access school broadcast feeds, notices register, direct teacher chat line, and system alert updates."
      />

      {/* Tabs Menu */}
      <div className="flex border-b border-border mb-6 overflow-x-auto select-none gap-2">
        {tabs.map(tab => {
          const TabIcon = tab.icon
          const isActive = activeTab === tab.id
          
          // Calculate notifications unread badge
          const isNotificationTab = tab.id === 'notifications'
          const unreadCount = isNotificationTab ? notifications.filter(n => n.status === 'unread').length : 0

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 transition-colors duration-150 cursor-pointer whitespace-nowrap ${
                isActive 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
              }`}
            >
              <TabIcon className="h-4 w-4" />
              {tab.label}
              {unreadCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-destructive text-destructive-foreground rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="h-10 bg-muted/50 animate-pulse rounded"></div>
          <div className="h-48 bg-muted/30 animate-pulse rounded"></div>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* TAB 1: TEACHER MESSAGES (CHAT) */}
          {activeTab === 'messages' && (
            <div className="grid grid-cols-1 md:grid-cols-3 border border-border rounded-lg bg-card overflow-hidden h-[600px]">
              
              {/* Sidebar: Teacher Directory */}
              <div className="border-r border-border flex flex-col h-full bg-muted/10 md:col-span-1 select-none">
                <div className="p-3 border-b border-border bg-card">
                  <h3 className="font-bold text-sm text-foreground">Teacher Directory</h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Click to chat with class instructors.</p>
                </div>
                <div className="flex-1 overflow-y-auto divide-y divide-border">
                  {teachers.length === 0 ? (
                    <div className="p-6 text-center text-xs text-muted-foreground">No teachers registered in directory.</div>
                  ) : (
                    teachers.map(teacher => {
                      const isSelected = activeTeacher?._id === teacher._id
                      return (
                        <button
                          key={teacher._id}
                          onClick={() => handleTeacherSelect(teacher)}
                          className={`w-full text-left p-4 transition-colors hover:bg-muted/40 cursor-pointer flex items-center gap-3 ${
                            isSelected ? 'bg-primary/5 border-l-4 border-primary' : 'border-l-4 border-transparent'
                          }`}
                        >
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                            {teacher.name?.charAt(0) || 'T'}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-xs text-foreground truncate">{teacher.name}</div>
                            <div className="text-[10px] text-muted-foreground truncate">{teacher.department} | {teacher.designation || 'Instructor'}</div>
                          </div>
                        </button>
                      )
                    })
                  )}
                </div>
              </div>

              {/* Chat Pane */}
              <div className="flex flex-col h-full md:col-span-2 bg-card relative">
                {activeTeacher ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-3 border-b border-border flex items-center justify-between bg-card select-none">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                          {activeTeacher.name?.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-foreground leading-none">{activeTeacher.name}</div>
                          <div className="text-[9px] text-muted-foreground mt-0.5">{activeTeacher.email}</div>
                        </div>
                      </div>
                      <Badge className="bg-emerald-600/10 text-emerald-600 border border-emerald-500/20 text-[9px] uppercase font-bold">Direct Line</Badge>
                    </div>

                    {/* Messages Body */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/5">
                      {loadingChat ? (
                        <div className="flex justify-center items-center h-full text-xs text-muted-foreground animate-pulse">Loading conversation history...</div>
                      ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-xs text-muted-foreground p-6 text-center select-none">
                          <AlertCircle className="h-8 w-8 text-muted-foreground/50 mb-2" />
                          No previous messages found. Type below to initiate chat.
                        </div>
                      ) : (
                        messages.map((m) => {
                          const isSentByParent = m.senderRole === 'parent'
                          return (
                            <div key={m._id} className={`flex ${isSentByParent ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[75%] rounded-lg p-3 text-xs leading-relaxed ${
                                isSentByParent 
                                  ? 'bg-primary text-primary-foreground rounded-tr-none' 
                                  : 'bg-muted/80 text-foreground border border-border rounded-tl-none'
                              }`}>
                                <div className="break-words">{m.message}</div>
                                <div className={`text-[8px] text-right mt-1.5 font-semibold ${
                                  isSentByParent ? 'text-primary-foreground/75' : 'text-muted-foreground'
                                }`}>
                                  {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  {isSentByParent && (
                                    <span className="ml-1 text-[7px] font-bold">
                                      {m.status === 'read' ? '• Read' : '• Sent'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Chat Input Footer */}
                    <form onSubmit={handleSendMessage} className="p-3 border-t border-border bg-card flex gap-2 select-none">
                      <input
                        type="text"
                        placeholder="Type message text here..."
                        value={typedMessage}
                        onChange={(e) => setTypedMessage(e.target.value)}
                        className="flex-1 h-9 rounded border border-input bg-background px-3 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      />
                      <Button type="submit" size="sm" className="flex items-center gap-1">
                        <Send className="h-3 w-3" /> Send
                      </Button>
                    </form>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-sm text-muted-foreground p-8 text-center select-none">
                    <Mail className="h-10 w-10 text-muted-foreground/40 mb-3" />
                    <h4 className="font-bold text-foreground">Select a Chat Instructor</h4>
                    <p className="text-xs text-muted-foreground/80 mt-1 max-w-xs">Select any teacher from the sidebar directory to review logs and send direct messages.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ANNOUNCEMENTS */}
          {activeTab === 'announcements' && (
            <div className="space-y-4">
              {announcements.length === 0 ? (
                <SimpleCard title="School Broadcast Feed">
                  <div className="py-12 text-center text-sm text-muted-foreground">No active school announcements found.</div>
                </SimpleCard>
              ) : (
                announcements.map(item => (
                  <div key={item._id} className="p-5 bg-card border border-border rounded-lg shadow-sm space-y-3 font-medium">
                    <div className="flex justify-between items-start select-none">
                      <div>
                        <h3 className="font-bold text-base text-foreground">{item.title}</h3>
                        <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                          <Clock className="h-3 w-3" /> Published: {new Date(item.publishDate).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge className={
                        item.priority === 'high' ? 'bg-rose-600' : item.priority === 'medium' ? 'bg-amber-600' : 'bg-blue-600'
                      }>
                        {item.priority} Priority
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.content}</p>
                    {item.attachments && item.attachments.length > 0 && (
                      <div className="pt-2 flex flex-wrap gap-2 select-none">
                        {item.attachments.map((file, fIdx) => (
                          <a 
                            key={fIdx} 
                            href={file.url} 
                            target="_blank" 
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-muted rounded text-[10px] font-bold text-primary border border-border hover:bg-muted/70"
                          >
                            <Download className="h-3 w-3" /> {file.name || 'Attachment'}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: CIRCULARS & NOTICES */}
          {activeTab === 'circulars' && (
            <div className="space-y-4">
              {circulars.length === 0 ? (
                <SimpleCard title="Official Notice Boards">
                  <div className="py-12 text-center text-sm text-muted-foreground">No circular logs or notices published.</div>
                </SimpleCard>
              ) : (
                circulars.map(notice => (
                  <div key={notice._id} className="p-5 bg-card border border-border rounded-lg shadow-sm space-y-3 font-medium">
                    <div className="flex justify-between items-start select-none">
                      <div>
                        <h3 className="font-bold text-sm text-foreground">{notice.title}</h3>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          Published: {new Date(notice.publishDate).toLocaleDateString()} | Category: <span className="font-bold text-primary uppercase">{notice.category}</span>
                        </div>
                      </div>
                      <Badge className="bg-primary">{notice.priority || 'medium'}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{notice.content}</p>
                    {notice.attachments && notice.attachments.length > 0 && (
                      <div className="pt-2 flex flex-wrap gap-2 select-none">
                        {notice.attachments.map((file, idx) => (
                          <a 
                            key={idx} 
                            href={file.url} 
                            target="_blank" 
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-muted rounded text-[10px] font-bold text-primary border border-border hover:bg-muted/70"
                          >
                            <Download className="h-3 w-3" /> Download {file.name || 'Notice PDF'}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 4: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <SimpleCard title="System Alerts & Warnings Feed" subtitle="Lists incoming messages and portal status updates.">
              {notifications.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">No recent notifications received.</div>
              ) : (
                <div className="space-y-3">
                  {notifications.map(n => (
                    <div 
                      key={n._id} 
                      className={`p-4 rounded border flex justify-between items-start gap-4 transition-colors ${
                        n.status === 'unread' ? 'bg-primary/5 border-primary/20' : 'bg-card border-border'
                      }`}
                    >
                      <div className="space-y-1 font-medium">
                        <div className="flex items-center gap-2 select-none">
                          {n.status === 'unread' && <span className="h-2 w-2 rounded-full bg-destructive block shrink-0" />}
                          <h4 className="font-bold text-xs text-foreground">{n.title}</h4>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{n.message}</p>
                        <div className="text-[9px] text-muted-foreground flex items-center gap-1 pt-1 select-none">
                          <Clock className="h-3.5 w-3.5" /> {new Date(n.createdAt).toLocaleString()}
                        </div>
                      </div>
                      
                      {n.status === 'unread' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex items-center gap-1 text-[10px] py-1 h-7 select-none shrink-0"
                          onClick={() => handleMarkNotificationRead(n._id)}
                        >
                          <Check className="h-3 w-3" /> Mark Read
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </SimpleCard>
          )}

        </div>
      )}
    </PageContainer>
  )
}

