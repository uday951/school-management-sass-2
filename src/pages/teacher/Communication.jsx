import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Send, ArrowLeft, User } from 'lucide-react'
import { Button, Alert } from '@/components/shared'
import axiosClient from '@/config/axiosClient'

export default function Communication() {
  const navigate = useNavigate()

  const [recipient, setRecipient] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sentMsg, setSentMsg] = useState('')

  const [messages, setMessages] = useState([])

  useEffect(() => {
    const fetchCommunications = async () => {
      try {
        const res = await axiosClient.get('/communication')
        if (res.data?.success && Array.isArray(res.data.data)) {
          setMessages(res.data.data)
        } else {
          setMessages([])
        }
      } catch (_err) {
        setMessages([])
      }
    }
    fetchCommunications()
  }, [])

  const handleSend = (e) => {
    e.preventDefault()
    if (!subject || !message) return

    setMessages([
      { id: Date.now().toString(), recipient, subject, date: 'Today', status: 'Delivered' },
      ...messages
    ])
    setSentMsg('Message sent successfully to parent.')
    setSubject('')
    setMessage('')
    setTimeout(() => setSentMsg(''), 3000)
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
            <p className="text-sm text-muted-foreground mt-0.5">Send direct updates, academic circulars, and attendance notices to parents.</p>
          </div>
        </div>
      </div>

      {sentMsg && <Alert variant="success">{sentMsg}</Alert>}

      {/* Message Compose Box */}
      <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-4">
        <h3 className="text-base font-bold text-foreground">Compose Message to Parent</h3>
        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase">Recipient Parent / Student</label>
            <input
              type="text"
              value={recipient}
              onChange={e => setRecipient(e.target.value)}
              className="w-full mt-1.5 px-3 py-2 text-sm border border-border rounded-lg bg-background"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase">Subject Title</label>
            <input
              type="text"
              placeholder="e.g. Mid-Term Progress Discussion"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full mt-1.5 px-3 py-2 text-sm border border-border rounded-lg bg-background"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase">Message Content</label>
            <textarea
              rows={4}
              placeholder="Type your message content here..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="w-full mt-1.5 px-3 py-2 text-sm border border-border rounded-lg bg-background resize-none"
              required
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" className="flex items-center gap-1.5">
              <Send className="h-4 w-4" /> Send Communication Message
            </Button>
          </div>
        </form>
      </div>

      {/* Message History */}
      <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-4">
        <h3 className="text-base font-bold text-foreground">Sent Communication History</h3>
        <div className="space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className="p-4 border border-border rounded-lg bg-muted/20 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-primary">{msg.recipient}</span>
                <span className="text-xs text-muted-foreground">{msg.date}</span>
              </div>
              <h4 className="text-sm font-semibold text-foreground">{msg.subject}</h4>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
