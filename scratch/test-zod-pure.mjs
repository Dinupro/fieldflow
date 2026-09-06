import { z } from "zod";

let passed = 0;
let failed = 0;

function assert(condition, desc) {
  if (!condition) {
    console.error(`  ❌ FAILED: ${desc}`);
    failed++;
  } else {
    console.log(`  ✅ PASSED: ${desc}`);
    passed++;
  }
}

// Helpers
function formatZodError(error) {
  const fieldErrors = {};
  for (const issue of error.issues) {
    const path = issue.path.join(".");
    if (path && !fieldErrors[path]) {
      fieldErrors[path] = issue.message;
    }
  }
  const firstMessage = error.issues[0]?.message || "Validation failed";
  return { errorMessage: firstMessage, fieldErrors };
}

function validateSchema(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    const { errorMessage, fieldErrors } = formatZodError(result.error);
    return { success: false, errorMessage, fieldErrors, data: null };
  }
  return { success: true, data: result.data, errorMessage: null, fieldErrors: {} };
}

// Customer Schema
const CustomerCreateSchema = z.object({
  name: z.string().trim().min(2, "Customer name must be at least 2 characters").max(100),
  company: z.string().trim().max(100).optional().nullable(),
  email: z.string().trim().email("Please provide a valid email address"),
  phone: z.string().trim().min(6, "Phone number must be at least 6 characters").max(30),
  address: z.string().trim().min(3, "Address must be at least 3 characters").max(255),
  city: z.string().trim().min(2, "City must be at least 2 characters").max(100).optional().nullable(),
  notes: z.string().trim().max(1000).optional().nullable(),
});

// Technician Schema
const TechnicianCreateSchema = z.object({
  name: z.string().trim().min(2, "Technician name must be at least 2 characters").max(100),
  email: z.string().trim().email("Invalid email address").optional().nullable().or(z.literal("")),
  phone: z.string().trim().min(6, "Phone number must be at least 6 characters").max(30).optional().nullable().or(z.literal("")),
  specialization: z.string().trim().max(100).optional().nullable(),
  skills: z.array(z.string().trim().min(1)).default([]),
  certifications: z.array(z.string().trim().min(1)).default([]),
  experienceYears: z.coerce.number().int().min(0, "Experience years cannot be negative").max(50).default(3),
  maxActiveJobs: z.coerce.number().int().min(1, "Capacity must be at least 1 job").max(10, "Capacity cannot exceed 10 jobs").default(3),
  rating: z.coerce.number().min(0, "Rating cannot be negative").max(5, "Rating cannot exceed 5.0").default(4.9),
  status: z.enum(["AVAILABLE", "BUSY", "OFF"]).default("AVAILABLE"),
  serviceArea: z.string().trim().max(100).optional().nullable(),
  notes: z.string().trim().max(1000).optional().nullable(),
});

// Work Order Schema
const WorkOrderCreateSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(200),
  description: z.string().trim().min(3, "Description must be at least 3 characters"),
  customerId: z.string().uuid("Invalid customer ID format"),
  technicianId: z.string().uuid("Invalid technician ID format").optional().nullable().or(z.literal("")),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  status: z.enum(["OPEN", "ASSIGNED", "ACCEPTED", "IN_PROGRESS", "PAUSED", "COMPLETED", "CLOSED", "CANCELLED"]).default("OPEN"),
  scheduledAt: z.string().datetime().optional().nullable().or(z.literal("")),
  completionNotes: z.string().trim().max(2000).optional().nullable(),
});

// User Role Schema
const UserRoleUpdateSchema = z.object({
  role: z.enum(["ADMIN", "DISPATCHER", "TECHNICIAN"]),
  technicianId: z.string().uuid().optional().nullable().or(z.literal("")),
  name: z.string().trim().min(2).max(100).optional(),
});

console.log("================================================================================");
console.log("🧪 RUNNING COMPREHENSIVE ZOD VALIDATION SUITE");
console.log("================================================================================\n");

