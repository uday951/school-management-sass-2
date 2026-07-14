import React from 'react';
import { NavLink, useNavigate, Outlet, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  School,
  ClipboardList,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Calendar,
  Building,
  Layers,
  Settings,
  ShieldCheck,
  CheckSquare,
  BookOpen,
  Users,
  NotebookPen,
  FileUp,
  Link,
  UserCheck,
  RefreshCw,
  Award,
  Coins,
  Megaphone,
  BookMarked,
  Truck,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { PageLoader } from '@/components/LoadingSpinner';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Breadcrumbs } from './Breadcrumbs';
import { getInitials } from '@/lib/utils';

const schoolNavItems = [
  {
    label: 'Dashboard',
    to: '/school/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Students',
    to: '/school/students',
    icon: GraduationCap,
  },
  {
    label: 'Guardians',
    to: '/school/guardians',
    icon: User,
  },
  {
    label: 'Employees',
    to: '/school/employees',
    icon: Users,
  },
  {
    label: 'Setup Checklist',
    to: '/school/setup',
    icon: CheckSquare,
  },
  {
    label: 'School Profile',
    to: '/school/profile',
    icon: School,
  },
  {
    label: 'Academic Years',
    to: '/school/academic-years',
    icon: Calendar,
  },
  {
    label: 'Departments',
    to: '/school/departments',
    icon: Building,
  },
  {
    label: 'Classes & Sections',
    to: '/school/classes',
    icon: Layers,
  },
  {
    label: 'Subjects & Mapping',
    to: '/school/subjects',
    icon: BookOpen,
  },
  {
    label: 'Teacher Assignments',
    to: '/school/assignments',
    icon: NotebookPen,
  },
  {
    label: 'Class Teachers',
    to: '/school/class-teachers',
    icon: Users,
  },
  {
    label: 'Attendance',
    to: '/school/attendance',
    icon: CheckSquare,
  },
  {
    label: 'Attendance Reports',
    to: '/school/attendance/reports',
    icon: ClipboardList,
  },
  {
    label: 'Bulk Imports',
    to: '/school/onboarding/imports',
    icon: FileUp,
  },
  {
    label: 'Registration Links',
    to: '/school/onboarding/invites',
    icon: Link,
  },
  {
    label: 'Approval Queues',
    to: '/school/onboarding/approval-queue',
    icon: UserCheck,
  },
  {
    label: 'Roles & Permissions',
    to: '/school/roles',
    icon: ShieldCheck,
  },
  {
    label: 'Audit Activity',
    to: '/school/audit-logs',
    icon: ClipboardList,
  },
  {
    label: 'Timetable Dashboard',
    to: '/school/timetable',
    icon: Calendar,
  },
  {
    label: 'Substitutions',
    to: '/school/timetable/substitutions',
    icon: RefreshCw,
  },
  {
    label: 'Exams & Results',
    to: '/school/exams',
    icon: Award,
  },
  {
    label: 'Finance',
    to: '/school/finance',
    icon: Coins,
  },
  {
    label: 'Staff Operations',
    to: '/school/staff-attendance',
    icon: Users,
  },
  {
    label: 'My Staff Portal',
    to: '/school/staff-portal',
    icon: UserCheck,
  },
  {
    label: 'Notice Board',
    to: '/school/notice-board',
    icon: Megaphone,
  },
  {
    label: 'Learning Workspace',
    to: '/school/learning-workspace',
    icon: BookOpen,
  },
  {
    label: 'Library Workspace',
    to: '/school/library',
    icon: BookMarked,
  },
  {
    label: 'Transport Workspace',
    to: '/school/transport',
    icon: Truck,
  },
  {
    label: 'School Calendar',
    to: '/school/calendar',
    icon: Calendar,
  },
  {
    label: 'Visitor & Gate',
    to: '/school/gate',
    icon: ShieldCheck,
  },
];

export function SchoolLayout() {
  const { user, logout, isLoading, isAuthenticated } = useAuth();
  const [collapsed, setCollapsed] = React.useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      toast.success('Logged out successfully');
    } catch {
      toast.error('Logout failed');
    }
  };

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Enforce school admin check
  if (user && user.userType !== 'SCHOOL_ADMIN') {
    return <div className="p-6 text-center text-destructive">Unauthorized: School Admin permissions required.</div>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          'flex h-full flex-col border-r bg-sidebar transition-all duration-300 relative shrink-0',
          collapsed ? 'w-16' : 'w-64',
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            'flex h-16 items-center border-b border-sidebar-border px-4',
            collapsed ? 'justify-center' : 'gap-3',
          )}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-sidebar-foreground">
                SchoolSaaS
              </p>
              <p className="truncate text-xs text-sidebar-foreground/60">
                School Workspace
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {schoolNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-150',
                    'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                    isActive &&
                      'bg-sidebar-accent text-sidebar-primary shadow-sm',
                    collapsed && 'justify-center px-2',
                  )
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* User Info + Logout */}
        <div className="border-t border-sidebar-border p-3">
          {!collapsed && user && (
            <div className="mb-2 rounded-md bg-sidebar-accent/50 p-2">
              <p className="truncate text-xs font-medium text-sidebar-foreground">
                {user.firstName} {user.lastName}
              </p>
              <p className="truncate text-xs text-sidebar-foreground/60">
                {user.email}
              </p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'w-full gap-2 text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive',
              collapsed && 'justify-center px-0',
            )}
            onClick={handleLogout}
            title={collapsed ? 'Logout' : undefined}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && 'Logout'}
          </Button>
        </div>

        {/* Collapse Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-3 top-20 h-6 w-6 rounded-full border bg-background shadow-md hover:bg-accent z-10"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </Button>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* TopNav */}
        <header className="flex h-16 items-center justify-between border-b bg-background/80 px-6 backdrop-blur">
          <Breadcrumbs />
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary sm:block">
              School Workspace
            </span>
            {user && (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {getInitials(user.firstName, user.lastName)}
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
