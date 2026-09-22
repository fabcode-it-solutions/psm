import { db } from "@/db/db";
import { media } from "@/db/schema/media";
import { withFullCsrfProtection } from "@/libs/security/csrf-full";
import { eq } from "drizzle-orm";
import { unlink } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { join } from "path";
import z from "zod";

export async function GET(
  req: NextRequest
) {
  try {
        const url = new URL(req.url);
    const pathSegments = url.pathname.split("/");
    const id = pathSegments[pathSegments.length - 1];
    const mediaId = parseInt(id);


    const [mediaItem] = await db
      .select()
      .from(media)
      .where(eq(media.id, mediaId))
      .limit(1);

    if (!mediaItem) {
      return NextResponse.json(
        { success: false, error: "Media not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: mediaItem,
    });
  } catch (error) {
    console.error("Error fetching media:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch media" },
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
    const mediaId = parseInt(id);
    const body = await req.json();

    // Check if media exists
    const [existing] = await db
      .select()
      .from(media)
      .where(eq(media.id, mediaId))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Media not found" },
        { status: 404 }
      );
    }

    const updateMediaSchema = z.object({
      entityType: z.string().max(50).optional().nullable(),
      entityId: z.number().int().positive().optional().nullable(),
      title: z.string().max(255).optional(),
      altText: z.string().max(500).optional(),
      caption: z.string().optional(),
      credit: z.string().max(255).optional(),
      folder: z.string().max(255).optional(),
      tags: z.array(z.string()).optional(),
      metadata: z.any().optional(),
      isPublic: z.boolean().optional(),
      isArchived: z.boolean().optional(),
      displayOrder: z.number().int().optional(),
    });

    const validated = updateMediaSchema.parse(body);

    // Update media
    const [updatedMedia] = await db
      .update(media)
      .set({
        ...validated,
        updatedAt: new Date(),
      })
      .where(eq(media.id, mediaId))
      .returning();

    return NextResponse.json({
      success: true,
      data: updatedMedia,
      message: "Media updated successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error },
        { status: 400 }
      );
    }

    console.error("Error updating media:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update media" },
      { status: 500 }
    );
  }
})

export const DELETE = withFullCsrfProtection(async (req: NextRequest): Promise<NextResponse> => {

  try {
                const url = new URL(req.url);
    const pathSegments = url.pathname.split("/");
    const id = pathSegments[pathSegments.length - 1];
    const mediaId = parseInt(id);

    // Get media item
    const [mediaItem] = await db
      .select()
      .from(media)
      .where(eq(media.id, mediaId))
      .limit(1);

    if (!mediaItem) {
      return NextResponse.json(
        { success: false, error: "Media not found" },
        { status: 404 }
      );
    }

    // Delete file from storage if it's a local file
    if (mediaItem.url?.startsWith("/uploads/")) {
      const filePath = join(process.cwd(), "public", mediaItem.url);
      await unlink(filePath).catch(console.error);

      // Also delete thumbnail if exists
      if (mediaItem.url?.startsWith("/uploads/")) {
        const thumbnailPath = join(process.cwd(), "public", mediaItem.url);
        await unlink(thumbnailPath).catch(console.error);
      }
    }

    // Delete media record
    await db.delete(media).where(eq(media.id, mediaId));

    return NextResponse.json({
      success: true,
      message: "Media deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting media:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete media" },
      { status: 500 }
    );
  }
})
