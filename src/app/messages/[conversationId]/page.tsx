import ChatWindow from "@/component/messages/ChatWindow";
import { db } from "@/db/db";
import { conversations } from "@/db/schema/conversations";
import { authOptions } from "@/libs/next-auth/auth";
import { conversationService } from "@/services/conversation.services";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import React from "react";
export async function generateStaticParams() {
  try {
    const slugs = await db
      .select({ conversationId: conversations.id })
      .from(conversations);
    return slugs;
  } catch (error) {
    console.error("Error in generateStaticParams:", error);
    return [];
  }
}

const page = async ({
  params,
}: {
  params: Promise<{ conversationId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const session = await getServerSession(authOptions);
  const { conversationId } = await params;
  const chat = await conversationService.getSingleConversations({
    conversationId: conversationId,
    senderId: session?.user.id,
  });
  if (chat.status == 404) {
    return notFound();
  }
  return <ChatWindow conversationId={conversationId} initialChat={chat} />;
};

export default page;
