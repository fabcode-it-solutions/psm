import { db } from "@/db/db";
import { wishlistCategories, wishlistItems } from "@/db/schema/wishlist";
import { media } from "@/db/schema/media";

import { builds } from "@/db/schema/builds";
import {
  partCategories,
  partMedia,
  parts,
  productVariants,
} from "@/db/schema/parts";
import { listings } from "@/db/schema/listings";
import { eq, desc, sql, and, ilike } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import { alias } from "drizzle-orm/pg-core";
import {
  carBrands,
  carModels,
  carModelTypes,
  manufacturers,
} from "@/db/schema/default";
import { follows, users } from "@/db/schema/auth";
import { categories } from "@/db/schema/categories";
import { revalidateTag } from "next/cache";
import { seoMeta } from "@/db/schema/seoMeta";
import { SearchResponsePart, SearchResponseUser } from "@/app/api/search/route";
import { withFullCsrfProtection } from "@/libs/security/csrf-full";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const pathSegments = url.pathname.split("/");
    const searchParams = req.nextUrl.searchParams;
    const all = searchParams.get("type") == "all" || false;
    const userId = searchParams.get("userId");
    const id = pathSegments[pathSegments.length - 1];
    const categoryId = id;

    // Fetch category
    const [categoryRow] = await db
      .select({
        category: wishlistCategories,
        seo: seoMeta,
        itemCount: sql<number>`COALESCE(
          (SELECT COUNT(*) 
           FROM ${wishlistItems} 
           WHERE ${wishlistItems.categoryId} = ${wishlistCategories.id}),
          0
        )`.as("itemCount"),
      })
      .from(wishlistCategories)
      .leftJoin(seoMeta, eq(seoMeta.id, wishlistCategories.seo))
      .where(eq(wishlistCategories.slug, categoryId))
      .limit(1);

    if (!categoryRow) {
      return NextResponse.json(
        { success: false, error: "Wishlist category not found" },
        { status: 404 }
      );
    }
    if (all && userId) {
      const [item] = await db
        .select()
        .from(wishlistCategories)
        .where(eq(wishlistCategories.slug, categoryId))
        .limit(1);
      const items = await db
        .select()
        .from(wishlistItems)
        .where(eq(wishlistItems.userId, parseInt(userId)));
      const userData: SearchResponseUser[] = [];
      const partData: SearchResponsePart[] = [];
      await Promise.all(
        items.map(async (item) => {
          if (item.entityId && item.entityType == "part") {
            const manufacturerLogo = alias(media, "manufacturerLogo");
            const data = await db
              .select({
                id: parts.id,
                title: parts.title,
                listed: parts.listed,
                slug: parts.slug,
                isWishlisted: sql<boolean>`
  CASE 
    WHEN COUNT(DISTINCT ${wishlistItems.id}) > 0 
    THEN true 
    ELSE false 
  END
`.as("isWishlisted"),

                price: sql<number>`MAX(${productVariants.price})`.as("price"),
                quantity: sql<number>`MAX(${productVariants.quantity})`.as(
                  "quantity"
                ),
                media: sql<{ id: number; url: string; alt: string }[]>`
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
                manufacturer: sql<{ 
  id: number; 
  name: string; 
  description: string; 
  subTitle: string; 
  status: string; 
  logo: string; 
  alt: string 
}[]>`
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
              .leftJoin(carModels, eq(parts.modelId, carModels.id))
              .leftJoin(carBrands, eq(parts.brandId, carBrands.id))
              .leftJoin(
                manufacturers,
                eq(parts.manufacturerId, manufacturers.id)
              )
              .leftJoin(productVariants, eq(productVariants.partId, parts.id))
              .leftJoin(partMedia, eq(partMedia.partId, parts.id))
              .leftJoin(media, eq(media.id, partMedia.mediaId))
              .leftJoin(partCategories, eq(parts.id, partCategories.partId))
              .leftJoin(
                categories,
                eq(partCategories.categoryId, categories.id)
              )
              .leftJoin(carModelTypes, eq(parts.typeId, carModelTypes.id))
              .leftJoin(
                wishlistItems,
                and(
                  userId ? eq(wishlistItems.partId, parts.id) : sql`false`,
                  userId
                    ? eq(wishlistItems.userId, parseInt(userId))
                    : sql`false`
                )
              )
              .leftJoin(
                manufacturerLogo,
                eq(manufacturers.logoMediaId, manufacturerLogo.id)
              )
              .where(eq(parts.id, item.entityId))
              .groupBy(parts.id);    
            data.map((item) => {
              partData.push({
                listed: item.listed || "",                   
                id: item.id,
                slug: item.slug,
                media:item.media,
                manufacturer:item.manufacturer,
                title: item.title,
                isWishlisted: true,
                price: `${item.price}`,
                quantity: item.quantity,
              });
            });
          }
          if (item.entityId && item.entityType == "user") {
            const followerUser = alias(follows, "followerUser");

            const data = await db
              .select({
                id: users.id,
                username: sql<string>`
      CASE    
        WHEN ${users.username} IS NOT NULL THEN ${users.username}
        WHEN ${users.firstName} IS NOT NULL THEN ${users.firstName}
        ELSE 'Guest'
      END
    `.as("username"),
                profileImage: users.profileImage,
                followersCount: sql<number>`
      (SELECT COUNT(*) FROM ${follows} WHERE ${follows.followingId} = ${users.id})
    `.as("followerCount"),
                followingCount: sql<number>`
      (SELECT COUNT(*) FROM ${follows} WHERE ${follows.followerId} = ${users.id})
    `.as("followingCount"),
                buildsCounts: sql<number>`
      (SELECT COUNT(*) FROM ${builds} WHERE ${builds.userId} = ${users.id})
    `.as("buildsCount"),
                listingCounts: sql<number>`
      (SELECT COUNT(*) FROM ${listings} WHERE ${listings.userId} = ${users.id})
    `.as("listingCounts"),
                followers: sql<string>`
      (
        SELECT COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', u.id,
              'username', CASE                            
                            WHEN u.username IS NOT NULL THEN u.username
                            WHEN u.first_name IS NOT NULL THEN u.first_name
                            ELSE 'Guest'
                          END,
              'profileImage', u.profile_image
            )
          ), '[]'::json
        )
        FROM ${follows} f
        JOIN ${users} u ON u.id = f.follower_id
        WHERE f.following_id = ${users.id}
      )
    `.as("followers"),
              })
              .from(users)
              .leftJoin(followerUser, eq(followerUser.followerId, users.id))
              .leftJoin(follows, eq(follows.followerId, users.id))
              .leftJoin(builds, eq(builds.userId, users.id))
              .where(eq(users.id, item.entityId));
            data.map((item) => {
              userData.push({
                buildsCounts: Number(item.buildsCounts),
                followers: item.followers,
                followersCount: Number(item.followersCount),
                followingCount: Number(item.followingCount),
                listingCounts: Number(item.listingCounts),
                username: item.username,
                id: item.id,
                profileImage: item.profileImage || "",
              });
            });
          }
        })
      );
      return NextResponse.json(
        { success: true, data: item, users: userData, parts:partData, allCount:items.length },
        { status: 200 }
      );
    }
    const items = await db
      .select({
        id: wishlistItems.id,
        userId: wishlistItems.userId,
        categoryId: wishlistItems.categoryId,
        entityType: wishlistItems.entityType,
        entityId: wishlistItems.entityId,
        partId: wishlistItems.partId,
        listingId: wishlistItems.listingId,
        buildId: wishlistItems.buildId,
        isAlertOn: wishlistItems.isAlertOn,
        createdAt: wishlistItems.createdAt,
        updatedAt: wishlistItems.updatedAt,
        bookmarkedUserId: wishlistItems.bookmarkedUserId,
      })
      .from(wishlistItems)
      .where(eq(wishlistItems.categoryId, categoryRow.category.id))
      .orderBy(desc(wishlistItems.createdAt));

    const userData: SearchResponseUser[] = [];
    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        let partData = null;
        let listingData = null;
        let buildData = null;
        if (item.partId) {
          const manufacturerLogo = alias(media, "manufacturerLogo");
          partData = await db
            .select({
              id: parts.id,
              title: parts.title,
              listed: parts.listed,
              slug: parts.slug,

              price: sql<number>`MAX(${productVariants.price})`.as("price"),
              quantity: sql<number>`MAX(${productVariants.quantity})`.as(
                "quantity"
              ),
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
            .leftJoin(carModels, eq(parts.modelId, carModels.id))
            .leftJoin(carBrands, eq(parts.brandId, carBrands.id))
            .leftJoin(manufacturers, eq(parts.manufacturerId, manufacturers.id))
            .leftJoin(productVariants, eq(productVariants.partId, parts.id))
            .leftJoin(partMedia, eq(partMedia.partId, parts.id))
            .leftJoin(media, eq(media.id, partMedia.mediaId))
            .leftJoin(partCategories, eq(parts.id, partCategories.partId))
            .leftJoin(categories, eq(partCategories.categoryId, categories.id))
            .leftJoin(carModelTypes, eq(parts.typeId, carModelTypes.id))
            .leftJoin(
              manufacturerLogo,
              eq(manufacturers.logoMediaId, manufacturerLogo.id)
            )
            .where(eq(parts.id, item.partId));
        }

        if (item.listingId) {
          listingData = await db
            .select()
            .from(listings)
            .where(eq(listings.id, item.listingId))
            .limit(1)
            .then((res) => res[0]);
        }

        if (item.buildId) {
          const imageMedia = alias(media, "imageMedia");
          const logoMedia = alias(media, "logoMedia");
          const modelImageMedia = alias(media, "modelImageMedia");
          const typeLogoMedia = alias(media, "typeLogoMedia");

          buildData = await db
            .select({
              id: builds.id,
              registration: builds.vinNumber,
              brandName: carBrands.name,
              modelName: carModels.name,
              typeName: carModelTypes.name,
              userId: users.id,
              username: sql<string>`CASE 
                WHEN ${users.anonymous} = TRUE THEN ${users.anonymousName}
                WHEN ${users.username} IS NOT NULL THEN ${users.username}
                WHEN ${users.firstName} IS NOT NULL THEN ${users.firstName}
                ELSE 'Guest'
              END`.as("username"),
              profileImage: users.profileImage,
              isVerified: users.isVerified,
              isPrivate: users.firstName,
              brandLogoUrl: logoMedia.url,
              brandLogoAlt: logoMedia.altText,
              brandImageUrl: imageMedia.url,
              brandImageAlt: imageMedia.altText,
              modeImageUrl: modelImageMedia.url,
              modeImageAlt: modelImageMedia.altText,
              typeLogoUrl: typeLogoMedia.url,
              typeLogoAlt: typeLogoMedia.altText,
              itemCount: sql<number>`
                    COALESCE(
                      (SELECT COUNT(*) 
                       FROM ${listings} 
                       WHERE ${listings.buildId} = ${builds.id}),
                      0
                    )
                  `.as("itemCount"),
            })
            .from(builds)
            .leftJoin(carBrands, eq(builds.brandId, carBrands.id))
            .leftJoin(logoMedia, eq(carBrands.logoMediaId, logoMedia.id))
            .leftJoin(imageMedia, eq(carBrands.imageMediaId, imageMedia.id))
            .leftJoin(carModels, eq(carModels.id, builds.modelId))
            .leftJoin(
              modelImageMedia,
              eq(carModels.imageMediaId, modelImageMedia.id)
            )
            .leftJoin(carModelTypes, eq(carModelTypes.id, builds.typeId))
            .leftJoin(
              typeLogoMedia,
              eq(carModelTypes.imageMediaId, typeLogoMedia.id)
            )
            .leftJoin(users, eq(builds.userId, users.id))
            .where(eq(builds.id, item.buildId));
        }
        if (item.bookmarkedUserId) {
          const followerUser = alias(follows, "followerUser");

          const data = await db
            .select({
              id: users.id,
              username: sql<string>`
      CASE    
        WHEN ${users.username} IS NOT NULL THEN ${users.username}
        WHEN ${users.firstName} IS NOT NULL THEN ${users.firstName}
        ELSE 'Guest'
      END
    `.as("username"),
              profileImage: users.profileImage,
              followersCount: sql<number>`
      (SELECT COUNT(*) FROM ${follows} WHERE ${follows.followingId} = ${users.id})
    `.as("followerCount"),
              followingCount: sql<number>`
      (SELECT COUNT(*) FROM ${follows} WHERE ${follows.followerId} = ${users.id})
    `.as("followingCount"),
              buildsCounts: sql<number>`
      (SELECT COUNT(*) FROM ${builds} WHERE ${builds.userId} = ${users.id})
    `.as("buildsCount"),
              listingCounts: sql<number>`
      (SELECT COUNT(*) FROM ${listings} WHERE ${listings.userId} = ${users.id})
    `.as("listingCounts"),
              followers: sql<string>`
      (
        SELECT COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', u.id,
              'username', CASE                            
                            WHEN u.username IS NOT NULL THEN u.username
                            WHEN u.first_name IS NOT NULL THEN u.first_name
                            ELSE 'Guest'
                          END,
              'profileImage', u.profile_image
            )
          ), '[]'::json
        )
        FROM ${follows} f
        JOIN ${users} u ON u.id = f.follower_id
        WHERE f.following_id = ${users.id}
      )
    `.as("followers"),
            })
            .from(users)
            .leftJoin(followerUser, eq(followerUser.followerId, users.id))
            .leftJoin(follows, eq(follows.followerId, users.id))
            .leftJoin(builds, eq(builds.userId, users.id))
            .where(eq(users.id, item.bookmarkedUserId));
          data.map((item) => {
            userData.push({
              buildsCounts: Number(item.buildsCounts),
              followers: item.followers,
              followersCount: Number(item.followersCount),
              followingCount: Number(item.followingCount),
              listingCounts: Number(item.listingCounts),
              username: item.username,
              id: item.id,
              profileImage: item.profileImage || "",
            });
          });
        }
        return {
          parts: partData,
          listings: listingData,
          builds: buildData,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        ...categoryRow.category,
        seo: categoryRow.seo,
        itemCount: categoryRow.itemCount,
        users: userData,
        items: enrichedItems,
      },
    });
  } catch (error) {
    console.error("Error fetching wishlist category:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch wishlist category" },
      { status: 500 }
    );
  }
}

