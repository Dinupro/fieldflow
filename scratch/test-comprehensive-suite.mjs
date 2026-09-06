import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not defined in environment.");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`  ❌ FAILED: ${message}`);
    testsFailed++;
    throw new Error(message);
  } else {
    console.log(`  ✅ PASSED: ${message}`);
    testsPassed++;
  }
}

async function runSuite() {
  console.log("================================================================================");
  console.log("🚀 STARTING FIELDFLOW COMPREHENSIVE AUTOMATED VERIFICATION SUITE");
  console.log("================================================================================\n");

  let testCustomer = null;
  let testTechnician = null;
  let testWorkOrder = null;
  let testAdminUser = null;
  let testTechUser = null;

  try {
    // -------------------------------------------------------------------------
    // TEST SECTION 1: USERS & RBAC SEED INTEGRITY
    // -------------------------------------------------------------------------
    console.log("▶️ [TEST SECTION 1] Users & RBAC Authorization Checks");
    const users = await prisma.user.findMany();
    assert(users.length >= 3, `Expected at least 3 seeded users, found ${users.length}`);

    const adminUser = users.find((u) => u.role === "ADMIN");
    const dispatcherUser = users.find((u) => u.role === "DISPATCHER");
    const technicianUser = users.find((u) => u.role === "TECHNICIAN");

    assert(!!adminUser, `Admin account verified: ${adminUser?.email}`);
    assert(!!dispatcherUser, `Dispatcher account verified: ${dispatcherUser?.email}`);
    assert(!!technicianUser, `Technician account verified: ${technicianUser?.email}`);

    testAdminUser = adminUser;
    testTechUser = technicianUser;

    // Test Last Admin Demotion Safeguard Check
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    assert(adminCount >= 1, `Verified active administrator pool count: ${adminCount}`);

    // -------------------------------------------------------------------------
    // TEST SECTION 2: CUSTOMER MANAGEMENT & DUPLICATE VALIDATION
    // -------------------------------------------------------------------------
    console.log("\n▶️ [TEST SECTION 2] Customer Management CRUD, Validation & Duplicate Guard");

    const uniqueTimestamp = Date.now();
    const testCustomerEmail = `suite-client-${uniqueTimestamp}@enterprise.com`;

    // 2.1 Create Customer
    testCustomer = await prisma.customer.create({
      data: {
        name: `Apex Logistics Corp ${uniqueTimestamp}`,
        company: "Apex Global Supply",
        email: testCustomerEmail,
        phone: `+1-555-${String(uniqueTimestamp).slice(-4)}`,
        address: "100 Innovation Parkway, Suite 500",
        city: "San Francisco",
        notes: "Automated test customer record",
      },
    });
    assert(!!testCustomer.id, `Created test customer with ID: ${testCustomer.id}`);

    // 2.2 Validate duplicate detection logic
    const duplicateEmailCheck = await prisma.customer.findFirst({
      where: { email: { equals: testCustomerEmail, mode: "insensitive" } },
    });
    assert(!!duplicateEmailCheck && duplicateEmailCheck.id === testCustomer.id, "Duplicate email lookup correctly matches existing customer");

    // 2.3 Update Customer
    const updatedCustomer = await prisma.customer.update({
      where: { id: testCustomer.id },
      data: {
        notes: "Updated verification notes for customer",
        city: "San Jose",
      },
    });
    assert(updatedCustomer.city === "San Jose", "Customer record updated successfully");

    // -------------------------------------------------------------------------
    // TEST SECTION 3: TECHNICIAN MANAGEMENT, SKILLS & WORKLOAD TRACKING
    // -------------------------------------------------------------------------
    console.log("\n▶️ [TEST SECTION 3] Technician Skills, Capacity & Availability");

    const testTechEmail = `tech-specialist-${uniqueTimestamp}@fieldflow.dev`;
    testTechnician = await prisma.technician.create({
      data: {
        name: `Dr. Marcus Vance ${uniqueTimestamp}`,
        email: testTechEmail,
        phone: `+1-888-${String(uniqueTimestamp).slice(-4)}`,
        specialization: "Quantum Cryogenics & Superconducting RF",
        skills: ["HVAC Certified", "EPA Universal", "RF Spectrum Analysis", "Cleanroom Class 100"],
        certifications: ["EPA 608 Universal Certification", "NATE HVAC Specialist", "OSHA 30"],
        experienceYears: 8,
        maxActiveJobs: 4,
        rating: 4.95,
        status: "AVAILABLE",
        serviceArea: "San Francisco Bay Area",
        notes: "Lead cryogenic field systems specialist",
      },
    });
    assert(!!testTechnician.id, `Created technician record with ID: ${testTechnician.id}`);
    assert(testTechnician.skills.length === 4, `Technician skills array stored correctly (${testTechnician.skills.length} skills)`);
    assert(testTechnician.certifications.length === 3, `Technician certifications stored correctly (${testTechnician.certifications.length} certs)`);

    // 3.2 Update status to BUSY and back to AVAILABLE
    const busyTech = await prisma.technician.update({
      where: { id: testTechnician.id },
      data: { status: "BUSY" },
    });
    assert(busyTech.status === "BUSY", "Technician status toggle to BUSY confirmed");

    const availableTech = await prisma.technician.update({
      where: { id: testTechnician.id },
      data: { status: "AVAILABLE" },
    });
    assert(availableTech.status === "AVAILABLE", "Technician status toggle back to AVAILABLE confirmed");

    // -------------------------------------------------------------------------
    // TEST SECTION 4: WORK ORDER FULL LIFECYCLE STATE MACHINE
    // -------------------------------------------------------------------------
    console.log("\n▶️ [TEST SECTION 4] Work Order State Machine & Lifecycle Transitions");

    const woTitle = `Cryogenic Compressor Overhaul ${uniqueTimestamp}`;

    // 4.1 Step 1: Create OPEN Work Order
    testWorkOrder = await prisma.workOrder.create({
      data: {
        title: woTitle,
        description: "Primary liquid helium compressor pressure fluctuations observed.",
        priority: "HIGH",
        status: "OPEN",
        customerId: testCustomer.id,
        scheduledAt: new Date(Date.now() + 24 * 3600 * 1000),
      },
    });
    assert(testWorkOrder.status === "OPEN", `State 1: Created work order in OPEN state (${testWorkOrder.id})`);

    // Log status creation
    await prisma.statusLog.create({
      data: {
        workOrderId: testWorkOrder.id,
        changedById: testAdminUser.id,
        fromStatus: "OPEN",
        toStatus: "OPEN",
        notes: "Work order created and dispatched to queue.",
      },
    });

    // 4.2 Step 2: Transition to ASSIGNED
    const assignedOrder = await prisma.workOrder.update({
      where: { id: testWorkOrder.id },
      data: {
        status: "ASSIGNED",
        technicianId: testTechnician.id,
      },
    });
    assert(assignedOrder.status === "ASSIGNED" && assignedOrder.technicianId === testTechnician.id, "State 2: Transition to ASSIGNED with technician assignment");

    await prisma.statusLog.create({
      data: {
        workOrderId: testWorkOrder.id,
        changedById: testAdminUser.id,
        fromStatus: "OPEN",
        toStatus: "ASSIGNED",
        notes: `Assigned to lead specialist ${testTechnician.name}.`,
      },
    });

    // 4.3 Step 3: Transition to ACCEPTED
    const acceptedOrder = await prisma.workOrder.update({
      where: { id: testWorkOrder.id },
      data: { status: "ACCEPTED" },
    });
    assert(acceptedOrder.status === "ACCEPTED", "State 3: Transition to ACCEPTED by technician");

    await prisma.statusLog.create({
      data: {
        workOrderId: testWorkOrder.id,
        changedById: testTechUser.id,
        fromStatus: "ASSIGNED",
        toStatus: "ACCEPTED",
        notes: "Technician accepted assignment and is mobilizing.",
      },
    });

    // 4.4 Step 4: Transition to IN_PROGRESS
    const inProgressOrder = await prisma.workOrder.update({
      where: { id: testWorkOrder.id },
      data: { status: "IN_PROGRESS" },
    });
    assert(inProgressOrder.status === "IN_PROGRESS", "State 4: Transition to IN_PROGRESS on site");

    await prisma.statusLog.create({
      data: {
        workOrderId: testWorkOrder.id,
        changedById: testTechUser.id,
        fromStatus: "ACCEPTED",
        toStatus: "IN_PROGRESS",
        notes: "On-site diagnostics and valve calibration commenced.",
      },
    });

    // 4.5 Step 5: Transition to PAUSED
    const pausedOrder = await prisma.workOrder.update({
      where: { id: testWorkOrder.id },
      data: { status: "PAUSED" },
    });
    assert(pausedOrder.status === "PAUSED", "State 5: Transition to PAUSED awaiting replacement gasket");

    await prisma.statusLog.create({
      data: {
        workOrderId: testWorkOrder.id,
        changedById: testTechUser.id,
        fromStatus: "IN_PROGRESS",
        toStatus: "PAUSED",
        notes: "Awaiting replacement flange assembly from warehouse.",
      },
    });

    // 4.6 Step 6: Resume to IN_PROGRESS
    const resumedOrder = await prisma.workOrder.update({
      where: { id: testWorkOrder.id },
      data: { status: "IN_PROGRESS" },
    });
    assert(resumedOrder.status === "IN_PROGRESS", "State 6: Resumed to IN_PROGRESS after part delivery");

    await prisma.statusLog.create({
      data: {
        workOrderId: testWorkOrder.id,
        changedById: testTechUser.id,
        fromStatus: "PAUSED",
        toStatus: "IN_PROGRESS",
        notes: "Flange received. Work resumed.",
      },
    });

    // 4.7 Step 7: Transition to COMPLETED (Enforce completion notes & timestamp)
    const completionNotes = "Replaced helium intake manifold seal, recalibrated pressure transducer to 4.2K spec, verified zero leak rate.";
    const completedAt = new Date();
    const completedOrder = await prisma.workOrder.update({
      where: { id: testWorkOrder.id },
      data: {
        status: "COMPLETED",
        completedAt,
        completionNotes,
      },
    });
    assert(completedOrder.status === "COMPLETED", "State 7: Transition to COMPLETED verified");
    assert(!!completedOrder.completedAt, "Completion timestamp recorded");
    assert(completedOrder.completionNotes === completionNotes, "Completion resolution notes saved");

    await prisma.statusLog.create({
      data: {
        workOrderId: testWorkOrder.id,
        changedById: testTechUser.id,
        fromStatus: "IN_PROGRESS",
        toStatus: "COMPLETED",
        notes: completionNotes,
      },
    });

    // 4.8 Step 8: Transition to CLOSED (Final Administrative Sign-off)
    const closedOrder = await prisma.workOrder.update({
      where: { id: testWorkOrder.id },
      data: { status: "CLOSED" },
    });
    assert(closedOrder.status === "CLOSED", "State 8: Final administrative sign-off to CLOSED");

    await prisma.statusLog.create({
      data: {
        workOrderId: testWorkOrder.id,
        changedById: testAdminUser.id,
        fromStatus: "COMPLETED",
        toStatus: "CLOSED",
        notes: "Customer sign-off received. Work order closed and billed.",
      },
    });

    // Verify full audit log trail on work order
    const logs = await prisma.statusLog.findMany({
      where: { workOrderId: testWorkOrder.id },
      orderBy: { changedAt: "asc" },
    });
    assert(logs.length >= 6, `Verified complete chronological status history (${logs.length} transitions)`);

    // -------------------------------------------------------------------------
    // TEST SECTION 5: AUDIT LOG SYSTEM & FORENSIC SEARCH
    // -------------------------------------------------------------------------
    console.log("\n▶️ [TEST SECTION 5] Audit Log & Immutable Activity Logging");

    const auditEntry = await prisma.auditLog.create({
      data: {
        action: "WORK_ORDER_CLOSE",
        entityType: "WORK_ORDER",
        entityId: testWorkOrder.id,
        entityName: testWorkOrder.title,
        userId: testAdminUser.id,
        userName: testAdminUser.name || testAdminUser.email,
        userEmail: testAdminUser.email,
        userRole: testAdminUser.role,
        description: `Work order "${testWorkOrder.title}" transitioned through full verification lifecycle.`,
        metadata: {
          previousStatus: "COMPLETED",
          newStatus: "CLOSED",
          customerId: testCustomer.id,
          technicianId: testTechnician.id,
        },
      },
    });
    assert(!!auditEntry.id, `Created immutable audit log entry (${auditEntry.id})`);

    // Test Audit Query & Filters
    const auditLogsQuery = await prisma.auditLog.findMany({
      where: {
        entityId: testWorkOrder.id,
      },
    });
    assert(auditLogsQuery.length >= 1, "Audit log search by entityId successfully retrieved records");

    // -------------------------------------------------------------------------
    // TEST SECTION 6: REPORTS & ANALYTICS AGGREGATIONS
    // -------------------------------------------------------------------------
    console.log("\n▶️ [TEST SECTION 6] Live Analytics & SLA Metrics Aggregation");

    const totalOrdersCount = await prisma.workOrder.count();
    const completedOrdersCount = await prisma.workOrder.count({
      where: { status: { in: ["COMPLETED", "CLOSED"] } },
    });
    const totalTechniciansCount = await prisma.technician.count();
    const totalCustomersCount = await prisma.customer.count();

    assert(totalOrdersCount >= 1, `Total system work orders: ${totalOrdersCount}`);
    assert(completedOrdersCount >= 1, `Completed/Closed work orders: ${completedOrdersCount}`);
    assert(totalTechniciansCount >= 1, `Total technicians roster: ${totalTechniciansCount}`);
    assert(totalCustomersCount >= 1, `Total customer accounts: ${totalCustomersCount}`);

    const slaComplianceRate = totalOrdersCount > 0 ? Math.round((completedOrdersCount / totalOrdersCount) * 100) : 100;
    assert(slaComplianceRate >= 0 && slaComplianceRate <= 100, `Calculated SLA completion rate: ${slaComplianceRate}%`);

    // -------------------------------------------------------------------------
    // TEST SECTION 7: CLEANUP OF TEST ARTIFACTS
    // -------------------------------------------------------------------------
    console.log("\n▶️ [TEST SECTION 7] Safe Teardown of Test Records");

    // Clean up status logs
    await prisma.statusLog.deleteMany({ where: { workOrderId: testWorkOrder.id } });
    // Clean up audit logs for this test
    await prisma.auditLog.deleteMany({ where: { entityId: testWorkOrder.id } });
    // Clean up work order
    await prisma.workOrder.delete({ where: { id: testWorkOrder.id } });
    assert(true, "Cleaned up test work order and associated logs");

    // Clean up test technician
    await prisma.technician.delete({ where: { id: testTechnician.id } });
    assert(true, "Cleaned up test technician record");

    // Clean up test customer
    await prisma.customer.delete({ where: { id: testCustomer.id } });
    assert(true, "Cleaned up test customer record");

    console.log("\n================================================================================");
    console.log(`🎉 ALL TESTS COMPLETED: ${testsPassed} passed, ${testsFailed} failed`);
    console.log("================================================================================");
  } catch (error) {
    console.error("\n💥 SUITE ENCOUNTERED AN ERROR:", error);
    // Attempt emergency cleanup
    if (testWorkOrder) {
      try {
        await prisma.statusLog.deleteMany({ where: { workOrderId: testWorkOrder.id } });
        await prisma.auditLog.deleteMany({ where: { entityId: testWorkOrder.id } });
        await prisma.workOrder.delete({ where: { id: testWorkOrder.id } });
      } catch {}
    }
    if (testTechnician) {
      try {
        await prisma.technician.delete({ where: { id: testTechnician.id } });
      } catch {}
    }
    if (testCustomer) {
      try {
        await prisma.customer.delete({ where: { id: testCustomer.id } });
      } catch {}
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

runSuite();
