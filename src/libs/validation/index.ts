// src/lib/validation/index.ts
import { z, ZodError, ZodSchema } from "zod";
import sanitizeHtml from "sanitize-html";
import logger from "@/libs/logger";
import { ValidationRequest, ValidationResponse } from "@/types";

/**
 * Input Validation Service
 * Implements comprehensive validation and sanitization
 * Compliant with OWASP Input Validation guidelines
 */

// Australian-specific validation patterns
const AU_PATTERNS = {
  phoneNumber: /^(\+61|0)[2-478][\d]{8}$/,
  mobileNumber: /^(\+61|0)4[\d]{8}$/,
  postcode: /^[0-9]{4}$/,
  abn: /^[0-9]{11}$/,
  tfn: /^[0-9]{8,9}$/,
  bsb: /^[0-9]{6}$/,
  medicareNumber: /^[2-6]\d{9}$/,
};

// Common validation schemas
export const commonSchemas = {
  // User-related
  email: z
    .string()
    .email("Invalid email format")
    .toLowerCase()
    .trim()
    .max(255, "Email too long"),

  password: z
    .string()
    .min(12, "Password must be at least 12 characters")
    .max(128, "Password too long")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[0-9]/, "Must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),

  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username too long")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, underscores, and hyphens"
    ),

  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name too long")
    .regex(/^[a-zA-Z\s'-]+$/, "Invalid characters in first name"),

  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name too long")
    .regex(/^[a-zA-Z\s'-]+$/, "Invalid characters in last name"),

  // Australian-specific
  auPhoneNumber: z
    .string()
    .regex(AU_PATTERNS.phoneNumber, "Invalid Australian phone number"),

  auMobileNumber: z
    .string()
    .regex(AU_PATTERNS.mobileNumber, "Invalid Australian mobile number"),

  auPostcode: z
    .string()
    .regex(AU_PATTERNS.postcode, "Invalid Australian postcode"),

  auABN: z
    .string()
    .regex(AU_PATTERNS.abn, "Invalid ABN format")
    .refine(validateABN, "Invalid ABN"),

  // Parts-related
  partTitle: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(255, "Title too long")
    .transform((val) => sanitizeText(val)),

  partDescription: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(5000, "Description too long")
    .transform((val) => sanitizeRichText(val)),

  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format"),

  price: z
    .number()
    .positive("Price must be positive")
    .max(999999.99, "Price too high")
    .transform((val) => Math.round(val * 100) / 100), // Round to 2 decimal places

  quantity: z
    .number()
    .int("Quantity must be an integer")
    .min(0, "Quantity cannot be negative")
    .max(9999, "Quantity too high"),

  // File uploads
  imageFile: z.object({
    mimetype: z.enum(["image/jpeg", "image/png", "image/webp", "image/gif"]),
    size: z.number().max(5 * 1024 * 1024, "Image must be less than 5MB"),
  }),

  documentFile: z.object({
    mimetype: z.enum([
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]),
    size: z.number().max(10 * 1024 * 1024, "Document must be less than 10MB"),
  }),

  // Search and filtering
  searchQuery: z
    .string()
    .min(1, "Search query is required")
    .max(100, "Search query too long")
    .transform((val) => sanitizeSearchQuery(val)),

  sortField: z.enum(["createdAt", "updatedAt", "price", "title", "popularity"]),

  sortOrder: z.enum(["asc", "desc"]),

  pagination: z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(20),
  }),

  dateRange: z
    .object({
      from: z.date().or(z.string().datetime()),
      to: z.date().or(z.string().datetime()),
    })
    .refine((data) => {
      const from = new Date(data.from);
      const to = new Date(data.to);
      return from <= to;
    }, "From date must be before or equal to To date"),
};

/**
 * Validate Australian Business Number (ABN)
 */
function validateABN(abn: string): boolean {
  const weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
  const cleanABN = abn.replace(/\s/g, "");

  if (cleanABN.length !== 11) return false;

  let sum = 0;
  for (let i = 0; i < 11; i++) {
    const digit = parseInt(cleanABN[i]);
    if (i === 0) {
      sum += (digit - 1) * weights[i];
    } else {
      sum += digit * weights[i];
    }
  }

  return sum % 89 === 0;
}

/**
 * Sanitize plain text input
 */
export function sanitizeText(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/\s+/g, " ") // Normalize whitespace
    .substring(0, 1000); // Limit length
}

