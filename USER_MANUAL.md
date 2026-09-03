# 📘 FieldFlow User Manual

### A Step-by-Step Guide for Dispatchers, Field Managers, and Operations Teams

---

## 📋 Table of Contents

1. [Introduction to FieldFlow](#1-introduction-to-fieldflow)
2. [Getting Started & Login](#2-getting-started--login)
   - [Creating an Account](#21-creating-an-account)
   - [Signing In](#22-signing-in)
   - [Signing Out](#23-signing-out)
3. [Navigating the Dashboard](#3-navigating-the-dashboard)
4. [Customer Management](#4-customer-management)
   - [Viewing Your Customer List](#41-viewing-your-customer-list)
   - [Adding a New Customer](#42-adding-a-new-customer)
   - [Editing Customer Details](#43-editing-customer-details)
   - [Deleting a Customer (Safety Rules)](#44-deleting-a-customer)
5. [Technician Management](#5-technician-management)
   - [Understanding Technician Availability](#51-understanding-technician-availability)
   - [Adding a New Technician](#52-adding-a-new-technician)
   - [Updating Technician Status & Skills](#53-updating-technician-status--skills)
   - [Removing a Technician](#54-removing-a-technician)
6. [Work Order Management](#6-work-order-management)
   - [Creating & Dispatching a Work Order](#61-creating--dispatching-a-work-order)
   - [Technician Assignment Rules](#62-technician-assignment-rules)
   - [Updating Job Status & Adding Notes](#63-updating-job-status--adding-notes)
   - [Viewing Full Job Timeline & History](#64-viewing-job-timeline--history)
   - [Completing a Work Order](#65-completing-a-work-order)
7. [Analytics Dashboard & Smart Alerts](#7-analytics-dashboard--smart-alerts)
   - [Understanding Key Metrics](#71-understanding-key-metrics)
   - [Reading Charts & Velocity Trends](#72-reading-charts--velocity-trends)
   - [Responding to Overdue & Unassigned Alerts](#73-responding-to-smart-alerts)
8. [Search & Filtering Tips](#8-search--filtering-tips)
   - [Instant Search](#81-instant-search)
   - [Using Multi-Criteria Filters](#82-using-multi-criteria-filters)
9. [Exporting Data to CSV](#9-exporting-data-to-csv)
10. [Understanding Error Messages](#10-understanding-error-messages)
11. [Dispatcher Best Practices](#11-dispatcher-best-practices)
12. [Frequently Asked Questions (FAQ)](#12-frequently-asked-questions-faq)

---

## 1. Introduction to FieldFlow

Welcome to **FieldFlow**! FieldFlow is a centralized field service dispatch and operations platform designed to help you:
- **Organize Customers**: Keep track of customer contact information, addresses, and service histories.
- **Manage Field Technicians**: See who is available right now, who is busy on a job, and who is off-duty.
- **Schedule & Track Work Orders**: Dispatch jobs to technicians, set priorities, track arrival times, and monitor service-level agreements (SLAs).
- **Gain Dispatch Intelligence**: View live analytics, job resolution speeds, and team workloads at a glance.

---

## 2. Getting Started & Login

### 2.1 Creating an Account
1. Open your web browser and navigate to the FieldFlow website (`http://localhost:3000` or your company URL).
2. Click the **Register** button in the top right corner.
3. Enter your **Full Name**, **Work Email**, and a secure **Password** (minimum 8 characters).
4. Click **Create Account**. You will be automatically redirected to the Login page.

### 2.2 Signing In
1. Go to the **Login** page.
2. Enter your registered email address and password.
3. Click **Sign In**.
4. Once authenticated, you will immediately land on the **Dispatch Intelligence Dashboard**.

### 2.3 Signing Out
1. Click the **Logout** button located in the sidebar or top navigation bar.
2. Your session will safely close, and you will be returned to the home page.

---

## 3. Navigating the Dashboard

FieldFlow is organized into simple, intuitive sections accessible via the left-hand navigation sidebar:

- **⚡ Dashboard**: Central dispatch analytics, team workload charts, and prioritized alerts.
- **📑 Work Orders**: Full list of active, scheduled, and completed service jobs.
- **🛠️ Technicians**: Roster of field staff, skill tags, and availability statuses.
- **👥 Customers**: Customer directory and account histories.

> **💡 Quick Tip**: The badge at the top right of your screen shows **"Postgres Live"** with a green pulse, indicating that your dashboard is receiving real-time updates directly from the database.

---

## 4. Customer Management

The **Customers** page allows you to manage all client profiles in one place.

### 4.1 Viewing Your Customer List
- Navigate to **Customers** in the sidebar.
- You will see a table listing customer names, company names, emails, phone numbers, cities, and the number of active work orders.

### 4.2 Adding a New Customer
1. Click the blue **+ Add Customer** button at the top right.
2. Fill out the form fields:
   - **Customer Name** *(Required)*: Primary contact person.
   - **Company Name** *(Optional)*: Business or organization name (leave blank for residential clients).
   - **Email Address** *(Required)*: Contact email.
   - **Phone Number** *(Required)*: Phone number for dispatch calls.
   - **Service Address** *(Required)*: Physical location where field technicians will perform work.
   - **City** *(Required)*: City and state/region.
   - **Site Notes** *(Optional)*: Access details such as gate codes, security checkpoints, or loading dock instructions.
3. Click **Save Customer**. A green success notification will confirm the customer has been added.

### 4.3 Editing Customer Details
1. Find the customer in the table.
2. Click the **Edit (Pencil)** icon in the Actions column on the right.
3. Update any contact or address information.
4. Click **Update Customer**.

### 4.4 Deleting a Customer
FieldFlow protects your operational data with **Safety Deletion Guards**:
- If a customer has **active work orders** (jobs that are Open, Assigned, or In Progress), the system **will not allow deletion** to prevent accidental loss of job records.
- To delete a customer:
  1. Ensure all associated work orders are either marked as **Completed** or **Cancelled**, or deleted.
  2. Click the **Delete (Trash)** icon.
  3. Confirm the deletion in the popup modal.

---

## 5. Technician Management

The **Technicians** page gives dispatchers an instant view of the entire field workforce.

### 5.1 Understanding Technician Availability
Every technician is assigned one of three live availability states:

| Status | Color | Meaning | Dispatch Rule |
| :--- | :--- | :--- | :--- |
| **Available** | 🟢 Green | On-duty and ready for a new job. | Can be assigned immediately. |
| **Busy** | 🟡 Amber | Currently working on an active job. | Can be assigned for next-in-line jobs. |
| **Offline** | ⚪ Gray | Off-duty, on leave, or off-shift. | **BLOCKED**: Cannot be assigned to any work order. |

### 5.2 Adding a New Technician
1. Navigate to **Technicians** and click **+ Add Technician**.
2. Enter the technician's details:
   - **Full Name** & **Work Email**
   - **Phone Number**
   - **Trade Specialization** *(e.g., Fiber Optics, HVAC, Retail POS, Electrical)*
   - **Skills & Certifications** *(e.g., Cisco CCNA, OSHA 30, Fluke Certified)*
   - **Availability Status** *(Available, Busy, or Offline)*
   - **Primary Service Area** *(e.g., Dallas Metro, Austin North)*
3. Click **Create Technician**.

### 5.3 Updating Technician Status & Skills
- When a technician starts their shift, opens a job, or finishes for the day, click the **Edit** icon on their profile card and change their status to **Available**, **Busy**, or **Offline**.

### 5.4 Removing a Technician
- Technicians with active assigned work orders **cannot be deleted**. You must reassign their open jobs before removing their profile.

---

## 6. Work Order Management

The **Work Orders** module is the operational core of FieldFlow.

### 6.1 Creating & Dispatching a Work Order
1. Click **+ New Work Order** (available on both the Dashboard and Work Orders page).
2. Complete the dispatch form:
   - **Job Title**: Brief summary *(e.g., "Router Replacement MDF-2")*.
   - **Customer**: Select the customer from the dropdown list.
   - **Assigned Technician**: Select an on-duty technician.
   - **Priority**: Choose the urgency level:
     - 🔴 **Urgent**: Emergency repair (immediate SLA).
     - 🟠 **High**: High priority (same-day SLA).
     - 🔵 **Medium**: Standard scheduled service.
     - ⚪ **Low**: Routine maintenance.
   - **Initial Status**: Set as *Open*, *Assigned*, or *In Progress*.
   - **Scheduled Date & Time**: Set the target appointment time.
   - **Scope Description**: Detailed instructions for the field tech.
   - **Special Notes**: Safety requirements, gate codes, or client contact details.
3. Click **Create Work Order**.

### 6.2 Technician Assignment Rules
- **Offline Protection**: If you attempt to select an offline technician, FieldFlow will display an error message and refuse to save the assignment until an available technician is chosen.
- **Automatic Status Transition**: If you create a job with status *Open* and assign a technician, FieldFlow automatically updates the job status to *Assigned*.

### 6.3 Updating Job Status & Adding Notes
As work progresses in the field, update the job state:
1. Click **Edit** on the work order row.
2. Change the status:
   - `OPEN` $\rightarrow$ `ASSIGNED` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `COMPLETED`
3. Add **Completion Notes** *(e.g., "All drops tested with Fluke tester. Switch online and passing telemetry")*.
4. Click **Save Changes**.

### 6.4 Viewing Full Job Timeline & History
To inspect the audit trail of a work order:
1. Click the **View (Eye)** icon on any work order row.
2. In the details modal, scroll down to the **Status History Timeline**.
3. You will see a chronological log of every status change, including:
   - What the status was changed from and to *(e.g., ASSIGNED $\rightarrow$ IN_PROGRESS)*.
   - The exact timestamp.
   - The name of the dispatcher or manager who made the change.

### 6.5 Completing a Work Order
- Setting a work order to **COMPLETED** automatically records the completion date and time.
- The job is moved out of the active dispatch queue and counted in completed analytics.

---

## 7. Analytics Dashboard & Smart Alerts

The **Dashboard** gives managers and dispatchers real-time visibility into operations.

### 7.1 Understanding Key Metrics
At the top of the dashboard, 7 KPI cards provide instant numbers:
1. **Total Customers**: Total registered client accounts.
2. **Total Technicians**: Total workforce roster size.
3. **Available Now**: Technicians ready for dispatch right now.
4. **Active Orders**: In-flight jobs currently being worked on.
5. **Completed**: Successfully delivered work orders.
6. **Overdue SLAs**: Jobs that have passed their scheduled time and are still unfinished.
7. **Unassigned Queue**: Open jobs waiting for a technician to be assigned.

### 7.2 Reading Charts & Velocity Trends
- **Monthly Work Order Velocity**: Visualizes how many jobs were created vs. completed each month for the last 6 months. Use the toggle buttons (**All**, **Created**, **Completed**) to isolate trends.
- **Job Status Distribution**: A color-coded bar showing the percentage breakdown of all jobs.
- **Field Technician Capacity**: Shows which technicians have the highest active workload so you can balance job distribution evenly.
- **Priority Breakdown**: Displays the distribution of Urgent, High, Medium, and Low tickets.

### 7.3 Responding to Smart Alerts
When urgent issues arise, a banner appears at the top of your dashboard:
- 🔴 **Critical (Overdue SLA)**: A job is past its target time. Click **View Order** to immediately open the job and contact the technician.
- 🟡 **Warning (Unassigned Job)**: A high-priority job has no assigned technician. Click **Assign Tech** to dispatch someone.
- ⚪ **Notice (Offline Tech)**: Informs you of staff who are currently off-duty.

---

## 8. Search & Filtering Tips

FieldFlow includes lightning-fast search and filtering tools to help you find records in seconds.

### 8.1 Instant Search
- Type a name, company, job title, technician name, or city into the search bar.
- The table automatically updates as you type (no need to press Enter).

### 8.2 Using Multi-Criteria Filters
- **Status Filter Tabs**: Click *Open*, *Assigned*, *In Progress*, or *Completed* to see only jobs in that state.
- **Priority Filter**: Narrow down to *Urgent* or *High* priority jobs during peak hours.
- **Technician Filter**: Filter by a specific technician to review their daily queue, or select *Unassigned Only* to see jobs that need dispatching.
- **Sort Dropdown**: Sort by *Scheduled Date*, *Newest Added*, *Priority*, or *Title*.

---

## 9. Exporting Data to CSV

You can export your data to CSV format at any time for Excel reporting, accounting, or billing:

1. Navigate to **Customers**, **Technicians**, or **Work Orders**.
2. Apply any filters or search terms if you want a specific subset of data.
3. Click the **Export to CSV** button (top right of the table).
4. A file will immediately download to your computer containing all records and fields.

---

## 10. Understanding Error Messages

Here are the most common messages you may encounter and what to do:

| Error Message | Why It Happened | How to Resolve |
| :--- | :--- | :--- |
| *"Cannot assign technician: Technician is currently Offline / Off-Duty."* | You attempted to assign a job to a technician whose status is set to **OFF**. | Select an **Available** or **Busy** technician, or update the technician's status to Available first. |
| *"Cannot delete customer: Customer has active work orders."* | You tried to delete a customer who has open jobs. | Complete or reassign the open work orders before deleting the customer account. |
| *"Cannot delete technician: Technician has active work orders assigned."* | You tried to delete a technician who still has in-flight jobs. | Reassign their active jobs to another technician before removing their profile. |
| *"Please fill in all required fields."* | A required field (such as customer name, address, or email) was left blank. | Check the highlighted form fields and enter the missing information. |
| *"Session expired. Please log in again."* | Your login session timed out for security. | Return to the Login page and sign back in. |

---

## 11. Dispatcher Best Practices

Follow these operational tips to keep your field service running smoothly:

1. **Start the Day with Smart Alerts**: Check the dashboard banner first thing in the morning for any *Overdue SLAs* or *Unassigned Queue* tickets.
2. **Verify Tech Availability Before Dispatch**: Check the green indicator dot next to technician names to ensure they are on-shift.
3. **Use Accurate Priority Tags**: Reserve the 🔴 **Urgent** priority tag for genuine emergencies (e.g., active network outages or safety hazards).
4. **Log Detailed Completion Notes**: When marking a work order as Completed, always include technical notes, part numbers used, or testing results so that the history remains clear.
5. **Regularly Export Weekly Reports**: Use the **Export to CSV** button every Friday to back up your weekly dispatch metrics for executive review.

---

## 12. Frequently Asked Questions (FAQ)

#### Q: How do I know if a job is overdue?
**A**: Overdue work orders are highlighted with a red **"Overdue SLA"** tag in the Work Orders table and appear at the top of the Smart Alerts section on the Dashboard.

#### Q: Can two dispatchers use FieldFlow at the same time?
**A**: Yes. FieldFlow uses real-time database synchronization on Neon PostgreSQL. Every status change recorded by any user is immediately saved with their name in the Status History timeline.

#### Q: What happens when I complete a work order?
**A**: The completion timestamp is automatically recorded, a final `StatusLog` entry is generated, and the job moves into the completed metrics category.

#### Q: Can I reassign a work order to a different technician?
**A**: Yes. Open the work order in **Edit** mode, select a different available technician from the dropdown, and click **Save Changes**.

#### Q: How do I reset my password?
**A**: Contact your system administrator or log in with your primary credentials to update your account security settings.

---

<div align="center">
  <sub>FieldFlow User Manual • For further assistance, contact support@fieldflow.io</sub>
</div>
