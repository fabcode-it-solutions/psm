import z from "zod";

export const brandSchema = z.object({
  name: z
    .string()
    .min(1, "Brand name is required")
    .max(255, "Name must be less than 255 characters"),
  description: z
    .string()
    .max(255, "Description must be less than 255 characters")
    .optional(),
  logo: z.string().url("Logo must be a valid URL").optional().or(z.literal("")),
  image: z
    .string()
    .url("Image must be a valid URL")
    .optional()
    .or(z.literal("")),
  status: z.enum(["active", "inactive"]),
});

export const modelSchema = z.object({
  name: z
    .string()
    .min(1, "Model name is required")
    .min(2, "Model name must be at least 2 characters")
    .max(128, "Model name must be less than 128 characters"),
  description: z
    .string()
    .max(255, "Description must be less than 255 characters")
    .optional(),
  status: z.enum(["active", "inactive"]),
  brandId: z.number().positive("Brand selection is required").optional(),
  image: z.number().positive().optional(),
});

export const modelTypeSchema = z.object({
  name: z
    .string()
    .min(1, "Model type name is required")
    .min(2, "Model type name must be at least 2 characters")
    .max(255, "Model type name must be less than 255 characters"),
  description: z
    .string()
    .max(255, "Description must be less than 255 characters")
    .optional(),
  status: z.enum(["active", "inactive"]),
  modelId: z.number().positive("Model selection is required").optional(),
  image: z.number().positive().optional(),
});

export const typeSchema = z.object({
  name: z
    .string()
    .min(1, "Type name is required")
    .min(2, "Type name must be at least 2 characters")
    .max(100, "Type name must not exceed 100 characters")
    .trim(),
  description: z
    .string()
    .max(255, "Description must not exceed 255 characters")
    .optional()
    .or(z.literal("")),
  status: z.enum(["active", "inactive"]),
  modelId: z.number().positive("Model selection is required"),
  image: z.number().optional(),
});

export const manufacturerSchema = z.object({
  name: z
    .string()
    .min(1, "Manufacturer name is required")
    .min(2, "Manufacturer name must be at least 2 characters")
    .max(255, "Manufacturer name must be less than 255 characters"),
  description: z
    .string()
    .max(255, "Description must be less than 255 characters")
    .optional(),
  subTitle: z
    .string()
    .max(255, "Subtitle must be less than 255 characters")
    .optional(),
  status: z.enum(["active", "inactive"]),
});
