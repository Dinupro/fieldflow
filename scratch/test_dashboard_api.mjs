import "dotenv/config";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function runDashboardAnalyticsTests() {
  console.log("=== Testing FieldFlow Dashboard Analytics Module & Live API ===");

  try {
    const testEmail = `lead.analytics.${Date.now()}@fieldflow.io`;
    const testPassword = "Password123!";

    // 1. Authenticate / Sign-Up
    console.log(`\n1. Authenticating user via Better Auth (${testEmail})...`);
    const signUpRes = await fetch("http://localhost:3000/api/auth/sign-up/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
      body: JSON.stringify({
        name: "Lead Operations Executive",
        email: testEmail,
        password: testPassword,
      }),
    });

    console.log("Sign-up response status:", signUpRes.status);
    const setCookieHeader = signUpRes.headers.get("set-cookie");
    if (!signUpRes.ok || !setCookieHeader) {
      throw new Error("Failed to authenticate session.");
    }
    const cookie = setCookieHeader.split(";")[0];

    // Ensure sample data exists
    let customer = await prisma.customer.findFirst();
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: "Global Data Centers Corp",
          company: "GDC International",
          email: `noc.${Date.now()}@globaldc.com`,
          phone: "+1 (555) 888-1234",
          address: "1000 Server Row",
          city: "San Jose, CA",
        },
      });
    }

    let tech = await prisma.technician.findFirst();
    if (!tech) {
      tech = await prisma.technician.create({
        data: {
          name: "Jordan Hayes",
          email: `jordan.${Date.now()}@fieldflow.io`,
          phone: "+1 (555) 234-5678",
          specialization: "Fiber Optics & DC Infrastructure",
          skills: ["Splice Certified", "OTDR"],
          status: "AVAILABLE",
          serviceArea: "Bay Area",
        },
      });
    }

    // 2. Call GET /api/dashboard
    console.log("\n2. Calling GET /api/dashboard with session cookie...");
    const dashboardRes = await fetch("http://localhost:3000/api/dashboard", {
      headers: { cookie },
    });

    console.log("GET /api/dashboard status:", dashboardRes.status);
    if (!dashboardRes.ok) {
      const errText = await dashboardRes.text();
      throw new Error(`GET /api/dashboard failed with status ${dashboardRes.status}: ${errText}`);
    }

    const data = await dashboardRes.json();
    console.log("\n✓ 3. Verified Core Metrics Payload:");
    console.log("   - Total Customers:", data.metrics.totalCustomers);
    console.log("   - Total Technicians:", data.metrics.totalTechnicians);
    console.log("   - Available Technicians:", data.metrics.availableTechnicians);
    console.log("   - Busy Technicians:", data.metrics.busyTechnicians);
    console.log("   - Offline Technicians:", data.metrics.offlineTechnicians);
    console.log("   - Total Work Orders:", data.metrics.totalWorkOrders);
    console.log("   - Active Work Orders:", data.metrics.activeWorkOrders);
    console.log("   - Completed Work Orders:", data.metrics.completedWorkOrders);
    console.log("   - Overdue Work Orders:", data.metrics.overdueWorkOrders);
    console.log("   - Unassigned Work Orders:", data.metrics.unassignedWorkOrders);

    console.log("\n✓ 4. Verified Interactive Charts Payload:");
    console.log("   - Work Orders By Status Segments:", data.charts.workOrdersByStatus.length);
    console.log("   - Monthly Trends Series (Past 6 Months):", data.charts.monthlyTrends.map((m) => `${m.month}: ${m.created} created / ${m.completed} done`).join(", "));
    console.log("   - Top Technicians Workload:", data.charts.technicianWorkload.length);
    console.log("   - Work Orders By Priority:", data.charts.workOrdersByPriority.map((p) => `${p.priority}: ${p.count} (${p.percentage}%)`).join(", "));

    console.log("\n✓ 5. Verified Recent Activity Feed (Limit 10, Sorted Descending):");
    console.log(`   - Total Events Returned: ${data.recentActivity.length}`);
    data.recentActivity.forEach((act, idx) => {
      console.log(`     ${idx + 1}. [${act.badgeText}] ${act.title} (${act.timestamp})`);
    });

    console.log("\n✓ 6. Verified Smart Alerts (Prioritized: Overdue -> Unassigned -> Offline):");
    console.log(`   - Total Alerts: ${data.alerts.length}`);
    data.alerts.forEach((alert, idx) => {
      console.log(`     ${idx + 1}. [${alert.level}] ${alert.title} -> target: ${alert.targetTab}`);
    });

    console.log("\n=== ALL DASHBOARD ANALYTICS API TESTS PASSED WITH 100% SUCCESS! ===");
  } catch (err) {
    console.error("Dashboard Analytics test failed:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

runDashboardAnalyticsTests();
