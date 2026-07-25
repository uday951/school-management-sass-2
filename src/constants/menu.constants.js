import { 
  LayoutDashboard, 
  Settings, 
  GraduationCap, 
  Users, 
  UserCheck, 
  CalendarDays, 
  CalendarClock, 
  FileSpreadsheet, 
  Receipt, 
  Wallet, 
  Coins, 
  Bus, 
  BookOpen, 
  Package, 
  Mail, 
  BookMarked,
  UserCog
} from 'lucide-react'

export const ADMIN_MENU = [
  {
    title: 'Dashboard',
    path: '/admin/dashboard',
    icon: LayoutDashboard
  },
  {
    title: 'School Setup',
    icon: Settings,
    children: [
      { title: 'Institution Info', path: '/admin/setup/institution' },
      { title: 'Campuses', path: '/admin/setup/campuses' }
    ]
  },
  {
    title: 'Academic',
    icon: GraduationCap,
    children: [
      { title: 'Class Registers', path: '/admin/academics/classes' },
      { title: 'Subjects Setup', path: '/admin/academics/subjects' }
    ]
  },
  {
    title: 'Students',
    icon: Users,
    children: [
      { title: 'Student Directory', path: '/admin/students' },
      { title: 'Admissions Onboarding', path: '/admin/students/create' }
    ]
  },
  {
    title: 'Teachers',
    icon: UserCog,
    children: [
      { title: 'Teacher Directory', path: '/admin/teachers' },
      { title: 'Onboarding Setup', path: '/admin/teachers/create' }
    ]
  },
  {
    title: 'Parents',
    path: '/admin/parents',
    icon: Users
  },
  {
    title: 'Attendance',
    icon: UserCheck,
    children: [
      { title: 'Daily Attendance', path: '/admin/attendance/roster' },
      { title: 'Leave Approvals', path: '/admin/attendance/leaves', badge: '3' }
    ]
  },
  {
    title: 'Timetable',
    icon: CalendarClock,
    children: [
      { title: 'Timetable List', path: '/admin/timetables/list' },
      { title: 'Create Timetable', path: '/admin/timetables/create' },
      { title: 'Teacher Timetable', path: '/admin/timetables/teacher' },
      { title: 'Class Timetable', path: '/admin/timetables/class' },
      { title: 'Room Allocation', path: '/admin/timetables/rooms' },
      { title: 'Period Management', path: '/admin/timetables/periods' },
      { title: 'Subject Allocation', path: '/admin/timetables/subjects' },
      { title: 'Substitute Management', path: '/admin/timetables/substitutes' }
    ]
  },
  {
    title: 'Exams & Grades',
    icon: FileSpreadsheet,
    children: [
      { title: 'Exams Setup', path: '/admin/exams/setup' },
      { title: 'Results Manager', path: '/admin/exams/results' }
    ]
  },
  {
    title: 'Fees & Billing',
    icon: Receipt,
    children: [
      { title: 'Invoices List', path: '/admin/fees/invoices' },
      { title: 'Collect Payments', path: '/admin/fees/collect' }
    ]
  },
  {
    title: 'Finance & Ledger',
    icon: Wallet,
    children: [
      { title: 'Dashboard', path: '/admin/finance/dashboard' },
      { title: 'Income', path: '/admin/finance/income' },
      { title: 'Expenses', path: '/admin/finance/expenses' },
      { title: 'Ledger Accounts', path: '/admin/finance/ledger' },
      { title: 'Transactions', path: '/admin/finance/transactions' },
      { title: 'Bank Accounts', path: '/admin/finance/bank-accounts' },
      { title: 'Cash Book', path: '/admin/finance/cash-book' },
      { title: 'Payment Vouchers', path: '/admin/finance/payment-vouchers' },
      { title: 'Receipt Vouchers', path: '/admin/finance/receipt-vouchers' },
      { title: 'Journal Entries', path: '/admin/finance/journal-entries' },
      { title: 'Financial Reports', path: '/admin/finance/reports' }
    ]
  },
  {
    title: 'Payroll System',
    path: '/admin/payroll',
    icon: Coins
  },
  {
    title: 'Transport System',
    path: '/admin/transport',
    icon: Bus
  },
  {
    title: 'Library catalog',
    icon: BookOpen,
    children: [
      { title: 'Dashboard', path: '/admin/library/dashboard' },
      { title: 'Book Categories', path: '/admin/library/categories' },
      { title: 'Books Directory', path: '/admin/library/books' },
      { title: 'Authors', path: '/admin/library/authors' },
      { title: 'Publishers', path: '/admin/library/publishers' },
      { title: 'Book Issue', path: '/admin/library/issues' },
      { title: 'Book Return', path: '/admin/library/returns' },
      { title: 'Reservations', path: '/admin/library/reservations' },
      { title: 'Fine Management', path: '/admin/library/fines' },
      { title: 'Library Members', path: '/admin/library/members' },
      { title: 'Library Reports', path: '/admin/library/reports' }
    ]
  },
  {
    title: 'Inventory store',
    icon: Package,
    children: [
      { title: 'Dashboard', path: '/admin/inventory/dashboard' },
      { title: 'Asset Categories', path: '/admin/inventory/categories' },
      { title: 'Assets Directory', path: '/admin/inventory/assets' },
      { title: 'Stock Management', path: '/admin/inventory/stock' },
      { title: 'Vendors', path: '/admin/inventory/vendors' },
      { title: 'Purchase Orders', path: '/admin/inventory/purchase-orders' },
      { title: 'Asset Allocation', path: '/admin/inventory/allocations' },
      { title: 'Maintenance Logs', path: '/admin/inventory/maintenance' },
      { title: 'Asset History', path: '/admin/inventory/history' },
      { title: 'Inventory Reports', path: '/admin/inventory/reports' }
    ]
  },
  {
    title: 'Communication',
    icon: Mail,
    children: [
      { title: 'Circular logs', path: '/admin/communication/circulars' },
      { title: 'SMS dispatchers', path: '/admin/communication/sms' }
    ]
  },
  {
    title: 'School Reports',
    path: '/admin/reports',
    icon: BookMarked
  },
  {
    title: 'Portal Settings',
    path: '/admin/settings',
    icon: Settings
  }
]

