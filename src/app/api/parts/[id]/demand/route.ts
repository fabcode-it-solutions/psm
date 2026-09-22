// app/api/parts/[id]/demand/route.ts
import { db } from "@/db/db";
import { demandNotifications, partInteractions, parts } from "@/db/schema/parts";

import { eq, and, sql, gte } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// POST - Track interaction (view, wishlist, inquiry, restock_request)
export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const pathSegments = url.pathname.split("/");
    const partSlug = pathSegments[pathSegments.length - 2];

    const body = await req.json();
    const { interactionType, userId, sessionId, email } = body;

    // Validate interaction type
    const validTypes = ["view", "wishlist", "inquiry", "restock_request"];
    if (!interactionType || !validTypes.includes(interactionType)) {
      return NextResponse.json(
        { error: "Valid interaction type is required" },
        { status: 400 }
      );
    }

    // Get part by slug
    const [part] = await db
      .select({ id: parts.id })
      .from(parts)
      .where(eq(parts.slug, partSlug))
      .limit(1);

    if (!part) {
      return NextResponse.json({ error: "Part not found" }, { status: 404 });
    }

    // If it's a restock request, check for duplicates first
    if (interactionType === "restock_request" && email && userId) {
      // Check if user has already requested notification
      const [existingNotification] = await db
        .select()
        .from(demandNotifications)
        .where(
          and(
            eq(demandNotifications.partId, part.id),
            eq(demandNotifications.userId, userId),
            eq(demandNotifications.notified, false)
          )
        )
        .limit(1);

      if (existingNotification) {
        return NextResponse.json({
          success: true,
          message: "You are already registered for restock notifications",
          alreadyRegistered: true,
        });
      }

      // Add to notifications if not already registered
      try {
        await db
          .insert(demandNotifications)
          .values({
            partId: part.id,
            userId,
            email,
            notified: false,
          })
          .onConflictDoNothing();
      } catch (error) {
        console.error("Error adding to notifications:", error);
        return NextResponse.json(
          { error: "Failed to register for notifications" },
          { status: 500 }
        );
      }
    }

    // Record interaction
    await db.insert(partInteractions).values({
      partId: part.id,
      userId: userId || null,
      sessionId: sessionId || null,
      interactionType,
    });

    // Update part demand metrics
    await updatePartDemandMetrics(part.id);

    return NextResponse.json({
      success: true,
      message: "Interaction recorded successfully",
    });
  } catch (error) {
    console.error("Error tracking interaction:", error);
    return NextResponse.json(
      { error: "Failed to track interaction" },
      { status: 500 }
    );
  }
}

// GET - Get demand statistics
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const pathSegments = url.pathname.split("/");
    const partSlug = pathSegments[pathSegments.length - 2];

    const [part] = await db
      .select({
        id: parts.id,
        demandScore: parts.demandScore,
        wishlistCount: parts.wishlistCount,
        inquiryCount: parts.inquiryCount,
        viewCount: parts.viewCount,
        inventory: sql<number>`
          COALESCE(
            (SELECT SUM(quantity) FROM variants WHERE part_id = ${parts.id}),
            0
          )
        `,
      })
      .from(parts)
      .where(eq(parts.slug, partSlug))
      .limit(1);

    if (!part) {
      return NextResponse.json({ error: "Part not found" }, { status: 404 });
    }

    // Get restock request count (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [restockData] = await db
      .select({ count: sql<number>`count(*)` })
      .from(partInteractions)
      .where(
        and(
          eq(partInteractions.partId, part.id),
          eq(partInteractions.interactionType, "restock_request"),
          gte(partInteractions.createdAt, thirtyDaysAgo)
        )
      );

    const restockRequestCount = Number(restockData?.count || 0);

    // Get notification subscribers
    const [subscriberData] = await db
      .select({ count: sql<number>`count(*)` })
      .from(demandNotifications)
      .where(
        and(
          eq(demandNotifications.partId, part.id),
          eq(demandNotifications.notified, false)
        )
      );

    const subscriberCount = Number(subscriberData?.count || 0);

    return NextResponse.json({
      success: true,
      data: {
        demandScore: part.demandScore || 0,
        wishlistCount: part.wishlistCount || 0,
        inquiryCount: part.inquiryCount || 0,
        viewCount: part.viewCount || 0,
        restockRequestCount,
        subscriberCount,
        inventory: Number(part.inventory || 0),
      },
    });
  } catch (error) {
    console.error("Error fetching demand stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch demand statistics" },
      { status: 500 }
    );
  }
}

// Helper function to update part demand metrics
async function updatePartDemandMetrics(partId: number) {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Count recent interactions by type
    const interactionCounts = await db
      .select({
        type: partInteractions.interactionType,
        count: sql<number>`count(*)`,
      })
      .from(partInteractions)
      .where(
        and(
          eq(partInteractions.partId, partId),
          gte(partInteractions.createdAt, thirtyDaysAgo)
        )
      )
      .groupBy(partInteractions.interactionType);

    const metrics = {
      wishlistCount: 0,
      inquiryCount: 0,
      viewCount: 0,
      restockRequestCount: 0,
    };

    interactionCounts.forEach((row) => {
      const count = Number(row.count);
      switch (row.type) {
        case "wishlist":
          metrics.wishlistCount = count;
          break;
        case "inquiry":
          metrics.inquiryCount = count;
          break;
        case "view":
          metrics.viewCount = count;
          break;
        case "restock_request":
          metrics.restockRequestCount = count;
          break;
      }
    });

    // Calculate demand score
    const demandScore = calculateDemandScore(metrics);

    // Update part
    await db
      .update(parts)
      .set({
        demandScore,
        wishlistCount: metrics.wishlistCount,
        inquiryCount: metrics.inquiryCount,
        viewCount: metrics.viewCount,
        updatedAt: new Date(),
      })
      .where(eq(parts.id, partId));
  } catch (error) {
    console.error("Error updating demand metrics:", error);
  }
}

function calculateDemandScore({
  wishlistCount,
  inquiryCount,
  viewCount,
  restockRequestCount,
}: {
  wishlistCount: number;
  inquiryCount: number;
  viewCount: number;
  restockRequestCount: number;
}): number {
  const WEIGHTS = {
    wishlist: 15,
    inquiry: 25,
    view: 1,
    restockRequest: 30,
  };

  let score = 0;
  score += wishlistCount * WEIGHTS.wishlist;
  score += inquiryCount * WEIGHTS.inquiry;
  score += viewCount * WEIGHTS.view;
  score += restockRequestCount * WEIGHTS.restockRequest;

  return Math.min(Math.round(score), 100);
}