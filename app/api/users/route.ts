import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

interface UserRecord {
  id: string;
  name: string | null;
  email: string;
  role: string | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  technician: {
    id: string;
    name: string;
    specialization: string | null;
    status: string;
    phone: string | null;
  } | null;
  _count: {
    statusLogs: number;
  };
}

// GET /api/users - List all users with roles and technician linkage (Admin only)
export async function GET(req: NextRequest) {
  const authContext = await getAuthUser(req);

  if (!authContext) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!authContext.isAdmin) {
    return NextResponse.json(
      { error: "Forbidden: Administrator role required to access user management." },
      { status: 403 }
    );
  }

  try {
    const users: UserRecord[] = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        technician: {
          select: {
            id: true,
            name: true,
            specialization: true,
            status: true,
            phone: true,
          },
        },
        _count: {
          select: {
            statusLogs: true,
          },
        },
      },
    });

    // Also fetch unlinked technicians so admin can link them to technician users
    const availableTechnicians = await prisma.technician.findMany({
      where: {
        userId: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        specialization: true,
        status: true,
      },
    });

    return NextResponse.json({
      users,
      availableTechnicians,
      stats: {
        totalUsers: users.length,
        adminCount: users.filter((u: UserRecord) => u.role === "ADMIN").length,
        dispatcherCount: users.filter((u: UserRecord) => u.role === "DISPATCHER").length,
        technicianCount: users.filter((u: UserRecord) => u.role === "TECHNICIAN").length,
      },
    });
  } catch (error) {
    console.error("[USERS_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error fetching users list." },
      { status: 500 }
    );
  }
}
