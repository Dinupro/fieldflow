import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { prisma } from "./prisma";

export const auth = betterAuth({
  database: (prismaAdapter as unknown as (client: unknown, cfg: { provider: string }) => ReturnType<typeof prismaAdapter>)(prisma, {
    provider: "postgresql",
  }),

  advanced: {
    database: {
      generateId: "uuid",
    },
  },

  emailAndPassword: {
    enabled: true,
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "DISPATCHER",
        input: true,
      },
    },
  },

  databaseHooks: {
    user: {
      create: {
        after: async (user: { id: string; name?: string | null; email: string; role?: string | null }) => {
          if (user.role === "TECHNICIAN") {
            try {
              const existing = await prisma.technician.findFirst({
                where: { email: { equals: user.email, mode: "insensitive" } },
              });
              if (existing) {
                await prisma.technician.update({
                  where: { id: existing.id },
                  data: { userId: user.id },
                });
              } else {
                await prisma.technician.create({
                  data: {
                    userId: user.id,
                    name: user.name || "Technician",
                    email: user.email,
                    phone: "+1 (555) 000-0000",
                    specialization: "Field Technician",
                    skills: ["Field Operations", "Diagnostics"],
                    status: "AVAILABLE",
                  },
                });
              }
            } catch (err) {
              console.error("[AUTO_CREATE_TECHNICIAN_ERROR]", err);
            }
          }
        },
      },
    },
  },

  secret: process.env.BETTER_AUTH_SECRET || "default_dev_secret_set_in_env_for_production",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
});