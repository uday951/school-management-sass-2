import apiClient from '@/lib/axios';
import type { ApiResponse } from '@/types';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string | null;
  eventType: 'HOLIDAY' | 'ACADEMIC' | 'EXAM' | 'SPORTS' | 'CULTURAL' | 'MEETING' | 'DEADLINE' | 'SCHOOL_EVENT' | 'STAFF_EVENT' | 'OTHER';
  startAt: string;
  endAt: string;
  allDay: boolean;
  locationText?: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'ARCHIVED';
  visibility: string;
}

export interface WorkingDayException {
  id: string;
  academicYearId: string;
  date: string;
  exceptionType: 'WORKING_DAY' | 'NON_WORKING_DAY';
  reason: string;
  calendarEventId?: string | null;
}

export const calendarOpsApi = {
  listEvents: async (params?: { type?: string; start?: string; end?: string }): Promise<CalendarEvent[]> => {
    const res = await apiClient.get<ApiResponse<CalendarEvent[]>>('/school/calendar/timeline', { params });
    return res.data.data;
  },

  getUpcomingEvents: async (): Promise<any> => {
    const res = await apiClient.get<ApiResponse<any>>('/school/calendar/upcoming');
    return res.data.data;
  },

  createEvent: async (data: Partial<CalendarEvent> & { academicYearId?: string; audiences?: { audienceType: string; targetId?: string | null }[] }): Promise<CalendarEvent> => {
    const res = await apiClient.post<ApiResponse<CalendarEvent>>('/school/calendar/events', data);
    return res.data.data;
  },

  cancelEvent: async (id: string): Promise<CalendarEvent> => {
    const res = await apiClient.post<ApiResponse<CalendarEvent>>(`/school/calendar/events/${id}/cancel`);
    return res.data.data;
  },

  listExceptions: async (): Promise<WorkingDayException[]> => {
    const res = await apiClient.get<ApiResponse<WorkingDayException[]>>('/school/calendar/exceptions');
    return res.data.data;
  },

  createException: async (data: Partial<WorkingDayException>): Promise<WorkingDayException> => {
    const res = await apiClient.post<ApiResponse<WorkingDayException>>('/school/calendar/exceptions', data);
    return res.data.data;
  }
};
