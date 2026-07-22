import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const projectRoot = path.resolve(__dirname, '..')

const pages = {
  admin: {
    Dashboard: 'Admin Dashboard',
    SchoolSetup: 'School Setup Settings',
    Academics: 'Academic Classes and Sections',
    Students: 'Student Directory',
    StudentDetail: 'Student Dossier Details',
    StudentCreate: 'Student Onboarding Registration',
    Teachers: 'Teacher Directory',
    TeacherDetail: 'Teacher Profile Details',
    TeacherCreate: 'Teacher Onboarding Setup',
    Parents: 'Parent Directory',
    ParentDetail: 'Parent Profile Details',
    Attendance: 'Attendance Overview',
    Leaves: 'Student/Staff Leave Requests',
    Timetable: 'Academics Timetable Configuration',
    Exams: 'Assessment Cycle Configuration',
    Results: 'Grade results manager',
    Invoices: 'Fee Invoices Ledger',
    CollectFees: 'Receive fee payments',
    Finance: 'Finance Cash ledger',
    Payroll: 'Staff Payroll run manager',
    Transport: 'Transport Route fleets',
    Library: 'Library Book directory',
    Inventory: 'Inventory catalog lists',
    Circulars: 'Circular Alert setup',
    SMS: 'SMS notifications hub',
    Visitors: 'Gate pass logging registers',
    Reports: 'Analytical Reporting Center',
    Settings: 'General System Configurations'
  },
  teacher: {
    Dashboard: 'Teacher Dashboard',
    Classes: 'My Classes & Subject rosters',
    AttendanceMark: 'Student Attendance roll call',
    AttendanceLeaves: 'Student homeroom leave approvals',
    Homework: 'Homework dashboard',
    HomeworkCreate: 'Create homework assignment',
    HomeworkSubmissions: 'Evaluate student homework tasks',
    ExamMarks: 'Enter exam grade evaluations',
    Communication: 'Parent chat channels',
    Profile: 'Staff personal profile folder'
  },
  parent: {
    Dashboard: 'Parent Dashboard',
    ChildProfile: 'Child Profile Dossier',
    ChildAttendance: 'Child Attendance tracker calendar',
    ChildHomework: 'Child Homework planner list',
    ChildResults: 'Child Report cards',
    ChildFees: 'Outstanding Bills & Fee ledger',
    ChildTransport: 'Transport route telemetry status',
    ChildLeaves: 'Child leaves requests log',
    ChildLeavesApply: 'Submit Child leave forms',
    CommunicationChats: 'Parent-Teacher direct messaging hub',
    Documents: 'Cloudinary digital locker files'
  }
}

Object.entries(pages).forEach(([portal, list]) => {
  const dir = path.join(projectRoot, 'src', 'pages', portal)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  
  Object.entries(list).forEach(([filename, title]) => {
    const file = path.join(dir, `${filename}.jsx`)
    if (!fs.existsSync(file)) {
      const content = `import React from 'react'\n\nexport default function ${filename}() {\n  return (\n    <div className="p-6 bg-card rounded-lg border border-border shadow-sm">\n      <h1 className="text-2xl font-bold text-foreground mb-2">${title}</h1>\n      <p className="text-sm text-muted-foreground">Foundation Page for routing validation. Fully functional placeholder.</p>\n    </div>\n  )\n}\n`
      fs.writeFileSync(file, content, 'utf8')
      console.log(`Generated: ${file}`)
    }
  })
})
console.log('Page generation complete!')
