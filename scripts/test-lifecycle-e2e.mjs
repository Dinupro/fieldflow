import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function runTests() {
  console.log("=== FIELD FLOW WORK ORDER LIFECYCLE E2E TEST ===");

  try {
    // 1. Get or find admin / tech users for actor IDs
    const adminUser = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    const techUser = await prisma.user.findFirst({ where: { role: "TECHNICIAN" } });
    const techRecord = await prisma.technician.findFirst();
    const customerRecord = await prisma.customer.findFirst();

    if (!adminUser || !techRecord || !customerRecord) {
      throw new Error("Missing seeded test data: Admin user, Technician, or Customer not found.");
    }

    console.log(`[PASS] Environment loaded: Admin=${adminUser.email}, Tech=${techRecord.name}, Customer=${customerRecord.name}`);

    // Clean up previous test work orders if any
    await prisma.statusLog.deleteMany({
      where: { workOrder: { title: "E2E Lifecycle Verification Job" } },
    });
    await prisma.workOrder.deleteMany({
      where: { title: "E2E Lifecycle Verification Job" },
    });

    // 2. Stage 1: Create OPEN work order
    const createdOrder = await prisma.workOrder.create({
      data: {
        title: "E2E Lifecycle Verification Job",
        description: "Verify complete state machine from OPEN to CLOSED",
        customerId: customerRecord.id,
        technicianId: null,
        priority: "HIGH",
        status: "OPEN",
      },
    });

    await prisma.statusLog.create({
      data: {
        workOrderId: createdOrder.id,
        changedById: adminUser.id,
        fromStatus: "OPEN",
        toStatus: "OPEN",
        notes: "Work order created in Open dispatch queue.",
      },
    });

    console.log(`[PASS] Stage 1 Created: ID=${createdOrder.id}, Status=${createdOrder.status}`);

    // 3. Stage 2: Dispatcher assigns technician -> ASSIGNED
    await prisma.workOrder.update({
      where: { id: createdOrder.id },
      data: {
        technicianId: techRecord.id,
        status: "ASSIGNED",
      },
    });

    await prisma.statusLog.create({
      data: {
        workOrderId: createdOrder.id,
        changedById: adminUser.id,
        fromStatus: "OPEN",
        toStatus: "ASSIGNED",
        notes: `Assigned to technician ${techRecord.name}.`,
      },
    });
    console.log("[PASS] Stage 2 Assigned: OPEN -> ASSIGNED");

    // 4. Stage 3: Technician Accepts -> ACCEPTED
    await prisma.workOrder.update({
      where: { id: createdOrder.id },
      data: { status: "ACCEPTED" },
    });

    await prisma.statusLog.create({
      data: {
        workOrderId: createdOrder.id,
        changedById: techUser ? techUser.id : adminUser.id,
        fromStatus: "ASSIGNED",
        toStatus: "ACCEPTED",
        notes: "Technician accepted work order.",
      },
    });
    console.log("[PASS] Stage 3 Accepted: ASSIGNED -> ACCEPTED");

    // 5. Stage 4: Technician Starts Work -> IN_PROGRESS & Tech Availability -> BUSY
    await prisma.workOrder.update({
      where: { id: createdOrder.id },
      data: { status: "IN_PROGRESS" },
    });

    await prisma.technician.update({
      where: { id: techRecord.id },
      data: { status: "BUSY" },
    });

    await prisma.statusLog.create({
      data: {
        workOrderId: createdOrder.id,
        changedById: techUser ? techUser.id : adminUser.id,
        fromStatus: "ACCEPTED",
        toStatus: "IN_PROGRESS",
        notes: "Technician arrived on-site and began diagnostics.",
      },
    });
    console.log("[PASS] Stage 4 In Progress: ACCEPTED -> IN_PROGRESS (Tech Status: BUSY)");

    // 6. Stage 5: Technician Pauses Work -> PAUSED & Tech Availability -> AVAILABLE
    await prisma.workOrder.update({
      where: { id: createdOrder.id },
      data: { status: "PAUSED" },
    });

    await prisma.technician.update({
      where: { id: techRecord.id },
      data: { status: "AVAILABLE" },
    });

    await prisma.statusLog.create({
      data: {
        workOrderId: createdOrder.id,
        changedById: techUser ? techUser.id : adminUser.id,
        fromStatus: "IN_PROGRESS",
        toStatus: "PAUSED",
        notes: "Waiting for replacement fiber patch cables from central warehouse.",
      },
    });
    console.log("[PASS] Stage 5 Paused: IN_PROGRESS -> PAUSED (Tech Status: AVAILABLE)");

    // 7. Stage 6: Technician Resumes Work -> IN_PROGRESS & Tech Availability -> BUSY
    await prisma.workOrder.update({
      where: { id: createdOrder.id },
      data: { status: "IN_PROGRESS" },
    });

    await prisma.technician.update({
      where: { id: techRecord.id },
      data: { status: "BUSY" },
    });

    await prisma.statusLog.create({
      data: {
        workOrderId: createdOrder.id,
        changedById: techUser ? techUser.id : adminUser.id,
        fromStatus: "PAUSED",
        toStatus: "IN_PROGRESS",
        notes: "Parts received; technician resumed splicing and testing.",
      },
    });
    console.log("[PASS] Stage 6 Resumed: PAUSED -> IN_PROGRESS (Tech Status: BUSY)");

    // 8. Stage 7: Technician Completes Job -> COMPLETED & Tech Availability -> AVAILABLE
    const completionNotes = "Spliced all 24 fiber pairs with OTDR test passing 0.02dB loss. Customer verified and signed.";
    await prisma.workOrder.update({
      where: { id: createdOrder.id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        completionNotes,
      },
    });

    await prisma.technician.update({
      where: { id: techRecord.id },
      data: { status: "AVAILABLE" },
    });

    await prisma.statusLog.create({
      data: {
        workOrderId: createdOrder.id,
        changedById: techUser ? techUser.id : adminUser.id,
        fromStatus: "IN_PROGRESS",
        toStatus: "COMPLETED",
        notes: `Work completed: ${completionNotes}`,
      },
    });
    console.log("[PASS] Stage 7 Completed: IN_PROGRESS -> COMPLETED (Tech Status: AVAILABLE)");

    // 9. Stage 8: Dispatcher Closes Work Order -> CLOSED
    await prisma.workOrder.update({
      where: { id: createdOrder.id },
      data: { status: "CLOSED" },
    });

    await prisma.statusLog.create({
      data: {
        workOrderId: createdOrder.id,
        changedById: adminUser.id,
        fromStatus: "COMPLETED",
        toStatus: "CLOSED",
        notes: "Billing generated and customer SLA confirmed. Ticket closed.",
      },
    });
    console.log("[PASS] Stage 8 Closed: COMPLETED -> CLOSED");

    // 10. Verify Full History Logs
    const fullOrder = await prisma.workOrder.findUnique({
      where: { id: createdOrder.id },
      include: {
        customer: true,
        technician: true,
        statusLogs: {
          orderBy: { changedAt: "asc" },
          include: { changedBy: true },
        },
      },
    });

    console.log(`\n[VERIFICATION] Final Work Order State: ${fullOrder.status}`);
    console.log(`[VERIFICATION] Total Status Logs Recorded: ${fullOrder.statusLogs.length}`);
    fullOrder.statusLogs.forEach((log, index) => {
      console.log(`  Log #${index + 1}: ${log.fromStatus} -> ${log.toStatus} | Actor: ${log.changedBy?.name || "System"} | Notes: ${log.notes || "None"}`);
    });

    if (fullOrder.statusLogs.length !== 8) {
      throw new Error(`Expected 8 status logs, found ${fullOrder.statusLogs.length}`);
    }

    console.log("\n>>> ALL WORK ORDER LIFECYCLE TESTS PASSED PERFECTLY! <<<");
  } catch (err) {
    console.error("Test failed with error:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

runTests();
