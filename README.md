<div align="center">

# ⚡ FieldFlow

### Enterprise Field Service Management & Workforce Dispatch Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.3.0-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-7.10.0-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Neon PostgreSQL](https://img.shields.io/badge/Neon-PostgreSQL-00E599?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech/)
[![Better Auth](https://img.shields.io/badge/Better_Auth-v1.7.2-indigo?style=for-the-badge&logo=auth0&logoColor=white)](https://www.better-auth.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

<p align="center">
  A state-of-the-art SaaS web application engineered for field service operations, intelligent technician dispatching, real-time workload orchestration, customer CRM, and automated SLA tracking.
</p>

[Features](#-features) • [Workflow](#-end-to-end-operational-workflow) • [Architecture](#-architecture-overview) • [API Docs](API_DOCUMENTATION.md) • [User Manual](USER_MANUAL.md) • [Code Review](CODE_REVIEW.md) • [Testing](TESTING_REPORT.md) • [Verification](FINAL_VERIFICATION_REPORT.md) • [Deployment](DEPLOYMENT.md)

</div>

---

### 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [End-to-End Operational Workflow](#-end-to-end-operational-workflow)
3. [Key Features](#-features)
   - [Enterprise RBAC & Role Matrix](#-enterprise-role-based-access-control-rbac)
   - [1-Click Instant Demo Authentication](#-demo-accounts--instant-1-click-access)
   - [Zod Schema Validation & Duplicate Prevention](#-schema-validation--duplicate-prevention-zod-engine)
   - [Real-Time Dispatch Analytics & KPIs](#-real-time-dispatch-analytics)
   - [Customer Relationship Management](#-customer-relationship-management)
   - [Field Technician & Skills Roster](#-field-technician--skills-management)
   - [Work Order Lifecycle State Machine](#-work-order-lifecycle-orchestration--immutable-status-logs)
   - [Activity Log & SOC 2 Audit Trail](#-enterprise-activity-log--audit-trail-soc-2-compliance)
   - [Real-Time In-App Notifications](#-real-time-in-app-notification-system)
4. [Technology Stack](#-technology-stack)
5. [Architecture Overview](#-architecture-overview)
6. [Database Schema (Neon PostgreSQL + Prisma)](#-database-setup-neon-postgresql--prisma-orm)
7. [Folder Structure](#-folder-structure)
8. [Installation & Setup](#-installation--setup)
9. [Environment Variables](#-environment-variables)
10. [Authentication Setup (Better Auth)](#-authentication-setup-better-auth)
11. [Development & Build Commands](#-running-the-application)
12. [API Architecture & Endpoints](#-api-architecture--endpoints)
13. [UI Showcase & Diagrams](#-diagrams--ui-showcase)
14. [Testing & Quality Assurance](#-testing--quality-assurance)
15. [Deployment Guide](#-deployment-guide)
16. [Future Roadmap](#-future-roadmap)
17. [Contributors & License](#-contributors--license)

---

## 🚀 Project Overview

**FieldFlow** is an enterprise-grade Field Service Management (FSM) platform designed to streamline dispatch operations, automate workforce scheduling, and eliminate service delivery bottlenecks for telecom, electrical, IT infrastructure, HVAC, and facilities maintenance organizations.

Built using the modern **Next.js App Router**, **React 19**, and **Tailwind CSS**, FieldFlow integrates **Prisma ORM** with serverless **Neon PostgreSQL** and secures dispatch endpoints with **Better Auth** session management.

### Key Objectives
- **Centralized Dispatch Hub**: Consolidate dispatch operations, live schedules, customer records, and technician fleets into a single high-performance pane of glass.
- **Enforced Assignment Rules**: Prevent accidental dispatching of busy or off-duty technicians through availability guards.
- **Audit-Ready Status Tracking**: Record complete status transition histories via immutable `StatusLog` records in PostgreSQL.
- **SLA Protection**: Monitor scheduled service windows, highlight approaching SLAs, and flag overdue tickets in real time.
- **Zero-Latency Analytics**: Aggregate performance metrics via database `groupBy` and aggregation pipelines.

---

## 🔄 End-to-End Operational Workflow

FieldFlow delivers a structured, 5-step operational pipeline connecting Dispatchers, Technicians, and Administrators:

```mermaid
sequenceDiagram
    autonumber
    actor Customer as 🏢 Customer
    actor Dispatcher as 📡 Dispatcher
    actor Technician as 🔧 Field Technician
    actor Admin as 👑 Administrator
    participant System as ⚡ FieldFlow System (Next.js + DB)

    Note over Dispatcher, System: Step 1: Customer Provisioning
    Dispatcher->>System: Create / Select Customer (Name, Address, Service SLA Notes)
    System-->>Dispatcher: Customer Registered & Validated

    Note over Dispatcher, System: Step 2: Fleet & Workload Inspection
    Dispatcher->>System: Check Technician Roster (Status: AVAILABLE, Skills, Active Jobs)
    System-->>Dispatcher: Display Live Fleet Capacity

    Note over Dispatcher, System: Step 3: Work Order Dispatch
    Dispatcher->>System: Create Work Order (Customer, Assigned Tech, Priority, Schedule)
    System->>System: Set Status = ASSIGNED, Validate Availability, Log StatusLog
    System-->>Technician: Send Real-Time Assignment Notification 🔔

    Note over Technician, System: Step 4: Technician Job Execution ("My Jobs")
    Technician->>System: Log in to scoped "My Jobs" Queue
    Technician->>System: Click "Start Job" (Status -> IN_PROGRESS)
    System->>System: Set Tech Status = BUSY, Log StatusLog
    opt Temporary Delay
        Technician->>System: Pause Job with Reason Notes (Status -> PAUSED)
        System->>System: Set Tech Status = AVAILABLE
        Technician->>System: Resume Job (Status -> IN_PROGRESS)
        System->>System: Set Tech Status = BUSY
    end

    Note over Technician, System: Step 5: Completion, Notes & Sign-Off
    Technician->>System: Open Completion Modal, Check Checklist, Enter Mandatory Notes
    Technician->>System: Submit Completion (Status -> COMPLETED, completedAt = NOW)
    System->>System: Set Tech Status = AVAILABLE, Calculate SLA Compliance
    System-->>Dispatcher: Broadcast Completion Notification 🔔
    Admin->>System: Review Live Metrics, Velocity Charts, and Immutable Audit Trail
```

### The 5 Operational Stages

| Step | Stage | Primary Actor | Description & Actions |
| :--- | :--- | :--- | :--- |
| **1** | **Customer Provisioning** | Dispatcher / Admin | Register new client with service address, contact details, and site access notes (or use the **Quick Customer Modal** directly inside work order creation). |
| **2** | **Fleet & Workload Check** | Dispatcher / Admin | Inspect technician roster with real-time status indicators (`AVAILABLE`, `BUSY`, `OFF`), specializations, and active job capacity bars. |
| **3** | **Work Order Dispatch** | Dispatcher / Admin | Create work order using searchable comboboxes, assign available technician, set priority (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), and schedule arrival window. |
| **4** | **Technician "My Jobs" Execution** | Field Technician | Technician logs in, views only their scoped assignments in the dedicated **My Jobs** queue, and clicks **"Start Job"** (auto-updates technician to `BUSY`). |
| **5** | **Resolution, Notes & Sync** | Field Technician & Admin | Technician completes pre-flight checklist, enters mandatory resolution notes ($\ge 5$ chars), and submits. Status transitions to `COMPLETED`, technician is freed (`AVAILABLE`), and executive analytics update instantly. |

---

## ✨ Features

### 🔐 Enterprise Role-Based Access Control (RBAC)
FieldFlow enforces strict, multi-tiered authorization across both the API routes and frontend interface:

- **👑 Administrator (`ADMIN`)**:
  - Full organizational oversight and unrestricted record access across all modules.
  - Complete executive dashboard analytics across all dispatch operations.
  - User & Access Management console (`/dashboard` Users view) for promoting users to `ADMIN`, `DISPATCHER`, or `TECHNICIAN`, linking technician profiles, and deleting accounts.
- **📡 Dispatcher (`DISPATCHER`)**:
  - Full dispatch operations: customer creation and editing, technician roster management, work order scheduling, and prioritization.
  - Intelligent technician assignment with availability guards (`AVAILABLE`, `BUSY`, `OFF`).
  - View full dispatch dashboard, activity logs, calendar timelines, and real-time SLA trackers.
  - Restricted from accessing user administration (enforced via server-side `403 Forbidden`).
- **🔧 Field Technician (`TECHNICIAN`)**:
  - **Scoped "My Jobs" Queue**: Technicians only see work orders specifically assigned to their linked profile (`where: { technicianId: auth.technician.id }`).
  - **Direct Job Execution**: One-click **"Start Work"** button (transitions order to `IN_PROGRESS`) and **"Complete Job"** modal with pre-flight checklist & resolution notes (`COMPLETED`).
  - **Strict Security Guardrails**: Cannot create, edit, or delete customers, technicians, or other technicians' work orders (enforced via server-side `403 Forbidden` guards).
  - Scoped dashboard metrics showing only personal assignments, completion velocity, and pending tasks.

---

### 🔑 Demo Accounts & Instant 1-Click Access
For streamlined evaluation and testing, the application supports pre-seeded persona accounts in Neon PostgreSQL:

| Role | Demo Identity | Intended Workflow & Capabilities |
| :--- | :--- | :--- |
| **👑 Administrator** | `admin@fieldflow.test` | Executive Dashboard, Work Orders, Calendar, Customers CRM, Tech Roster, **User & Role Management**, Audit Logs |
| **📡 Dispatcher** | `dispatch@fieldflow.test` | Full Dispatch Hub, Customers CRM, Tech Roster, Work Orders (Create/Assign/Edit), Calendar, SLA Reports |
| **🔧 Technician** | `tech@fieldflow.test` | **"My Jobs"** queue, 1-click **"Start Work"** & **"Complete Job"** with resolution notes, Personal Schedule |

> 💡 **Quick Login**: The [Login Page](app/login/page.tsx) features an **Instant Demo Sign-In** panel allowing single-click authentication into any role without manual credential typing. Demo credentials are seeded automatically via `scripts/seed-demo.mjs` using the environment configuration.

---

### 🛡️ Schema Validation & Duplicate Prevention (Zod Engine)
- **Strict Server-Side Input Validation**: All mutation endpoints (`/api/customers`, `/api/technicians`, `/api/work-orders`, `/api/users/[id]`) validate payloads via modular Zod schemas (`lib/validations/`).
- **Standardized Field Error Architecture**: Returns structured `{ error: string, errors: Record<string, string> }` responses with HTTP `400 Bad Request` or `409 Conflict`, mapping directly to UI input fields.
- **Intelligent Duplicate Prevention**:
  - **Customers**: Prevents duplicate email registrations and matching phone + company combinations.
  - **Technicians**: Rejects collisions on technician email or phone numbers across active rosters.
  - **Work Orders**: Detects and rejects duplicate active orders (`OPEN`, `ASSIGNED`, `ACCEPTED`, `IN_PROGRESS`, `PAUSED`) with identical titles for the same client.
- **Enhanced UX State Feedback**: Rich animated skeleton loaders, optimistic status updates, and interactive empty states (`EmptyState`) with 1-click filter reset triggers.

---

### 📊 Real-Time Dispatch Analytics
- **Live Metric KPI Cards**: Total Customers, Total Technicians, Available Field Techs, Active Work Orders, Completed Deliveries, Overdue SLAs, and Unassigned Queue.
- **Monthly Work Order Velocity Chart**: Multi-series SVG area/bar visualization comparing created vs. resolved orders across 6 months.
- **Job Status Distribution**: Dynamic segmented status share breakdown.
- **Technician Workload Capacity**: Visual bar charts monitoring active jobs per technician.
- **Priority Breakdown**: Urgency classification matrix (`Urgent`, `High`, `Medium`, `Low`).
- **Real-Time Activity Feed**: Chronological event logs with relative timestamps.
- **Prioritized Alerts**: Urgent warning banner with Overdue SLAs positioned first.

---

### 👥 Customer Relationship Management
- **Full Commercial CRUD Operations**: Enterprise customer account provisioning, profile updating, and safe deletion in Neon PostgreSQL.
- **Searchable Customer Selector (`SearchableCustomerSelect.tsx`)**: Combobox with real-time search across customer names, companies, and emails, displaying client avatars and formatted addresses.
- **Quick Customer Modal (`QuickCustomerModal.tsx`)**: Inline customer registration modal allowing dispatchers to create a new client without losing their place in the work order form.
- **Rich Customer Profiles & Live History**: Interactive modal displaying customer SLA compliance rates, total dispatches, active in-flight jobs, and full chronological work order history.
- **Site Access & Internal Notes**: Lockbox codes, security instructions, and dispatch SLA notes attached to each client record.
- **Safety Cascading Guards**: Prevents accidental deletion of customers with active in-flight work orders.
- **1-Click CSV Exporter**: Export complete customer registries with service addresses, city, and internal notes.

---

### 🛠️ Field Technician & Skills Management
- **Complete Contractor Profiles**: Technician identity tracking name, email, phone, specialization, service territory, customer rating (`★ 4.9`), and experience tenure.
- **Searchable Technician Selector (`SearchableTechnicianSelect.tsx`)**: Displays live status badges (`AVAILABLE`, `BUSY`, `OFF`), specialization tags, and active workload counts (`N active jobs`).
- **Skills & Verified Certifications**: Dual tag management for hands-on skills (e.g., `Fiber Splicing`, `PLC Troubleshooting`, `BMS Systems`) and certified credentials (e.g., `EPA 608 Universal`, `FOA CFOT Certified`, `Master Electrician License`, `OSHA 30 Safety`).
- **Real-Time Workload & Capacity Tracking**: Live capacity progress bars (`N / M Active Jobs`, `X% Capacity`) with dynamic color indicators.
- **Interactive Technician Profile Modal**:
  - 4 Performance Metric Cards: Active Workload Capacity %, Completed Dispatches, SLA On-Time Rate %, and Seniority.
  - **In-Flight Assignments Tab**: Live work order cards with priority badges, status badges, customer names, addresses, and scheduled windows.
  - **Resolved Jobs History Tab**: Chronological history of completed work orders with resolution notes, completion dates, and SLA on-time compliance tags.
- **Three-State Availability Toggle**: One-click status switcher (`AVAILABLE` with active pulse, `BUSY`, `OFF`).
- **Safety Cascading Guards**: Prevents accidental deletion of technicians assigned to active in-flight work orders.
- **1-Click CSV Exporter**: Exports complete technician roster with skills, certifications, rating, status, workload, and contact details.

---

### 📑 Work Order Lifecycle Orchestration & Immutable Status Logs
FieldFlow implements a production-grade, finite state machine lifecycle with strict server-side authorization:

```
[ OPEN ] ──(Assign)──> [ ASSIGNED ] ──(Accept)──> [ ACCEPTED ] ──(Start Work)──> [ IN_PROGRESS ] ──(Complete)──> [ COMPLETED ] ──(Sign Off)──> [ CLOSED ]
   │                        │                         │                                ▲    │
   │                        └──(Decline)──────────────┘                                │    │ (Pause Work)
   │                                   │                                               │    ▼
   │                                   └─────────────────> [ OPEN ]               [ PAUSED ]
   │
   └──(Cancel)──> [ CANCELLED ]
```

- **Server-Side Transition Validation**: Direct skips (e.g., `OPEN` $\rightarrow$ `IN_PROGRESS` or `COMPLETED` $\rightarrow$ `IN_PROGRESS`) and backward state jumps are strictly rejected with `400 Bad Request`.
- **Mandatory Completion Notes Modal (`CompletionNotesModal.tsx`)**: Completion requests require a pre-flight checklist confirmation and mandatory resolution notes ($\ge 5$ characters).
- **Automated Technician Availability Sync**:
  - Starting or resuming work automatically transitions the technician to `BUSY`.
  - Completing, pausing, declining, or cancelling work automatically transitions the technician back to `AVAILABLE`.
- **Lifecycle Progress Bar (`LifecycleProgressBar.tsx`)**: Visual step indicator tracking progress across `Created` $\rightarrow$ `Assigned` $\rightarrow$ `In Progress` $\rightarrow$ `Completed` $\rightarrow$ `Closed`.
- **Immutable StatusLog Audit History**: Every state change records `fromStatus`, `toStatus`, `changedById`, `changedAt` timestamp, and contextual `notes` in PostgreSQL.
- **Interactive Status Timeline**: Work order modal displays an interactive, chronological activity log of all state transitions and dispatcher/technician notes.

---

### 🛡️ Enterprise Activity Log & Audit Trail (SOC 2 Compliance)
- **Immutable PostgreSQL Audit Trail**: Dedicated `audit_log` table indexing entity mutations, lifecycle state changes, security events, and user management operations.
- **Comprehensive Route Instrumentation**:
  - **Work Orders**: `WORK_ORDER_CREATE`, `WORK_ORDER_ASSIGN`, `WORK_ORDER_ACCEPT`, `WORK_ORDER_START`, `WORK_ORDER_PAUSE`, `WORK_ORDER_RESUME`, `WORK_ORDER_COMPLETE`, `WORK_ORDER_CANCEL`, `WORK_ORDER_CLOSE`, `WORK_ORDER_DELETE`.
  - **Customers CRM**: `CUSTOMER_CREATE`, `CUSTOMER_UPDATE`, `CUSTOMER_DELETE`.
  - **Technicians Roster**: `TECHNICIAN_CREATE`, `TECHNICIAN_UPDATE`, `TECHNICIAN_STATUS_CHANGE`, `TECHNICIAN_DELETE`.
  - **User Access & RBAC**: `USER_ROLE_UPDATE`, `USER_DELETE`.
- **Forensic Inspector Modal**: Displays raw JSON state diffs, client IP addresses, user agent metadata, and action payloads with a 1-click clipboard copy utility.
- **Multi-Vector Search & Filters**: Filter by Actor, Entity Type, Action Code, User Role, and Date Range, with 1-click CSV audit log export.

---

### 🔔 Real-Time In-App Notification System
- **Event-Driven Dispatching**: Automatically records and broadcasts notifications on work order creation, assignment, acceptance, start of work, pauses, completion, cancellation, and closure.
- **Role & Target Scoping**: Direct assignment alerts delivered to assigned field technicians; status changes, SLA events, and completion reports broadcasted to dispatchers and administrators.
- **Pulse Badge & Live Polling**: Unread counter badge on the top navigation bar updating in real time.
- **Interactive Notification Tray**: Filter by All vs. Unread, 1-click **Mark all as read**, individual read toggle, and **Clear read** history.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose / Highlights |
| :--- | :--- | :--- |
| **Framework** | [Next.js 16.3.0](https://nextjs.org/) | App Router, Server Components, Route Handlers, Turbopack |
| **UI Library** | [React 19.2.8](https://react.dev/) | React Server Components, Actions, State Hooks |
| **Language** | [TypeScript 5.0+](https://www.typescriptlang.org/) | End-to-end static type safety |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Modern design system, custom palettes, CSS variables |
| **Database** | [Neon PostgreSQL](https://neon.tech/) | Serverless PostgreSQL with connection pooling |
| **ORM** | [Prisma ORM 7.10.0](https://www.prisma.io/) | `prisma.config.ts`, `@prisma/adapter-pg`, Prisma Client API |
| **Authentication** | [Better Auth 1.7.2](https://www.better-auth.com/) | Prisma adapter, session management, secure cookies |
| **Validation** | [Zod 3.24+](https://zod.dev/) | Strict server-side schema validation & error formatting |
| **Icons** | [Lucide React](https://lucide.dev/) | Modern, clean iconography |
| **Linting & QA** | [ESLint 9](https://eslint.org/) | React 19 rules, TypeScript strict checking |

---

## 🏛️ Architecture Overview

FieldFlow is built with a layered, decoupled architecture designed for high throughput, sub-second query execution, and robust data integrity:

```mermaid
graph TD
    subgraph Client Layer [Next.js App Router Frontend]
        Landing[Landing Pages & Services]
        AuthUI[Login / Register Modals]
        DashUI[Dashboard Analytics]
        CustUI[Customer Management]
        TechUI[Technician Roster]
        WOrderUI[Work Order Dispatch]
        AuditUI[Activity & Audit Logs]
    end

    subgraph Security Layer [Edge Middleware & RBAC Guards]
        MW[middleware.ts Session Guard]
        RBAC[lib/auth-guard.ts Role Enforcer]
    end

    subgraph API Layer [Next.js Route Handlers]
        AuthAPI["/api/auth/* (Better Auth)"]
        DashAPI["/api/dashboard (Analytics Aggregations)"]
        CustAPI["/api/customers/* (CRUD & CSV)"]
        TechAPI["/api/technicians/* (CRUD & Status)"]
        WorkAPI["/api/work-orders/* (CRUD & StatusLog)"]
        AuditAPI["/api/audit-logs (Forensic Logs)"]
        NotifAPI["/api/notifications (In-App Alerts)"]
        UserAPI["/api/users (User & Role Admin)"]
    end

    subgraph Data Access Layer [Prisma ORM v7]
        PrismaClient["Prisma Client with @prisma/adapter-pg"]
    end

    subgraph Database Layer [Neon Serverless PostgreSQL]
        UserTable[(user)]
        CustTable[(Customer)]
        TechTable[(Technician)]
        WOTable[(WorkOrder)]
        LogTable[(StatusLog)]
        AuditTable[(AuditLog)]
        NotifTable[(Notification)]
    end

    Landing --> MW
    AuthUI --> AuthAPI
    DashUI --> MW --> RBAC --> DashAPI
    CustUI --> MW --> RBAC --> CustAPI
    TechUI --> MW --> RBAC --> TechAPI
    WOrderUI --> MW --> RBAC --> WorkAPI
    AuditUI --> MW --> RBAC --> AuditAPI

    DashAPI --> PrismaClient
    CustAPI --> PrismaClient
    TechAPI --> PrismaClient
    WorkAPI --> PrismaClient
    AuditAPI --> PrismaClient
    NotifAPI --> PrismaClient
    UserAPI --> PrismaClient
    AuthAPI --> PrismaClient

    PrismaClient --> UserTable
    PrismaClient --> CustTable
    PrismaClient --> TechTable
    PrismaClient --> WOTable
    PrismaClient --> LogTable
    PrismaClient --> AuditTable
    PrismaClient --> NotifTable
```

---

## 🗄️ Database Setup (Neon PostgreSQL + Prisma ORM)

FieldFlow uses **Prisma ORM 7** configured with the native PostgreSQL driver adapter (`@prisma/adapter-pg`).

### 1. Prisma Schema Models (`prisma/schema.prisma`)
The schema defines 7 relational models:
- **`User`**: Authentication credentials, roles (`ADMIN`, `DISPATCHER`, `TECHNICIAN`), and optional linked technician relation.
- **`Customer`**: Commercial clients, companies, service addresses, contact details, and internal site notes.
- **`Technician`**: Workforce roster, specializations, skills, certifications, availability states (`AVAILABLE`, `BUSY`, `OFF`), and service areas.
- **`WorkOrder`**: Dispatch jobs, priorities (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), states (`OPEN`, `ASSIGNED`, `ACCEPTED`, `IN_PROGRESS`, `PAUSED`, `COMPLETED`, `CLOSED`, `CANCELLED`), schedules, and completion notes.
- **`StatusLog`**: Immutable audit logs tracking every work order state transition, timestamp, and acting user.
- **`AuditLog`**: Enterprise forensic activity trail indexing entity mutations, action codes, user roles, IP addresses, and JSON payload diffs.
- **`Notification`**: Real-time in-app alerts with read/unread status and target user scoping.

### 2. Synchronize Database & Generate Prisma Client
```bash
# Push schema changes to Neon PostgreSQL
npx prisma db push

# Generate the typesafe Prisma Client
npx prisma generate

# Seed demo dataset with role accounts, customers, technicians & work orders
node scripts/seed-demo.mjs
```

---

## 📂 Folder Structure

```
fieldflow/
├── app/                                # Next.js App Router Root
│   ├── api/                            # Backend REST Route Handlers
│   │   ├── auth/[...all]/route.ts      # Better Auth Catch-All Handler
│   │   ├── auth/me/route.ts            # Active Session & Role Profile
│   │   ├── customers/                  # Customer Listing & Creation
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts           # Customer Single CRUD
│   │   ├── technicians/                # Technician Listing & Creation
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts           # Technician Single CRUD
│   │   ├── work-orders/                # Work Order Listing & Dispatch
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts           # Work Order Single CRUD & Logs
│   │   ├── dashboard/route.ts          # Central Analytics Aggregator
│   │   ├── audit-logs/route.ts         # Forensic Audit Trail
│   │   ├── notifications/              # In-App Notification Engine
│   │   ├── reports/route.ts            # SLA & Aggregated Reporting
│   │   └── users/                      # User & Role Administration
│   ├── customers/page.tsx              # Protected /customers Route
│   ├── dashboard/page.tsx              # Protected /dashboard Route
│   ├── technicians/page.tsx            # Protected /technicians Route
│   ├── work-orders/page.tsx            # Protected /work-orders Route
│   ├── login/page.tsx                  # Authentication / Login
│   ├── register/page.tsx               # User Registration
│   ├── layout.tsx                      # Root Application Layout
├── components/                         # Reusable UI Components & Design System
│   ├── ui/                             # Design System Primitives
│   │   ├── Badge.tsx                   # Semantic Status, Priority & Availability Badges
│   │   ├── EmptyState.tsx              # Contextual Empty States with 1-Click CTAs
│   │   └── LoadingSpinner.tsx          # Shimmer Skeletons & Inline Spinners
│   ├── dashboard/                      # Dashboard Layout & Workflow Components
│   │   ├── WorkOrderWorkflowGuide.tsx  # 5-Step Operational Workflow Guide Banner
│   │   ├── SearchableCustomerSelect.tsx# Combobox with Real-Time Customer Search
│   │   ├── QuickCustomerModal.tsx      # Inline Customer Creation Modal
│   │   ├── SearchableTechnicianSelect.tsx# Smart Tech Selector with Workload & Status
│   │   ├── CompletionNotesModal.tsx    # Checklist & Mandatory Resolution Notes Modal
│   │   ├── LifecycleProgressBar.tsx    # Visual Lifecycle Stage Progress Bar
│   │   ├── Sidebar.tsx                 # Role-Aware Navigation Sidebar
│   │   ├── TopNavbar.tsx               # Header with Breadcrumbs & Notification Tray
│   │   └── views/                      # Interactive Module Views
│   │       ├── DashboardView.tsx       # Live Analytics & Velocity Charts
│   │       ├── CustomersView.tsx       # Customer CRM Table & Modals
│   │       ├── TechniciansView.tsx     # Technician Roster & Capacity Modals
│   │       ├── WorkOrdersView.tsx      # Work Order Dispatch & "My Jobs" Queue
│   │       ├── ScheduleView.tsx        # Dispatch Calendar Timeline
│   │       ├── ReportsView.tsx         # KPI & SLA Reports
│   │       ├── AuditLogsView.tsx       # Forensic Audit Trail & Inspector
│   │       ├── UsersView.tsx           # User & Role Management Console
│   │       └── SettingsView.tsx        # System Configuration
│   └── landing/                        # Public Landing Page Sections
├── docs/                               # System Documentation & Assets
│   └── images/
│       ├── diagrams/                   # Architecture, Lifecycle & ERD Diagrams
│       └── wireframes/                 # High-Fidelity UI Wireframes
├── lib/                                # Core Utilities & Singletons
│   ├── auth.ts                         # Better Auth Server Configuration
│   ├── auth-client.ts                  # Better Auth React Client
│   ├── auth-guard.ts                   # RBAC Server-Side Authorization Guard
│   ├── audit-logger.ts                 # Audit Log Insertion Helper
│   ├── validations/                    # Zod Schemas for API Validation
│   └── prisma.ts                       # Prisma Client with pg Driver Adapter
├── prisma/
│   └── schema.prisma                   # PostgreSQL Database Schema
├── scripts/
│   └── seed-demo.mjs                   # Demo Seed Script with Better Auth Hashing
├── middleware.ts                       # Next.js Route Protection Middleware
├── package.json                        # Dependencies & NPM Scripts
├── tsconfig.json                       # TypeScript Compiler Config
└── README.md                           # Documentation
```

---

## 💻 Installation & Setup

### Prerequisites
- **Node.js**: `v20.x` or later
- **npm** or **pnpm**
- **Neon Account**: A free serverless PostgreSQL database at [neon.tech](https://neon.tech)

### 1. Clone Repository
```bash
git clone https://github.com/Dinupro/fieldflow.git
cd fieldflow
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

Edit your `.env` file with your database connection string and application secrets.

---

## 🔐 Environment Variables

Ensure the following variables are defined in your `.env` file (refer to [`.env.example`](.env.example)):

| Variable | Description | Example / Notes |
| :--- | :--- | :--- |
| `DATABASE_URL` | Neon PostgreSQL pooled connection string | `postgresql://user:pass@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require` |
| `BETTER_AUTH_SECRET` | Secret key used to sign session cookies (min 32 characters) | Generated via `openssl rand -hex 32` |
| `BETTER_AUTH_URL` | Canonical base URL of the application | `http://localhost:3000` |
| `NEXT_PUBLIC_APP_URL` | Public base URL for client-side API requests | `http://localhost:3000` |
| `DEMO_USER_PASSWORD` | Optional demo account password override for seed scripts | Defaults to secure seed setting in `scripts/seed-demo.mjs` |

> ⚠️ **Security Notice**: Never commit `.env` files or production database credentials to version control. The repository `.gitignore` automatically excludes all `.env` files.

---

## 🔒 Authentication Setup (Better Auth)

Better Auth is configured in [`lib/auth.ts`](lib/auth.ts) using the Prisma adapter:

```typescript
import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { prisma } from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
});
```

### Route Protection Middleware (`middleware.ts`)
Protected dashboard routes (`/dashboard`, `/customers`, `/technicians`, `/work-orders`) verify session cookies and automatically redirect unauthenticated users to `/login`.

---

## ⚡ Running the Application

### Development Server
Run the local development server with Hot Module Replacement (HMR):
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Type Checking & Linting
Validate strict TypeScript types and ESLint compliance:
```bash
# TypeScript verification
npx tsc --noEmit

# ESLint validation
npm run lint
```

### Production Build
Build and optimize the application for production deployment:
```bash
npm run build
npm run start
```

---

## 🌐 API Architecture & Endpoints

All endpoints require an active session cookie, returning `401 Unauthorized` if unauthenticated. Restricted endpoints return `403 Forbidden` if the user lacks the necessary role permissions.

### 1. Authentication & Session Context
| Method | Endpoint | Query / Body Params | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/auth/me` | None | Returns active user session, system role (`ADMIN`, `DISPATCHER`, `TECHNICIAN`), and linked technician profile. |
| `POST` | `/api/auth/sign-in/email` | `{ email, password }` | Authenticates user credentials and sets HTTP-only session cookie. |
| `POST` | `/api/auth/sign-up/email` | `{ name, email, password }` | Registers new user account with default `DISPATCHER` role. |
| `POST` | `/api/auth/sign-out` | None | Invalidates session and clears cookies. |

### 2. Dashboard Analytics
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/dashboard` | Returns aggregated metrics, monthly trend curves, status shares, technician workloads, activity feeds, and prioritized alerts. |

### 3. Customer Management
| Method | Endpoint | Query / Body Params | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/customers` | `?search=&city=&page=1&limit=10` | Paginated customer registry with multi-field search and city filters. |
| `POST` | `/api/customers` | `{ name, email, phone, address, city, company, notes }` | Creates a new customer account (`ADMIN` / `DISPATCHER` only). |
| `GET` | `/api/customers/[id]` | `id: UUID` | Fetches customer details, contact data, and associated work order history. |
| `PUT` | `/api/customers/[id]` | `{ name, email, phone, address, city, ... }` | Updates customer information (`ADMIN` / `DISPATCHER` only). |
| `DELETE` | `/api/customers/[id]` | `id: UUID` | Deletes customer (blocks if active work orders exist). |

### 4. Technician Management
| Method | Endpoint | Query / Body Params | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/technicians` | `?search=&status=&page=1&limit=10` | Lists technicians with active job counts and availability status. |
| `POST` | `/api/technicians` | `{ name, email, phone, specialization, skills, status, serviceArea }` | Provisions a new technician (`ADMIN` / `DISPATCHER` only). |
| `GET` | `/api/technicians/[id]`| `id: UUID` | Returns single technician profile, certifications, and active job queue. |
| `PUT` | `/api/technicians/[id]`| `{ status, specialization, skills, ... }` | Modifies technician record (`ADMIN` / `DISPATCHER` only). |
| `DELETE` | `/api/technicians/[id]`| `id: UUID` | Removes technician (blocked if active jobs are assigned). |

### 5. Work Order Management
| Method | Endpoint | Query / Body Params | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/work-orders` | `?search=&status=&priority=&technicianId=&page=1` | Searchable, filterable work order list. Automatically scoped for `TECHNICIAN`. |
| `POST` | `/api/work-orders` | `{ title, description, customerId, technicianId, priority, scheduledAt }` | Validates technician availability, creates work order, and inserts initial `StatusLog`. |
| `GET` | `/api/work-orders/[id]`| `id: UUID` | Retrieves job details, customer info, technician data, and complete `statusLogs` timeline. |
| `PUT` | `/api/work-orders/[id]`| `{ status, completionNotes, ... }` | Updates order / transitions state; auto-logs `StatusLog` entry and updates technician availability. |
| `DELETE` | `/api/work-orders/[id]`| `id: UUID` | Removes work order (cascades associated status logs). |

### 6. Reports & SLA Analytics
| Method | Endpoint | Query / Body Params | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/reports` | `?timeRange=6m&startDate=&endDate=` | Aggregated SLA metrics, technician performance benchmarks, monthly velocity, priority distribution, and customer volume rankings. |

### 7. In-App Notifications
| Method | Endpoint | Query / Body Params | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/notifications` | `?unreadOnly=false&limit=30` | Returns user's in-app notifications and real-time unread count. |
| `PUT` | `/api/notifications` | None | Marks all notifications as read for current user. |
| `DELETE` | `/api/notifications` | None | Clears all read notifications for current user. |
| `PATCH` | `/api/notifications/[id]` | `{ isRead: boolean }` | Toggles read state of a single notification. |
| `DELETE` | `/api/notifications/[id]` | `id: UUID` | Deletes single notification owned by current user. |

### 8. User Access & Role Administration (`ADMIN` Only)
| Method | Endpoint | Query / Body Params | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users` | None | Lists all registered users, system roles, and unassigned technician profiles. |
| `PUT` | `/api/users/[id]` | `{ role: "ADMIN" \| "DISPATCHER" \| "TECHNICIAN", technicianId?: string }` | Updates user role and optionally links a technician profile. |
| `DELETE` | `/api/users/[id]` | `id: UUID` | Deletes user account (prevents self-deletion). |

### 9. Activity Logs & Audit Trail (`ADMIN` & `DISPATCHER`)
| Method | Endpoint | Query / Body Params | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/audit-logs` | `?search=&entityType=&action=&userRole=&userId=&startDate=&endDate=&page=1&limit=15` | Multi-field search, filterable, and paginated immutable audit logs with forensic metadata. |

---

## 📸 Diagrams & UI Showcase

### 🏛️ System Architecture
<div align="center">
  <img src="docs/images/diagrams/system-architecture.png" alt="FieldFlow System Architecture Diagram" width="850" />
</div>

### 🔄 Work Order Lifecycle State Machine
<div align="center">
  <img src="docs/images/diagrams/work-order-lifecycle.png" alt="FieldFlow Work Order Lifecycle Diagram" width="850" />
</div>

### 🗄️ Entity Relationship Diagram (ERD)
<div align="center">
  <img src="docs/images/diagrams/erd.png" alt="FieldFlow Entity Relationship Diagram" width="850" />
</div>

### 📱 UI Wireframes & Layout Views
| Module | Wireframe Preview |
| :--- | :--- |
| **Executive Dashboard** | [`docs/images/wireframes/dashboard-wireframe.png`](docs/images/wireframes/dashboard-wireframe.png) |
| **Work Order Dispatch** | [`docs/images/wireframes/work-orders-wireframe.png`](docs/images/wireframes/work-orders-wireframe.png) |
| **Technician "My Jobs" Queue** | [`docs/images/wireframes/my-jobs-wireframe.png`](docs/images/wireframes/my-jobs-wireframe.png) |
| **Customer Relationship Hub** | [`docs/images/wireframes/customers-wireframe.png`](docs/images/wireframes/customers-wireframe.png) |
| **Technician Roster & Skills** | [`docs/images/wireframes/technicians-wireframe.png`](docs/images/wireframes/technicians-wireframe.png) |
| **Authentication & Sign-In** | [`docs/images/wireframes/login-wireframe.png`](docs/images/wireframes/login-wireframe.png) |

---

## 🧪 Testing & Quality Assurance

FieldFlow features an automated end-to-end verification suite covering authentication, RBAC authorization, CRUD operations, state transitions, and audit logging:

```bash
# Run the automated RBAC and Route Verification Suite
node scratch/verify-all-routes-rbac.mjs
```

### Verification Test Summary
- **RBAC Security Tests**: 100% route verification ensuring `TECHNICIAN` role is blocked (`403 Forbidden`) from customer/technician creations, and `DISPATCHER` is blocked from user administration.
- **Work Order State Machine Tests**: Verified valid transitions (`OPEN` $\rightarrow$ `ASSIGNED` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `COMPLETED`) and rejection of invalid skips.
- **Audit Logging Instrumentation**: Verified all 18 action codes are logged to `audit_log` with correct actor attribution.
- **Database Integrity**: Full foreign key cascading constraints and duplicate prevention verified against Neon PostgreSQL.

---

## 🚀 Deployment Guide

### Deploying to Vercel + Neon PostgreSQL

1. **Push your repository** to GitHub.
2. **Import project** in [Vercel](https://vercel.com).
3. **Configure Environment Variables** in Vercel project settings:
   - `DATABASE_URL`: Your Neon PostgreSQL pooled connection string.
   - `BETTER_AUTH_SECRET`: A 32+ character random hex string.
   - `BETTER_AUTH_URL`: Your production domain (e.g. `https://your-fieldflow-app.vercel.app`).
   - `NEXT_PUBLIC_APP_URL`: Your production domain.
4. **Deploy**: Vercel will automatically run `npm run build` and deploy the Next.js application.

For detailed production configuration, refer to [`DEPLOYMENT.md`](DEPLOYMENT.md).

---

## 🔮 Future Roadmap

- [ ] **GPS Live Fleet Tracking**: Real-time geolocation tracking for on-site and en-route field technicians.
- [ ] **Automated AI Dispatch Optimizer**: Intelligent automated technician matching based on location proximity, skills, and current route.
- [ ] **Integrated Invoicing & Stripe Escrow**: Automated invoice generation upon `COMPLETED` status with customer payment collection.
- [ ] **Customer Self-Service Portal**: Dedicated client portal for ticket submission and real-time technician arrival tracking.
- [ ] **Offline-First Mobile PWA**: Service worker caching and background sync for field technicians working in zero-connectivity environments.

---

## 🎓 Contributors & License

This project was engineered as a full-stack SaaS reference implementation demonstrating modern web development standards, scalable relational schema design, session authentication, and real-time dashboard analytics.

- **Developer**: FieldFlow Engineering Team
- **Course / Degree Submission**: Full-Stack Web Application Development / Software Engineering
- **Institution**: Computer Science & Software Engineering Faculty

### 📄 License
This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <sub>Built with ❤️ using Next.js 16, React 19, Prisma ORM, Neon PostgreSQL, and Better Auth.</sub>
</div>
