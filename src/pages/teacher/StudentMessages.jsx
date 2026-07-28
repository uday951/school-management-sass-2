import React, { useState, useEffect } from 'react'
import axiosClient from '@/config/axiosClient'
import {
  PageContainer,
  PageHeader,
  SimpleCard,
  Badge,
  SkeletonLoader
} from '@/components/shared'
import { Send, User, Search, GraduationCap } from 'lucide-react'

export default function StudentMessages() {
  const [students, setStudents] = useState([])
  const [messages, setMessages] = useState([])
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)

  const fetchStudents = async () => {
    setLoading(true)
    try {
      // Find students assigned to this teacher's classes via conversations/profile
      const res = await axiosClient.get('/teacher/conversations')
      if (res.data.success && Array.isArray(res.data.data)) {
        // Collect students from mapping list
        const list = res.data.data.map(c => c.student).filter(Boolean)
        // De-duplicate list
        const unique = Array.from(new Map(list.map(s => [s.id, s])).values())
        setStudents(unique)
      }
    } catch (err) {
      console.error('Error fetching student list:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (student) => {
    setMessagesLoading(true)
    try {
      const res = await axiosClient.get(`/teacher/messages?recipientId=${student.id}`)
      if (res.data.success) {
        setMessages(res.data.data)
        setSelectedStudent(student)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setMessagesLoading(false)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedStudent) return

    try {
      const res = await axiosClient.post('/teacher/chat', {
        recipientId: selectedStudent.id,
        message: newMessage
      })
      if (res.data.success) {
        setMessages(prev => [...prev, res.data.data])
        setNewMessage('')
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.class.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <PageContainer>
      <PageHeader
        title="Student Alerts & Messages"
        subtitle="Broadcast task notes or message students directly."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px] border border-border bg-card rounded-2xl overflow-hidden shadow-sm">
        {/* Left contacts list */}
        <div className="md:col-span-1 border-r border-border flex flex-col h-full bg-muted/10">
          <div className="p-4 border-b border-border bg-card">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground" />
              </span>
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-border/60">
            {loading ? (
              <SkeletonLoader count={4} className="h-14 m-3" />
            ) : filteredStudents.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center p-6">No students found.</p>
            ) : (
              filteredStudents.map((stud) => (
                <button
                  key={stud.id}
                  onClick={() => fetchMessages(stud)}
                  className={`w-full p-4 text-left flex items-start gap-3 hover:bg-muted/40 transition duration-150 cursor-pointer ${selectedStudent?.id === stud.id ? 'bg-primary/5 border-l-4 border-primary' : ''}`}
                >
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold">
                    {stud.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-foreground truncate">{stud.name}</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                      <GraduationCap className="h-3.5 w-3.5" /> Class: {stud.class}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right message log */}
        <div className="md:col-span-2 flex flex-col h-full bg-card">
          {selectedStudent ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-border bg-card">
                <h3 className="text-xs font-bold text-foreground">{selectedStudent.name}</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">Assigned Class: {selectedStudent.class}</p>
              </div>

              {/* Bubbles */}
              <div className="flex-1 overflow-y-auto p-4 bg-muted/5 space-y-4">
                {messagesLoading ? (
                  <SkeletonLoader count={2} className="h-10" />
                ) : messages.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center p-6">No message logs. Start typing below.</p>
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

              {/* Send box */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-border bg-card flex gap-3">
                <input
                  type="text"
                  placeholder={`Send notice alert to ${selectedStudent.name}...`}
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
              <User className="h-12 w-12 text-muted-foreground mb-3" />
              <h4 className="text-sm font-bold text-foreground">Select Student</h4>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">Select a student from the sidebar roster to view logs or broadcast alerts.</p>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  )
}
