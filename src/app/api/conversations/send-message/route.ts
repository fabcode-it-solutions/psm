import { db } from "@/db/db";
import { messageAttachments, messages } from "@/db/schema/conversations";
import { withFullCsrfProtection } from "@/libs/security/csrf-full";
import { NextRequest, NextResponse } from "next/server";

export const POST = withFullCsrfProtection(
  async (req: NextRequest): Promise<NextResponse> => {

  try {
    if (!req.headers.get("content-type")?.includes("application/json")) {
      return NextResponse.json(
        { error: "Use application/json" },
        { status: 415 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const { conversationId, senderId, message, attachments } = body;
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
    

    const [added] = await db
      .insert(messages)
      .values({ senderId, conversationId, messageText: message })
      .returning();
    if (added && attachments?.length) {
      await db.insert(messageAttachments).values(
        attachments.map((a: { url: string; type: string }) => ({
          messageId: added.id,
          fileUrl: a.url,
          fileType: a.type,
        }))
      );
    }
    return NextResponse.json(
      { success: true, message: "Message sent" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating media:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create media" },
      { status: 500 }
    );
  }
})
