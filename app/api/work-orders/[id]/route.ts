import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-guard";
import { triggerLifecycleNotification, LifecycleEvent } from "@/lib/notifications";

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

// Helper to automatically sync technician availability (BUSY if active in-progress jobs, else AVAILABLE unless OFF)
async function syncTechAvailability(techId: string | null) {
  if (!techId) return;
  try {
    const tech = await prisma.technician.findUnique({
      where: { id: techId },
      select: { status: true },
    });

    if (!tech || tech.status === "OFF") return;

    const inProgressCount = await prisma.workOrder.count({
      where: {
        technicianId: techId,
        status: "IN_PROGRESS",
      },
    });

    const targetStatus = inProgressCount > 0 ? "BUSY" : "AVAILABLE";
    if (tech.status !== targetStatus) {
      await prisma.technician.update({
        where: { id: techId },
        data: { status: targetStatus },
      });
    }
  } catch (err) {
    console.error("[SYNC_TECH_AVAILABILITY_ERROR]", err);
  }
}

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
                role: true,
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

// PUT /api/work-orders/[id] - Enforce strict Work Order Lifecycle state machine & RBAC transitions
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
      status: targetStatus,
      scheduledAt,
      completionNotes,
      notes: actionNotes,
      completedAt,
    } = body;

    const existingOrder = await prisma.workOrder.findUnique({
      where: { id },
      include: { technician: true },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Work order not found" }, { status: 404 });
    }

    const currentStatus = existingOrder.status as WorkOrderStatusType;
    const isTerminal = currentStatus === "CLOSED" || currentStatus === "CANCELLED";

    // 1. Terminal State Guard: Closed or Cancelled work orders cannot be modified
    if (isTerminal) {
      return NextResponse.json(
        { error: `Work order is finalized (${currentStatus}) and cannot be modified.` },
        { status: 400 }
      );
    }

    // 2. Technician Role Authorization & Lifecycle Actions
    if (authContext.isTechnician) {
      if (existingOrder.technicianId !== authContext.technician?.id) {
        return NextResponse.json(
          { error: "Forbidden: You can only take actions on work orders assigned to you." },
          { status: 403 }
        );
      }

      if (!targetStatus) {
        return NextResponse.json(
          { error: "A target lifecycle status is required for technician actions." },
          { status: 400 }
        );
      }

      const reqStatus = targetStatus as WorkOrderStatusType;
      let newStatus: WorkOrderStatusType = currentStatus;
      let newTechId: string | null = existingOrder.technicianId;
      let logNote = actionNotes?.trim() || "";
      let newCompletedAt: Date | null = existingOrder.completedAt;
      let finalCompletionNotes = existingOrder.completionNotes;

      // Strict Technician State Machine Rules
      if (currentStatus === "ASSIGNED") {
        if (reqStatus === "ACCEPTED") {
          newStatus = "ACCEPTED";
          logNote = logNote || "Work order accepted by technician.";
        } else if (reqStatus === "OPEN") {
          // Reject / Decline work order
          newStatus = "OPEN";
          newTechId = null; // Unlink technician so Dispatcher can reassign
          logNote = logNote ? `Work order declined by technician: ${logNote}` : "Work order declined by technician and returned to dispatch queue.";
        } else {
          return NextResponse.json(
            { error: `Invalid transition: Assigned jobs must be Accepted or Declined before starting work. Cannot jump to "${reqStatus}".` },
            { status: 400 }
          );
        }
      } else if (currentStatus === "ACCEPTED") {
        if (reqStatus === "IN_PROGRESS") {
          newStatus = "IN_PROGRESS";
          logNote = logNote || "Work started on site.";
        } else {
          return NextResponse.json(
            { error: `Invalid transition: Accepted jobs must be transitioned to "IN_PROGRESS" to start work. Cannot jump to "${reqStatus}".` },
            { status: 400 }
          );
        }
      } else if (currentStatus === "IN_PROGRESS") {
        if (reqStatus === "PAUSED") {
          newStatus = "PAUSED";
          logNote = logNote ? `Work paused by technician: ${logNote}` : "Work paused by technician.";
        } else if (reqStatus === "COMPLETED") {
          const notesText = (completionNotes || actionNotes || "").trim();
          if (notesText.length < 5) {
            return NextResponse.json(
              { error: "Mandatory completion notes are required (minimum 5 characters) to complete a work order." },
              { status: 400 }
            );
          }
          newStatus = "COMPLETED";
          newCompletedAt = completedAt ? new Date(completedAt) : new Date();
          finalCompletionNotes = notesText;
          logNote = `Work completed with resolution notes: ${notesText}`;
        } else {
          return NextResponse.json(
            { error: `Invalid transition: In-progress work can only be Paused or Completed. Cannot transition to "${reqStatus}".` },
            { status: 400 }
          );
        }
      } else if (currentStatus === "PAUSED") {
        if (reqStatus === "IN_PROGRESS") {
          newStatus = "IN_PROGRESS";
          logNote = logNote || "Work resumed on site.";
        } else if (reqStatus === "COMPLETED") {
          const notesText = (completionNotes || actionNotes || "").trim();
          if (notesText.length < 5) {
            return NextResponse.json(
              { error: "Mandatory completion notes are required (minimum 5 characters) to complete a work order." },
              { status: 400 }
            );
          }
          newStatus = "COMPLETED";
          newCompletedAt = completedAt ? new Date(completedAt) : new Date();
          finalCompletionNotes = notesText;
          logNote = `Work completed with resolution notes: ${notesText}`;
        } else {
          return NextResponse.json(
            { error: `Invalid transition: Paused jobs can only be Resumed or Completed. Cannot transition to "${reqStatus}".` },
            { status: 400 }
          );
        }
      } else {
        return NextResponse.json(
          { error: `Invalid action: You cannot modify a work order in "${currentStatus}" status.` },
          { status: 400 }
        );
      }

      // Execute update & status log in transaction
      const updated = await prisma.workOrder.update({
        where: { id },
        data: {
          status: newStatus,
          technicianId: newTechId,
          completionNotes: finalCompletionNotes,
          completedAt: newCompletedAt,
        },
        include: {
          customer: true,
          technician: true,
          statusLogs: {
            orderBy: { changedAt: "desc" },
            include: {
              changedBy: {
                select: { id: true, name: true, email: true, role: true },
              },
            },
          },
        },
      });

      // Record immutable StatusLog
      await prisma.statusLog.create({
        data: {
          workOrderId: id,
          changedById: authContext.user.id,
          fromStatus: currentStatus,
          toStatus: newStatus,
          notes: logNote,
        },
      });

      // Sync technician availability
      if (existingOrder.technicianId) {
        await syncTechAvailability(existingOrder.technicianId);
      }

      // Dispatch in-app lifecycle notification
      let techEvent: LifecycleEvent = "IN_PROGRESS";
      if (newStatus === "ACCEPTED") techEvent = "ACCEPTED";
      else if (newStatus === "OPEN") techEvent = "DECLINED";
      else if (newStatus === "PAUSED") techEvent = "PAUSED";
      else if (newStatus === "COMPLETED") techEvent = "COMPLETED";
      else if (newStatus === "IN_PROGRESS") techEvent = currentStatus === "PAUSED" ? "RESUMED" : "IN_PROGRESS";

      await triggerLifecycleNotification(techEvent, {
        workOrder: updated,
        actor: {
          id: authContext.user.id,
          name: authContext.user.name,
          role: authContext.role,
        },
        notes: logNote,
        technicianName: existingOrder.technician?.name || authContext.user.name,
      });

      return NextResponse.json(updated);
    }

    // 3. Dispatcher & Administrator Workflow & Validation
    const errors: Record<string, string> = {};

    if (title !== undefined && (typeof title !== "string" || title.trim().length < 3)) {
      errors.title = "Work order title is required (min 3 characters).";
    }

    if (description !== undefined && (typeof description !== "string" || description.trim().length < 3)) {
      errors.description = "Work order description is required.";
    }

    if (customerId !== undefined && !customerId) {
      errors.customerId = "Customer selection is required.";
    }

    const validPriorities: PriorityType[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];
    const finalPriority: PriorityType = validPriorities.includes(priority)
      ? priority
      : existingOrder.priority;

    let finalStatus: WorkOrderStatusType = currentStatus;
    let cleanTechId: string | null = existingOrder.technicianId;
    let logNote = actionNotes?.trim() || "";
    let finalCompletedAt: Date | null = existingOrder.completedAt;
    let finalCompletionNotes = existingOrder.completionNotes;

    // Handle technician assignment / reassignment
    if (technicianId !== undefined) {
      cleanTechId = technicianId && technicianId.trim() !== "" ? technicianId.trim() : null;

      if (cleanTechId && cleanTechId !== existingOrder.technicianId) {
        const technician = await prisma.technician.findUnique({
          where: { id: cleanTechId },
        });

        if (!technician) {
          errors.technicianId = "Selected technician does not exist.";
        } else if (technician.status === "OFF") {
          errors.technicianId = `Cannot assign technician "${technician.name}": Technician is currently Offline / Off-Duty.`;
        } else {
          // Reassigned or newly assigned technician
          if (currentStatus === "OPEN") {
            finalStatus = "ASSIGNED";
            logNote = logNote || `Assigned to ${technician.name}.`;
          } else if (currentStatus === "ASSIGNED" || currentStatus === "ACCEPTED" || currentStatus === "PAUSED") {
            finalStatus = "ASSIGNED"; // Reset to ASSIGNED so new tech can Accept
            logNote = logNote || `Reassigned to ${technician.name}.`;
          }
        }
      } else if (!cleanTechId && existingOrder.technicianId) {
        // Unassigning technician
        if (currentStatus === "ASSIGNED" || currentStatus === "ACCEPTED" || currentStatus === "PAUSED") {
          finalStatus = "OPEN";
          logNote = logNote || "Technician unassigned; returned to open dispatch queue.";
        }
      }
    }

    // Handle status transition requests from Dispatcher / Admin
    if (targetStatus && targetStatus !== currentStatus) {
      const reqStatus = targetStatus as WorkOrderStatusType;

      if (reqStatus === "CLOSED") {
        if (currentStatus !== "COMPLETED") {
          return NextResponse.json(
            { error: `Cannot close work order: Only COMPLETED work orders can be closed. Current status is "${currentStatus}".` },
            { status: 400 }
          );
        }
        finalStatus = "CLOSED";
        logNote = logNote || "Work order reviewed and officially closed by dispatcher.";
      } else if (reqStatus === "CANCELLED") {
        if (currentStatus === "COMPLETED") {
          return NextResponse.json(
            { error: "Cannot cancel a work order that is already COMPLETED." },
            { status: 400 }
          );
        }
        finalStatus = "CANCELLED";
        logNote = logNote ? `Work order cancelled: ${logNote}` : "Work order cancelled by dispatch.";
      } else if (reqStatus === "ASSIGNED") {
        if (!cleanTechId) {
          return NextResponse.json(
            { error: "Cannot set status to ASSIGNED without an assigned technician." },
            { status: 400 }
          );
        }
        finalStatus = "ASSIGNED";
      } else if (reqStatus === "OPEN") {
        cleanTechId = null;
        finalStatus = "OPEN";
      } else if (reqStatus === "IN_PROGRESS" || reqStatus === "ACCEPTED" || reqStatus === "PAUSED" || reqStatus === "COMPLETED") {
        // Dispatcher trying to manually trigger field execution states
        if (reqStatus === "IN_PROGRESS" && currentStatus !== "ACCEPTED" && currentStatus !== "PAUSED") {
          return NextResponse.json(
            { error: `Invalid transition: A work order cannot be marked In Progress before it is Assigned and Accepted. Current status is "${currentStatus}".` },
            { status: 400 }
          );
        }
        if (reqStatus === "COMPLETED") {
          const notesText = (completionNotes || actionNotes || "").trim();
          if (notesText.length < 5) {
            return NextResponse.json(
              { error: "Mandatory completion notes are required (minimum 5 characters) to complete a work order." },
              { status: 400 }
            );
          }
          finalStatus = "COMPLETED";
          finalCompletedAt = completedAt ? new Date(completedAt) : new Date();
          finalCompletionNotes = notesText;
          logNote = `Work completed with notes: ${notesText}`;
        } else {
          finalStatus = reqStatus;
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

    const previousStatus = existingOrder.status;
    const isStatusChanged = previousStatus !== finalStatus;

    if (isStatusChanged && !logNote) {
      logNote = `Status changed from ${previousStatus} to ${finalStatus}.`;
    }

    // Update WorkOrder
    const updated = await prisma.workOrder.update({
      where: { id },
      data: {
        title: title !== undefined ? title.trim() : existingOrder.title,
        description: description !== undefined ? description.trim() : existingOrder.description,
        customerId: customerId || existingOrder.customerId,
        technicianId: cleanTechId,
        priority: finalPriority,
        status: finalStatus,
        scheduledAt: parsedScheduledAt,
        completionNotes: completionNotes !== undefined ? completionNotes?.trim() || null : finalCompletionNotes,
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
                role: true,
              },
            },
          },
        },
      },
    });

    // Record StatusLog if status changed
    if (isStatusChanged) {
      await prisma.statusLog.create({
        data: {
          workOrderId: id,
          changedById: authContext.user.id,
          fromStatus: previousStatus,
          toStatus: finalStatus,
          notes: logNote,
        },
      });
    }

    // Sync technician availability if technician changed or status changed
    if (cleanTechId) {
      await syncTechAvailability(cleanTechId);
    }
    if (existingOrder.technicianId && existingOrder.technicianId !== cleanTechId) {
      await syncTechAvailability(existingOrder.technicianId);
    }

    // Dispatch in-app lifecycle notification
    if (isStatusChanged || (cleanTechId && cleanTechId !== existingOrder.technicianId)) {
      let dispatchEvent: LifecycleEvent = "ASSIGNED";
      if (finalStatus === "CLOSED") dispatchEvent = "CLOSED";
      else if (finalStatus === "CANCELLED") dispatchEvent = "CANCELLED";
      else if (finalStatus === "COMPLETED") dispatchEvent = "COMPLETED";
      else if (cleanTechId && cleanTechId !== existingOrder.technicianId) dispatchEvent = "ASSIGNED";
      else if (finalStatus === "IN_PROGRESS") dispatchEvent = "IN_PROGRESS";
      else if (finalStatus === "PAUSED") dispatchEvent = "PAUSED";
      else if (finalStatus === "ACCEPTED") dispatchEvent = "ACCEPTED";

      await triggerLifecycleNotification(dispatchEvent, {
        workOrder: updated,
        actor: {
          id: authContext.user.id,
          name: authContext.user.name,
          role: authContext.role,
        },
        notes: logNote,
        technicianName: updated.technician?.name || null,
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
      select: { id: true, title: true, technicianId: true },
    });

    if (!workOrder) {
      return NextResponse.json({ error: "Work order not found" }, { status: 404 });
    }

    const techId = workOrder.technicianId;

    // Delete WorkOrder (cascades statusLogs)
    await prisma.workOrder.delete({
      where: { id },
    });

    // Sync technician availability if tech was assigned
    if (techId) {
      await syncTechAvailability(techId);
    }

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

