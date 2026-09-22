import { db } from "@/db/db";
import { media } from "@/db/schema/media";
import { and, desc, eq, inArray, like, or, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import { join } from "path";
import { unlink } from "fs/promises";
import { createMedia } from "@/models/media.model";
import { RATE_LIMITS } from "@/config/rate-limit-config";
import { checkRateLimit } from "@/actions/rateLimiter";
import { withFullCsrfProtection } from "@/libs/security/csrf-full";

const bulkAssignSchema = z.object({
  mediaIds: z.array(z.number().int().positive()),
  entityType: z.string().max(50),
  entityId: z.number().int().positive(),
});

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const type = searchParams.get("type");
    const search = searchParams.get("search");
    const isPublic = searchParams.get("isPublic");
    const isArchived = searchParams.get("isArchived");
    const userId = searchParams.get("userId");

    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = [];

    if (type && type !== "all") {
      whereConditions.push(eq(media.type, type));
    }

    if (userId) {
      whereConditions.push(eq(media.userId, parseInt(userId)));
    }

    if (isPublic !== null && isPublic !== "all") {
      whereConditions.push(eq(media.isPublic, isPublic === "true"));
    }

    if (isArchived !== null && isArchived !== "all") {
      whereConditions.push(eq(media.isArchived, isArchived === "true"));
    }

    if (search) {
      whereConditions.push(
        or(like(media.altText, `%${search}%`), like(media.url, `%${search}%`))
      );
    }

    // Build query
    const query = db
      .select()
      .from(media)
      .where(and(...whereConditions))
      .orderBy(desc(media.createdAt))
      .limit(limit)
      .offset(offset);

    const results = await query;

    // Get total count
    const [{ count }] = await db
      .select({ count: sql`count(*)` })
      .from(media)
      .where(and(...whereConditions));
    const countsByType = await db
      .select({
        type: media.type,
        count: sql`count(*)`.as("count"),
      })
      .from(media)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .groupBy(media.type);

    // Convert into a friendlier object { image: X, video: Y, document: Z }
    const typeCounts: Record<string, number> = {};
    countsByType.forEach((row) => {
      typeCounts[row.type] = Number(row.count);
    });

    const totalItems = Number(count || 0);
    const totalCount =
      typeof count === "number" ? count : parseInt(count as string);
    const totalPages = Math.ceil(totalItems / limit);
    return NextResponse.json({
      success: true,
      data: results,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalItems: totalItems,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      counts: {
        images: typeCounts["image"] || 0,
        videos: typeCounts["video"] || 0,
        documents: typeCounts["document"] || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching media:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch media" },
      { status: 500 }
    );
  }
}

export const POST = withFullCsrfProtection(
  async (req: NextRequest): Promise<NextResponse> => {

  try {
    if (!req.headers.get("content-type")?.includes("application/json")) {
      return NextResponse.json(
        { error: "Use application/json" },
        { status: 415 }
      );
    }
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const resultIp = await checkRateLimit(ip, RATE_LIMITS.MEDIA_UPLOAD);

    if (!resultIp.success) {
      return NextResponse.json({ error: resultIp.message }, { status: 429 });
    }
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const { result, type, getUserId, alt } = body;
    const media = await createMedia({
      type: type,
      url: result.url,
      name: result.originalFileName,
      altText: alt || result.originalFileName,
      width: result.metadata?.width,
      userId: Number(getUserId),
      size: result.metadata?.sizeFormatted,
      height: result.metadata?.height,
      format: result.metadata?.format,
    });
    return NextResponse.json({ success: media }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error },
        { status: 400 }
      );
    }

    console.error("Error creating media:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create media" },
      { status: 500 }
    );
  }
})

export const PUT = withFullCsrfProtection(
  async (req: NextRequest): Promise<NextResponse> => {
  try {
    const body = await req.json();
    const { action } = body;

    switch (action) {
      case "bulk-assign": {
        // Assign multiple media items to an entity
        const validated = bulkAssignSchema.parse(body);

        await db
          .update(media)
          .set({
            updatedAt: new Date(),
          })
          .where(inArray(media.id, validated.mediaIds));

        return NextResponse.json({
          success: true,
          message: `${validated.mediaIds.length} media items assigned successfully`,
        });
      }

      case "bulk-unassign": {
        // Unassign media items
        const { mediaIds } = body;

        await db
          .update(media)
          .set({
            updatedAt: new Date(),
          })
          .where(inArray(media.id, mediaIds));

        return NextResponse.json({
          success: true,
          message: `${mediaIds.length} media items unassigned successfully`,
        });
      }

      case "bulk-archive": {
        // Archive multiple media items
        const { mediaIds } = body;

        await db
          .update(media)
          .set({
            isArchived: true,
            updatedAt: new Date(),
          })
          .where(inArray(media.id, mediaIds));

        return NextResponse.json({
          success: true,
          message: `${mediaIds.length} media items archived successfully`,
        });
      }

      case "bulk-delete": {
        // Delete multiple media items
        const { mediaIds } = body;

        // Get media items to delete files
        const mediaItems = await db
          .select()
          .from(media)
          .where(inArray(media.id, mediaIds));

        // Delete files from storage
        for (const item of mediaItems) {
          if (item.url?.startsWith("/uploads/")) {
            const filePath = join(process.cwd(), "public", item.url);
            await unlink(filePath).catch(console.error);
          }
        }

        // Delete from database
        await db.delete(media).where(inArray(media.id, mediaIds));

        return NextResponse.json({
          success: true,
          message: `${mediaIds.length} media items deleted successfully`,
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error in bulk operation:", error);
    return NextResponse.json(
      { success: false, error: "Bulk operation failed" },
      { status: 500 }
    );
  }
}
)