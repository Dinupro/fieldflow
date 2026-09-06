import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-guard";
import { logActivity } from "@/lib/audit-logger";

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
    } = body;

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

    const errors: Record<string, string> = {};

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      errors.name = "Technician full name is required (min 2 characters).";
    }

    if (email && typeof email === "string" && email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        errors.email = "Please provide a valid email address.";
      }
    }

    if (status && !["AVAILABLE", "BUSY", "OFF"].includes(status)) {
      errors.status = "Invalid availability status. Must be AVAILABLE, BUSY, or OFF.";
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { error: "Validation failed", errors },
        { status: 400 }
      );
    }

    const cleanEmail = email?.trim() || null;

    // Check email uniqueness against other technicians
    if (cleanEmail) {
      const existing = await prisma.technician.findFirst({
        where: {
          email: { equals: cleanEmail, mode: "insensitive" },
          id: { not: id },
        },
      });
      if (existing) {
        return NextResponse.json(
          {
            error: "Email conflict",
            errors: { email: "Another technician is already registered with this email address." },
          },
          { status: 409 }
        );
      }
    }

    // Process skills
    let processedSkills: string[] = [];
    if (Array.isArray(skills)) {
      processedSkills = skills.map((s) => String(s).trim()).filter(Boolean);
    } else if (typeof skills === "string") {
      processedSkills = skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    // Process certifications
    let processedCerts: string[] = [];
    if (Array.isArray(certifications)) {
      processedCerts = certifications.map((c) => String(c).trim()).filter(Boolean);
    } else if (typeof certifications === "string") {
      processedCerts = certifications
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);
    }

    const updated = await prisma.technician.update({
      where: { id },
      data: {
        name: name.trim(),
        email: cleanEmail,
        phone: phone?.trim() || null,
        specialization: specialization?.trim() || null,
        skills: processedSkills,
        certifications: processedCerts,
        rating: typeof rating === "number" ? Math.min(5, Math.max(1, rating)) : existingTech.rating,
        experienceYears: typeof experienceYears === "number" ? Math.max(0, experienceYears) : existingTech.experienceYears,
        maxActiveJobs: typeof maxActiveJobs === "number" ? Math.max(1, maxActiveJobs) : existingTech.maxActiveJobs,
        status: (status as TechnicianStatus) || existingTech.status,
        serviceArea: serviceArea?.trim() || null,
        notes: notes?.trim() || null,
        avatar: avatar?.trim() || null,
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
        skillsCount: processedSkills.length,
        certificationsCount: processedCerts.length,
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
