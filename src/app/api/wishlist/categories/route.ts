// app/api/wishlist/categories/route.ts
import { db } from "@/db/db";
import { media } from "@/db/schema/media";
import { seoMeta } from "@/db/schema/seoMeta";
import { wishlistCategories, wishlistItems } from "@/db/schema/wishlist";
import { withFullCsrfProtection } from "@/libs/security/csrf-full";
import {
  NewWishlistCategory,
  WishlistCategoryWithItems,
} from "@/types/wishlist.types";
import { and, asc, desc, eq, ilike, ne, or, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const createCategorySchema = z.object({
  userId: z.number().int().positive(),
  name: z.string().min(1).max(255),
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().optional().nullable(),
  imageMediaId: z.number().int().nullable(),
  isDefault: z.boolean().optional(),

  sortOrder: z.number().int().optional(),
});

const allowedSortFields = ["sortOrder", "createdAt", "name"] as const;
type SortField = (typeof allowedSortFields)[number];

export const POST = withFullCsrfProtection(
  async (req: NextRequest): Promise<NextResponse> => {

  try {
    const body = await req.json();
    const validated = createCategorySchema.parse(body);

    // Check if slug already exists for this user
    const [existingSlug] = await db
      .select({ id: wishlistCategories.id })
      .from(wishlistCategories)
      .where(
        and(
          eq(wishlistCategories.userId, validated.userId),
          eq(wishlistCategories.slug, validated.slug)
        )
      )
      .limit(1);

    if (existingSlug) {
      return NextResponse.json(
        { success: false, error: "A wishlist with this slug already exists" },
        { status: 409 }
      );
    }

    // If setting as default, unset other defaults
    if (validated.isDefault) {
      await db
        .update(wishlistCategories)
        .set({ isDefault: false })
        .where(eq(wishlistCategories.userId, validated.userId));
    }
    const seoMetaData = await db
      .insert(seoMeta)
      .values({
        entityType: "wishlist-category",
        metaTitle: validated.name,
        metaDescription: validated.description || "",
        ogTitle: validated.name,
        ogDescription: validated.description || "",
      })
      .returning();
    // Create category
    const categoryData: NewWishlistCategory = {
      userId: validated.userId,
      name: validated.name,
      slug: validated.slug,
      description: validated.description,
      imageMediaId: validated.imageMediaId != 0 ? validated.imageMediaId : null,
      isDefault: validated.isDefault ?? false,
      sortOrder: validated.sortOrder ?? 0,
      itemCount: 0,
      seo: seoMetaData[0].id,
    };

    const [newCategory] = await db
      .insert(wishlistCategories)
      .values(categoryData)
      .returning();

    await db
      .update(seoMeta)
      .set({ entityId: newCategory.id })
      .where(eq(seoMeta.id, Number(seoMetaData[0].id)))
      .returning();

    return NextResponse.json(
      {
        success: true,
        data: newCategory,
        message: "Wishlist category created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error },
        { status: 400 }
      );
    }

    console.error("Error creating wishlist category:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create wishlist category" },
      { status: 500 }
    );
  }
})
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const includeItems = searchParams.get("includeItems") === "true";
    const isPublic = searchParams.get("isPublic");
    const search = searchParams.get("search")?.trim();
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    if (Number.isNaN(page) || Number.isNaN(limit) || page < 1 || limit < 1) {
      return NextResponse.json(
        { success: false, error: "Invalid pagination parameters" },
        { status: 400 }
      );
    }

    const offset = (page - 1) * limit;

    const whereConditions = [];

    if (userId) {
      whereConditions.push(eq(wishlistCategories.userId, parseInt(userId, 10)));
    }

    if (isPublic !== null) {
      whereConditions.push(
        eq(wishlistCategories.isPublic, isPublic === "true")
      );
    }

    if (search) {
      whereConditions.push(ilike(wishlistCategories.name, `%${search}%`));
    }

    const sortByParam = searchParams.get("sortBy") || "sortOrder";
    const sortBy: SortField = allowedSortFields.includes(
      sortByParam as SortField
    )
      ? (sortByParam as SortField)
      : "sortOrder";

    const sortOrder = searchParams.get("sortOrder") || "asc";
    const orderByClause =
      sortOrder === "desc"
        ? desc(wishlistCategories[sortBy])
        : asc(wishlistCategories[sortBy]);

    const results = await db
      .select({
        category: wishlistCategories,
        itemCount: sql<number>`
      COALESCE(
        (SELECT COUNT(*) 
         FROM ${wishlistItems} 
         WHERE ${wishlistItems.categoryId} = ${wishlistCategories.id}),
        0
      )
    `.as("itemCount"),
        image: {
          url: media.url,
          alt: media.altText,
        },
      })
      .from(wishlistCategories)
      .leftJoin(media, eq(wishlistCategories.imageMediaId, media.id))
      .where(whereConditions.length ? and(...whereConditions) : undefined)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);
    const [all] = await db
      .select({
        category: wishlistCategories,
        itemCount: sql<number>`
      COALESCE(
        (SELECT COUNT(*) 
         FROM ${wishlistItems} 
         WHERE ${wishlistItems.categoryId} = ${wishlistCategories.id}),
        0
      )
    `.as("itemCount"),
        image: {
          url: media.url,
          alt: media.altText,
        },
      })
      .from(wishlistCategories)
      .leftJoin(media, eq(wishlistCategories.imageMediaId, media.id))
      .where(
        whereConditions.length
          ? and(...whereConditions, eq(wishlistCategories.note, "all"))
          : eq(wishlistCategories.note, "all")
      )
      .orderBy(orderByClause)
      .limit(1);

    for (const result of results) {
      if (result.category.itemCount !== result.itemCount) {
        await db
          .update(wishlistCategories)
          .set({ itemCount: result.itemCount })
          .where(eq(wishlistCategories.id, result.category.id));
      }
    }

    let categoriesWithItems: WishlistCategoryWithItems[] = results.map((r) => ({
      ...r.category,
      itemCount: r.itemCount,
      image: {
        ...r.image,
      },
    }));

    if (includeItems) {
      categoriesWithItems = await Promise.all(
        categoriesWithItems.map(async (category) => {
          const items = await db
            .select()
            .from(wishlistItems)
            .where(eq(wishlistItems.categoryId, category.id))
            .orderBy(desc(wishlistItems.createdAt))
            .limit(10);

          return { ...category, items };
        })
      );
    }

    const [{ count }] = await db
      .select({ count: sql`count(*)` })
      .from(wishlistCategories)
      .where(whereConditions.length ? and(...whereConditions) : undefined);
    const [{ allCount }] = await db
      .select({ allCount: sql`count(*)` })
      .from(wishlistItems)
      .where(eq(wishlistItems.userId, Number(userId)));
    return NextResponse.json({
      success: true,
      items: categoriesWithItems,
      all: {
        ...all.category,
        itemCount: parseInt(allCount as string),
        image: {
          ...all.image,
        },
      },
      allItemCount: parseInt(allCount as string),
      pagination: {
        page,
        limit,
        total: parseInt(count as string, 10),
        totalPages: Math.ceil(parseInt(count as string, 10) / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching wishlist categories:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch wishlist categories" },
      { status: 500 }
    );
  }
}
