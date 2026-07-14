import apiClient from '@/lib/axios';
import type { ApiResponse } from '@/types';

export interface AnnouncementAudience {
  id: string;
  announcementId: string;
  audienceType: 'ALL_SCHOOL' | 'ALL_STUDENTS' | 'ALL_GUARDIANS' | 'ALL_EMPLOYEES' | 'TEACHERS' | 'DEPARTMENT' | 'CLASS' | 'SECTION' | 'ROLE' | 'USER';
  targetId?: string | null;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  announcementType: 'GENERAL' | 'ACADEMIC' | 'EXAM' | 'HOLIDAY' | 'EVENT' | 'EMERGENCY' | 'FEE' | 'ADMINISTRATIVE' | 'OTHER';
  priority: 'NORMAL' | 'IMPORTANT' | 'URGENT';
  status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'EXPIRED' | 'ARCHIVED';
  publishAt?: string | null;
  expiresAt?: string | null;
  requiresAcknowledgement: boolean;
  createdByUserId: string;
  publishedByUserId?: string | null;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  audiences: AnnouncementAudience[];
  readAt?: string | null;
  acknowledgedAt?: string | null;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  referenceType?: string | null;
  referenceId?: string | null;
  readAt?: string | null;
  createdAt: string;
}

export interface AnnouncementAnalytics {
  total: number;
  read: number;
  unread: number;
  acknowledged: number;
  pendingAcknowledgement: number;
}

export const communicationApi = {
  // Notices
  listMyNoticeBoard: async (): Promise<Announcement[]> => {
    const res = await apiClient.get<ApiResponse<Announcement[]>>('/school/communication/announcements');
    return res.data.data;
  },

  markNoticeRead: async (id: string): Promise<any> => {
    const res = await apiClient.post<ApiResponse<any>>(`/school/communication/announcements/${id}/read`);
    return res.data.data;
  },

  acknowledgeNotice: async (id: string): Promise<any> => {
    const res = await apiClient.post<ApiResponse<any>>(`/school/communication/announcements/${id}/acknowledge`);
    return res.data.data;
  },

  // Administrative Announcements
  listAdminAnnouncements: async (): Promise<Announcement[]> => {
    const res = await apiClient.get<ApiResponse<Announcement[]>>('/school/communication/announcements/admin');
    return res.data.data;
  },

  createAnnouncement: async (data: {
    title: string;
    body: string;
    announcementType: string;
    priority: string;
    requiresAcknowledgement?: boolean;
    audiences: { audienceType: string; targetId?: string | null }[];
  }): Promise<Announcement> => {
    const res = await apiClient.post<ApiResponse<Announcement>>('/school/communication/announcements', data);
    return res.data.data;
  },

  publishAnnouncement: async (id: string): Promise<Announcement> => {
    const res = await apiClient.post<ApiResponse<Announcement>>(`/school/communication/announcements/${id}/publish`);
    return res.data.data;
  },

  archiveAnnouncement: async (id: string): Promise<any> => {
    const res = await apiClient.post<ApiResponse<any>>(`/school/communication/announcements/${id}/archive`);
    return res.data.data;
  },

  getAnalytics: async (id: string): Promise<AnnouncementAnalytics> => {
    const res = await apiClient.get<ApiResponse<AnnouncementAnalytics>>(`/school/communication/announcements/${id}/analytics`);
    return res.data.data;
  },

  // Notifications
  listNotifications: async (): Promise<Notification[]> => {
    const res = await apiClient.get<ApiResponse<Notification[]>>('/school/communication/notifications');
    return res.data.data;
  },

  markNotificationRead: async (id: string): Promise<any> => {
    const res = await apiClient.post<ApiResponse<any>>(`/school/communication/notifications/${id}/read`);
    return res.data.data;
  },

  markAllRead: async (): Promise<any> => {
    const res = await apiClient.post<ApiResponse<any>>('/school/communication/notifications/read-all');
    return res.data.data;
  }
};
