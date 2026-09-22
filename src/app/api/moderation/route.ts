// src/app/api/moderation/route.ts

import { db } from "@/db/db";
import { moderationQueue, parts } from "@/db/schema/parts";
import { NextRequest, NextResponse } from "next/server";
import { eq, desc, and, count } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth/auth";

/**
 * GET /api/moderation
 * Fetch all moderation flags with filtering and pagination
 */
export async function GET(req: NextRequest) {
  try {
    /* -----------------------------
     * 1. AUTH CHECK
     * ----------------------------- */
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Optional: Check if user is admin
    // if (session.user.role !== "admin") {
    //   return NextResponse.json(
    //     { success: false, error: "Forbidden - Admin access required" },
    //     { status: 403 }
    //   );
    // }

    /* -----------------------------
     * 2. GET QUERY PARAMS
     * ----------------------------- */
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status") || "review";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "25");
    const offset = (page - 1) * limit;

    /* -----------------------------
     * 3. FETCH MODERATION ITEMS
     * ----------------------------- */
    const items = await db
      .select({
        id: moderationQueue.id,
        partId: moderationQueue.partId,
        partTitle: parts.title,
        partSlug: parts.slug,
        reason: moderationQueue.reason,
        reasonLabel: moderationQueue.reasonLabel,
        severity: moderationQueue.severity,
        notes: moderationQueue.notes,
        status: moderationQueue.status,
        flaggedBy: moderationQueue.flaggedBy,
        flaggedByUserId: moderationQueue.flaggedByUserId,
        flaggedAt: moderationQueue.flaggedAt,
        reviewedBy: moderationQueue.reviewedBy,
        reviewedAt: moderationQueue.reviewedAt,
        reviewNotes: moderationQueue.reviewNotes,
      })
      .from(moderationQueue)
      .leftJoin(parts, eq(moderationQueue.partId, parts.id))
      .where(eq(moderationQueue.status, status))
      .orderBy(desc(moderationQueue.flaggedAt))
      .limit(limit)
      .offset(offset);

    /* -----------------------------
     * 4. GET TOTAL COUNT
     * ----------------------------- */
    const [countResult] = await db
      .select({ count: count() })
      .from(moderationQueue)
      .where(eq(moderationQueue.status, status));

    const totalItems = countResult?.count || 0;
    const totalPages = Math.ceil(totalItems / limit);

    /* -----------------------------
     * 5. TRANSFORM & RETURN DATA
     * ----------------------------- */
    const transformedItems = items.map((item) => ({
      id: item.id,
      partId: item.partId,
      partTitle: item.partTitle || "Unknown Part",
      partSlug: item.partSlug || "",
      reason: item.reason,
      reasonLabel: item.reasonLabel,
      severity: item.severity as "low" | "medium" | "high",
      notes: item.notes || undefined,
      status: item.status,
      flaggedBy: item.flaggedBy,
      flaggedAt: item.flaggedAt.toISOString(),
      reviewedBy: item.reviewedBy || undefined,
      reviewedAt: item.reviewedAt?.toISOString(),
      reviewNotes: item.reviewNotes || undefined,
    }));

    return NextResponse.json({
      success: true,
      data: transformedItems,
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
    console.error("Error fetching moderation queue:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch moderation queue" },
      { status: 500 }
    );
  }
}