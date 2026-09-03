# ⚡ FieldFlow REST API Specification & Reference Manual

Complete REST API documentation for the **FieldFlow** Field Service Management & Workforce Dispatch Platform.

---

## 📋 Table of Contents

1. [API Overview & Conventions](#1-api-overview--conventions)
   - [Base URL & Protocol](#base-url--protocol)
   - [Authentication & Cookies](#authentication--cookies)
   - [Standard HTTP Status Codes](#standard-http-status-codes)
   - [Standard Error Response Schema](#standard-error-response-schema)
2. [Authentication Endpoints (`/api/auth`)](#2-authentication-endpoints)
   - [User Sign-Up / Registration](#21-sign-up-with-email--password)
   - [User Sign-In / Login](#22-sign-in-with-email--password)
   - [Get Current Session](#23-get-current-session)
   - [User Sign-Out / Logout](#24-sign-out--logout)
3. [Dashboard Analytics Endpoints (`/api/dashboard`)](#3-dashboard-analytics-endpoints)
   - [Get Dispatch Analytics & Aggregations](#31-get-central-dashboard-analytics)
4. [Customer Management Endpoints (`/api/customers`)](#4-customer-management-endpoints)
   - [List / Search Customers](#41-list--search-customers)
   - [Create Customer](#42-create-customer)
   - [Get Customer Details](#43-get-single-customer)
   - [Update Customer](#44-update-customer)
   - [Delete Customer](#45-delete-customer)
5. [Technician Management Endpoints (`/api/technicians`)](#5-technician-management-endpoints)
   - [List / Search Technicians](#51-list--search-technicians)
   - [Create Technician](#52-create-technician)
   - [Get Technician Details](#53-get-single-technician)
   - [Update Technician](#54-update-technician)
   - [Delete Technician](#55-delete-technician)
6. [Work Order Management Endpoints (`/api/work-orders`)](#6-work-order-management-endpoints)
   - [List / Filter Work Orders](#61-list--filter-work-orders)
   - [Create Work Order & Initial StatusLog](#62-create-work-order)
   - [Get Work Order Details & Timeline](#63-get-single-work-order--timeline)
   - [Update Work Order & Status Transition](#64-update-work-order--transition-status)
   - [Delete Work Order](#65-delete-work-order)

---

## 1. API Overview & Conventions

### Base URL & Protocol
- **Local Development**: `http://localhost:3000`
- **Production**: `https://your-domain.fieldflow.io`
- **Content-Type**: `application/json` for all POST/PUT requests.
- All requests and responses use standard JSON encoding and UTC ISO 8601 timestamp strings (`YYYY-MM-DDTHH:mm:ss.sssZ`).

### Authentication & Cookies
Authentication is managed via **Better Auth**. Protected endpoints inspect incoming request headers for the session cookie:
- `better-auth.session_token` (HTTP)
- `__Secure-better-auth.session_token` (HTTPS in production)

If the session cookie is missing or invalid, the API returns:
```json
{
  "error": "Unauthorized"
}
```
with HTTP status code `401 Unauthorized`.

### Standard HTTP Status Codes

| Code | Status | Description |
| :--- | :--- | :--- |
| `200` | **OK** | Request succeeded. Response body contains requested data or success confirmation. |
| `201` | **Created** | Resource created successfully. Response body contains newly created entity. |
| `400` | **Bad Request** | Validation failed, missing required fields, or business logic violated. |
| `401` | **Unauthorized** | Missing or invalid Better Auth session. |
| `404` | **Not Found** | The specified resource ID was not found in the database. |
| `409` | **Conflict** | Resource deletion blocked due to active foreign key relations. |
| `500` | **Internal Server Error** | Unexpected server or database exception. |

### Standard Error Response Schema

#### Single Error:
```json
{
  "error": "Descriptive error message explaining the failure."
}
```

#### Field-Level Validation Errors (`400 Bad Request`):
```json
{
  "error": "Validation failed",
  "errors": {
    "email": "Please provide a valid email address.",
    "phone": "Phone number must be at least 7 characters."
  }
}
```

---

## 2. Authentication Endpoints

Base path: `/api/auth`

---

### 2.1 Sign Up with Email & Password

Registers a new user in the PostgreSQL database and sets the session cookie.

- **Method**: `POST`
- **URL**: `/api/auth/sign-up/email`
- **Authentication Required**: `No`

#### Request Body
| Field | Type | Required | Validation Rules | Description |
| :--- | :--- | :--- | :--- | :--- |
| `name` | `string` | **Yes** | Min 2 characters, Max 100 characters | Full display name of the user |
| `email` | `string` | **Yes** | Valid RFC 5322 email format | Unique user email address |
| `password` | `string` | **Yes** | Min 8 characters | Account password |

```json
{
  "name": "Marcus Vance",
  "email": "marcus.vance@fieldflow.io",
  "password": "SecurePassword123!"
}
```

#### Response Example (`200 OK`)
Sets `Set-Cookie: better-auth.session_token=...; HttpOnly; Path=/; SameSite=Lax`

```json
{
  "user": {
    "id": "2b9e2584-739a-4016-a54e-a5ae71477472",
    "email": "marcus.vance@fieldflow.io",
    "name": "Marcus Vance",
    "emailVerified": false,
    "createdAt": "2026-09-03T10:45:00.000Z",
    "updatedAt": "2026-09-03T10:45:00.000Z"
  },
  "session": {
    "id": "sess_891238912389",
    "userId": "2b9e2584-739a-4016-a54e-a5ae71477472",
    "expiresAt": "2026-09-10T10:45:00.000Z"
  }
}
```

#### Error Responses
- `400 Bad Request`:
  ```json
  {
    "message": "User with this email already exists"
  }
  ```

---

### 2.2 Sign In with Email & Password

Authenticates an existing user and returns an active session token.

- **Method**: `POST`
- **URL**: `/api/auth/sign-in/email`
- **Authentication Required**: `No`

#### Request Body
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `email` | `string` | **Yes** | User email address |
| `password` | `string` | **Yes** | User account password |

```json
{
  "email": "marcus.vance@fieldflow.io",
  "password": "SecurePassword123!"
}
```

#### Response Example (`200 OK`)
Sets `Set-Cookie: better-auth.session_token=...; HttpOnly; Path=/; SameSite=Lax`

```json
{
  "user": {
    "id": "2b9e2584-739a-4016-a54e-a5ae71477472",
    "email": "marcus.vance@fieldflow.io",
    "name": "Marcus Vance",
    "emailVerified": false
  },
  "session": {
    "id": "sess_891238912389",
    "userId": "2b9e2584-739a-4016-a54e-a5ae71477472",
    "expiresAt": "2026-09-10T10:45:00.000Z"
  }
}
```

#### Error Responses
- `401 Unauthorized`:
  ```json
  {
    "message": "Invalid email or password"
  }
  ```

---

### 2.3 Get Current Session

Fetches the active user session and profile metadata.

- **Method**: `GET`
- **URL**: `/api/auth/get-session`
- **Authentication Required**: `Optional` (Returns `null` if unauthenticated)

#### Response Example (`200 OK`)
```json
{
  "user": {
    "id": "2b9e2584-739a-4016-a54e-a5ae71477472",
    "name": "Marcus Vance",
    "email": "marcus.vance@fieldflow.io"
  },
  "session": {
    "id": "sess_891238912389",
    "userId": "2b9e2584-739a-4016-a54e-a5ae71477472",
    "expiresAt": "2026-09-10T10:45:00.000Z"
  }
}
```

---

### 2.4 Sign Out / Logout

Invalidates the session token and clears the session cookie.

- **Method**: `POST`
- **URL**: `/api/auth/sign-out`
- **Authentication Required**: `Yes`

#### Response Example (`200 OK`)
```json
{
  "success": true
}
```

---

## 3. Dashboard Analytics Endpoints

Base path: `/api/dashboard`

---

### 3.1 Get Central Dashboard Analytics

Returns real-time aggregated metrics, historical trend curves, status distributions, technician workload capacities, the latest 10 activity stream events, and prioritized dispatch alerts.

- **Method**: `GET`
- **URL**: `/api/dashboard`
- **Authentication Required**: `Yes`
- **Query Parameters**: None

#### Response Example (`200 OK`)
```json
{
  "metrics": {
    "totalCustomers": 128,
    "totalTechnicians": 42,
    "availableTechnicians": 18,
    "busyTechnicians": 20,
    "offlineTechnicians": 4,
    "totalWorkOrders": 404,
    "activeWorkOrders": 64,
    "completedWorkOrders": 340,
    "cancelledWorkOrders": 0,
    "overdueWorkOrders": 2,
    "unassignedWorkOrders": 5
  },
  "charts": {
    "workOrdersByStatus": [
      { "status": "Open", "key": "OPEN", "count": 12, "percentage": 3, "color": "#0284c7" },
      { "status": "Assigned", "key": "ASSIGNED", "count": 28, "percentage": 7, "color": "#4f46e5" },
      { "status": "In Progress", "key": "IN_PROGRESS", "count": 24, "percentage": 6, "color": "#9333ea" },
      { "status": "Completed", "key": "COMPLETED", "count": 340, "percentage": 84, "color": "#10b981" },
      { "status": "Cancelled", "key": "CANCELLED", "count": 0, "percentage": 0, "color": "#64748b" }
    ],
    "monthlyTrends": [
      { "month": "Apr", "created": 45, "completed": 40 },
      { "month": "May", "created": 58, "completed": 52 },
      { "month": "Jun", "created": 64, "completed": 60 },
      { "month": "Jul", "created": 72, "completed": 68 },
      { "month": "Aug", "created": 80, "completed": 75 },
      { "month": "Sep", "created": 85, "completed": 45 }
    ],
    "technicianWorkload": [
      {
        "id": "80f9b646-5d67-4c85-bf6a-4d1a4c69273a",
        "name": "Alex Rivera",
        "specialization": "Retail POS & Terminal Systems",
        "status": "AVAILABLE",
        "activeOrders": 3
      },
      {
        "id": "e2dd1049-7a98-4ac1-9a09-f78b855f615d",
        "name": "Samantha Wright",
        "specialization": "Enterprise Network Infrastructure",
        "status": "BUSY",
        "activeOrders": 4
      }
    ],
    "workOrdersByPriority": [
      { "priority": "Urgent", "key": "URGENT", "count": 14, "percentage": 3, "color": "#e11d48" },
      { "priority": "High", "key": "HIGH", "count": 68, "percentage": 17, "color": "#d97706" },
      { "priority": "Medium", "key": "MEDIUM", "count": 210, "percentage": 52, "color": "#2563eb" },
      { "priority": "Low", "key": "LOW", "count": 112, "percentage": 28, "color": "#64748b" }
    ]
  },
  "recentActivity": [
    {
      "id": "log-44a1b021-93e1-482a-bc91-348271618210",
      "type": "STATUS_TRANSITION",
      "title": "Cisco Core Switch 9300 Hardware Replacement status changed",
      "description": "Transitioned from IN_PROGRESS → COMPLETED by Marcus Vance",
      "timestamp": "2026-09-03T14:10:00.000Z",
      "badgeText": "COMPLETED",
      "badgeColor": "bg-emerald-50 text-emerald-700 border-emerald-200"
    },
    {
      "id": "wo-912a7812-7812-482a-bc91-348271618211",
      "type": "WORK_ORDER_CREATED",
      "title": "Work Order Dispatched: \"Emergency Fiber Splice\"",
      "description": "Created for client Apex Logistics Hub #4 with priority URGENT",
      "timestamp": "2026-09-03T13:45:00.000Z",
      "badgeText": "New Order",
      "badgeColor": "bg-sky-50 text-sky-700 border-sky-200"
    }
  ],
  "alerts": [
    {
      "id": "overdue-24e98143-a4c5-4254-92aa-76344d0010aa",
      "level": "CRITICAL",
      "type": "OVERDUE",
      "title": "Overdue SLA: Cleanroom Air Pressure Sensor",
      "message": "Scheduled for 9/3/2026, 11:00 AM for client Nexus BioTech. Needs immediate attention.",
      "targetTab": "work-orders",
      "actionText": "View Order"
    },
    {
      "id": "unassigned-6dba3222-69c7-4c80-aeaf-94f38f57eacc",
      "level": "WARNING",
      "type": "UNASSIGNED",
      "title": "Unassigned Job: Spectrometer Realignment",
      "message": "Priority: HIGH • Client: GDC Labs. Waiting in open dispatch queue.",
      "targetTab": "work-orders",
      "actionText": "Assign Tech"
    }
  ]
}
```

---

## 4. Customer Management Endpoints

Base path: `/api/customers`

---

### 4.1 List & Search Customers

Retrieves a paginated list of customers with real-time aggregated metrics.

- **Method**: `GET`
- **URL**: `/api/customers`
- **Authentication Required**: `Yes`

#### Query Parameters
| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `search` | `string` | `""` | Filters by customer `name`, `company`, `email`, `phone`, or `city` |
| `city` | `string` | `""` | Filters by exact or partial city match |
| `page` | `number` | `1` | Page number |
| `limit` | `number` | `10` | Records per page (Max: 100) |
| `sortBy` | `string` | `"createdAt"` | Sort column (`name`, `createdAt`, `city`, `company`) |
| `sortOrder` | `string` | `"desc"` | Sort direction (`asc` or `desc`) |

#### Response Example (`200 OK`)
```json
{
  "customers": [
    {
      "id": "37abe1bc-a922-481a-b47c-ff16ebdf46f7",
      "name": "Apex Global Logistics",
      "company": "Apex Enterprise Hub",
      "email": "contact@apex.com",
      "phone": "+1 (555) 444-3322",
      "address": "500 Logistics Blvd, Suite 200",
      "city": "Dallas, TX",
      "notes": "Gate code #4421. Check in at security trailer.",
      "createdAt": "2026-09-01T08:00:00.000Z",
      "updatedAt": "2026-09-01T08:00:00.000Z",
      "_count": {
        "workOrders": 8
      }
    }
  ],
  "pagination": {
    "total": 128,
    "page": 1,
    "limit": 10,
    "totalPages": 13
  },
  "stats": {
    "totalCustomers": 128,
    "commercialCount": 94,
    "residentialCount": 34
  }
}
```

---

### 4.2 Create Customer

Creates a new customer record.

- **Method**: `POST`
- **URL**: `/api/customers`
- **Authentication Required**: `Yes`

#### Request Body
| Field | Type | Required | Validation Rules | Description |
| :--- | :--- | :--- | :--- | :--- |
| `name` | `string` | **Yes** | Min 2 chars, Max 100 chars | Customer full name |
| `company` | `string` | No | Max 100 chars | Organization name (if commercial) |
| `email` | `string` | **Yes** | Valid RFC 5322 format | Primary contact email |
| `phone` | `string` | **Yes** | Min 7 chars, Max 20 chars | Primary telephone number |
| `address` | `string` | **Yes** | Min 5 chars | Physical service address |
| `city` | `string` | **Yes** | Min 2 chars | City and state code |
| `notes` | `string` | No | Max 500 chars | Site access instructions / gate codes |

```json
{
  "name": "OmniRetail SuperCenters",
  "company": "OmniRetail Group",
  "email": "store882@omniretail.com",
  "phone": "+1 (555) 333-2211",
  "address": "8800 Highway 183 North",
  "city": "Austin, TX",
  "notes": "Loading dock entrance on North side."
}
```

#### Response Example (`201 Created`)
```json
{
  "id": "37abe1bc-a922-481a-b47c-ff16ebdf46f7",
  "name": "OmniRetail SuperCenters",
  "company": "OmniRetail Group",
  "email": "store882@omniretail.com",
  "phone": "+1 (555) 333-2211",
  "address": "8800 Highway 183 North",
  "city": "Austin, TX",
  "notes": "Loading dock entrance on North side.",
  "createdAt": "2026-09-03T14:30:00.000Z",
  "updatedAt": "2026-09-03T14:30:00.000Z"
}
```

---

### 4.3 Get Single Customer

Retrieves a customer profile and associated work orders.

- **Method**: `GET`
- **URL**: `/api/customers/:id`
- **Authentication Required**: `Yes`

#### Response Example (`200 OK`)
```json
{
  "id": "37abe1bc-a922-481a-b47c-ff16ebdf46f7",
  "name": "OmniRetail SuperCenters",
  "company": "OmniRetail Group",
  "email": "store882@omniretail.com",
  "phone": "+1 (555) 333-2211",
  "address": "8800 Highway 183 North",
  "city": "Austin, TX",
  "notes": "Loading dock entrance on North side.",
  "createdAt": "2026-09-03T14:30:00.000Z",
  "updatedAt": "2026-09-03T14:30:00.000Z",
  "workOrders": [
    {
      "id": "6dba3222-69c7-4c80-aeaf-94f38f57eacc",
      "title": "POS Terminal Upgrade (Lanes 1-8)",
      "priority": "HIGH",
      "status": "IN_PROGRESS",
      "scheduledAt": "2026-09-04T09:00:00.000Z",
      "technician": {
        "id": "80f9b646-5d67-4c85-bf6a-4d1a4c69273a",
        "name": "Alex Rivera"
      }
    }
  ]
}
```

---

### 4.4 Update Customer

Updates an existing customer record.

- **Method**: `PUT`
- **URL**: `/api/customers/:id`
- **Authentication Required**: `Yes`

#### Request Body
Same fields as `POST /api/customers`.

#### Response Example (`200 OK`)
Returns the updated customer object.

---

### 4.5 Delete Customer

Safely removes a customer. Rejects deletion with `409 Conflict` if the customer has active work orders in `OPEN`, `ASSIGNED`, or `IN_PROGRESS` status.

- **Method**: `DELETE`
- **URL**: `/api/customers/:id`
- **Authentication Required**: `Yes`

#### Response Example (`200 OK`)
```json
{
  "success": true,
  "message": "Customer \"OmniRetail SuperCenters\" deleted successfully."
}
```

#### Error Response (`409 Conflict`)
```json
{
  "error": "Cannot delete customer: Customer has 2 active work orders. Please complete or reassign active jobs first."
}
```

---

## 5. Technician Management Endpoints

Base path: `/api/technicians`

---

### 5.1 List & Search Technicians

Retrieves technicians with availability states and active job metrics.

- **Method**: `GET`
- **URL**: `/api/technicians`
- **Authentication Required**: `Yes`

#### Query Parameters
| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `search` | `string` | `""` | Matches `name`, `specialization`, `skills`, or `serviceArea` |
| `status` | `string` | `"all"` | Filters by `"AVAILABLE"`, `"BUSY"`, `"OFF"`, or `"all"` |
| `page` | `number` | `1` | Page number |
| `limit` | `number` | `10` | Records per page |
| `sortBy` | `string` | `"createdAt"` | Sort column (`name`, `status`, `createdAt`) |
| `sortOrder` | `string` | `"desc"` | Sort direction (`asc` or `desc`) |

#### Response Example (`200 OK`)
```json
{
  "technicians": [
    {
      "id": "80f9b646-5d67-4c85-bf6a-4d1a4c69273a",
      "name": "Alex Rivera",
      "email": "alex.rivera@fieldflow.io",
      "phone": "+1 (555) 777-9988",
      "specialization": "Retail POS & Terminal Systems",
      "skills": ["Verifone EMV", "Ingenico Lane/7000", "NCR Kiosks"],
      "status": "AVAILABLE",
      "serviceArea": "Austin Metro",
      "notes": "Available for night shifts.",
      "createdAt": "2026-09-02T10:00:00.000Z",
      "updatedAt": "2026-09-02T10:00:00.000Z",
      "activeWorkOrdersCount": 2,
      "totalWorkOrdersCount": 24
    }
  ],
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  },
  "stats": {
    "totalTechnicians": 42,
    "availableCount": 18,
    "busyCount": 20,
    "offlineCount": 4
  }
}
```

---

### 5.2 Create Technician

Provisions a new technician into the workforce roster.

- **Method**: `POST`
- **URL**: `/api/technicians`
- **Authentication Required**: `Yes`

#### Request Body
| Field | Type | Required | Validation Rules | Description |
| :--- | :--- | :--- | :--- | :--- |
| `name` | `string` | **Yes** | Min 2 chars | Full technician name |
| `email` | `string` | **Yes** | Unique email format | Corporate technician email |
| `phone` | `string` | **Yes** | Min 7 chars | Contact number |
| `specialization` | `string` | **Yes** | Min 2 chars | Primary trade specialization |
| `skills` | `string[]` | No | Array of strings | Skill badges and certifications |
| `status` | `string` | No | `"AVAILABLE"`, `"BUSY"`, `"OFF"` | Initial status (Default: `"AVAILABLE"`) |
| `serviceArea` | `string` | No | Max 100 chars | Assigned coverage territory |
| `notes` | `string` | No | Max 500 chars | Dispatcher internal notes |

```json
{
  "name": "Samantha Wright",
  "email": "samantha.wright@fieldflow.io",
  "phone": "+1 (555) 999-1122",
  "specialization": "Enterprise Network Infrastructure",
  "skills": ["Cisco CCNA", "Fluke Certified", "Cat6A Cabling"],
  "status": "AVAILABLE",
  "serviceArea": "Dallas Metro"
}
```

#### Response Example (`201 Created`)
```json
{
  "id": "e2dd1049-7a98-4ac1-9a09-f78b855f615d",
  "name": "Samantha Wright",
  "email": "samantha.wright@fieldflow.io",
  "phone": "+1 (555) 999-1122",
  "specialization": "Enterprise Network Infrastructure",
  "skills": ["Cisco CCNA", "Fluke Certified", "Cat6A Cabling"],
  "status": "AVAILABLE",
  "serviceArea": "Dallas Metro",
  "createdAt": "2026-09-03T15:00:00.000Z",
  "updatedAt": "2026-09-03T15:00:00.000Z"
}
```

---

### 5.3 Get Single Technician

- **Method**: `GET`
- **URL**: `/api/technicians/:id`
- **Authentication Required**: `Yes`

#### Response Example (`200 OK`)
Returns full technician object including active assigned work orders.

---

### 5.4 Update Technician

Updates status, skills, or contact info.

- **Method**: `PUT`
- **URL**: `/api/technicians/:id`
- **Authentication Required**: `Yes`

#### Request Body
Same fields as `POST /api/technicians`.

#### Response Example (`200 OK`)
Returns updated technician record.

---

### 5.5 Delete Technician

Removes a technician from the roster. Rejects deletion if technician currently has active jobs assigned.

- **Method**: `DELETE`
- **URL**: `/api/technicians/:id`
- **Authentication Required**: `Yes`

#### Response Example (`200 OK`)
```json
{
  "success": true,
  "message": "Technician \"Samantha Wright\" deleted successfully."
}
```

---

## 6. Work Order Management Endpoints

Base path: `/api/work-orders`

---

### 6.1 List & Filter Work Orders

Returns a list of work orders with multi-parameter filtering, search, and KPI counters.

- **Method**: `GET`
- **URL**: `/api/work-orders`
- **Authentication Required**: `Yes`

#### Query Parameters
| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `search` | `string` | `""` | Matches `title`, `description`, customer name, customer company, or technician name |
| `status` | `string` | `"all"` | `"OPEN"`, `"ASSIGNED"`, `"IN_PROGRESS"`, `"COMPLETED"`, `"CANCELLED"`, or `"all"` |
| `priority` | `string` | `"all"` | `"LOW"`, `"MEDIUM"`, `"HIGH"`, `"URGENT"`, or `"all"` |
| `technicianId` | `string` | `"all"` | Specific UUID, `"unassigned"`, or `"all"` |
| `customerId` | `string` | `""` | Filter by specific customer UUID |
| `page` | `number` | `1` | Page number |
| `limit` | `number` | `10` | Orders per page |
| `sortBy` | `string` | `"scheduledAt"`| Sort column (`scheduledAt`, `createdAt`, `priority`, `title`) |
| `sortOrder` | `string` | `"desc"` | Sort direction (`asc` or `desc`) |

#### Response Example (`200 OK`)
```json
{
  "workOrders": [
    {
      "id": "24e98143-a4c5-4254-92aa-76344d0010aa",
      "title": "Multi-Gigabit Fiber Core Switch Deployment",
      "description": "Deploy and patch Cisco Catalyst 9300 48-port switch stack in MDF-2.",
      "priority": "HIGH",
      "status": "ASSIGNED",
      "scheduledAt": "2026-09-04T10:00:00.000Z",
      "completedAt": null,
      "completionNotes": null,
      "createdAt": "2026-09-03T11:10:00.000Z",
      "updatedAt": "2026-09-03T11:10:00.000Z",
      "customer": {
        "id": "37abe1bc-a922-481a-b47c-ff16ebdf46f7",
        "name": "Apex Global Logistics",
        "company": "Apex Enterprise Hub",
        "phone": "+1 (555) 444-3322",
        "address": "500 Logistics Blvd, Suite 200",
        "city": "Dallas, TX"
      },
      "technician": {
        "id": "e2dd1049-7a98-4ac1-9a09-f78b855f615d",
        "name": "Samantha Wright",
        "specialization": "Enterprise Network Infrastructure",
        "status": "AVAILABLE"
      }
    }
  ],
  "pagination": {
    "total": 64,
    "page": 1,
    "limit": 10,
    "totalPages": 7
  },
  "stats": {
    "totalWorkOrders": 404,
    "openCount": 12,
    "assignedCount": 28,
    "inProgressCount": 24,
    "completedCount": 340,
    "cancelledCount": 0,
    "overdueCount": 2
  }
}
```

---

### 6.2 Create Work Order

Validates technician availability, creates the work order, and inserts an initial `StatusLog` entry.

- **Method**: `POST`
- **URL**: `/api/work-orders`
- **Authentication Required**: `Yes`

#### Business & Validation Rules:
1. `title`: Required (Min 3 chars).
2. `customerId`: Required (Must exist in database).
3. `priority`: Must be `"LOW"`, `"MEDIUM"`, `"HIGH"`, or `"URGENT"`.
4. **Technician Availability Guard**: If `technicianId` is provided, technician must exist and their status must **NOT** be `"OFF"` (Offline/Off-Duty). If `"OFF"`, the API returns `400 Bad Request`.
5. **Auto-Assignment State**: If a valid technician is assigned on creation with status `"OPEN"`, the status is automatically transitioned to `"ASSIGNED"`.
6. **Automatic StatusLog Creation**: Creates an initial `StatusLog` entry linking `workOrderId`, `changedById: session.user.id`, `fromStatus: "OPEN"`, and `toStatus`.

#### Request Body
```json
{
  "title": "Emergency POS Terminal Migration (Lanes 1-8)",
  "description": "Overnight upgrade of 8 registers to Ingenico Lane/7000 EMV terminals",
  "customerId": "37abe1bc-a922-481a-b47c-ff16ebdf46f7",
  "technicianId": "80f9b646-5d67-4c85-bf6a-4d1a4c69273a",
  "priority": "URGENT",
  "status": "ASSIGNED",
  "scheduledAt": "2026-09-04T02:00:00.000Z",
  "completionNotes": "Store manager contact: Jane Doe (Ext 402)"
}
```

#### Response Example (`201 Created`)
```json
{
  "id": "6dba3222-69c7-4c80-aeaf-94f38f57eacc",
  "title": "Emergency POS Terminal Migration (Lanes 1-8)",
  "description": "Overnight upgrade of 8 registers to Ingenico Lane/7000 EMV terminals",
  "customerId": "37abe1bc-a922-481a-b47c-ff16ebdf46f7",
  "technicianId": "80f9b646-5d67-4c85-bf6a-4d1a4c69273a",
  "priority": "URGENT",
  "status": "ASSIGNED",
  "scheduledAt": "2026-09-04T02:00:00.000Z",
  "completedAt": null,
  "completionNotes": "Store manager contact: Jane Doe (Ext 402)",
  "createdAt": "2026-09-03T16:00:00.000Z",
  "updatedAt": "2026-09-03T16:00:00.000Z",
  "customer": {
    "id": "37abe1bc-a922-481a-b47c-ff16ebdf46f7",
    "name": "Apex Global Logistics"
  },
  "technician": {
    "id": "80f9b646-5d67-4c85-bf6a-4d1a4c69273a",
    "name": "Alex Rivera"
  }
}
```

#### Error Response: Offline Technician Assignment Rejection (`400 Bad Request`)
```json
{
  "error": "Validation failed",
  "errors": {
    "technicianId": "Cannot assign technician \"Dmitri Volkov\": Technician is currently Offline / Off-Duty."
  }
}
```

---

### 6.3 Get Single Work Order & Timeline

Retrieves the complete work order record along with customer details, assigned technician, and the full `StatusLog` chronological history.

- **Method**: `GET`
- **URL**: `/api/work-orders/:id`
- **Authentication Required**: `Yes`

#### Response Example (`200 OK`)
```json
{
  "id": "6dba3222-69c7-4c80-aeaf-94f38f57eacc",
  "title": "Emergency POS Terminal Migration (Lanes 1-8)",
  "description": "Overnight upgrade of 8 registers to Ingenico Lane/7000 EMV terminals",
  "priority": "URGENT",
  "status": "COMPLETED",
  "scheduledAt": "2026-09-04T02:00:00.000Z",
  "completedAt": "2026-09-04T05:30:00.000Z",
  "completionNotes": "All 8 registers upgraded, calibrated, and passing test payments.",
  "createdAt": "2026-09-03T16:00:00.000Z",
  "updatedAt": "2026-09-04T05:30:00.000Z",
  "customer": {
    "id": "37abe1bc-a922-481a-b47c-ff16ebdf46f7",
    "name": "Apex Global Logistics",
    "company": "Apex Enterprise Hub",
    "email": "contact@apex.com",
    "phone": "+1 (555) 444-3322",
    "address": "500 Logistics Blvd, Suite 200",
    "city": "Dallas, TX"
  },
  "technician": {
    "id": "80f9b646-5d67-4c85-bf6a-4d1a4c69273a",
    "name": "Alex Rivera",
    "phone": "+1 (555) 777-9988",
    "specialization": "Retail POS & Terminal Systems",
    "status": "AVAILABLE"
  },
  "statusLogs": [
    {
      "id": "log-003",
      "fromStatus": "IN_PROGRESS",
      "toStatus": "COMPLETED",
      "changedAt": "2026-09-04T05:30:00.000Z",
      "changedBy": {
        "id": "2b9e2584-739a-4016-a54e-a5ae71477472",
        "name": "Marcus Vance",
        "email": "marcus.vance@fieldflow.io"
      }
    },
    {
      "id": "log-002",
      "fromStatus": "ASSIGNED",
      "toStatus": "IN_PROGRESS",
      "changedAt": "2026-09-04T02:15:00.000Z",
      "changedBy": {
        "id": "2b9e2584-739a-4016-a54e-a5ae71477472",
        "name": "Marcus Vance",
        "email": "marcus.vance@fieldflow.io"
      }
    },
    {
      "id": "log-001",
      "fromStatus": "OPEN",
      "toStatus": "ASSIGNED",
      "changedAt": "2026-09-03T16:00:00.000Z",
      "changedBy": {
        "id": "2b9e2584-739a-4016-a54e-a5ae71477472",
        "name": "Marcus Vance",
        "email": "marcus.vance@fieldflow.io"
      }
    }
  ]
}
```

---

### 6.4 Update Work Order & Transition Status

Updates job details. If the `status` field changes, automatically creates a new `StatusLog` entry and sets `completedAt` timestamp if transitioned to `"COMPLETED"`.

- **Method**: `PUT`
- **URL**: `/api/work-orders/:id`
- **Authentication Required**: `Yes`

#### Request Body
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `title` | `string` | **Yes** | Updated job title |
| `description` | `string` | **Yes** | Scope description |
| `customerId` | `string` | **Yes** | Customer UUID |
| `technicianId` | `string` | No | Technician UUID (or null) |
| `priority` | `string` | **Yes** | `"LOW"`, `"MEDIUM"`, `"HIGH"`, `"URGENT"` |
| `status` | `string` | **Yes** | `"OPEN"`, `"ASSIGNED"`, `"IN_PROGRESS"`, `"COMPLETED"`, `"CANCELLED"` |
| `scheduledAt` | `string` | No | ISO timestamp string |
| `completionNotes` | `string` | No | Field notes or Fluke test report details |

```json
{
  "title": "Emergency POS Terminal Migration (Lanes 1-8)",
  "description": "Overnight upgrade of 8 registers to Ingenico Lane/7000 EMV terminals",
  "customerId": "37abe1bc-a922-481a-b47c-ff16ebdf46f7",
  "technicianId": "80f9b646-5d67-4c85-bf6a-4d1a4c69273a",
  "priority": "URGENT",
  "status": "COMPLETED",
  "scheduledAt": "2026-09-04T02:00:00.000Z",
  "completionNotes": "All 8 registers upgraded, calibrated, and passing test payments."
}
```

#### Response Example (`200 OK`)
Returns updated work order object including new `StatusLog` records.

---

### 6.5 Delete Work Order

Deletes a work order. Foreign key configurations in PostgreSQL automatically cascade delete associated `StatusLog` records.

- **Method**: `DELETE`
- **URL**: `/api/work-orders/:id`
- **Authentication Required**: `Yes`

#### Response Example (`200 OK`)
```json
{
  "success": true,
  "message": "Work order \"Emergency POS Terminal Migration (Lanes 1-8)\" removed successfully."
}
```

---

<div align="center">
  <sub>FieldFlow REST API Specification • Maintained by FieldFlow Platform Engineering</sub>
</div>
