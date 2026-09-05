import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-guard";

type PriorityType = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
type WorkOrderStatusType = "OPEN" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export const dynamic = "force-dynamic";

// GET /api/work-orders/[id] - Fetch single work order with customer, technician, and complete StatusLog history
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authContext = await getAuthUser(req);

  if (!authContext) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    const workOrder = await prisma.workOrder.findUnique({
      where: { id },
      include: {
        customer: true,
        technician: true,
        statusLogs: {
          orderBy: { changedAt: "desc" },
          include: {
            changedBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!workOrder) {
      return NextResponse.json({ error: "Work order not found" }, { status: 404 });
    }

    // RBAC Guard: Technician can only view their own assigned work orders
    if (authContext.isTechnician && workOrder.technicianId !== authContext.technician?.id) {
      return NextResponse.json(
        { error: "Forbidden: You are only authorized to view work orders assigned to you." },
        { status: 403 }
      );
    }

    return NextResponse.json(workOrder);
  } catch (error) {
    console.error("[WORK_ORDER_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error fetching work order." },
      { status: 500 }
    );
  }
}

// PUT /api/work-orders/[id] - Update work order (Role-aware: Technicians can start/update work and add completion notes; Dispatchers/Admins have full editing)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authContext = await getAuthUser(req);

  if (!authContext) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
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
      completedAt,
    } = body;

    const existingOrder = await prisma.workOrder.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Work order not found" }, { status: 404 });
    }

    // RBAC Authorization for Technicians
    if (authContext.isTechnician) {
      // Must be assigned to this technician
      if (existingOrder.technicianId !== authContext.technician?.id) {
        return NextResponse.json(
          { error: "Forbidden: You can only update work orders assigned to you." },
          { status: 403 }
        );
      }

      // Technicians can only transition status (IN_PROGRESS, COMPLETED) and save completionNotes
      const allowedStatuses: WorkOrderStatusType[] = ["ASSIGNED", "IN_PROGRESS", "COMPLETED"];
      let techStatus: WorkOrderStatusType = existingOrder.status;
      if (status && allowedStatuses.includes(status)) {
        techStatus = status as WorkOrderStatusType;
      }

      let techCompletedAt = existingOrder.completedAt;
      if (techStatus === "COMPLETED") {
        techCompletedAt = completedAt ? new Date(completedAt) : new Date();
      } else if (techStatus === "IN_PROGRESS" || techStatus === "ASSIGNED") {
        techCompletedAt = null;
      }

      const previousStatus = existingOrder.status;
      const isStatusChanged = previousStatus !== techStatus;

      const updated = await prisma.workOrder.update({
        where: { id },
        data: {
          status: techStatus,
          completionNotes: completionNotes !== undefined ? completionNotes?.trim() || null : existingOrder.completionNotes,
          completedAt: techCompletedAt,
        },
        include: {
          customer: true,
          technician: true,
          statusLogs: {
            orderBy: { changedAt: "desc" },
            include: {
              changedBy: {
                select: { id: true, name: true, email: true },
              },
            },
          },
        },
      });

      if (isStatusChanged) {
        await prisma.statusLog.create({
          data: {
            workOrderId: id,
            changedById: authContext.user.id,
            fromStatus: previousStatus,
            toStatus: techStatus,
          },
        });
      }

      return NextResponse.json(updated);
    }

    // DISPATCHER & ADMIN Full Update Flow
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
    const finalPriority: PriorityType = validPriorities.includes(priority)
      ? priority
      : existingOrder.priority;

    let finalStatus: WorkOrderStatusType = ["OPEN", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].includes(status)
      ? status
      : existingOrder.status;

    // Validate Customer
    if (customerId && customerId !== existingOrder.customerId) {
      const customerExists = await prisma.customer.findUnique({
        where: { id: customerId },
      });
      if (!customerExists) {
        errors.customerId = "Selected customer does not exist.";
      }
    }

    // Validate Technician availability if assigning or changing
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

    // Handle scheduled date
    let parsedScheduledAt: Date | null = existingOrder.scheduledAt;
    if (scheduledAt !== undefined) {
      if (!scheduledAt) {
        parsedScheduledAt = null;
      } else {
        const d = new Date(scheduledAt);
        if (!isNaN(d.getTime())) {
          parsedScheduledAt = d;
        }
      }
    }

    // Handle completed timestamp
    let finalCompletedAt: Date | null = existingOrder.completedAt;
    if (finalStatus === "COMPLETED") {
      if (completedAt) {
        const d = new Date(completedAt);
        finalCompletedAt = !isNaN(d.getTime()) ? d : new Date();
      } else if (!finalCompletedAt) {
        finalCompletedAt = new Date();
      }
    } else {
      finalCompletedAt = null;
    }

    const previousStatus = existingOrder.status;
    const isStatusChanged = previousStatus !== finalStatus;

    // Update WorkOrder
    const updated = await prisma.workOrder.update({
      where: { id },
      data: {
        title: title.trim(),
        description: description.trim(),
        customerId,
        technicianId: cleanTechId,
        priority: finalPriority,
        status: finalStatus,
        scheduledAt: parsedScheduledAt,
        completionNotes: completionNotes !== undefined ? completionNotes?.trim() || null : existingOrder.completionNotes,
        completedAt: finalCompletedAt,
      },
      include: {
        customer: true,
        technician: true,
        statusLogs: {
          orderBy: { changedAt: "desc" },
          include: {
            changedBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Record status transition in StatusLog if status changed
    if (isStatusChanged) {
      await prisma.statusLog.create({
        data: {
          workOrderId: id,
          changedById: authContext.user.id,
          fromStatus: previousStatus,
          toStatus: finalStatus,
        },
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[WORK_ORDER_PUT_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error updating work order." },
      { status: 500 }
    );
  }
}

// DELETE /api/work-orders/[id] - Safe deletion of work order (Dispatcher & Admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authContext = await getAuthUser(req);

  if (!authContext) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // RBAC Guard: Technicians cannot delete work orders
  if (authContext.isTechnician) {
    return NextResponse.json(
      { error: "Forbidden: Field Technicians cannot delete work orders." },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;

    const workOrder = await prisma.workOrder.findUnique({
      where: { id },
    });

    if (!workOrder) {
      return NextResponse.json({ error: "Work order not found" }, { status: 404 });
    }

    // Delete WorkOrder
    await prisma.workOrder.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: `Work order "${workOrder.title}" removed successfully.`,
    });
  } catch (error) {
    console.error("[WORK_ORDER_DELETE_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error deleting work order." },
      { status: 500 }
    );
  }
}
