import { db } from "@/db/db";
import { categories } from "@/db/schema/categories";
import { seoMeta } from "@/db/schema/seoMeta";
import { and, eq, sql, asc } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const pathSegments = url.pathname.split("/");
    const id = pathSegments[pathSegments.length - 1];
    const categoryId = id;

    if (!categoryId) {
      return NextResponse.json(
        { success: false, error: "Invalid category ID" },
        { status: 400 }
      );
    }
    const [existing] = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, categoryId))
      .limit(1);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Category not found", status: 404 },
        { status: 404 }
      );
    }
    const theId = existing.id;
    const { searchParams } = new URL(req.url);
    const includeChildren = searchParams.get("includeChildren") === "true";
    const includeParent = searchParams.get("includeParent") === "true";
    const includeSiblings = searchParams.get("includeSiblings") === "true";
    const includeAncestors = searchParams.get("includeAncestors") === "true";
    const includeStats = searchParams.get("includeStats") === "true";
    const parentCategory = alias(categories, "parent_category");
    const [category] = await db
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
        seoMeta: {
          metaTitle: seoMeta.metaTitle,
          metaDescription: seoMeta.metaDescription,
          metaKeywords: seoMeta.metaKeywords,
          canonicalUrl: seoMeta.canonicalUrl,
          ogTitle: seoMeta.ogTitle,
          ogDescription: seoMeta.ogDescription,
          ogImage: seoMeta.ogImage,
        } 
      })
      .from(categories)
      .leftJoin(
        seoMeta,
        and(
          eq(seoMeta.entityType, "category"),
          eq(seoMeta.entityId, categories.id)
        )
      )
      .where(eq(categories.id, theId))
      .limit(1);

    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    // Prepare the response object
    const responseData = { ...category };

    return NextResponse.json(
      {
        success: true,
        data: responseData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching category:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch category. Please try again later.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const pathSegments = url.pathname.split("/");
    const id = pathSegments[pathSegments.length - 1];
    const categoryId = parseInt(id);

    const body = await req.json();

    if (isNaN(categoryId)) {
      return NextResponse.json(
        { success: false, error: "Invalid category ID" },
        { status: 400 }
      );
    }

    const {
      name,
      slug,
      description,
      featuredImage,
      parentId,
      isCustom,
      isActive,
      userId,
      ...seoMetaData
    } = body;

    // Check if category exists
    const [existing] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, categoryId))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    // Prevent circular reference
    if (parentId === categoryId) {
      return NextResponse.json(
        { success: false, error: "Category cannot be its own parent" },
        { status: 400 }
      );
    }

    // Check if slug is unique (if changed)
    if (slug && slug !== existing.slug) {
      const [slugExists] = await db
        .select({ id: categories.id })
        .from(categories)
        .where(
          and(eq(categories.slug, slug), sql`${categories.id} != ${categoryId}`)
        )
        .limit(1);

      if (slugExists) {
        return NextResponse.json(
          {
            success: false,
            error: "A category with this slug already exists",
          },
          { status: 409 }
        );
      }
    }

    // Update category
    const [updatedCategory] = await db
      .update(categories)
      .set({
        name: name || existing.name,
        slug: slug || existing.slug,
        description: description,
        featuredImage,
        parentId: parentId === null ? null : parentId || existing.parentId,
        isCustom: isCustom !== undefined ? isCustom : existing.isCustom,
        isActive: isActive !== undefined ? isActive : existing.isActive,
        userId: userId || existing.userId,
      })
      .where(eq(categories.id, categoryId))
      .returning();

    // Update SEO meta if provided
    if (seoMetaData && Object.keys(seoMetaData).length > 0) {
      await db
        .update(seoMeta)
        .set({
          metaTitle: seoMetaData.metaTitle || name || existing.name,
          metaDescription: seoMetaData.metaDescription || description,
          metaKeywords: seoMetaData.metaKeywords,
          canonicalUrl: seoMetaData.canonicalUrl,
          ogTitle: seoMetaData.ogTitle,
          ogDescription: seoMetaData.ogDescription,
          ogImage: seoMetaData.ogImage,
        })
        .where(
          and(
            eq(seoMeta.entityType, "category"),
            eq(seoMeta.entityId, categoryId)
          )
        );
    }

    return NextResponse.json(
      {
        success: true,
        data: updatedCategory,
        message: "Category updated successfully.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating category:", error);

    if (error instanceof Error && error.message.includes("unique constraint")) {
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
}

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const pathSegments = url.pathname.split("/");
    const id = pathSegments[pathSegments.length - 1];
    const categoryId = parseInt(id);

    if (isNaN(categoryId)) {
      return NextResponse.json(
        { success: false, error: "Invalid category ID" },
        { status: 400 }
      );
    }

    // Check if category exists
    const [existing] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, categoryId))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    // Check if category has children
    const [childrenExist] = await db
      .select({ count: sql`count(*)` })
      .from(categories)
      .where(eq(categories.parentId, categoryId));

    if (parseInt(childrenExist.count as string) > 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Cannot delete category that has child categories. Please delete or reassign children first.",
        },
        { status: 400 }
      );
    }

    // Delete category and related SEO meta
    await db.transaction(async (tx) => {
      // Delete SEO meta
      await tx
        .delete(seoMeta)
        .where(
          and(
            eq(seoMeta.entityType, "category"),
            eq(seoMeta.entityId, categoryId)
          )
        );

      // Delete category
      await tx.delete(categories).where(eq(categories.id, categoryId));
    });

    return NextResponse.json(
      {
        success: true,
        message: "Category deleted successfully.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting category:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete category. Please try again later.",
      },
      { status: 500 }
    );
  }
}
