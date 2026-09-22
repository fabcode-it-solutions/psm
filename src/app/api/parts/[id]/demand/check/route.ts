// app/api/parts/[slug]/demand/check/route.ts
import { db } from "@/db/db";
import { demandNotifications, parts } from "@/db/schema/parts";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// GET - Check if user has already requested restock notification
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const pathSegments = url.pathname.split("/");
    const partSlug = pathSegments[pathSegments.length - 3]; // Get slug from URL path
    
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
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

    // Check if user has already requested notification for this part
    const [notification] = await db
      .select()
      .from(demandNotifications)
      .where(
        and(
          eq(demandNotifications.partId, part.id),
          eq(demandNotifications.userId, parseInt(userId)),
          eq(demandNotifications.notified, false) // Only check active notifications
        )
      )
      .limit(1);

    return NextResponse.json({
      success: true,
      hasRequested: !!notification,
      notification: notification ? {
        id: notification.id,
        email: notification.email,
        createdAt: notification.createdAt,
      } : null,
    });
  } catch (error) {
    console.error("Error checking restock status:", error);
    return NextResponse.json(
      { error: "Failed to check restock status" },
      { status: 500 }
    );
  }
}