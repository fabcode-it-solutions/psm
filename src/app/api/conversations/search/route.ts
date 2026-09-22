import { db } from "@/db/db";
import { users } from "@/db/schema/auth";
import {
  conversationMembers,
  conversations,
  messages,
} from "@/db/schema/conversations";
import { withFullCsrfProtection } from "@/libs/security/csrf-full";
import { and, eq, ilike, inArray, ne, notInArray, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
const allowedFields = ["isRead", "messageText"] as const;

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get("q");
    const senderId = parseInt(searchParams.get("senderId") || "0");
    const whereConditions = [];
    if (search) {
      whereConditions.push(ilike(users.username, `%${search}%`));
    }
    if (senderId) {
      const userConversations = await db
        .select({
          conversationId: conversationMembers.conversationId,
        })
        .from(conversationMembers)
        .where(eq(conversationMembers.userId, senderId));
      if (userConversations.length) {
        const conversationIds = userConversations.map((c) => c.conversationId);
        whereConditions.push(
          and(
            inArray(conversationMembers.conversationId, conversationIds),
            ne(conversationMembers.userId, senderId)
          )
        );
      } else {
        whereConditions.push(eq(conversationMembers.userId, senderId));
      }
    }
    const existConversation = await db
      .select({
        conversationId: conversations.id,
        user: {
          id: users.id,
          username: users.username,
          profileImage: users.profileImage,
        },
        lastMessage: sql`
      (
        SELECT row_to_json(m)
        FROM ${messages} m
        WHERE m.conversation_id = ${conversations.id}
        ORDER BY m.created_at DESC
        LIMIT 1
      )
    `.as("lastMessage"),
      })
      .from(conversations)
      .leftJoin(
        conversationMembers,
        eq(conversationMembers.conversationId, conversations.id)
      )
      .leftJoin(users, eq(users.id, conversationMembers.userId))
      .where(whereConditions.length ? and(...whereConditions) : undefined);

    const existUsers = existConversation.map((item) =>
      item?.user ? item?.user.id : 0
    );

    const searchedUsers = await db
      .select({
        id: users.id,
        username: users.username,
        profileImage: users.profileImage,
      })
      .from(users)
      .where(
        and(
          ilike(users.username, `%${search}%`),
          notInArray(users.id, existUsers),
          ne(users.id, senderId)
        )
      );
    return NextResponse.json(
      {
        success: true,
        chats: existConversation,
        users: searchedUsers,
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
}
)