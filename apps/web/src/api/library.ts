import apiClient from '@/lib/axios';
import type { ApiResponse } from '@/types';

export interface LibrarySettings {
  id: string;
  defaultStudentLoanDays: number;
  defaultEmployeeLoanDays: number;
  maxStudentBooks: number;
  maxEmployeeBooks: number;
  renewalAllowed: boolean;
  maxRenewals: number;
  fineEnabled: boolean;
  finePerDayMinor: number;
  graceDays: number;
}

export interface BookCategory {
  id: string;
  name: string;
  code?: string | null;
  description?: string | null;
  status: string;
}

export interface Author {
  id: string;
  name: string;
  biography?: string | null;
}

export interface Publisher {
  id: string;
  name: string;
  contactInfo?: string | null;
}

export interface BookCopy {
  id: string;
  bookId: string;
  accessionNumber: string;
  barcode?: string | null;
  shelfLocation?: string | null;
  status: 'AVAILABLE' | 'ISSUED' | 'RESERVED' | 'LOST' | 'DAMAGED' | 'REPAIR' | 'WITHDRAWN';
  book?: Book;
}

export interface Book {
  id: string;
  title: string;
  subtitle?: string | null;
  isbn10?: string | null;
  isbn13?: string | null;
  categoryId?: string | null;
  publisherId?: string | null;
  edition?: string | null;
  publicationYear?: number | null;
  language?: string | null;
  description?: string | null;
  coverFileId?: string | null;
  status: string;
  category?: BookCategory | null;
  publisher?: Publisher | null;
  authors: { author: Author }[];
  copies: BookCopy[];
}

export interface LibraryLoan {
  id: string;
  bookCopyId: string;
  borrowerType: 'STUDENT' | 'EMPLOYEE';
  studentId?: string | null;
  employeeId?: string | null;
  issuedAt: string;
  dueAt: string;
  returnedAt?: string | null;
  status: 'ISSUED' | 'OVERDUE' | 'RETURNED' | 'LOST' | 'DAMAGED';
  renewalCount: number;
  bookCopy: BookCopy;
}

export interface LibraryFine {
  id: string;
  libraryLoanId: string;
  studentId?: string | null;
  employeeId?: string | null;
  amountMinor: number;
  reason: string;
  status: 'OPEN' | 'PARTIALLY_WAIVED' | 'WAIVED' | 'SETTLED_MANUAL' | 'CANCELLED';
  waivedAmountMinor: number;
  waiverReason?: string | null;
}

export const libraryApi = {
  getSettings: async (): Promise<LibrarySettings> => {
    const res = await apiClient.get<ApiResponse<LibrarySettings>>('/school/library/settings');
    return res.data.data;
  },

  updateSettings: async (data: Partial<LibrarySettings>): Promise<LibrarySettings> => {
    const res = await apiClient.patch<ApiResponse<LibrarySettings>>('/school/library/settings', data);
    return res.data.data;
  },

  listCategories: async (): Promise<BookCategory[]> => {
    const res = await apiClient.get<ApiResponse<BookCategory[]>>('/school/library/categories');
    return res.data.data;
  },

  createCategory: async (data: { name: string; code?: string; description?: string }): Promise<BookCategory> => {
    const res = await apiClient.post<ApiResponse<BookCategory>>('/school/library/categories', data);
    return res.data.data;
  },

  listAuthors: async (): Promise<Author[]> => {
    const res = await apiClient.get<ApiResponse<Author[]>>('/school/library/authors');
    return res.data.data;
  },

  createAuthor: async (data: { name: string; biography?: string }): Promise<Author> => {
    const res = await apiClient.post<ApiResponse<Author>>('/school/library/authors', data);
    return res.data.data;
  },

  listPublishers: async (): Promise<Publisher[]> => {
    const res = await apiClient.get<ApiResponse<Publisher[]>>('/school/library/publishers');
    return res.data.data;
  },

  createPublisher: async (data: { name: string; contactInfo?: string }): Promise<Publisher> => {
    const res = await apiClient.post<ApiResponse<Publisher>>('/school/library/publishers', data);
    return res.data.data;
  },

  listBooks: async (params?: { categoryId?: string; search?: string }): Promise<Book[]> => {
    const res = await apiClient.get<ApiResponse<Book[]>>('/school/library/books', { params });
    return res.data.data;
  },

  createBook: async (data: Partial<Book> & { authorIds?: string[] }): Promise<Book> => {
    const res = await apiClient.post<ApiResponse<Book>>('/school/library/books', data);
    return res.data.data;
  },

  listCopies: async (bookId?: string): Promise<BookCopy[]> => {
    const res = await apiClient.get<ApiResponse<BookCopy[]>>('/school/library/copies', { params: { bookId } });
    return res.data.data;
  },

  createBookCopy: async (bookId: string, data: { accessionNumber: string; shelfLocation?: string }): Promise<BookCopy> => {
    const res = await apiClient.post<ApiResponse<BookCopy>>(`/school/library/books/${bookId}/copies`, data);
    return res.data.data;
  },

  issueBook: async (data: { bookCopyId: string; borrowerType: 'STUDENT' | 'EMPLOYEE'; studentId?: string; employeeId?: string }): Promise<LibraryLoan> => {
    const res = await apiClient.post<ApiResponse<LibraryLoan>>('/school/library/loans/issue', data);
    return res.data.data;
  },

  returnBook: async (loanId: string, data: { conditionStatus: string; remarks?: string }): Promise<any> => {
    const res = await apiClient.post<ApiResponse<any>>(`/school/library/loans/${loanId}/return`, data);
    return res.data.data;
  },

  renewBook: async (loanId: string): Promise<LibraryLoan> => {
    const res = await apiClient.post<ApiResponse<LibraryLoan>>(`/school/library/loans/${loanId}/renew`);
    return res.data.data;
  },

  waiveFine: async (fineId: string, data: { waivedAmountMinor: number; reason: string }): Promise<LibraryFine> => {
    const res = await apiClient.post<ApiResponse<LibraryFine>>(`/school/library/fines/${fineId}/waive`, data);
    return res.data.data;
  },

  getDashboardMetrics: async (): Promise<any> => {
    const res = await apiClient.get<ApiResponse<any>>('/school/library/dashboard');
    return res.data.data;
  },

  getMyLoans: async (): Promise<LibraryLoan[]> => {
    const res = await apiClient.get<ApiResponse<LibraryLoan[]>>('/school/library/student/me');
    return res.data.data;
  },

  getChildLoans: async (studentId: string): Promise<LibraryLoan[]> => {
    const res = await apiClient.get<ApiResponse<LibraryLoan[]>>(`/school/library/guardian/children/${studentId}`);
    return res.data.data;
  }
};
