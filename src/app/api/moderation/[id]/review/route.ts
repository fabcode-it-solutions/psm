import { db } from "@/db/db";
import { moderationQueue, parts } from "@/db/schema/parts";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { action, adminNotes } = body;

    if (!action || !["approve", "reject", "hide"].includes(action)) {
      return NextResponse.json(
        { success: false, error: "Invalid action" },
        { status: 400 }
      );
    }

    const { id } = await params;
    const moderationId = Number(id);

    if (isNaN(moderationId)) {
      return NextResponse.json(
        { success: false, error: "Invalid moderation ID" },
        { status: 400 }
      );
    }

    const [moderation] = await db
      .select()
      .from(moderationQueue)
      .where(eq(moderationQueue.id, moderationId));

    if (!moderation) {
      return NextResponse.json(
        { success: false, error: "Moderation record not found" },
        { status: 404 }
      );
    }
    const statusMap: Record<string, string> = {
      approve: "approved",    
      reject: "rejected",    
      hide: "hidden",
    };
    const newStatus = statusMap[action];
    await db
      .update(moderationQueue)
      .set({
        status: newStatus,
        reviewedBy: session.user.email || session.user.name || "Admin",
        reviewedByUserId: session.user.id,
        reviewedAt: new Date(),
        reviewNotes: adminNotes || null,
        updatedAt: new Date(),
      })
      .where(eq(moderationQueue.id, moderationId));
    if (action === "approve") {
      await db
        .update(parts)
        .set({ 
          status: "review",
          moderationStatus: "reviewed",
          updatedAt: new Date(),
        })
        .where(eq(parts.id, moderation.partId));
    } else if (action === "reject") {
      await db
        .update(parts)
        .set({ 
          moderationStatus: "rejected", 
          updatedAt: new Date(),
        })
        .where(eq(parts.id, moderation.partId));
    } else if (action === "hide") {
      await db
        .update(parts)
        .set({ 
          status: "archived",
          moderationStatus: "hidden",
          updatedAt: new Date(),
        })
        .where(eq(parts.id, moderation.partId));
    }

    return NextResponse.json({
      success: true,
      message: `Flag ${action}ed successfully`,
      data: {
        moderationId,
        partId: moderation.partId,
        action,
        status: newStatus,
      },
    });
  } catch (error) {
    console.error("Moderation review error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process moderation action" },
      { status: 500 }
    );
  }
}