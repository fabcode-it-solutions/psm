import { db } from "@/db/db";
import { follows, users } from "@/db/schema/auth";
import {
  conversationMembers,
  conversations,
  messageAttachments,
  messages,
} from "@/db/schema/conversations";
import { userBlocks } from "@/db/schema/userBlocks";
import { withFullCsrfProtection } from "@/libs/security/csrf-full";
import { and, desc, eq, ne, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
const allowedFields = ["isRead", "messageText"] as const;

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const conversationId = searchParams.get("conversationId");
    const senderId = parseInt(searchParams.get("senderId") || "0");
    if (!conversationId) {
      return NextResponse.json(
        {
          success: false,
          message: "Conversation Id required",
        },
        { status: 400 }
      );
    }
    if (!senderId || senderId == 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Sender Id  required",
        },
        { status: 400 }
      );
    }
    const [existConversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .limit(1);
    if (!existConversation) {
      return NextResponse.json(
        {
          success: false,
          new: true,
          message: "Chat not found. Create a new Chat",
          status: 404,
        },
        { status: 404 }
      );
    }
    const chatId = existConversation.id;

    const [member] = await db
      .select()
      .from(conversationMembers)
      .where(
        and(
          eq(conversationMembers.conversationId, chatId),
          ne(conversationMembers.userId, senderId)
        )
      )
      .limit(1);
    if (!member) {
      return NextResponse.json(
        {
          success: false,
          new: true,
          message: "Chat not found. Create a new Chat",
        },
        { status: 404 }
      );
    }
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, member.userId))
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
          and(
            eq(follows.followingId, user.id),
            eq(follows.followerId, senderId)
          )
        )
        .limit(1);
      const [isFollower] = await db
        .select()
        .from(follows)
        .where(
          and(
            eq(follows.followingId, senderId),
            eq(follows.followerId, user.id)
          )
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
          eq(userBlocks.blockerUserId, user.id)
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
    const senderData = await db
      .select({
        id: messages.id,
        conversationId: messages.conversationId,
        senderId: messages.senderId,
        messageText: messages.messageText,
        createdAt: messages.createdAt,
        isMine: eq(messages.senderId, senderId).as("isMine"),
        isRead: messages.isRead,
        messageAttachments: sql`
      COALESCE(
        json_agg(
          json_build_object(
            'url', ${messageAttachments.fileUrl},
            'type', ${messageAttachments.fileType}
          )
        ) FILTER (WHERE ${messageAttachments.id} IS NOT NULL),
        '[]'
      )
    `.as("messageAttachments"),
      })
      .from(messages)
      .leftJoin(
        messageAttachments,
        eq(messageAttachments.messageId, messages.id)
      )
      .where(and(eq(messages.conversationId, conversationId)))
      .groupBy(messages.id)
      .orderBy(desc(messages.createdAt));

    return NextResponse.json(
      {
        success: true,
        messages: senderData,
        user: {
          name: user.username,
          profileImage: user.profileImage,
          id: user.id,
          reciverId: user.notificationId,
        },
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

export const PATCH = withFullCsrfProtection(
  async (req: NextRequest): Promise<NextResponse> => {
  try {
    if (!req.headers.get("content-type")?.includes("application/json")) {
      return NextResponse.json(
        { error: "Use application/json" },
        { status: 415 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || !Array.isArray(body.updates)) {
      return NextResponse.json(
        { error: "Invalid JSON or updates missing" },
        { status: 400 }
      );
    }

    // body.updates should look like: [{ id: 1, isRead: true }, { id: 2, messageText: "new text" }]
    const updates = body.updates;

    for (const update of updates) {
      if (!update.id) continue;

      const data: Partial<typeof messages.$inferInsert> = {};
      for (const key of allowedFields) {
        if (key in update) {
          data[key] = update[key];
        }
      }

      if (Object.keys(data).length === 0) continue;

      await db.update(messages).set(data).where(eq(messages.id, update.id));
    }

    return NextResponse.json(
      { success: true, message: "Messages updated" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating messages:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update messages" },
      { status: 500 }
    );
  }
})
