import { db } from "@/db/db";
import { users } from "@/db/schema/auth";
import { categories } from "@/db/schema/categories";
import { media } from "@/db/schema/media";
import { metafieldDefinitions, metafields } from "@/db/schema/metafields";
import {
  proAdditionalDetails,
  partCategories,
  partMedia,
  parts,
  productOptions,
  productVariants,
  optionValues,
} from "@/db/schema/parts";
import { seoMeta } from "@/db/schema/seoMeta";
import { carBrands, carModels, carModelTypes, manufacturers } from "@/db/schema/default";
import { Variant } from "@/types/parts.types";
import { and, eq, InferInsertModel, like, or, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import { v4 as uuidv4 } from "uuid";
import { withFullCsrfProtection } from "@/libs/security/csrf-full";

export type InsertMetafield = InferInsertModel<typeof metafields>;

export const POST = withFullCsrfProtection(
  async (req: NextRequest): Promise<NextResponse> => {
    try {
      const body = await req.json();
      const {
        title,
        slug,
        description,
        status,
        userId,
        listed,
        brandId,
        modelId,
        typeId,
        categoryIds, // This should match your Redux state
        manufacturerId,
        additionalDetails,
        media,
        proMetafields,
        seoMetadata,
        variants,
        options,
        defaultVariant,
        tags,
      } = body;

      if (!userId) {
        return NextResponse.json(
          { success: false, error: "UserId not exists" },
          { status: 409 }
        );
      }

      // Check user role
      const checkUser = await db
        .select({ role: users.role })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (checkUser[0].role != "superAdmin") {
        return NextResponse.json(
          { success: false, error: "Action not allowed" },
          { status: 409 }
        );
      }

      // Check for existing slug
      const [existingSlug] = await db
        .select({ id: parts.id })
        .from(parts)
        .where(eq(parts.slug, slug))
        .limit(1);

      let newslug = uuidv4();
      newslug = existingSlug ? slug + "-" + newslug.slice(0, 6) : slug;

      const result = await db.transaction(async (tx) => {
        // Insert part
        const [newPart] = await tx
          .insert(parts)
          .values({
            title,
            slug: newslug,
            description,
            status,
            userId,
            listed,
            brandId,
            modelId,
            typeId,
            manufacturerId,
            tags,
          })
          .returning();

        // Insert categories - FIXED
        if (categoryIds && Array.isArray(categoryIds) && categoryIds.length > 0) {
          const categoryValues = categoryIds.map((categoryId: number) => ({
            partId: newPart.id,
            categoryId: Number(categoryId), // Ensure it's a number
            createdAt: new Date(),
            updatedAt: new Date(),
          }));

          await tx.insert(partCategories).values(categoryValues);
        }

        // Add additional details
        if (additionalDetails?.length) {
          await tx.insert(proAdditionalDetails).values(
            additionalDetails.map(
              (detail: {
                heading: string;
                displayOrder: number;
                content: string;
              }) => ({
                partId: newPart.id,
                ...detail,
              })
            )
          );
        }

        // Add media
        if (media && media?.length) {
          await tx.insert(partMedia).values(
            media.map((detail: { id: number; order: number }) => ({
              partId: newPart.id,
              mediaId: detail?.id,
              order: detail?.order,
            }))
          );
        }

        // Add options
        if (options && options.length > 0) {
          const insertedOptions = await tx
            .insert(productOptions)
            .values(
              options.map((detail: { name: string }, i: number) => ({
                partId: newPart.id,
                name: detail.name,
                displayOrder: i + 1,
              }))
            )
            .returning({ id: productOptions.id });

          for (let i = 0; i < insertedOptions.length; i++) {
            const option = insertedOptions[i];
            const original = options[i];

            if (original.values?.length) {
              await tx.insert(optionValues).values(
                original.values.map((val: string, j: number) => ({
                  optionId: option.id,
                  value: val,
                  displayOrder: j + 1,
                }))
              );
            }
          }
        }

        // Add variants
        if ((!variants || variants.length === 0) && defaultVariant) {
          await tx.insert(productVariants).values({
            partId: newPart.id,
            title: defaultVariant?.title || "default",
            sku: defaultVariant?.sku,
            barcode: defaultVariant?.barcode,
            option1: "default",
            price: defaultVariant?.price || 0,
            compareAtPrice: defaultVariant?.compareAtPrice,
            quantity: defaultVariant?.quantity,
            weight: defaultVariant?.weight,
            weightUnit: defaultVariant?.weightUnit,
            requiresShipping: defaultVariant?.requiresShipping,
            taxable: defaultVariant?.taxable,
            inventoryTracking: defaultVariant?.inventoryTracking,
            displayOrder: defaultVariant?.displayOrder,
          });
        }

        if (variants && variants.length > 0) {
          await tx.insert(productVariants).values(
            variants.map((detail: Variant) => ({
              partId: newPart.id,
              title: detail?.title || "",
              sku: detail?.sku,
              barcode: detail?.barcode,
              option1: detail?.option1,
              option2: detail?.option2,
              option3: detail?.option3,
              option1Label: detail?.option1Label,
              option2Label: detail?.option2Label,
              option3Label: detail?.option3Label,
              price: detail?.price || 0,
              compareAtPrice: detail?.compareAtPrice,
              quantity: detail?.quantity,
              weight: detail?.weight,
              weightUnit: detail?.weightUnit,
              requiresShipping: detail?.requiresShipping,
              taxable: detail?.taxable,
              inventoryTracking: detail?.inventoryTracking,
              displayOrder: detail?.displayOrder,
            }))
          );
        }

        // Add SEO metadata
        if (seoMetadata) {
          await tx.insert(seoMeta).values({
            ...seoMetadata,
            entityType: "part",
            entityId: newPart.id,
          });
        }

        // Add metafields
        if (proMetafields && proMetafields?.length) {
          for (const field of proMetafields) {
            if (
              field.value === undefined ||
              field.value === null ||
              (typeof field.value === "string" && field.value.trim() === "") ||
              (Array.isArray(field.value) && field.value.length === 0)
            ) {
              continue;
            }

            const [definition] = await tx
              .select()
              .from(metafieldDefinitions)
              .where(eq(metafieldDefinitions.id, field.metafieldDefinitionId))
              .limit(1);

            if (!definition) continue;

            const metafieldData: InsertMetafield = {
              entityType: "part",
              entityId: newPart.id,
              metafieldDefinitionId: field.metafieldDefinitionId,
            };

            // Set value based on type
            switch (definition.type) {
              case "text":
                metafieldData.valueText = field.value;
                break;
              case "number":
                metafieldData.valueNumber = field.value;
                break;
              case "boolean":
                metafieldData.valueBoolean = field.value;
                break;
              case "select":
                metafieldData.valueText = field.value;
                break;
              case "multiselect":
                metafieldData.valueArray = Array.isArray(field.value)
                  ? field.value
                  : [field.value];
                break;
            }

            await tx.insert(metafields).values({
              ...metafieldData,
            });
          }
        }

        return newPart;
      });

      return NextResponse.json(
        { success: true, data: result, message: "Part created successfully" },
        { status: 201 }
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, error: "Validation failed", details: error },
          { status: 400 }
        );
      }

      console.error("Error creating part:", error);
      return NextResponse.json(
        { success: false, error: "Failed to create part" },
        { status: 500 }
      );
    }
  }
);

// GET endpoint - FIXED to properly return categories
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const userId = searchParams.get("userId");
    const categoryId = searchParams.get("categoryId");

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
    if (categoryId && categoryId !== "all") {
      whereConditions.push(eq(partCategories.categoryId, parseInt(categoryId)));
    }

    // Updated query to properly aggregate categories
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
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .groupBy(parts.id)
      .limit(limit)
      .offset(offset);

    const results = await query;

    const [{ count }] = await db
      .select({ count: sql<number>`count(DISTINCT ${parts.id})` })
      .from(parts)
      .leftJoin(partCategories, eq(parts.id, partCategories.partId))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

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