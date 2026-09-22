import { db } from "@/db/db";
import { wishlistItems, wishlistCategories } from "@/db/schema/wishlist";
import { and, desc, eq, sql } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const pathSegments = url.pathname.split("/");
    const id = pathSegments[pathSegments.length - 1];
    const itemId = parseInt(id);

    // Get item to find category
    const [item] = await db
      .select()
      .from(wishlistItems)
      .where(eq(wishlistItems.id, itemId))
      .limit(1);

    if (!item) {
      return NextResponse.json(
        { success: false, error: "Wishlist item not found" },
        { status: 404 }
      );
    }

    // Delete item
    await db.delete(wishlistItems).where(eq(wishlistItems.id, itemId));

    // Update category item count
   const [updatedCategory] = await db
      .update(wishlistCategories)
      .set({
        itemCount: sql`GREATEST(${wishlistCategories.itemCount} - 1, 0)`,
        updatedAt: new Date(),
      })
      .where(eq(wishlistCategories.id, item.categoryId)).returning();
    revalidateTag(`wishlist-${updatedCategory.slug}`);
    return NextResponse.json({
      success: true,
      message: "Successfully removed from wishlist",
    });
  } catch (error) {
    console.error("Error deleting wishlist item:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete wishlist item" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const pathSegments = url.pathname.split("/");
    const id = pathSegments[pathSegments.length - 1];
    const itemId = parseInt(id);
    const body = await req.json();

    const updateSchema = z.object({
      isAlertOn: z.boolean().optional(),
    });

    const validated = updateSchema.parse(body);

    // Check if item exists
    const [existing] = await db
      .select()
      .from(wishlistItems)
      .where(eq(wishlistItems.id, itemId))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Wishlist item not found" },
        { status: 404 }
      );
    }

    // Update item
    const [updatedItem] = await db
      .update(wishlistItems)
      .set({
        ...validated,
        updatedAt: new Date(),
      })
      .where(eq(wishlistItems.id, itemId))
      .returning();
    revalidateTag(`wishlist-category`);
    return NextResponse.json({
      success: true,
      data: updatedItem,
      message: "Wishlist item updated successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error },
        { status: 400 }
      );
    }

    console.error("Error updating wishlist item:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update wishlist item" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const pathSegments = url.pathname.split("/");
    const id = pathSegments[pathSegments.length - 1];
    const entityId = parseInt(id);
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const entityType = searchParams.get("entityType");

    if (!userId || !entityId || !entityType) {
      return NextResponse.json(
        { success: false, error: "Missing required query parameters" },
        { status: 400 }
      );
    }

    const whereConditions = [];
    if (userId)
      whereConditions.push(eq(wishlistItems.userId, parseInt(userId)));
    if (entityId) whereConditions.push(eq(wishlistItems.entityId, entityId));
    if (entityType)
      whereConditions.push(eq(wishlistItems.entityType, entityType));

    const items = await db
      .select()
      .from(wishlistItems)
      .where(and(...whereConditions))
      .orderBy(desc(wishlistItems.createdAt));

    return NextResponse.json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error("Error fetching wishlist items:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch wishlist items" },
      { status: 500 }
    );
  }
}
