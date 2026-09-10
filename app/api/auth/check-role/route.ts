import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, selectedRole, action } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const trimmedEmail = email.trim();

    const user = await prisma.user.findFirst({
      where: { email: { equals: trimmedEmail, mode: "insensitive" } },
      select: { id: true, email: true, role: true, name: true },
    });

    if (action === "register") {
      if (user) {
        const userRoleDisplay =
          user.role === "ADMIN"
            ? "Administrator"
            : user.role === "TECHNICIAN"
              ? "Technician"
              : "Dispatcher";

        return NextResponse.json({
          exists: true,
          role: user.role,
          message: `An account with ${trimmedEmail} is already registered as a ${userRoleDisplay}. Please sign in via the ${userRoleDisplay} portal.`,
        });
      }
      return NextResponse.json({ exists: false });
    }

    if (action === "login") {
      if (!user) {
        return NextResponse.json({ found: false });
      }

      const mappedSelected =
        selectedRole === "admin"
          ? "ADMIN"
          : selectedRole === "technician"
            ? "TECHNICIAN"
            : "DISPATCHER";

      const matches = user.role === mappedSelected;

      return NextResponse.json({
        found: true,
        matches,
        actualRole: user.role,
        expectedRole: mappedSelected,
      });
    }

    return NextResponse.json({ user: user ? { role: user.role } : null });
  } catch (err) {
    console.error("[CHECK_ROLE_ERROR]", err);
    return NextResponse.json({ error: "Failed to check role" }, { status: 500 });
  }
}
