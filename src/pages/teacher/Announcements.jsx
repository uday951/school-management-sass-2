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

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([])
  const [notices, setNotices] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('announcements')

  const fetchCommunications = async () => {
    setLoading(true)
    try {
      const [annRes, notRes] = await Promise.all([
        axiosClient.get('/teacher/announcements'),
        axiosClient.get('/teacher/notices')
      ])
      if (annRes.data.success) {
        setAnnouncements(annRes.data.data)
      }
      if (notRes.data.success) {
        setNotices(notRes.data.data)
      }
    } catch (err) {
      console.error('Error fetching teacher communications:', err)
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
        title="Institutional Announcements"
        subtitle="Stay updated with school bulletin boards, departmental notices, and circular releases."
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('announcements')}
              className={`inline-flex items-center justify-center rounded-xl text-xs font-bold transition h-9 px-4 py-2 cursor-pointer ${activeTab === 'announcements' ? 'bg-primary text-primary-foreground' : 'border border-input bg-background hover:bg-accent text-foreground'}`}
            >
              <Megaphone className="h-4 w-4 mr-1.5" /> General Announcements
            </button>
            <button
              onClick={() => setActiveTab('notices')}
              className={`inline-flex items-center justify-center rounded-xl text-xs font-bold transition h-9 px-4 py-2 cursor-pointer ${activeTab === 'notices' ? 'bg-primary text-primary-foreground' : 'border border-input bg-background hover:bg-accent text-foreground'}`}
            >
              <Bell className="h-4 w-4 mr-1.5" /> Notice Board Circulars
            </button>
          </div>
        }
      />

      {loading ? (
        <SkeletonLoader count={3} className="h-24 mb-4" />
      ) : activeTab === 'announcements' ? (
        <div className="space-y-4">
          {announcements.length === 0 ? (
            <div className="p-6 bg-card border border-border rounded-2xl text-center">
              <p className="text-muted-foreground text-sm font-semibold">No recent announcements published.</p>
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
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" /> Published: {new Date(item.publishDate).toLocaleDateString()}
                    </span>
                    <span className="capitalize font-bold text-primary">Target: {item.targetAudience}</span>
                  </div>
                </div>
              </SimpleCard>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {notices.length === 0 ? (
            <div className="p-6 bg-card border border-border rounded-2xl text-center">
              <p className="text-muted-foreground text-sm font-semibold">No active notice board items.</p>
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
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" /> Posted: {new Date(item.publishDate).toLocaleDateString()}
                    </span>
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
