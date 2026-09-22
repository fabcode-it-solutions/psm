import { db } from "@/db/db";
import { follows, users } from "@/db/schema/auth";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const GET = async (request: Request) => {
  try {
    const url = new URL(request.url);
    const followingId = url.searchParams.get("followingId");
    const followerId = url.searchParams.get("followerId");

    if (!followingId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const uid = Number(followingId);
    const follower = Number(followerId);
    if (isNaN(uid)) {
      return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
    }
    const followingRelations = await db
      .select()
      .from(follows)
      .where(
        and(
          eq(follows.followerId, follower),
          eq(follows.followingId, uid)
        )
      );
          
    return NextResponse.json(
      {
        success: true,
        following: followingRelations.length > 0 ? true : false,
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
