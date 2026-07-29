import React, { useState, useEffect } from 'react'
import axiosClient from '@/config/axiosClient'
import {
  PageContainer,
  PageHeader,
  SimpleCard,
  Badge,
  SkeletonLoader
} from '@/components/shared'
import {
  MessageSquare,
  Send,
  User,
  Search,
  CheckCircle,
  Paperclip,
  BookOpen
} from 'lucide-react'

export default function Communication() {
  const [conversations, setConversations] = useState([])
  const [activeConv, setActiveConv] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [chatType, setChatType] = useState('parent') // 'parent' or 'student'

  const fetchConversations = async () => {
    setLoading(true)
    try {
      const res = await axiosClient.get('/teacher/messages')
      if (res.data.success && Array.isArray(res.data.data)) {
        setConversations(res.data.data)
        if (res.data.data.length > 0 && !activeConv) {
          setActiveConv(res.data.data[0])
        }
      }
    } catch (err) {
      console.error('Error fetching teacher communication messages:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConversations()
  }, [])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeConv) return
    setSending(true)
    try {
      const payload = {
        receiverId: activeConv.partnerId,
        receiverModel: activeConv.partnerModel,
        message: newMessage,
        studentContextId: activeConv.studentContextId || null
      }
      const res = await axiosClient.post('/teacher/chat', payload)
      if (res.data.success) {
        setNewMessage('')
        // Refresh local conversation list
        const updatedRes = await axiosClient.get('/teacher/messages')
        if (updatedRes.data.success) {
          setConversations(updatedRes.data.data)
          const matched = updatedRes.data.data.find(c => c.partnerId === activeConv.partnerId)
          if (matched) setActiveConv(matched)
        }
      }
    } catch (err) {
      console.error('Error sending teacher chat message:', err)
    } finally {
      setSending(false)
    }
  }

  // Filter conversations based on search term & tab
  const filteredConversations = conversations.filter(c => {
    const nameMatch = c.partnerName.toLowerCase().includes(searchTerm.toLowerCase())
    const roleMatch = chatType === 'parent' ? c.partnerModel === 'Parent' : c.partnerModel === 'Student'
    return nameMatch && roleMatch
  })

  return (
    <PageContainer>
      <PageHeader
        title="Communication Hub"
        subtitle="Manage secure direct messaging channels with parents and student rosters."
        actions={
          <div className="flex gap-1.5 border border-border/80 rounded-xl p-1 bg-muted/30">
            <button
              onClick={() => { setChatType('parent'); setActiveConv(null); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${chatType === 'parent' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground'}`}
            >
              Parent Chats
            </button>
            <button
              onClick={() => { setChatType('student'); setActiveConv(null); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${chatType === 'student' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground'}`}
            >
              Student Messages
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-220px)] min-h-[500px]">
        {/* Left Side: Conversations List */}
        <div className="md:col-span-1 border border-border/80 rounded-2xl bg-card flex flex-col overflow-hidden h-full shadow-sm">
          {/* Search bar */}
          <div className="p-4 border-b border-border/60">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground" />
              </span>
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-border/40">
            {loading ? (
              <div className="p-4"><SkeletonLoader count={4} className="h-12 mb-3" /></div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-6 text-center text-xs font-semibold text-muted-foreground">
                No active conversations found.
              </div>
            ) : (
              filteredConversations.map((c) => {
                const isActive = activeConv?.partnerId === c.partnerId
                return (
                  <div
                    key={c.partnerId}
                    onClick={() => setActiveConv(c)}
                    className={`p-3.5 flex gap-3 cursor-pointer transition hover:bg-muted/30 select-none ${isActive ? 'bg-primary/5 border-l-4 border-primary' : ''}`}
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0 border border-primary/20">
                      {c.partnerName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-0.5">
                        <h4 className="text-xs font-bold text-foreground truncate">{c.partnerName}</h4>
                        <span className="text-[9px] text-muted-foreground">
                          {new Date(c.lastTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate leading-normal">{c.lastMessage}</p>
                    </div>
                    {c.unreadCount > 0 && (
                      <span className="h-4 w-4 rounded-full bg-primary text-primary-foreground text-[8px] font-bold flex items-center justify-center">
                        {c.unreadCount}
                      </span>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Right Side: Chat Window */}
        <div className="md:col-span-2 border border-border/80 rounded-2xl bg-card flex flex-col overflow-hidden h-full shadow-sm">
          {activeConv ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-border/60 bg-muted/10 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm border border-primary/20">
                    {activeConv.partnerName[0]}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-foreground">{activeConv.partnerName}</h3>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5 capitalize">
                      <User className="h-3 w-3" /> {activeConv.partnerModel} Direct Channel
                    </p>
                  </div>
                </div>
                {activeConv.partnerDetails?.email && (
                  <Badge className="bg-primary/5 text-primary text-[10px] lowercase font-semibold">{activeConv.partnerDetails.email}</Badge>
                )}
              </div>

              {/* Message History */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-muted/5">
                {[...(activeConv.messages || [])].reverse().map((msg) => {
                  const isMe = msg.senderModel === 'Teacher'
                  return (
                    <div
                      key={msg._id}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] p-3 rounded-2xl text-xs font-semibold leading-relaxed border ${isMe ? 'bg-primary text-primary-foreground border-primary/20 rounded-tr-none' : 'bg-card border-border/60 rounded-tl-none text-foreground'}`}>
                        <p className="whitespace-pre-line">{msg.message}</p>
                        <div className={`text-[9px] mt-1.5 text-right flex items-center justify-end gap-1 ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                          <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {isMe && <CheckCircle className="h-3 w-3 text-primary-foreground/90" />}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-border/60 shrink-0 flex gap-2 items-center bg-background">
                <input
                  type="text"
                  placeholder="Type your message here..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  required
                  className="flex-1 px-4 py-2 border border-border rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="p-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/95 transition disabled:opacity-50 cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground select-none">
              <MessageSquare className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-xs font-semibold">Select a conversation to begin chatting.</p>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  )
}
