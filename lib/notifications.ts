import { prisma } from "@/lib/prisma";

export type UserRole = "ADMIN" | "DISPATCHER" | "TECHNICIAN";

export type NotificationType =
  | "WORK_ORDER_CREATED"
  | "WORK_ORDER_ASSIGNED"
  | "WORK_ORDER_ACCEPTED"
  | "WORK_ORDER_IN_PROGRESS"
  | "WORK_ORDER_PAUSED"
  | "WORK_ORDER_COMPLETED"
  | "WORK_ORDER_CANCELLED"
  | "WORK_ORDER_CLOSED"
  | "SYSTEM_ALERT";

export interface CreateNotificationParams {
  userId: string;
  workOrderId?: string | null;
  type: NotificationType;
  title: string;
  message: string;
}

export interface NotifyRolesParams {
  roles: UserRole[];
  workOrderId?: string | null;
  type: NotificationType;
  title: string;
  message: string;
  excludeUserId?: string | null;
}

/**
 * Creates a single in-app notification in Neon PostgreSQL.
 */
export async function createNotification(params: CreateNotificationParams) {
  try {
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
  } catch (error) {
    console.error("[CREATE_NOTIFICATION_ERROR]", error);
    return null;
  }
}

/**
 * Broadcasts a notification to all users matching specified roles.
 */
export async function notifyRoles(params: NotifyRolesParams) {
  try {
    const whereCondition: Record<string, unknown> = {
      role: { in: params.roles },
    };

    if (params.excludeUserId) {
      whereCondition.id = { not: params.excludeUserId };
    }

    const targetUsers = await prisma.user.findMany({
      where: whereCondition,
      select: { id: true },
    });

    if (targetUsers.length === 0) return [];

    return await prisma.notification.createMany({
      data: targetUsers.map((u: { id: string }) => ({
        userId: u.id,
        workOrderId: params.workOrderId || null,
        type: params.type,
        title: params.title.trim().slice(0, 150),
        message: params.message.trim(),
        isRead: false,
      })),
    });
  } catch (error) {
    console.error("[NOTIFY_ROLES_ERROR]", error);
    return null;
  }
}

/**
 * Notifies the linked user account of a specific technician.
 */
export async function notifyTechnicianUser(
  technicianId: string,
  params: Omit<CreateNotificationParams, "userId">
) {
  try {
    const tech = await prisma.technician.findUnique({
      where: { id: technicianId },
      include: { user: true },
    });

    if (!tech) return null;

    let targetUserId = tech.userId;

    // If userId not explicitly linked, try resolving by matching email
    if (!targetUserId && tech.email) {
      const user = await prisma.user.findFirst({
        where: { email: { equals: tech.email, mode: "insensitive" } },
        select: { id: true },
      });
      if (user) {
        targetUserId = user.id;
      }
    }

    if (!targetUserId) {
      // Tech doesn't have an active user login account
      return null;
    }

    return await createNotification({
      ...params,
      userId: targetUserId,
    });
  } catch (error) {
    console.error("[NOTIFY_TECH_USER_ERROR]", error);
    return null;
  }
}

export type LifecycleEvent =
  | "CREATED"
  | "ASSIGNED"
  | "ACCEPTED"
  | "DECLINED"
  | "IN_PROGRESS"
  | "PAUSED"
  | "RESUMED"
  | "COMPLETED"
  | "CANCELLED"
  | "CLOSED";

export interface LifecyclePayload {
  workOrder: {
    id: string;
    title: string;
    priority?: string;
    technicianId?: string | null;
    customerId?: string;
    customer?: { name: string; company?: string | null } | null;
    technician?: { id: string; name: string } | null;
  };
  actor: {
    id: string;
    name?: string | null;
    role?: string | null;
  };
  notes?: string | null;
  technicianName?: string | null;
}

/**
 * Dispatches relevant role-based notifications for work order lifecycle transitions.
 */
