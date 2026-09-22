/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Metafield Definitions API Route - Complete CRUD
 *
 * Endpoints:
 * - GET    /api/metafields/definitions      - List definitions (paginated, filterable)
 * - POST   /api/metafields/definitions      - Create new definition
 * - PUT    /api/metafields/definitions      - Update definition
 * - DELETE /api/metafields/definitions      - Delete definition
 *
 * Features:
 * - Category-based filtering
 * - Entity type filtering (part, customer, order, etc.)
 * - Full validation with Zod
 * - Category assignments
 * - Option validation for select/multiselect
 *
 * - Comprehensive validation
 * - Type safety
 * - Error handling
 * - Transaction safety
 *
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq, and, or, like, inArray, sql } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth/auth";
import {
  metafieldDefinitionCategories,
  metafieldDefinitions,
  MetafieldOption,
  metafieldOptions,
  metafields,
} from "@/db/schema/metafields";
import { db } from "@/db/db";

// ============================================================================
// Validation Schemas
// ============================================================================

/**
 * Option schema for select/multiselect fields
 */
const OptionSchema = z.object({
  value: z.string().min(1, "Option value is required"),
  label: z.string().min(1, "Option label is required"),
});

/**
 * Validation rule schema
 */
const ValidationRuleSchema = z.object({
  min: z.number().optional(),
  max: z.number().optional(),
  pattern: z.string().optional(),
  required: z.boolean().optional(),
});

/**
 * Create metafield definition schema
 */
const MetafieldDefinitionCreateSchema = z
  .object({
    entityType: z.enum(["part", "customer", "order", "supplier", "invoice"]),
    namespace: z.string().min(1).max(50).default("custom"),
    key: z
      .string()
      .min(1, "Key is required")
      .max(50, "Key too long")
      .regex(
        /^[a-z0-9_]+$/,
        "Key must contain only lowercase letters, numbers, and underscores"
      ),
    name: z.string().min(1, "Name is required").max(100),
    description: z.string().max(500).optional(),
    type: z.enum([
      "text",
      "number",
      "boolean",
      "date",
      "datetime",
      "select",
      "multiselect",
      "color",
      "url",
      "email",
      "phone",
    ]),
    isRequired: z.boolean().default(false),
    options: z.array(OptionSchema).optional(),
    validationRules: ValidationRuleSchema.optional().nullable(),
    helpText: z.string().max(200).optional(),
    placeholder: z.string().max(100).optional(),
    defaultValue: z.string().max(500).optional(),
    displayOrder: z.number().int().min(0).default(0),
    isActive: z.boolean().default(true),
    appliesGlobally: z.boolean().default(false),
    categoryIds: z.array(z.number().int().positive()).optional(),
  })
  .refine(
    (data) => {
      // Select/multiselect must have options
      if (["select", "multiselect"].includes(data.type)) {
        return data.options && data.options.length > 0;
      }
      return true;
    },
    {
      message: "Select and multiselect fields must have at least one option",
      path: ["options"],
    }
  )
  .refine(
    (data) => {
      // If not global, must have categories
      if (!data.appliesGlobally) {
        return data.categoryIds && data.categoryIds.length > 0;
      }
      return true;
    },
    {
      message:
        "Non-global metafields must be assigned to at least one category",
      path: ["categoryIds"],
    }
  );

/**
 * Update metafield definition schema
 */
const MetafieldDefinitionUpdateSchema =
  MetafieldDefinitionCreateSchema.partial()
    .extend({
      id: z.number().int().positive(),
    })
    .refine(
      (data) => {
        // Select/multiselect must have options
        if (data.type && ["select", "multiselect"].includes(data.type)) {
          return data.options && data.options.length > 0;
        }
        return true;
      },
      {
        message: "Select and multiselect fields must have at least one option",
        path: ["options"],
      }
    );

/**
 * Query parameters schema
 */
