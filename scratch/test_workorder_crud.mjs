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

async function runWorkOrderCrudTests() {
  console.log("=== Testing Neon PostgreSQL Work Order CRUD & StatusLog Tracking ===");

  try {
    // 1. Ensure a test User exists for StatusLog relation
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: `dispatcher.${Date.now()}@fieldflow.io`,
          name: "Lead Dispatcher",
        },
      });
    }
    console.log("✓ Using User for dispatch tracking:", user.email);

    // 2. Ensure a test Customer exists
    let customer = await prisma.customer.findFirst();
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: "Apex Global Logistics",
          company: "Apex Enterprise",
          email: `contact.${Date.now()}@apex.com`,
          phone: "+1 (555) 444-3322",
          address: "500 Logistics Blvd, Suite 200",
          city: "Dallas, TX",
        },
      });
    }
    console.log("✓ Using Customer:", customer.name);

    // 3. Ensure an Available Technician and an Offline Technician exist
    const testTechEmail = `tech.wo.${Date.now()}@fieldflow.io`;
    const availableTech = await prisma.technician.create({
      data: {
        name: "Samantha Wright",
        email: testTechEmail,
        phone: "+1 (555) 999-1122",
        specialization: "Enterprise Network Infrastructure",
        skills: ["Cisco CCNA", "Fluke Certified", "Cat6A Cabling"],
        status: "AVAILABLE",
        serviceArea: "Dallas Metro",
      },
    });
    console.log("✓ Created Available Technician:", availableTech.name);

    // 4. Create a WorkOrder and initial StatusLog
    console.log("\n4. Creating WorkOrder with technician assignment...");
    const createdOrder = await prisma.workOrder.create({
      data: {
        title: "Multi-Gigabit Fiber Core Switch Deployment",
        description: "Deploy and patch Cisco Catalyst 9300 48-port switch stack in MDF-2",
        priority: "HIGH",
        status: "ASSIGNED",
        customerId: customer.id,
        technicianId: availableTech.id,
        scheduledAt: new Date(Date.now() + 12 * 3600 * 1000),
      },
      include: {
        customer: true,
        technician: true,
      },
    });

    await prisma.statusLog.create({
      data: {
        workOrderId: createdOrder.id,
        changedById: user.id,
        fromStatus: "OPEN",
        toStatus: "ASSIGNED",
      },
    });

    console.log("✓ WorkOrder created:", {
      id: createdOrder.id,
      title: createdOrder.title,
      status: createdOrder.status,
      assignedTech: createdOrder.technician?.name,
    });

    // 5. Update Status to IN_PROGRESS and log StatusLog
    console.log("\n5. Updating WorkOrder status to 'IN_PROGRESS'...");
    const inProgressOrder = await prisma.workOrder.update({
      where: { id: createdOrder.id },
      data: { status: "IN_PROGRESS" },
    });

    await prisma.statusLog.create({
      data: {
        workOrderId: inProgressOrder.id,
        changedById: user.id,
        fromStatus: "ASSIGNED",
        toStatus: "IN_PROGRESS",
      },
    });
    console.log("✓ Status updated to IN_PROGRESS");

    // 6. Complete WorkOrder and set completedAt
    console.log("\n6. Completing WorkOrder with completionNotes and completedAt timestamp...");
    const completedOrder = await prisma.workOrder.update({
      where: { id: createdOrder.id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        completionNotes: "All 48 Cat6A drops tested with Fluke tester. Switch online and passing telemetry.",
      },
      include: {
        statusLogs: {
          orderBy: { changedAt: "desc" },
        },
      },
    });

    await prisma.statusLog.create({
      data: {
        workOrderId: completedOrder.id,
        changedById: user.id,
        fromStatus: "IN_PROGRESS",
        toStatus: "COMPLETED",
      },
    });

    console.log("✓ WorkOrder completed successfully:", {
      status: completedOrder.status,
      completedAt: completedOrder.completedAt,
      completionNotes: completedOrder.completionNotes,
    });

    // 7. Verify StatusLog records
    const logs = await prisma.statusLog.findMany({
      where: { workOrderId: createdOrder.id },
      orderBy: { changedAt: "asc" },
    });
    console.log(`\n7. Verified ${logs.length} StatusLog timeline entries:`);
    logs.forEach((l, idx) => {
      console.log(`   ${idx + 1}. [${l.changedAt.toISOString()}] ${l.fromStatus} -> ${l.toStatus}`);
    });

    if (logs.length < 3) {
      throw new Error(`Expected at least 3 status log transitions, found ${logs.length}`);
    }

    // 8. Clean up test records
    console.log("\n8. Cleaning up test records...");
    await prisma.workOrder.delete({ where: { id: createdOrder.id } });
    await prisma.technician.delete({ where: { id: availableTech.id } });
    console.log("✓ WorkOrder and test technician deleted cleanly (StatusLog cascaded).");

    console.log("\n=== ALL DATABASE WORK ORDER TESTS PASSED WITH 100% SUCCESS! ===");
  } catch (err) {
    console.error("Test failed with error:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

runWorkOrderCrudTests();
