/* eslint-disable @typescript-eslint/no-explicit-any */
import { v4 as uuidv4 } from "uuid";
export const revalidate = 300;
import { db } from "@/db/db";
import { userOnlineHistory, users } from "@/db/schema/auth";
import { categories } from "@/db/schema/categories";
import {
  carBrands,
  carModels,
  carModelTypes,
  manufacturers,
} from "@/db/schema/default";
import { media } from "@/db/schema/media";
import { metafieldDefinitions, metafields } from "@/db/schema/metafields";
import {
  proAdditionalDetails,
  partCategories,
  parts,
  partMedia,
  productOptions,
  optionValues,
  productVariants,
} from "@/db/schema/parts";
import { seoMeta } from "@/db/schema/seoMeta";
import { and, eq,sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

import z, { number, string } from "zod";
import { withFullCsrfProtection } from "@/libs/security/csrf-full";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const pathSegments = url.pathname.split("/");
    const id = pathSegments[pathSegments.length - 1];
    const partId = id;
    
    if (!partId) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid part ID provided",
        },
        { status: 400 }
      );
    }
    
    const [existingSlug] = await db
      .select({ id: parts.id })
      .from(parts)
      .where(eq(parts.slug, partId))
      .limit(1);
      
    if (!existingSlug) {
      return NextResponse.json(
        {
          success: false,
          error: "Part not found",
          status: 404,
        },
        { status: 404 }
      );
    }
    
    const brandLogo = alias(media, "brandLogo");
    const manufacturerLogo = alias(media, "manufacturerLogo");
    
    const [
      partResult,
      details,
      mediaItems,
      metafieldsData,
      seoMetaData,
      optionsRows,
      variants,
      categoriesData,
    ] = await Promise.all([
      // Main part query
      db
        .select({
          partId: parts.id,
          title: parts.title,
          slug: parts.slug,
          description: parts.description,
          status: parts.status,
          userId: parts.userId,
          listed: parts.listed,
          brandId: parts.brandId,
          modelId: parts.modelId,
          typeId: parts.typeId,
          manufacturerId: parts.manufacturerId,
          tags: parts.tags,
          createdAt: parts.createdAt,
          updatedAt: parts.updatedAt,
          user: {
            id: users.id,
            name: sql<string>`
            CASE 
              WHEN ${users.anonymous} = TRUE THEN ${users.anonymousName}
              WHEN ${users.username} IS NOT NULL THEN ${users.username}
              WHEN ${users.firstName} IS NOT NULL THEN ${users.firstName}
              ELSE 'Guest'
            END
          `.as("username"),
            email: users.email,
            registertedOn: users.createdAt,
            profileImage: users.profileImage,
            notificationId: users.notificationId,
            lastOnline: sql<string>`
              (SELECT 1 FROM ${userOnlineHistory}
WHERE ${userOnlineHistory.userId} = ${users.id}
ORDER BY ${userOnlineHistory.createdAt} DESC)
            `,
          },
          brand: {
            id: carBrands.id,
            name: carBrands.name,
            logo: brandLogo.url,
            alt: brandLogo.altText,
          },
          model: {
            name: carModels.name,
          },
          type: {
            name: carModelTypes.name,
          },
          manufacturer: {
            id: manufacturers.id,
            name: manufacturers.name,
            description: manufacturers.description,
            subTitle: manufacturers.subTitle,
            status: manufacturers.status,
            logo: manufacturerLogo.url,
            alt: manufacturerLogo.altText,
          },
       
        })
        .from(parts)
        .leftJoin(users, eq(parts.userId, users.id))
        .leftJoin(carBrands, eq(parts.brandId, carBrands.id))
        .leftJoin(brandLogo, eq(carBrands.logoMediaId, brandLogo.id))
        .leftJoin(carModels, eq(parts.modelId, carModels.id))
        .leftJoin(carModelTypes, eq(parts.typeId, carModelTypes.id))
        .leftJoin(manufacturers, eq(parts.manufacturerId, manufacturers.id))
        .leftJoin(
          manufacturerLogo,
          eq(manufacturers.logoMediaId, manufacturerLogo.id)
        )
        .where(eq(parts.slug, partId))
        .limit(1),

      // Additional details
      db
        .select()
        .from(proAdditionalDetails)
        .where(eq(proAdditionalDetails.partId, existingSlug.id))
        .orderBy(proAdditionalDetails.displayOrder),

      // Media items
      db
        .select({
          url: media.url,
          alt: media.altText,
          order: partMedia.order,
          id: partMedia.mediaId, // Changed from partMedia.id to partMedia.mediaId
          mediaId: partMedia.mediaId,
        })
        .from(partMedia)
        .where(eq(partMedia.partId, existingSlug.id))
        .leftJoin(media, eq(media.id, partMedia.mediaId))
        .orderBy(partMedia.order),

      // Metafields with definitions
      db
        .select({
          metafield: metafields,
          definition: metafieldDefinitions,
        })
        .from(metafields)
        .innerJoin(
          metafieldDefinitions,
          eq(metafields.metafieldDefinitionId, metafieldDefinitions.id)
        )
        .where(
          and(
            eq(metafields.entityType, "part"),
            eq(metafields.entityId, existingSlug.id)
          )
        ),

      // SEO meta data
      db
        .select()
        .from(seoMeta)
        .where(
          and(
            eq(seoMeta.entityType, "part"),
            eq(seoMeta.entityId, existingSlug.id)
          )
        )
        .limit(1),

      // Product options and values
      db
        .select({
          optionId: productOptions.id,
          optionName: productOptions.name,
          valueId: optionValues.id,
          value: optionValues.value,
        })
        .from(productOptions)
        .leftJoin(optionValues, eq(optionValues.optionId, productOptions.id))
        .where(eq(productOptions.partId, existingSlug.id)),

      // Product variants
      db
        .select()
        .from(productVariants)
        .where(eq(productVariants.partId, existingSlug.id)),

      // Categories - THIS IS THE KEY QUERY
      db
        .select({
          name: categories.name,
          slug: categories.slug,
          id: categories.id,
        })
        .from(partCategories)
        .leftJoin(categories, eq(categories.id, partCategories.categoryId))
        .where(eq(partCategories.partId, existingSlug.id)),
    ]);

    // Check if part exists
    if (!partResult || partResult.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Part not found",
          status: 404,
        },
        { status: 404 }
      );
    }

    const part = partResult[0];
    
 const optionMap = new Map<
  number,
  {
    id: number;
    name: string;
    values: { id: number; value: string }[];
  }
