import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { SchoolLayout } from './components/layout/SchoolLayout';

// Pages - Platform Super Admin
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SchoolsPage from './pages/SchoolsPage';
import AddSchoolPage from './pages/AddSchoolPage';
import SchoolDetailPage from './pages/SchoolDetailPage';
import EditSchoolPage from './pages/EditSchoolPage';
import AuditLogsPage from './pages/AuditLogsPage';
import ProfilePage from './pages/ProfilePage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import NotFoundPage from './pages/NotFoundPage';

// Pages - School Workspace
import SchoolDashboardPage from './pages/school/DashboardPage';
import SetupChecklistPage from './pages/school/SetupChecklistPage';
import SchoolProfilePage from './pages/school/ProfilePage';
import AcademicYearsPage from './pages/school/AcademicYearsPage';
import DepartmentsPage from './pages/school/DepartmentsPage';
import ClassesPage from './pages/school/ClassesPage';
import SubjectsPage from './pages/school/SubjectsPage';
import RolesPage from './pages/school/RolesPage';
import SchoolAuditLogsPage from './pages/school/AuditLogsPage';

// Pages - School Workspace - Students & Guardians
import StudentsPage from './pages/school/students/StudentsPage';
import AddStudentPage from './pages/school/students/AddStudentPage';
import StudentDetailPage from './pages/school/students/StudentDetailPage';
import EditStudentPage from './pages/school/students/EditStudentPage';
import GuardiansPage from './pages/school/guardians/GuardiansPage';
import GuardianDetailPage from './pages/school/guardians/GuardianDetailPage';

// Pages - School Workspace - Employees & Academic Assignments
import EmployeesPage from './pages/school/employees/EmployeesPage';
import AddEmployeePage from './pages/school/employees/AddEmployeePage';
import EmployeeDetailPage from './pages/school/employees/EmployeeDetailPage';
import TeacherAssignmentsPage from './pages/school/assignments/TeacherAssignmentsPage';
import ClassTeachersPage from './pages/school/assignments/ClassTeachersPage';

// Pages - Onboarding & Public Invites
import ResolveInvitePage from './pages/public/ResolveInvitePage';
import StudentRegisterPage from './pages/public/StudentRegisterPage';
import SubmittedPage from './pages/public/SubmittedPage';

// Pages - School Workspace - Onboarding Admin
import ImportsPage from './pages/school/onboarding/ImportsPage';
import ImportDetailsPage from './pages/school/onboarding/ImportDetailsPage';
import InvitesPage from './pages/school/onboarding/InvitesPage';
import ApprovalQueuePage from './pages/school/onboarding/ApprovalQueuePage';

// Pages - Portals
import StudentDashboardPage from './pages/student/StudentDashboardPage';
import GuardianDashboardPage from './pages/guardian/GuardianDashboardPage';

// Pages - School Workspace - Attendance
import AttendanceDashboardPage from './pages/school/attendance/AttendanceDashboardPage';
import AttendanceMonitorPage from './pages/school/attendance/AttendanceMonitorPage';
import MarkAttendancePage from './pages/school/attendance/MarkAttendancePage';
import CorrectionsPage from './pages/school/attendance/CorrectionsPage';
import AttendanceReportsPage from './pages/school/attendance/AttendanceReportsPage';
import AttendanceSettingsPage from './pages/school/attendance/AttendanceSettingsPage';

// Portal Extensions - Attendance
import StudentAttendancePage from './pages/student/StudentAttendancePage';
import GuardianChildAttendancePage from './pages/guardian/GuardianChildAttendancePage';

// Pages - School Workspace - Timetable
import TimetableDashboardPage from './pages/school/timetable/TimetableDashboardPage';
import WorkingDaysPage from './pages/school/timetable/WorkingDaysPage';
import BellSchedulesPage from './pages/school/timetable/BellSchedulesPage';
import RoomsPage from './pages/school/timetable/RoomsPage';
import TeacherAvailabilityPage from './pages/school/timetable/TeacherAvailabilityPage';
import TimetablesListPage from './pages/school/timetable/TimetablesListPage';
import TimetableBuilderPage from './pages/school/timetable/TimetableBuilderPage';
import SubstitutionsPage from './pages/school/timetable/SubstitutionsPage';
import OverridesPage from './pages/school/timetable/OverridesPage';

// Portal Extensions - Timetable
import TeacherSchedulePage from './pages/school/timetable/TeacherSchedulePage';
import StudentTimetablePage from './pages/school/timetable/StudentTimetablePage';
import GuardianChildTimetablePage from './pages/school/timetable/GuardianChildTimetablePage';

