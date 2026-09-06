import { CustomerCreateSchema, CustomerUpdateSchema } from "../lib/validations/customer.schema.ts";
import { TechnicianCreateSchema, TechnicianUpdateSchema } from "../lib/validations/technician.schema.ts";
import { WorkOrderCreateSchema, WorkOrderUpdateSchema } from "../lib/validations/work-order.schema.ts";
import { UserRoleUpdateSchema } from "../lib/validations/user.schema.ts";
import { validateSchema } from "../lib/validations/helpers.ts";

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

console.log("================================================================================");
console.log("🧪 RUNNING ZOD VALIDATION & SCHEMA REGRESSION TEST SUITE");
console.log("================================================================================\n");

// 1. Customer Validation Tests
console.log("▶️ [1] Customer Schema Validation");
const invalidCustomer = validateSchema(CustomerCreateSchema, {
  name: "A",
  email: "invalid-email-string",
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

// 2. Technician Validation Tests
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

// 3. Work Order Validation Tests
console.log("\n▶️ [3] Work Order Schema Validation");
const invalidWO = validateSchema(WorkOrderCreateSchema, {
  title: "AB",
  customerId: "not-a-uuid",
  priority: "SUPER_URGENT",
  status: "FINISHED_EARLY",
});
assert(!invalidWO.success, "Invalid work order payload fails validation");
assert(!!invalidWO.fieldErrors?.title, "Detects work order title too short");
assert(!!invalidWO.fieldErrors?.customerId, "Detects invalid UUID for customerId");
assert(!!invalidWO.fieldErrors?.priority, "Detects invalid Priority enum");

const validWO = validateSchema(WorkOrderCreateSchema, {
  title: "Main Breaker Panel Replacement",
  description: "Replaced 400A circuit breaker at secondary transformer station.",
  customerId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
  technicianId: "f1e2d3c4-b5a6-9788-09bc-def123456789",
  priority: "HIGH",
  status: "OPEN",
});
assert(validWO.success, "Valid work order payload passes validation");

// 4. User Role Validation Tests
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
