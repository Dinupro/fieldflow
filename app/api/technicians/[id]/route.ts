import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-guard";
import { logActivity } from "@/lib/audit-logger";
import { TechnicianUpdateSchema, validateSchema } from "@/lib/validations";

type TechnicianStatus = "AVAILABLE" | "BUSY" | "OFF";

export const dynamic = "force-dynamic";

// GET /api/technicians/[id] - Fetch single technician profile with live assignments & performance metrics
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

    const technician = await prisma.technician.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            image: true,
          },
        },
        workOrders: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                company: true,
                phone: true,
                address: true,
                city: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            workOrders: true,
          },
        },
      },
    });

    if (!technician) {
      return NextResponse.json({ error: "Technician not found" }, { status: 404 });
    }

    // Separate active in-flight assignments and completed jobs
    const activeWorkOrders = technician.workOrders.filter((wo: { status: string }) =>
      ["OPEN", "ASSIGNED", "ACCEPTED", "IN_PROGRESS", "PAUSED"].includes(wo.status)
    );
    const completedWorkOrders = technician.workOrders.filter((wo: { status: string }) =>
      ["COMPLETED", "CLOSED"].includes(wo.status)
    );

    const totalOrdersCount = technician.workOrders.length;
    const activeOrdersCount = activeWorkOrders.length;
    const completedOrdersCount = completedWorkOrders.length;
    const maxActiveJobs = technician.maxActiveJobs || 3;
    const workloadPercentage = Math.min(100, Math.round((activeOrdersCount / maxActiveJobs) * 100));
    const isAtCapacity = activeOrdersCount >= maxActiveJobs;

    // SLA & Turnaround calculations
    let onTimeCount = 0;
    let completedWithDates = 0;
    let totalTurnaroundHours = 0;

    completedWorkOrders.forEach((wo: { completedAt: Date | null; scheduledAt: Date | null; createdAt: Date }) => {
      if (wo.completedAt) {
        if (wo.scheduledAt) {
          completedWithDates++;
          if (new Date(wo.completedAt) <= new Date(wo.scheduledAt)) {
            onTimeCount++;
          }
        }
        const durationHours = (new Date(wo.completedAt).getTime() - new Date(wo.createdAt).getTime()) / (1000 * 60 * 60);
        if (durationHours > 0) {
          totalTurnaroundHours += durationHours;
        }
      }
    });

    const slaOnTimeRate = completedWithDates > 0 ? Math.round((onTimeCount / completedWithDates) * 100) : 100;
    const averageTurnaroundHours =
      completedOrdersCount > 0 ? parseFloat((totalTurnaroundHours / completedOrdersCount).toFixed(1)) : 0;

    return NextResponse.json({
      ...technician,
      skills: technician.skills || [],
      certifications: technician.certifications || [],
      rating: technician.rating ?? 4.9,
      experienceYears: technician.experienceYears ?? 3,
      maxActiveJobs,
      activeOrdersCount,
      completedOrdersCount,
      totalOrdersCount,
      workloadPercentage,
      isAtCapacity,
      slaOnTimeRate,
      averageTurnaroundHours,
      activeWorkOrders,
      completedWorkOrders,
    });
  } catch (error) {
    console.error("[TECHNICIAN_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error fetching technician profile." },
      { status: 500 }
    );
  }
}

