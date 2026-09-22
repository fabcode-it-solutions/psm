// src/services/parts/partService.ts
import { and, eq, sql, desc, asc, like, gte, lte } from "drizzle-orm";

import {
  parts,
  partMedia,
  partCategories,
  productVariants,
  proAdditionalDetails as additionalDetails,
} from "@/db/schema/parts";
import {
  manufacturers,
  carBrands,
  carModels,
  carModelTypes,
} from "@/db/schema/default";
import { categories } from "@/db/schema/categories";
import { media } from "@/db/schema/media";
import { seoMeta } from "@/db/schema/seoMeta";

import { z } from "zod";
import { db } from "@/db/db";
import logger from "@/libs/logger";

/**
 * Parts Service Layer
 * Implements business logic for parts management
 * Following Australian enterprise patterns
 */

// Types
export interface PartFilters {
  brandId?: number;
  modelId?: number;
  typeId?: number;
  manufacturerId?: number;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  status?: "active" | "inactive" | "archived";
  search?: string;
}

export interface PartCreateInput {
  title: string;
  slug?: string;
  description: string;
  brandId: number;
  modelId: number;
  typeId: number;
  manufacturerId: number;
  userId: number;
  status?: "active" | "archived";
  categoryIds?: number[];
  mediaIds?: number[];
}

export interface PartUpdateInput {
  title?: string;
  slug?: string;
  description?: string;
  status?: "active" | "review" | "archived";
  brandId?: number;
  modelId?: number;
  typeId?: number;
  manufacturerId?: number;
}

// Cache keys
const CACHE_KEYS = {
  PART: (id: number) => `part:${id}`,
  PART_SLUG: (slug: string) => `part:slug:${slug}`,
  PARTS_LIST: (filters: string) => `parts:list:${filters}`,
  PART_COUNT: "parts:count",
};

// Cache TTL (in seconds)
const CACHE_TTL = {
  PART: 300, // 5 minutes
  LIST: 60, // 1 minute
  COUNT: 120, // 2 minutes
};

export class PartService {
  /**
   * Get a part by ID
   */
  static async getById(id: number) {
    try {
      // Check cache
      // const cacheKey = CACHE_KEYS.PART(id);
      // const cached = await cache.get(cacheKey);
      // if (cached) {
      //   logger.debug("Part retrieved from cache", { id });
      //   return cached;
      // }

      // Prepare query
      const partData = await db
        .select({
          part: parts,
          manufacturer: manufacturers,
          brand: carBrands,
          model: carModels,
          type: carModelTypes,
        })
        .from(parts)
        .leftJoin(manufacturers, eq(parts.manufacturerId, manufacturers.id))
        .leftJoin(carBrands, eq(parts.brandId, carBrands.id))
        .leftJoin(carModels, eq(parts.modelId, carModels.id))
        .leftJoin(carModelTypes, eq(parts.typeId, carModelTypes.id))
        .where(eq(parts.id, id))
        .limit(1);

      if (!partData.length) {
        return null;
      }

      const part = partData[0];

      // Fetch related data in parallel
      const [mediaItems, categoryItems, details, variants, seo] =
        await Promise.all([
          // Media
          db
            .select({
              id: media.id,
              url: media.url,
              alt: media.altText,
              order: partMedia.order,
            })
            .from(partMedia)
            .innerJoin(media, eq(partMedia.mediaId, media.id))
            .where(eq(partMedia.partId, id))
            .orderBy(asc(partMedia.order)),

          // Categories
          db
            .select({
              id: categories.id,
              name: categories.name,
              slug: categories.slug,
            })
            .from(partCategories)
            .innerJoin(categories, eq(partCategories.categoryId, categories.id))
            .where(eq(partCategories.partId, id)),

          // Additional details
          db
            .select()
            .from(additionalDetails)
            .where(eq(additionalDetails.partId, id))
            .orderBy(asc(additionalDetails.displayOrder)),

          // Variants
          db
            .select()
            .from(productVariants)
            .where(eq(productVariants.partId, id)),

          // SEO
          db
            .select()
            .from(seoMeta)
            .where(
              and(eq(seoMeta.entityType, "part"), eq(seoMeta.entityId, id))
            )
            .limit(1),
        ]);

      // Assemble result
      const result = {
        ...part.part,
        manufacturer: part.manufacturer,
        brand: part.brand,
        model: part.model,
        type: part.type,
        media: mediaItems,
        categories: categoryItems,
        additionalDetails: details,
        variants,
        seo: seo[0] || null,
      };

      // Cache result
      // await cache.set(cacheKey, result, CACHE_TTL.PART);
      if (process.env.NODE_ENV !== "production")
        logger.info("Part retrieved successfully", { id });
      return result;
    } catch (error) {
      if (process.env.NODE_ENV !== "production")
        logger.error("Error retrieving part", { error, id });
      throw new Error("Failed to retrieve part");
    }
  }

