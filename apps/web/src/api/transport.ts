import apiClient from '@/lib/axios';
import type { ApiResponse } from '@/types';

export interface TransportSettings {
  id: string;
  transportEnabled: boolean;
  capacityWarningsEnabled: boolean;
  transportAttendanceEnabled: boolean;
}

export interface Vehicle {
  id: string;
  registrationNumber: string;
  vehicleCode?: string | null;
  vehicleType: 'BUS' | 'MINI_BUS' | 'VAN' | 'CAR' | 'OTHER';
  make?: string | null;
  model?: string | null;
  year?: number | null;
  seatingCapacity: number;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'RETIRED';
  notes?: string | null;
}

export interface DriverProfile {
  id: string;
  fullName?: string | null;
  phone?: string | null;
  licenseNumber: string;
  licenseExpiry?: string | null;
  status: string;
}

export interface TransportStop {
  id: string;
  name: string;
  code?: string | null;
  addressText?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  status: string;
}

export interface RouteStop {
  id: string;
  routeId: string;
  stopId: string;
  sequenceNumber: number;
  plannedArrivalTime?: string | null;
  plannedDepartureTime?: string | null;
  stop: TransportStop;
}

export interface TransportRoute {
  id: string;
  name: string;
  code?: string | null;
  description?: string | null;
  status: string;
  stops: RouteStop[];
}

export interface TransportTrip {
  id: string;
  routeId: string;
  vehicleId: string;
  driverProfileId?: string | null;
  tripType: 'PICKUP' | 'DROP' | 'CUSTOM';
  name: string;
  startTime?: string | null;
  endTime?: string | null;
  status: string;
  route?: TransportRoute;
  vehicle?: Vehicle;
  driver?: DriverProfile;
}

export interface StudentTransportAssignment {
  id: string;
  studentId: string;
  pickupTripId?: string | null;
  pickupStopId?: string | null;
  dropTripId?: string | null;
  dropStopId?: string | null;
  status: string;
  pickupTrip?: TransportTrip | null;
  pickupStop?: TransportStop | null;
  dropTrip?: TransportTrip | null;
  dropStop?: TransportStop | null;
}

export const transportApi = {
  getSettings: async (): Promise<TransportSettings> => {
    const res = await apiClient.get<ApiResponse<TransportSettings>>('/school/transport/settings');
    return res.data.data;
  },

  updateSettings: async (data: Partial<TransportSettings>): Promise<TransportSettings> => {
    const res = await apiClient.patch<ApiResponse<TransportSettings>>('/school/transport/settings', data);
    return res.data.data;
  },

  listVehicles: async (): Promise<Vehicle[]> => {
    const res = await apiClient.get<ApiResponse<Vehicle[]>>('/school/transport/vehicles');
    return res.data.data;
  },

  createVehicle: async (data: Partial<Vehicle>): Promise<Vehicle> => {
    const res = await apiClient.post<ApiResponse<Vehicle>>('/school/transport/vehicles', data);
    return res.data.data;
  },

  listDrivers: async (): Promise<DriverProfile[]> => {
    const res = await apiClient.get<ApiResponse<DriverProfile[]>>('/school/transport/drivers');
    return res.data.data;
  },

  createDriver: async (data: Partial<DriverProfile>): Promise<DriverProfile> => {
    const res = await apiClient.post<ApiResponse<DriverProfile>>('/school/transport/drivers', data);
    return res.data.data;
  },

  listRoutes: async (): Promise<TransportRoute[]> => {
    const res = await apiClient.get<ApiResponse<TransportRoute[]>>('/school/transport/routes');
    return res.data.data;
  },

  createRoute: async (data: Partial<TransportRoute>): Promise<TransportRoute> => {
    const res = await apiClient.post<ApiResponse<TransportRoute>>('/school/transport/routes', data);
    return res.data.data;
  },

  listStops: async (): Promise<TransportStop[]> => {
    const res = await apiClient.get<ApiResponse<TransportStop[]>>('/school/transport/stops');
    return res.data.data;
  },

  createStop: async (data: Partial<TransportStop>): Promise<TransportStop> => {
    const res = await apiClient.post<ApiResponse<TransportStop>>('/school/transport/stops', data);
    return res.data.data;
  },

  addStopToRoute: async (data: { routeId: string; stopId: string; sequenceNumber: number; plannedArrivalTime?: string }): Promise<any> => {
    const res = await apiClient.post<ApiResponse<any>>('/school/transport/route-stops', data);
    return res.data.data;
  },

  listTrips: async (routeId?: string): Promise<TransportTrip[]> => {
    const res = await apiClient.get<ApiResponse<TransportTrip[]>>('/school/transport/trips', { params: { routeId } });
    return res.data.data;
  },

  createTrip: async (data: Partial<TransportTrip>): Promise<TransportTrip> => {
    const res = await apiClient.post<ApiResponse<TransportTrip>>('/school/transport/trips', data);
    return res.data.data;
  },

  assignStudent: async (data: Partial<StudentTransportAssignment> & { academicYearId: string; studentEnrollmentId: string; effectiveFrom: string }): Promise<StudentTransportAssignment> => {
    const res = await apiClient.post<ApiResponse<StudentTransportAssignment>>('/school/transport/assignments', data);
    return res.data.data;
  },

  bulkAssign: async (data: { academicYearId: string; studentIds: string[]; pickupTripId?: string; pickupStopId?: string; dropTripId?: string; dropStopId?: string }): Promise<any[]> => {
    const res = await apiClient.post<ApiResponse<any[]>>('/school/transport/assignments/bulk', data);
    return res.data.data;
  },

  markAttendance: async (data: { tripId: string; studentId: string; date: string; status: string }): Promise<any> => {
    const res = await apiClient.post<ApiResponse<any>>('/school/transport/attendance', data);
    return res.data.data;
  },

  getDashboardStats: async (): Promise<any> => {
    const res = await apiClient.get<ApiResponse<any>>('/school/transport/dashboard');
    return res.data.data;
  },

  getMyAssignment: async (): Promise<StudentTransportAssignment | null> => {
    const res = await apiClient.get<ApiResponse<StudentTransportAssignment | null>>('/school/transport/student/me');
    return res.data.data;
  },

  getChildAssignment: async (studentId: string): Promise<StudentTransportAssignment | null> => {
    const res = await apiClient.get<ApiResponse<StudentTransportAssignment | null>>(`/school/transport/guardian/children/${studentId}`);
    return res.data.data;
  }
};
