import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

type TechnicianStatus = "AVAILABLE" | "BUSY" | "OFF";

export const dynamic = "force-dynamic";

// GET /api/technicians/[id] - Fetch single technician with assigned work orders
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    const technician = await prisma.technician.findUnique({
      where: { id },
      include: {
        workOrders: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            priority: true,
            scheduledAt: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!technician) {
      return NextResponse.json({ error: "Technician not found" }, { status: 404 });
    }

    return NextResponse.json(technician);
  } catch (error) {
    console.error("[TECHNICIAN_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error fetching technician." },
      { status: 500 }
    );
  }
}

// PUT /api/technicians/[id] - Update technician details and availability status
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { name, email, phone, specialization, skills, status, serviceArea, notes, avatar } = body;

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

    const updated = await prisma.technician.update({
      where: { id },
      data: {
        name: name.trim(),
        email: cleanEmail,
        phone: phone?.trim() || null,
        specialization: specialization?.trim() || null,
        skills: processedSkills,
        status: (status as TechnicianStatus) || "AVAILABLE",
        serviceArea: serviceArea?.trim() || null,
        notes: notes?.trim() || null,
        avatar: avatar?.trim() || null,
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

// DELETE /api/technicians/[id] - Safe deletion guard protecting active work orders
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    // Check for active work orders (OPEN, ASSIGNED, IN_PROGRESS)
    const activeOrders = technician.workOrders.filter(
      (wo: { id: string; title: string; status: string }) =>
        wo.status === "OPEN" || wo.status === "ASSIGNED" || wo.status === "IN_PROGRESS"
    );

    if (activeOrders.length > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete technician "${technician.name}": Technician is assigned to ${activeOrders.length} active work order(s). Please reassign or complete these jobs before deleting.`,
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
