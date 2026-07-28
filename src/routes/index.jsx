import React, { Suspense, lazy } from 'react'
import { Navigate, useRoutes } from 'react-router-dom'
import { AuthGuard } from '@/middlewares/AuthGuard'
import { RoleGuard } from '@/middlewares/RoleGuard'
import { TenantGuard } from '@/middlewares/TenantGuard'
import GlobalLoader from '@/components/shared/loaders/GlobalLoader'

// Layouts
const AdminLayout = lazy(() => import('@/layouts/AdminLayout'))
const TeacherLayout = lazy(() => import('@/layouts/TeacherLayout'))
const ParentLayout = lazy(() => import('@/layouts/ParentLayout'))
const AuthLayout = lazy(() => import('@/layouts/AuthLayout'))
const ErrorLayout = lazy(() => import('@/layouts/ErrorLayout'))

// Landing & Auth Pages
const LandingPage = lazy(() => import('@/pages/LandingPage'))
const Login = lazy(() => import('@/pages/auth/Login'))
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'))
const ResetPassword = lazy(() => import('@/pages/auth/ResetPassword'))

// Admin Pages
const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'))
const SchoolSetup = lazy(() => import('@/pages/admin/SchoolSetup'))
const Academics = lazy(() => import('@/pages/admin/Academics'))
const Students = lazy(() => import('@/pages/admin/Students'))
const StudentDetail = lazy(() => import('@/pages/admin/StudentDetail'))
const StudentCreate = lazy(() => import('@/pages/admin/StudentCreate'))
const Teachers = lazy(() => import('@/pages/admin/Teachers'))
const TeacherDetail = lazy(() => import('@/pages/admin/TeacherDetail'))
const TeacherCreate = lazy(() => import('@/pages/admin/TeacherCreate'))
const Parents = lazy(() => import('@/pages/admin/Parents'))
const ParentDetail = lazy(() => import('@/pages/admin/ParentDetail'))
const Attendance = lazy(() => import('@/pages/admin/Attendance'))
const Leaves = lazy(() => import('@/pages/admin/Leaves'))
const Timetable = lazy(() => import('@/pages/admin/Timetable'))
const Exams = lazy(() => import('@/pages/admin/Exams'))
const Results = lazy(() => import('@/pages/admin/Results'))
const Invoices = lazy(() => import('@/pages/admin/Invoices'))
const CollectFees = lazy(() => import('@/pages/admin/CollectFees'))
const Finance = lazy(() => import('@/pages/admin/Finance'))
const Payroll = lazy(() => import('@/pages/admin/Payroll'))
const Transport = lazy(() => import('@/pages/admin/Transport'))
const Library = lazy(() => import('@/pages/admin/Library'))
const Inventory = lazy(() => import('@/pages/admin/Inventory'))
const AdminCommunication = lazy(() => import('@/pages/admin/Communication'))
const Visitors = lazy(() => import('@/pages/admin/Visitors'))
const Reports = lazy(() => import('@/pages/admin/Reports'))
const Settings = lazy(() => import('@/pages/admin/Settings'))

// Teacher Pages
const TeacherDashboard = lazy(() => import('@/pages/teacher/Dashboard'))
const Classes = lazy(() => import('@/pages/teacher/Classes'))
const AttendanceMark = lazy(() => import('@/pages/teacher/AttendanceMark'))
const AttendanceLeaves = lazy(() => import('@/pages/teacher/AttendanceLeaves'))
const Homework = lazy(() => import('@/pages/teacher/Homework'))
const HomeworkCreate = lazy(() => import('@/pages/teacher/HomeworkCreate'))
const HomeworkSubmissions = lazy(() => import('@/pages/teacher/HomeworkSubmissions'))
const ExamMarks = lazy(() => import('@/pages/teacher/ExamMarks'))
const Communication = lazy(() => import('@/pages/teacher/Communication'))
const Profile = lazy(() => import('@/pages/teacher/Profile'))
const StudentMessages = lazy(() => import('@/pages/teacher/StudentMessages'))
const TeacherAnnouncements = lazy(() => import('@/pages/teacher/Announcements'))
const TeacherLeaves = lazy(() => import('@/pages/teacher/LeaveManagement'))
const TeacherPayslips = lazy(() => import('@/pages/teacher/Payslips'))
const TeacherDocuments = lazy(() => import('@/pages/teacher/Documents'))
const TeacherReports = lazy(() => import('@/pages/teacher/Reports'))
const TeacherSettings = lazy(() => import('@/pages/teacher/Settings'))

