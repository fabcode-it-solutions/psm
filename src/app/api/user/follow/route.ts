import { checkRateLimit } from "@/actions/rateLimiter";
import { db } from "@/db/db";
import { follows, users } from "@/db/schema/auth";
import { withFullCsrfProtection } from "@/libs/security/csrf-full";
import { and, eq, sql } from "drizzle-orm";
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
                  route: "/api/user/follow",
                  limit: 26,
                  windowMs: 5 * 60 * 1000, 
                  blockMs: 10 * 60 * 1000, 
                });
              
                if (!result.success) {
                  return NextResponse.json({ error: result.message }, { status: 429 });
                }
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { followerId, followingId } = body;
  if (!followerId || !followingId) {
    return NextResponse.json(
      { error: "Missing required fields: userId or followingId." },
      { status: 400 }
    );
  }

  try {
    const existingFollow = await db
      .select()
      .from(follows)
      .where(
        and(
          eq(follows.followerId, followerId),
          eq(follows.followingId, followingId)
        )
      )
      .limit(1);

    if (existingFollow.length > 0) {
      return NextResponse.json(
        { success: true, message: "Already following this user." },
        { status: 200 }
      );
    }

    const result = await db
      .insert(follows)
      .values({
        followerId: followerId,
        followingId,
      })
      .returning();

    if (!result || result.length === 0) {
      return NextResponse.json(
        { error: "Failed to follow user. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Successfully followed the user.",
        data: result[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Follow error:", error);
    return NextResponse.json(
      { error: "Unexpected error. Please try again later." },
      { status: 500 }
    );
  }
})

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

  const { followerId, followingId } = body;

  if (!followerId || !followingId) {
    return NextResponse.json(
      { error: "Missing required fields: followerId or followingId." },
      { status: 400 }
    );
  }

  try {
    const existingFollow = await db
      .select()
      .from(follows)
      .where(
        and(
          eq(follows.followerId, followerId),
          eq(follows.followingId, followingId)
        )
      )
      .limit(1);

    if (existingFollow.length === 0) {
      return NextResponse.json(
        { success: false, message: "You are not following this user." },
        { status: 404 }
      );
    }

    await db
      .delete(follows)
      .where(
        and(
          eq(follows.followerId, followerId),
          eq(follows.followingId, followingId)
        )
      );

    return NextResponse.json(
      { success: true, message: "Successfully unfollowed the user." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Unfollow error:", error);
    return NextResponse.json(
      { error: "Unexpected error. Please try again later." },
      { status: 500 }
    );
  }
}
)
export const GET = async (request: Request) => {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const uid = Number(userId);
    if (isNaN(uid)) {
      return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
    }

    // 1. Get all users this user is following
    const followingRelations = await db
      .select({
        id: users.id,
      username: sql<string>`
      CASE 
        WHEN ${users.anonymous} = TRUE THEN ${users.anonymousName}
        WHEN ${users.username} IS NOT NULL THEN ${users.username}
        WHEN ${users.firstName} IS NOT NULL THEN ${users.firstName}
        ELSE 'Guest'
      END
    `.as("username"),
        profileImage: users.profileImage,
      })
      .from(follows)
      .innerJoin(users, eq(follows.followingId, users.id))
      .where(eq(follows.followerId, uid));

    // 2. Get all users who follow this user
    const followerRelations = await db
      .select({
        id: users.id,
     username: sql<string>`
      CASE 
        WHEN ${users.anonymous} = TRUE THEN ${users.anonymousName}
        WHEN ${users.username} IS NOT NULL THEN ${users.username}
        WHEN ${users.firstName} IS NOT NULL THEN ${users.firstName}
        ELSE 'Guest'
      END
    `.as("username"),
        profileImage: users.profileImage,
      })
      .from(follows)
      .innerJoin(users, eq(follows.followerId, users.id))
      .where(eq(follows.followingId, uid));

    return NextResponse.json(
      {
        success: true,
        message: "Followers and following fetched successfully.",
        followers: followerRelations,
        following: followingRelations,
        followersCount: followerRelations.length,
        followingCount: followingRelations.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching follow data:", error);
    return NextResponse.json(
      { error: "Failed to fetch followers/following." },
      { status: 500 }
    );
  }
};