import { z } from "zod";

export const TechnicianStatusEnum = z.enum(["AVAILABLE", "BUSY", "OFF"]);

export const TechnicianCreateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Technician name must be at least 2 characters")
    .max(100, "Technician name cannot exceed 100 characters"),
  email: z
    .string()
    .trim()
    .email("Please provide a valid email address")
    .max(255, "Email cannot exceed 255 characters")
    .optional()
    .nullable()
    .or(z.literal("")),
  phone: z
    .string()
    .trim()
    .min(7, "Phone number must have at least 7 digits")
    .max(30, "Phone number cannot exceed 30 characters")
    .optional()
    .nullable()
    .or(z.literal("")),
  specialization: z
    .string()
    .trim()
    .max(100, "Specialization cannot exceed 100 characters")
    .optional()
    .nullable()
    .or(z.literal("")),
  skills: z
    .union([
      z.array(z.string().trim().min(1)),
      z.string().transform((val) =>
        val
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      ),
    ])
    .optional()
    .default([]),
  certifications: z
    .union([
      z.array(z.string().trim().min(1)),
      z.string().transform((val) =>
        val
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      ),
    ])
    .optional()
    .default([]),
  rating: z
    .number()
    .min(1.0, "Rating must be between 1.0 and 5.0")
    .max(5.0, "Rating cannot exceed 5.0")
    .optional()
    .default(4.9),
  experienceYears: z
    .number()
    .min(0, "Experience years cannot be negative")
    .max(50, "Experience years cannot exceed 50")
    .optional()
    .default(3),
  maxActiveJobs: z
    .number()
    .int("Max active jobs must be a whole number")
    .min(1, "Max active jobs must be at least 1")
    .max(20, "Max active jobs cannot exceed 20")
    .optional()
    .default(3),
  status: TechnicianStatusEnum.optional().default("AVAILABLE"),
  serviceArea: z
    .string()
    .trim()
    .max(100, "Service territory cannot exceed 100 characters")
    .optional()
    .nullable()
    .or(z.literal("")),
  notes: z
    .string()
    .trim()
    .max(2000, "Notes cannot exceed 2000 characters")
    .optional()
    .nullable()
    .or(z.literal("")),
  avatar: z
    .string()
    .trim()
    .optional()
    .nullable()
    .or(z.literal("")),
});

export const TechnicianUpdateSchema = TechnicianCreateSchema.partial();

export type TechnicianCreateInput = z.infer<typeof TechnicianCreateSchema>;
export type TechnicianUpdateInput = z.infer<typeof TechnicianUpdateSchema>;
