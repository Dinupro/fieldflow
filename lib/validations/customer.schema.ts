import { z } from "zod";

export const CustomerCreateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Customer name must be at least 2 characters")
    .max(100, "Customer name cannot exceed 100 characters"),
  email: z
    .string()
    .trim()
    .email("Please provide a valid email address (e.g. client@company.com)")
    .max(255, "Email cannot exceed 255 characters"),
  phone: z
    .string()
    .trim()
    .min(7, "Phone number must have at least 7 digits")
    .max(30, "Phone number cannot exceed 30 characters")
    .optional()
    .nullable()
    .or(z.literal("")),
  company: z
    .string()
    .trim()
    .max(150, "Company name cannot exceed 150 characters")
    .optional()
    .nullable()
    .or(z.literal("")),
  address: z
    .string()
    .trim()
    .min(3, "Service address must be at least 3 characters")
    .max(255, "Service address cannot exceed 255 characters"),
  city: z
    .string()
    .trim()
    .min(2, "City name must be at least 2 characters")
    .max(100, "City name cannot exceed 100 characters"),
  notes: z
    .string()
    .trim()
    .max(2000, "Notes cannot exceed 2000 characters")
    .optional()
    .nullable()
    .or(z.literal("")),
});

export const CustomerUpdateSchema = CustomerCreateSchema.partial();

export type CustomerCreateInput = z.infer<typeof CustomerCreateSchema>;
export type CustomerUpdateInput = z.infer<typeof CustomerUpdateSchema>;
