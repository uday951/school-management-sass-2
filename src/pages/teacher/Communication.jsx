import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Send, ArrowLeft, MessageSquare, User, Clock, Loader2 } from 'lucide-react'
import { Button, Alert } from '@/components/shared'
import axiosClient from '@/config/axiosClient'

export default function Communication() {
  const navigate = useNavigate()

  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)

  const [receiverId, setReceiverId] = useState('')
  const [receiverModel, setReceiverModel] = useState('Parent')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sentMsg, setSentMsg] = useState('')
  const [error, setError] = useState('')

  const fetchMessages = async () => {
    setLoading(true)
    try {
      const res = await axiosClient.get('/teacher/messages')
      if (res.data?.success) {
        setConversations(Array.isArray(res.data.data) ? res.data.data : [])
      } else {
        setConversations([])
      }
    } catch (_) {
      setConversations([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchMessages() }, [])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!message || !receiverId) {
      setError('Recipient ID and message are required.')
      return
    }
    setSending(true)
    setError('')
    try {
      await axiosClient.post('/teacher/chat', { receiverId, receiverModel, message })
      setSentMsg('Message sent successfully.')
      setMessage('')
      setReceiverId('')
      setTimeout(() => setSentMsg(''), 3000)
      fetchMessages() // Refresh conversations
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 p-4 md:p-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-5 gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate('/teacher/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Mail className="h-6 w-6 text-cyan-600" />
              Teacher-Parent Communication Portal
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">Send direct updates and academic notices to parents and staff.</p>
          </div>
        </div>
      </div>

      {sentMsg && <Alert variant="success">{sentMsg}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compose Message Box */}
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-4">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" /> Compose Message
          </h3>
          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">Recipient ID</label>
              <input
                type="text"
                placeholder="Enter parent or staff user ID..."
                value={receiverId}
                onChange={e => setReceiverId(e.target.value)}
                className="w-full mt-1.5 px-3 py-2 text-sm border border-border rounded-lg bg-background"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">Enter the MongoDB ID of the recipient parent or user.</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">Recipient Type</label>
              <select
                value={receiverModel}
                onChange={e => setReceiverModel(e.target.value)}
                className="w-full mt-1.5 px-3 py-2 text-sm border border-border rounded-lg bg-background"
              >
                <option value="Parent">Parent</option>
                <option value="User">Staff / Admin</option>
                <option value="Student">Student</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">Message</label>
              <textarea
                rows={4}
                placeholder="Type your message here..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="w-full mt-1.5 px-3 py-2 text-sm border border-border rounded-lg bg-background resize-none"
                required
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={sending} className="flex items-center gap-1.5">
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {sending ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
          </form>
        </div>

        {/* Conversations List */}
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-4">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" /> Message History
            {conversations.length > 0 && (
              <span className="ml-auto text-xs font-normal text-muted-foreground">{conversations.length} conversations</span>
            )}
          </h3>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="py-12 text-center">
              <MessageSquare className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No conversations yet. Send a message to get started.</p>
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-80">
              {conversations.map((conv, i) => (
                <div key={conv.partnerId || i} className="p-3.5 border border-border rounded-lg bg-muted/20 hover:border-primary/50 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm font-semibold text-foreground">{conv.partnerName || 'Unknown'}</span>
                      <span className="text-xs text-muted-foreground">({conv.partnerModel})</span>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="h-5 w-5 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold">{conv.unreadCount}</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">{conv.lastMessage}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">
                      {conv.lastTimestamp ? new Date(conv.lastTimestamp).toLocaleString() : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