export async function triggerLifecycleNotification(
  event: LifecycleEvent,
  payload: LifecyclePayload
) {
  const { workOrder, actor, notes } = payload;
  const woTitle = workOrder.title;
  const woId = workOrder.id;
  const techName = payload.technicianName || workOrder.technician?.name || "Technician";

  try {
    switch (event) {
      case "CREATED": {
        // 1. Notify Admins and Dispatchers (except creator)
        await notifyRoles({
          roles: ["ADMIN", "DISPATCHER"],
          workOrderId: woId,
          type: "WORK_ORDER_CREATED",
          title: `New Work Order: ${woTitle}`,
          message: `Created by ${actor.name || "Dispatch"} with ${workOrder.priority || "MEDIUM"} priority${
            workOrder.customer?.name ? ` for ${workOrder.customer.name}` : ""
          }.`,
          excludeUserId: actor.id,
        });

        // 2. If technician is pre-assigned, notify technician
        if (workOrder.technicianId) {
          await notifyTechnicianUser(workOrder.technicianId, {
            workOrderId: woId,
            type: "WORK_ORDER_ASSIGNED",
            title: `New Job Assigned: ${woTitle}`,
            message: `You have been assigned to work order "${woTitle}". Please review and accept.`,
          });
        }
        break;
      }

      case "ASSIGNED": {
        // 1. Notify assigned technician
        if (workOrder.technicianId) {
          await notifyTechnicianUser(workOrder.technicianId, {
            workOrderId: woId,
            type: "WORK_ORDER_ASSIGNED",
            title: `Work Order Assigned: ${woTitle}`,
            message: `You have been assigned to "${woTitle}" by ${actor.name || "Dispatch"}.`,
          });
        }

        // 2. Alert other Dispatchers and Admins
        await notifyRoles({
          roles: ["ADMIN", "DISPATCHER"],
          workOrderId: woId,
          type: "WORK_ORDER_ASSIGNED",
          title: `Assigned: ${woTitle}`,
          message: `Work order "${woTitle}" was assigned to ${techName} by ${actor.name || "Dispatch"}.`,
          excludeUserId: actor.id,
        });
        break;
      }

      case "ACCEPTED": {
        // Notify Dispatchers and Admins
        await notifyRoles({
          roles: ["ADMIN", "DISPATCHER"],
          workOrderId: woId,
          type: "WORK_ORDER_ACCEPTED",
          title: `Job Accepted: ${woTitle}`,
          message: `${techName} accepted work order "${woTitle}" and confirmed schedule.`,
          excludeUserId: actor.id,
        });
        break;
      }

      case "DECLINED": {
        // Notify Dispatchers and Admins
        await notifyRoles({
          roles: ["ADMIN", "DISPATCHER"],
          workOrderId: woId,
          type: "WORK_ORDER_ASSIGNED",
          title: `Job Declined: ${woTitle}`,
          message: `${techName} declined work order "${woTitle}". Order returned to unassigned pool.${
            notes ? ` Reason: ${notes}` : ""
          }`,
          excludeUserId: actor.id,
        });
        break;
      }

      case "IN_PROGRESS":
      case "RESUMED": {
        // Notify Dispatchers and Admins
        await notifyRoles({
          roles: ["ADMIN", "DISPATCHER"],
          workOrderId: woId,
          type: "WORK_ORDER_IN_PROGRESS",
          title: `Work Started: ${woTitle}`,
          message: `${techName} has started on-site work for "${woTitle}".`,
          excludeUserId: actor.id,
        });
        break;
      }

      case "PAUSED": {
        // Notify Dispatchers and Admins
        await notifyRoles({
          roles: ["ADMIN", "DISPATCHER"],
          workOrderId: woId,
          type: "WORK_ORDER_PAUSED",
          title: `Work Paused: ${woTitle}`,
          message: `${techName} paused work on "${woTitle}".${notes ? ` Note: ${notes}` : ""}`,
          excludeUserId: actor.id,
        });
        break;
      }

      case "COMPLETED": {
        // Notify Dispatchers and Admins
        await notifyRoles({
          roles: ["ADMIN", "DISPATCHER"],
          workOrderId: woId,
          type: "WORK_ORDER_COMPLETED",
          title: `Job Completed: ${woTitle}`,
          message: `${techName} completed work order "${woTitle}".${
            notes ? ` Resolution notes: "${notes}"` : ""
          }`,
          excludeUserId: actor.id,
        });
        break;
      }

      case "CANCELLED": {
        // 1. Notify assigned technician if any
        if (workOrder.technicianId) {
          await notifyTechnicianUser(workOrder.technicianId, {
            workOrderId: woId,
            type: "WORK_ORDER_CANCELLED",
            title: `Job Cancelled: ${woTitle}`,
            message: `Work order "${woTitle}" was cancelled by dispatch.${
              notes ? ` Reason: ${notes}` : ""
            }`,
          });
        }

        // 2. Notify other Dispatchers and Admins
        await notifyRoles({
          roles: ["ADMIN", "DISPATCHER"],
          workOrderId: woId,
          type: "WORK_ORDER_CANCELLED",
          title: `Work Order Cancelled: ${woTitle}`,
          message: `Work order "${woTitle}" was cancelled by ${actor.name || "Dispatch"}.${
            notes ? ` Reason: ${notes}` : ""
          }`,
          excludeUserId: actor.id,
        });
        break;
      }

      case "CLOSED": {
        // 1. Notify assigned technician if any
        if (workOrder.technicianId) {
          await notifyTechnicianUser(workOrder.technicianId, {
            workOrderId: woId,
            type: "WORK_ORDER_CLOSED",
            title: `Job Verified & Closed: ${woTitle}`,
            message: `Work order "${woTitle}" has been officially signed off and closed.`,
          });
        }

        // 2. Notify other Dispatchers and Admins
        await notifyRoles({
          roles: ["ADMIN", "DISPATCHER"],
          workOrderId: woId,
          type: "WORK_ORDER_CLOSED",
          title: `Work Order Closed: ${woTitle}`,
          message: `Work order "${woTitle}" was officially closed and archived by ${
            actor.name || "Dispatch"
          }.`,
          excludeUserId: actor.id,
        });
        break;
      }
    }
  } catch (err) {
    console.error("[TRIGGER_LIFECYCLE_NOTIFICATION_ERROR]", err);
  }
}
