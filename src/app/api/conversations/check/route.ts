import { db } from "@/db/db";
import { follows, users } from "@/db/schema/auth";
import { conversationMembers, conversations } from "@/db/schema/conversations";
import { userBlocks } from "@/db/schema/userBlocks";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const userId = parseInt(searchParams.get("userId") || "1");
    const senderId = parseInt(searchParams.get("senderId") || "20");
    const [existUser] = await db
      .select()
      .from(conversationMembers)
      .where(eq(conversationMembers.userId, userId))
      .limit(1);
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          messages: "User not found",
        },
        { status: 404 }
      );
    }
    if (user.firstName) {
      const [isFollows] = await db
        .select()
        .from(follows)
        .where(
          and(eq(follows.followingId, userId), eq(follows.followerId, senderId))
        )
        .limit(1);
      const [isFollower] = await db
        .select()
        .from(follows)
        .where(
          and(eq(follows.followingId, senderId), eq(follows.followerId, userId))
        )
        .limit(1);

      if (isFollows && !isFollower) {
        return NextResponse.json(
          {
            success: false,
            message: `Account is private. ${user.username} should follow you for chat.`,
            code: 200,
          },
          { status: 200 }
        );
      }
      if (!isFollows || !isFollower) {
        return NextResponse.json(
          {
            success: false,
            message: "Account is private",
            code: 200,
          },
          { status: 200 }
        );
      }
    }
    const [isBlocked] = await db
      .select()
      .from(userBlocks)
      .where(
        and(
          eq(userBlocks.blockedUserId, senderId),
          eq(userBlocks.blockerUserId, userId)
        )
      )
      .limit(1);
    if (isBlocked) {
      return NextResponse.json(
        {
          success: false,
          code: 2000,
        },
        { status: 200 }
      );
    }
    if (existUser) {
      const [existSender] = await db
        .select()
        .from(conversationMembers)
        .where(
          and(
            eq(conversationMembers.userId, senderId),
            eq(conversationMembers.conversationId, existUser.conversationId)
          )
        )
        .limit(1);
      if (existSender) {
        return NextResponse.json(
          {
            success: true,
            code: 200,
            existUser: true,
            data: {
              conversationId: existUser.conversationId,
              reciverId: user.notificationId,
            },
          },
          { status: 200 }
        );
      }
    }
    //create conversation
    const conversation = await db.insert(conversations).values({}).returning();
    if (conversation) {
      await db
        .insert(conversationMembers)
        .values({ conversationId: conversation[0].id, userId: userId });
      await db
        .insert(conversationMembers)
        .values({ conversationId: conversation[0].id, userId: senderId });
      return NextResponse.json(
        {
          success: true,
          code: 200,
          data: {
            conversationId: conversation[0].id,
            reciverId: user.notificationId,
          },
        },
        { status: 200 }
      );
    }
    return NextResponse.json(
      {
        success: false,
      },
      { status: 500 }
    );
  } catch (error) {
    console.error("Error fetching part:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch part" },
      { status: 500 }
    );
  }
}
