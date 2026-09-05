import { NextRequest } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type UserRole = "ADMIN" | "DISPATCHER" | "TECHNICIAN";

export interface TechnicianProfile {
  id: string;
  userId: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  specialization: string | null;
  skills: string[];
  status: "AVAILABLE" | "BUSY" | "OFF";
  serviceArea: string | null;
  notes: string | null;
  avatar: string | null;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface AuthContext {
  user: {
    id: string;
    name: string | null;
    email: string;
    role: UserRole;
    image?: string | null;
  };
  role: UserRole;
  technician: TechnicianProfile | null;
  isAdmin: boolean;
  isDispatcher: boolean;
  isTechnician: boolean;
}

/**
 * Resolves the authenticated user, role, and linked technician profile.
 */
export async function getAuthUser(req?: NextRequest): Promise<AuthContext | null> {
  let userId: string | null = null;
  let userEmail: string | null = null;

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (session?.user?.id) {
      userId = session.user.id;
      userEmail = session.user.email;
    }
  } catch {
    // Continue to fallback check
  }

  // Cookie fallback if headers() session was not resolved
  if (!userId && req) {
    const sessionToken =
      req.cookies.get("better-auth.session_token")?.value ||
      req.cookies.get("__Secure-better-auth.session_token")?.value;

    if (sessionToken) {
      try {
        const dbSession = await prisma.session.findUnique({
          where: { token: sessionToken },
          include: { user: true },
        });
        if (dbSession && dbSession.expiresAt > new Date()) {
          userId = dbSession.user.id;
          userEmail = dbSession.user.email;
        }
      } catch {
        // ignore
      }
    }
  }

  if (!userId) {
    return null;
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        technician: true,
      },
    });

    if (!dbUser) return null;

    let linkedTechnician = dbUser.technician as TechnicianProfile | null;

    // Auto-link technician profile by email if not linked by userId yet
    if (!linkedTechnician && dbUser.email) {
      const matchedTech = await prisma.technician.findFirst({
        where: {
          email: { equals: dbUser.email, mode: "insensitive" },
        },
      });

      if (matchedTech) {
        try {
          linkedTechnician = (await prisma.technician.update({
            where: { id: matchedTech.id },
            data: { userId: dbUser.id },
          })) as TechnicianProfile;
        } catch {
          linkedTechnician = matchedTech as TechnicianProfile;
        }
      }
    }

    const role: UserRole = (dbUser.role as UserRole) || "DISPATCHER";

    return {
      user: {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        role,
        image: dbUser.image,
      },
      role,
      technician: linkedTechnician,
      isAdmin: role === "ADMIN",
      isDispatcher: role === "DISPATCHER" || role === "ADMIN",
      isTechnician: role === "TECHNICIAN",
    };
  } catch (error) {
    console.error("[GET_AUTH_USER_ERROR]", error);
    return null;
  }
}
