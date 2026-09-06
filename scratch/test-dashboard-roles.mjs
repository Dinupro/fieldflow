import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function testDashboardQueries() {
  console.log("=== Testing Live Neon PostgreSQL Dashboard Data Queries ===");

  try {
    // 1. Verify Users in DB
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true },
    });
    console.log(`\n1. Registered Users (${users.length}):`);
    users.forEach((u) => console.log(` - [${u.role}] ${u.name} (${u.email})`));

    // 2. Verify Technicians in DB
    const technicians = await prisma.technician.findMany({
      include: {
        _count: { select: { workOrders: true } },
        workOrders: { select: { id: true, status: true } },
      },
    });
    console.log(`\n2. Technicians Roster & Performance (${technicians.length}):`);
    technicians.forEach((t) => {
      const completed = t.workOrders.filter((w) => w.status === "COMPLETED" || w.status === "CLOSED").length;
      const active = t.workOrders.filter((w) =>
        ["OPEN", "ASSIGNED", "ACCEPTED", "IN_PROGRESS", "PAUSED"].includes(w.status)
      ).length;
      const total = t.workOrders.length;
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
      console.log(
        ` - ${t.name} (${t.status}): Active: ${active}, Completed: ${completed}, Total: ${total}, Rate: ${rate}%`
      );
    });

    // 3. Work Orders Status Grouping
    const statusGroups = await prisma.workOrder.groupBy({
      by: ["status"],
      _count: { _all: true },
    });
    console.log("\n3. Work Orders by Status Breakdown:");
    statusGroups.forEach((g) => console.log(` - ${g.status}: ${g._count._all}`));

    // 4. Priority Grouping
    const priorityGroups = await prisma.workOrder.groupBy({
      by: ["priority"],
      _count: { _all: true },
    });
    console.log("\n4. Work Orders by Priority Breakdown:");
    priorityGroups.forEach((g) => console.log(` - ${g.priority}: ${g._count._all}`));

    // 5. Unassigned Work Orders
    const unassigned = await prisma.workOrder.findMany({
      where: { technicianId: null },
      select: { id: true, title: true, priority: true, status: true },
    });
    console.log(`\n5. Unassigned Work Orders (${unassigned.length}):`);
    unassigned.forEach((o) => console.log(` - [${o.priority}] ${o.title} (${o.status})`));

    // 6. Recent Status Logs
    const statusLogs = await prisma.statusLog.findMany({
      take: 5,
      orderBy: { changedAt: "desc" },
      include: {
        workOrder: { select: { title: true } },
        changedBy: { select: { name: true, role: true } },
      },
    });
    console.log(`\n6. Recent Status Logs (${statusLogs.length}):`);
    statusLogs.forEach((l) =>
      console.log(
        ` - ${l.workOrder?.title}: ${l.fromStatus} -> ${l.toStatus} by ${l.changedBy?.name} (${l.changedBy?.role})`
      )
    );

    console.log("\n=== ALL LIVE DATABASE QUERIES SUCCEEDED! ===");
  } catch (err) {
    console.error("Test error:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testDashboardQueries();
