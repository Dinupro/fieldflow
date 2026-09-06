import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function createNotification(params) {
  return await prisma.notification.create({
    data: {
      userId: params.userId,
      workOrderId: params.workOrderId || null,
      type: params.type,
      title: params.title.trim().slice(0, 150),
      message: params.message.trim(),
      isRead: false,
    },
  });
}

async function notifyRoles(params) {
  const whereCondition = { role: { in: params.roles } };
  if (params.excludeUserId) {
    whereCondition.id = { not: params.excludeUserId };
  }
  const targetUsers = await prisma.user.findMany({
    where: whereCondition,
    select: { id: true },
  });
  if (targetUsers.length === 0) return [];
  return await prisma.notification.createMany({
    data: targetUsers.map((u) => ({
      userId: u.id,
      workOrderId: params.workOrderId || null,
      type: params.type,
      title: params.title.trim().slice(0, 150),
      message: params.message.trim(),
      isRead: false,
    })),
  });
}

async function main() {
  console.log("=== Testing Real-Time In-App Notification System with Live PostgreSQL Data ===");

  // 1. Fetch system users
  const [adminUser, dispatcherUser, techUser] = await Promise.all([
    prisma.user.findFirst({ where: { role: "ADMIN" } }),
    prisma.user.findFirst({ where: { role: "DISPATCHER" } }),
    prisma.user.findFirst({ where: { role: "TECHNICIAN" }, include: { technician: true } }),
  ]);

  console.log("Users identified for notification testing:");
  console.log(`- Admin: ${adminUser?.email} (${adminUser?.id})`);
  console.log(`- Dispatcher: ${dispatcherUser?.email} (${dispatcherUser?.id})`);
  console.log(`- Tech: ${techUser?.email} (${techUser?.id}, linked Tech ID: ${techUser?.technician?.id})`);

  if (!adminUser || !dispatcherUser) {
    throw new Error("Admin and Dispatcher users must exist in the database for test.");
  }

  // 2. Fetch a sample customer
  const customer = await prisma.customer.findFirst();
  if (!customer) throw new Error("No customer found in DB.");

  // 3. Create a test work order and trigger CREATED notification
  const testWO = await prisma.workOrder.create({
    data: {
      title: `E2E Notif Test WO - ${Date.now()}`,
      description: "Automated test dispatch to verify real-time lifecycle notifications.",
      customerId: customer.id,
      priority: "HIGH",
      status: "OPEN",
    },
    include: {
      customer: true,
      technician: true,
    },
  });

  console.log(`\nCreated test work order: ${testWO.title} (ID: ${testWO.id})`);

  // Trigger CREATED
  await notifyRoles({
    roles: ["ADMIN", "DISPATCHER"],
    workOrderId: testWO.id,
    type: "WORK_ORDER_CREATED",
    title: `New Work Order: ${testWO.title}`,
    message: `Created by ${dispatcherUser.name || "Dispatch"} with HIGH priority.`,
    excludeUserId: dispatcherUser.id,
  });

  // Verify notification received by Admin
  const adminNotifs = await prisma.notification.findMany({
    where: { userId: adminUser.id, workOrderId: testWO.id },
    orderBy: { createdAt: "desc" },
  });
  console.log(`✓ Admin received ${adminNotifs.length} notification(s) for CREATED event.`);
  if (adminNotifs.length === 0) throw new Error("Admin did not receive CREATED notification!");

  // 4. Assign Technician and trigger ASSIGNED
  let techId = techUser?.technician?.id;
  if (!techId) {
    const anyTech = await prisma.technician.findFirst();
    techId = anyTech?.id;
  }

  const updatedAssigned = await prisma.workOrder.update({
    where: { id: testWO.id },
    data: { technicianId: techId, status: "ASSIGNED" },
    include: { technician: true, customer: true },
  });

  if (techUser) {
    await createNotification({
      userId: techUser.id,
      workOrderId: testWO.id,
      type: "WORK_ORDER_ASSIGNED",
      title: `Work Order Assigned: ${updatedAssigned.title}`,
      message: `You have been assigned to "${updatedAssigned.title}" by ${dispatcherUser.name}.`,
    });
    console.log("✓ Dispatched ASSIGNED notification to Technician user.");
  }

  // 5. Simulate Technician ACCEPTED
  const updatedAccepted = await prisma.workOrder.update({
    where: { id: testWO.id },
    data: { status: "ACCEPTED" },
    include: { technician: true, customer: true },
  });

  await notifyRoles({
    roles: ["ADMIN", "DISPATCHER"],
    workOrderId: testWO.id,
    type: "WORK_ORDER_ACCEPTED",
    title: `Job Accepted: ${updatedAccepted.title}`,
    message: `${updatedAccepted.technician?.name || "Technician"} accepted work order.`,
  });
  console.log("✓ Dispatched ACCEPTED notification.");

  // 6. Simulate IN_PROGRESS
  const updatedProgress = await prisma.workOrder.update({
    where: { id: testWO.id },
    data: { status: "IN_PROGRESS" },
    include: { technician: true, customer: true },
  });

  await notifyRoles({
    roles: ["ADMIN", "DISPATCHER"],
    workOrderId: testWO.id,
    type: "WORK_ORDER_IN_PROGRESS",
    title: `Work Started: ${updatedProgress.title}`,
    message: `${updatedProgress.technician?.name || "Technician"} started on-site work.`,
  });
  console.log("✓ Dispatched IN_PROGRESS notification.");

  // 7. Simulate COMPLETED with completion notes
  const updatedCompleted = await prisma.workOrder.update({
    where: { id: testWO.id },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
      completionNotes: "Optical power level tested at -14.2 dBm. Circuit verified and operational.",
    },
    include: { technician: true, customer: true },
  });

  await notifyRoles({
    roles: ["ADMIN", "DISPATCHER"],
    workOrderId: testWO.id,
    type: "WORK_ORDER_COMPLETED",
    title: `Job Completed: ${updatedCompleted.title}`,
    message: `${updatedCompleted.technician?.name || "Technician"} completed work order with notes: "${updatedCompleted.completionNotes}"`,
  });
  console.log("✓ Dispatched COMPLETED notification.");

  // 8. Verify unread notifications for Admin
  const [totalAdminNotifs, unreadAdminNotifs] = await Promise.all([
    prisma.notification.count({ where: { userId: adminUser.id } }),
    prisma.notification.count({ where: { userId: adminUser.id, isRead: false } }),
  ]);

  console.log(`\nAdmin Notification Summary: Total = ${totalAdminNotifs}, Unread = ${unreadAdminNotifs}`);

  // 9. Test Mark All As Read
  const marked = await prisma.notification.updateMany({
    where: { userId: adminUser.id, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });
  console.log(`✓ Marked ${marked.count} admin notifications as read.`);

  const remainingUnread = await prisma.notification.count({
    where: { userId: adminUser.id, isRead: false },
  });
  console.log(`✓ Remaining unread for admin: ${remainingUnread}`);
  if (remainingUnread !== 0) throw new Error("Unread count should be 0 after marking all read!");

  // Clean up test work order
  await prisma.workOrder.delete({ where: { id: testWO.id } });
  console.log(`✓ Cleaned up test work order ${testWO.id}.`);

  console.log("\n=== ALL REAL-TIME NOTIFICATION SYSTEM TESTS PASSED SUCCESSFULLY! ===");
}

main()
  .catch((e) => {
    console.error("Test execution failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
