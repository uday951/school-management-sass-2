import React, { useState, useEffect } from 'react'
import axiosClient from '@/config/axiosClient'
import {
  PageContainer,
  PageHeader,
  SimpleCard,
  Badge,
  SkeletonLoader
} from '@/components/shared'
import { MessageSquare, User, Send, Search, Phone, Mail, GraduationCap } from 'lucide-react'

export default function Communication() {
  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState([])
  const [selectedConv, setSelectedConv] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)

  const fetchConversations = async () => {
    setLoading(true)
    try {
      const res = await axiosClient.get('/teacher/conversations')
      if (res.data.success && Array.isArray(res.data.data)) {
        setConversations(res.data.data)
      }
    } catch (err) {
      console.error('Error fetching chat conversations:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (conv) => {
    setMessagesLoading(true)
    try {
      const res = await axiosClient.get(`/teacher/messages?recipientId=${conv.id}`)
      if (res.data.success) {
        setMessages(res.data.data)
        setSelectedConv(conv)
      }
    } catch (err) {
      console.error('Error fetching message history:', err)
    } finally {
      setMessagesLoading(false)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConv) return

    try {
      const res = await axiosClient.post('/teacher/chat', {
        recipientId: selectedConv.id,
        message: newMessage,
        studentContextId: selectedConv.student?.id
      })
      if (res.data.success) {
        setMessages(prev => [...prev, res.data.data])
        setNewMessage('')
      }
    } catch (err) {
      console.error('Error sending message:', err)
    }
  }

  useEffect(() => {
    fetchConversations()
  }, [])

  // Filter conversation list based on parent name or student name
  const filteredConversations = conversations.filter(c => {
    const term = searchTerm.toLowerCase()
    const parentName = (c.name || '').toLowerCase()
    const studentName = (c.student?.name || '').toLowerCase()
    return parentName.includes(term) || studentName.includes(term)
  })


  return (
    <PageContainer>
      <PageHeader
        title="Parent Communication Chat"
        subtitle="Secure one-to-one messaging channel with student classroom context."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px] border border-border bg-card rounded-2xl overflow-hidden shadow-sm">
        {/* Left Side: Parent Contacts List */}
        <div className="md:col-span-1 border-r border-border flex flex-col h-full bg-muted/10">
          <div className="p-4 border-b border-border bg-card">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground" />
              </span>
              <input
                type="text"
                placeholder="Search parents or students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-border/60">
            {loading ? (
              <SkeletonLoader count={4} className="h-16 m-3" />
            ) : filteredConversations.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center p-6">No parent contacts found.</p>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => fetchMessages(conv)}
                  className={`w-full p-4 text-left flex items-start gap-3 hover:bg-muted/40 transition duration-150 cursor-pointer ${selectedConv?.id === conv.id ? 'bg-primary/5 border-l-4 border-primary' : ''}`}
                >
                  <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0 text-primary font-bold">
                    {conv.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h4 className="text-xs font-bold text-foreground truncate">{conv.name}</h4>
                      <Badge className="bg-primary/10 text-primary text-[9px] font-bold">{conv.relationship}</Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate mt-1 flex items-center gap-1">
                      <GraduationCap className="h-3.5 w-3.5" /> Child: {conv.student?.name} ({conv.student?.class})
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Message Window */}
        <div className="md:col-span-2 flex flex-col h-full bg-card">
          {selectedConv ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-border flex justify-between items-center bg-card">
                <div>
                  <h3 className="text-xs font-bold text-foreground">{selectedConv.name}</h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Child: {selectedConv.student?.name} ({selectedConv.student?.class})</p>
                </div>
                <div className="flex gap-4 text-xs font-semibold text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {selectedConv.phone}</span>
                </div>
              </div>

              {/* Message history bubble list */}
              <div className="flex-1 overflow-y-auto p-4 bg-muted/5 space-y-4">
                {messagesLoading ? (
                  <SkeletonLoader count={3} className="h-10" />
                ) : messages.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center p-6">No message history. Send a message to start conversing.</p>
                ) : (
                  messages.map((m) => {
                    const isMe = m.senderRole === 'teacher'
                    return (
                      <div key={m._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs p-3 rounded-2xl text-xs font-semibold ${isMe ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-muted border border-border text-foreground rounded-tl-none'}`}>
                          <p className="leading-normal">{m.message}</p>
                          <span className="block text-[8px] opacity-70 mt-1.5 text-right">
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-border bg-card flex gap-3">
                <input
                  type="text"
                  placeholder="Type a message to parent..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 px-4 py-2 border border-border bg-background rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="submit"
                  className="p-2 bg-primary hover:bg-primary/95 text-primary-foreground rounded-xl flex items-center justify-center cursor-pointer transition shrink-0"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-3" />
              <h4 className="text-sm font-bold text-foreground">No Chat Selected</h4>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">Select a parent contact from the list on the left to start conversing.</p>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  )
}