// Parent Pages
const ParentDashboard = lazy(() => import('@/pages/parent/Dashboard'))
const ChildProfile = lazy(() => import('@/pages/parent/ChildProfile'))
const ChildAttendance = lazy(() => import('@/pages/parent/ChildAttendance'))
const ChildHomework = lazy(() => import('@/pages/parent/ChildHomework'))
const ChildResults = lazy(() => import('@/pages/parent/ChildResults'))
const ChildFees = lazy(() => import('@/pages/parent/ChildFees'))
const ChildTransport = lazy(() => import('@/pages/parent/ChildTransport'))
const ChildLeaves = lazy(() => import('@/pages/parent/ChildLeaves'))
const ChildLeavesApply = lazy(() => import('@/pages/parent/ChildLeavesApply'))
const CommunicationChats = lazy(() => import('@/pages/parent/CommunicationChats'))
const Documents = lazy(() => import('@/pages/parent/Documents'))
const ChildLibrary = lazy(() => import('@/pages/parent/ChildLibrary'))
const ParentSettings = lazy(() => import('@/pages/parent/Settings'))


// Error Pages
const ErrorPage = lazy(() => import('@/pages/ErrorPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))
const UnauthorizedPage = lazy(() => import('@/pages/UnauthorizedPage'))

export default function AppRoutes() {
  return (
    <Suspense fallback={<GlobalLoader />}>
      {useRoutes([
        // Tenant Subdomain Wrapper
        {
          element: <TenantGuard />,
          children: [
            // Public Routes
            {
              path: '/',
              element: <LandingPage />
            },
            {
              element: <AuthLayout />,
              children: [
                { path: 'login', element: <Login /> },
                { path: 'forgot-password', element: <ForgotPassword /> },
                { path: 'reset-password/:token', element: <ResetPassword /> }
              ]
            },

            // Protected Admin Portal
            {
              element: <AuthGuard />,
              children: [
                {
                  element: <RoleGuard allowedRoles={['school_admin', 'super_admin']} />,
                  children: [
                    {
                      path: 'admin',
                      element: <AdminLayout />,
                      children: [
                        { path: '', element: <Navigate to="/admin/dashboard" replace /> },
                        { path: 'dashboard', element: <AdminDashboard /> },
                        { path: 'setup/institution', element: <SchoolSetup /> },
                        { path: 'setup/campuses', element: <SchoolSetup /> },
                        { path: 'academics/classes', element: <Academics /> },
                        { path: 'academics/subjects', element: <Academics /> },
                        { path: 'students', element: <Students /> },
                        { path: 'students/create', element: <StudentCreate /> },
                        { path: 'students/:id', element: <StudentDetail /> },
                        { path: 'teachers', element: <Teachers /> },
                        { path: 'teachers/create', element: <TeacherCreate /> },
                        { path: 'teachers/:id', element: <TeacherDetail /> },
                        { path: 'parents', element: <Parents /> },
                        { path: 'parents/:id', element: <ParentDetail /> },
                        { path: 'attendance', element: <Navigate to="/admin/attendance/roster" replace /> },
                        { path: 'attendance/roster', element: <Attendance /> },
                        { path: 'attendance/leaves', element: <Leaves /> },
                        { path: 'timetables', element: <Timetable /> },
                        { path: 'timetables/*', element: <Timetable /> },
                        { path: 'exams/setup', element: <Exams /> },
                        { path: 'exams/results', element: <Results /> },
                        { path: 'fees/invoices', element: <Invoices /> },
                        { path: 'fees/collect', element: <CollectFees /> },
                        { path: 'finance/ledger', element: <Finance /> },
                        { path: 'finance/*', element: <Finance /> },
                        { path: 'payroll', element: <Payroll /> },
                        { path: 'transport', element: <Transport /> },
                        { path: 'library', element: <Library /> },
                        { path: 'library/*', element: <Library /> },
                        { path: 'inventory', element: <Inventory /> },
                        { path: 'inventory/*', element: <Inventory /> },
                        { path: 'communication/circulars', element: <AdminCommunication defaultTab="notices" /> },
                        { path: 'communication/sms', element: <AdminCommunication defaultTab="dashboard" /> },
                        { path: 'visitors', element: <Visitors /> },
                        { path: 'reports', element: <Reports /> },
                        { path: 'settings', element: <Settings /> }
                      ]
                    }
                  ]
                }
              ]
            },

            // Protected Teacher Portal
            {
              element: <AuthGuard />,
              children: [
                {
                  element: <RoleGuard allowedRoles={['teacher']} />,
                  children: [
                    {
                      path: 'teacher',
                      element: <TeacherLayout />,
                      children: [
                        { path: '', element: <Navigate to="/teacher/dashboard" replace /> },
                        { path: 'dashboard', element: <TeacherDashboard /> },
                        { path: 'classes', element: <Classes /> },
                        { path: 'attendance/mark', element: <AttendanceMark /> },
                        { path: 'attendance/leaves', element: <AttendanceLeaves /> },
                        { path: 'homework', element: <Homework /> },
                        { path: 'homework/create', element: <HomeworkCreate /> },
                        { path: 'homework/:id', element: <HomeworkSubmissions /> },
                        { path: 'exams/marks', element: <ExamMarks /> },
                        { path: 'communication', element: <Communication /> },
                        { path: 'profile', element: <Profile /> },
                        { path: 'messages', element: <StudentMessages /> },
                        { path: 'announcements', element: <TeacherAnnouncements /> },
                        { path: 'leaves', element: <TeacherLeaves /> },
                        { path: 'payslips', element: <TeacherPayslips /> },
                        { path: 'documents', element: <TeacherDocuments /> },
                        { path: 'reports', element: <TeacherReports /> },
                        { path: 'settings', element: <TeacherSettings /> }
                      ]
                    }
                  ]
                }
              ]
            },

            // Protected Parent Portal
            {
              element: <AuthGuard />,
              children: [
                {
                  element: <RoleGuard allowedRoles={['parent']} />,
                  children: [
                    {
                      path: 'parent',
                      element: <ParentLayout />,
                      children: [
                        { path: '', element: <Navigate to="/parent/dashboard" replace /> },
                        { path: 'dashboard', element: <ParentDashboard /> },
                        { path: 'child-profile', element: <ChildProfile /> },
                        { path: 'child/:id/profile', element: <ChildProfile /> },
                        { path: 'attendance', element: <ChildAttendance /> },
                        { path: 'child/:id/attendance', element: <ChildAttendance /> },
                        { path: 'homework', element: <ChildHomework /> },
                        { path: 'child/:id/homework', element: <ChildHomework /> },
                        { path: 'results', element: <ChildResults /> },
                        { path: 'child/:id/results', element: <ChildResults /> },
                        { path: 'fees', element: <ChildFees /> },
                        { path: 'child/:id/fees', element: <ChildFees /> },
                        { path: 'transport', element: <ChildTransport /> },
                        { path: 'child/:id/transport', element: <ChildTransport /> },
                        { path: 'leaves', element: <ChildLeaves /> },
                        { path: 'child/:id/leaves', element: <ChildLeaves /> },
                        { path: 'leaves/apply', element: <ChildLeavesApply /> },
                        { path: 'child/:id/leaves/apply', element: <ChildLeavesApply /> },
                        { path: 'child/:id/library', element: <ChildLibrary /> },
                        { path: 'communication/chats', element: <CommunicationChats /> },
                        { path: 'documents', element: <Documents /> },
                        { path: 'settings', element: <ParentSettings /> }
                      ]
                    }
                  ]
                }
              ]
            },

            // Error Pages
            {
              element: <ErrorLayout />,
              children: [
                { path: 'unauthorized', element: <UnauthorizedPage /> },
                { path: '500', element: <ErrorPage /> }
              ]
            },
            
            // 404 Fallback
            { path: '*', element: <NotFoundPage /> }
          ]
        }
      ])}
    </Suspense>
  )
}
