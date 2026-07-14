# Greenfield International School Pilot Test Report

This report outlines the end-to-end pilot validation, tenant isolation, and mobile compatibility tests performed during Phase 12.5.

## 1. Environment Details
- **Test Date**: July 7, 2026
- **Database**: MongoDB Atlas Cluster (`school_mgmt` database)
- **Database Layer**: Prisma Client
- **SaaS Backend**: Express.js REST APIs (port 3001)
- **Mobile Stack**: Expo SDK 54 / React Native

---

## 2. Seeded Test Tenants
We seeded two completely isolated tenants:
1. **Greenfield International School** (slug: `greenfield-demo`, code: `GIS-DEMO-2026`) - Fictional pilot school.
2. **Riverside Demo School** (slug: `riverside-demo`, code: `RIV-DEMO-2026`) - Used to test cross-tenant data isolation.

---

## 3. Demo User Accounts & Access Strategy
All users are seeded with the password hash corresponding to: `password123`.

| User Role | Email (Login ID) | Associated Profile | Tenant Scope |
| --- | --- | --- | --- |
| **Principal** | `arjun@greenfield.test` | Dr. Arjun Mehta (EMP-001) | `greenfield-demo` |
| **Vice Principal** | `kavya@greenfield.test` | Kavya Nair (EMP-002) | `greenfield-demo` |
| **Admin** | `ananya@greenfield.test` | Ananya Rao (EMP-003) | `greenfield-demo` |
| **Teacher (Math)** | `neha@greenfield.test` | Neha Kulkarni (EMP-008) | `greenfield-demo` |
| **Student** | `aarav@schoolmob.test` | Aarav Sharma (STU-2026-001) | `greenfield-demo` |
| **Guardian** | `rajesh@schoolmob.test` | Rajesh Sharma (Parent) | `greenfield-demo` |
| **Riverside Student**| `student@riverside.test` | Riverside Student | `riverside-demo` |

---

## 4. Module-by-Module Verification Status

| Module | Seeded | API Tested | Web Tested | Mobile Tested | Status |
| --- | --- | --- | --- | --- | --- |
| **Platform SaaS Onboarding** | Yes | Yes | Yes | N/A | **PASSED** |
| **Academics (Grades/Sections)**| Yes | Yes | Yes | Yes | **PASSED** |
| **Staff & Leaves** | Yes | Yes | Yes | Yes | **PASSED** |
| **Student & Guardian Links** | Yes | Yes | Yes | Yes | **PASSED** |
| **Timetable & Scheduling** | Yes | Yes | Yes | Yes | **PASSED** |
| **Exams & Grading** | Yes | Yes | Yes | Yes | **PASSED** |
| **Fees & Collections** | Yes | Yes | Yes | Yes | **PASSED** |
| **Announcements** | Yes | Yes | Yes | Yes | **PASSED** |
| **Visitor & Gate Pass** | Yes | Yes | Yes | Yes | **PASSED** |
| **Library Management** | Yes | Yes | Yes | Yes | **PASSED** |
| **Transport Management** | Yes | Yes | Yes | Yes | **PASSED** |

---

## 5. Security & Tenant Isolation Verification
- **Cross-Tenant Block Test**: We performed API routing check from Greenfield users trying to access Riverside resources. All attempts to read student `STU-R-01` or employee `EMP-R-01` details with Greenfield tokens were blocked with `403 Forbidden` or `404 Not Found`.
- **Role Enforcement Test**: Math teacher Neha Kulkarni was blocked from changing English exam marks or accessing accounting balance registers.

---

## 6. Mobile Application Compatibility
All bootstraps, authentication checks, and dashboard metrics endpoints were fully verified with the Expo Go SDK 54 client.
- **Teacher Dashboard**: Correctly loads today's schedule, leaves, and class sections lists.
- **Student Dashboard**: Correctly displays attendance percentages and outstanding fee balances.
- **Guardian Dashboard**: Successfully toggles between Aarav Sharma (Grade 6) and Aditya Verma (Grade 7) using the Child Switcher.
- **Principal Dashboard**: Displays total aggregate counts (students, staff, checked-in visitors).
