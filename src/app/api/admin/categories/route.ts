import { db } from "@/db/db";
import { categories } from "@/db/schema/categories";
import { seoMeta } from "@/db/schema/seoMeta";
import { partCategories } from "@/db/schema/parts";
import { withFullCsrfProtection } from "@/libs/security/csrf-full"; 
import {
  and,
  asc,
  desc,
  eq,
  ilike,
  isNotNull,
  isNull,
  or,
  sql,
} from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { NextRequest, NextResponse } from "next/server";

export const POST = withFullCsrfProtection(
  async (req: NextRequest): Promise<NextResponse> => {

  try {
    const body = await req.json();
    const {
      name,
      slug,
      description,
      featuredImage,
      parentId,
      userId,
      isCustom = false,
      isActive = true,
      metaTitle,
      metaDescription,
      metaKeywords,
      ogTitle,
      ogDescription,
      ogImage,
    } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    const existing = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, slug));

    if (existing.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Category with this slug already exists.",
        },
        { status: 400 }
      );
    }
    const [newCategory] = await db
      .insert(categories)
      .values({
        name,
        slug,
        description: description,
        featuredImage,
        parentId,
        isCustom,
        isActive,
        userId,
      })
      .returning();

    await db.insert(seoMeta).values({
      entityType: "category",
      entityId: newCategory.id,
      metaTitle,
      metaDescription,
      metaKeywords,
      ogTitle,
      ogDescription,
      ogImage,
    });

    return NextResponse.json(
      {
        success: true,
        data: newCategory,
        message: "Category created successfully.",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error creating category:", err);

    if (err instanceof Error && err.message.includes("unique constraint")) {
      return NextResponse.json(
        {
          success: false,
          error: "A category with this slug already exists",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create category. Please try again later",
      },
      { status: 500 }
    );
  }
})

export const PUT = withFullCsrfProtection(
  async (req: NextRequest): Promise<NextResponse> => {
  try {
    const body = await req.json();
    const { name, categoryId, description, ...rest } = body;

    const [existing] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, categoryId));

    if (!existing) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    await db
      .update(categories)
      .set({ ...rest, name, description })
      .where(eq(categories.id, categoryId));

    if (name !== existing.name || description !== existing.description) {
      await db
        .update(seoMeta)
        .set({
          metaTitle: name,
          metaDescription: description || "",
        })
        .where(
          and(
            eq(seoMeta.entityType, "category"),
            eq(seoMeta.entityId, categoryId)
          )
        );
    }

    return NextResponse.json(
      { success: true, message: "Category updated successfully." },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error updating category:", err);

    if (err instanceof Error && err.message.includes("unique constraint")) {
      return NextResponse.json(
        {
          success: false,
          error: "A category with this slug already exists",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update category. Please try again later",
      },
      { status: 500 }
    );
  }
})

