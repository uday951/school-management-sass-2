import apiClient from '@/lib/axios';
import type { ApiResponse } from '@/types';

export interface SchoolInvite {
  id: string;
  inviteType: 'SCHOOL' | 'CLASS' | 'SECTION' | 'PARENT';
  publicCode: string;
  academicYear?: { name: string } | null;
  class?: { name: string } | null;
  section?: { name: string } | null;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED' | 'DISABLED';
  expiresAt?: string | null;
  maxUses?: number | null;
  usageCount: number;
  requireApproval: boolean;
  createdBy: {
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  secureToken?: string; // Only returned on creation
}

export interface ResolvedInvite {
  id: string;
  tenantId: string;
  schoolId: string;
  inviteType: 'SCHOOL' | 'CLASS' | 'SECTION' | 'PARENT';
  publicCode: string;
  requireApproval: boolean;
  schoolName: string;
  schoolEmail: string;
  schoolLogo?: string | null;
  academicYear?: { id: string; name: string } | null;
  class?: { id: string; name: string } | null;
  section?: { id: string; name: string } | null;
}

export const invitesApi = {
  listInvites: async (params: { inviteType?: string; status?: string; page: number; limit: number }): Promise<{ total: number; invites: SchoolInvite[] }> => {
    const response = await apiClient.get<ApiResponse<{ total: number; invites: SchoolInvite[] }>>('/school/invites', { params });
    return response.data.data;
  },

  createInvite: async (data: {
    inviteType: 'SCHOOL' | 'CLASS' | 'SECTION' | 'PARENT';
    academicYearId?: string;
    classId?: string;
    sectionId?: string;
    expiresInDays?: number;
    maxUses?: number;
    requireApproval?: boolean;
  }): Promise<SchoolInvite> => {
    const response = await apiClient.post<ApiResponse<SchoolInvite>>('/school/invites', data);
    return response.data.data;
  },

  revokeInvite: async (id: string): Promise<SchoolInvite> => {
    const response = await apiClient.post<ApiResponse<SchoolInvite>>(`/school/invites/${id}/revoke`);
    return response.data.data;
  },

  resolveInvite: async (publicCode: string): Promise<ResolvedInvite> => {
    const response = await apiClient.get<ApiResponse<ResolvedInvite>>(`/invites/resolve/${publicCode}`);
    return response.data.data;
  }
};