// Phase 8 Exams & Results Imports
import ExamsDashboardPage from './pages/school/exams/ExamsDashboardPage';
import TeacherMarksEntryPage from './pages/school/exams/TeacherMarksEntryPage';
import ReportCardPreviewPage from './pages/school/exams/ReportCardPreviewPage';
import StudentResultsPage from './pages/student/StudentResultsPage';
import GuardianChildResultsPage from './pages/guardian/GuardianChildResultsPage';

// Phase 9 Fees & Finance Imports
import FinanceDashboardPage from './pages/school/finance/FinanceDashboardPage';
import FeeCategoriesPage from './pages/school/finance/FeeCategoriesPage';
import FeeComponentsPage from './pages/school/finance/FeeComponentsPage';
import FeeStructuresPage from './pages/school/finance/FeeStructuresPage';
import FeeStructureDetailPage from './pages/school/finance/FeeStructureDetailPage';
import FeeAssignmentsPage from './pages/school/finance/FeeAssignmentsPage';
import StudentFeeAccountPage from './pages/school/finance/StudentFeeAccountPage';
import ConcessionSchemesPage from './pages/school/finance/ConcessionSchemesPage';
import PaymentsPage from './pages/school/finance/PaymentsPage';
import RefundsPage from './pages/school/finance/RefundsPage';
import ReportsPage from './pages/school/finance/ReportsPage';
import FinanceSettingsPage from './pages/school/finance/FinanceSettingsPage';
import StudentFeesPage from './pages/student/StudentFeesPage';
import GuardianChildFeesPage from './pages/guardian/GuardianChildFeesPage';

// Phase 10 Staff, Communication, Learning Imports
import StaffOperationsPage from './pages/school/staff/StaffOperationsPage';
import MyStaffPortalPage from './pages/school/staff/MyStaffPortalPage';
import CommunicationDashboardPage from './pages/school/communication/CommunicationDashboardPage';
import LearningWorkspacePage from './pages/school/learning/LearningWorkspacePage';

