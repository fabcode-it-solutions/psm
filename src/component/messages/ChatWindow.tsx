/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useEffect, useMemo, useState } from "react";
import { RootState } from "@/libs/redux/store";
import { useSelector } from "react-redux";
import { SingleChat } from "@/types/chat.types";
import { useChatContext } from "@/providers/ChatContext";
import { conversationService } from "@/services/conversation.services";
import { usePathname } from "next/navigation";
import { UploadFileType } from "@/types";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import SendIcon from "./SendIcon";
import LoaderState, { EmptyState, ErrorState } from "./LoaderState";

const ChatWindow = ({
  conversationId,
  initialChat,
}: {
  conversationId: string;
  initialChat: SingleChat;
}) => {
  const [padding, setPadding] = useState<number>(0);
  const pathname = usePathname();
  const [mediaFiles, setMediaFiles] = useState<UploadFileType[]>([]);
  useEffect(() => {
    const calcPadding = () => {
      const bodyWidth = document.body.clientWidth;
      const header = document.querySelector(
        ".main-header"
      ) as HTMLElement | null;

      if (header) {
        const headerWidth = header.clientWidth;
        setPadding((bodyWidth - headerWidth) / 2);
      }
    };
    calcPadding();
    window.addEventListener("resize", calcPadding);
    return () => window.removeEventListener("resize", calcPadding);
  }, [pathname]);
  const sender = useSelector((state: RootState) => state.user.user?.user);
  const [inputChat, setInputChat] = useState("");
  const [chat, setChat] = useState<SingleChat>(initialChat);
  const {
    reciverId,
    users,
    typingUsers,
    messages,
    isOnline,
    getChats,
    joinRoom,
    startTyping,
    stopTyping,
    sendMessage,
    sendNotification,
    setReciverId,
    checkerUserIsOnline,
  } = useChatContext();
  const isUserOnline = useMemo(() => {
    if (users.length > 0 && typeof chat != "boolean") {
      const online = users.find((item) => item.username == chat?.user?.name);
      if (online) {
        return true;
      }
    }
    return false;
  }, [users]);
  useEffect(() => {
    if (chat && chat.messages && chat?.user?.reciverId) {
      setReciverId(chat.user.reciverId);
      if (sender?.notificationId) {
        checkerUserIsOnline(
          chat.user.reciverId,
          chat.user.name,
          sender?.notificationId
        );
      }
      const checkUpdates = chat.messages
        .filter((item) => !item.isMine && !item.isRead)
        .map((item) => ({
          id: item.id,
          isRead: true,
        }));
      conversationService.updateSingleChat({ updates: checkUpdates });
    }
  }, [chat]);
  useEffect(() => {
    if (sender?.notificationId && chat && chat?.user?.reciverId) {
      checkerUserIsOnline(
        chat.user.reciverId,
        chat.user.name,
        sender?.notificationId
      );
    }
    if (sender?.id) {
      getChats(sender?.id);
    }
  }, [sender, chat]);
  useEffect(() => {
    if (!messages.length) return;
    if (sender?.id && initialChat) {
      setChat((prev) => {
        if (prev && typeof prev !== "boolean") {
          const ids = new Set(
            prev.messages?.map((item) => String(item.id)) ?? []
          );

          // Filter only unseen + same conversation
          const newMessages = messages
            .filter(
              (item) =>
                !ids.has(String(item.id)) && item.roomId === conversationId
            )
            .map((item) => ({
              conversationId,
              createdAt: String(item.timestamp),
              isMine: item.username === sender?.username,
              messageText: item.content,
              messageAttachments: item.media || item.messageAttachments,
              senderId: sender?.id || 0,
              id: item.id,
            }));

          if (newMessages.length === 0) {
            return prev;
          }

          return {
            ...prev,
            messages: [...newMessages, ...prev.messages],
          };
        }
        return prev;
      });
    }
  }, [messages, sender, initialChat.messages]);

  useEffect(() => {
    if (sender?.username) {
      joinRoom(conversationId.trim(), sender?.username.trim());
    }
  }, [sender]);
  const handleSubmitChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputChat && mediaFiles.length == 0) {
      return "";
    }
    if (reciverId && sender?.username) {
      const type = chat.messages.length == 0 ? "request-message" : "message";
      sendNotification(
        reciverId,
        sender?.username || "User",
        sender?.profileImage || "",
        mediaFiles.length > 0
          ? `${sender?.username || "User"} shared images.`
          : inputChat,
        type,
        conversationId
      );
    }
    let messageAttachments: {
      url: string;
      type: string;
    }[] = [];
    if (mediaFiles.length) {
      messageAttachments = mediaFiles.map((item) => ({
        url: item.url || "",
        type: "image",
      }));
    }
    sendMessage({
      content: inputChat,
      type: "text",
      conversationId,
      media: messageAttachments,
      senderId: sender?.id,
    });
    setMediaFiles([]);
    setInputChat("");
    stopTyping();
  };
  const handleChat = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    startTyping();
    setInputChat(e.target.value);
    if (e.target.value.length == 0) {
      stopTyping();
    }
  };

  if (!chat) return <LoaderState />;
  if (!chat.success && chat.code === 2000) return <EmptyState />;
  if (!chat.success && chat.message)
    return <ErrorState message={chat.message} />;

  return (
    <div className="flex-1 flex flex-col bg-gray-50 max-md:h-full">
      {sender?.username && (
        <SendIcon
          chat={chat}
          isUserOnline={isOnline || isUserOnline}
          typingUsers={typingUsers}
          username={sender?.username}
        />
      )}

      <MessageList padding={padding} messages={chat.messages} />

      <ChatInput
        mediaFiles={mediaFiles}
        setMediaFiles={setMediaFiles}
        padding={padding}
        inputChat={inputChat}
        handleChat={handleChat}
        conversationId={conversationId}
        handleSubmitChat={handleSubmitChat}
      />
    </div>
  );
};

export default ChatWindow;
