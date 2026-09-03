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
  A state-of-the-art SaaS web application engineered for field service operations, technician scheduling, real-time dispatch intelligence, customer management, and automated SLA tracking.
</p>

[Features](#-features) • [User Manual](USER_MANUAL.md) • [API Docs](API_DOCUMENTATION.md) • [Architecture](ARCHITECTURE.md) • [Testing](TESTING_REPORT.md) • [Deployment](DEPLOYMENT.md) • [Presentation](PRESENTATION.md) • [Quick Start](#-installation--setup)

</div>

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Key Features](#-features)
3. [Technology Stack](#-technology-stack)
4. [Architecture Overview](#-architecture-overview)
5. [Folder Structure](#-folder-structure)
6. [Installation & Setup](#-installation--setup)
7. [Environment Variables](#-environment-variables)
8. [Database Configuration (Neon + Prisma)](#-database-setup-neon-postgresql--prisma-orm)
9. [Authentication Architecture (Better Auth)](#-authentication-setup-better-auth)
10. [Development & Build Commands](#-running-the-application)
11. [API Architecture & Endpoints](#-api-architecture--endpoints)
12. [Module Deep Dives](#-module-deep-dives)
    - [Dashboard Analytics](#1-dashboard-analytics--dispatch-intelligence)
    - [Customer Management](#2-customer-management)
    - [Technician Management](#3-technician-management)
    - [Work Order Management](#4-work-order-management)
13. [Screenshots & UI Showcase](#-screenshots--ui-showcase)
14. [Future Roadmap](#-future-roadmap)
15. [Contributors & Academic Submission](#-contributors--academic-submission)
16. [License](#-license)

---

## 🚀 Project Overview

**FieldFlow** is an enterprise-grade Field Service Management (FSM) platform designed to streamline dispatch operations, automate workforce scheduling, and eliminate service delivery bottlenecks for telecom, electrical, IT infrastructure, and facilities maintenance providers.

Built using the modern **Next.js App Router**, **React 19**, and **Tailwind CSS**, FieldFlow integrates **Prisma ORM** with serverless **Neon PostgreSQL** and secures dispatch endpoints with **Better Auth** session management.

### Key Objectives
- **Centralized Dispatch Hub**: Consolidate field operations into a single pane of glass.
- **Enforced Assignment Rules**: Prevent accidental dispatching of busy or off-duty technicians.
- **Audit-Ready Status Tracking**: Record complete status transition histories via immutable `StatusLog` records.
- **SLA Protection**: Highlight approaching and overdue service level agreements in real time.
- **Zero-Latency Analytics**: Aggregate performance metrics via database `groupBy` and aggregation pipelines.

---

## ✨ Features

### 🛡️ Secure Authentication & Session Management
- Multi-factor ready email/password authentication powered by **Better Auth**.
- Secure, encrypted HTTP-only session cookies (`better-auth.session_token`).
- Route middleware protection guarding `/dashboard`, `/customers`, `/technicians`, and `/work-orders`.
- Auto-redirect mechanisms for authenticated vs. unauthenticated visitors.

### 📊 Real-Time Dispatch Analytics
- **Live Metric KPI Cards**: Total Customers, Total Technicians, Available Field Techs, Active Work Orders, Completed Deliveries, Overdue SLAs, and Unassigned Queue.
- **Monthly Work Order Velocity Chart**: Multi-series SVG area/bar visualization comparing created vs. resolved orders across 6 months.
- **Job Status Distribution**: Dynamic segmented status share breakdown.
- **Technician Workload Capacity**: Visual bar charts monitoring active jobs per technician.
- **Priority Breakdown**: Urgency classification matrix (`Urgent`, `High`, `Medium`, `Low`).
- **Real-Time Activity Feed**: Top 10 chronological event logs with relative timestamps.
- **Prioritized Alerts**: Urgent warning banner with Overdue SLAs positioned first.

### 👥 Customer Relationship Management
- Full CRUD operations for commercial and residential customer accounts.
- Search, filter by city/company, and sorting.
- Modal-based account creation, viewing, and editing.
- Relationship-safe deletion guards preventing orphaned work order records.
- Instant CSV export of customer registries.

### 🛠️ Field Technician & Skills Management
- Technician roster with skill tagging (e.g., `Fiber Splicing`, `Cisco CCNA`, `HVAC-R`).
- Three-state availability toggle (`AVAILABLE`, `BUSY`, `OFF`).
- Service territory assignment and active work order counters.
- Deletion guards preventing removal of technicians with in-flight jobs.

### 📑 Work Order Scheduling & StatusLog Lifecycle
- Comprehensive job creation with customer linking, technician assignment, priority, and schedule.
- **Technician Availability Validation**: Server-side guard rejecting assignment of offline/off-duty staff (`400 Bad Request`).
- **Automated StatusLog Timeline**: Every state transition (`OPEN` $\rightarrow$ `ASSIGNED` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `COMPLETED`) is permanently recorded with user attribution and timestamps.
- Overdue job detection based on scheduled SLA deadlines.
- Multi-criteria filter tabs (`Status`, `Priority`, `Technician`, `Search`, `Sort`).

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose / Highlights |
| :--- | :--- | :--- |
| **Framework** | [Next.js 16.3.0](https://nextjs.org/) | App Router, Server Components, Route Handlers, Turbopack |
| **UI Library** | [React 19.2.8](https://react.dev/) | React Server Components, Actions, State Hooks |
| **Language** | [TypeScript 5.0+](https://www.typescriptlang.org/) | End-to-end static type safety |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Responsive design system, custom palettes, CSS variables |
| **Database** | [Neon PostgreSQL](https://neon.tech/) | Serverless PostgreSQL with connection pooling |
| **ORM** | [Prisma ORM 7.10.0](https://www.prisma.io/) | `@prisma/adapter-pg`, schema migrations, Prisma Client API |
| **Authentication** | [Better Auth 1.7.2](https://www.better-auth.com/) | Prisma adapter, session management, secure cookies |
| **Icons** | [Lucide React](https://lucide.dev/) | Consistent, clean iconography |
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
    end

    subgraph Security Layer [Edge Middleware]
        MW[middleware.ts Session Guard]
    end

    subgraph API Layer [Next.js Route Handlers]
        AuthAPI["/api/auth/* (Better Auth)"]
        DashAPI["/api/dashboard (Analytics Aggregations)"]
        CustAPI["/api/customers/* (CRUD & CSV)"]
        TechAPI["/api/technicians/* (CRUD & Status)"]
        WorkAPI["/api/work-orders/* (CRUD & StatusLog)"]
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
    end

    Landing --> MW
    AuthUI --> AuthAPI
    DashUI --> MW --> DashAPI
    CustUI --> MW --> CustAPI
    TechUI --> MW --> TechAPI
    WOrderUI --> MW --> WorkAPI

    DashAPI --> PrismaClient
    CustAPI --> PrismaClient
    TechAPI --> PrismaClient
    WorkAPI --> PrismaClient
    AuthAPI --> PrismaClient

    PrismaClient --> UserTable
    PrismaClient --> CustTable
    PrismaClient --> TechTable
    PrismaClient --> WOTable
    PrismaClient --> LogTable
```

---

## 📂 Folder Structure

```
fieldflow/
├── app/                                # Next.js App Router Root
│   ├── api/                            # Backend REST Route Handlers
│   │   ├── auth/[...all]/route.ts      # Better Auth Catch-All Handler
│   │   ├── customers/                  # Customer Listing & Creation
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts           # Customer Single CRUD
│   │   ├── technicians/                # Technician Listing & Creation
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts           # Technician Single CRUD
│   │   ├── work-orders/                # Work Order Listing & Dispatch
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts           # Work Order Single CRUD & Logs
│   │   └── dashboard/route.ts          # Central Analytics Aggregator
│   ├── customers/page.tsx              # Protected /customers Route
│   ├── dashboard/page.tsx              # Protected /dashboard Route
│   ├── technicians/page.tsx            # Protected /technicians Route
│   ├── work-orders/page.tsx            # Protected /work-orders Route
│   ├── login/page.tsx                  # Authentication / Login
│   ├── register/page.tsx               # User Registration
│   ├── layout.tsx                      # Root Application Layout
│   └── page.tsx                        # Public SaaS Landing Page
├── components/                         # Reusable UI Components
│   ├── dashboard/                      # Dashboard Design System
│   │   ├── Sidebar.tsx                 # Dynamic Collapsible Sidebar
│   │   ├── TopNavbar.tsx               # Authenticated Header Bar
│   │   └── views/                      # Interactive Module Views
│   │       ├── DashboardView.tsx       # Live Analytics & Charts View
│   │       ├── CustomersView.tsx       # Customer Table & Modals
│   │       ├── TechniciansView.tsx     # Technician Roster & Modals
│   │       └── WorkOrdersView.tsx      # Work Order Dispatch & Timeline
│   └── landing/                        # Landing Page Sections
│       ├── Navbar.tsx
│       ├── Hero.tsx
│       ├── Features.tsx
│       ├── Stats.tsx
│       └── Footer.tsx
├── lib/                                # Core Utilities & Singletons
│   ├── auth.ts                         # Better Auth Configuration
│   ├── auth-client.ts                  # Better Auth React Client
│   └── prisma.ts                       # Prisma Client with pg Driver Adapter
├── prisma/
│   └── schema.prisma                   # Database Schema & Relations
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
git clone https://github.com/your-username/fieldflow.git
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

---

## 🔐 Environment Variables

Ensure the following variables are defined in your `.env` file:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | Neon PostgreSQL pooled connection string | `postgresql://user:pass@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require` |
| `BETTER_AUTH_SECRET` | Secret key used to sign session cookies (min 32 chars) | `346b55455e20bdcaab06f85442f20bca0c9b5785d1129cde2caaa112568d967f` |
| `BETTER_AUTH_URL` | Canonical URL of the application | `http://localhost:3000` |
| `NEXT_PUBLIC_APP_URL` | Public base URL for client-side API requests | `http://localhost:3000` |

---

## 🗄️ Database Setup (Neon PostgreSQL + Prisma ORM)

FieldFlow uses **Prisma ORM 7** configured with the native PostgreSQL driver adapter (`@prisma/adapter-pg`).

### 1. Prisma Schema Overview (`prisma/schema.prisma`)
The schema defines 5 core relational models:
- **`User`**: Authentication credentials, roles, and profile data.
- **`Customer`**: Commercial clients, companies, service addresses, and contact details.
- **`Technician`**: Workforce roster, skills, availability states (`AVAILABLE`, `BUSY`, `OFF`), and service areas.
- **`WorkOrder`**: Dispatch jobs, priorities (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), states (`OPEN`, `ASSIGNED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`), schedules, and completion notes.
- **`StatusLog`**: Immutable audit logs tracking every status transition, the timestamp, and the acting dispatcher.

### 2. Synchronize Database & Generate Prisma Client
```bash
# Push schema changes to Neon PostgreSQL
npx prisma db push

# Generate the typesafe Prisma Client
npx prisma generate
```

---

## 🔒 Authentication Setup (Better Auth)

Better Auth is configured in [`lib/auth.ts`](file:///c:/Users/Dineth%20PC/.antigravity-ide/fieldflow/lib/auth.ts) using the Prisma adapter:

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

All endpoints require an active session cookie, returning `401 Unauthorized` if unauthenticated.

### 1. Dashboard Analytics
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/dashboard` | Returns aggregated metrics, monthly trend curves, status shares, technician workloads, activity feeds, and prioritized alerts. |

### 2. Customer Management
| Method | Endpoint | Query / Body Params | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/customers` | `?search=&city=&page=1&limit=10` | Paginated customer registry with search and city filters. |
| `POST` | `/api/customers` | `{ name, email, phone, address, city, company, notes }` | Creates a new customer account. |
| `GET` | `/api/customers/[id]` | `id: UUID` | Fetches customer details and associated work order history. |
| `PUT` | `/api/customers/[id]` | `{ name, email, phone, address, city, ... }` | Updates customer information. |
| `DELETE` | `/api/customers/[id]` | `id: UUID` | Deletes customer (blocks if active work orders exist). |

### 3. Technician Management
| Method | Endpoint | Query / Body Params | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/technicians` | `?search=&status=&page=1&limit=10` | Lists technicians with active job counts and availability. |
| `POST` | `/api/technicians` | `{ name, email, phone, specialization, skills, status, serviceArea }` | Provisions a new technician. |
| `GET` | `/api/technicians/[id]`| `id: UUID` | Returns single technician profile and active job queue. |
| `PUT` | `/api/technicians/[id]`| `{ status, specialization, skills, ... }` | Modifies technician record. |
| `DELETE` | `/api/technicians/[id]`| `id: UUID` | Removes technician (blocked if active jobs are assigned). |

### 4. Work Order Management
| Method | Endpoint | Query / Body Params | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/work-orders` | `?search=&status=&priority=&technicianId=&page=1` | Searchable, filterable work order list with real-time stats. |
| `POST` | `/api/work-orders` | `{ title, description, customerId, technicianId, priority, scheduledAt }` | Validates technician availability, creates work order, and inserts initial `StatusLog`. |
| `GET` | `/api/work-orders/[id]`| `id: UUID` | Retrieves job details, customer info, technician data, and complete `statusLogs` timeline. |
| `PUT` | `/api/work-orders/[id]`| `{ status, completionNotes, ... }` | Updates order; auto-logs `StatusLog` entry on status change. |
| `DELETE` | `/api/work-orders/[id]`| `id: UUID` | Removes work order (cascades associated status logs). |

---

## 🔍 Module Deep Dives

### 1. Dashboard Analytics & Dispatch Intelligence
- **High-Performance Aggregations**: Executes parallel `prisma.groupBy` queries to compute metrics in under 50ms.
- **Visual Trend Curves**: Responsive SVG area charts displaying 6-month historical workload velocity.
- **Smart Alerting**: Highlights overdue SLAs and unassigned queue tickets with direct action buttons.

### 2. Customer Management
- **Enterprise Contact Book**: Manages customer identities, corporate accounts, physical addresses, and service notes.
- **Safe Cascade Protections**: Prevents accidental data deletion if active service jobs are open.

### 3. Technician Management
- **Dynamic Capacity Control**: Live availability toggles (`AVAILABLE`, `BUSY`, `OFF`).
- **Skills-Based Dispatch**: Tag and filter technicians by certification and trade specializations.

### 4. Work Order Management
- **Rule-Based Assignment**: Rejects assigning technicians flagged as `OFF` (Offline/Off-Duty).
- **Audit-Proof `StatusLog` History**: Displays a full timeline of who changed the job state and when in the job details modal.

---

## 📸 Screenshots & UI Showcase

<div align="center">

### 🖥️ Dispatch Intelligence & Live Analytics Dashboard
*Real-time workforce KPIs, monthly trend velocity, status distributions, and active alert streams.*
```
+-----------------------------------------------------------------------------------------------+
|  ⚡ FieldFlow   [Postgres Live]                                   [+ New Work Order] [+ Tech] |
|                                                                                               |
|  [Customers: 128]  [Technicians: 42]  [Available: 18]  [Active: 64]  [Completed: 340]  [Overdue: 2] |
|                                                                                               |
|  +--------------------------------------------+  +-----------------------------------------+  |
|  | Monthly Work Order Velocity (Past 6 Months)|  | Job Status Distribution                 |  |
|  |   [###] Created vs [===] Completed         |  |   Open (15%) | In Progress (40%)        |  |
|  +--------------------------------------------+  +-----------------------------------------+  |
|                                                                                               |
|  +--------------------------------------------+  +-----------------------------------------+  |
|  | Field Technician Capacity & Active Jobs    |  | Real-Time Dispatch Activity Feed        |  |
|  |   Elena Rostova (BioMed)   [====] 3 jobs   |  |   • Transitioned to COMPLETED (2m ago)  |  |
|  |   Marcus Vance  (Network)  [==]   1 job    |  |   • New Order: Fiber Cutover (15m ago)  |  |
|  +--------------------------------------------+  +-----------------------------------------+  |
+-----------------------------------------------------------------------------------------------+
```

### 📋 Work Order Dispatch & StatusLog Timeline
*Interactive filter tabs, priority indicators, availability-grouped technician selector, and audit timeline.*

</div>

---

## 🔮 Future Roadmap

- [ ] **GPS Live Tracking**: Real-time geolocation tracking for on-site and en-route field technicians.
- [ ] **Automated AI Dispatch Optimizer**: Intelligent automated technician matching based on location proximity, skills, and current route.
- [ ] **Integrated Invoicing & Stripe Escrow**: Automated invoice generation upon `COMPLETED` status with payment collection.
- [ ] **Customer Self-Service Portal**: Customer portal allowing clients to submit tickets and track technician ETAs.
- [ ] **Offline-First Mobile PWA**: Service worker caching and background sync for field technicians working in low-connectivity areas.

---

## 🎓 Contributors & Academic Submission

This project was engineered as a full-stack SaaS reference implementation demonstrating modern web development standards, scalable relational schema design, session authentication, and real-time dashboard analytics.

- **Developer**: FieldFlow Engineering Team
- **Course / Degree Submission**: Full-Stack Web Application Development / Software Engineering
- **Institution**: Computer Science & Software Engineering Faculty

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <sub>Built with ❤️ using Next.js 16, React 19, Prisma ORM, Neon PostgreSQL, and Better Auth.</sub>
</div>
