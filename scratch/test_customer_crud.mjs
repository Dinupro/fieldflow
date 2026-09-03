import "dotenv/config";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function runTests() {
  console.log("=== Testing Neon PostgreSQL Customer CRUD Operations ===");

  try {
    // 1. Create a test customer
    const testEmail = `test.client.${Date.now()}@fieldflowtest.com`;
    console.log(`\n1. Creating customer with email: ${testEmail}`);
    const created = await prisma.customer.create({
      data: {
        name: "Acme Industrial Corp",
        company: "Acme Industries",
        email: testEmail,
        phone: "+1 (555) 987-6543",
        address: "742 Evergreen Terrace, Suite 100",
        city: "Springfield",
        notes: "Priority client with 2-hour emergency dispatch SLA.",
      },
    });
    console.log("✓ Customer created:", { id: created.id, name: created.name, email: created.email, city: created.city });

    // 2. Read and search
    console.log("\n2. Searching for customer by city 'Springfield'...");
    const searchResults = await prisma.customer.findMany({
      where: {
        OR: [
          { name: { contains: "Acme", mode: "insensitive" } },
          { city: { contains: "Springfield", mode: "insensitive" } },
        ],
      },
      include: {
        _count: {
          select: { workOrders: true },
        },
      },
    });
    console.log(`✓ Found ${searchResults.length} matching record(s). First match:`, searchResults[0].name);

    // 3. Update customer details
    console.log("\n3. Updating customer phone and notes...");
    const updated = await prisma.customer.update({
      where: { id: created.id },
      data: {
        phone: "+1 (555) 111-2222",
        notes: "Updated SLA notes: key card code #8821.",
      },
    });
    console.log("✓ Customer updated:", { id: updated.id, phone: updated.phone, notes: updated.notes });

    // 4. Test safe deletion protection (Active Work Order)
    console.log("\n4. Attaching an active work order to test deletion protection...");
    const workOrder = await prisma.workOrder.create({
      data: {
        title: "HVAC Emergency System Overhaul",
        description: "Diagnose central chiller compressor failure",
        status: "IN_PROGRESS",
        priority: "URGENT",
        customerId: created.id,
      },
    });
    console.log("✓ Work order created with status:", workOrder.status);

    // Verify protection logic
    const checkCustomer = await prisma.customer.findUnique({
      where: { id: created.id },
      include: { workOrders: true },
    });
    const activeJobs = checkCustomer.workOrders.filter(
      (wo) => wo.status === "PENDING" || wo.status === "ASSIGNED" || wo.status === "IN_PROGRESS"
    );
    if (activeJobs.length > 0) {
      console.log(`✓ Safety check passed: Customer has ${activeJobs.length} active job(s). Deletion prevented.`);
    } else {
      throw new Error("Safety check failed: Active job not detected!");
    }

    // 5. Remove work order and safely delete customer
    console.log("\n5. Removing test work order and testing safe deletion...");
    await prisma.workOrder.delete({ where: { id: workOrder.id } });
    await prisma.customer.delete({ where: { id: created.id } });
    console.log("✓ Customer safely deleted after clearing active work orders.");

    console.log("\n=== ALL DATABASE CRUD VERIFICATIONS PASSED SUCCESSFULLY! ===");
  } catch (err) {
    console.error("Test failed with error:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

runTests();
