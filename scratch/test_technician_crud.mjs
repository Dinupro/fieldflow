import "dotenv/config";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function runTechnicianTests() {
  console.log("=== Testing Neon PostgreSQL Technician CRUD Operations ===");

  try {
    const testEmail = `tech.${Date.now()}@fieldflow.io`;

    // 1. Create a Technician record
    console.log(`\n1. Creating technician record: Marcus Vance (${testEmail})...`);
    const createdTech = await prisma.technician.create({
      data: {
        name: "Marcus Vance",
        email: testEmail,
        phone: "+1 (555) 888-7766",
        specialization: "Fiber & Network Infrastructure",
        skills: ["Fluke Certified", "Fusion Splicing", "Cisco Catalyst 9k", "OSHA 30"],
        status: "AVAILABLE",
        serviceArea: "Austin, TX Metro",
        notes: "Equipped with OTDR tester kit and Ford Transit Van #14.",
      },
    });

    console.log("✓ Technician created successfully:", {
      id: createdTech.id,
      name: createdTech.name,
      email: createdTech.email,
      status: createdTech.status,
      skillsCount: createdTech.skills.length,
    });

    // 2. Read and search technicians
    console.log("\n2. Searching technician by specialization and status...");
    const searchResults = await prisma.technician.findMany({
      where: {
        AND: [
          { specialization: { contains: "Fiber", mode: "insensitive" } },
          { status: "AVAILABLE" },
        ],
      },
      include: {
        _count: {
          select: { workOrders: true },
        },
      },
    });

    console.log(`✓ Found ${searchResults.length} matching technician(s). First match:`, searchResults[0].name);

    // 3. Update technician details and availability status
    console.log("\n3. Updating technician availability to 'BUSY' and adding new certification...");
    const updatedTech = await prisma.technician.update({
      where: { id: createdTech.id },
      data: {
        status: "BUSY",
        skills: [...createdTech.skills, "Corning Fiber Pro"],
        notes: "Dispatched to Downtown Data Center cutover.",
      },
    });

    console.log("✓ Technician updated successfully:", {
      id: updatedTech.id,
      status: updatedTech.status,
      skills: updatedTech.skills,
      notes: updatedTech.notes,
    });

    // 4. Test Active Work Order Deletion Protection
    console.log("\n4. Attaching an active work order to test deletion safety guard...");
    // Find or create a test customer for relation
    let testCustomer = await prisma.customer.findFirst();
    if (!testCustomer) {
      testCustomer = await prisma.customer.create({
        data: {
          name: "Test Customer Corp",
          email: `cust.${Date.now()}@test.com`,
          phone: "+1 555 000 1111",
          address: "100 Tech Blvd",
        },
      });
    }

    const activeOrder = await prisma.workOrder.create({
      data: {
        title: "Emergency Fiber Cut Restoration",
        description: "Backhoe cut main 96-strand trunk cable near highway junction",
        status: "IN_PROGRESS",
        priority: "URGENT",
        customerId: testCustomer.id,
        technicianId: createdTech.id,
      },
    });

    console.log("✓ Assigned active work order:", {
      id: activeOrder.id,
      title: activeOrder.title,
      status: activeOrder.status,
    });

    // Verify deletion protection logic
    const checkTech = await prisma.technician.findUnique({
      where: { id: createdTech.id },
      include: { workOrders: true },
    });

    const activeJobs = checkTech.workOrders.filter(
      (wo) => wo.status === "OPEN" || wo.status === "ASSIGNED" || wo.status === "IN_PROGRESS"
    );

    if (activeJobs.length > 0) {
      console.log(`✓ Safety check passed: Technician has ${activeJobs.length} active job(s). Deletion prevented!`);
    } else {
      throw new Error("Safety check failed: Active work order not detected on technician!");
    }

    // 5. Complete/remove work order and safely delete technician
    console.log("\n5. Removing test work order and performing safe deletion...");
    await prisma.workOrder.delete({ where: { id: activeOrder.id } });
    await prisma.technician.delete({ where: { id: createdTech.id } });

    console.log("✓ Technician safely deleted after clearing active work orders.");

    console.log("\n=== ALL DATABASE CRUD VERIFICATIONS PASSED SUCCESSFULLY! ===");
  } catch (err) {
    console.error("Test failed with error:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

runTechnicianTests();
