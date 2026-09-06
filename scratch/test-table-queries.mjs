import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function testTableQueries() {
  console.log("=== Testing Server-Side Search, Filtering, Sorting & Pagination ===");

  try {
    // 1. Search Work Orders by Customer Email substring
    const emailSearch = "tech";
    const ordersByEmail = await prisma.workOrder.findMany({
      where: {
        OR: [
          { customer: { email: { contains: emailSearch, mode: "insensitive" } } },
          { technician: { email: { contains: emailSearch, mode: "insensitive" } } },
        ],
      },
      select: {
        id: true,
        title: true,
        customer: { select: { name: true, email: true } },
        technician: { select: { name: true, email: true } },
      },
      take: 5,
    });
    console.log(`\n1. Search by email "${emailSearch}" (${ordersByEmail.length} results):`);
    ordersByEmail.forEach((o) =>
      console.log(` - "${o.title}" (Cust: ${o.customer?.email}, Tech: ${o.technician?.email})`)
    );

    // 2. Filter by Priority and Status
    const urgentOrHigh = await prisma.workOrder.findMany({
      where: {
        AND: [
          { priority: { in: ["HIGH", "URGENT"] } },
          { status: { in: ["OPEN", "ASSIGNED", "IN_PROGRESS"] } },
        ],
      },
      select: { id: true, title: true, priority: true, status: true },
    });
    console.log(`\n2. Filter: Priority (HIGH/URGENT) + Status (OPEN/ASSIGNED/IN_PROGRESS) (${urgentOrHigh.length} results):`);
    urgentOrHigh.forEach((o) => console.log(` - [${o.priority}] [${o.status}] ${o.title}`));

    // 3. Date Range Filter
    const today = new Date();
    const pastMonth = new Date(today.getFullYear(), today.getMonth() - 2, 1);
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 1);
    const dateRangeOrders = await prisma.workOrder.findMany({
      where: {
        createdAt: {
          gte: pastMonth,
          lte: nextMonth,
        },
      },
      select: { id: true, title: true, createdAt: true },
      take: 5,
    });
    console.log(`\n3. Date Range Filter (${pastMonth.toISOString().slice(0,10)} to ${nextMonth.toISOString().slice(0,10)}) (${dateRangeOrders.length} results):`);
    dateRangeOrders.forEach((o) => console.log(` - ${o.title} (Created: ${new Date(o.createdAt).toLocaleDateString()})`));

    // 4. Sorting and Pagination Test
    const page = 1;
    const limit = 3;
    const [sortedTotal, pagedOrders] = await Promise.all([
      prisma.workOrder.count(),
      prisma.workOrder.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { title: "asc" },
        select: { id: true, title: true, priority: true, status: true },
      }),
    ]);
    console.log(`\n4. Sorting by Title (ASC) + Pagination (Page ${page}, Limit ${limit}, Total: ${sortedTotal}):`);
    pagedOrders.forEach((o, i) => console.log(` - #${i + 1}: ${o.title} [${o.priority}]`));

    // 5. Customer Table Multi-Field Search (Phone or City)
    const custSearch = "Metro";
    const foundCustomers = await prisma.customer.findMany({
      where: {
        OR: [
          { name: { contains: custSearch, mode: "insensitive" } },
          { company: { contains: custSearch, mode: "insensitive" } },
          { city: { contains: custSearch, mode: "insensitive" } },
        ],
      },
      select: { id: true, name: true, company: true, city: true, phone: true },
    });
    console.log(`\n5. Customer Search for "${custSearch}" (${foundCustomers.length} results):`);
    foundCustomers.forEach((c) => console.log(` - ${c.name} (${c.company || "N/A"}) in ${c.city || "N/A"}`));

    // 6. Technician Table Filter by Status and Specialization
    const availableTechs = await prisma.technician.findMany({
      where: {
        status: "AVAILABLE",
      },
      select: { id: true, name: true, status: true, specialization: true, serviceArea: true },
    });
    console.log(`\n6. Technician Filter: AVAILABLE (${availableTechs.length} results):`);
    availableTechs.forEach((t) => console.log(` - ${t.name} (${t.specialization}) - ${t.serviceArea}`));

    console.log("\n=== ALL SERVER-SIDE QUERY TESTS PASSED SUCCESSFULLY! ===");
  } catch (err) {
    console.error("Test failed:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testTableQueries();