export const DELETE = withFullCsrfProtection(async (req: NextRequest): Promise<NextResponse> => {

  try {
    const body = await req.json();
    const { categoryId } = body;

    await db.delete(categories).where(eq(categories.id, categoryId));
    await db
      .delete(seoMeta)
      .where(
        and(
          eq(seoMeta.entityType, "category"),
          eq(seoMeta.entityId, categoryId)
        )
      );

    return NextResponse.json(
      { success: true, message: "Category deleted successfully." },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error deleting category:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const offset = (page - 1) * limit;
    const search = searchParams.get("search");
    const parentId = searchParams.get("parentId");
    const isCustom = searchParams.get("isCustom");
    const isActive = searchParams.get("isActive");
    const userId = searchParams.get("userId");
    const includeChildren = searchParams.get("includeChildren") === "true";
    const sortBy = searchParams.get("sortBy") || "name";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build WHERE conditions
    const whereConditions = [];

    if (search) {
      whereConditions.push(
        or(
          ilike(categories.name, `%${search}%`),
          ilike(categories.slug, `%${search}%`)
        )
      );
    }

    if (parentId) {
      if (parentId === "0" || parentId === "null") {
        whereConditions.push(isNull(categories.parentId));
      } else {
        whereConditions.push(eq(categories.parentId, parseInt(parentId)));
      }
    }

    if (isCustom) {
      whereConditions.push(eq(categories.isCustom, isCustom === "true"));
    }

    if (userId) {
      whereConditions.push(eq(categories.userId, parseInt(userId)));
    }

    if (isActive) {
      whereConditions.push(eq(categories.isActive, isActive === "true"));
    }

    // ORDER BY logic
    const validSortFields = {
      name: categories.name,
      slug: categories.slug,
      createdAt: categories.createdAt,
      updatedAt: categories.updatedAt,
    };

    const sortFieldExpr =
      validSortFields[sortBy as keyof typeof validSortFields] ||
      categories.name;
    const orderDirection = sortOrder === "desc" ? desc : asc;

    const orderByClause = orderDirection(sortFieldExpr);

    // Alias must be declared early
    const parent = alias(categories, "parent");

    // Query
    const results = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        description: categories.description,
        featuredImage: categories.featuredImage,
        parentId: categories.parentId,
        isCustom: categories.isCustom,
        isActive: categories.isActive,
        userId: categories.userId,
        createdAt: categories.createdAt,
        updatedAt: categories.updatedAt,
        parentCategory: {
          id: parent.id,
          name: parent.name,
          slug: parent.slug,
        },
        seoMeta: {
          metaTitle: sql<string>`(
        SELECT meta_title FROM ${seoMeta} 
        WHERE entity_type = 'category' AND entity_id = ${categories.id}
        LIMIT 1
      )`.as("metaTitle"),
          metaDescription: sql<string>`(
        SELECT meta_description FROM ${seoMeta} 
        WHERE entity_type = 'category' AND entity_id = ${categories.id}
        LIMIT 1
      )`.as("metaDescription"),
          metaKeywords: sql<string>`(
        SELECT meta_keywords FROM ${seoMeta} 
        WHERE entity_type = 'category' AND entity_id = ${categories.id}
        LIMIT 1
      )`.as("metaKeywords"),
        },
        childrenCount: sql<number>`(
      SELECT COUNT(*)::int FROM ${categories} children 
      WHERE children.parent_id = ${categories.id}
    )`.as("childrenCount"),
        PartsCount: sql<number>`(
      SELECT COUNT(*)::int FROM ${partCategories} 
      WHERE ${partCategories.categoryId} = ${categories.id}
    )`.as("PartsCount"),
      })
      .from(categories)
      .leftJoin(parent, eq(categories.parentId, parent.id))
      .where(whereConditions.length ? and(...whereConditions) : undefined)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);


    // Include children if requested
    let categoriesWithChildren = results;
    if (includeChildren) {
   
      categoriesWithChildren = await Promise.all(
        results.map(async (category) => {
          const children = await db
            .select({
              id: categories.id,
              name: categories.name,
              slug: categories.slug,
              description: categories.description,
              featuredImage: categories.featuredImage,
              parentId: categories.parentId,
              isCustom: categories.isCustom,
              isActive: categories.isActive,
              userId: categories.userId,
              createdAt: categories.createdAt,
            })
            .from(categories)
            .where(eq(categories.parentId, category.id))
            .orderBy(asc(categories.name));

          return {
            ...category,
            children,
          };
        })
      );
    }


    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(categories)
      .where(whereConditions.length ? and(...whereConditions) : undefined);


    const rootCount = await db
      .select()
      .from(categories)
      .where(
        whereConditions.length
          ? and(...whereConditions, isNull(categories.parentId))
          : isNull(categories.parentId)
      );

    const subCount = await db
      .select()
      .from(categories)
      .where(
        whereConditions.length
          ? and(...whereConditions, isNotNull(categories.parentId))
          : isNotNull(categories.parentId)
      );

    const totalCount = Number(count);
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json(
      {
        success: true,
        data: categoriesWithChildren,
        rootCount: rootCount.length,
        subCount: subCount.length,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
        meta: {
          search,
          parentId,
          isCustom,
          isActive,
          userId,
          includeChildren,
          sortBy,
          sortOrder,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch categories. Please try again later.",
      },
      { status: 500 }
    );
  }
}
