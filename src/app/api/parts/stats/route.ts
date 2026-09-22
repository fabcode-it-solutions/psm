// src/app/api/parts/stats/route.ts
// Stats API for Parts Dashboard

import { db } from "@/db/db";
import {
  parts,
  productVariants,
  partInteractions,
  demandNotifications,
} from "@/db/schema/parts";
import { sql, eq, and, gte } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get total parts count
    const [totalPartsResult] = await db
      .select({ count: sql<number>`COUNT(*)::integer` })
      .from(parts);

    // Get total parts with restock requests
    const [partsWithRequestsResult] = await db
      .select({ count: sql<number>`COUNT(DISTINCT ${partInteractions.partId})::integer` })
      .from(partInteractions)
      .where(
        and(
          eq(partInteractions.interactionType, "restock_request"),
          gte(partInteractions.createdAt, thirtyDaysAgo)
        )
      );

    // Get total restock requests (last 30 days)
    const [totalRequestsResult] = await db
      .select({ count: sql<number>`COUNT(*)::integer` })
      .from(partInteractions)
      .where(
        and(
          eq(partInteractions.interactionType, "restock_request"),
          gte(partInteractions.createdAt, thirtyDaysAgo)
        )
      );

    // Get active subscribers (pending notifications)
    const [activeSubscribersResult] = await db
      .select({ count: sql<number>`COUNT(*)::integer` })
      .from(demandNotifications)
      .where(eq(demandNotifications.notified, false));

   const outOfStockResult = (await db
  .select({ count: sql<number>`COUNT(*)::integer` })
  .from(
    db
      .select({ id: parts.id })
      .from(parts)
      .leftJoin(productVariants, eq(productVariants.partId, parts.id))
      .groupBy(parts.id)
      .having(sql`COALESCE(SUM(${productVariants.quantity}), 0) = 0`)
      .as("out_stock")
  ))[0] || { count: 0 };


  const lowStockResult = (await db
  .select({ count: sql<number>`COUNT(*)::integer` })
  .from(
    db
      .select({ id: parts.id })
      .from(parts)
      .leftJoin(productVariants, eq(productVariants.partId, parts.id))
      .groupBy(parts.id)
      .having(sql`COALESCE(SUM(${productVariants.quantity}), 0) BETWEEN 1 AND 10`)
      .as("low_stock")
  ))[0] || { count: 0 };
const inStockResult = (await db
  .select({ count: sql<number>`COUNT(*)::integer` })
  .from(
    db
      .select({ id: parts.id })
      .from(parts)
      .leftJoin(productVariants, eq(productVariants.partId, parts.id))
      .groupBy(parts.id)
      .having(sql`COALESCE(SUM(${productVariants.quantity}), 0) > 10`)
      .as("in_stock")
  ))[0] || { count: 0 };


    // Get parts by status
    const statusCounts = await db
      .select({
        status: parts.status,
        count: sql<number>`COUNT(*)::integer`,
      })
      .from(parts)
      .groupBy(parts.status);

    return NextResponse.json({
      success: true,
      data: {
        totalParts: Number(totalPartsResult.count || 0),
        partsWithRequests: Number(partsWithRequestsResult.count || 0),
        totalRequests: Number(totalRequestsResult.count || 0),
        activeSubscribers: Number(activeSubscribersResult.count || 0),
        outOfStock: Number(outOfStockResult.count || 0),
        lowStock: Number(lowStockResult.count || 0),
        inStock: Number(inStockResult.count || 0),
        byStatus: statusCounts.reduce((acc, item) => {
          if (item.status) {
            acc[item.status] = Number(item.count);
          }
          return acc;
        }, {} as Record<string, number>),
      },
    });
  } catch (error) {
    console.error("Error fetching parts stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}