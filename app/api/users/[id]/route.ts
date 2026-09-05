import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, UserRole } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

// PUT /api/users/[id] - Update user role and technician linkage (Admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authContext = await getAuthUser(req);

  if (!authContext) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!authContext.isAdmin) {
    return NextResponse.json(
      { error: "Forbidden: Administrator role required to modify user roles." },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { role, technicianId, name } = body;

    const targetUser = await prisma.user.findUnique({
      where: { id },
      include: { technician: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Validate role
    const validRoles: UserRole[] = ["ADMIN", "DISPATCHER", "TECHNICIAN"];
    let newRole: UserRole = (targetUser.role as UserRole) || "DISPATCHER";
    if (role && validRoles.includes(role)) {
      newRole = role as UserRole;
    }

    // Prevent demoting the last remaining admin
    if (targetUser.role === "ADMIN" && newRole !== "ADMIN") {
      const adminCount = await prisma.user.count({
        where: { role: "ADMIN" },
      });
      if (adminCount <= 1) {
        return NextResponse.json(
          { error: "Cannot demote the last remaining Administrator account." },
          { status: 400 }
        );
      }
    }

    // Handle technician linkage
    if (technicianId !== undefined) {
      // If unlinking
      if (technicianId === null || technicianId === "") {
        if (targetUser.technician) {
          await prisma.technician.update({
            where: { id: targetUser.technician.id },
            data: { userId: null },
          });
        }
      } else {
        // Unlink previous tech if any
        if (targetUser.technician && targetUser.technician.id !== technicianId) {
          await prisma.technician.update({
            where: { id: targetUser.technician.id },
            data: { userId: null },
          });
        }

        // Link new tech
        await prisma.technician.update({
          where: { id: technicianId },
          data: { userId: id },
        });
      }
    } else if (newRole === "TECHNICIAN" && !targetUser.technician) {
      // If promoted to TECHNICIAN and no technician record exists, auto-provision a matching technician record
      const existingTechByEmail = await prisma.technician.findFirst({
        where: { email: { equals: targetUser.email, mode: "insensitive" } },
      });

      if (existingTechByEmail) {
        await prisma.technician.update({
          where: { id: existingTechByEmail.id },
          data: { userId: id },
        });
      } else {
        await prisma.technician.create({
          data: {
            name: targetUser.name || targetUser.email.split("@")[0],
            email: targetUser.email,
            userId: id,
            status: "AVAILABLE",
            specialization: "Field Technician",
          },
        });
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        role: newRole,
        ...(name ? { name: name.trim() } : {}),
      },
      include: {
        technician: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: `User ${updatedUser.name || updatedUser.email} role updated to ${newRole}.`,
    });
  } catch (error) {
    console.error("[USER_ROLE_PUT_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error updating user role." },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Delete user account (Admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authContext = await getAuthUser(req);

  if (!authContext) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!authContext.isAdmin) {
    return NextResponse.json(
      { error: "Forbidden: Administrator role required to delete users." },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;

    if (id === authContext.user.id) {
      return NextResponse.json(
        { error: "You cannot delete your own Administrator account." },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Unlink technician if any
    await prisma.technician.updateMany({
      where: { userId: id },
      data: { userId: null },
    });

    // Delete user (cascades sessions and accounts)
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: `User "${targetUser.email}" deleted successfully.`,
    });
  } catch (error) {
    console.error("[USER_DELETE_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error deleting user." },
      { status: 500 }
    );
  }
}
