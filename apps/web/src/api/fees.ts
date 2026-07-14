import apiClient from '@/lib/axios';
import type { ApiResponse } from '@/types';

export interface FeeCategory {
  id: string;
  name: string;
  code?: string | null;
  description?: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  sortOrder: number;
}

export interface FeeComponent {
  id: string;
  feeCategoryId: string;
  name: string;
  code?: string | null;
  description?: string | null;
  componentType: 'ONE_TIME' | 'TERM' | 'MONTHLY' | 'QUARTERLY' | 'ANNUAL' | 'CUSTOM';
  isMandatoryDefault: boolean;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  category?: FeeCategory;
}

export interface FeeStructureItem {
  id: string;
  feeComponentId: string;
  amountMinor: number;
  isMandatory: boolean;
  component?: FeeComponent;
}

export interface FeeInstallmentItem {
  id: string;
  feeStructureItemId: string;
  amountMinor: number;
  structureItem?: FeeStructureItem;
}

export interface FeeInstallment {
  id: string;
  name: string;
  dueDate: string;
  sequenceNumber: number;
  items?: FeeInstallmentItem[];
}

export interface FeeStructureTarget {
  id: string;
  classId: string;
  sectionId?: string | null;
  class?: { id: string; name: string };
  section?: { id: string; name: string } | null;
}

export interface FeeStructure {
  id: string;
  academicYearId: string;
  name: string;
  description?: string | null;
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  currency: string;
  publishedAt?: string | null;
  items?: FeeStructureItem[];
  installments?: FeeInstallment[];
  targets?: FeeStructureTarget[];
  academicYear?: { id: string; name: string };
}

export interface ConcessionScheme {
  id: string;
  name: string;
  code?: string | null;
  description?: string | null;
  concessionType: 'FIXED_AMOUNT' | 'PERCENTAGE';
  value: number;
  maximumAmountMinor?: number | null;
}

export interface StudentConcession {
  id: string;
  studentId: string;
  concessionSchemeId: string;
  applicableFeeComponentId?: string | null;
  approvedAmountMinor?: number | null;
  percentageBasisPoints?: number | null;
  reason?: string | null;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  approvedAt?: string | null;
  student?: { firstName: string; lastName: string; admissionNumber: string };
  scheme?: ConcessionScheme;
}

export interface FinanceSettings {
  id: string;
  currency: string;
  lateFeeEnabled: boolean;
  graceDays: number;
  lateFeeType: 'FIXED' | 'PERCENTAGE';
  lateFeeValue: number;
  receiptPrefix: string;
  receiptSequence: number;
}

export interface FeeCharge {
  id: string;
  description: string;
  amountMinor: number;
  dueDate?: string | null;
  chargeType: 'STRUCTURE' | 'MANUAL' | 'LATE_FEE' | 'OTHER';
  status: 'OPEN' | 'PARTIALLY_PAID' | 'PAID' | 'WAIVED' | 'REVERSED' | 'CANCELLED';
}

export interface PaymentAllocation {
  id: string;
  feeChargeId: string;
  amountMinor: number;
  charge?: FeeCharge;
}

export interface Payment {
  id: string;
  amountMinor: number;
  paymentDate: string;
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'CHEQUE' | 'UPI' | 'CARD_OFFLINE' | 'DEMAND_DRAFT' | 'OTHER';
  referenceNumber?: string | null;
  bankName?: string | null;
  chequeNumber?: string | null;
  chequeDate?: string | null;
  notes?: string | null;
  status: 'RECORDED' | 'CONFIRMED' | 'REVERSED' | 'CANCELLED';
  student?: { firstName: string; lastName: string; admissionNumber: string };
  allocations?: PaymentAllocation[];
}

export interface RefundRecord {
  id: string;
  amountMinor: number;
  refundDate: string;
  refundMethod: string;
  reason: string;
  referenceNumber?: string | null;
  student?: { firstName: string; lastName: string; admissionNumber: string };
}