export const PUT = withFullCsrfProtection(
  async (req: NextRequest): Promise<NextResponse> => {
  try {
    const url = new URL(req.url);
    const pathSegments = url.pathname.split("/");
    const id = pathSegments[pathSegments.length - 1];
    const categoryId = parseInt(id);
    const body = await req.json();

    const updateSchema = z.object({
      name: z.string().min(1).max(255).optional(),
      slug: z
        .string()
        .min(1)
        .max(255)
        .regex(/^[a-z0-9-]+$/)
        .optional(),
      description: z.string().optional().nullable(),
      image: z.string().max(512).optional().nullable(),
      isDefault: z.boolean().optional(),
      isPublic: z.boolean().optional(),
      sortOrder: z.number().int().optional(),
      metadata: z.any().optional().nullable(),
    });

    const validated = updateSchema.parse(body);

    const [existing] = await db
      .select()
      .from(wishlistCategories)
      .where(eq(wishlistCategories.id, categoryId))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Wishlist category not found" },
        { status: 404 }
      );
    }

    // Check slug uniqueness if changing
    if (validated.slug && validated.slug !== existing.slug) {
      const [slugConflict] = await db
        .select({ id: wishlistCategories.id })
        .from(wishlistCategories)
        .where(
          and(
            eq(wishlistCategories.userId, existing.userId),
            eq(wishlistCategories.slug, validated.slug)
          )
        )
        .limit(1);

      if (slugConflict) {
        return NextResponse.json(
          { success: false, error: "A wishlist with this slug already exists" },
          { status: 409 }
        );
      }
    }

    // If setting as default, unset other defaults
    if (validated.isDefault) {
      await db
        .update(wishlistCategories)
        .set({ isDefault: false })
        .where(
          and(
            eq(wishlistCategories.userId, existing.userId),
            eq(wishlistCategories.id, categoryId)
          )
        );
    }

    // Update category
    const [updatedCategory] = await db
      .update(wishlistCategories)
      .set({
        ...validated,
        updatedAt: new Date(),
      })
      .where(eq(wishlistCategories.id, categoryId))
      .returning();
    revalidateTag(`wishlist-${updatedCategory.slug}`);
    return NextResponse.json({
      success: true,
      data: updatedCategory,
      message: "Wishlist category updated successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error },
        { status: 400 }
      );
    }

    console.error("Error updating wishlist category:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update wishlist category" },
      { status: 500 }
    );
  }
})
export const DELETE = withFullCsrfProtection(async (req: NextRequest): Promise<NextResponse> => {

  try {
    const url = new URL(req.url);
    const pathSegments = url.pathname.split("/");
    const id = pathSegments[pathSegments.length - 1];
    const categoryId = parseInt(id);

    // Check if category exists
    const [existing] = await db
      .select()
      .from(wishlistCategories)
      .where(eq(wishlistCategories.id, categoryId))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Wishlist category not found" },
        { status: 404 }
      );
    }

    // Delete category (cascade will handle items and alerts)
    await db
      .delete(wishlistCategories)
      .where(eq(wishlistCategories.id, categoryId));
    revalidateTag(`wishlist-${existing.slug}`);
    return NextResponse.json({
      success: true,
      message: "Wishlist category deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting wishlist category:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete wishlist category" },
      { status: 500 }
    );
  }
})
