import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

// GET /api/audit-logs - Search, filter, and paginate immutable audit logs
export async function GET(req: NextRequest) {
  const authContext = await getAuthUser(req);

  if (!authContext) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // RBAC Guard: Administrators & Dispatchers have access to audit trail
  if (authContext.isTechnician) {
    return NextResponse.json(
      { error: "Forbidden: Field Technicians cannot access organizational audit logs." },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const entityType = searchParams.get("entityType")?.trim().toUpperCase() || "ALL";
    const actionFilter = searchParams.get("action")?.trim() || "ALL";
    const roleFilter = searchParams.get("userRole")?.trim().toUpperCase() || "ALL";
    const userId = searchParams.get("userId")?.trim() || "";
    const startDate = searchParams.get("startDate")?.trim() || "";
    const endDate = searchParams.get("endDate")?.trim() || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "15", 10)));
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    const andConditions: Record<string, unknown>[] = [];

    // Multi-field search
    if (search) {
      const orConditions: Record<string, unknown>[] = [
        { description: { contains: search, mode: "insensitive" as const } },
        { userName: { contains: search, mode: "insensitive" as const } },
        { userEmail: { contains: search, mode: "insensitive" as const } },
        { entityName: { contains: search, mode: "insensitive" as const } },
        { entityId: { contains: search, mode: "insensitive" as const } },
        { ipAddress: { contains: search, mode: "insensitive" as const } },
      ];

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(search)) {
        orConditions.push({ id: { equals: search } });
      }

      andConditions.push({ OR: orConditions });
    }

    // Entity Type filter
    if (entityType && entityType !== "ALL") {
      andConditions.push({
        entityType: { equals: entityType },
      });
    }

    // Action filter
    if (actionFilter && actionFilter !== "ALL") {
      andConditions.push({
        action: { equals: actionFilter as any },
      });
    }

    // Role filter
    if (roleFilter && roleFilter !== "ALL" && ["ADMIN", "DISPATCHER", "TECHNICIAN"].includes(roleFilter)) {
      andConditions.push({
        userRole: { equals: roleFilter as any },
      });
    }

    // Actor User ID filter
    if (userId) {
      andConditions.push({
        userId: { equals: userId },
      });
    }

    // Date range filter
    if (startDate) {
      const start = new Date(startDate);
      if (!isNaN(start.getTime())) {
        andConditions.push({
          createdAt: { gte: start },
        });
      }
    }

    if (endDate) {
      const end = new Date(endDate);
      if (!isNaN(end.getTime())) {
        end.setHours(23, 59, 59, 999);
        andConditions.push({
          createdAt: { lte: end },
        });
      }
    }

    const where = andConditions.length > 0 ? { AND: andConditions } : {};

    const validSortFields = ["createdAt", "action", "entityType", "userName"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "createdAt";

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [total, logs, todayCount, totalAllTime] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortField]: sortOrder },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              image: true,
            },
          },
        },
      }),
      prisma.auditLog.count({
        where: {
          createdAt: { gte: twentyFourHoursAgo },
        },
      }),
      prisma.auditLog.count(),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    // Get unique actors for filter dropdown
    const uniqueActors = await prisma.auditLog.findMany({
      where: { userName: { not: null } },
      select: {
        userId: true,
        userName: true,
        userEmail: true,
        userRole: true,
      },
      distinct: ["userName"],
      take: 20,
    });

    return NextResponse.json({
      logs,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
      stats: {
        totalAuditedEvents: totalAllTime,
        filteredTotal: total,
        todayCount,
        uniqueActorsCount: uniqueActors.length || 1,
      },
      actorsList: uniqueActors,
    });
  } catch (error) {
    console.error("[AUDIT_LOGS_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error fetching audit logs." },
      { status: 500 }
    );
  }
}
