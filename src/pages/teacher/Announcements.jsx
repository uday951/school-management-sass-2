import React, { useState, useEffect } from 'react'
import axiosClient from '@/config/axiosClient'
import {
  PageContainer,
  PageHeader,
  SimpleCard,
  Badge,
  SkeletonLoader
} from '@/components/shared'
import { Megaphone, Bell, Calendar, Pin } from 'lucide-react'

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([])
  const [notices, setNotices] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('announcements')

  const fetchAnnouncements = async () => {
    setLoading(true)
    try {
      const [annRes, notRes] = await Promise.all([
        axiosClient.get('/teacher/announcements'),
        axiosClient.get('/portal/notices')
      ])
      if (annRes.data.success) {
        setAnnouncements(annRes.data.data)
      }
      if (notRes.data.success) {
        setNotices(notRes.data.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  return (
    <PageContainer>
      <PageHeader
        title="Bulletin & Circulars"
        subtitle="Stay updated with school events, circulars, department notices, and announcements."
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('announcements')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${activeTab === 'announcements' ? 'bg-primary text-primary-foreground shadow-sm' : 'border border-input bg-card text-foreground hover:bg-muted'}`}
            >
              <Megaphone className="h-4 w-4" /> Announcements
            </button>
            <button
              onClick={() => setActiveTab('notices')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${activeTab === 'notices' ? 'bg-primary text-primary-foreground shadow-sm' : 'border border-input bg-card text-foreground hover:bg-muted'}`}
            >
              <Bell className="h-4 w-4" /> Notices & Circulars
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
              <p className="text-muted-foreground text-sm font-semibold">No recent announcements found.</p>
            </div>
          ) : (
            announcements.map((item) => (
              <SimpleCard
                key={item._id}
                title={item.title}
                actions={
                  <div className="flex items-center gap-2">
                    {item.isPinned && <Pin className="h-4 w-4 text-primary fill-primary" />}
                    <Badge className="bg-primary/10 text-primary capitalize font-bold text-[9px]">
                      {item.priority || 'Medium'}
                    </Badge>
                  </div>
                }
              >
                <div className="space-y-3 text-xs leading-relaxed">
                  <p className="text-foreground font-medium whitespace-pre-line">{item.content}</p>
                  <div className="flex justify-between items-center text-muted-foreground text-[10px] pt-2 border-t border-border/50">
                    <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Published: {new Date(item.publishDate).toLocaleDateString()}</span>
                    <span className="font-bold text-primary capitalize">Audience: {item.targetAudience}</span>
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
              <p className="text-muted-foreground text-sm font-semibold">No active circulars or notices posted.</p>
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
                    <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Published: {new Date(item.publishDate).toLocaleDateString()}</span>
                    <span className="capitalize font-bold text-primary">Priority: {item.priority || 'Normal'}</span>
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
