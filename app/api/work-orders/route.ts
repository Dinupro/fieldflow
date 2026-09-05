import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-guard";

type PriorityType = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
type WorkOrderStatusType = "OPEN" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

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

    // Search filter
    if (search) {
      andConditions.push({
        OR: [
          { title: { contains: search, mode: "insensitive" as const } },
          { description: { contains: search, mode: "insensitive" as const } },
          { customer: { name: { contains: search, mode: "insensitive" as const } } },
          { customer: { company: { contains: search, mode: "insensitive" as const } } },
          { technician: { name: { contains: search, mode: "insensitive" as const } } },
        ],
      });
    }

    // Status filter
    if (
      statusFilter &&
      ["OPEN", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].includes(statusFilter)
    ) {
      andConditions.push({
        status: statusFilter as WorkOrderStatusType,
      });
    }

    // Priority filter
    if (
      priorityFilter &&
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

    const where = andConditions.length > 0 ? { AND: andConditions } : {};

    const validSortFields = ["title", "priority", "status", "scheduledAt", "createdAt"];
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
      totalInProgress,
      totalCompleted,
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
      prisma.workOrder.count({ where: { ...baseScope, status: "IN_PROGRESS" } }),
      prisma.workOrder.count({ where: { ...baseScope, status: "COMPLETED" } }),
      prisma.workOrder.count({ where: { ...baseScope, status: "CANCELLED" } }),
      prisma.workOrder.count({
        where: {
          ...baseScope,
          scheduledAt: { lt: now },
          status: { in: ["OPEN", "ASSIGNED", "IN_PROGRESS"] },
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
        totalWorkOrders: totalOpen + totalAssigned + totalInProgress + totalCompleted + totalCancelled,
        openCount: totalOpen,
        assignedCount: totalAssigned,
        inProgressCount: totalInProgress,
        completedCount: totalCompleted,
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
    const {
      title,
      description,
      customerId,
      technicianId,
      priority,
      status,
      scheduledAt,
      completionNotes,
    } = body;

    const errors: Record<string, string> = {};

    if (!title || typeof title !== "string" || title.trim().length < 3) {
      errors.title = "Work order title is required (min 3 characters).";
    }

    if (!description || typeof description !== "string" || description.trim().length < 3) {
      errors.description = "Work order description is required.";
    }

    if (!customerId || typeof customerId !== "string") {
      errors.customerId = "Customer selection is required.";
    }

    const validPriorities: PriorityType[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];
    const finalPriority: PriorityType = validPriorities.includes(priority) ? priority : "MEDIUM";

    let finalStatus: WorkOrderStatusType = ["OPEN", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].includes(status)
      ? status
      : "OPEN";

    // Validate Customer exists
    if (customerId) {
      const customerExists = await prisma.customer.findUnique({
        where: { id: customerId },
      });
      if (!customerExists) {
        errors.customerId = "Selected customer does not exist.";
      }
    }

    // Validate Technician and availability rules if technicianId provided
    const cleanTechId = technicianId && technicianId.trim() !== "" ? technicianId.trim() : null;
    if (cleanTechId) {
      const technician = await prisma.technician.findUnique({
        where: { id: cleanTechId },
      });

      if (!technician) {
        errors.technicianId = "Selected technician does not exist.";
      } else if (technician.status === "OFF") {
        errors.technicianId = `Cannot assign technician "${technician.name}": Technician is currently Offline / Off-Duty.`;
      } else {
        // If technician is assigned and status was OPEN, transition status to ASSIGNED
        if (finalStatus === "OPEN") {
          finalStatus = "ASSIGNED";
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { error: "Validation failed", errors },
        { status: 400 }
      );
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
        title: title.trim(),
        description: description.trim(),
        customerId,
        technicianId: cleanTechId,
        priority: finalPriority,
        status: finalStatus,
        scheduledAt: parsedScheduledAt,
        completionNotes: completionNotes?.trim() || null,
        completedAt: finalStatus === "COMPLETED" ? new Date() : null,
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
