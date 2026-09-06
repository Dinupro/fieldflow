import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-guard";
import { logActivity } from "@/lib/audit-logger";
import { CustomerCreateSchema, validateSchema } from "@/lib/validations";

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

    // 1. Zod Schema Validation
    const validation = validateSchema(CustomerCreateSchema, body);
    if (!validation.success) {
      return NextResponse.json(validation.response, { status: 400 });
    }

    const { name, company, email, phone, address, city, notes } = validation.data;

    // 2. Duplicate Detection: Check Email Collision
    const existingEmail = await prisma.customer.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
    });

    if (existingEmail) {
      return NextResponse.json(
        {
          error: `A customer with email "${email}" already exists (${existingEmail.name}${existingEmail.company ? ` - ${existingEmail.company}` : ""}).`,
          errors: { email: "This email address is already registered to an existing customer." },
        },
        { status: 409 }
      );
    }

    // 3. Duplicate Detection: Check Exact Phone + Company match
    if (phone && company) {
      const existingPhoneCompany = await prisma.customer.findFirst({
        where: {
          phone: { equals: phone, mode: "insensitive" },
          company: { equals: company, mode: "insensitive" },
        },
      });

      if (existingPhoneCompany) {
        return NextResponse.json(
          {
            error: `A customer for "${company}" with phone "${phone}" already exists (${existingPhoneCompany.name}).`,
            errors: { phone: "A customer account already exists with this company and phone number combination." },
          },
          { status: 409 }
        );
      }
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        company: company || null,
        email: email.toLowerCase(),
        phone: phone || null,
        address,
        city,
        notes: notes || null,
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
