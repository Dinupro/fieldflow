import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-guard";
import { triggerLifecycleNotification } from "@/lib/notifications";
import { logActivity } from "@/lib/audit-logger";
import { WorkOrderCreateSchema, validateSchema } from "@/lib/validations";

type PriorityType = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
type WorkOrderStatusType =
  | "OPEN"
  | "ASSIGNED"
  | "ACCEPTED"
  | "IN_PROGRESS"
  | "PAUSED"
  | "COMPLETED"
  | "CLOSED"
  | "CANCELLED";

export const dynamic = "force-dynamic";

// GET /api/work-orders - List, search, filter, paginate work orders with RBAC scoping
export async function GET(req: NextRequest) {
  const authContext = await getAuthUser(req);

  if (!authContext) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const statusFilter = searchParams.get("status")?.trim().toUpperCase() || "";
    const priorityFilter = searchParams.get("priority")?.trim().toUpperCase() || "";
    const technicianFilter = searchParams.get("technicianId")?.trim() || "";
    const customerFilter = searchParams.get("customerId")?.trim() || "";
    const startDate = searchParams.get("startDate")?.trim() || "";
    const endDate = searchParams.get("endDate")?.trim() || "";
    const dateField = searchParams.get("dateField") === "createdAt" ? "createdAt" : "scheduledAt";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    const andConditions: Record<string, unknown>[] = [];

    // RBAC Scoping: If user is TECHNICIAN, strictly enforce filter to their own assigned jobs only
    if (authContext.isTechnician) {
      if (authContext.technician?.id) {
        andConditions.push({ technicianId: authContext.technician.id });
      } else {
        // If technician profile not linked yet, return empty list
        andConditions.push({ technicianId: "00000000-0000-0000-0000-000000000000" });
      }
    } else if (technicianFilter) {
      // Dispatcher or Admin filtering by technician
      if (technicianFilter === "unassigned") {
        andConditions.push({ technicianId: null });
      } else if (technicianFilter !== "all") {
        andConditions.push({ technicianId: technicianFilter });
      }
    }

    // Comprehensive multi-field Search filter
    if (search) {
      const orConditions: Record<string, unknown>[] = [
        { title: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
        { customer: { name: { contains: search, mode: "insensitive" as const } } },
        { customer: { company: { contains: search, mode: "insensitive" as const } } },
        { customer: { email: { contains: search, mode: "insensitive" as const } } },
        { customer: { phone: { contains: search, mode: "insensitive" as const } } },
        { customer: { city: { contains: search, mode: "insensitive" as const } } },
        { technician: { name: { contains: search, mode: "insensitive" as const } } },
        { technician: { email: { contains: search, mode: "insensitive" as const } } },
        { technician: { phone: { contains: search, mode: "insensitive" as const } } },
        { technician: { specialization: { contains: search, mode: "insensitive" as const } } },
      ];

      // Check if search matches UUID pattern for direct ID search
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(search)) {
        orConditions.push({ id: { equals: search } });
      }

      andConditions.push({ OR: orConditions });
    }

    // Status filter
    const validStatuses: WorkOrderStatusType[] = [
      "OPEN",
      "ASSIGNED",
      "ACCEPTED",
      "IN_PROGRESS",
      "PAUSED",
      "COMPLETED",
      "CLOSED",
      "CANCELLED",
    ];

    if (statusFilter && statusFilter !== "ALL" && validStatuses.includes(statusFilter as WorkOrderStatusType)) {
      andConditions.push({
        status: statusFilter as WorkOrderStatusType,
      });
    }

    // Priority filter
    if (
      priorityFilter &&
      priorityFilter !== "ALL" &&
      ["LOW", "MEDIUM", "HIGH", "URGENT"].includes(priorityFilter)
    ) {
      andConditions.push({
        priority: priorityFilter as PriorityType,
      });
    }

    // Customer filter
    if (customerFilter && customerFilter !== "all") {
      andConditions.push({ customerId: customerFilter });
    }

    // Date Range Filters (startDate / endDate)
    if (startDate || endDate) {
      const dateFilterObj: Record<string, Date> = {};
      if (startDate) {
        const start = new Date(startDate);
        if (!isNaN(start.getTime())) {
          start.setHours(0, 0, 0, 0);
          dateFilterObj.gte = start;
        }
      }
      if (endDate) {
        const end = new Date(endDate);
        if (!isNaN(end.getTime())) {
          end.setHours(23, 59, 59, 999);
          dateFilterObj.lte = end;
        }
      }
      if (Object.keys(dateFilterObj).length > 0) {
        andConditions.push({ [dateField]: dateFilterObj });
      }
    }

    const where = andConditions.length > 0 ? { AND: andConditions } : {};

    const validSortFields = ["title", "priority", "status", "scheduledAt", "createdAt", "completedAt", "updatedAt"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "createdAt";

    const now = new Date();

    // Base scope for status metric counts (scoped if technician)
    const baseScope = authContext.isTechnician
      ? { technicianId: authContext.technician?.id || "00000000-0000-0000-0000-000000000000" }
      : {};

    const [
      total,
      workOrders,
      totalOpen,
      totalAssigned,
      totalAccepted,
      totalInProgress,
      totalPaused,
      totalCompleted,
      totalClosed,
      totalCancelled,
      totalOverdue,
    ] = await Promise.all([
      prisma.workOrder.count({ where }),
      prisma.workOrder.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortField]: sortOrder },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              company: true,
              email: true,
              phone: true,
              address: true,
              city: true,
            },
          },
          technician: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              specialization: true,
              skills: true,
              status: true,
              serviceArea: true,
            },
          },
        },
      }),
      prisma.workOrder.count({ where: { ...baseScope, status: "OPEN" } }),
      prisma.workOrder.count({ where: { ...baseScope, status: "ASSIGNED" } }),
      prisma.workOrder.count({ where: { ...baseScope, status: "ACCEPTED" } }),
      prisma.workOrder.count({ where: { ...baseScope, status: "IN_PROGRESS" } }),
      prisma.workOrder.count({ where: { ...baseScope, status: "PAUSED" } }),
      prisma.workOrder.count({ where: { ...baseScope, status: "COMPLETED" } }),
      prisma.workOrder.count({ where: { ...baseScope, status: "CLOSED" } }),
      prisma.workOrder.count({ where: { ...baseScope, status: "CANCELLED" } }),
      prisma.workOrder.count({
        where: {
          ...baseScope,
          scheduledAt: { lt: now },
          status: { in: ["OPEN", "ASSIGNED", "ACCEPTED", "IN_PROGRESS", "PAUSED"] },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return NextResponse.json({
      workOrders,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
      stats: {
        totalWorkOrders:
          totalOpen +
          totalAssigned +
          totalAccepted +
          totalInProgress +
          totalPaused +
          totalCompleted +
          totalClosed +
          totalCancelled,
        openCount: totalOpen,
        assignedCount: totalAssigned,
        acceptedCount: totalAccepted,
        inProgressCount: totalInProgress,
        pausedCount: totalPaused,
        completedCount: totalCompleted,
        closedCount: totalClosed,
        cancelledCount: totalCancelled,
        overdueCount: totalOverdue,
      },
    });
  } catch (error) {
    console.error("[WORK_ORDERS_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error fetching work orders." },
      { status: 500 }
    );
  }
}

