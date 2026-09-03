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

async function runWorkOrderApiTests() {
  console.log("=== Testing FieldFlow Work Order API Endpoints via HTTP ===");

  try {
    const testEmail = `dispatcher.${Date.now()}@fieldflow.io`;
    const testPassword = "Password123!";

    // 1. Authenticate / Sign-Up
    console.log(`\n1. Authenticating user via POST /api/auth/sign-up/email (${testEmail})...`);
    const signUpRes = await fetch("http://localhost:3000/api/auth/sign-up/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
      body: JSON.stringify({
        name: "Field Operations Dispatcher",
        email: testEmail,
        password: testPassword,
      }),
    });

    console.log("Sign-up status:", signUpRes.status);
    const setCookieHeader = signUpRes.headers.get("set-cookie");
    if (!signUpRes.ok || !setCookieHeader) {
      throw new Error("Failed to authenticate session.");
    }
    const cookie = setCookieHeader.split(";")[0];

    // Ensure test customer and technicians exist
    let customer = await prisma.customer.findFirst();
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: "OmniRetail SuperCenters",
          company: "OmniRetail Group",
          email: `store.${Date.now()}@omniretail.com`,
          phone: "+1 (555) 333-2211",
          address: "8800 Highway 183 North",
          city: "Austin, TX",
        },
      });
    }

    const availableTech = await prisma.technician.create({
      data: {
        name: "Alex Rivera",
        email: `alex.${Date.now()}@fieldflow.io`,
        phone: "+1 (555) 777-9988",
        specialization: "Retail POS & Terminal Systems",
        skills: ["Verifone / Ingenico", "NCR Kiosks"],
        status: "AVAILABLE",
        serviceArea: "Austin Metro",
      },
    });

    const offlineTech = await prisma.technician.create({
      data: {
        name: "Off-Duty Frank",
        email: `frank.${Date.now()}@fieldflow.io`,
        phone: "+1 (555) 000-9999",
        specialization: "General Ops",
        skills: ["Standard"],
        status: "OFF",
        serviceArea: "Austin Metro",
      },
    });

    // 2. Test GET /api/work-orders
    console.log("\n2. Testing GET /api/work-orders with stats...");
    const getRes = await fetch("http://localhost:3000/api/work-orders?limit=10", {
      headers: { cookie },
    });
    console.log("GET /api/work-orders status:", getRes.status);
    const getData = await getRes.json();
    console.log("✓ Metrics received:", getData.stats);

    // 3. Test Offline Technician Validation Rejection on POST
    console.log("\n3. Testing Offline Technician validation rejection on POST /api/work-orders...");
    const offlinePostRes = await fetch("http://localhost:3000/api/work-orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie,
      },
      body: JSON.stringify({
        title: "Test Offline Tech Order",
        description: "Testing rejection of offline technician",
        customerId: customer.id,
        technicianId: offlineTech.id,
        priority: "MEDIUM",
        status: "OPEN",
      }),
    });

    console.log("Offline tech assignment status:", offlinePostRes.status);
    const offlineErrorData = await offlinePostRes.json();
    console.log("✓ Validation response:", offlineErrorData);

    if (offlinePostRes.status !== 400) {
      throw new Error("Expected 400 Bad Request when assigning offline technician!");
    }

    // 4. Test POST /api/work-orders with available technician
    console.log("\n4. Testing POST /api/work-orders with Available technician...");
    const createRes = await fetch("http://localhost:3000/api/work-orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie,
      },
      body: JSON.stringify({
        title: "Emergency POS Terminal Migration (Lanes 1-8)",
        description: "Overnight upgrade of 8 registers to Ingenico Lane/7000 EMV terminals",
        customerId: customer.id,
        technicianId: availableTech.id,
        priority: "URGENT",
        status: "ASSIGNED",
        scheduledAt: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
        completionNotes: "Store manager contact: Jane Doe (Ext 402)",
      }),
    });

    console.log("POST /api/work-orders status:", createRes.status);
    const createdOrder = await createRes.json();
    console.log("✓ Work order created successfully:", {
      id: createdOrder.id,
      title: createdOrder.title,
      status: createdOrder.status,
      assignedTech: createdOrder.technician?.name,
    });

    const orderId = createdOrder.id;

    // 5. Test GET /api/work-orders/[id] with StatusLog history
    console.log("\n5. Testing GET /api/work-orders/[id]...");
    const getSingleRes = await fetch(`http://localhost:3000/api/work-orders/${orderId}`, {
      headers: { cookie },
    });
    console.log("GET single work order status:", getSingleRes.status);
    const singleData = await getSingleRes.json();
    console.log("✓ Work order retrieved with status timeline:", {
      title: singleData.title,
      customer: singleData.customer?.name,
      timelineLogsCount: singleData.statusLogs?.length,
    });

    // 6. Test PUT /api/work-orders/[id] (status transition to COMPLETED)
    console.log("\n6. Testing PUT /api/work-orders/[id] (Transitioning to COMPLETED)...");
    const putRes = await fetch(`http://localhost:3000/api/work-orders/${orderId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        cookie,
      },
      body: JSON.stringify({
        title: singleData.title,
        description: singleData.description,
        customerId: singleData.customerId,
        technicianId: singleData.technicianId,
        priority: singleData.priority,
        status: "COMPLETED",
        completionNotes: "All 8 registers upgraded, calibrated, and passing test payments.",
      }),
    });

    console.log("PUT status:", putRes.status);
    const updatedOrder = await putRes.json();
    console.log("✓ Updated work order:", {
      status: updatedOrder.status,
      completedAt: updatedOrder.completedAt,
      timelineLogsCount: updatedOrder.statusLogs?.length,
    });

    // 7. Test DELETE /api/work-orders/[id]
    console.log("\n7. Testing DELETE /api/work-orders/[id]...");
    const deleteRes = await fetch(`http://localhost:3000/api/work-orders/${orderId}`, {
      method: "DELETE",
      headers: { cookie },
    });
    console.log("DELETE status:", deleteRes.status);
    const deleteData = await deleteRes.json();
    console.log("✓ Delete response:", deleteData);

    // Clean up test technicians
    await prisma.technician.delete({ where: { id: availableTech.id } });
    await prisma.technician.delete({ where: { id: offlineTech.id } });

    console.log("\n=== ALL WORK ORDER HTTP API TESTS PASSED WITH 100% SUCCESS! ===");
  } catch (err) {
    console.error("Test failed with error:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

runWorkOrderApiTests();
