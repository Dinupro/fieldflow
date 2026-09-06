import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/customers/[id] - Get customer profile with full work order history & operational stats
export async function GET(req: NextRequest, { params }: RouteParams) {
  const authContext = await getAuthUser(req);
  if (!authContext) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const customer = await prisma.customer.findUnique({
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
            completedAt: true,
            completionNotes: true,
            createdAt: true,
            technician: {
              select: {
                id: true,
                name: true,
                specialization: true,
                phone: true,
                status: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: { workOrders: true },
        },
      },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Compute comprehensive customer summary statistics
    const totalOrders = customer.workOrders.length;
    const activeOrders = customer.workOrders.filter((wo: { status: string }) =>
      ["OPEN", "ASSIGNED", "ACCEPTED", "IN_PROGRESS", "PAUSED"].includes(wo.status)
    ).length;
    const completedOrders = customer.workOrders.filter((wo: { status: string }) =>
      ["COMPLETED", "CLOSED"].includes(wo.status)
    ).length;
    const cancelledOrders = customer.workOrders.filter((wo: { status: string }) => wo.status === "CANCELLED").length;

    let onTimeCount = 0;
    let completedWithDates = 0;
    customer.workOrders.forEach((wo: { status: string; completedAt: Date | null; scheduledAt: Date }) => {
      if ((wo.status === "COMPLETED" || wo.status === "CLOSED") && wo.completedAt && wo.scheduledAt) {
        completedWithDates++;
        if (new Date(wo.completedAt) <= new Date(wo.scheduledAt)) {
          onTimeCount++;
        }
      }
    });

    const slaOnTimeRate = completedWithDates > 0 ? Math.round((onTimeCount / completedWithDates) * 100) : 100;

    return NextResponse.json({
      ...customer,
      stats: {
        totalOrders,
        activeOrders,
        completedOrders,
        cancelledOrders,
        slaOnTimeRate,
      },
    });
  } catch (error) {
    console.error("[CUSTOMER_GET_ID_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch customer profile and dispatch history" },
      { status: 500 }
    );
  }
}

// PUT /api/customers/[id] - Update customer record (Dispatcher & Admin only)
export async function PUT(req: NextRequest, { params }: RouteParams) {
  const authContext = await getAuthUser(req);
  if (!authContext) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // RBAC Guard: Technicians cannot update customer records
  if (authContext.isTechnician) {
    return NextResponse.json(
      { error: "Forbidden: Field Technicians are not authorized to edit customers." },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { name, company, email, phone, address, city, notes } = body;

    // Validation
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

    // Check if customer exists
    const existing = await prisma.customer.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Check email uniqueness if email changed
    if (email.trim().toLowerCase() !== existing.email.toLowerCase()) {
      const emailTaken = await prisma.customer.findUnique({
        where: { email: email.trim().toLowerCase() },
      });
      if (emailTaken && emailTaken.id !== id) {
        return NextResponse.json(
          { error: "A customer with this email address already exists.", errors: { email: "Email already in use." } },
          { status: 409 }
        );
      }
    }

    const updated = await prisma.customer.update({
      where: { id },
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

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[CUSTOMER_PUT_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to update customer" },
      { status: 500 }
    );
  }
}

// DELETE /api/customers/[id] - Safe deletion of customer record (Dispatcher & Admin only)
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const authContext = await getAuthUser(req);
  if (!authContext) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // RBAC Guard: Technicians cannot delete customer records
  if (authContext.isTechnician) {
    return NextResponse.json(
      { error: "Forbidden: Field Technicians are not authorized to delete customers." },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;

    const customer = await prisma.customer.findUnique({
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

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Check for active work orders (OPEN, ASSIGNED, ACCEPTED, IN_PROGRESS, PAUSED)
    const activeOrders = customer.workOrders.filter((wo: { status: string }) =>
      ["OPEN", "ASSIGNED", "ACCEPTED", "IN_PROGRESS", "PAUSED"].includes(wo.status)
    );

    if (activeOrders.length > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete customer "${customer.name}". There are ${activeOrders.length} active in-flight work orders associated with this account. Please resolve or cancel them first.`,
          activeOrdersCount: activeOrders.length,
        },
        { status: 400 }
      );
    }

    // Safe deletion: remove customer record (cascades closed/completed work orders if any)
    await prisma.customer.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: `Customer "${customer.name}" deleted successfully.`,
    });
  } catch (error) {
    console.error("[CUSTOMER_DELETE_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to delete customer" },
      { status: 500 }
    );
  }
}