export interface FinanceSettings {
  id: string;
  currency: string;
  lateFeeEnabled: boolean;
  graceDays: number;
  lateFeeType: 'FIXED' | 'PERCENTAGE';
  lateFeeValue: number;
  receiptPrefix: string;
  receiptSequence: number;
}

export const feesApi = {
  // Categories
  listCategories: async (): Promise<FeeCategory[]> => {
    const res = await apiClient.get<ApiResponse<FeeCategory[]>>('/school/fees/categories');
    return res.data.data;
  },
  createCategory: async (data: any): Promise<FeeCategory> => {
    const res = await apiClient.post<ApiResponse<FeeCategory>>('/school/fees/categories', data);
    return res.data.data;
  },
  updateCategory: async (id: string, data: any): Promise<FeeCategory> => {
    const res = await apiClient.patch<ApiResponse<FeeCategory>>(`/school/fees/categories/${id}`, data);
    return res.data.data;
  },
  deleteCategory: async (id: string): Promise<void> => {
    await apiClient.delete(`/school/fees/categories/${id}`);
  },

  // Components
  listComponents: async (): Promise<FeeComponent[]> => {
    const res = await apiClient.get<ApiResponse<FeeComponent[]>>('/school/fees/components');
    return res.data.data;
  },
  createComponent: async (data: any): Promise<FeeComponent> => {
    const res = await apiClient.post<ApiResponse<FeeComponent>>('/school/fees/components', data);
    return res.data.data;
  },
  updateComponent: async (id: string, data: any): Promise<FeeComponent> => {
    const res = await apiClient.patch<ApiResponse<FeeComponent>>(`/school/fees/components/${id}`, data);
    return res.data.data;
  },
  deleteComponent: async (id: string): Promise<void> => {
    await apiClient.delete(`/school/fees/components/${id}`);
  },

  // Structures
  listStructures: async (academicYearId?: string): Promise<FeeStructure[]> => {
    const res = await apiClient.get<ApiResponse<FeeStructure[]>>('/school/fees/structures', { params: { academicYearId } });
    return res.data.data;
  },
  getStructure: async (id: string): Promise<FeeStructure> => {
    const res = await apiClient.get<ApiResponse<FeeStructure>>(`/school/fees/structures/${id}`);
    return res.data.data;
  },
  createStructure: async (data: any): Promise<FeeStructure> => {
    const res = await apiClient.post<ApiResponse<FeeStructure>>('/school/fees/structures', data);
    return res.data.data;
  },
  updateStructureStatus: async (id: string, status: string): Promise<FeeStructure> => {
    const res = await apiClient.patch<ApiResponse<FeeStructure>>(`/school/fees/structures/${id}/status`, { status });
    return res.data.data;
  },
  deleteStructure: async (id: string): Promise<void> => {
    await apiClient.delete(`/school/fees/structures/${id}`);
  },

  // Assignments
  listAssignments: async (academicYearId: string): Promise<any[]> => {
    const res = await apiClient.get<ApiResponse<any[]>>('/school/fees/assignments', { params: { academicYearId } });
    return res.data.data;
  },
  previewBulkAssignmentStudents: async (classId: string, sectionId?: string | null): Promise<any[]> => {
    const res = await apiClient.get<ApiResponse<any[]>>('/school/fees/assignments/preview-students', { params: { classId, sectionId } });
    return res.data.data;
  },
  assignBulk: async (data: { academicYearId: string; feeStructureId: string; studentIds: string[] }): Promise<any> => {
    const res = await apiClient.post<ApiResponse<any>>('/school/fees/assignments/bulk', data);
    return res.data.data;
  },

  // Charges
  createManualCharge: async (academicYearId: string, data: any): Promise<any> => {
    const res = await apiClient.post<ApiResponse<any>>('/school/fees/charges/manual', data, { params: { academicYearId } });
    return res.data.data;
  },
  reverseCharge: async (id: string, reason: string): Promise<any> => {
    const res = await apiClient.post<ApiResponse<any>>(`/school/fees/charges/${id}/reverse`, { reason });
    return res.data.data;
  },

  // Concessions
  listConcessionSchemes: async (): Promise<ConcessionScheme[]> => {
    const res = await apiClient.get<ApiResponse<ConcessionScheme[]>>('/school/fees/concessions/schemes');
    return res.data.data;
  },
  createConcessionScheme: async (data: any): Promise<ConcessionScheme> => {
    const res = await apiClient.post<ApiResponse<ConcessionScheme>>('/school/fees/concessions/schemes', data);
    return res.data.data;
  },
  listStudentConcessions: async (academicYearId: string): Promise<StudentConcession[]> => {
    const res = await apiClient.get<ApiResponse<StudentConcession[]>>('/school/fees/concessions/students', { params: { academicYearId } });
    return res.data.data;
  },
  applyStudentConcession: async (academicYearId: string, data: any): Promise<StudentConcession> => {
    const res = await apiClient.post<ApiResponse<StudentConcession>>('/school/fees/concessions/students', data, { params: { academicYearId } });
    return res.data.data;
  },
  approveConcession: async (id: string): Promise<StudentConcession> => {
    const res = await apiClient.post<ApiResponse<StudentConcession>>(`/school/fees/concessions/students/${id}/approve`);
    return res.data.data;
  },
  rejectConcession: async (id: string): Promise<StudentConcession> => {
    const res = await apiClient.post<ApiResponse<StudentConcession>>(`/school/fees/concessions/students/${id}/reject`);
    return res.data.data;
  },

  // Payments
  listPayments: async (academicYearId: string): Promise<Payment[]> => {
    const res = await apiClient.get<ApiResponse<Payment[]>>('/school/payments', { params: { academicYearId } });
    return res.data.data;
  },
  recordPayment: async (academicYearId: string, data: any): Promise<Payment> => {
    const res = await apiClient.post<ApiResponse<Payment>>('/school/payments', data, { params: { academicYearId } });
    return res.data.data;
  },
  reversePayment: async (id: string, reason: string): Promise<Payment> => {
    const res = await apiClient.post<ApiResponse<Payment>>(`/school/payments/${id}/reverse`, { reason });
    return res.data.data;
  },

  // Refunds
  listRefunds: async (): Promise<RefundRecord[]> => {
    const res = await apiClient.get<ApiResponse<RefundRecord[]>>('/school/refunds');
    return res.data.data;
  },
  recordRefund: async (data: any): Promise<RefundRecord> => {
    const res = await apiClient.post<ApiResponse<RefundRecord>>('/school/refunds', data);
    return res.data.data;
  },

  // Student Account & Ledger
  getStudentFeeAccount: async (studentId: string, academicYearId: string): Promise<any> => {
    const res = await apiClient.get<ApiResponse<any>>(`/school/students/${studentId}/fee-account`, { params: { academicYearId } });
    return res.data.data;
  },
  getStudentLedger: async (studentId: string, academicYearId: string): Promise<any[]> => {
    const res = await apiClient.get<ApiResponse<any[]>>(`/school/students/${studentId}/fee-ledger`, { params: { academicYearId } });
    return res.data.data;
  },

  // Dashboard & Reports
  getFinanceDashboard: async (academicYearId: string): Promise<any> => {
    const res = await apiClient.get<ApiResponse<any>>('/school/finance/dashboard', { params: { academicYearId } });
    return res.data.data;
  },
  getDailyCollectionReport: async (date: string): Promise<any[]> => {
    const res = await apiClient.get<ApiResponse<any[]>>('/school/finance/reports/daily-collection', { params: { date } });
    return res.data.data;
  },
  getOutstandingReport: async (academicYearId: string): Promise<any[]> => {
    const res = await apiClient.get<ApiResponse<any[]>>('/school/finance/reports/outstanding', { params: { academicYearId } });
    return res.data.data;
  },

  // Settings
  getSettings: async (): Promise<FinanceSettings> => {
    const res = await apiClient.get<ApiResponse<FinanceSettings>>('/school/finance/settings');
    return res.data.data;
  },
  updateSettings: async (data: any): Promise<FinanceSettings> => {
    const res = await apiClient.patch<ApiResponse<FinanceSettings>>('/school/finance/settings', data);
    return res.data.data;
  }
};
