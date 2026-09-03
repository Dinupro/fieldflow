# 🚀 FieldFlow Production Deployment & DevOps Guide

Complete step-by-step deployment guide for **FieldFlow** on **Vercel** with **Neon Serverless PostgreSQL**, **Prisma ORM**, and **Better Auth**.

---

## 📋 Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Step 1: Clone Repository](#step-1-clone-repository)
3. [Step 2: Install Dependencies](#step-2-install-dependencies)
4. [Step 3: Provision Neon Serverless PostgreSQL](#step-3-provision-neon-serverless-postgresql)
5. [Step 4: Configure Local Environment Variables](#step-4-configure-local-environment-variables)
6. [Step 5: Setup Prisma & Synchronize Database Schema](#step-5-setup-prisma--synchronize-database-schema)
7. [Step 6: Run Local Development Server](#step-6-run-local-development-server)
8. [Step 7: Validate Local Production Build](#step-7-validate-local-production-build)
9. [Step 8: Deploy to Vercel (Cloud Production)](#step-8-deploy-to-vercel-cloud-production)
   - [Method A: Deploy via Vercel Dashboard (Recommended)](#method-a-deploy-via-vercel-dashboard-recommended)
   - [Method B: Deploy via Vercel CLI](#method-b-deploy-via-vercel-cli)
10. [Step 9: Configure Vercel Production Environment Variables](#step-9-configure-vercel-production-environment-variables)
11. [Step 10: Verify & Smoke Test Production Deployment](#step-10-verify--smoke-test-production-deployment)
12. [Troubleshooting Common Deployment Issues](#12-troubleshooting-common-deployment-issues)
13. [Production Rollback Strategy](#13-production-rollback-strategy)

---

## 1. Prerequisites

Before starting the deployment process, ensure you have the following:

- **Node.js**: `v20.x` or higher (LTS recommended).
- **npm** (or `pnpm` / `yarn`).
- **Git**: Installed and configured.
- **GitHub Account**: To host your repository for CI/CD deployment.
- **Neon Cloud Account**: Free serverless PostgreSQL cluster at [neon.tech](https://neon.tech).
- **Vercel Account**: Hosting and edge network at [vercel.com](https://vercel.com).

---

## Step 1: Clone Repository

Clone the project repository to your local machine:

```bash
# Clone the repository
git clone https://github.com/your-username/fieldflow.git

# Navigate into the project directory
cd fieldflow
```

---

## Step 2: Install Dependencies

Install all required production and development dependencies:

```bash
npm install
```

---

## Step 3: Provision Neon Serverless PostgreSQL

1. Log into your [Neon Console](https://console.neon.tech/).
2. Click **Create Project**.
3. Name your project (e.g., `fieldflow-prod`) and select your preferred AWS region (e.g., `US East (Ohio) - us-east-2`).
4. Once provisioned, locate the **Connection Details** widget on the dashboard.
5. Select **Connection string** with **Pooled connection** enabled.
6. Copy your connection URL (format: `postgresql://[user]:[password]@[endpoint]-pooler.us-east-2.aws.neon.tech/[dbname]?sslmode=require`).

---

## Step 4: Configure Local Environment Variables

Create a `.env` file in the project root by copying the template:

```bash
cp .env.example .env
```

Open `.env` and fill in the following variables:

```env
# 1. Neon PostgreSQL Connection String (Use the pooled connection string)
DATABASE_URL="postgresql://fieldflow_owner:your_secure_password@ep-cold-star-123456-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"

# 2. Better Auth Cryptographic Secret (Generate a 32+ character random string)
# You can generate one via: openssl rand -hex 32
BETTER_AUTH_SECRET="346b55455e20bdcaab06f85442f20bca0c9b5785d1129cde2caaa112568d967f"

# 3. Canonical App URLs
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# 4. Environment Mode
NODE_ENV="development"
```

---

## Step 5: Setup Prisma & Synchronize Database Schema

FieldFlow uses **Prisma ORM 7** with the `@prisma/adapter-pg` driver adapter.

### 1. Push Database Schema to Neon
Apply all relational tables, enums, and foreign keys directly to your Neon database:

```bash
npx prisma db push
```

### 2. Generate Typesafe Prisma Client
Generate the `@prisma/client` artifacts:

```bash
npx prisma generate
```

> **💡 Verification Tip**: You can verify tables by running `npx prisma studio` to inspect your Neon PostgreSQL database in a browser GUI.

---

## Step 6: Run Local Development Server

Start the local Next.js development server with Turbopack:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. Verify that you can register an account, sign in, and view the live dashboard.

---

## Step 7: Validate Local Production Build

Always perform a full build locally to ensure zero TypeScript errors or bundling issues before pushing to production:

```bash
# Run TypeScript compilation check
npx tsc --noEmit

# Run ESLint quality check
npm run lint

# Build production bundle
npm run build
```

Verify that the build outputs `✓ Compiled successfully` with exit code `0`.

---

## Step 8: Deploy to Vercel (Cloud Production)

### Method A: Deploy via Vercel Dashboard (Recommended)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "chore: prepare for production deployment"
   git push origin main
   ```
2. Log into [Vercel](https://vercel.com/dashboard).
3. Click **Add New...** $\rightarrow$ **Project**.
4. Import your `fieldflow` GitHub repository.
5. In the **Configure Project** screen:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `./`
   - **Build Command**: `prisma generate && next build`
   - **Install Command**: `npm install`
6. Expand **Environment Variables** and add your production credentials (see [Step 9](#step-9-configure-vercel-production-environment-variables)).
7. Click **Deploy**.

---

### Method B: Deploy via Vercel CLI

1. Install the Vercel CLI globally:
   ```bash
   npm install -g vercel
   ```
2. Link and deploy your project:
   ```bash
   vercel
   ```
3. Deploy to production:
   ```bash
   vercel --prod
   ```

---

## Step 9: Configure Vercel Production Environment Variables

In your Vercel Project Dashboard, navigate to **Settings** $\rightarrow$ **Environment Variables**, and add the following:

| Key | Value / Example | Environments |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://user:pass@ep-xyz-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require` | Production, Preview |
| `BETTER_AUTH_SECRET` | *Your 32+ character random hex secret* | Production, Preview |
| `BETTER_AUTH_URL` | `https://your-app-name.vercel.app` (or your custom domain) | Production |
| `NEXT_PUBLIC_APP_URL` | `https://your-app-name.vercel.app` (or your custom domain) | Production |
| `NODE_ENV` | `production` | Production |

> **⚠️ CRITICAL**: When deploying to production, ensure `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` point to your live `https://` domain (e.g., `https://fieldflow.vercel.app`), **NOT** `localhost:3000`.

---

## Step 10: Verify & Smoke Test Production Deployment

Once the deployment completes, perform the following verification steps:

1. **Landing Page**: Navigate to your production URL (`https://your-app.vercel.app`). Confirm the Hero, Feature cards, and Navbar render cleanly.
2. **Account Registration**: Click **Register**, enter new credentials, and confirm the account is created.
3. **Session Authentication**: Log in and verify redirection to `/dashboard`.
4. **PostgreSQL Live Sync**: Confirm the green **Postgres Live** status indicator is active on the dashboard.
5. **Customer Management**: Add a test customer $\rightarrow$ Verify instant appearance in the table.
6. **Technician Roster**: Provision a technician $\rightarrow$ Toggle availability between `Available`, `Busy`, and `Offline`.
7. **Work Order Dispatch**:
   - Create a work order assigned to an available technician.
   - Attempt to assign an offline technician and verify the server validation blocks the assignment.
   - Change the work order status (`OPEN` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `COMPLETED`) and verify that the **Status History Timeline** logs all transitions.
8. **CSV Export**: Click **Export to CSV** on Work Orders and verify the file downloads correctly.

---

## 12. Troubleshooting Common Deployment Issues

### 1. `PrismaClientInitializationError: Can't reach database server`
- **Cause**: Incorrect database connection string or missing SSL parameter.
- **Solution**: Ensure your `DATABASE_URL` includes `?sslmode=require` and uses the Neon **pooled** endpoint (`-pooler`).

### 2. `Invalid session cookie / Better Auth redirect loop`
- **Cause**: `BETTER_AUTH_URL` in Vercel environment variables does not match your actual production domain, or is set to `http://` instead of `https://`.
- **Solution**: Update `BETTER_AUTH_URL` in Vercel to `https://your-exact-subdomain.vercel.app` and redeploy.

### 3. `Prisma Client not generated during Vercel build`
- **Cause**: Vercel cached the build without running `prisma generate`.
- **Solution**: In Vercel Project Settings $\rightarrow$ General $\rightarrow$ Build & Development Settings, set **Build Command** to:
  ```bash
  prisma generate && next build
  ```

### 4. `400 Bad Request: Cannot assign technician: Technician is Offline`
- **Cause**: Expected business rule validation triggering when assigning an off-duty technician.
- **Solution**: Update the technician's availability status to `AVAILABLE` or `BUSY` before assignment.

---

## 13. Production Rollback Strategy

If a critical issue occurs post-deployment:

### Immediate Rollback via Vercel Dashboard
1. Go to your [Vercel Dashboard](https://vercel.com/dashboard) $\rightarrow$ select your **fieldflow** project.
2. Click the **Deployments** tab.
3. Locate the previous working production deployment.
4. Click the three dots menu (`...`) $\rightarrow$ select **Instant Rollback** (or **Promote to Production**).
5. Vercel will instantly route traffic back to the previous stable build within seconds.

### Database Schema Rollback
If a schema change needs reversion:
1. Revert the changes in `prisma/schema.prisma`.
2. Run `npx prisma db push` to re-sync the Neon PostgreSQL database.
3. Run `npx prisma generate` and trigger a new deployment.

---

<div align="center">
  <sub>FieldFlow DevOps & Deployment Guide • Maintained by FieldFlow Platform Operations</sub>
</div>