export const TEACHER_MENU = [
  {
    title: 'Dashboard',
    path: '/teacher/dashboard',
    icon: LayoutDashboard
  },
  {
    title: 'My Classes',
    path: '/teacher/classes',
    icon: GraduationCap
  },
  {
    title: 'Class Attendance',
    icon: UserCheck,
    children: [
      { title: 'Roster Roll call', path: '/teacher/attendance/mark' },
      { title: 'Student leaves', path: '/teacher/attendance/leaves', badge: 'Pending' }
    ]
  },
  {
    title: 'Homework',
    icon: BookMarked,
    children: [
      { title: 'Homework Logs', path: '/teacher/homework' },
      { title: 'Assign Tasks', path: '/teacher/homework/create' }
    ]
  },
  {
    title: 'Grades Entry',
    path: '/teacher/exams/marks',
    icon: FileSpreadsheet
  },
  {
    title: 'Parent Chats',
    path: '/teacher/communication',
    icon: Mail
  },
  {
    title: 'My Personal File',
    path: '/teacher/profile',
    icon: UserCog
  }
]

export const PARENT_MENU = [
  {
    title: 'Dashboard',
    path: '/parent/dashboard',
    icon: LayoutDashboard
  },
  {
    title: 'Child Records',
    icon: Users,
    children: [
      { title: 'Profile details', path: '/parent/child/1/profile' },
      { title: 'Attendance logs', path: '/parent/child/1/attendance' },
      { title: 'Daily homework', path: '/parent/child/1/homework' },
      { title: 'Term Results', path: '/parent/child/1/results' }
    ]
  },
  {
    title: 'Fee Center',
    icon: Receipt,
    children: [
      { title: 'Bills & Ledger', path: '/parent/child/1/fees' }
    ]
  },
  {
    title: 'Transit details',
    path: '/parent/child/1/transport',
    icon: Bus
  },
  {
    title: 'Leave Approvals',
    path: '/parent/child/1/leaves',
    icon: CalendarDays
  },
  {
    title: 'Teacher messages',
    path: '/parent/communication/chats',
    icon: Mail
  },
  {
    title: 'School documents',
    path: '/parent/documents',
    icon: BookOpen
  }
]
