// src/app/api/parts/admin/route.ts
// ✅ UPDATED WITH moderationStatus

import { db } from "@/db/db";
import { categories } from "@/db/schema/categories";
import { media } from "@/db/schema/media";
import {
  partCategories,
  partMedia,
  parts,
  productVariants,
  partInteractions,
  demandNotifications,
} from "@/db/schema/parts";
import { and, asc, desc, eq, like, or, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");
    const inventoryStatus = searchParams.get("inventoryStatus");
    const categoryId = searchParams.get("categoryId");
    const dateRange = searchParams.get("dateRange");
    const search = searchParams.get("search");
    
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const offset = (page - 1) * limit;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const whereConditions = [];
    
    // Date range filtering
    if (dateRange && dateRange !== "all") {
      let dateCondition;

      switch (dateRange) {
        case "today":
          dateCondition = sql`DATE(${parts.createdAt}) = CURRENT_DATE`;
          break;

        case "week":
          dateCondition = sql`${parts.createdAt} >= DATE_TRUNC('week', CURRENT_DATE) 
                             AND ${parts.createdAt} < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '1 week'`;
          break;

        case "month":
          dateCondition = sql`${parts.createdAt} >= DATE_TRUNC('month', CURRENT_DATE) 
                             AND ${parts.createdAt} < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'`;
          break;

        case "quarter":
          dateCondition = sql`${parts.createdAt} >= DATE_TRUNC('quarter', CURRENT_DATE) 
                             AND ${parts.createdAt} < DATE_TRUNC('quarter', CURRENT_DATE) + INTERVAL '3 months'`;
          break;

        case "year":
          dateCondition = sql`${parts.createdAt} >= DATE_TRUNC('year', CURRENT_DATE) 
                             AND ${parts.createdAt} < DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '1 year'`;
          break;
      }

      if (dateCondition) {
        whereConditions.push(dateCondition);
      }
    }

    // Inventory status filtering
    if (inventoryStatus && inventoryStatus != "all") {
      const totalQuantitySubquery = sql<number>`(
        SELECT COALESCE(SUM(${productVariants.quantity}), 0) 
        FROM ${productVariants} 
        WHERE ${productVariants.partId} = ${parts.id}
      )`;

      switch (inventoryStatus) {
        case "in-stock":
          whereConditions.push(sql`${totalQuantitySubquery} > 0`);
          break;
        case "low-stock":
          whereConditions.push(
            sql`${totalQuantitySubquery} > 0 AND ${totalQuantitySubquery} <= 10`
          );
          break;
        case "out-of-stock":
          whereConditions.push(sql`${totalQuantitySubquery} = 0`);
          break;
      }
    }

    // Other filters
    if (status && status != "all")
      whereConditions.push(eq(parts.status, status));
    if (categoryId && categoryId != "all") {
      whereConditions.push(eq(partCategories.categoryId, parseInt(categoryId)));
    }
    if (search) {
      whereConditions.push(
        or(
          like(parts.title, `%${search}%`),
          like(parts.description, `%${search}%`)
        )
      );
    }

    // Build the main query
    const query = db
      .select({
        title: parts.title,
        updatedAt: parts.updatedAt,
        createdAt: parts.createdAt,
        status: parts.status,
        tags: parts.tags,
        slug: parts.slug,
        id: parts.id,
        userId: parts.userId,
        description: parts.description,
        
        // ✅ ADDED: moderationStatus field
        moderationStatus: parts.moderationStatus,
        
        featuredImage: sql<string>`MIN(${media.url})`,
        featuredImageAlt: sql<string>`MIN(${media.altText})`,
        price: sql<number>`MIN(${productVariants.price})`,
        compareAtPrice: sql<number>`MIN(${productVariants.compareAtPrice})`,
        sku: sql<string>`MIN(${productVariants.sku})`,
        inventory: sql<number>`(
          SELECT COALESCE(SUM(${productVariants.quantity}), 0) 
          FROM ${productVariants} 
          WHERE ${productVariants.partId} = ${parts.id}
        )`,
        category: sql<string>`(
          SELECT STRING_AGG(${categories.name}, ', ')
          FROM ${partCategories}
          LEFT JOIN ${categories} ON ${categories.id} = ${partCategories.categoryId}
          WHERE ${partCategories.partId} = ${parts.id}
          LIMIT 1
        )`,
        inventoryStatus: sql<string>`
          CASE 
            WHEN COALESCE(SUM(${productVariants.quantity}), 0) = 0 THEN 'out-of-stock'
            WHEN COALESCE(SUM(${productVariants.quantity}), 0) <= 10 THEN 'low-stock'
            ELSE 'in-stock'
          END
        `,
        demandScore: parts.demandScore,
        wishlistCount: parts.wishlistCount,
        inquiryCount: parts.inquiryCount,
        viewCount: parts.viewCount,
        
        restockRequestCount: sql<number>`(
          SELECT COUNT(*)::integer 
          FROM ${partInteractions}
          WHERE ${partInteractions.partId} = ${parts.id}
          AND ${partInteractions.interactionType} = 'restock_request'
          AND ${partInteractions.createdAt} >= ${thirtyDaysAgo}
        )`,
        
        subscriberCount: sql<number>`(
          SELECT COUNT(*)::integer 
          FROM ${demandNotifications}
          WHERE ${demandNotifications.partId} = ${parts.id}
          AND ${demandNotifications.notified} = false
        )`,
      })
      .from(parts)
      .leftJoin(partMedia, eq(partMedia.partId, parts.id))
      .leftJoin(partCategories, eq(parts.id, partCategories.partId))
      .leftJoin(categories, eq(partCategories.categoryId, categories.id))
      .leftJoin(productVariants, eq(productVariants.partId, parts.id))
      .leftJoin(media, eq(media.id, partMedia.mediaId))
      .where(and(...whereConditions))
      .groupBy(parts.id);

    const sortDirection = sortOrder === "asc" ? asc : desc;
    
    let orderedQuery;
    switch (sortBy) {
      case "price":
        orderedQuery = query.orderBy(
          sortDirection(sql`MIN(${productVariants.price})`)
        );
        break;
      case "inventory":
        orderedQuery = query.orderBy(
          sortDirection(sql`(
            SELECT COALESCE(SUM(${productVariants.quantity}), 0) 
            FROM ${productVariants} 
            WHERE ${productVariants.partId} = ${parts.id}
          )`)
        );
        break;
      case "title":
        orderedQuery = query.orderBy(sortDirection(parts.title));
        break;
      case "updatedAt":
        orderedQuery = query.orderBy(sortDirection(parts.updatedAt));
        break;
      case "demandScore":
        orderedQuery = query.orderBy(sortDirection(parts.demandScore));
        break;
      case "restockRequestCount":
        orderedQuery = query.orderBy(
          sortDirection(sql`(
            SELECT COUNT(*) 
            FROM ${partInteractions}
            WHERE ${partInteractions.partId} = ${parts.id}
            AND ${partInteractions.interactionType} = 'restock_request'
            AND ${partInteractions.createdAt} >= ${thirtyDaysAgo}
          )`)
        );
        break;
      case "subscriberCount":
        orderedQuery = query.orderBy(
          sortDirection(sql`(
            SELECT COUNT(*) 
            FROM ${demandNotifications}
            WHERE ${demandNotifications.partId} = ${parts.id}
            AND ${demandNotifications.notified} = false
          )`)
        );
        break;
      case "createdAt":
      default:
        orderedQuery = query.orderBy(sortDirection(parts.createdAt));
        break;
    }

    const results = await orderedQuery.limit(limit).offset(offset);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(parts)
      .leftJoin(partCategories, eq(parts.id, partCategories.partId))
      .where(and(...whereConditions));

    const totalCount =
      typeof count === "number" ? count : parseInt(count as string);
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: results.map((part) => ({
        ...part,
        restockRequestCount: Number(part.restockRequestCount || 0),
        subscriberCount: Number(part.subscriberCount || 0),
        demandScore: Number(part.demandScore || 0),
        wishlistCount: Number(part.wishlistCount || 0),
        inquiryCount: Number(part.inquiryCount || 0),
        viewCount: Number(part.viewCount || 0),
        inventory: Number(part.inventory || 0),
        price: Number(part.price || 0),
        compareAtPrice: part.compareAtPrice ? Number(part.compareAtPrice) : null,
        // ✅ Ensure moderationStatus is included in response
        moderationStatus: part.moderationStatus || "clean",
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalCount,
        limit,
        hasNext: page < totalPages,
        hasPrev: page > 1,
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