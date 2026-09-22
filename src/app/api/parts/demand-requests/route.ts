// src/app/api/parts/demand-requests/route.ts
import { db } from "@/db/db";
import {
  parts,
  demandNotifications,
  partInteractions,
  productVariants,
  partMedia,
} from "@/db/schema/parts";
import { users } from "@/db/schema/auth";
import { media } from "@/db/schema/media";
import { eq, and, desc, sql, count } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { alias } from "drizzle-orm/pg-core";

// GET - Retrieve all parts with demand requests
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "25");
    const sortBy = searchParams.get("sortBy") || "restockCount";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const status = searchParams.get("status") || "all";

    const offset = (page - 1) * limit;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 🔑 Alias parts table (CRITICAL) - Updated to use 'alias' function
    const p = alias(parts, "p");

    // ============================
    // MAIN QUERY
    // ============================
    const partsQuery = db
      .select({
        id: p.id,
        partId: p.partId,
        title: p.title,
        slug: p.slug,
        status: p.status,
        demandScore: p.demandScore,
        wishlistCount: p.wishlistCount,
        inquiryCount: p.inquiryCount,
        viewCount: p.viewCount,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,

        // Inventory - Explicitly qualified outer id
        inventory: sql<number>`(
          SELECT COALESCE(SUM(quantity), 0)
          FROM ${productVariants} pv
          WHERE pv.part_id = "p"."id"
        )`,

        // Price - Explicitly qualified outer id
        price: sql<number>`(
          SELECT price
          FROM ${productVariants} pv
          WHERE pv.part_id = "p"."id"
          ORDER BY pv.display_order
          LIMIT 1
        )`,

        // Featured Image - Explicitly qualified outer id
        featuredImage: sql<string>`(
          SELECT m.url
          FROM ${media} m
          INNER JOIN ${partMedia} pm ON pm.media_id = m.id
          WHERE pm.part_id = "p"."id"
          ORDER BY pm.order
          LIMIT 1
        )`,

        // Restock count (30 days) - Explicitly qualified outer id
        restockCount: sql<number>`(
          SELECT COUNT(*)::integer
          FROM ${partInteractions} pi
          WHERE pi.part_id = "p"."id"
          AND pi.interaction_type = 'restock_request'
          AND pi.created_at >= ${thirtyDaysAgo}
        )`,

        // Pending subscribers - Explicitly qualified outer id
        subscriberCount: sql<number>`(
          SELECT COUNT(*)::integer
          FROM ${demandNotifications} dn
          WHERE dn.part_id = "p"."id"
          AND dn.notified = false
        )`,

        // Last restock request - Explicitly qualified outer id
        lastRestockDate: sql<Date>`(
          SELECT MAX(pi.created_at)
          FROM ${partInteractions} pi
          WHERE pi.part_id = "p"."id"
          AND pi.interaction_type = 'restock_request'
        )`,
      })
      .from(p)
      .groupBy(p.id)  // Added GROUP BY to allow HAVING with non-aggregated selects
      .where(sql`
        EXISTS (
          SELECT 1
          FROM ${partInteractions}
          WHERE ${partInteractions.partId} = ${p.id}
          AND ${partInteractions.interactionType} = 'restock_request'
          AND ${partInteractions.createdAt} >= ${thirtyDaysAgo}
        )
      `);

    // ============================
    // INVENTORY FILTER
    // ============================
    if (status === "out_of_stock") {
      partsQuery.having(sql`
        (
          SELECT COALESCE(SUM(quantity), 0)
          FROM ${productVariants}
          WHERE ${productVariants.partId} = ${p.id}
        ) = 0
      `);
    }

    if (status === "low_stock") {
      partsQuery.having(sql`
        (
          SELECT COALESCE(SUM(quantity), 0)
          FROM ${productVariants}
          WHERE ${productVariants.partId} = ${p.id}
        ) BETWEEN 1 AND 10
      `);
    }

    // ============================
    // SORTING
    // ============================
    const sortColumn =
      sortBy === "restockCount"
        ? sql`(
            SELECT COUNT(*)
            FROM ${partInteractions}
            WHERE ${partInteractions.partId} = ${p.id}
            AND ${partInteractions.interactionType} = 'restock_request'
            AND ${partInteractions.createdAt} >= ${thirtyDaysAgo}
          )`
        : sortBy === "subscriberCount"
        ? sql`(
            SELECT COUNT(*)
            FROM ${demandNotifications}
            WHERE ${demandNotifications.partId} = ${p.id}
            AND ${demandNotifications.notified} = false
          )`
        : sortBy === "inventory"
        ? sql`(
            SELECT COALESCE(SUM(quantity), 0)
            FROM ${productVariants}
            WHERE ${productVariants.partId} = ${p.id}
          )`
        : sortBy === "demandScore"
        ? p.demandScore
        : p.updatedAt;

    partsQuery.orderBy(
      sortOrder === "desc" ? desc(sortColumn) : sortColumn
    );

    // ============================
    // TOTAL COUNT
    // ============================
    const totalCountQuery = await db
      .select({ count: count() })
      .from(p)
      .where(sql`
        EXISTS (
          SELECT 1
          FROM ${partInteractions}
          WHERE ${partInteractions.partId} = ${p.id}
          AND ${partInteractions.interactionType} = 'restock_request'
          AND ${partInteractions.createdAt} >= ${thirtyDaysAgo}
        )
      `);

    const totalItems = Number(totalCountQuery[0]?.count || 0);
    const partsData = await partsQuery.limit(limit).offset(offset);
    const partsWithDetails = await Promise.all(
      partsData.map(async (part) => {
        const subscribers = await db
          .select({
            id: demandNotifications.id,
            email: demandNotifications.email,
            userId: demandNotifications.userId,
            userName: users.firstName,
            createdAt: demandNotifications.createdAt,
          })
          .from(demandNotifications)
          .leftJoin(users, eq(demandNotifications.userId, users.id))
          .where(
            and(
              eq(demandNotifications.partId, part.id),
              eq(demandNotifications.notified, false)
            )
          )
          .orderBy(desc(demandNotifications.createdAt))
          .limit(5);

        return {
          ...part,
          inventory: Number(part.inventory || 0),
          price: Number(part.price || 0),
          restockCount: Number(part.restockCount || 0),
          subscriberCount: Number(part.subscriberCount || 0),
          recentSubscribers: subscribers,
        };
      })
    );

    const totalPages = Math.ceil(totalItems / limit);

    return NextResponse.json({
      success: true,
      data: partsWithDetails,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        limit,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching demand requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch demand requests" },
      { status: 500 }
    );
  }
}