const QuerySchema = z.object({
  page: z
    .string()
    .transform(Number)
    .pipe(z.number().int().positive())
    .default(1),
  limit: z
    .string()
    .transform(Number)
    .pipe(z.number().int().min(1).max(100))
    .default(20),
  search: z.string().optional(),
  entityType: z.string().optional(),
  type: z.string().optional(),
  categoryIds: z.string().optional(),
  includeGlobal: z
    .string()
    .transform((val) => val === "true")
    .default(true),
  includeInactive: z
    .string()
    .transform((val) => val === "true")
    .default(false),
});

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Build WHERE clause for filtering
 */
function buildWhereClause(filters: {
  search?: string;
  entityType?: string;
  type?: string;
  categoryIds?: number[];
  includeGlobal: boolean;
  includeInactive: boolean;
}) {
  const conditions = [];

  // Search
  if (filters.search) {
    const searchTerm = `%${filters.search}%`;
    conditions.push(
      or(
        like(metafieldDefinitions.name, searchTerm),
        like(metafieldDefinitions.key, searchTerm),
        like(metafieldDefinitions.description, searchTerm)
      )
    );
  }

  // Filter by entity type
  if (filters.entityType) {
    conditions.push(eq(metafieldDefinitions.entityType, filters.entityType));
  }

  // Filter by field type
  if (filters.type) {
    conditions.push(eq(metafieldDefinitions.type, filters.type));
  }

  // Filter by active status
  if (!filters.includeInactive) {
    conditions.push(eq(metafieldDefinitions.isActive, true));
  }

  // Filter by categories
  if (filters.categoryIds && filters.categoryIds.length > 0) {
    const categoryConditions = [];

    // Include global metafields if requested
    if (filters.includeGlobal) {
      categoryConditions.push(eq(metafieldDefinitions.appliesGlobally, true));
    }

    // Include metafields linked to specified categories
    categoryConditions.push(
      inArray(
        metafieldDefinitions.id,
        db
          .select({ id: metafieldDefinitionCategories.metafieldDefinitionId })
          .from(metafieldDefinitionCategories)
          .where(
            inArray(
              metafieldDefinitionCategories.categoryId,
              filters.categoryIds
            )
          )
      )
    );

    if (categoryConditions.length > 0) {
      conditions.push(or(...categoryConditions));
    }
  }

  return conditions.length > 0 ? and(...conditions) : undefined;
}

/**
 * Format definition with categories
 */
