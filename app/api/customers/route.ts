import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

// GET /api/customers - List customers with search, pagination, and sorting
export async function GET(req: NextRequest) {
  const authContext = await getAuthUser(req);
  if (!authContext) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { company: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
            { phone: { contains: search, mode: "insensitive" as const } },
            { city: { contains: search, mode: "insensitive" as const } },
            { address: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const validSortFields = ["name", "company", "email", "city", "createdAt"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "createdAt";

    const [total, customers, totalWithActiveOrders] = await Promise.all([
      prisma.customer.count({ where }),
      prisma.customer.findMany({
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
      prisma.customer.count({
        where: {
          workOrders: {
            some: {
              status: {
                in: ["OPEN", "ASSIGNED", "IN_PROGRESS"],
              },
            },
          },
        },
      }),
    ]);

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
      errors.email = "A valid email address is required.";
    }

    if (!phone || typeof phone !== "string" || phone.trim().length < 6) {
      errors.phone = "A valid phone number is required (min 6 characters).";
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

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error("[CUSTOMERS_POST_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to create customer" },
      { status: 500 }
    );
  }
}