/**
 * Sanitize rich text/HTML content
 */
export function sanitizeRichText(input: string): string {
  return sanitizeHtml(input, {
    allowedTags: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "blockquote",
      "ul",
      "ol",
      "li",
      "a",
      "img",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "width", "height"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowProtocolRelative: false,
  });
}

/**
 * Sanitize search query
 */
export function sanitizeSearchQuery(query: string): string {
  return query
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, " ") // Normalize whitespace
    .substring(0, 100); // Limit length
}

/**
 * Sanitize SQL identifiers (table names, column names)
 */
export function sanitizeSQLIdentifier(identifier: string): string {
  // Only allow alphanumeric and underscores
  return identifier.replace(/[^a-zA-Z0-9_]/g, "");
}

/**
 * Validate and sanitize request data
 */
export async function validateRequest<T>(
  schema: ZodSchema<T>,
  data: unknown
): Promise<T> {
  try {
    const validated = await schema.parseAsync(data);
    if (process.env.NODE_ENV !== "production")
      logger.debug("Request validation successful", {
        schemaName: schema.constructor.name, // FIXED
      });

    return validated;
  } catch (error) {
    if (error instanceof ZodError) {
      if (process.env.NODE_ENV !== "production")
        logger.warn("Request validation failed", {
          errors: error.issues, // FIXED
        });

      throw new ValidationError("Validation failed", error.issues); // FIXED
    }
    if (process.env.NODE_ENV !== "production")
      logger.error("Unexpected validation error", { error });
    throw error;
  }
}

/**
 * Custom validation error class
 */
export class ValidationError extends Error {
  constructor(message: string, public errors: z.ZodIssue[]) {
    super(message);
    this.name = "ValidationError";
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      errors: this.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
        code: err.code,
      })),
    };
  }
}

/**
 * Create a validation middleware for API routes
 */

type ValidationNext = () => void;

export function validationMiddleware<T>(schema: ZodSchema<T>) {
  return async (
    req: ValidationRequest,
    res: ValidationResponse,
    next: ValidationNext
  ) => {
    try {
      const validated = await validateRequest(schema, req.body);
      req.validated = validated;
      next();
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: error.errors,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };
}

/**
 * Batch validation for multiple fields
 */
export async function validateBatch(
  validations: Array<{ field: string; value: unknown; schema: ZodSchema }>
): Promise<{ valid: boolean; errors: Record<string, string[]> }> {
  const errors: Record<string, string[]> = {};
  let valid = true;

  for (const { field, value, schema } of validations) {
    try {
      await schema.parseAsync(value);
    } catch (error) {
      valid = false;
      if (error instanceof ZodError) {
        errors[field] = error.issues.map((issue) => issue.message); // FIXED
      } else {
        errors[field] = ["Validation failed"];
      }
    }
  }

  return { valid, errors };
}

/**
 * SQL Injection prevention helper
 */
export function preventSQLInjection(input: string): string {
  // Escape single quotes
  return input.replace(/'/g, "''");
}

/**
 * XSS prevention helper
 */
export function preventXSS(input: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  };

  return input.replace(/[&<>"'/]/g, (s) => map[s]);
}

/**
 * Path traversal prevention
 */
export function preventPathTraversal(path: string): string {
  // Remove any path traversal attempts
  return path.replace(/\.\./g, "").replace(/^\/+/, "").replace(/\/+$/, "");
}

/**
 * Command injection prevention
 */
export function preventCommandInjection(input: string): string {
  // Remove dangerous characters for shell commands
  return input.replace(/[;&|`$(){}[\]<>\\]/g, "");
}