// Phase 11 Library, Transport, Calendar, Visitor Imports
import LibraryPage from './pages/school/library/LibraryPage';
import TransportPage from './pages/school/transport/TransportPage';
import CalendarPage from './pages/school/calendar/CalendarPage';
import GatePage from './pages/school/gate/GatePage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/join',
    element: <ResolveInvitePage />,
  },
  {
    path: '/join/:token',
    element: <ResolveInvitePage />,
  },
  {
    path: '/join/student/:token',
    element: <StudentRegisterPage />,
  },
  {
    path: '/join/submitted',
    element: <SubmittedPage />,
  },
  {
    path: '/student',
    element: <StudentDashboardPage />,
  },
  {
    path: '/student/attendance',
    element: <StudentAttendancePage />,
  },
  {
    path: '/student/timetable',
    element: <StudentTimetablePage />,
  },
  {
    path: '/student/results',
    element: <StudentResultsPage />,
  },
  {
    path: '/student/fees',
    element: <StudentFeesPage />,
  },
  {
    path: '/guardian',
    element: <GuardianDashboardPage />,
  },
  {
    path: '/guardian/children/:studentId/attendance',
    element: <GuardianChildAttendancePage />,
  },
  {
    path: '/guardian/children/:studentId/timetable',
    element: <GuardianChildTimetablePage />,
  },
  {
    path: '/guardian/children/:studentId/results',
    element: <GuardianChildResultsPage />,
  },
  {
    path: '/guardian/fees',
    element: <GuardianChildFeesPage />,
  },
  {
    path: '/guardian/children/:studentId/fees',
    element: <GuardianChildFeesPage />,
  },
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />,
  },
  {
    element: <AppLayout />,
    children: [
      {
        path: '/',
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: '/dashboard',
        element: <DashboardPage />,
        handle: { breadcrumb: 'Dashboard' },
      },
      {
        path: '/schools',
        element: <SchoolsPage />,
        handle: { breadcrumb: 'Schools' },
      },
      {
        path: '/schools/new',
        element: <AddSchoolPage />,
        handle: { breadcrumb: () => 'Onboard School' },
      },
      {
        path: '/schools/:id',
        element: <SchoolDetailPage />,
        handle: { breadcrumb: () => 'School Details' },
      },
      {
        path: '/schools/:id/edit',
        element: <EditSchoolPage />,
        handle: { breadcrumb: () => 'Edit School' },
      },
      {
        path: '/audit-logs',
        element: <AuditLogsPage />,
        handle: { breadcrumb: 'Audit Logs' },
      },
      {
        path: '/profile',
        element: <ProfilePage />,
        handle: { breadcrumb: 'Profile' },
      },
    ],
  },
  {
    element: <SchoolLayout />,
    children: [
      {
        path: '/school',
        element: <Navigate to="/school/dashboard" replace />,
      },
      {
        path: '/school/dashboard',
        element: <SchoolDashboardPage />,
        handle: { breadcrumb: 'Dashboard' },
      },
      {
        path: '/school/setup',
        element: <SetupChecklistPage />,
        handle: { breadcrumb: 'Setup Checklist' },
      },
      {
        path: '/school/profile',
        element: <SchoolProfilePage />,
        handle: { breadcrumb: 'School Profile' },
      },
      {
        path: '/school/academic-years',
        element: <AcademicYearsPage />,
        handle: { breadcrumb: 'Academic Years' },
      },
      {
        path: '/school/departments',
        element: <DepartmentsPage />,
        handle: { breadcrumb: 'Departments' },
      },
      {
        path: '/school/classes',
        element: <ClassesPage />,
        handle: { breadcrumb: 'Classes & Sections' },
      },
      {
        path: '/school/subjects',
        element: <SubjectsPage />,
        handle: { breadcrumb: 'Subjects & Mapping' },
      },
      {
        path: '/school/roles',
        element: <RolesPage />,
        handle: { breadcrumb: 'Roles & Permissions' },
      },
      {
        path: '/school/audit-logs',
        element: <SchoolAuditLogsPage />,
        handle: { breadcrumb: 'Audit Activity' },
      },
      {
        path: '/school/students',
        element: <StudentsPage />,
        handle: { breadcrumb: 'Students' },
      },
      {
        path: '/school/students/new',
        element: <AddStudentPage />,
        handle: { breadcrumb: () => 'Onboard Student' },
      },
      {
        path: '/school/students/:id',
        element: <StudentDetailPage />,
        handle: { breadcrumb: () => 'Student Profile' },
      },
      {
        path: '/school/students/:id/edit',
        element: <EditStudentPage />,
        handle: { breadcrumb: () => 'Edit Profile' },
      },
      {
        path: '/school/guardians',
        element: <GuardiansPage />,
        handle: { breadcrumb: 'Guardians' },
      },
      {
        path: '/school/guardians/:id',
        element: <GuardianDetailPage />,
        handle: { breadcrumb: () => 'Guardian Profile' },
      },
      {
        path: '/school/employees',
        element: <EmployeesPage />,
        handle: { breadcrumb: 'Employees' },
      },
      {
        path: '/school/employees/new',
        element: <AddEmployeePage />,
        handle: { breadcrumb: () => 'Onboard Employee' },
      },
      {
        path: '/school/employees/:id',
        element: <EmployeeDetailPage />,
        handle: { breadcrumb: () => 'Employee Profile' },
      },
      {
        path: '/school/assignments',
        element: <TeacherAssignmentsPage />,
        handle: { breadcrumb: 'Teacher Assignments' },
      },
      {
        path: '/school/class-teachers',
        element: <ClassTeachersPage />,
        handle: { breadcrumb: 'Class Teachers' },
      },
      {
        path: '/school/onboarding/imports',
        element: <ImportsPage />,
        handle: { breadcrumb: 'Bulk Imports' },
      },
      {
        path: '/school/onboarding/imports/:id',
        element: <ImportDetailsPage />,
        handle: { breadcrumb: 'Import Details' },
      },
      {
        path: '/school/onboarding/invites',
        element: <InvitesPage />,
        handle: { breadcrumb: 'Registration Links' },
      },
      {
        path: '/school/onboarding/approval-queue',
        element: <ApprovalQueuePage />,
        handle: { breadcrumb: 'Approval Queues' },
      },
      {
        path: '/school/attendance',
        element: <AttendanceDashboardPage />,
        handle: { breadcrumb: 'Attendance Dashboard' },
      },
      {
        path: '/school/attendance/monitor',
        element: <AttendanceMonitorPage />,
        handle: { breadcrumb: 'Daily Monitor' },
      },
      {
        path: '/school/attendance/mark',
        element: <MarkAttendancePage />,
        handle: { breadcrumb: 'Mark Attendance' },
      },
      {
        path: '/school/attendance/corrections',
        element: <CorrectionsPage />,
        handle: { breadcrumb: 'Corrections Queue' },
      },
      {
        path: '/school/attendance/reports',
        element: <AttendanceReportsPage />,
        handle: { breadcrumb: 'Attendance Reports' },
      },
      {
        path: '/school/attendance/settings',
        element: <AttendanceSettingsPage />,
        handle: { breadcrumb: 'Attendance Settings' },
      },
      {
        path: '/school/timetable',
        element: <TimetableDashboardPage />,
        handle: { breadcrumb: 'Timetable Dashboard' },
      },
      {
        path: '/school/timetable/working-days',
        element: <WorkingDaysPage />,
        handle: { breadcrumb: 'Working Days' },
      },
      {
        path: '/school/timetable/bell-schedules',
        element: <BellSchedulesPage />,
        handle: { breadcrumb: 'Bell Schedules' },
      },
      {
        path: '/school/timetable/rooms',
        element: <RoomsPage />,
        handle: { breadcrumb: 'Physical Rooms' },
      },
      {
        path: '/school/timetable/availability',
        element: <TeacherAvailabilityPage />,
        handle: { breadcrumb: 'Teacher Availability' },
      },
      {
        path: '/school/timetable/list',
        element: <TimetablesListPage />,
        handle: { breadcrumb: 'Timetables List' },
      },
      {
        path: '/school/timetable/builder/:id',
        element: <TimetableBuilderPage />,
        handle: { breadcrumb: 'Weekly Builder' },
      },
      {
        path: '/school/timetable/substitutions',
        element: <SubstitutionsPage />,
        handle: { breadcrumb: 'Substitutions' },
      },
      {
        path: '/school/timetable/overrides',
        element: <OverridesPage />,
        handle: { breadcrumb: 'Schedule Overrides' },
      },
      {
        path: '/school/teacher/schedule',
        element: <TeacherSchedulePage />,
        handle: { breadcrumb: 'My Teaching Schedule' },
      },
      {
        path: '/school/exams',
        element: <ExamsDashboardPage />,
        handle: { breadcrumb: 'Exams Dashboard' },
      },
      {
        path: '/school/exams/marks-entry',
        element: <TeacherMarksEntryPage />,
        handle: { breadcrumb: 'Teacher Marks Entry' },
      },
      {
        path: '/school/exams/report-card-preview/:examId/:studentId/:templateId',
        element: <ReportCardPreviewPage />,
        handle: { breadcrumb: 'Print Report Card' },
      },
      {
        path: '/school/finance',
        element: <FinanceDashboardPage />,
        handle: { breadcrumb: 'Finance Dashboard' },
      },
      {
        path: '/school/finance/categories',
        element: <FeeCategoriesPage />,
        handle: { breadcrumb: 'Fee Categories' },
      },
      {
        path: '/school/finance/components',
        element: <FeeComponentsPage />,
        handle: { breadcrumb: 'Fee Components' },
      },
      {
        path: '/school/finance/structures',
        element: <FeeStructuresPage />,
        handle: { breadcrumb: 'Fee Structures' },
      },
      {
        path: '/school/fees/structures/:id',
        element: <FeeStructureDetailPage />,
        handle: { breadcrumb: 'Fee Structure Detail' },
      },
      {
        path: '/school/finance/assignments',
        element: <FeeAssignmentsPage />,
        handle: { breadcrumb: 'Fee Assignments' },
      },
      {
        path: '/school/finance/ledger',
        element: <StudentFeeAccountPage />,
        handle: { breadcrumb: 'Student Fee Ledger' },
      },
      {
        path: '/school/finance/concessions',
        element: <ConcessionSchemesPage />,
        handle: { breadcrumb: 'Concessions & Scholarships' },
      },
      {
        path: '/school/payments',
        element: <PaymentsPage />,
        handle: { breadcrumb: 'Payments Desk' },
      },
      {
        path: '/school/refunds',
        element: <RefundsPage />,
        handle: { breadcrumb: 'Refunds Desk' },
      },
      {
        path: '/school/finance/reports',
        element: <ReportsPage />,
        handle: { breadcrumb: 'Finance Reports' },
      },
      {
        path: '/school/finance/settings',
        element: <FinanceSettingsPage />,
        handle: { breadcrumb: 'Finance Settings' },
      },
      {
        path: '/school/staff-attendance',
        element: <StaffOperationsPage />,
        handle: { breadcrumb: 'Staff Attendance' },
      },
      {
        path: '/school/staff-portal',
        element: <MyStaffPortalPage />,
        handle: { breadcrumb: 'Staff Portal' },
      },
      {
        path: '/school/notice-board',
        element: <CommunicationDashboardPage />,
        handle: { breadcrumb: 'Notices Board' },
      },
      {
        path: '/school/learning-workspace',
        element: <LearningWorkspacePage />,
        handle: { breadcrumb: 'Learning Workspace' },
      },
      {
        path: '/school/library',
        element: <LibraryPage />,
        handle: { breadcrumb: 'Library Workspace' },
      },
      {
        path: '/school/transport',
        element: <TransportPage />,
        handle: { breadcrumb: 'Transport Workspace' },
      },
      {
        path: '/school/calendar',
        element: <CalendarPage />,
        handle: { breadcrumb: 'School Calendar' },
      },
      {
        path: '/school/gate',
        element: <GatePage />,
        handle: { breadcrumb: 'Gate & Visitor desk' },
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster position="top-right" theme="dark" closeButton />
      </AuthProvider>
    </QueryClientProvider>
  );
}
