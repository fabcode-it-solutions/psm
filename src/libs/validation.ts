/**
 * Input Validation Utilities
 * Australian-specific validations included
 * Follows OWASP Input Validation guidelines
 */

import { z } from "zod";

// ==================== AUSTRALIAN-SPECIFIC VALIDATORS ====================

/**
 * Australian Business Number (ABN) Validator
 * Format: 11 digits with specific validation algorithm
 */
export const abnSchema = z.string().refine(
  (abn) => {
    const cleanAbn = abn.replace(/\s/g, "");
    if (!/^\d{11}$/.test(cleanAbn)) return false;

    // ABN validation algorithm
    const weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
    const digits = cleanAbn.split("").map(Number);
    digits[0] -= 1; // Subtract 1 from first digit

    const sum = digits.reduce((acc, digit, i) => acc + digit * weights[i], 0);
    return sum % 89 === 0;
  },
  { message: "Invalid Australian Business Number (ABN)" }
);

/**
 * Australian Company Number (ACN) Validator
 * Format: 9 digits
 */
export const acnSchema = z.string().refine(
  (acn) => {
    const cleanAcn = acn.replace(/\s/g, "");
    if (!/^\d{9}$/.test(cleanAcn)) return false;

    // ACN validation algorithm
    const weights = [8, 7, 6, 5, 4, 3, 2, 1];
    const digits = cleanAcn.split("").map(Number);
    const sum = digits
      .slice(0, 8)
      .reduce((acc, digit, i) => acc + digit * weights[i], 0);
    const checkDigit = (10 - (sum % 10)) % 10;

    return checkDigit === digits[8];
  },
  { message: "Invalid Australian Company Number (ACN)" }
);

/**
 * Australian Phone Number Validator
 * Supports: +61, 04, (04), 02, etc.
 */
export const australianPhoneSchema = z.string().refine(
  (phone) => {
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");

    // Mobile: 04XX XXX XXX or +614XX XXX XXX
    const mobile = /^(04\d{8}|(\+?614\d{8}))$/;

    // Landline: 02, 03, 07, 08 + 8 digits
    const landline = /^(0[2378]\d{8}|(\+?61[2378]\d{8}))$/;

    return mobile.test(cleanPhone) || landline.test(cleanPhone);
  },
  { message: "Invalid Australian phone number" }
);

/**
 * Australian Postcode Validator
 * Format: 4 digits (0200-9999)
 */
export const australianPostcodeSchema = z
  .string()
  .regex(
    /^(0[2-9]\d{2}|[1-9]\d{3})$/,
    "Invalid Australian postcode (must be 4 digits, 0200-9999)"
  );

/**
 * Australian State/Territory Validator
 */
// export const australianStateSchema = z.enum(
//   ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"],
//   { errorMap: () => ({ message: "Invalid Australian state/territory" }) }
// );
export const australianStateSchema = z
  .enum(["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"])
  .refine(() => true, {
    message: "Invalid Australian state/territory",
  });


// ==================== COMMON VALIDATORS ====================

/**
 * Strong Password Schema
 * Requirements: Min 8 chars, uppercase, lowercase, number, special char
 */
export const strongPasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must not exceed 128 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character"
  );

/**
 * Email Schema with common TLD validation
 */
export const emailSchema = z
  .string()
  .email("Invalid email address")
  .toLowerCase()
  .max(255, "Email must not exceed 255 characters");

/**
 * Username Schema
 * Alphanumeric, underscore, hyphen only
 */
export const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username must not exceed 30 characters")
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    "Username can only contain letters, numbers, underscores, and hyphens"
  );

/**
 * URL Schema with protocol
 */
export const urlSchema = z
  .string()
  .url("Invalid URL format")
  .refine(
    (url) => url.startsWith("http://") || url.startsWith("https://"),
    "URL must start with http:// or https://"
  );

/**
 * Positive Integer Schema
 */
export const positiveIntSchema = z
  .number()
  .int("Must be an integer")
  .positive("Must be positive");

/**
 * Price Schema (for e-commerce)
 * Allows 2 decimal places, positive numbers
 */
export const priceSchema = z
  .number()
  .nonnegative("Price cannot be negative")
  .multipleOf(0.01, "Price can have at most 2 decimal places");

// ==================== ADDRESS SCHEMAS ====================

/**
 * Australian Address Schema
 */
export const australianAddressSchema = z.object({
  addressLine1: z.string().min(1, "Address line 1 is required").max(255),
  addressLine2: z.string().max(255).optional().nullable(),
  city: z.string().min(1, "City is required").max(100),
  state: australianStateSchema,
  postalCode: australianPostcodeSchema,
 country: z.literal("AU").refine((val) => val === "AU", {
  message: "Must be Australia (AU)",
}),

});

// ==================== FILE UPLOAD VALIDATORS ====================

/**
 * Allowed MIME types for images
 */
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

/**
 * Max file size: 10MB
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Image Upload Schema
 */
export const imageUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine(
      (file) => file.size <= MAX_FILE_SIZE,
      "File size must be less than 10MB"
    )
    .refine(
      (file) =>
        ALLOWED_IMAGE_TYPES.includes(
          file.type as (typeof ALLOWED_IMAGE_TYPES)[number]
        ),
      "File must be JPEG, PNG, WebP, or GIF"
    ),
  alt: z.string().max(255).optional(),
});

// ==================== SANITIZATION HELPERS ====================

/**
 * Sanitize string to prevent XSS
 * Basic sanitization - for HTML rendering, use DOMPurify on client
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Sanitize filename for storage
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_{2,}/g, "_")
    .toLowerCase();
}

/**
 * Strip HTML tags from string
 */
export function stripHtmlTags(input: string): string {
  return input.replace(/<[^>]*>/g, "");
}

// ==================== VALIDATION ERROR FORMATTER ====================

/**
 * Format Zod validation errors for API responses
 */
export function formatValidationErrors(
  error: z.ZodError
): Record<string, string[]> {
  const formatted: Record<string, string[]> = {};

  error.issues.forEach((err) => {
    const path = err.path.join(".");
    if (!formatted[path]) {
      formatted[path] = [];
    }
    formatted[path].push(err.message);
  });

  return formatted;
}


/**
 * Validation error response helper
 */
export function validationErrorResponse(error: z.ZodError) {
  return {
    success: false,
    error: "Validation failed",
    errors: formatValidationErrors(error),
  };
}

// ==================== COMMON DTO SCHEMAS ====================

/**
 * Pagination Schema
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

/**
 * ID Parameter Schema
 */
export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

/**
 * Search Query Schema
 */
export const searchQuerySchema = z.object({
  q: z.string().min(2, "Search query must be at least 2 characters").max(100),
});

// ==================== EXPORT ALL ====================

export const validators = {
  // Australian specific
  abn: abnSchema,
  acn: acnSchema,
  australianPhone: australianPhoneSchema,
  australianPostcode: australianPostcodeSchema,
  australianState: australianStateSchema,
  australianAddress: australianAddressSchema,

  // Common
  strongPassword: strongPasswordSchema,
  email: emailSchema,
  username: usernameSchema,
  url: urlSchema,
  positiveInt: positiveIntSchema,
  price: priceSchema,

  // File uploads
  imageUpload: imageUploadSchema,

  // Common DTOs
  pagination: paginationSchema,
  idParam: idParamSchema,
  searchQuery: searchQuerySchema,
};
