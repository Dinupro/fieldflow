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

async function runDashboardLifecycleTest() {
  console.log("=== Running End-to-End Dashboard Analytics Lifecycle Verification ===");

  try {
    const testEmail = `dispatcher.dash.${Date.now()}@fieldflow.io`;
    const testPassword = "Password123!";

    // 1. Authenticate via Better Auth
    console.log("1. Authenticating test dispatcher...");
    const signUpRes = await fetch("http://localhost:3000/api/auth/sign-up/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
      body: JSON.stringify({
        name: "Dashboard QA Specialist",
        email: testEmail,
        password: testPassword,
      }),
    });

    const setCookie = signUpRes.headers.get("set-cookie");
    if (!signUpRes.ok || !setCookie) {
      throw new Error("Failed to authenticate test dispatcher.");
    }
    const cookie = setCookie.split(";")[0];

    // Find the user for StatusLog
    const user = await prisma.user.findFirst({ where: { email: testEmail } });

    // 2. Provision Customer and Technicians
    console.log("2. Provisioning Customer and Technicians...");
    const customer = await prisma.customer.create({
      data: {
        name: "Nexus BioTech Labs",
        company: "Nexus Healthcare",
        email: `facilities.${Date.now()}@nexusbio.com`,
        phone: "+1 (555) 789-0123",
        address: "500 Innovation Way",
        city: "Cambridge, MA",
      },
    });

    const activeTech = await prisma.technician.create({
      data: {
        name: "Elena Rostova",
        email: `elena.${Date.now()}@fieldflow.io`,
        phone: "+1 (555) 456-7890",
        specialization: "Biomedical Calibration & Cleanrooms",
        skills: ["HEPA Certified", "Laser Calibration"],
        status: "AVAILABLE",
        serviceArea: "Boston Metro",
      },
    });

    const offlineTech = await prisma.technician.create({
      data: {
        name: "Dmitri Volkov",
        email: `dmitri.${Date.now()}@fieldflow.io`,
        phone: "+1 (555) 321-6549",
        specialization: "HVAC & Chiller Plants",
        skills: ["EPA Universal"],
        status: "OFF",
        serviceArea: "Worcester",
      },
    });

    // 3. Create Overdue Work Order, Unassigned Work Order, and Assigned Work Order
    console.log("3. Creating Overdue, Unassigned, and Assigned Work Orders...");
    const overdueOrder = await prisma.workOrder.create({
      data: {
        title: "Cleanroom Air Handling Unit Pressure Sensor Failure",
        description: "ISO-5 Cleanroom negative pressure alarm tripped. Immediate field calibration required.",
        priority: "URGENT",
        status: "IN_PROGRESS",
        customerId: customer.id,
        technicianId: activeTech.id,
        scheduledAt: new Date(Date.now() - 3 * 3600 * 1000), // 3 hours ago -> Overdue
      },
    });

    const unassignedOrder = await prisma.workOrder.create({
      data: {
        title: "Spectrometer Fiber Collimator Realignment",
        description: "Routine quarterly realignment for spectrometer bench #4",
        priority: "MEDIUM",
        status: "OPEN",
        customerId: customer.id,
        technicianId: null, // Unassigned
        scheduledAt: new Date(Date.now() + 24 * 3600 * 1000),
      },
    });

    // 4. Log StatusLog transition
    console.log("4. Logging StatusLog transition for active order...");
    await prisma.statusLog.create({
      data: {
        workOrderId: overdueOrder.id,
        changedById: user.id,
        fromStatus: "ASSIGNED",
        toStatus: "IN_PROGRESS",
      },
    });

    // 5. Fetch Dashboard Analytics Payload
    console.log("5. Fetching live dashboard payload from GET /api/dashboard...");
    const dashRes = await fetch("http://localhost:3000/api/dashboard", {
      headers: { cookie },
    });

    if (!dashRes.ok) {
      throw new Error(`GET /api/dashboard failed: ${dashRes.status}`);
    }

    const payload = await dashRes.json();
    console.log("✓ Live Dashboard Metrics:", payload.metrics);

    // Validations
    if (payload.metrics.overdueWorkOrders < 1) {
      throw new Error("Expected at least 1 overdue work order in metrics!");
    }
    if (payload.metrics.unassignedWorkOrders < 1) {
      throw new Error("Expected at least 1 unassigned work order in metrics!");
    }
    if (payload.metrics.offlineTechnicians < 1) {
      throw new Error("Expected at least 1 offline technician in metrics!");
    }

    // Verify Alerts order: Overdue first
    console.log("\n6. Validating Smart Alerts Priority (Overdue must be First):");
    const firstAlert = payload.alerts[0];
    console.log("   First Alert:", firstAlert);
    if (!firstAlert || firstAlert.level !== "CRITICAL" || firstAlert.type !== "OVERDUE") {
      throw new Error("First alert must be CRITICAL OVERDUE alert!");
    }
    console.log("✓ Overdue alert correctly prioritized at position 1!");

    // Verify Recent Activity
    console.log("\n7. Validating Recent Activity Stream:");
    const hasStatusTransition = payload.recentActivity.some(
      (a) => a.type === "STATUS_TRANSITION"
    );
    if (!hasStatusTransition) {
      throw new Error("Recent activity must contain STATUS_TRANSITION event!");
    }
    console.log("✓ StatusLog transition found in live activity stream!");

    // 8. Clean up test records
    console.log("\n8. Cleaning up test data...");
    await prisma.workOrder.deleteMany({
      where: { id: { in: [overdueOrder.id, unassignedOrder.id] } },
    });
    await prisma.technician.deleteMany({
      where: { id: { in: [activeTech.id, offlineTech.id] } },
    });
    await prisma.customer.delete({ where: { id: customer.id } });
    console.log("✓ Test records cleaned up cleanly.");

    console.log("\n=== FULL LIFECYCLE DASHBOARD VERIFICATION PASSED 100%! ===");
  } catch (err) {
    console.error("Lifecycle test failed:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

runDashboardLifecycleTest();
