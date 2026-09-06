import { z } from "zod";

export const UserRoleEnum = z.enum(["ADMIN", "DISPATCHER", "TECHNICIAN"]);

export const UserRoleUpdateSchema = z.object({
  role: UserRoleEnum,
  technicianId: z
    .string()
    .uuid("Invalid technician ID format")
    .optional()
    .nullable()
    .or(z.literal("")),
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters")
    .optional(),
});

export type UserRoleUpdateInput = z.infer<typeof UserRoleUpdateSchema>;