>();


    for (const row of optionsRows) {
      if (!optionMap.has(row.optionId)) {
        optionMap.set(row.optionId, {
          id: row.optionId,
          name: row.optionName,
          values: [],
        });
      }
      if (row.valueId) {
        optionMap
          .get(row.optionId)!
          .values.push({ id: row.valueId, value: row.value || "" });
      }
    }

    const options = Array.from(optionMap.values());
    
    // Format metafields
    const formattedMetafields = metafieldsData.map(
      ({ metafield, definition }) => {
        let value;
        switch (definition.type) {
          case "text":
          case "rich_text":
          case "url":
          case "email":
          case "phone":
          case "color":
            value = metafield.valueText;
            break;
          case "number":
          case "decimal":
            value = metafield.valueNumber;
            break;
          case "integer":
            value = metafield.valueInteger;
            break;
          case "boolean":
            value = metafield.valueBoolean;
            break;
          case "date":
          case "datetime":
            value = metafield.valueDate;
            break;
          case "select":
          case "multiselect":
            value = metafield.valueArray;
            break;
        }

        return {
          id: metafield.id,
          entityType: metafield.entityType,
          name: definition.name,
          key: definition.key,
          metafieldDefinitionId: definition.id,
          namespace: definition.namespace,
          value,
        };
      }
    );
    
    // Build breadcrumb
    const breadcrumb = [
      {
        label: "Home",
        link: "/",
      },
      ...categoriesData.map(cat => ({
        label: cat.name,
        slug: cat.slug,
        id: cat.id,
      })),
      {
        label: part.manufacturer.name,
        id: part.manufacturer.id,
      },
      {
        label: part.title,
        id: partId,
      },
    ];

    // **KEY FIX**: Extract categoryIds array from categoriesData
    const categoryIds = categoriesData
      .filter(cat => cat.id !== null)
      .map(cat => cat.id);

    // Return complete part data with categoryIds included
    return NextResponse.json({
      success: true,
      data: {
        part: {
          ...part,
          categoryIds, // ← THIS IS THE FIX
        },
        categories: categoriesData,
        additionalDetails: details,
        media: mediaItems,
        metafields: formattedMetafields,
        seo: seoMetaData[0],
        options,
        variants,
        breadcrumb,
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

export const DELETE = withFullCsrfProtection(async (req: NextRequest): Promise<NextResponse> => {

  try {
    const url = new URL(req.url);
    const pathSegments = url.pathname.split("/");
    const id = pathSegments[pathSegments.length - 1];
    const partId = parseInt(id);
    if (!partId) {
      return NextResponse.json(
        {
          error: "Part Id is required",
        },
        { status: 400 }
      );
    }
    await db.delete(parts).where(eq(parts.id, partId));
    await db
      .delete(seoMeta)
      .where(and(eq(seoMeta.entityId, partId), eq(seoMeta.entityType, "part")));
    await db
      .delete(metafields)
      .where(
        and(eq(metafields.entityId, partId), eq(metafields.entityType, "part"))
      );

    return NextResponse.json(
      {
        success: true,
        message: "Part deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting media:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete media" },
      { status: 500 }
    );
  }
})








// File: src/app/api/parts/[id]/route.ts
// PUT endpoint - FIXED to properly save inventory/quantity

export const PUT = withFullCsrfProtection(
  async (req: NextRequest): Promise<NextResponse> => {
    try {
      const url = new URL(req.url);
      const pathSegments = url.pathname.split("/");
      const partSlug = pathSegments[pathSegments.length - 1];
      
      if (!partSlug) {
        return NextResponse.json(
          { error: "Part slug is required" },
          { status: 400 }
        );
      }

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
        categoryIds,
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

      // Check user permissions
      const checkUser = await db
        .select({ role: users.role })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!checkUser[0] || checkUser[0].role !== "superAdmin") {
        return NextResponse.json(
          { success: false, error: "Action not allowed" },
          { status: 409 }
        );
      }

      // Get existing part by slug
      const [existingPart] = await db
        .select()
        .from(parts)
        .where(eq(parts.slug, partSlug))
        .limit(1);

      if (!existingPart) {
        return NextResponse.json(
          { success: false, error: "Part not found" },
          { status: 404 }
        );
      }

      // Handle slug uniqueness
      let newSlug = existingPart.slug;
      if (slug && slug !== existingPart.slug) {
        const [existingSlugPart] = await db
          .select({ id: parts.id })
          .from(parts)
          .where(eq(parts.slug, slug))
          .limit(1);

        if (existingSlugPart) {
          newSlug = `${slug}-${uuidv4().slice(0, 6)}`;
        } else {
          newSlug = slug;
        }
      }

      // Start transaction
      const result = await db.transaction(async (tx) => {
        // Update main part
        const updateData: any = {};
        if (title !== undefined) updateData.title = title;
        if (slug !== undefined) updateData.slug = newSlug;
        if (description !== undefined) updateData.description = description;
        if (status !== undefined) updateData.status = status;
        if (listed !== undefined) updateData.listed = listed;
        if (brandId !== undefined) updateData.brandId = brandId;
        if (modelId !== undefined) updateData.modelId = modelId;
        if (typeId !== undefined) updateData.typeId = typeId;
        if (manufacturerId !== undefined) updateData.manufacturerId = manufacturerId;
        if (tags !== undefined) updateData.tags = tags;
        updateData.updatedAt = new Date();

        let updatedPart;
        if (Object.keys(updateData).length > 0) {
          [updatedPart] = await tx
            .update(parts)
            .set(updateData)
            .where(eq(parts.id, existingPart.id))
            .returning();
        } else {
          updatedPart = existingPart;
        }

        // Categories
        if (categoryIds !== undefined) {
          await tx
            .delete(partCategories)
            .where(eq(partCategories.partId, existingPart.id));
          
          if (categoryIds.length) {
            await tx.insert(partCategories).values(
              categoryIds.map((categoryId: number) => ({
                partId: existingPart.id,
                categoryId,
              }))
            );
          }
        }

        // Additional Details
        if (additionalDetails !== undefined) {
          await tx
            .delete(proAdditionalDetails)
            .where(eq(proAdditionalDetails.partId, existingPart.id));
          
          if (additionalDetails.length) {
            await tx.insert(proAdditionalDetails).values(
              additionalDetails.map((d: any) => ({
                partId: existingPart.id,
                ...d,
              }))
            );
          }
        }

        // Media
        if (media !== undefined) {
          await tx
            .delete(partMedia)
            .where(eq(partMedia.partId, existingPart.id));
          
          if (media.length) {
            await tx.insert(partMedia).values(
              media.map((m: any) => ({
                partId: existingPart.id,
                mediaId: m.id,
                order: m.order,
              }))
            );
          }
        }

        // Options
        if (options !== undefined) {
          const existingOptions = await tx
            .select({ id: productOptions.id })
            .from(productOptions)
            .where(eq(productOptions.partId, existingPart.id));

          for (const opt of existingOptions) {
            await tx
              .delete(optionValues)
              .where(eq(optionValues.optionId, opt.id));
          }
          
          await tx
            .delete(productOptions)
            .where(eq(productOptions.partId, existingPart.id));

          if (options.length) {
            const insertedOptions = await tx
              .insert(productOptions)
              .values(
                options.map((o: any, i: number) => ({
                  partId: existingPart.id,
                  name: o.name,
                  displayOrder: i + 1,
                }))
              )
              .returning({ id: productOptions.id });

            for (let i = 0; i < insertedOptions.length; i++) {
              const option = insertedOptions[i];
              const original = options[i];
              
              if (original.values?.length) {
                await tx.insert(optionValues).values(
                  original.values.map((v: string, j: number) => ({
                    optionId: option.id,
                    value: v,
                    displayOrder: j + 1,
                  }))
                );
              }
            }
          }
        }
        if (variants !== undefined || defaultVariant !== undefined) {

          await tx
            .delete(productVariants)
            .where(eq(productVariants.partId, existingPart.id));

          // Insert default variant if no variants
          if ((!variants || variants.length === 0) && defaultVariant) {
            await tx.insert(productVariants).values({
              partId: existingPart.id,
              title: defaultVariant.title || "default",
              sku: defaultVariant.sku || null,
              barcode: defaultVariant.barcode || null,
              option1: "default",
              option1Label: null,
              option2: null,
              option2Label: null,
              option3: null,
              option3Label: null,
              price: defaultVariant.price || 0,
              compareAtPrice: defaultVariant.compareAtPrice || null,
              quantity: defaultVariant.quantity || 0, 
              weight: defaultVariant.weight || null,
              weightUnit: defaultVariant.weightUnit || "kg",
              requiresShipping: defaultVariant.requiresShipping ?? true,
              taxable: defaultVariant.taxable ?? true,
              inventoryTracking: defaultVariant.inventoryTracking ?? true,
              displayOrder: 0,
            });
          }

          // Insert multiple variants
          if (variants && variants.length) {
            const variantValues = variants.map((v: any, index: number) => ({
              partId: existingPart.id,
              title: v.title || "",
              sku: v.sku || null,
              barcode: v.barcode || null,
              option1: v.option1 || null,
              option1Label: v.option1Label || null,
              option2: v.option2 || null,
              option2Label: v.option2Label || null,
              option3: v.option3 || null,
              option3Label: v.option3Label || null,
              price: v.price || 0,
              compareAtPrice: v.compareAtPrice || null,
              quantity: v.quantity || 0, 
              weight: v.weight || null,
              weightUnit: v.weightUnit || "kg",
              requiresShipping: v.requiresShipping ?? true,
              taxable: v.taxable ?? true,
              inventoryTracking: v.inventoryTracking ?? true,
              displayOrder: index,
            }));

            await tx.insert(productVariants).values(variantValues);
          }
        }

        // SEO Metadata
        if (seoMetadata !== undefined) {
          // Clean metadata to avoid timestamp issues
          const cleanSeoMetadata: any = {};
          
          const allowedFields = [
            'metaTitle',
            'metaDescription',
            'metaKeywords',
            'ogTitle',
            'ogDescription',
            'ogImage',
            'canonicalUrl',
            'robots',
            'structuredData',
          ];

          allowedFields.forEach((field) => {
            if (seoMetadata[field] !== undefined) {
              cleanSeoMetadata[field] = seoMetadata[field];
            }
          });

          const [existingSeo] = await tx
            .select()
            .from(seoMeta)
            .where(
              and(
                eq(seoMeta.entityType, "part"),
                eq(seoMeta.entityId, existingPart.id)
              )
            )
            .limit(1);

          if (existingSeo) {
            await tx
              .update(seoMeta)
              .set({
                ...cleanSeoMetadata,
                updatedAt: new Date(),
              })
              .where(eq(seoMeta.id, existingSeo.id));
          } else {
            await tx.insert(seoMeta).values({
              ...cleanSeoMetadata,
              entityType: "part",
              entityId: existingPart.id,
            });
          }
        }

        // Metafields
        if (proMetafields !== undefined) {
          await tx
            .delete(metafields)
            .where(
              and(
                eq(metafields.entityType, "part"),
                eq(metafields.entityId, existingPart.id)
              )
            );

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

            const metafieldData: any = {
              entityType: "part",
              entityId: existingPart.id,
              metafieldDefinitionId: field.metafieldDefinitionId,
            };

            if (definition.type === "text") metafieldData.valueText = field.value;
            if (definition.type === "number") metafieldData.valueNumber = field.value;
            if (definition.type === "boolean") metafieldData.valueBoolean = field.value;
            if (definition.type === "select") metafieldData.valueText = field.value;
            if (definition.type === "multiselect") {
              metafieldData.valueArray = Array.isArray(field.value)
                ? field.value
                : [field.value];
            }

            await tx.insert(metafields).values(metafieldData);
          }
        }

        return updatedPart;
      });

      revalidateTag(`part-${existingPart.slug}`);

      return NextResponse.json(
        {
          success: true,
          data: result,
          message: "Part updated successfully",
        },
        { status: 200 }
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: "Validation failed",
            details: error.issues,
          },
          { status: 400 }
        );
      }

      console.error("Error updating part:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to update part",
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 500 }
      );
    }
  }
);