// PUT /api/technicians/[id] - Update technician details, certifications, rating & availability
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

    const existingTech = await prisma.technician.findUnique({
      where: { id },
    });

    if (!existingTech) {
      return NextResponse.json({ error: "Technician not found" }, { status: 404 });
    }

    // RBAC Guard: Technician can only update their own profile
    if (authContext.isTechnician && authContext.technician?.id !== id) {
      return NextResponse.json(
        { error: "Forbidden: You are only authorized to update your own technician status and profile." },
        { status: 403 }
      );
    }

    // 1. Zod Schema Validation
    const validation = validateSchema(TechnicianUpdateSchema, body);
    if (!validation.success) {
      return NextResponse.json(validation.response, { status: 400 });
    }

    const {
      name,
      email,
      phone,
      specialization,
      skills,
      certifications,
      rating,
      experienceYears,
      maxActiveJobs,
      status,
      serviceArea,
      notes,
      avatar,
    } = validation.data;

    // 2. Check email uniqueness against other technicians
    if (email && email.toLowerCase() !== (existingTech.email || "").toLowerCase()) {
      const existing = await prisma.technician.findFirst({
        where: {
          email: { equals: email, mode: "insensitive" },
          id: { not: id },
        },
      });
      if (existing) {
        return NextResponse.json(
          {
            error: "Email conflict",
            errors: { email: `Another technician (${existing.name}) is already registered with this email address.` },
          },
          { status: 409 }
        );
      }
    }

    // 3. Check phone uniqueness against other technicians
    if (phone && phone !== existingTech.phone) {
      const existingPhone = await prisma.technician.findFirst({
        where: {
          phone: { equals: phone, mode: "insensitive" },
          id: { not: id },
        },
      });
      if (existingPhone) {
        return NextResponse.json(
          {
            error: "Phone conflict",
            errors: { phone: `Another technician (${existingPhone.name}) is already registered with this phone number.` },
          },
          { status: 409 }
        );
      }
    }

    const updated = await prisma.technician.update({
      where: { id },
      data: {
        name: name !== undefined ? name : existingTech.name,
        email: email !== undefined ? (email || null) : existingTech.email,
        phone: phone !== undefined ? (phone || null) : existingTech.phone,
        specialization: specialization !== undefined ? (specialization || null) : existingTech.specialization,
        skills: skills !== undefined ? skills : existingTech.skills,
        certifications: certifications !== undefined ? certifications : existingTech.certifications,
        rating: rating !== undefined ? Math.min(5, Math.max(1, rating)) : existingTech.rating,
        experienceYears: experienceYears !== undefined ? Math.max(0, experienceYears) : existingTech.experienceYears,
        maxActiveJobs: maxActiveJobs !== undefined ? Math.max(1, maxActiveJobs) : existingTech.maxActiveJobs,
        status: (status as TechnicianStatus) || existingTech.status,
        serviceArea: serviceArea !== undefined ? (serviceArea || null) : existingTech.serviceArea,
        notes: notes !== undefined ? (notes || null) : existingTech.notes,
        avatar: avatar !== undefined ? (avatar || null) : existingTech.avatar,
      },
    });

    const isStatusChanged = existingTech.status !== updated.status;
    await logActivity({
      req,
      action: isStatusChanged ? "TECHNICIAN_STATUS_CHANGE" : "TECHNICIAN_UPDATE",
      entityType: "TECHNICIAN",
      entityId: updated.id,
      entityName: updated.name,
      description: isStatusChanged
        ? `Technician ${updated.name} availability changed from ${existingTech.status} to ${updated.status}.`
        : `Technician profile updated for ${updated.name}.`,
      authContext,
      metadata: {
        previousStatus: existingTech.status,
        newStatus: updated.status,
        skillsCount: updated.skills.length,
        certificationsCount: updated.certifications.length,
        experienceYears: updated.experienceYears,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[TECHNICIAN_PUT_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error updating technician." },
      { status: 500 }
    );
  }
}

// DELETE /api/technicians/[id] - Safe deletion guard (Dispatcher & Admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authContext = await getAuthUser(req);

  if (!authContext) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // RBAC Guard: Technicians cannot delete technician records
  if (authContext.isTechnician) {
    return NextResponse.json(
      { error: "Forbidden: Field Technicians cannot delete technician profiles." },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;

    // Fetch technician with all assigned work orders
    const technician = await prisma.technician.findUnique({
      where: { id },
      include: {
        workOrders: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });

    if (!technician) {
      return NextResponse.json({ error: "Technician not found" }, { status: 404 });
    }

    // Check for active work orders (OPEN, ASSIGNED, ACCEPTED, IN_PROGRESS, PAUSED)
    const activeOrders = technician.workOrders.filter(
      (wo: { id: string; title: string; status: string }) =>
        ["OPEN", "ASSIGNED", "ACCEPTED", "IN_PROGRESS", "PAUSED"].includes(wo.status)
    );

    if (activeOrders.length > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete technician "${technician.name}": Technician has ${activeOrders.length} active in-flight work order(s). Please reassign or complete these jobs before deleting.`,
          activeOrdersCount: activeOrders.length,
          activeOrders: activeOrders.map((o: { id: string; title: string; status: string }) => ({
            id: o.id,
            title: o.title,
            status: o.status,
          })),
        },
        { status: 400 }
      );
    }

    // Safely delete technician
    await prisma.technician.delete({
      where: { id },
    });

    await logActivity({
      req,
      action: "TECHNICIAN_DELETE",
      entityType: "TECHNICIAN",
      entityId: id,
      entityName: technician.name,
      description: `Technician ${technician.name} deleted from the system.`,
      authContext,
      metadata: {
        specialization: technician.specialization,
        email: technician.email,
        phone: technician.phone,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Technician "${technician.name}" removed successfully.`,
    });
  } catch (error) {
    console.error("[TECHNICIAN_DELETE_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error deleting technician." },
      { status: 500 }
    );
  }
}
