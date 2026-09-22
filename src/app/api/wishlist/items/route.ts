import { db } from "@/db/db";
import { and, eq, desc, inArray, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type {
  NewWishlistItem,
  WishlistItemWithDetails,
} from "@/types/wishlist.types";
import {
  wishlistCategories,
  wishlistItems,
  wishlistPriceAlerts,
} from "@/db/schema/wishlist";
import { listings } from "@/db/schema/listings";
import { builds } from "@/db/schema/builds";
import { partMedia, parts } from "@/db/schema/parts";
import { revalidateTag } from "next/cache";
import { media } from "@/db/schema/media";
import { withFullCsrfProtection } from "@/libs/security/csrf-full";

// Validation schema
const createItemSchema = z.object({
  userId: z.number().int().positive(),
  categoryId: z.number().int().positive(),
  entityType: z
    .enum(["part", "listing", "build", "custom", "user"])
    .optional()
    .nullable(),
  entityId: z.number().int().positive().optional().nullable(),
  partId: z.number().int().positive().optional().nullable(),
  listingId: z.number().int().positive().optional().nullable(),
  buildId: z.number().int().positive().optional().nullable(),
  bookmarkedUserId: z.number().int().positive().optional().nullable(),
  isAlertOn: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const categoryId = searchParams.get("categoryId");
    const entityType = searchParams.get("entityType");
    const isAlertOn = searchParams.get("isAlertOn");
    const includeDetails = searchParams.get("includeDetails") === "true";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = [];
    if (userId)
      whereConditions.push(eq(wishlistItems.userId, parseInt(userId)));
    if (categoryId)
      whereConditions.push(eq(wishlistItems.categoryId, parseInt(categoryId)));
    if (entityType)
      whereConditions.push(eq(wishlistItems.entityType, entityType));
    if (isAlertOn !== null)
      whereConditions.push(eq(wishlistItems.isAlertOn, isAlertOn === "true"));

    // Get items
    const items = await db
      .select()
      .from(wishlistItems)
      .where(and(...whereConditions))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(wishlistItems.createdAt));

    // Include entity details if requested
    let itemsWithDetails: WishlistItemWithDetails[] = items;

    if (includeDetails) {
      itemsWithDetails = await Promise.all(
        items.map(async (item) => {
          const details: WishlistItemWithDetails = { ...item };

          // Get related entity details
          if (item.partId) {
            const [part] = await db
              .select({
                id: parts.id,
                title: parts.title,
                slug: parts.slug,
                isWishlisted: sql<boolean>`
                  CASE 
                    WHEN COUNT(DISTINCT ${wishlistItems.id}) > 0 
                    THEN true 
                    ELSE false 
                  END
                `.as("isWishlisted"),
                media: sql`
                          COALESCE(
                            json_agg(
                              DISTINCT jsonb_build_object(
                                  'id', ${media.id},
                    'url', ${media.url},
                    'alt', ${media.altText}
                              )
                            ) FILTER (WHERE ${media.id} IS NOT NULL),
                            '[]'::json
                          )
                        `.as("media"),
              })
              .from(parts)
              .leftJoin(partMedia, eq(partMedia.partId, parts.id))
              .leftJoin(media, eq(media.id, partMedia.mediaId))
              .leftJoin(
                wishlistItems,
                and(
                  userId ? eq(wishlistItems.partId, parts.id) : sql`false`,
                  userId
                    ? eq(wishlistItems.userId, parseInt(userId))
                    : sql`false`
                )
              )
              .groupBy(parts.id)
              .where(eq(parts.id, item.partId));
            // details.part = ;
          }

          if (item.listingId) {
            const [listing] = await db
              .select()
              .from(listings)
              .where(eq(listings.id, item.listingId))
              .limit(1);
            details.listing = listing.id as number;
          }

          if (item.buildId) {
            const [build] = await db
              .select()
              .from(builds)
              .where(eq(builds.id, item.buildId))
              .limit(1);
            details.build = build.id as number;
          }

          // Get alerts if enabled
          if (item.isAlertOn) {
            const alerts = await db
              .select()
              .from(wishlistPriceAlerts)
              .where(eq(wishlistPriceAlerts.itemId, item.id))
              .orderBy(desc(wishlistPriceAlerts.createdAt))
              .limit(5);
            details.alerts = alerts;
          }

          return details;
        })
      );
    }

    // Get total count
    const [{ count }] = await db
      .select({ count: sql`count(*)` })
      .from(wishlistItems)
      .where(and(...whereConditions));

    return NextResponse.json({
      success: true,
      data: itemsWithDetails,
      pagination: {
        page,
        limit,
        total: parseInt(count as string),
        totalPages: Math.ceil(parseInt(count as string) / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching wishlist items:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch wishlist items" },
      { status: 500 }
    );
  }
}

export const POST = withFullCsrfProtection(
  async (req: NextRequest): Promise<NextResponse> => {

  try {
    const body = await req.json();
    const validated = createItemSchema.parse(body);

    // Check if category exists and belongs to user
    const [category] = await db
      .select()
      .from(wishlistCategories)
      .where(eq(wishlistCategories.id, validated.categoryId))
      .limit(1);

    if (!category) {
      return NextResponse.json(
        { success: false, error: "Wishlist category not found" },
        { status: 404 }
      );
    }

    if (category.userId !== validated.userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized to add to this wishlist" },
        { status: 403 }
      );
    }

    // Check for duplicate item in same category
    if (validated.entityType && validated.entityId) {
      const [duplicate] = await db
        .select({ id: wishlistItems.id })
        .from(wishlistItems)
        .where(
          and(
            eq(wishlistItems.categoryId, validated.categoryId),
            eq(wishlistItems.entityType, validated.entityType),
            eq(wishlistItems.entityId, validated.entityId)
          )
        )
        .limit(1);

      if (duplicate) {
        return NextResponse.json(
          {
            success: false,
            error: `${validated.entityType.toLocaleUpperCase()} already exists in this wishlist`,
          },
          { status: 409 }
        );
      }
    }

    // Create item
    const itemData: NewWishlistItem = {
      userId: validated.userId,
      categoryId: validated.categoryId,
      entityType: validated.entityType,
      entityId: validated.entityId,
      partId: validated.partId,
      listingId: validated.listingId,
      buildId: validated.buildId,
      bookmarkedUserId: validated.bookmarkedUserId,
      isAlertOn: validated.isAlertOn || false,
    };

    const [newItem] = await db
      .insert(wishlistItems)
      .values(itemData)
      .returning();

    // Update category item count
    await db
      .update(wishlistCategories)
      .set({
        itemCount: sql`${wishlistCategories.itemCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(wishlistCategories.id, validated.categoryId));
    revalidateTag(`wishlist-${category.slug}`);
    return NextResponse.json(
      {
        success: true,
        data: newItem,
        message: `${
          validated.entityType && validated.entityType.toLocaleUpperCase()
        } added to wishlist successfully`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.log(error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error },
        { status: 400 }
      );
    }

    console.error("Error adding wishlist item:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add wishlist item" },
      { status: 500 }
    );
  }
}
)

export const PUT = withFullCsrfProtection(
  async (req: NextRequest): Promise<NextResponse> => {
  try {
    const body = await req.json();
    const { action } = body;

    switch (action) {
      case "toggle-alerts": {
        // Toggle alerts for multiple items
        const { itemIds, isAlertOn } = body;

        await db
          .update(wishlistItems)
          .set({
            isAlertOn,
            updatedAt: new Date(),
          })
          .where(inArray(wishlistItems.id, itemIds));

        return NextResponse.json({
          success: true,
          message: `Alerts ${isAlertOn ? "enabled" : "disabled"} for ${
            itemIds.length
          } items`,
        });
      }

      case "move-items": {
        // Move items to different category
        const { itemIds, targetCategoryId, userId } = body;

        // Verify target category belongs to user
        const [targetCategory] = await db
          .select()
          .from(wishlistCategories)
          .where(
            and(
              eq(wishlistCategories.id, targetCategoryId),
              eq(wishlistCategories.userId, userId)
            )
          )
          .limit(1);

        if (!targetCategory) {
          return NextResponse.json(
            { success: false, error: "Target category not found" },
            { status: 404 }
          );
        }

        // Get source categories for count updates
        const items = await db
          .select({ categoryId: wishlistItems.categoryId })
          .from(wishlistItems)
          .where(inArray(wishlistItems.id, itemIds));

        const sourceCategoryIds = [...new Set(items.map((i) => i.categoryId))];

        // Move items
        await db
          .update(wishlistItems)
          .set({
            categoryId: targetCategoryId,
            updatedAt: new Date(),
          })
          .where(inArray(wishlistItems.id, itemIds));

        // Update counts
        for (const categoryId of [...sourceCategoryIds, targetCategoryId]) {
          const [{ count }] = await db
            .select({ count: sql`count(*)` })
            .from(wishlistItems)
            .where(eq(wishlistItems.categoryId, categoryId));

          await db
            .update(wishlistCategories)
            .set({ itemCount: parseInt(count as string) })
            .where(eq(wishlistCategories.id, categoryId));
        }

        return NextResponse.json({
          success: true,
          message: `${itemIds.length} items moved successfully`,
        });
      }

      case "bulk-delete": {
        // Delete multiple items
        const { itemIds } = body;

        // Get categories for count updates
        const items = await db
          .select({ categoryId: wishlistItems.categoryId })
          .from(wishlistItems)
          .where(inArray(wishlistItems.id, itemIds));

        const categoryIds = [...new Set(items.map((i) => i.categoryId))];

        // Delete items
        await db
          .delete(wishlistItems)
          .where(inArray(wishlistItems.id, itemIds));

        // Update counts
        for (const categoryId of categoryIds) {
          const [{ count }] = await db
            .select({ count: sql`count(*)` })
            .from(wishlistItems)
            .where(eq(wishlistItems.categoryId, categoryId));

          await db
            .update(wishlistCategories)
            .set({ itemCount: parseInt(count as string) })
            .where(eq(wishlistCategories.id, categoryId));
        }

        return NextResponse.json({
          success: true,
          message: `${itemIds.length} items removed from wishlist`,
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error in bulk operation:", error);
    return NextResponse.json(
      { success: false, error: "Bulk operation failed" },
      { status: 500 }
    );
  }
})
