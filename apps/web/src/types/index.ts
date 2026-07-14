// ============================================================
// Shared TypeScript types for the School Management SaaS
// ============================================================

export type UserType = 'PLATFORM_SUPER_ADMIN' | 'SCHOOL_ADMIN';
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'INVITED';
export type TenantStatus = 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';
export type SchoolStatus = 'ONBOARDING' | 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';
export type SchoolType =
  | 'PRIMARY'
  | 'SECONDARY'
  | 'HIGHER_SECONDARY'
  | 'COMBINED'
  | 'PRESCHOOL'
  | 'INTERNATIONAL';
export type BoardType = 'CBSE' | 'ICSE' | 'STATE' | 'IB' | 'CAMBRIDGE' | 'OTHER';

// ---- Auth ----
export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  userType: UserType;
  tenantId: string | null;
  status: UserStatus;
  mustChangePassword: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  accessToken: string;
  user: Omit<AuthUser, 'createdAt' | 'updatedAt' | 'phone'>;
}

// ---- Tenant ----
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: TenantStatus;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string | null;
}

// ---- School ----
export interface School {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  slug: string;
  schoolType: SchoolType;
  board: BoardType;
  establishedYear?: number | null;
  officialEmail: string;
  officialPhone: string;
  website?: string | null;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  logoUrl?: string | null;
  status: SchoolStatus;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string | null;
  tenant?: Tenant;
  primaryAdmin?: SchoolAdminUser | null;
  recentActivity?: AuditLog[];
}

export interface SchoolAdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  status: UserStatus;
  mustChangePassword?: boolean;
  lastLoginAt?: string | null;
  createdAt?: string;
}

// ---- Dashboard ----
export interface DashboardStats {
  stats: {
    totalSchools: number;
    activeSchools: number;
    suspendedSchools: number;
    archivedSchools: number;
    onboardingSchools: number;
    totalSchoolAdmins: number;
  };
  recentSchools: Pick<School, 'id' | 'name' | 'code' | 'status' | 'city' | 'state' | 'board' | 'schoolType' | 'createdAt'>[];
  recentActivity: AuditLog[];
}

// ---- Audit Log ----
export interface AuditLog {
  id: string;
  actorUserId: string;
  actorEmail: string;
  tenantId?: string | null;
  schoolId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

// ---- Pagination ----
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// ---- API Response ----
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
  message?: string;
}

// ---- Create School Form ----
export interface CreateSchoolFormData {
  // Step 1: School Info
  name: string;
  code: string;
  schoolType: SchoolType;
  board: BoardType;
  establishedYear?: number;
  officialEmail: string;
  officialPhone: string;
  website?: string;
  // Step 2: Address
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  logoUrl?: string;
  // Step 3: First Admin
  firstAdmin: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
}

export interface CreateSchoolResponse {
  school: School;
  tenant: Tenant;
  adminUser: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
    mustChangePassword: boolean;
    tempPassword: string; // One-time display
  };
}

// ---- Schools Query ----
export interface SchoolsQuery {
  search?: string;
  status?: SchoolStatus;
  schoolType?: SchoolType;
  board?: BoardType;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// ---- Update School Status ----
export interface UpdateSchoolStatusPayload {
  status: SchoolStatus;
  reason?: string;
}

// ---- Label maps ----
export const SCHOOL_TYPE_LABELS: Record<SchoolType, string> = {
  PRIMARY: 'Primary',
  SECONDARY: 'Secondary',
  HIGHER_SECONDARY: 'Higher Secondary',
  COMBINED: 'Combined (K-12)',
  PRESCHOOL: 'Pre-School',
  INTERNATIONAL: 'International',
};

export const BOARD_TYPE_LABELS: Record<BoardType, string> = {
  CBSE: 'CBSE',
  ICSE: 'ICSE',
  STATE: 'State Board',
  IB: 'IB (International Baccalaureate)',
  CAMBRIDGE: 'Cambridge (IGCSE/AS/A Level)',
  OTHER: 'Other',
};

export const SCHOOL_STATUS_LABELS: Record<SchoolStatus, string> = {
  ONBOARDING: 'Onboarding',
  ACTIVE: 'Active',
  SUSPENDED: 'Suspended',
  ARCHIVED: 'Archived',
};
