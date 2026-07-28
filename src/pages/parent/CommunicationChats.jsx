import React, { useState, useEffect } from 'react'
import axiosClient from '@/config/axiosClient'
import {
  PageContainer,
  PageHeader,
  SimpleCard,
  Badge,
  SkeletonLoader
} from '@/components/shared'
import { Megaphone, Bell, Calendar, Tag } from 'lucide-react'

export default function CommunicationChats() {
  const [announcements, setAnnouncements] = useState([])
  const [notices, setNotices] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('announcements')

  const fetchCommunications = async () => {
    setLoading(true)
    try {
      const [annRes, notRes] = await Promise.all([
        axiosClient.get('/portal/announcements'),
        axiosClient.get('/portal/notices')
      ])
      if (annRes.data.success) {
        setAnnouncements(annRes.data.data)
      }
      if (notRes.data.success) {
        setNotices(notRes.data.data)
      }
    } catch (err) {
      console.error('Error fetching parent communication details:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCommunications()
  }, [])

  return (
    <PageContainer>
      <PageHeader
        title="School Communications Hub"
        subtitle="Stay updated with institution-wide announcements, campus news, and calendar alerts."
        actions={
          <div className="flex gap-2">
            <Button
              variant={activeTab === 'announcements' ? 'primary' : 'outline'}
              className="flex items-center gap-1.5"
              onClick={() => setActiveTab('announcements')}
            >
              <Megaphone className="h-4 w-4" /> Announcements
            </Button>
            <Button
              variant={activeTab === 'notices' ? 'primary' : 'outline'}
              className="flex items-center gap-1.5"
              onClick={() => setActiveTab('notices')}
            >
              <Bell className="h-4 w-4" /> Circulars & Notices
            </Button>
          </div>
        }
      />

      {loading ? (
        <SkeletonLoader count={4} className="h-20 mb-4" />
      ) : activeTab === 'announcements' ? (
        /* Announcements list */
        <div className="space-y-4">
          {announcements.length === 0 ? (
            <div className="p-6 bg-card border border-border rounded-2xl text-center">
              <p className="text-muted-foreground text-sm font-semibold">No recent school announcements posted.</p>
            </div>
          ) : (
            announcements.map((item) => (
              <SimpleCard
                key={item._id}
                title={item.title}
                actions={
                  <Badge className="bg-primary/10 text-primary uppercase text-[9px] font-bold">
                    {item.priority || 'Medium'}
                  </Badge>
                }
              >
                <div className="space-y-3 text-xs leading-relaxed">
                  <p className="text-foreground font-medium whitespace-pre-line">{item.content}</p>
                  <div className="flex justify-between items-center text-muted-foreground text-[10px] pt-2 border-t border-border/50">
                    <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Published: {new Date(item.publishDate).toLocaleDateString()}</span>
                    <span className="capitalize font-bold text-primary">Audience: {item.targetAudience}</span>
                  </div>
                </div>
              </SimpleCard>
            ))
          )}
        </div>
      ) : (
        /* Notices Board */
        <div className="space-y-4">
          {notices.length === 0 ? (
            <div className="p-6 bg-card border border-border rounded-2xl text-center">
              <p className="text-muted-foreground text-sm font-semibold">No circulars or notice board entries posted.</p>
            </div>
          ) : (
            notices.map((item) => (
              <SimpleCard
                key={item._id}
                title={item.title}
                actions={
                  <Badge className="bg-secondary text-foreground uppercase text-[9px] font-bold">
                    {item.category || 'General'}
                  </Badge>
                }
              >
                <div className="space-y-3 text-xs leading-relaxed">
                  <p className="text-foreground font-medium whitespace-pre-line">{item.content}</p>
                  <div className="flex justify-between items-center text-muted-foreground text-[10px] pt-2 border-t border-border/50">
                    <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Date: {new Date(item.publishDate).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><Tag className="h-3.5 w-3.5" /> Priority: {item.priority || 'Medium'}</span>
                  </div>
                </div>
              </SimpleCard>
            ))
          )}
        </div>
      )}
    </PageContainer>
  )
}

// Simple internal Button component since it wasn't exported in shared index directly
function Button({ children, variant = 'primary', className, ...props }) {
  const styles = variant === 'primary' 
    ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
    : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground text-foreground'
  
  return (
    <button
      className={`inline-flex items-center justify-center rounded-xl text-xs font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 cursor-pointer ${styles} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
