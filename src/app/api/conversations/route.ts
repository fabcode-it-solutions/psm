import { db } from "@/db/db";
import { follows, users } from "@/db/schema/auth";
import {
  conversationMembers,
  conversations,
  messages,
} from "@/db/schema/conversations";
import { userBlocks } from "@/db/schema/userBlocks";
import { withFullCsrfProtection } from "@/libs/security/csrf-full";
import { and, eq, inArray, ne, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const senderId = parseInt(searchParams.get("senderId") || "0");

    if (!senderId || senderId == 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Sender Id  required",
        },
        { status: 400 }
      );
    }

    const userConversations = await db
      .select({
        conversationId: conversationMembers.conversationId,
      })
      .from(conversationMembers)
      .where(eq(conversationMembers.userId, senderId));

    if (userConversations.length === 0) {
      return NextResponse.json(
        {
          success: false,
          new: true,
          message: "Chat not found. Create a new Chat",
        },
        { status: 404 }
      );
    }

    const conversationIds = userConversations.map((c) => c.conversationId);

    const members = await db
      .select({
        conversationId: conversationMembers.conversationId,
        userId: users.id,
        username: users.username,
        profileImage: users.profileImage,
        reciverId: users.notificationId,
        lastMessage: sql<string>`
      (
        SELECT m.message_text
        FROM ${messages} m
        WHERE m.conversation_id = ${conversationMembers.conversationId}
        ORDER BY m.created_at DESC
        LIMIT 1
      )
    `.as("lastMessage"),
        lastMessageSentTime: sql<string>`
      (
        SELECT m.created_at
        FROM ${messages} m
        WHERE m.conversation_id = ${conversationMembers.conversationId}
        ORDER BY m.created_at DESC
        LIMIT 1
      )
    `.as("lastMessageSentTime"),
        unreadCount: sql<number>`
      (
        SELECT COUNT(*)
        FROM ${messages} m
        WHERE m.conversation_id = ${conversationMembers.conversationId}
          AND m.is_read = false
          AND m.sender_id <> ${senderId}
      )
    `.as("unreadCount"),
      })
      .from(conversationMembers)
      .innerJoin(users, eq(users.id, conversationMembers.userId))
      .where(
        and(
          inArray(conversationMembers.conversationId, conversationIds),
          ne(conversationMembers.userId, senderId)
        )
      );

    if (!members.length) {
      return NextResponse.json(
        {
          success: false,
          allNew: true,
          message: "Chat not found. Create a new Chat",
        },
        { status: 404 }
      );
    }
    return NextResponse.json(
      {
        success: true,
        members,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching part:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch part" },
      { status: 500 }
    );
  }
}

export const POST = withFullCsrfProtection(
  async (req: NextRequest): Promise<NextResponse> => {

  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const { userId, senderId } = body;
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
})
