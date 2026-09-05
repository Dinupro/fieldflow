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
        input: false,
      },
    },
  },

  secret: process.env.BETTER_AUTH_SECRET || "346b55455e20bdcaab06f85442f20bca0c9b5785d1129cde2caaa112568d967f",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
});