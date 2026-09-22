// src/app/api/parts/[id]/moderate/route.ts

import { db } from "@/db/db";
import { moderationQueue, parts } from "@/db/schema/parts";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth/auth";
import { eq } from "drizzle-orm";


export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please login first." },
        { status: 401 }
      );
    }
    const { id } = await context.params;
    const partId = Number(id);

    if (!partId || Number.isNaN(partId)) {
      return NextResponse.json(
        { success: false, error: "Invalid part ID" },
        { status: 400 }
      );
    }
    const [part] = await db
      .select()
      .from(parts)
      .where(eq(parts.id, partId))
      .limit(1);

    if (!part) {
      return NextResponse.json(
        { success: false, error: "Part not found" },
        { status: 404 }
      );
    }
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const { reason, reasonLabel, severity, notes } = body;

    // Validate required fields
    if (!reason || !reasonLabel || !severity) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: reason, reasonLabel, severity" },
        { status: 400 }
      );
    }

    // Validate severity
    if (!["low", "medium", "high"].includes(severity)) {
      return NextResponse.json(
        { success: false, error: "Invalid severity. Must be: low, medium, or high" },
        { status: 400 }
      );
    }
    const existingFlag = await db
      .select()
      .from(moderationQueue)
      .where(eq(moderationQueue.partId, partId))
      .limit(1);
    if (existingFlag.length > 0) {
      return NextResponse.json(
        { success: false, error: "You have already flagged this part" },
        { status: 409 }
      );
    }
    await db.insert(moderationQueue).values({
      partId,
      reason,
      reasonLabel,
      severity,
      notes: notes || null,
      status: "pending",
      flaggedBy: session.user.email ?? session.user.name ?? "Unknown User",
      flaggedByUserId: Number(session.user.id),
    });
    await db
      .update(parts)
      .set({
        moderationStatus: "flagged",
        updatedAt: new Date(),
      })
      .where(eq(parts.id, partId));

    return NextResponse.json(
      {
        success: true,
        message: "Part flagged for moderation review",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Moderation insert failed:", error);

    return NextResponse.json(
      { success: false, error: "Failed to flag part" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const partId = Number(id);

    if (!partId || Number.isNaN(partId)) {
      return NextResponse.json(
        { success: false, error: "Invalid part ID" },
        { status: 400 }
      );
    }

    const flags = await db
      .select()
      .from(moderationQueue)
      .where(eq(moderationQueue.partId, partId));

    return NextResponse.json({
      success: true,
      flags,
    });
  } catch (error) {
    console.error("Fetch moderation flags failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch moderation flags" },
      { status: 500 }
    );
  }
}