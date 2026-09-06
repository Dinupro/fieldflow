import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-guard";

type TechnicianStatus = "AVAILABLE" | "BUSY" | "OFF";

export const dynamic = "force-dynamic";

// GET /api/technicians - List, search, filter, paginate, and track technician workload & performance
export async function GET(req: NextRequest) {
  const authContext = await getAuthUser(req);

  if (!authContext) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const statusFilter = searchParams.get("status")?.trim().toUpperCase() || "";
    const specializationFilter = searchParams.get("specialization")?.trim() || "";
    const serviceAreaFilter = searchParams.get("serviceArea")?.trim() || "";
    const skillFilter = searchParams.get("skill")?.trim() || "";
    const certificationFilter = searchParams.get("certification")?.trim() || "";
    const workloadStatus = searchParams.get("workloadStatus")?.trim().toLowerCase() || "all";
    const minRatingStr = searchParams.get("minRating");
    const minRating = minRatingStr ? parseFloat(minRatingStr) : null;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    const andConditions: Record<string, unknown>[] = [];

    // Multi-field search
    if (search) {
      const orConditions: Record<string, unknown>[] = [
        { name: { contains: search, mode: "insensitive" as const } },
        { email: { contains: search, mode: "insensitive" as const } },
        { phone: { contains: search, mode: "insensitive" as const } },
        { specialization: { contains: search, mode: "insensitive" as const } },
        { serviceArea: { contains: search, mode: "insensitive" as const } },
        { notes: { contains: search, mode: "insensitive" as const } },
        { skills: { has: search } },
        { certifications: { has: search } },
      ];

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(search)) {
        orConditions.push({ id: { equals: search } });
      }

      andConditions.push({ OR: orConditions });
    }

    // Status filter
    if (statusFilter && statusFilter !== "ALL" && ["AVAILABLE", "BUSY", "OFF"].includes(statusFilter)) {
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

    // Service Area filter
    if (serviceAreaFilter && serviceAreaFilter !== "all") {
      andConditions.push({
        serviceArea: { contains: serviceAreaFilter, mode: "insensitive" as const },
      });
    }

    // Skill filter
    if (skillFilter && skillFilter !== "all") {
      andConditions.push({
        skills: { has: skillFilter },
      });
    }

    // Certification filter
    if (certificationFilter && certificationFilter !== "all") {
      andConditions.push({
        certifications: { has: certificationFilter },
      });
    }

    // Min Rating filter
    if (minRating && !isNaN(minRating)) {
      andConditions.push({
        rating: { gte: minRating },
      });
    }

    const where = andConditions.length > 0 ? { AND: andConditions } : {};

    // Determine if sorting is supported directly at DB level
    const dbSortFields = ["name", "status", "specialization", "serviceArea", "rating", "experienceYears", "createdAt", "updatedAt"];
    const isDbSort = dbSortFields.includes(sortBy);

    // Fetch technicians with work order relations to compute live workload metrics
    const [allMatchingTechs, totalAvailable, totalBusy, totalOff] = await Promise.all([
      prisma.technician.findMany({
        where,
        ...(isDbSort ? { orderBy: { [sortBy]: sortOrder } } : {}),
        include: {
          workOrders: {
            select: {
              id: true,
              title: true,
              status: true,
              priority: true,
              scheduledAt: true,
              completedAt: true,
              createdAt: true,
            },
            orderBy: { createdAt: "desc" },
          },
          user: {
            select: {
              id: true,
              email: true,
              role: true,
              image: true,
            },
          },
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

    // Process and enrich technicians with workload & performance metrics
    let enriched = allMatchingTechs.map((tech: any) => {
      const activeWorkOrders = (tech.workOrders || []).filter((wo: { status: string }) =>
        ["OPEN", "ASSIGNED", "ACCEPTED", "IN_PROGRESS", "PAUSED"].includes(wo.status)
      );
      const completedWorkOrders = (tech.workOrders || []).filter((wo: { status: string }) =>
        ["COMPLETED", "CLOSED"].includes(wo.status)
      );

      const activeOrdersCount = activeWorkOrders.length;
      const completedOrdersCount = completedWorkOrders.length;
      const maxActiveJobs = tech.maxActiveJobs || 3;
      const workloadPercentage = Math.min(100, Math.round((activeOrdersCount / maxActiveJobs) * 100));
      const isAtCapacity = activeOrdersCount >= maxActiveJobs;

      // SLA Compliance calculation
      let onTimeCount = 0;
      let completedWithDates = 0;
      completedWorkOrders.forEach((wo: { completedAt: Date | null; scheduledAt: Date | null }) => {
        if (wo.completedAt && wo.scheduledAt) {
          completedWithDates++;
          if (new Date(wo.completedAt) <= new Date(wo.scheduledAt)) {
            onTimeCount++;
          }
        }
      });
      const slaComplianceRate = completedWithDates > 0 ? Math.round((onTimeCount / completedWithDates) * 100) : 100;

      return {
        ...tech,
        skills: tech.skills || [],
        certifications: tech.certifications || [],
        rating: tech.rating ?? 4.9,
        experienceYears: tech.experienceYears ?? 3,
        maxActiveJobs,
        activeOrdersCount,
        completedOrdersCount,
        workloadPercentage,
        isAtCapacity,
        slaComplianceRate,
        currentAssignments: activeWorkOrders,
        completedJobs: completedWorkOrders,
      };
    });

    // Workload status filtering if specified
    if (workloadStatus === "available") {
      enriched = enriched.filter((t: any) => !t.isAtCapacity && t.status === "AVAILABLE");
    } else if (workloadStatus === "at_capacity") {
      enriched = enriched.filter((t: any) => t.isAtCapacity || t.status === "BUSY");
    }

    // In-memory sorting for computed properties
    if (!isDbSort) {
      if (sortBy === "activeWorkload") {
        enriched.sort((a: any, b: any) =>
          sortOrder === "asc" ? a.activeOrdersCount - b.activeOrdersCount : b.activeOrdersCount - a.activeOrdersCount
        );
      } else if (sortBy === "completedJobs") {
        enriched.sort((a: any, b: any) =>
          sortOrder === "asc" ? a.completedOrdersCount - b.completedOrdersCount : b.completedOrdersCount - a.completedOrdersCount
        );
      } else if (sortBy === "slaRate") {
        enriched.sort((a: any, b: any) =>
          sortOrder === "asc" ? a.slaComplianceRate - b.slaComplianceRate : b.slaComplianceRate - a.slaComplianceRate
        );
      }
    }

    const total = enriched.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const paginatedTechs = enriched.slice((page - 1) * limit, page * limit);

    // Compute aggregate roster stats
    const totalTechsCount = totalAvailable + totalBusy + totalOff;
    const availableForDispatchCount = enriched.filter((t: any) => t.status === "AVAILABLE" && !t.isAtCapacity).length;
    const totalActiveJobs = enriched.reduce((acc: number, t: any) => acc + (t.activeOrdersCount || 0), 0);
    const avgRating =
      enriched.length > 0
        ? parseFloat((enriched.reduce((acc: number, t: any) => acc + (t.rating || 4.9), 0) / enriched.length).toFixed(1))
        : 4.9;

    return NextResponse.json({
      technicians: paginatedTechs,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
      stats: {
        totalTechnicians: totalTechsCount,
        availableCount: totalAvailable,
        busyCount: totalBusy,
        offlineCount: totalOff,
        availableForDispatchCount,
        totalActiveJobs,
        avgRating,
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

// POST /api/technicians - Create a new technician with skills, certifications & capacity
export async function POST(req: NextRequest) {
  const authContext = await getAuthUser(req);

  if (!authContext) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // RBAC Guard: Technicians cannot provision other technicians
  if (authContext.isTechnician) {
    return NextResponse.json(
      { error: "Forbidden: Field Technicians cannot create technician profiles." },
      { status: 403 }
    );
  }

  try {
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

    // Process certifications into clean array
    let processedCerts: string[] = [];
    if (Array.isArray(certifications)) {
      processedCerts = certifications.map((c) => String(c).trim()).filter(Boolean);
    } else if (typeof certifications === "string") {
      processedCerts = certifications
        .split(",")
        .map((c) => c.trim())
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
        certifications: processedCerts,
        rating: typeof rating === "number" ? Math.min(5, Math.max(1, rating)) : 4.9,
        experienceYears: typeof experienceYears === "number" ? Math.max(0, experienceYears) : 3,
        maxActiveJobs: typeof maxActiveJobs === "number" ? Math.max(1, maxActiveJobs) : 3,
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