  /**
   * Get a part by slug
   */
  static async getBySlug(slug: string) {
    try {
      // Check cache
      const cacheKey = CACHE_KEYS.PART_SLUG(slug);
      // const cached = await cache.get(cacheKey);
      // if (cached) {
      //   return cached;
      // }

      // Get part ID from slug
      const partResult = await db
        .select({ id: parts.id })
        .from(parts)
        .where(eq(parts.slug, slug))
        .limit(1);

      if (!partResult.length) {
        return null;
      }

      const part = await this.getById(partResult[0].id);

      // Cache by slug
      // await cache.set(cacheKey, part, CACHE_TTL.PART);

      return part;
    } catch (error) {
      if (process.env.NODE_ENV !== "production")
        logger.error("Error retrieving part by slug", { error, slug });
      throw new Error("Failed to retrieve part");
    }
  }

  /**
   * List parts with filters and pagination
   */
  static async list(
    filters: PartFilters = {},
    page: number = 1,
    limit: number = 20,
    sortBy: "createdAt" | "price" | "title" = "createdAt",
    sortOrder: "asc" | "desc" = "desc"
  ) {
    try {
      // Create cache key
      const filterKey = JSON.stringify({
        filters,
        page,
        limit,
        sortBy,
        sortOrder,
      });
      const cacheKey = CACHE_KEYS.PARTS_LIST(filterKey);

      // Check cache
      // const cached = await cache.get(cacheKey);
      // if (cached) {
      //   return cached;
      // }

      // Build where conditions
      const conditions = [];

      if (filters.brandId) {
        conditions.push(eq(parts.brandId, filters.brandId));
      }

      if (filters.modelId) {
        conditions.push(eq(parts.modelId, filters.modelId));
      }

      if (filters.typeId) {
        conditions.push(eq(parts.typeId, filters.typeId));
      }

      if (filters.manufacturerId) {
        conditions.push(eq(parts.manufacturerId, filters.manufacturerId));
      }

      if (filters.status) {
        conditions.push(eq(parts.status, filters.status));
      }

      if (filters.search) {
        conditions.push(like(parts.title, `%${filters.search}%`));
      }

      // Build query
      const offset = (page - 1) * limit;

      // Get total count
      const [countResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(parts)
        .where(and(...conditions));

      const total = countResult?.count || 0;

      // Get parts
      const orderByColumn =
        sortBy === "price"
          ? productVariants.price
          : sortBy === "title"
          ? parts.title
          : parts.createdAt;

      const orderDirection = sortOrder === "asc" ? asc : desc;

      const results = await db
        .select({
          part: parts,
          manufacturer: manufacturers,
          brand: carBrands,
          media: media,
        })
        .from(parts)
        .leftJoin(manufacturers, eq(parts.manufacturerId, manufacturers.id))
        .leftJoin(carBrands, eq(parts.brandId, carBrands.id))
        .leftJoin(
          partMedia,
          and(
            eq(partMedia.partId, parts.id),
            eq(partMedia.order, 0) // Primary image only
          )
        )
        .leftJoin(media, eq(media.id, partMedia.mediaId))
        .where(and(...conditions))
        .orderBy(orderDirection(orderByColumn))
        .limit(limit)
        .offset(offset);

      // Format results
      const formattedResults = results.map((row) => ({
        ...row.part,
        manufacturer: row.manufacturer,
        brand: row.brand,
        primaryImage: row.media,
      }));

      const response = {
        data: formattedResults,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      };

      // Cache result
      // await cache.set(cacheKey, response, CACHE_TTL.LIST);
      if (process.env.NODE_ENV !== "production")
        logger.info("Parts listed successfully", {
          filters,
          page,
          limit,
          total,
        });

      return response;
    } catch (error) {
      if (process.env.NODE_ENV !== "production")
        logger.error("Error listing parts", { error, filters });
      throw new Error("Failed to list parts");
    }
  }

  /**
   * Create a new part
   */
  static async create(input: PartCreateInput) {
    try {
      // Generate slug if not provided
      if (!input.slug) {
        input.slug = await this.generateUniqueSlug(input.title);
      }

      // Start transaction
      const result = await db.transaction(async (tx) => {
        // Create part
        const [newPart] = await tx
          .insert(parts)
          .values({
            title: input.title,
            slug: input.slug!,
            description: input.description,
            brandId: input.brandId,
            modelId: input.modelId,
            typeId: input.typeId,
            manufacturerId: input.manufacturerId,
            userId: input.userId,
            status: input.status || "archived",
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();

        // Add categories if provided
        if (input.categoryIds && input.categoryIds.length > 0) {
          await tx.insert(partCategories).values(
            input.categoryIds.map((categoryId) => ({
              partId: newPart.id,
              categoryId,
            }))
          );
        }

        // Add media if provided
        if (input.mediaIds && input.mediaIds.length > 0) {
          await tx.insert(partMedia).values(
            input.mediaIds.map((mediaId, index) => ({
              partId: newPart.id,
              mediaId,
              order: index,
            }))
          );
        }

        return newPart;
      });

      // Clear cache
      // await cache.delete(CACHE_KEYS.PART_COUNT);
      if (process.env.NODE_ENV !== "production")
        logger.info("Part created successfully", {
          id: result.id,
          title: result.title,
        });

      return result;
    } catch (error) {
      if (process.env.NODE_ENV !== "production")
        logger.error("Error creating part", { error, input });
      throw new Error("Failed to create part");
    }
  }

  /**
   * Update a part
   */
  static async update(id: number, input: PartUpdateInput) {
    try {
      // Update part
      const [updated] = await db
        .update(parts)
        .set({
          ...input,
          updatedAt: new Date(),
        })
        .where(eq(parts.id, id))
        .returning();

      if (!updated) {
        throw new Error("Part not found");
      }

      // Clear cache
      // await Promise.all([
      //   cache.delete(CACHE_KEYS.PART(id)),
      //   cache.delete(CACHE_KEYS.PART_SLUG(updated.slug)),
      // ]);
      if (process.env.NODE_ENV !== "production")
        logger.info("Part updated successfully", { id });

      return updated;
    } catch (error) {
      if (process.env.NODE_ENV !== "production")
        logger.error("Error updating part", { error, id, input });
      throw new Error("Failed to update part");
    }
  }

  /**
   * Delete a part (soft delete)
   */
  static async delete(id: number) {
    try {
      const [deleted] = await db
        .update(parts)
        .set({
          status: "deleted",
          // deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(parts.id, id))
        .returning();

      if (!deleted) {
        throw new Error("Part not found");
      }

      // Clear cache
      // await Promise.all([
      //   cache.delete(CACHE_KEYS.PART(id)),
      //   cache.delete(CACHE_KEYS.PART_SLUG(deleted.slug)),
      //   cache.delete(CACHE_KEYS.PART_COUNT),
      // ]);
      if (process.env.NODE_ENV !== "production")
        logger.info("Part deleted successfully", { id });

      return deleted;
    } catch (error) {
      if (process.env.NODE_ENV !== "production")
        logger.error("Error deleting part", { error, id });
      throw new Error("Failed to delete part");
    }
  }

  /**
   * Generate unique slug
   */
  private static async generateUniqueSlug(title: string): Promise<string> {
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    let slug = baseSlug;
    let counter = 0;

    while (true) {
      const existing = await db
        .select({ id: parts.id })
        .from(parts)
        .where(eq(parts.slug, slug))
        .limit(1);

      if (!existing.length) {
        break;
      }

      counter++;
      slug = `${baseSlug}-${counter}`;
    }

    return slug;
  }
}