// POST /api/work-orders - Create a new work order (Dispatcher & Admin only)
export async function POST(req: NextRequest) {
  const authContext = await getAuthUser(req);

  if (!authContext) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // RBAC Guard: Technicians cannot create work orders
  if (authContext.isTechnician) {
    return NextResponse.json(
      { error: "Forbidden: Field Technicians cannot create work orders. Please request dispatch from a Dispatcher or Administrator." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();

    // 1. Zod Schema Validation
    const validation = validateSchema(WorkOrderCreateSchema, body);
    if (!validation.success) {
      return NextResponse.json(validation.response, { status: 400 });
    }

    const {
      title,
      description,
      customerId,
      technicianId,
      priority,
      status,
      scheduledAt,
      completionNotes,
    } = validation.data;

    const errors: Record<string, string> = {};

    // 2. Validate Customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });
    if (!customer) {
      return NextResponse.json(
        { error: "Selected customer does not exist.", errors: { customerId: "Customer not found." } },
        { status: 404 }
      );
    }

    // 3. Duplicate Order Detection: Prevent duplicate open job with same title for customer
    const existingDuplicate = await prisma.workOrder.findFirst({
      where: {
        customerId,
        title: { equals: title, mode: "insensitive" },
        status: { in: ["OPEN", "ASSIGNED", "ACCEPTED", "IN_PROGRESS", "PAUSED"] },
      },
    });

    if (existingDuplicate) {
      return NextResponse.json(
        {
          error: `An active work order with the title "${title}" already exists for customer "${customer.name}".`,
          errors: { title: "A duplicate active work order is currently open for this customer." },
        },
        { status: 409 }
      );
    }

    const cleanTechId = technicianId || null;
    let finalStatus: WorkOrderStatusType = cleanTechId ? "ASSIGNED" : (status as WorkOrderStatusType) || "OPEN";
    const finalPriority: PriorityType = priority as PriorityType;

    // 4. Validate Technician & Availability
    if (cleanTechId) {
      const technician = await prisma.technician.findUnique({
        where: { id: cleanTechId },
      });

      if (!technician) {
        return NextResponse.json(
          { error: "Selected technician does not exist.", errors: { technicianId: "Technician not found." } },
          { status: 404 }
        );
      } else if (technician.status === "OFF") {
        return NextResponse.json(
          {
            error: `Cannot assign technician "${technician.name}": Technician is currently Offline / Off-Duty.`,
            errors: { technicianId: "Technician is currently Offline/Off-Duty." },
          },
          { status: 400 }
        );
      } else {
        finalStatus = "ASSIGNED";
      }
    }

    // Parse scheduled date
    let parsedScheduledAt: Date | null = null;
    if (scheduledAt) {
      const d = new Date(scheduledAt);
      if (!isNaN(d.getTime())) {
        parsedScheduledAt = d;
      }
    }

    // Create WorkOrder and StatusLog
    const created = await prisma.workOrder.create({
      data: {
        title,
        description,
        customerId,
        technicianId: cleanTechId,
        priority: finalPriority,
        status: finalStatus,
        scheduledAt: parsedScheduledAt,
        completionNotes: completionNotes || null,
        completedAt: null,
      },
      include: {
        customer: true,
        technician: true,
      },
    });

    // Record initial status in StatusLog
    await prisma.statusLog.create({
      data: {
        workOrderId: created.id,
        changedById: authContext.user.id,
        fromStatus: "OPEN",
        toStatus: finalStatus,
        notes: cleanTechId
          ? "Work order created and assigned to technician."
          : "Work order created and added to open dispatch queue.",
      },
    });

    // Dispatch in-app notifications
    await triggerLifecycleNotification("CREATED", {
      workOrder: created,
      actor: {
        id: authContext.user.id,
        name: authContext.user.name,
        role: authContext.role,
      },
      technicianName: created.technician?.name || null,
    });

    // Record immutable audit log
    await logActivity({
      req,
      action: "WORK_ORDER_CREATE",
      entityType: "WORK_ORDER",
      entityId: created.id,
      entityName: created.title,
      description: `Work order "${created.title}" created with status ${created.status} and priority ${created.priority}.`,
      authContext,
      metadata: {
        customer: created.customer?.name,
        customerId: created.customerId,
        technician: created.technician?.name || "Unassigned",
        technicianId: created.technicianId,
        priority: created.priority,
        status: created.status,
        scheduledAt: created.scheduledAt,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("[WORK_ORDERS_POST_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error creating work order." },
      { status: 500 }
    );
  }
}