// 1. Customer Validation
console.log("▶️ [1] Customer Schema Validation");
const invalidCustomer = validateSchema(CustomerCreateSchema, {
  name: "A",
  email: "invalid-email-address",
  phone: "123",
  address: "ab",
  city: "X",
});
assert(!invalidCustomer.success, "Invalid customer payload fails validation");
assert(!!invalidCustomer.fieldErrors?.name, "Detects customer name too short");
assert(!!invalidCustomer.fieldErrors?.email, "Detects invalid customer email");
assert(!!invalidCustomer.fieldErrors?.phone, "Detects customer phone too short");
assert(!!invalidCustomer.fieldErrors?.address, "Detects customer address too short");
assert(!!invalidCustomer.fieldErrors?.city, "Detects customer city too short");

const validCustomer = validateSchema(CustomerCreateSchema, {
  name: "Global Tech Logistics",
  email: "contact@globaltech.com",
  phone: "+1-800-555-0199",
  address: "500 Enterprise Way",
  city: "San Francisco",
});
assert(validCustomer.success, "Valid customer payload passes validation");

// 2. Technician Validation
console.log("\n▶️ [2] Technician Schema Validation");
const invalidTech = validateSchema(TechnicianCreateSchema, {
  name: "T",
  email: "bad-tech-email",
  rating: 6.5,
  experienceYears: -2,
  maxActiveJobs: 25,
});
assert(!invalidTech.success, "Invalid technician payload fails validation");
assert(!!invalidTech.fieldErrors?.name, "Detects technician name too short");
assert(!!invalidTech.fieldErrors?.email, "Detects invalid technician email");
assert(!!invalidTech.fieldErrors?.rating, "Detects rating over maximum (5.0)");
assert(!!invalidTech.fieldErrors?.experienceYears, "Detects negative experience years");
assert(!!invalidTech.fieldErrors?.maxActiveJobs, "Detects maxActiveJobs exceeds allowed limit");

const validTech = validateSchema(TechnicianCreateSchema, {
  name: "Sarah Jenkins",
  email: "sarah.jenkins@fieldflow.dev",
  phone: "+1-555-0144",
  specialization: "Fiber & Network Infrastructure",
  skills: ["Fiber Splicing", "OTDR Testing"],
  certifications: ["FOA CFOT"],
  rating: 4.95,
  experienceYears: 6,
  maxActiveJobs: 4,
  status: "AVAILABLE",
});
assert(validTech.success, "Valid technician payload passes validation");

// 3. Work Order Validation
console.log("\n▶️ [3] Work Order Schema Validation");
const invalidWO = validateSchema(WorkOrderCreateSchema, {
  title: "AB",
  description: "X",
  customerId: "not-a-uuid",
  priority: "SUPER_URGENT",
  status: "FINISHED_EARLY",
});
assert(!invalidWO.success, "Invalid work order payload fails validation");
assert(!!invalidWO.fieldErrors?.title, "Detects work order title too short");
assert(!!invalidWO.fieldErrors?.description, "Detects work order description too short");
assert(!!invalidWO.fieldErrors?.customerId, "Detects invalid UUID for customerId");
assert(!!invalidWO.fieldErrors?.priority, "Detects invalid Priority enum");

const validWO = validateSchema(WorkOrderCreateSchema, {
  title: "Main Breaker Panel Replacement",
  description: "Replaced 400A circuit breaker at secondary transformer station.",
  customerId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
  technicianId: "f1e2d3c4-b5a6-4788-89bc-def123456789",
  priority: "HIGH",
  status: "OPEN",
});
assert(validWO.success, "Valid work order payload passes validation");

// 4. User Role Validation
console.log("\n▶️ [4] User Role Schema Validation");
const invalidRole = validateSchema(UserRoleUpdateSchema, {
  role: "SUPER_ADMINISTRATOR",
});
assert(!invalidRole.success, "Invalid User role fails validation");
assert(!!invalidRole.fieldErrors?.role, "Detects invalid role enum");

const validRole = validateSchema(UserRoleUpdateSchema, {
  role: "TECHNICIAN",
  name: "Senior Field Tech",
});
assert(validRole.success, "Valid User role update payload passes validation");

console.log("\n================================================================================");
console.log(`🎉 ZOD REGRESSION TESTS: ${passed} passed, ${failed} failed`);
console.log("================================================================================");

if (failed > 0) process.exit(1);
