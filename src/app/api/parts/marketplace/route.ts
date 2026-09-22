import { db } from "@/db/db";
import { categories } from "@/db/schema/categories";
import { manufacturers } from "@/db/schema/default";
import { media } from "@/db/schema/media";
import { metafieldDefinitions, metafields } from "@/db/schema/metafields";
import {
  optionValues,
  partCategories,
  partMedia,
  parts,
  productOptions,
  productVariants,
} from "@/db/schema/parts";
import { withFullCsrfProtection } from "@/libs/security/csrf-full";
import {
  and,
  desc,
  eq,
  inArray,
  InferInsertModel,
  like,
  or,
  sql,
} from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { NextRequest, NextResponse } from "next/server";
export type InsertMetafield = InferInsertModel<typeof metafields>;

export const POST = withFullCsrfProtection(
  async (req: NextRequest): Promise<NextResponse> => {

  try {
    const body = await req.json();
    const {
      slug,
      page,
      limit,
      status,
      search,
      userId,
      brandId,
      manufacturerId,
      optionsFilter,
      metafieldsFilter,
      listed,
      sortBy,
      sortOrder,
      priceMin,
      priceMax,
    } = body;
    const offset = (page - 1) * limit;
    const whereConditions = [];
    const manufacturerLogo = alias(media, "manufacturerLogo");
    if (status) whereConditions.push(eq(parts.status, status || "active"));
    if (userId) whereConditions.push(eq(parts.userId, parseInt(userId)));
    if (listed) {
      whereConditions.push(eq(parts.listed, listed));
    }
    if (metafieldsFilter?.length) {
      metafieldsFilter.forEach(
        (mf: { definitionId: number; value: string }) => {
          whereConditions.push(
            sql`${parts.id} IN (
          SELECT m.entity_id
          FROM ${metafields} m
          WHERE m.metafield_definition_id = ${mf.definitionId}
          AND m.value_text = ${mf.value} 
          OR m.value_number::text = ${mf.value}
          OR m.value_integer::text = ${mf.value}
          OR m.value_boolean::text = ${mf.value}
          OR m.value_date::text = ${mf.value}
          OR m.value_json @> ${JSON.stringify([mf.value])}::jsonb
        )`
          );
        }
      );
    }

    // --- Product options filter ---
    if (optionsFilter?.length) {
      optionsFilter.forEach((opt: { optionId: number; value: string }) => {
        whereConditions.push(
          sql`${parts.id} IN (
          SELECT po.part_id
          FROM ${productOptions} po
          LEFT JOIN ${optionValues} ov ON ov.option_id = po.id
          WHERE po.id = ${opt.optionId} AND ov.value = ${opt.value}
        )`
        );
      });
    }
    if (search) {
      whereConditions.push(
        or(
          like(parts.title, `%${search}%`),
          like(parts.description, `%${search}%`)
        )
      );
    }
    const [existingSlug] = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, slug))
      .limit(1);
    if (!existingSlug) {
      return NextResponse.json(
        {
          success: false,
          error: "Category not found",
          status: 404,
        },
        { status: 404 }
      );
    }
    const categoryIds: number[] = [existingSlug.id];

    if (existingSlug.parentId === null) {
      const children = await db
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.parentId, existingSlug.id));
      const items = children.map((c) => c.id);
      categoryIds.push(...items);
      whereConditions.push(inArray(partCategories.categoryId, categoryIds));
    } else {
      whereConditions.push(eq(partCategories.categoryId, existingSlug.id));
    }
    if (brandId) {
      whereConditions.push(eq(parts.brandId, parseInt(brandId)));
    }
    if (manufacturerId) {
      whereConditions.push(eq(parts.manufacturerId, parseInt(manufacturerId)));
    }

    if (priceMin != undefined && priceMax != undefined) {
      const min = Number(priceMin);
      const max = Number(priceMax);

      whereConditions.push(
        and(
          sql`${productVariants.price} >= ${min}`,
          sql`${productVariants.price} <= ${max}`
        )
      );
    }
    const query = db
      .select({
        id: parts.id,
        title: parts.title,
        listed: parts.listed,
        slug: parts.slug,
        price: sql<number>`MAX(${productVariants.price})`.as("price"),
        quantity: sql<number>`MAX(${productVariants.quantity})`.as("quantity"),
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
        manufacturer: sql`
          COALESCE(
            json_agg(
              DISTINCT jsonb_build_object(
                  'id', ${manufacturers.id},
    'name', ${manufacturers.name},
    'description', ${manufacturers.description},
    'subTitle', ${manufacturers.subTitle},
    'status', ${manufacturers.status},
    'logo', ${manufacturerLogo.url},
    'alt', ${manufacturerLogo.altText}
              )
            ) FILTER (WHERE ${manufacturers.id} IS NOT NULL),
            '[]'::json
          )
        `.as("manufacturer"),
      })
      .from(parts)
      .leftJoin(productVariants, eq(productVariants.partId, parts.id))
      .leftJoin(partMedia, eq(partMedia.partId, parts.id))
      .leftJoin(media, eq(media.id, partMedia.mediaId))
      .leftJoin(partCategories, eq(parts.id, partCategories.partId))
      .leftJoin(categories, eq(partCategories.categoryId, categories.id))
      .leftJoin(metafields, eq(metafields.entityId, parts.id))
      .leftJoin(
        metafieldDefinitions,
        eq(metafieldDefinitions.id, metafields.metafieldDefinitionId)
      )
      .leftJoin(manufacturers, eq(manufacturers.id, parts.manufacturerId))
      .leftJoin(
        manufacturerLogo,
        eq(manufacturers.logoMediaId, manufacturerLogo.id)
      )
      .leftJoin(productOptions, eq(productOptions.partId, parts.id))
      .leftJoin(optionValues, eq(optionValues.optionId, productOptions.id))
      .where(and(...whereConditions))
      .groupBy(parts.id)
      .orderBy(desc(parts.updatedAt));

    const results = await query;

    const [{ count }] = await db
      .select({ count: sql<number>`count(distinct ${parts.id})` })
      .from(parts)
      .leftJoin(partCategories, eq(parts.id, partCategories.partId))
      .leftJoin(productVariants, eq(productVariants.partId, parts.id))
      .where(and(...whereConditions));

    const totalCount =
      typeof count === "number" ? count : parseInt(count as string);

    return NextResponse.json({
      success: true,
      parts: results,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error creating part:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create part" },
      { status: 500 }
    );
  }
}
)

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const userId = searchParams.get("userId");
    const categoryId = searchParams.get("categoryId");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const offset = (page - 1) * limit;

    const whereConditions = [];

    if (status) whereConditions.push(eq(parts.status, status));
    if (userId) whereConditions.push(eq(parts.userId, parseInt(userId)));
    if (search) {
      whereConditions.push(
        or(
          like(parts.title, `%${search}%`),
          like(parts.description, `%${search}%`)
        )
      );
    }
    if (categoryId) {
      whereConditions.push(eq(partCategories.categoryId, parseInt(categoryId)));
    }

    // Determine sort direction
    // const sortDirection = sortOrder === "asc" ? asc : desc;

    const query = db
      .select({
        part: parts,
        categories: sql`
          COALESCE(
            json_agg(
              DISTINCT jsonb_build_object(
                'id', ${categories.id},
                'name', ${categories.name},
                'slug', ${categories.slug}
              )
            ) FILTER (WHERE ${categories.id} IS NOT NULL),
            '[]'::json
          )
        `.as("categories"),
      })
      .from(parts)
      .leftJoin(partCategories, eq(parts.id, partCategories.partId))
      .leftJoin(categories, eq(partCategories.categoryId, categories.id))
      .where(and(...whereConditions))
      .groupBy(parts.id)
      // .orderBy(sortDirection(parts[sortBy as keyof typeof parts]))
      .limit(limit)
      .offset(offset);

    const results = await query;

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(parts)
      .leftJoin(partCategories, eq(parts.id, partCategories.partId))
      .where(and(...whereConditions));

    const totalCount =
      typeof count === "number" ? count : parseInt(count as string);

    return NextResponse.json({
      success: true,
      data: results,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching parts:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch parts" },
      { status: 500 }
    );
  }
}
