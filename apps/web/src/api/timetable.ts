import apiClient from '@/lib/axios';

export interface WorkingDay {
  id: string;
  dayOfWeek: string;
  isWorkingDay: boolean;
}

export interface BellPeriod {
  id: string;
  name: string;
  periodNumber?: number;
  periodType: 'TEACHING' | 'BREAK' | 'LUNCH' | 'ASSEMBLY' | 'ACTIVITY' | 'OTHER';
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
  sortOrder: number;
}

export interface BellSchedule {
  id: string;
  name: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
  isDefault: boolean;
  bellPeriods: BellPeriod[];
}

export interface DayScheduleMapping {
  id: string;
  dayOfWeek: string;
  bellScheduleId: string;
  bellSchedule: {
    name: string;
  };
}

export interface Room {
  id: string;
  name: string;
  code?: string;
  roomType: 'CLASSROOM' | 'LAB' | 'LIBRARY' | 'AUDITORIUM' | 'SPORTS' | 'OTHER';
  capacity?: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Timetable {
  id: string;
  academicYearId: string;
  classId: string;
  sectionId: string;
  versionNumber: number;
  status: 'DRAFT' | 'PUBLISHED' | 'SUPERSEDED' | 'ARCHIVED';
  class: { name: string };
  section: { name: string };
  academicYear: { name: string };
  entries: TimetableEntry[];
}

export interface TimetableEntry {
  id: string;
  dayOfWeek: string;
  bellPeriodId: string;
  subjectId?: string;
  employeeId?: string;
  roomId?: string;
  entryType: 'SUBJECT' | 'BREAK' | 'LUNCH' | 'ASSEMBLY' | 'ACTIVITY' | 'FREE' | 'OTHER';
  notes?: string;
  bellPeriod: BellPeriod;
  subject?: { name: string; code: string };
  teacher?: { firstName: string; lastName: string; employeeNumber?: string };
  room?: { name: string };
}

export const timetableApi = {
  // Working Days
  getWorkingDays: async (): Promise<WorkingDay[]> => {
    const res = await apiClient.get('/timetable/working-days');
    return res.data.data;
  },
  updateWorkingDays: async (workingDays: { dayOfWeek: string; isWorkingDay: boolean }[]) => {
    const res = await apiClient.put('/timetable/working-days', { workingDays });
    return res.data.data;
  },

  // Bell Schedules
  listBellSchedules: async (): Promise<BellSchedule[]> => {
    const res = await apiClient.get('/bell-schedules');
    return res.data.data;
  },
  getBellSchedule: async (id: string): Promise<BellSchedule> => {
    const res = await apiClient.get(`/bell-schedules/${id}`);
    return res.data.data;
  },
  createBellSchedule: async (data: { name: string; description?: string; isDefault?: boolean }): Promise<BellSchedule> => {
    const res = await apiClient.post('/bell-schedules', data);
    return res.data.data;
  },
  updateBellSchedule: async (id: string, data: { name?: string; description?: string; isDefault?: boolean; status?: string }): Promise<BellSchedule> => {
    const res = await apiClient.patch(`/bell-schedules/${id}`, data);
    return res.data.data;
  },
  setBellPeriods: async (id: string, periods: Omit<BellPeriod, 'id'>[]): Promise<any> => {
    const res = await apiClient.post(`/bell-schedules/${id}/periods`, { periods });
    return res.data.data;
  },
  getDaySchedules: async (): Promise<DayScheduleMapping[]> => {
    const res = await apiClient.get('/bell-schedules/day-mappings');
    return res.data.data;
  },
  setDaySchedules: async (mappings: { dayOfWeek: string; bellScheduleId: string }[]) => {
    const res = await apiClient.put('/bell-schedules/day-mappings', { mappings });
    return res.data.data;
  },

  // Rooms
  listRooms: async (): Promise<Room[]> => {
    const res = await apiClient.get('/rooms');
    return res.data.data;
  },
  createRoom: async (data: Omit<Room, 'id' | 'status'>): Promise<Room> => {
    const res = await apiClient.post('/rooms', data);
    return res.data.data;
  },
  updateRoom: async (id: string, data: Partial<Room>): Promise<Room> => {
    const res = await apiClient.patch(`/rooms/${id}`, data);
    return res.data.data;
  },

  // Timetables
  listTimetables: async (academicYearId?: string): Promise<Timetable[]> => {
    const res = await apiClient.get('/timetables', { params: { academicYearId } });
    return res.data.data;
  },
  createTimetable: async (data: { academicYearId: string; classId: string; sectionId: string }): Promise<Timetable> => {
    const res = await apiClient.post('/timetables', data);
    return res.data.data;
  },
  getTimetable: async (id: string): Promise<Timetable> => {
    const res = await apiClient.get(`/timetables/${id}`);
    return res.data.data;
  },
  addTimetableEntry: async (timetableId: string, entry: Omit<TimetableEntry, 'id' | 'bellPeriod'>): Promise<TimetableEntry> => {
    const res = await apiClient.post(`/timetables/${timetableId}/entries`, entry);
    return res.data.data;
  },
  deleteTimetableEntry: async (id: string) => {
    const res = await apiClient.delete(`/timetable-entries/${id}`);
    return res.data.data;
  },
  validateSlotConflicts: async (timetableId: string, entry: any, skipEntryId?: string): Promise<{ isValid: boolean; conflicts: string[] }> => {
    const res = await apiClient.post(`/timetables/${timetableId}/validate`, entry, { params: { skipEntryId } });
    return res.data.data;
  },
  publishTimetable: async (id: string): Promise<Timetable> => {
    const res = await apiClient.post(`/timetables/${id}/publish`);
    return res.data.data;
  },

  // Teacher Availability
  listTeacherAvailability: async (employeeId?: string): Promise<any[]> => {
    const res = await apiClient.get('/teacher-availability', { params: { employeeId } });
    return res.data.data;
  },
  createTeacherAvailability: async (data: any): Promise<any> => {
    const res = await apiClient.post('/teacher-availability', data);
    return res.data.data;
  },
  deleteTeacherAvailability: async (id: string) => {
    const res = await apiClient.delete(`/teacher-availability/${id}`);
    return res.data.data;
  },

  // Schedule Overrides
  listOverrides: async (date?: string): Promise<any[]> => {
    const res = await apiClient.get('/schedule-overrides', { params: { date } });
    return res.data.data;
  },
  createOverride: async (data: any): Promise<any> => {
    const res = await apiClient.post('/schedule-overrides', data);
    return res.data.data;
  },
  cancelOverride: async (id: string) => {
    const res = await apiClient.patch(`/schedule-overrides/${id}/cancel`);
    return res.data.data;
  },

  // Substitutions
  listSubstitutions: async (date?: string): Promise<any[]> => {
    const res = await apiClient.get('/substitutions', { params: { date } });
    return res.data.data;
  },
  assignSubstitute: async (data: { date: string; timetableEntryId: string; substituteEmployeeId: string; reason?: string }): Promise<any> => {
    const res = await apiClient.post('/substitutions', data);
    return res.data.data;
  },
  cancelSubstitution: async (id: string) => {
    const res = await apiClient.patch(`/substitutions/${id}/cancel`);
    return res.data.data;
  },

  // Portals
  getTeacherSchedule: async (date?: string): Promise<any[]> => {
    const res = await apiClient.get('/teacher/schedule', { params: { date } });
    return res.data.data;
  },
  getStudentTimetable: async (): Promise<any> => {
    const res = await apiClient.get('/student/timetable');
    return res.data.data;
  },
  getGuardianChildTimetable: async (studentId: string): Promise<any> => {
    const res = await apiClient.get(`/guardian/children/${studentId}/timetable`);
    return res.data.data;
  }
};
