import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

type TechnicianStatus = "AVAILABLE" | "BUSY" | "OFF";

export const dynamic = "force-dynamic";

// GET /api/technicians - List, search, filter, and paginate technicians
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const statusFilter = searchParams.get("status")?.trim().toUpperCase() || "";
    const specializationFilter = searchParams.get("specialization")?.trim() || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    const andConditions: Record<string, unknown>[] = [];

    // Search filter
    if (search) {
      andConditions.push({
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
          { phone: { contains: search, mode: "insensitive" as const } },
          { specialization: { contains: search, mode: "insensitive" as const } },
          { serviceArea: { contains: search, mode: "insensitive" as const } },
          { skills: { has: search } },
        ],
      });
    }

    // Status filter
    if (statusFilter && ["AVAILABLE", "BUSY", "OFF"].includes(statusFilter)) {
      andConditions.push({
        status: statusFilter as TechnicianStatus,
      });
    }

    // Specialization filter
    if (specializationFilter && specializationFilter !== "all") {
      andConditions.push({
        specialization: { contains: specializationFilter, mode: "insensitive" as const },
      });
    }

    const where = andConditions.length > 0 ? { AND: andConditions } : {};

    const validSortFields = ["name", "status", "specialization", "serviceArea", "createdAt"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "createdAt";

    const [total, technicians, totalAvailable, totalBusy, totalOff] = await Promise.all([
      prisma.technician.count({ where }),
      prisma.technician.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortField]: sortOrder },
        include: {
          _count: {
            select: {
              workOrders: true,
            },
          },
        },
      }),
      prisma.technician.count({ where: { status: "AVAILABLE" } }),
      prisma.technician.count({ where: { status: "BUSY" } }),
      prisma.technician.count({ where: { status: "OFF" } }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return NextResponse.json({
      technicians,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
      stats: {
        totalTechnicians: totalAvailable + totalBusy + totalOff,
        availableCount: totalAvailable,
        busyCount: totalBusy,
        offlineCount: totalOff,
      },
    });
  } catch (error) {
    console.error("[TECHNICIANS_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error fetching technicians." },
      { status: 500 }
    );
  }
}

// POST /api/technicians - Create a new technician
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
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

    // Process skills into clean array
    let processedSkills: string[] = [];
    if (Array.isArray(skills)) {
      processedSkills = skills.map((s) => String(s).trim()).filter(Boolean);
    } else if (typeof skills === "string") {
      processedSkills = skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    const cleanEmail = email?.trim() || null;

    // Check email uniqueness if provided
    if (cleanEmail) {
      const existing = await prisma.technician.findFirst({
        where: { email: { equals: cleanEmail, mode: "insensitive" } },
      });
      if (existing) {
        return NextResponse.json(
          {
            error: "Email conflict",
            errors: { email: "A technician with this email address is already registered." },
          },
          { status: 409 }
        );
      }
    }

    const created = await prisma.technician.create({
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

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("[TECHNICIANS_POST_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error creating technician." },
      { status: 500 }
    );
  }
}
