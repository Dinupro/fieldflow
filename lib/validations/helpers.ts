import { z } from "zod";

export interface FormattedValidationErrors {
  error: string;
  errors: Record<string, string>;
}

/**
 * Converts ZodError into a clean, standardized error response object
 */
export function formatZodError(error: z.ZodError): FormattedValidationErrors {
  const errors: Record<string, string> = {};
  
  error.issues.forEach((issue) => {
    const path = issue.path.length > 0 ? issue.path.join(".") : "form";
    if (!errors[path]) {
      errors[path] = issue.message;
    }
  });

  const firstErrorKey = Object.keys(errors)[0];
  const primaryMessage = firstErrorKey
    ? `${errors[firstErrorKey]}`
    : "Validation failed. Please verify input fields.";

  return {
    error: primaryMessage,
    errors,
  };
}

/**
 * Validates arbitrary input data against a Zod schema
 */
export function validateSchema<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: true;
  data: T;
} | {
  success: false;
  response: FormattedValidationErrors;
} {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    response: formatZodError(result.error),
  };
}
