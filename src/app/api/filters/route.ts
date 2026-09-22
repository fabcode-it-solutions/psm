import { db } from "@/db/db";
import { categories } from "@/db/schema/categories";
import { carBrands, manufacturers } from "@/db/schema/default";
import { metafieldDefinitions, metafields } from "@/db/schema/metafields";
import {
  partCategories,
  parts,
  productOptions,
  productVariants,
} from "@/db/schema/parts";
import { and, eq, inArray, isNotNull, sql } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const breadCrumb = [
      {
        link: "/marketplaces",
        label: "Marketplaces",
      },
    ];
    const slug = url.searchParams.get("slug");
    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          error: "Slug not provided",
        },
        { status: 400 }
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

    let categoryIds: number[] = [existingSlug.id];

    if (existingSlug.parentId === null) {
      breadCrumb.push({
        label: existingSlug.name,
        link: `/marketplaces/${existingSlug.slug}`,
      });
      const children = await db
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.parentId, existingSlug.id));
      categoryIds = children.map((c) => c.id);
    }
    if (existingSlug.parentId) {
      const [parentCat] = await db
        .select()
        .from(categories)
        .where(eq(categories.id, existingSlug.parentId))
        .limit(1);
      breadCrumb.push(
        {
          label: parentCat.name,
          link: `/marketplaces/${parentCat.slug}`,
        },
        {
          label: existingSlug.name,
          link: `/marketplaces/${parentCat.slug}/${existingSlug.slug}`,
        }
      );
    }
    const [
      brandResult,
      manufacturersResult,
      meta,
      optionsData,
      listedData,
      priceRange,
    ] = await Promise.all([
      db
        .select({
          id: carBrands.id,
          name: carBrands.name,
          count: sql<number>`COUNT(*)`,
        })
        .from(parts)
        .leftJoin(carBrands, eq(parts.brandId, carBrands.id))
        .leftJoin(partCategories, eq(partCategories.partId, parts.id))
        .where(inArray(partCategories.categoryId, categoryIds))
        .groupBy(carBrands.id, carBrands.name),
      db
        .select({
          id: manufacturers.id,
          name: manufacturers.name,
          count: sql<number>`COUNT(*)`,
        })
        .from(parts)
        .leftJoin(manufacturers, eq(parts.manufacturerId, manufacturers.id))
        .leftJoin(partCategories, eq(partCategories.partId, parts.id))
        .where(inArray(partCategories.categoryId, categoryIds))
        .groupBy(manufacturers.id, manufacturers.name),
      db
        .select({
          definitionId: metafieldDefinitions.id,
          name: metafieldDefinitions.name,
          values: sql<string[]>`
      ARRAY(
        SELECT DISTINCT val
        FROM (
          SELECT COALESCE(
            m2.value_text,
            m2.value_number::text,
            m2.value_integer::text,
            m2.value_boolean::text,
            m2.value_date::text
          ) AS val
          FROM metafields m2
          WHERE m2.metafield_definition_id = ${metafieldDefinitions.id}
            AND m2.entity_type = 'part'
            AND COALESCE(
              m2.value_text,
              m2.value_number::text,
              m2.value_integer::text,
              m2.value_boolean::text,
              m2.value_date::text
            ) IS NOT NULL
          UNION
          SELECT jsonb_array_elements_text(m2.value_json) AS val
          FROM metafields m2
          WHERE m2.metafield_definition_id = ${metafieldDefinitions.id}
            AND m2.entity_type = 'part'
            AND m2.value_json IS NOT NULL
        ) AS vals
      )`,
          count: sql<number>`
  (
    SELECT COUNT(DISTINCT p.id)
    FROM parts p
    JOIN metafields m2 ON m2.entity_id = p.id
    WHERE m2.metafield_definition_id = ${metafieldDefinitions.id}
      AND m2.entity_type = 'part'
      AND (
        COALESCE( 
          m2.value_text,
          m2.value_number::text,
          m2.value_integer::text,
          m2.value_boolean::text,
          m2.value_date::text
        ) IS NOT NULL
        OR m2.value_json IS NOT NULL
      )
  )`,
        })
        .from(metafields)
        .leftJoin(
          metafieldDefinitions,
          eq(metafields.metafieldDefinitionId, metafieldDefinitions.id)
        )
        .leftJoin(
          parts,
          and(
            eq(metafields.entityType, "part"),
            eq(metafields.entityId, parts.id)
          )
        )
        .leftJoin(partCategories, eq(partCategories.partId, parts.id))
        .where(
          and(
            inArray(partCategories.categoryId, categoryIds),
            eq(metafields.entityType, "part")
          )
        )
        .groupBy(metafieldDefinitions.id, metafieldDefinitions.name),
      db
        .select({
          name: productOptions.name,
          optionId: sql<number>`MIN(${productOptions.id})`,
          values: sql<string[]>`v.values`,
          count: sql<number>`COUNT(DISTINCT ${productOptions.partId})`,
        })
        .from(productOptions)
        .leftJoin(
          sql`LATERAL (
    SELECT ARRAY_AGG(ov.value ORDER BY ov.display_order) AS values
    FROM option_values ov
    WHERE ov.option_id = ${productOptions.id}
  ) AS v`,
          sql`true`
        )
        .leftJoin(parts, eq(parts.id, productOptions.partId))
        .leftJoin(partCategories, eq(partCategories.partId, parts.id))
        .where(inArray(partCategories.categoryId, categoryIds))
        .groupBy(productOptions.name, sql`v.values`),
      db
        .select({
          name: parts.listed,
          count: sql<number>`COUNT(*)`,
        })
        .from(parts)
        .leftJoin(partCategories, eq(partCategories.partId, parts.id))
        .where(inArray(partCategories.categoryId, categoryIds))
        .groupBy(parts.listed),
      db
        .select({
          min: sql<number>`MIN(${productVariants.price})`,
          max: sql<number>`MAX(${productVariants.price})`,
        })
        .from(parts)
        .leftJoin(partCategories, eq(partCategories.partId, parts.id))
        .where(inArray(partCategories.categoryId, categoryIds))
        .leftJoin(productVariants, eq(parts.id, productVariants.partId)),
    ]);
    revalidateTag(`filter-${slug}`);
    return NextResponse.json({
      success: true,
      data: {
        breadcrumb: breadCrumb,
        brandResult,
        manufacturersResult,
        meta,
        optionsData,
        listedData,
        priceRange,
      },
    });
  } catch (error) {
    console.error("Error fetching part:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch part" },
      { status: 500 }
    );
  }
}
