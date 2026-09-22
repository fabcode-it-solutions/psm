// src/app/api/search/route.ts
import { db } from "@/db/db";
import { follows, users } from "@/db/schema/auth";
import { builds } from "@/db/schema/builds";
import { categories } from "@/db/schema/categories";
import {
  carBrands,
  carModels,
  carModelTypes,
  manufacturers,
} from "@/db/schema/default";
import { listings } from "@/db/schema/listings";
import { media } from "@/db/schema/media";
import {
  partCategories,
  partMedia,
  parts,
  productVariants,
} from "@/db/schema/parts";
import { wishlistItems } from "@/db/schema/wishlist";
import { or, ilike, eq, and, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { NextRequest, NextResponse } from "next/server";

export interface SearchResult {
  id: number;
  title: string;
  subtitle?: string;
  slug?: string;
  type: "brand" | "model" | "type" | "manufacturer" | "part" | "category";
  image?: {
    id: number;
    url: string;
    alt: string;
  };
}
type Manufacturer = {
  id: number;
  alt: string;
  logo: string;
  name: string;
  status: string;
  subTitle: string;
};
type Media = {
  id: number;
  alt: string;
  url: string;
};
export type SearchResponsePart = {
  id: number;
  title: string;
  listed: string;
  slug: string;
  isWishlisted: boolean;
  price: string;
  quantity: number;
  media?: Media[] | null;
  manufacturer?: Manufacturer[] | null;
};
export type SearchResponseUser = {
  id: number;
  username: string;
  profileImage: string;
  followersCount: number;
  followingCount?: number;
  buildsCounts: number;
  listingCounts: number;
  followers: { id: number; username: string; profileImage: string }[] | string;
};
export interface SearchResponse {
  success?: boolean;
  query?: string;
  results?: {
    brands: SearchResult[];
    models: SearchResult[];
    types: SearchResult[];
    manufacturers: SearchResult[];
    parts?: SearchResponsePart[];
    categories: SearchResult[];
    usersData?: SearchResponseUser[];
  };
  totalResults?: number;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const query = searchParams.get("q")?.trim() || "";
    const userId = searchParams.get("userId")?.trim() || "";
    const isSearchPage = searchParams.get("fullPage") === "true";
    const limit = isSearchPage ? 1000 : 5;

    if (!query || query.length < 2) {
      return NextResponse.json({
        success: true,
        query,
        results: {},
        totalResults: 0,
      } as SearchResponse);
    }

    const searchTerm = `%${query}%`;
    const cleanQuery = query.trim();
    const followerUser = alias(follows, "followerUser");
    const manufacturerLogo = alias(media, "manufacturerLogo");
    // Search all entities in parallel
    const [brands, models, types, manufacturer, part, category, usersData] =
      await Promise.all([
        // 1. Search Brands
        (() => {
          const logoMedia = alias(media, "brandLogoMedia");
          return db
            .select({
              id: carBrands.id,
              name: carBrands.name,
              similarity: sql`similarity(${carBrands.name}, ${cleanQuery})`.as(
                "similarity"
              ),
              logo: {
                id: logoMedia.id,
                url: logoMedia.url,
                alt: logoMedia.altText,
              },
            })
            .from(carBrands)
            .leftJoin(logoMedia, eq(carBrands.logoMediaId, logoMedia.id))
            .where(
              sql`(
        LOWER(${carBrands.name}) = LOWER(${cleanQuery}) OR
        ${carBrands.name} ILIKE ${`%${cleanQuery}%`} OR
        similarity(${carBrands.name}, ${cleanQuery}) > 0.1
      )`
            )
            .orderBy(
              sql`
        CASE 
          WHEN LOWER(${carBrands.name}) = LOWER(${cleanQuery}) THEN 1
          WHEN ${carBrands.name} ILIKE ${`%${cleanQuery}%`} THEN 2
          ELSE 3
        END,
        similarity(${carBrands.name}, ${cleanQuery}) DESC,
        LENGTH(${carBrands.name}) ASC
      `
            )
            .limit(limit);
        })(),

        // 2. Search Models
        (() => {
          const imageMedia = alias(media, "modelImageMedia");
          return db
            .select({
              id: carModels.id,
              name: carModels.name,
              brandName: carBrands.name,
              image: {
                id: imageMedia.id,
                url: imageMedia.url,
                alt: imageMedia.altText,
              },
            })
            .from(carModels)
            .leftJoin(carBrands, eq(carModels.brandId, carBrands.id))
            .leftJoin(imageMedia, eq(carModels.imageMediaId, imageMedia.id))
            .where(
              and(
                or(
                  ilike(carModels.name, searchTerm),
                  sql`(
        LOWER(${carBrands.name}) = LOWER(${cleanQuery}) OR
        ${carBrands.name} ILIKE ${`%${cleanQuery}%`} OR
        similarity(${carBrands.name}, ${cleanQuery}) > 0.1
      )`
                ),
                eq(carModels.status, "active")
              )
            )
            .limit(limit);
        })(),

        // 3. Search Types
        (() => {
          const imageMedia = alias(media, "typeImageMedia");
          return db
            .select({
              id: carModelTypes.id,
              name: carModelTypes.name,
              modelName: carModels.name,
              brandName: carBrands.name,
              image: {
                id: imageMedia.id,
                url: imageMedia.url,
                alt: imageMedia.altText,
              },
            })
            .from(carModelTypes)
            .leftJoin(carModels, eq(carModelTypes.modelId, carModels.id))
            .leftJoin(carBrands, eq(carModels.brandId, carBrands.id))
            .leftJoin(imageMedia, eq(carModelTypes.imageMediaId, imageMedia.id))
            .where(
              and(
                or(
                  ilike(carModelTypes.name, searchTerm),
                  ilike(carModels.name, searchTerm),
                  sql`(
        LOWER(${carBrands.name}) = LOWER(${cleanQuery}) OR
        ${carBrands.name} ILIKE ${`%${cleanQuery}%`} OR
        similarity(${carBrands.name}, ${cleanQuery}) > 0.1
      )`
                ),
                eq(carModelTypes.status, "active")
              )
            )
            .limit(limit);
        })(),

        // 4. Search Manufacturers
        (() => {
          const logoMedia = alias(media, "mfgLogoMedia");
          return db
            .select({
              id: manufacturers.id,
              name: manufacturers.name,
              subTitle: manufacturers.subTitle,
              logo: {
                id: logoMedia.id,
                url: logoMedia.url,
                alt: logoMedia.altText,
              },
            })
            .from(manufacturers)
            .leftJoin(logoMedia, eq(manufacturers.logoMediaId, logoMedia.id))
            .where(
              and(
                or(
                  ilike(manufacturers.name, searchTerm),
                  ilike(manufacturers.subTitle, searchTerm)
                ),
                eq(manufacturers.status, "active")
              )
            )
            .limit(limit);
        })(),

        // 5. Search Parts
        db
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
            wishlistItems,
            and(
              userId ? eq(wishlistItems.partId, parts.id) : sql`false`,
              userId ? eq(wishlistItems.userId, parseInt(userId)) : sql`false`
            )
          )
          .leftJoin(
            manufacturerLogo,
            eq(manufacturers.logoMediaId, manufacturerLogo.id)
          )
          .where(
            and(
              or(
                ilike(parts.title, searchTerm),
                sql`(
        LOWER(${carBrands.name}) = LOWER(${cleanQuery}) OR
        ${carBrands.name} ILIKE ${`%${cleanQuery}%`} OR
        similarity(${carBrands.name}, ${cleanQuery}) > 0.1
      )`,
                ilike(carModels.name, searchTerm),
                ilike(parts.partId, searchTerm),
                ilike(manufacturers.name, searchTerm),
                ilike(manufacturers.subTitle, searchTerm),
                ilike(categories.name, searchTerm),
                sql`(
        LOWER(${categories.name}) = LOWER(${cleanQuery}) OR
        ${categories.name} ILIKE ${`%${cleanQuery}%`} OR
        similarity(${categories.name}, ${cleanQuery}) > 0.1
      )`
              ),
              eq(parts.status, "active")
            )
          )
          .groupBy(parts.id)
          .limit(limit),

        // 6. Search categories
        db
          .select({
            id: categories.id,
            name: categories.name,
            featuredImage: categories.featuredImage,
            slug: categories.slug,
          })
          .from(categories)
          .where(
            or(
              ilike(categories.name, searchTerm),
              sql`(
        LOWER(${categories.name}) = LOWER(${cleanQuery}) OR
        ${categories.name} ILIKE ${`%${cleanQuery}%`} OR
        similarity(${categories.name}, ${cleanQuery}) > 0.1
      )`,
              ilike(categories.description, searchTerm)
            )
          )
          .limit(limit),
        // 7. Search Users
        db
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
          .where(
            and(
              or(
                ilike(users.username, searchTerm),
                ilike(users.firstName, searchTerm)
              )
            )
          )
          .limit(limit),
      ]);

    // Format results
    const results = {
      brands: brands.map((brand) => ({
        id: brand.id,
        title: brand.name,
        subtitle: "Car Brand",
        type: "brand" as const,
        image: brand.logo?.url
          ? {
              id: Number(brand.logo.id),
              url: brand.logo.url,
              alt: brand.logo.alt || brand.name,
            }
          : undefined,
      })),

      models: models.map((model) => ({
        id: model.id,
        title: model.name,
        subtitle: `Model - ${model.brandName}`,
        type: "model" as const,
        image: model.image?.url
          ? {
              id: Number(model.image.id),
              url: model.image.url,
              alt: model.image.alt || model.name,
            }
          : undefined,
      })),

      types: types.map((type) => ({
        id: type.id,
        title: type.name,
        subtitle: `Type - ${type.brandName} ${type.modelName}`,
        type: "type" as const,
        image: type.image?.url
          ? {
              id: Number(type.image.id),
              url: type.image.url,
              alt: type.image.alt || type.name,
            }
          : undefined,
      })),

      manufacturers: manufacturer.map((mfg) => ({
        id: mfg.id,
        title: mfg.name,
        subtitle: mfg.subTitle || "Manufacturer",
        type: "manufacturer" as const,
        image: mfg.logo?.url
          ? {
              id: Number(mfg.logo.id),
              url: mfg.logo.url,
              alt: mfg.logo.alt || mfg.name,
            }
          : undefined,
      })),

      parts: part.map((part) => ({
        ...part,
        type: "part" as const,
      })),

      categories: category.map((cat) => ({
        id: cat.id,
        title: cat.name,
        subtitle: "Category",
        slug: cat.slug,
        type: "category" as const,
        image: cat.featuredImage
          ? {
              id: 0,
              url: cat.featuredImage,
              alt: cat.name,
            }
          : undefined,
      })),
      usersData: usersData.map((cat) => ({
        id: cat.id,
        username: cat.username,
        profileImage: cat.profileImage,
        followersCount: Number(cat.followersCount),
        buildsCounts: Number(cat.buildsCounts),
        listingCounts: Number(cat.listingCounts),
        followers: cat.followers,
        type: "user" as const,
      })),
    };

    const totalResults =
      results.brands.length +
      results.models.length +
      results.types.length +
      results.manufacturers.length +
      results.parts.length +
      results.categories.length +
      results.usersData.length;

    return NextResponse.json({
      success: true,
      query,
      results,
      totalResults,
    });
  } catch (error) {
    console.error("Predictive search error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Search failed",
        query: "",
        results: {
          brands: [],
          models: [],
          types: [],
          manufacturers: [],
          parts: [],
          categories: [],
        },
        totalResults: 0,
      },
      { status: 500 }
    );
  }
}
