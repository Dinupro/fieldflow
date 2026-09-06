import { z } from "zod";

export const PriorityEnum = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);

export const WorkOrderStatusEnum = z.enum([
  "OPEN",
  "ASSIGNED",
  "ACCEPTED",
  "IN_PROGRESS",
  "PAUSED",
  "COMPLETED",
  "CLOSED",
  "CANCELLED",
]);

export const WorkOrderCreateSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Work order title must be at least 3 characters")
    .max(200, "Title cannot exceed 200 characters"),
  description: z
    .string()
    .trim()
    .min(3, "Description must be at least 3 characters")
    .max(5000, "Description cannot exceed 5000 characters"),
  customerId: z
    .string()
    .uuid("Invalid customer ID format"),
  technicianId: z
    .string()
    .uuid("Invalid technician ID format")
    .optional()
    .nullable()
    .or(z.literal("")),
  priority: PriorityEnum.optional().default("MEDIUM"),
  status: WorkOrderStatusEnum.optional().default("OPEN"),
  scheduledAt: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?)?/))
    .optional()
    .nullable()
    .or(z.literal("")),
  completionNotes: z
    .string()
    .trim()
    .max(2000, "Completion notes cannot exceed 2000 characters")
    .optional()
    .nullable()
    .or(z.literal("")),
});

export const WorkOrderUpdateSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Work order title must be at least 3 characters")
    .max(200, "Title cannot exceed 200 characters")
    .optional(),
  description: z
    .string()
    .trim()
    .min(3, "Description must be at least 3 characters")
    .max(5000, "Description cannot exceed 5000 characters")
    .optional(),
  customerId: z.string().uuid("Invalid customer ID format").optional(),
  technicianId: z
    .string()
    .uuid("Invalid technician ID format")
    .optional()
    .nullable()
    .or(z.literal("")),
  priority: PriorityEnum.optional(),
  status: WorkOrderStatusEnum.optional(),
  scheduledAt: z
    .string()
    .optional()
    .nullable()
    .or(z.literal("")),
  completionNotes: z
    .string()
    .trim()
    .max(2000, "Completion notes cannot exceed 2000 characters")
    .optional()
    .nullable(),
  notes: z
    .string()
    .trim()
    .max(2000, "Transition notes cannot exceed 2000 characters")
    .optional()
    .nullable(),
  completedAt: z
    .string()
    .optional()
    .nullable(),
});

export type WorkOrderCreateInput = z.infer<typeof WorkOrderCreateSchema>;
export type WorkOrderUpdateInput = z.infer<typeof WorkOrderUpdateSchema>;
