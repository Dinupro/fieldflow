import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const BASE_URL = process.env.BETTER_AUTH_URL || "http://localhost:3000";

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  bold: "\x1b[1m",
};

function pass(name, details = "") {
  console.log(`  ${colors.green}✓ PASS${colors.reset} - ${colors.bold}${name}${colors.reset} ${details}`);
}

function fail(name, details = "") {
  console.log(`  ${colors.red}✗ FAIL${colors.reset} - ${colors.bold}${name}${colors.reset} ${details}`);
}

function header(title) {
  console.log(`\n${colors.cyan}${colors.bold}=== ${title} ===${colors.reset}`);
}

async function runRBACTests() {
  console.log(`${colors.cyan}${colors.bold}======================================================`);
  console.log(`  FIELDFLOW RBAC MULTI-ROLE AUTOMATED VERIFICATION`);
  console.log(`  Roles: Administrator, Dispatcher, Field Technician`);
  console.log(`======================================================${colors.reset}\n`);

  const timestamp = Date.now();
  let passedCount = 0;
  let failedCount = 0;

  try {
    // 1. Database Provisioning for Test Accounts
    header("1. PROVISIONING RBAC TEST ACCOUNTS IN NEON POSTGRES");

    // Admin User
    const adminEmail = `admin.rbac.${timestamp}@fieldflow.io`;
    const adminUser = await prisma.user.create({
      data: {
        name: "Admin Vance",
        email: adminEmail,
        role: "ADMIN",
        emailVerified: true,
      },
    });
    const adminSessionToken = `token_admin_${timestamp}`;
    await prisma.session.create({
      data: {
        userId: adminUser.id,
        token: adminSessionToken,
        expiresAt: new Date(Date.now() + 24 * 3600 * 1000),
      },
    });
    pass("Admin User Created", `Email: ${adminEmail}, Role: ADMIN`);
    passedCount++;

    // Dispatcher User
    const dispatcherEmail = `dispatcher.rbac.${timestamp}@fieldflow.io`;
    const dispatcherUser = await prisma.user.create({
      data: {
        name: "Dispatcher Sarah",
        email: dispatcherEmail,
        role: "DISPATCHER",
        emailVerified: true,
      },
    });
    const dispatcherSessionToken = `token_dispatcher_${timestamp}`;
    await prisma.session.create({
      data: {
        userId: dispatcherUser.id,
        token: dispatcherSessionToken,
        expiresAt: new Date(Date.now() + 24 * 3600 * 1000),
      },
    });
    pass("Dispatcher User Created", `Email: ${dispatcherEmail}, Role: DISPATCHER`);
    passedCount++;

    // Technician User (Alice)
    const techAliceEmail = `tech.alice.${timestamp}@fieldflow.io`;
    const techAliceUser = await prisma.user.create({
      data: {
        name: "Alice Technician",
        email: techAliceEmail,
        role: "TECHNICIAN",
        emailVerified: true,
      },
    });
    const techAliceRecord = await prisma.technician.create({
      data: {
        name: "Alice Technician",
        email: techAliceEmail,
        userId: techAliceUser.id,
        specialization: "Fiber Optics & Splicing",
        status: "AVAILABLE",
      },
    });
    const techAliceSessionToken = `token_alice_${timestamp}`;
    await prisma.session.create({
      data: {
        userId: techAliceUser.id,
        token: techAliceSessionToken,
        expiresAt: new Date(Date.now() + 24 * 3600 * 1000),
      },
    });
    pass("Technician User (Alice) Created & Linked", `Email: ${techAliceEmail}, TechID: ${techAliceRecord.id}`);
    passedCount++;

    // Technician (Bob) - unlinked / separate tech for cross-access testing
    const techBobRecord = await prisma.technician.create({
      data: {
        name: "Bob Field Engineer",
        email: `bob.tech.${timestamp}@fieldflow.io`,
        specialization: "HVAC & Electrical",
        status: "AVAILABLE",
      },
    });
    pass("Second Technician (Bob) Created", `TechID: ${techBobRecord.id}`);
    passedCount++;

    // Shared Customer for work orders
    const testCustomer = await prisma.customer.create({
      data: {
        name: `Acme Corp ${timestamp}`,
        email: `contact.${timestamp}@acmecorp.com`,
        phone: "+1-555-0199",
        address: "100 Enterprise Way",
        city: "Austin",
      },
    });
    pass("Test Customer Created", `ID: ${testCustomer.id}`);
    passedCount++;

    // Helper for cookie headers
    const getHeaders = (token) => ({
      "Content-Type": "application/json",
      Cookie: `better-auth.session_token=${token}`,
    });

    // =========================================================================
    // 2. ADMINISTRATOR ROLE ACCESS TESTS
    // =========================================================================
    header("2. ADMINISTRATOR ROLE ACCESS TESTS");

    // Test /api/auth/me for Admin
    const adminMeRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: getHeaders(adminSessionToken),
    });
    const adminMeData = await adminMeRes.json();
    if (adminMeRes.status === 200 && adminMeData.role === "ADMIN" && adminMeData.permissions.canManageUsers === true) {
      pass("Admin /api/auth/me Check", `Role: ${adminMeData.role}, canManageUsers: true`);
      passedCount++;
    } else {
      fail("Admin /api/auth/me Check", `Expected 200 & ADMIN, got ${adminMeRes.status} / ${JSON.stringify(adminMeData)}`);
      failedCount++;
    }

    // Test GET /api/users (Admin only)
    const adminUsersRes = await fetch(`${BASE_URL}/api/users`, {
      headers: getHeaders(adminSessionToken),
    });
    const adminUsersData = await adminUsersRes.json();
    if (adminUsersRes.status === 200 && Array.isArray(adminUsersData.users) && adminUsersData.users.length >= 3) {
      pass("Admin GET /api/users", `Returned ${adminUsersData.users.length} users and stats`);
      passedCount++;
    } else {
      fail("Admin GET /api/users", `Expected 200 with users list, got ${adminUsersRes.status}`);
      failedCount++;
    }

    // Test Admin updating user role (e.g. updating dispatcher name or role)
    const updateRoleRes = await fetch(`${BASE_URL}/api/users/${dispatcherUser.id}`, {
      method: "PUT",
      headers: getHeaders(adminSessionToken),
      body: JSON.stringify({ role: "DISPATCHER", name: "Dispatcher Sarah Lead" }),
    });
    const updateRoleData = await updateRoleRes.json();
    if (updateRoleRes.status === 200 && updateRoleData.success) {
      pass("Admin PUT /api/users/[id]", `Updated user role/name successfully`);
      passedCount++;
    } else {
      fail("Admin PUT /api/users/[id]", `Expected 200, got ${updateRoleRes.status}`);
      failedCount++;
    }

    // =========================================================================
    // 3. DISPATCHER ROLE CAPABILITIES TESTS
    // =========================================================================
    header("3. DISPATCHER ROLE CAPABILITIES & BOUNDARIES TESTS");

    // Test Dispatcher trying to access /api/users (Must be Forbidden 403)
    const dispUsersRes = await fetch(`${BASE_URL}/api/users`, {
      headers: getHeaders(dispatcherSessionToken),
    });
    if (dispUsersRes.status === 403) {
      pass("Dispatcher GET /api/users Forbidden", `Correctly rejected with 403 Forbidden`);
      passedCount++;
    } else {
      fail("Dispatcher GET /api/users Forbidden", `Expected 403, got ${dispUsersRes.status}`);
      failedCount++;
    }

    // Test Dispatcher creating Work Order for Alice
    const woAliceRes = await fetch(`${BASE_URL}/api/work-orders`, {
      method: "POST",
      headers: getHeaders(dispatcherSessionToken),
      body: JSON.stringify({
        title: `Fiber Upgrade for Acme Node A - ${timestamp}`,
        description: "Deploy 10G optical transceiver on rack 4",
        customerId: testCustomer.id,
        technicianId: techAliceRecord.id,
        priority: "HIGH",
        status: "ASSIGNED",
      }),
    });
    const woAlice = await woAliceRes.json();
    if (woAliceRes.status === 201 && woAlice.id) {
      pass("Dispatcher Created Work Order for Alice", `WO ID: ${woAlice.id}, Priority: ${woAlice.priority}`);
      passedCount++;
    } else {
      fail("Dispatcher Created Work Order for Alice", `Expected 201, got ${woAliceRes.status}`);
      failedCount++;
    }

    // Test Dispatcher creating Work Order for Bob
    const woBobRes = await fetch(`${BASE_URL}/api/work-orders`, {
      method: "POST",
      headers: getHeaders(dispatcherSessionToken),
      body: JSON.stringify({
        title: `HVAC Maintenance at Acme Plant - ${timestamp}`,
        description: "Filter replacement and chiller calibration",
        customerId: testCustomer.id,
        technicianId: techBobRecord.id,
        priority: "MEDIUM",
        status: "ASSIGNED",
      }),
    });
    const woBob = await woBobRes.json();
    if (woBobRes.status === 201 && woBob.id) {
      pass("Dispatcher Created Work Order for Bob", `WO ID: ${woBob.id}`);
      passedCount++;
    } else {
      fail("Dispatcher Created Work Order for Bob", `Expected 201, got ${woBobRes.status}`);
      failedCount++;
    }

    // =========================================================================
    // 4. TECHNICIAN SCOPING & ACTION PERMISSIONS
    // =========================================================================
    header("4. FIELD TECHNICIAN STRICT SCOPING & WORKFLOW TESTS");

    // Test Technician /api/auth/me
    const techMeRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: getHeaders(techAliceSessionToken),
    });
    const techMeData = await techMeRes.json();
    if (techMeRes.status === 200 && techMeData.role === "TECHNICIAN" && techMeData.permissions.isTechnicianOnly === true) {
      pass("Technician /api/auth/me Check", `Role: TECHNICIAN, Linked Tech: ${techMeData.technician?.name}`);
      passedCount++;
    } else {
      fail("Technician /api/auth/me Check", `Expected 200 & TECHNICIAN, got ${techMeRes.status}`);
      failedCount++;
    }

    // Test GET /api/work-orders as Technician (Must ONLY see Alice's orders, NOT Bob's!)
    const techOrdersRes = await fetch(`${BASE_URL}/api/work-orders`, {
      headers: getHeaders(techAliceSessionToken),
    });
    const techOrdersData = await techOrdersRes.json();
    const aliceOrders = techOrdersData.workOrders || [];

    const hasOnlyAliceOrders = aliceOrders.every((o) => o.technicianId === techAliceRecord.id);
    const hasBobOrder = aliceOrders.some((o) => o.id === woBob.id);

    if (techOrdersRes.status === 200 && hasOnlyAliceOrders && !hasBobOrder) {
      pass("Technician GET /api/work-orders Scoped", `Returned ${aliceOrders.length} assigned order(s); Bob's order excluded`);
      passedCount++;
    } else {
      fail("Technician GET /api/work-orders Scoped", `Expected only Alice's orders. hasOnlyAlice: ${hasOnlyAliceOrders}, hasBob: ${hasBobOrder}`);
      failedCount++;
    }

    // Test Technician attempting to create work order (Must be 403 Forbidden)
    const techCreateOrderRes = await fetch(`${BASE_URL}/api/work-orders`, {
      method: "POST",
      headers: getHeaders(techAliceSessionToken),
      body: JSON.stringify({
        title: "Unauthorized Order",
        description: "Test",
        customerId: testCustomer.id,
      }),
    });
    if (techCreateOrderRes.status === 403) {
      pass("Technician POST /api/work-orders Guard", `Correctly rejected with 403 Forbidden`);
      passedCount++;
    } else {
      fail("Technician POST /api/work-orders Guard", `Expected 403, got ${techCreateOrderRes.status}`);
      failedCount++;
    }

    // Test Technician attempting to create customer (Must be 403 Forbidden)
    const techCreateCustRes = await fetch(`${BASE_URL}/api/customers`, {
      method: "POST",
      headers: getHeaders(techAliceSessionToken),
      body: JSON.stringify({
        name: "Unauthorized Customer",
        email: `unauth.${timestamp}@test.com`,
        phone: "12345678",
        address: "Test",
        city: "Test",
      }),
    });
    if (techCreateCustRes.status === 403) {
      pass("Technician POST /api/customers Guard", `Correctly rejected with 403 Forbidden`);
      passedCount++;
    } else {
      fail("Technician POST /api/customers Guard", `Expected 403, got ${techCreateCustRes.status}`);
      failedCount++;
    }

    // Test Technician attempting to delete work order (Must be 403 Forbidden)
    const techDeleteOrderRes = await fetch(`${BASE_URL}/api/work-orders/${woAlice.id}`, {
      method: "DELETE",
      headers: getHeaders(techAliceSessionToken),
    });
    if (techDeleteOrderRes.status === 403) {
      pass("Technician DELETE /api/work-orders Guard", `Correctly rejected with 403 Forbidden`);
      passedCount++;
    } else {
      fail("Technician DELETE /api/work-orders Guard", `Expected 403, got ${techDeleteOrderRes.status}`);
      failedCount++;
    }

    // Test Technician STARTING WORK on assigned order (Status: IN_PROGRESS)
    const startWorkRes = await fetch(`${BASE_URL}/api/work-orders/${woAlice.id}`, {
      method: "PUT",
      headers: getHeaders(techAliceSessionToken),
      body: JSON.stringify({
        status: "IN_PROGRESS",
      }),
    });
    const startWorkData = await startWorkRes.json();
    if (startWorkRes.status === 200 && startWorkData.status === "IN_PROGRESS") {
      pass("Technician Start Work (IN_PROGRESS)", `Status transitioned to IN_PROGRESS`);
      passedCount++;
    } else {
      fail("Technician Start Work (IN_PROGRESS)", `Expected 200 and IN_PROGRESS, got ${startWorkRes.status}`);
      failedCount++;
    }

    // Test Technician COMPLETING WORK with completion notes
    const completionNote = "Replaced optical transceiver and verified 10Gbps link with 0ms loss.";
    const completeWorkRes = await fetch(`${BASE_URL}/api/work-orders/${woAlice.id}`, {
      method: "PUT",
      headers: getHeaders(techAliceSessionToken),
      body: JSON.stringify({
        status: "COMPLETED",
        completionNotes: completionNote,
        completedAt: new Date().toISOString(),
      }),
    });
    const completeWorkData = await completeWorkRes.json();
    if (
      completeWorkRes.status === 200 &&
      completeWorkData.status === "COMPLETED" &&
      completeWorkData.completionNotes === completionNote &&
      completeWorkData.completedAt !== null
    ) {
      pass("Technician Complete Job & Notes", `Status: COMPLETED, Notes verified, completedAt recorded`);
      passedCount++;
    } else {
      fail("Technician Complete Job & Notes", `Expected 200 & COMPLETED, got ${completeWorkRes.status}`);
      failedCount++;
    }

    // Test Technician attempting to modify Bob's work order (Must be 403 Forbidden)
    const techUpdateBobOrderRes = await fetch(`${BASE_URL}/api/work-orders/${woBob.id}`, {
      method: "PUT",
      headers: getHeaders(techAliceSessionToken),
      body: JSON.stringify({
        status: "COMPLETED",
      }),
    });
    if (techUpdateBobOrderRes.status === 403) {
      pass("Technician Cross-Order Update Guard", `Correctly rejected cross-technician update with 403 Forbidden`);
      passedCount++;
    } else {
      fail("Technician Cross-Order Update Guard", `Expected 403, got ${techUpdateBobOrderRes.status}`);
      failedCount++;
    }

    // Test Technician Dashboard Scoping (Metrics scoped to Alice's jobs)
    const techDashRes = await fetch(`${BASE_URL}/api/dashboard`, {
      headers: getHeaders(techAliceSessionToken),
    });
    const techDashData = await techDashRes.json();
    if (techDashRes.status === 200 && techDashData.metrics && techDashData.role === "TECHNICIAN") {
      pass("Technician Scoped Dashboard Analytics", `Role: TECHNICIAN, Total Orders: ${techDashData.metrics.totalWorkOrders}`);
      passedCount++;
    } else {
      fail("Technician Scoped Dashboard Analytics", `Expected 200, got ${techDashRes.status}`);
      failedCount++;
    }

    // Clean up test entities
    await prisma.statusLog.deleteMany({
      where: { workOrderId: { in: [woAlice.id, woBob.id] } },
    });
    await prisma.workOrder.deleteMany({
      where: { id: { in: [woAlice.id, woBob.id] } },
    });
    await prisma.technician.deleteMany({
      where: { id: { in: [techAliceRecord.id, techBobRecord.id] } },
    });
    await prisma.customer.deleteMany({
      where: { id: testCustomer.id },
    });
    await prisma.session.deleteMany({
      where: { userId: { in: [adminUser.id, dispatcherUser.id, techAliceUser.id] } },
    });
    await prisma.user.deleteMany({
      where: { id: { in: [adminUser.id, dispatcherUser.id, techAliceUser.id] } },
    });

    header("TEST SUMMARY & RESULTS");
    console.log(`  Total RBAC Tests Executed: ${passedCount + failedCount}`);
    console.log(`  ${colors.green}Passed: ${passedCount}${colors.reset}`);
    console.log(`  ${failedCount === 0 ? colors.green : colors.red}Failed: ${failedCount}${colors.reset}\n`);

    if (failedCount === 0) {
      console.log(`  ${colors.green}${colors.bold}✓ ALL RBAC TESTS PASSED WITH 100% SUCCESS!${colors.reset}\n`);
    } else {
      console.log(`  ${colors.red}${colors.bold}✗ SOME RBAC TESTS FAILED.${colors.reset}\n`);
      process.exitCode = 1;
    }
  } catch (error) {
    console.error("RBAC Test Runner encountered an unexpected error:", error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

runRBACTests();