async function formatDefinitionData(definition: any) {
  // Fetch linked categories
  const categoryLinks = await db
    .select({
      id: metafieldDefinitionCategories.categoryId,
      name: sql`categories.name`,
      isRequired: metafieldDefinitionCategories.isRequired,
      displayOrder: metafieldDefinitionCategories.displayOrder,
      categoryId: metafieldDefinitionCategories.categoryId,
    })
    .from(metafieldDefinitionCategories)
    .leftJoin(
      sql`categories`,
      eq(sql`categories.id`, metafieldDefinitionCategories.categoryId)
    )
    .where(
      eq(metafieldDefinitionCategories.metafieldDefinitionId, definition.id)
    );
  let options: MetafieldOption[] = [];
  if (definition.type === "select" || definition.type === "multiselect") {
    options = await db
      .select()
      .from(metafieldOptions)
      .where(eq(metafieldOptions.metafieldDefinitionId, definition.id))
      .orderBy(metafieldOptions.displayOrder);
  }
  // Count usage (how many entities have values for this definition)
  const [{ count: usageCount }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(metafields)
    .where(eq(metafields.metafieldDefinitionId, definition.id));

  return {
    ...definition,
    categories: categoryLinks,
    categoryIds: categoryLinks.map((item) => item.categoryId),
    options,
    usageCount: Number(usageCount),
  };
}

// ============================================================================
// GET - List Metafield Definitions
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const query = QuerySchema.parse({
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "20",
      search: searchParams.get("search") || undefined,
      entityType: searchParams.get("entityType") || undefined,
      type: searchParams.get("type") || undefined,
      categoryIds: searchParams.get("categoryIds") || undefined,
      includeGlobal: searchParams.get("includeGlobal") || "true",
      includeInactive: searchParams.get("includeInactive") || "false",
    });

    const {
      page,
      limit,
      search,
      entityType,
      type,
      categoryIds: categoryIdsStr,
      includeGlobal,
      includeInactive,
    } = query;

    // Parse category IDs
    const categoryIds = categoryIdsStr
      ? categoryIdsStr.split(",").map(Number).filter(Boolean)
      : undefined;

    // Build WHERE clause
    const whereClause = buildWhereClause({
      search,
      entityType,
      type,
      categoryIds,
      includeGlobal,
      includeInactive,
    });

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(metafieldDefinitions)
      .where(whereClause);

    const total = Number(count);
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;

    // Fetch definitions
    const definitions = await db
      .select()
      .from(metafieldDefinitions)
      .where(whereClause)
      .orderBy(metafieldDefinitions.displayOrder, metafieldDefinitions.name)
      .limit(limit)
      .offset(offset);

    // Format data with categories
    const formattedDefinitions = await Promise.all(
      definitions.map((def) => formatDefinitionData(def))
    );

    return NextResponse.json({
      success: true,
      data: formattedDefinitions,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
    });
  } catch (error) {
    console.error("GET /api/metafields/definitions error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid query parameters",
          details: error,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch metafield definitions",
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST - Create Metafield Definition
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const data = MetafieldDefinitionCreateSchema.parse(body);

    // Check if definition with same key already exists for this entity type and namespace
    const [existing] = await db
      .select()
      .from(metafieldDefinitions)
      .where(
        and(
          eq(metafieldDefinitions.entityType, data.entityType),
          eq(metafieldDefinitions.namespace, data.namespace),
          eq(metafieldDefinitions.key, data.key)
        )
      )
      .limit(1);

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: `Metafield definition with key "${data.key}" already exists for ${data.entityType}.${data.namespace}`,
        },
        { status: 409 }
      );
    }

    // Start transaction
    const result = await db.transaction(async (tx) => {
      // 1. Create definition
      const [newDefinition] = await tx
        .insert(metafieldDefinitions)
        .values({
          entityType: data.entityType,
          namespace: data.namespace,
          key: data.key,
          name: data.name,
          description: data.description,
          type: data.type,
          isRequired: data.isRequired,
          // options: data.options ? JSON.stringify(data.options) : null,
          validationRules: data.validationRules
            ? JSON.stringify(data.validationRules)
            : null,
          helpText: data.helpText,
          placeholder: data.placeholder,
          defaultValue: data.defaultValue,
          displayOrder: data.displayOrder,
          isActive: data.isActive,
          appliesGlobally: data.appliesGlobally,
        })
        .returning();

      // 2. Link categories (if not global)
      if (
        !data.appliesGlobally &&
        data.categoryIds &&
        data.categoryIds.length > 0
      ) {
        await tx.insert(metafieldDefinitionCategories).values(
          data.categoryIds.map((categoryId) => ({
            metafieldDefinitionId: newDefinition.id,
            categoryId,
            isRequired: data.isRequired, // Inherit from definition
            displayOrder: data.displayOrder,
          }))
        );
      }

      return newDefinition;
    });

    // Format response
    const formattedDefinition = await formatDefinitionData(result);

    return NextResponse.json(
      {
        success: true,
        data: formattedDefinition,
        message: "Metafield definition created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/metafields/definitions error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: error,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create metafield definition",
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// PUT - Update Metafield Definition
// ============================================================================

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const data = MetafieldDefinitionUpdateSchema.parse(body);
    const { id, categoryIds, ...updateData } = data;

    // Check if definition exists
    const [existing] = await db
      .select()
      .from(metafieldDefinitions)
      .where(eq(metafieldDefinitions.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Metafield definition not found" },
        { status: 404 }
      );
    }

    // Check if key is being changed and conflicts with another definition
    if (updateData.key && updateData.key !== existing.key) {
      const [conflict] = await db
        .select()
        .from(metafieldDefinitions)
        .where(
          and(
            eq(
              metafieldDefinitions.entityType,
              updateData.entityType || existing.entityType
            ),

            eq(metafieldDefinitions.key, updateData.key),
            sql`${metafieldDefinitions.id} != ${id}`
          )
        )
        .limit(1);

      if (conflict) {
        return NextResponse.json(
          {
            success: false,
            error: `Metafield definition with key "${updateData.key}" already exists`,
          },
          { status: 409 }
        );
      }
    }

    // Start transaction
    const result = await db.transaction(async (tx) => {
      // 1. Update definition
      const [updatedDefinition] = await tx
        .update(metafieldDefinitions)
        .set({
          ...updateData,
          // options: updateData.options
          //   ? JSON.stringify(updateData.options)
          //   : undefined,
          validationRules: updateData.validationRules
            ? JSON.stringify(updateData.validationRules)
            : undefined,
          updatedAt: new Date(),
        })
        .where(eq(metafieldDefinitions.id, id))
        .returning();

      // 2. Update categories if provided
      if (categoryIds !== undefined) {
        // Remove existing category links
        await tx
          .delete(metafieldDefinitionCategories)
          .where(eq(metafieldDefinitionCategories.metafieldDefinitionId, id));

        // Add new category links (if not global)
        const isGlobal =
          updateData.appliesGlobally !== undefined
            ? updateData.appliesGlobally
            : existing.appliesGlobally;

        if (!isGlobal && categoryIds.length > 0) {
          await tx.insert(metafieldDefinitionCategories).values(
            categoryIds.map((categoryId) => ({
              metafieldDefinitionId: id,
              categoryId,
              isRequired:
                updateData.isRequired !== undefined
                  ? updateData.isRequired
                  : existing.isRequired,
              displayOrder:
                updateData.displayOrder !== undefined
                  ? updateData.displayOrder
                  : existing.displayOrder,
            }))
          );
        }
      }

      return updatedDefinition;
    });

    // Format response
    const formattedDefinition = await formatDefinitionData(result);

    return NextResponse.json({
      success: true,
      data: formattedDefinition,
      message: "Metafield definition updated successfully",
    });
  } catch (error) {
    console.error("PUT /api/metafields/definitions error:", error);
    console.log(error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: error,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update metafield definition",
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE - Delete Metafield Definition
// ============================================================================

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const id = Number(url.searchParams.get("id"));

    if (!id || isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid metafield definition ID" },
        { status: 400 }
      );
    }

    // Check if definition exists
    const [existing] = await db
      .select()
      .from(metafieldDefinitions)
      .where(eq(metafieldDefinitions.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Metafield definition not found" },
        { status: 404 }
      );
    }

    // Check if definition has values
    const [{ count: valueCount }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(metafields)
      .where(eq(metafields.metafieldDefinitionId, id));

    if (Number(valueCount) > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete metafield definition. It is currently used by ${valueCount} entities.`,
          details: {
            usageCount: Number(valueCount),
            suggestion:
              "Consider deactivating instead of deleting, or remove all values first.",
          },
        },
        { status: 400 }
      );
    }

    // Start transaction
    await db.transaction(async (tx) => {
      // 1. Delete category links
      await tx
        .delete(metafieldDefinitionCategories)
        .where(eq(metafieldDefinitionCategories.metafieldDefinitionId, id));

      // 2. Delete definition
      await tx
        .delete(metafieldDefinitions)
        .where(eq(metafieldDefinitions.id, id));
    });

    return NextResponse.json({
      success: true,
      message: "Metafield definition deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/metafields/definitions error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete metafield definition",
      },
      { status: 500 }
    );
  }
}
