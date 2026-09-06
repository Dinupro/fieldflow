import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-guard";
import { logActivity } from "@/lib/audit-logger";

export const dynamic = "force-dynamic";

// GET /api/customers - List customers with search, multi-filters, pagination, and sorting
export async function GET(req: NextRequest) {
  const authContext = await getAuthUser(req);
  if (!authContext) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const cityFilter = searchParams.get("city")?.trim() || "";
    const companyFilter = searchParams.get("company")?.trim() || "";
    const hasActiveOrders = searchParams.get("hasActiveOrders")?.trim() || "all";
    const startDate = searchParams.get("startDate")?.trim() || "";
    const endDate = searchParams.get("endDate")?.trim() || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    const andConditions: Record<string, unknown>[] = [];

    // Search query across all fields
    if (search) {
      const orConditions: Record<string, unknown>[] = [
        { name: { contains: search, mode: "insensitive" as const } },
        { company: { contains: search, mode: "insensitive" as const } },
        { email: { contains: search, mode: "insensitive" as const } },
        { phone: { contains: search, mode: "insensitive" as const } },
        { city: { contains: search, mode: "insensitive" as const } },
        { address: { contains: search, mode: "insensitive" as const } },
        { notes: { contains: search, mode: "insensitive" as const } },
      ];

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(search)) {
        orConditions.push({ id: { equals: search } });
      }

      andConditions.push({ OR: orConditions });
    }

    // City filter
    if (cityFilter && cityFilter !== "all") {
      andConditions.push({
        city: { contains: cityFilter, mode: "insensitive" as const },
      });
    }

    // Company filter
    if (companyFilter && companyFilter !== "all") {
      andConditions.push({
        company: { contains: companyFilter, mode: "insensitive" as const },
      });
    }

    // Active orders filter
    if (hasActiveOrders === "active") {
      andConditions.push({
        workOrders: {
          some: {
            status: {
              in: ["OPEN", "ASSIGNED", "ACCEPTED", "IN_PROGRESS", "PAUSED"],
            },
          },
        },
      });
    } else if (hasActiveOrders === "none" || hasActiveOrders === "inactive") {
      andConditions.push({
        workOrders: {
          none: {
            status: {
              in: ["OPEN", "ASSIGNED", "ACCEPTED", "IN_PROGRESS", "PAUSED"],
            },
          },
        },
      });
    }

    // Date range filter
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
        andConditions.push({ createdAt: dateFilterObj });
      }
    }

    const where = andConditions.length > 0 ? { AND: andConditions } : {};

    const validSortFields = ["name", "company", "email", "city", "createdAt", "updatedAt"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "createdAt";

    const [total, rawCustomers, totalWithActiveOrders, totalWorkOrdersCount] = await Promise.all([
      prisma.customer.count({ where }),
      prisma.customer.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortField]: sortOrder },
        include: {
          workOrders: {
            select: {
              id: true,
              title: true,
              status: true,
              priority: true,
              createdAt: true,
            },
            orderBy: { createdAt: "desc" },
            take: 5,
          },
          _count: {
            select: {
              workOrders: true,
            },
          },
        },
      }),
      prisma.customer.count({
        where: {
          workOrders: {
            some: {
              status: {
                in: ["OPEN", "ASSIGNED", "ACCEPTED", "IN_PROGRESS", "PAUSED"],
              },
            },
          },
        },
      }),
      prisma.workOrder.count(),
    ]);

    // Compute active & completed job breakdown for each customer
    const customers = rawCustomers.map((cust: any) => {
      const activeCount = cust.workOrders.filter((wo: { status: string }) =>
        ["OPEN", "ASSIGNED", "ACCEPTED", "IN_PROGRESS", "PAUSED"].includes(wo.status)
      ).length;
      const completedCount = cust.workOrders.filter((wo: { status: string }) =>
        ["COMPLETED", "CLOSED"].includes(wo.status)
      ).length;

      return {
        ...cust,
        activeOrdersCount: activeCount,
        completedOrdersCount: completedCount,
      };
    });

    const totalPages = Math.ceil(total / limit) || 1;

    return NextResponse.json({
      customers,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
      stats: {
        totalCustomers: total,
        activeWithOrders: totalWithActiveOrders,
        totalWorkOrdersCount,
      },
    });
  } catch (error) {
    console.error("[CUSTOMERS_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}

// POST /api/customers - Create a new customer record (Dispatcher & Admin only)
export async function POST(req: NextRequest) {
  const authContext = await getAuthUser(req);
  if (!authContext) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // RBAC Guard: Technicians cannot create customers
  if (authContext.isTechnician) {
    return NextResponse.json(
      { error: "Forbidden: Field Technicians are not authorized to create customers." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { name, company, email, phone, address, city, notes } = body;

    // Server-side validation
    const errors: Record<string, string> = {};

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      errors.name = "Customer name must be at least 2 characters.";
    }

    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "A valid email address is required (e.g. name@company.com).";
    }

    if (!phone || typeof phone !== "string" || phone.trim().length < 6) {
      errors.phone = "A valid phone number is required (min 6 digits).";
    }

    if (!address || typeof address !== "string" || address.trim().length < 3) {
      errors.address = "Street address is required (min 3 characters).";
    }

    if (!city || typeof city !== "string" || city.trim().length < 2) {
      errors.city = "City is required.";
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ error: "Validation failed", errors }, { status: 400 });
    }

    // Check email uniqueness
    const existing = await prisma.customer.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A customer with this email address already exists.", errors: { email: "Email already registered." } },
        { status: 409 }
      );
    }

    const customer = await prisma.customer.create({
      data: {
        name: name.trim(),
        company: company?.trim() || null,
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        notes: notes?.trim() || null,
      },
      include: {
        _count: {
          select: { workOrders: true },
        },
      },
    });

    // Record immutable audit log
    await logActivity({
      req,
      authContext,
      action: "CUSTOMER_CREATE",
      entityType: "CUSTOMER",
      entityId: customer.id,
      entityName: customer.name,
      description: `Customer account "${customer.name}" created by ${authContext.user.name || authContext.user.email}.`,
      metadata: {
        company: customer.company,
        email: customer.email,
        phone: customer.phone,
        city: customer.city,
      },
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error("[CUSTOMERS_POST_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to create customer" },
      { status: 500 }
    );
  }
}
