import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { parentService } from '@/services/parentService'
import { 
  MessageSquare, 
  Send, 
  User, 
  ArrowLeft, 
  RefreshCw,
  Mail,
  Clock
} from 'lucide-react'
import { Button, Badge, Alert } from '@/components/shared'

export default function CommunicationChats() {
  const navigate = useNavigate()

  const [communications, setCommunications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [newMessage, setNewMessage] = useState('')

  useEffect(() => {
    const fetchCommunications = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await parentService.getCommunications('default')
        setCommunications(data || [])
      } catch (err) {
        setError('Failed to load communication history.')
      } finally {
        setLoading(false)
      }
    }
    fetchCommunications()
  }, [])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    try {
      const added = await parentService.addCommunication('default', {
        type: 'Note',
        title: 'Parent Inquiry',
        message: newMessage
      })
      setCommunications([added, ...communications])
      setNewMessage('')
    } catch (_err) {
      setError('Failed to send message.')
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <RefreshCw className="h-8 w-8 text-primary animate-spin" />
        <p className="text-sm font-medium text-muted-foreground">Loading Messages & Notice Feed...</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 p-4 md:p-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-5 gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate('/parent/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-primary" />
              School-Parent Communication Messages
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">Send inquiries to school administration and view circular notices.</p>
          </div>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Message Compose Form */}
      <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-foreground">Send Message to School Administration</h3>
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            placeholder="Type your message or inquiry here..."
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            className="flex-1 px-4 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button type="submit" className="flex items-center gap-1.5">
            <Send className="h-4 w-4" /> Send
          </Button>
        </form>
      </div>

      {/* Message History */}
      <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-4">
        <h3 className="text-base font-bold text-foreground">Communication Log History</h3>
        
        {communications.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No communication logs recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {communications.map((comm) => (
              <div key={comm.id || comm._id} className="p-4 border border-border rounded-lg bg-muted/20 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-primary">{comm.type || 'Notice'}</span>
                  <span className="text-xs text-muted-foreground">{comm.sentAt ? new Date(comm.sentAt).toLocaleDateString() : 'Today'}</span>
                </div>
                <h4 className="text-sm font-bold text-foreground">{comm.title}</h4>
                <p className="text-xs text-muted-foreground">{comm.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
