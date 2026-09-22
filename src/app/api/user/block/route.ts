// app/api/block/route.ts
import { checkRateLimit } from "@/actions/rateLimiter";
import { db } from "@/db/db";
import { users } from "@/db/schema/auth";
import { userBlocks } from "@/db/schema/userBlocks";
import { withFullCsrfProtection } from "@/libs/security/csrf-full";

import { eq, and, like } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const POST = withFullCsrfProtection(
  async (req: NextRequest): Promise<NextResponse> => {

  if (!req.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json(
      { error: "Unsupported content type. Use application/json." },
      { status: 415 }
    );
  }
   const ip = req.headers.get("x-forwarded-for") || "unknown";
              const result = await checkRateLimit(ip, {
                route: "/api/user/block",
                limit: 10,
                windowMs: 1 * 60 * 1000, 
                blockMs: 10 * 60 * 1000, 
              });
            
              if (!result.success) {
                return NextResponse.json({ error: result.message }, { status: 429 });
              }
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { blockerId, blockedId } = body;

  if (!blockerId || !blockedId) {
    return NextResponse.json(
      { error: "Missing required fields: blockerId or blockedId." },
      { status: 400 }
    );
  }

  try {
    // Check if already blocked
    const existing = await db
      .select()
      .from(userBlocks)
      .where(and(eq(userBlocks.blockerUserId, blockerId), eq(userBlocks.blockedUserId, blockedId)))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { success: true, message: "User is already blocked." },
        { status: 200 }
      );
    }

    const result = await db
      .insert(userBlocks)
      .values({ blockerUserId:blockerId, blockedUserId:blockedId })
      .returning();

    return NextResponse.json(
      {
        success: true,
        message: "User blocked successfully.",
        data: result[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Block error:", error);
    return NextResponse.json(
      { error: "Unexpected error. Please try again later." },
      { status: 500 }
    );
  }
}

)

export const DELETE = withFullCsrfProtection(async (req: NextRequest): Promise<NextResponse> => {

  if (!req.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json(
      { error: "Unsupported content type. Use application/json." },
      { status: 415 }
    );
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { blockerId, blockedId } = body;

  if (!blockerId || !blockedId) {
    return NextResponse.json(
      { error: "Missing required fields: blockerId or blockedId." },
      { status: 400 }
    );
  }

  try {
    const deleted = await db
      .delete(userBlocks)
      .where(and(eq(userBlocks.blockerUserId, blockerId), eq(userBlocks.blockedUserId, blockedId)));

    if (deleted.rowCount === 0) {
      return NextResponse.json(
        { message: "No block found to remove." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "User unblocked successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Unblock error:", error);
    return NextResponse.json(
      { error: "Unexpected error. Please try again later." },
      { status: 500 }
    );
  }
})

export async function GET(req: Request) {
  const url = new URL(req.url);
  const blockerId = url.searchParams.get("userId");
  const search = url.searchParams.get("search") || "";
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "10");
  const offset = (page - 1) * limit;

  if (!blockerId) {
    return NextResponse.json(
      { error: "Missing userId in query." },
      { status: 400 }
    );
  }

  try {
    // Build conditions safely
    const conditions = [eq(userBlocks.blockerUserId, parseInt(blockerId))];

    if (search) {
      conditions.push(like(users.username, `%${search}%`));
    }

    const result = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        profileImage: users.profileImage,
      })
      .from(userBlocks)
      .innerJoin(users, eq(users.id, userBlocks.blockedUserId))
      .where(and(...conditions)) 
      .limit(limit)
      .offset(offset);

    return NextResponse.json(
      {
        success: true,
        data: result,
        pagination: { page, limit },
        message: "Blocked users fetched successfully.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("List blocked users error:", error);
    return NextResponse.json(
      { error: "Unexpected error. Please try again later." },
      { status: 500 }
    );
  }
}
