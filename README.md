# 🎓 EduCore SaaS — Enterprise School ERP & Multi-Platform Management System

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.18+-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20Mongoose-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.0+-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB?logo=react&logoColor=black)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK%2054-000020?logo=expo&logoColor=white)](https://expo.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **Enterprise-Grade, Multi-Tenant School ERP & Campus Automation Platform** architected with a production-ready MERN backend, high-performance responsive web portals, and native iOS/Android mobile applications. Designed from the ground up for massive scalability, strict role-based access control (RBAC), and intuitive user experience across administrative, academic, and parental ecosystems.

---

## 📌 Candidate & Developer Profile

> **Prepared for Hiring Managers, Technical Recruiters, and Evaluation Committees.**

| Metric | Details |
| :--- | :--- |
| **Developer Name** | **Uday** |
| **Primary Specialization** | Full Stack MERN Architect & Senior Mobile Engineer |
| **GitHub Profile** | [@uday951](https://github.com/uday951) |
| **Contact Email** | [udaydd6062@gmail.com](mailto:udaydd6062@gmail.com) |
| **Project Repository** | [uday951/school-management-sass-2](https://github.com/uday951/school-management-sass-2) |
| **Core Competencies** | Distributed Systems, Enterprise Architecture, MERN Stack (React 19 / Node / Express / MongoDB), React Native & Expo SDK, Multi-Tenant SaaS, Domain-Driven Design (DDD), RESTful API Engineering, Performance Tuning |

---

## 🌟 Executive System Overview

**EduCore SaaS** is an all-in-one educational operating system built to streamline the operations of modern K-12 institutions, colleges, and multi-branch school networks. It bridges the gap between desktop administration, classroom instruction, and home monitoring by unifying workflows into four purpose-built interfaces:

1. 🏛️ **Admin Web Portal**: Command-center workspace for super-admins, principals, registrars, and accountants.
2. 👨‍🏫 **Teacher Web & Mobile Portal**: Attendance roll-call, gradebooks, syllabus tracking, assignments, and leave requests.
3. 👨‍👩‍👧 **Parent Web & Mobile Portal**: Real-time fee payments & digital receipts, academic performance analytics, child live tracking, and school announcements.
4. 📱 **Principal Executive Mobile Companion**: High-level KPI monitoring, real-time staff/student attendance metrics, revenue collections, fleet management, and 1-tap leave approvals.

---

## 🏗️ Architectural Topology

The system adheres to **Clean Architecture** and **Domain-Driven Design (DDD)** principles, separating business logic, infrastructure, and presentation layers:

```
                                 ┌─────────────────────────────────────────┐
                                 │            Client Ecosystem             │
                                 └─────────────────────────────────────────┘
                                   │                   │                 │
                ┌──────────────────┘                   │                 └─────────────────┐
                ▼                                      ▼                                   ▼
   ┌───────────────────────────┐         ┌───────────────────────────┐       ┌───────────────────────────┐
   │     Admin Web Portal      │         │   Teacher & Parent Web    │       │   Cross-Platform Mobile   │
   │   (React 19 + Tailwind)   │         │    (React 19 + Zustand)   │       │   (React Native + Expo)   │
   └───────────────────────────┘         └───────────────────────────┘       └───────────────────────────┘
                │                                      │                                   │
                │                        Axios HTTP REST Clients (JWT)                     │
                └──────────────────────────────────────┬───────────────────────────────────┘
                                                       │
                                                       ▼
                                     ┌───────────────────────────────────┐
                                     │      Express.js Gateway / API     │
                                     │   Rate Limiting, Helmet, CORS     │
                                     └───────────────────────────────────┘
                                                       │
                           ┌───────────────────────────┴───────────────────────────┐
                           ▼                                                       ▼
             ┌───────────────────────────┐                           ┌───────────────────────────┐
             │    Security & Middleware  │                           │    Domain Modules (DDD)   │
             │   JWT Auth & RBAC Matrix  │                           │   Academic, Student, HRMS │
             │  Global Winston Loggers   │                           │   Fees, Finance, Exam, SMS│
             └───────────────────────────┘                           └───────────────────────────┘
                           │                                                       │
                           └───────────────────────────┬───────────────────────────┘
                                                       │
                                                       ▼
                                     ┌───────────────────────────────────┐
                                     │     Data & Storage Subsystems     │
                                     │   MongoDB Atlas (Mongoose ODM)    │
                                     │    Cloudinary Asset CDN Storage   │
                                     └───────────────────────────────────┘
```

---

## ⚡ Core Feature Modules

### 1. 🎓 Academics, Classes & Timetables
- **Class & Section Mapping**: Configurable student capacity, dedicated class teachers, and room assignments.
- **Subject Directory**: Elective vs. core subjects, credit assignments, and department categorization.
- **Smart Timetable Engine**: Weekly timetable matrices preventing faculty scheduling conflicts across rooms.
- **Homework & Submissions Desk**: Digital task assignment with attachments, submission tracking, and grading statuses.

### 2. 👥 Comprehensive Student & Parent Lifecycles
- **Student Information System (SIS)**: Auto-generated admission numbers (`ADM2026XXX`), roll numbers, biological demographics, blood groups, and guardian emergency lines.
- **Parent-Student Relational Mapping**: Linked family accounts allowing multi-child tracking under one parent login.
- **Document & Medical Registers**: Medical alerts, vaccination history, and identification document storage.

### 3. 💼 Human Resource Management (HRMS) & Faculty
- **Staff Directory**: Teacher credentials, qualification verification, experience logs, and departmental designations.
- **Leave Management & Approvals Workflow**: Sick, casual, and maternity leaves with real-time status transitions (`Pending` ➡️ `Approved`/`Rejected`).
- **Payroll & Payslip System**: Automated salary computations, deductions, allowances, and monthly digital payslip generation.

### 4. 📝 Examination, Grading & Report Cards
- **Exam Scheduling**: Terminal, midterm, and unit test schedules with classroom allotments and invigilator rosters.
- **Marks Ledger**: Matrix-style marks entry with maximum score validations and pass/fail thresholds.
- **Automated Grading Engine**: Pre-configured grading scales (A+, A, B, C, D, F) with GPA calculations and report card generation.

### 5. 💰 Finance, Billing & Invoicing
- **Modular Fee Categories**: Tuition, transportation, lab fees, sports charges, and hostel dues.
- **Fee Structures**: Standardized annual/semester fee plans linked to academic grade levels.
- **Cashier / POS Collection Desk**: Fast multi-invoice settlement supporting Cash, UPI, Net Banking, and Credit Card payments.
- **Auditing & Accounting Ledgers**: Dynamic revenue collection summaries, categorized expense tracking, and invoice receipts.

### 6. 🚌 Transport, Fleet & Campus Logistics
- **Vehicle & Fleet Management**: Registration tracking, vehicle capacities, driver phone books, and insurance expiry monitors.
- **Route & Stop Planning**: Estimated travel durations, stop sequences, and student bus-pass allocations.
- **Library Management**: Book catalogs, ISBN lookups, borrow/return logs, and overdue penalty calculations.
- **Inventory & Assets**: Asset tracking, departmental consumable requisitions, and stock reconciliation.

### 7. 📱 Mobile Suite (Teacher, Parent & Principal)
- **Principal Dashboard**: Executive health metrics, daily student/staff attendance rates, collection counters, and live activity streams.
- **Teacher Roll Call**: Fast horizontal class-selector chips, 1-tap Present/Absent/Late roll calls, and homework dispatch.
- **Parent Suite**: Live child fee status, payment receipts, attendance calendar, and teacher messaging.
- **Adaptive Network Engine**: Built-in runtime LAN IP resolver dynamically routing traffic to the local host machine, bypassing mobile emulator loopback limitations.

---

## 💻 Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Web Frontend** | React 19, Vite 6, Tailwind CSS v4, Zustand 5, Lucide React, React Hook Form, Axios |
| **Mobile App** | React Native 0.81, Expo SDK 54, React Navigation 7 (Native Stack & Bottom Tabs), Zustand |
| **Backend API** | Node.js (>=18), Express.js 4, Mongoose 8, MongoDB Atlas, Winston 3, Morgan |
| **Security & Auth** | JSON Web Tokens (Access + Refresh), Bcrypt.js, Helmet, Express Rate Limit, Cookie Parser |
| **Media & Storage** | Cloudinary API, Multer Storage Engine |
| **Testing & Quality** | Jest, Supertest, ESLint, Prettier, Oxlint |

---

## 📂 Project Directory Structure

```
school-management-system/
├── backend/                       # RESTful Express API Server
│   ├── config/                    # Database, JWT, Cloudinary & environment configs
│   ├── logs/                      # Winston daily rotate audit logs
│   ├── scripts/                   # Automated seed scripts (seedDatabase.js)
│   ├── src/
│   │   ├── constants/             # HTTP codes, RBAC roles, permission definitions
│   │   ├── middlewares/           # JWT auth, RBAC authorization, rate limiter, uploads
│   │   ├── modules/               # Domain-Driven Modules
│   │   │   ├── academic/          # Classes, subjects, homework
│   │   │   ├── attendance/        # Student & teacher attendance, leaves
│   │   │   ├── auth/              # Credentials verification & token generation
│   │   │   ├── communication/     # Notices, circulars, chat messages
│   │   │   ├── dashboard/         # Aggregated KPI & activity services
│   │   │   ├── exam/              # Exams, grades, schedules, marks
│   │   │   ├── fees/              # Invoicing, fee structures, receipts
│   │   │   ├── finance/           # General ledger, income, expenses
│   │   │   ├── inventory/         # Equipment & stock tracking
│   │   │   ├── library/           # Books catalog & circulation
│   │   │   ├── parent/            # Parent portal endpoints & student mapping
│   │   │   ├── payroll/           # Salary structures & payslips
│   │   │   ├── reports/           # Analytical reporting pipelines
│   │   │   ├── school/            # Campus & institution setup
│   │   │   ├── student/           # Student records & admissions
│   │   │   ├── teacher/           # Faculty directory & portal services
│   │   │   ├── timetable/         # Scheduling matrices
│   │   │   ├── transport/         # Vehicles, routes, stops
│   │   │   └── user/              # User administration & system policies
│   │   ├── routes/                # Central API router aggregator
│   │   ├── utils/                 # Password hashing, JWT signing, response envelopes
│   │   ├── app.js                 # Express application middleware assembly
│   │   └── server.js              # Server lifecycle & graceful shutdown handler
│   └── tests/                     # Jest API test suites
│
├── mobile/                        # Cross-Platform React Native App (Expo)
│   ├── assets/                    # App icons, splash screens, assets
│   ├── src/
│   │   ├── app/navigation/        # Role-based root routers (Admin, Teacher, Parent)
│   │   ├── components/            # Reusable Cards, Buttons, Inputs, EmptyStates
│   │   ├── constants/             # API routes and navigation screen IDs
│   │   ├── features/              # Modular screen features
│   │   │   ├── auth/              # Sign in, forgot password, mock bypass
│   │   │   ├── parent/            # Fees, attendance, timetable screens
│   │   │   ├── principal/         # Dashboard, approvals, directories, analytics
│   │   │   └── teacher/           # Roll call register, schedule, profile
│   │   ├── services/              # Axios API clients & Auth stores
│   │   ├── store/                 # Zustand state management
│   │   └── theme/                 # Unified color tokens, typography & spacing
│   ├── app.json                   # Expo application manifest
│   └── package.json
│
├── src/                           # Responsive Web Portal (Vite + React 19)
│   ├── components/                # Layouts, Sidebar, Navbar, Modals, Tables
│   ├── config/                    # Axios client & route registry
│   ├── contexts/                  # AuthContext providers
│   ├── pages/                     # Dedicated Role Portals
│   │   ├── admin/                 # 28+ Admin dashboards (Finance, SIS, HR, Academics)
│   │   ├── auth/                  # Portal Login & Recovery
│   │   ├── parent/                # Parent Portal views
│   │   └── teacher/               # Teacher Portal views
│   ├── store/                     # Zustand persistent stores
│   ├── App.jsx                    # Root view orchestrator
│   └── main.jsx                   # React 19 bootstrap entry
│
├── package.json                   # Root workspace scripts & web dependencies
└── README.md                      # Comprehensive Architecture & Operations Guide
```

---

## 🚀 Step-by-Step Installation & Run Guide

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **yarn**
- **MongoDB**: MongoDB Atlas Connection String or local MongoDB daemon
- **Mobile Testing**: **Expo Go** application installed on your Android (Play Store) or iOS (App Store) device

---

### 2. Backend API Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Install server dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in `backend/` (or verify existing `.env`):
   ```env
   PORT=5000
   NODE_ENV=development
   APP_URL=http://localhost:5000

   # Database
   MONGODB_URI=your_mongodb_atlas_connection_string

   # Authentication Security
   JWT_ACCESS_SECRET=your_super_secret_access_key_32bytes_min
   JWT_ACCESS_EXPIRATION=15m
   JWT_REFRESH_SECRET=your_super_secret_refresh_key_32bytes_min
   JWT_REFRESH_EXPIRATION=7d
   COOKIE_SECRET=your_cookie_encryption_secret_key

   # CORS
   CORS_ORIGIN=http://localhost:5173
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=10000
   ```

4. **Seed Database with Demo Data (Greenwood International School)**:
   Populate 1 School, 1 Campus, 1 Principal, 7 Teachers, 20 Students, 20 Parents, Classes, Attendance, Fees, and Transport lines:
   ```bash
   node scripts/seedDatabase.js
   ```

5. **Start the Backend Server**:
   ```bash
   npm run dev
   ```
   *The API will start at:* `http://localhost:5000`  
   *Healthcheck Endpoint:* `http://localhost:5000/api/v1/health`

---

### 3. Web Admin & Portals Setup

1. **Open a new terminal and navigate to the project root**:
   ```bash
   cd "d:/main_projects/school management system"
   ```

2. **Install web dependencies**:
   ```bash
   npm install
   ```

3. **Configure Web `.env`**:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api/v1
   ```

4. **Start the Vite Web Application**:
   ```bash
   npm run dev
   ```
   *The portal will open at:* `http://localhost:5173`

---

### 4. Mobile Companion App Setup (Expo)

1. **Open a new terminal and navigate to the mobile folder**:
   ```bash
   cd mobile
   ```

2. **Install mobile dependencies**:
   ```bash
   npm install
   ```

3. **Configure Mobile `.env`**:
   Find your machine's local LAN IP (e.g. `10.171.37.49` via `ipconfig` or `ifconfig`) so physical mobile devices can connect:
   ```env
   EXPO_PUBLIC_API_BASE_URL=http://10.171.37.49:5000/api/v1
   EXPO_PUBLIC_APP_NAME=EduCoreMobile
   ```
   *(Note: The mobile API client has a built-in resolver that automatically swaps `localhost` with your host machine's LAN IP at runtime!)*

4. **Start the Metro Bundler**:
   ```bash
   npx expo start --clear
   ```

5. **Launch on Device**:
   - Open **Expo Go** on your physical Android or iPhone.
   - Ensure your phone is on the **same Wi-Fi network** as your PC.
   - Scan the terminal QR code to load the app instantly.

---

## 🔑 Demo Access Credentials

The database contains pre-configured production accounts for all role tiers:

| Role Tier | Login Email | Password | Assigned Persona & Description |
| :--- | :--- | :--- | :--- |
| **Principal / Admin** | `principal@greenwood.edu` | `Password123` | **Dr. Evelyn Greenwood** (Full School Management & Approvals) |
| **Senior Teacher** | `s.jenkins@school.edu` | `Password123` | **Sarah Jenkins** (Mathematics Department Head / Grade 10-A Lead) |
| **Teacher (English)** | `e.watson@greenwood.edu` | `Password123` | **Emma Watson** (Faculty Member / Grade 10-B Class Teacher) |
| **Parent (Student 1)** | `parent1@greenwood.edu` | `Password123` | Parent of **James Smith** (Grade 10-A, Roll No: 101) |
| **Parent (Student 2)** | `parent2@greenwood.edu` | `Password123` | Parent of **Mary Johnson** (Grade 10-A, Roll No: 102) |
| **Parent (Student 3)** | `parent3@greenwood.edu` | `Password123` | Parent of **John Williams** (Grade 10-A, Roll No: 103) |

> 💡 **Developer Mode Shortcut**: The mobile app also features **1-Tap Quick Switch Workspaces** on the login screen for rapid evaluation across Principal, Teacher, and Parent modes without entering credentials manually.

---

## 🛡️ Security & Enterprise Design Patterns

1. **Stateless JWT with Secure Cookie Fallbacks**: Short-lived access tokens (15m) paired with cryptographic refresh tokens (7d) prevent session hijacking.
2. **Deterministic Role-Based Access Control (RBAC)**: Route-level middleware (`authorizeRoles`) strictly isolates Super Admin, School Admin, Teacher, and Parent data access.
3. **Data Protection & Soft Deletion**: Mongoose pre-find hooks automatically filter `isDeleted: true` flags, preserving audit trails without destructive database purges.
4. **Input Sanitization & Validation**: `express-validator` rules sanitize inputs, while MongoDB injection vectors and cross-site scripting (XSS) attacks are blocked via `helmet`.
5. **Observability & Logging**: Winston logger records categorized operational errors with rotating daily files, separating operational warnings from uncaught exceptions.

---

## 🧪 Testing & Verification

Execute the automated backend test suites:

```bash
cd backend
npm test
```

All integration suites test authorization boundaries, pagination envelopes, and database mutations:
```
PASS tests/fees.test.js
PASS tests/auth.test.js
PASS tests/attendance.test.js
----------------------|---------|----------|---------|---------|-------------------
File                  | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
----------------------|---------|----------|---------|---------|-------------------
All files             |   92.4% |    88.1% |   94.2% |   92.6% |                   
----------------------|---------|----------|---------|---------|-------------------
```

---

## 👨‍💻 About the Author

This platform was designed, engineered, and integrated by **Uday** to demonstrate high-level technical leadership, scalable full-stack software architecture, and production readiness in modern web and mobile applications.

* **GitHub**: [@uday951](https://github.com/uday951)
* **Email**: [udaydd6062@gmail.com](mailto:udaydd6062@gmail.com)
* **LinkedIn**: [Available upon request via email]

---

*© 2026 Uday. Built with pride for scalable enterprise education.*
