/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import toast, { Toaster } from "react-hot-toast";
import { socketService } from "@/services/socket";
import {
  ChatContextType,
  User,
  Message,
  TypingUser,
  Socket,
  Chat,
} from "@/types/chat.types";
import { conversationService } from "@/services/conversation.services";
import { RootState } from "@/libs/redux/store";
import { useSelector } from "react-redux";
import MessageRecive from "@/component/notifications/toasts/MessageRecive";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useIsMobile } from "@/utils/useIsMobile";
import { userHistory } from "@/actions/userOnlineHistory";

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const sender = useSelector((state: RootState) => state.user.user?.user);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [newChat, setNewChat] = useState("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [reciverId, setReciverId] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const path = usePathname();

  useEffect(() => {
    if (sender && sender.notificationId) {
      joinSingle(sender.notificationId, sender.username || "User");
    }
  }, [sender]);
  useEffect(() => {
    setMessages([]);
    leaveRoom();
  }, [path]);
  useEffect(() => {
    if (!messages.length) return;
    setChats(
      (prevChats) =>
        prevChats &&
        prevChats.map((chat) => {
          const latestMessage = messages
            .filter((m) => m.roomId === chat.conversationId)
            .sort(
              (a, b) =>
                new Date(b.timestamp).getTime() -
                new Date(a.timestamp).getTime()
            )[0];

          if (!latestMessage) return chat;

          return {
            ...chat,
            lastMessage: latestMessage.content,
            lastMessageSentTime: latestMessage.timestamp,
          };
        })
    );
  }, [messages]);
  useEffect(() => {
    const newSocket = socketService.connect();
    setSocket(newSocket);

    newSocket.on("connect", () => {
      setIsConnected(true);
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
      setCurrentUser(null);
      setCurrentRoom(null);
      setUsers([]);
      setMessages([]);
      setTypingUsers([]);
      toast.error("Disconnected from chat server");
    });

    newSocket.on("connect_error", () => {
      setIsConnected(false);
      // toast.error("Failed to connect to chat server");
    });

    newSocket.on("message:new", (message: Message) => {
      if (message.media?.length) {
        message.messageAttachments = message.media;
      }
      setMessages((prev) => [...prev, message]);
    });

    newSocket.on("user:joined", (user: User) => {
      if (user.username != sender?.username) {
        userHistory(user.username);
        toast.success(`${user.username} is online.`);
      }
    });

    newSocket.on("user:left", (userId: string) => {
      setTypingUsers((prev) => prev.filter((u) => u.userId !== userId));
    });

    newSocket.on("checker:checked", (data: { id: string; status: boolean }) => {
      if (data.status) {
        setIsOnline(data.status);
      }
    });
    newSocket.on("room:users", (roomUsers: User[]) => {
      setUsers(roomUsers);
    });
    newSocket.on("room:messages", (roomMessages: Message[]) => {
      setMessages(roomMessages);
    });
    newSocket.on(
      "notification:recive",
      (data: {
        id: string;
        username: string;
        profieImage: string;
        message: string;
        type: string;
        conversationId?: string;
      }) => {
        console.log(data);

        if (
          data.type === "request-message" &&
          path.includes("messages") &&
          data.conversationId
        ) {
          setNewChat(data.conversationId);
        }
        if (data.type === "message" && !path.includes("messages")) {
          toast.custom((t) => (
            <MessageRecive visible={t.visible} data={data} id={t.id} />
          ));
        }
        console.log(data);
        if (data.type === "follow") {
          toast.custom(() => (
            <div className="bg-white rounded-md border border-gray-1 p-5 flex items-center gap-4">
              <div className="relative">
                <Image
                  alt=""
                  loading="lazy"
                  width="101"
                  height="101"
                  decoding="async"
                  data-nimg="1"
                  className="object-center object-cover rounded-full  min-w-[101px] h-[101px]"
                  src={data.profieImage}
                />
              </div>
              <div className="flex flex-col justify-center py-4">
                <div className="text-dark-blue-cm text-xl leading-[1.35] font-bold font-supreme tracking-[0.2px]">
                  {data.username}
                </div>
                <div className=" text-dark-blue-cm text-sm font-bold font-sofia-sans tracking-[0.56px] leading-normal">
                  {data.message}
                </div>
              </div>
            </div>
          ));
        }
      }
    );

    newSocket.on(
      "typing:start",
      (data: { userId: string; username: string }) => {
        setTypingUsers((prev) => {
          const exists = prev.find((u) => u.userId === data.userId);
          if (!exists) {
            return [...prev, data];
          }
          return prev;
        });
      }
    );

    newSocket.on(
      "typing:stop",
      (data: { userId: string; username: string }) => {
        setTypingUsers((prev) => prev.filter((u) => u.userId !== data.userId));
      }
    );

    return () => {
      newSocket.removeAllListeners();
      socketService.disconnect();
    };
  }, []);
  const getChats = async (senderId: number) => {
    try {
      const data = await conversationService.getConversations({ senderId });
      if (data.success) {
        setChats(data.members);
      }
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    if (sender?.id && newChat != "") {
      getChats(sender.id);
      setNewChat("");
    }
  }, [newChat, sender]);
  const joinRoom = useCallback(
    (roomId: string, username: string) => {
      if (!socket || !isConnected) {
        toast.error("Not connected to server");
        return;
      }

      socket.emit("room:join", { roomId, username });
      setCurrentUser({
        id: socket.id || "",
        username,
        joinedAt: new Date(),
      });
      setCurrentRoom(roomId);
    },
    [socket, isConnected]
  );
  const joinSingle = useCallback(
    (id: string, username: string) => {
      if (!socket || !isConnected) {
        toast.error("Not connected to server");
        return;
      }
      socket.emit("single:join", { id, username });
    },
    [socket, isConnected]
  );
  const checkerUserIsOnline = useCallback(
    (id: string, username: string, senderId: string) => {
      if (!socket || !isConnected) {
        toast.error("Not connected to server");
        return;
      }
      socket.emit("checker:user", { id, username, senderId });
    },
    [socket, isConnected]
  );
  const sendNotification = useCallback(
    (
      id: string,
      username: string,
      profieImage: string,
      message: string,
      type?: string,
      conversationId?: string
    ) => {
      if (!socket || !isConnected) {
        toast.error("Not connected to server");
        return;
      }
      socket.emit("notification:send", {
        id,
        username,
        profieImage,
        message,
        type: type || "message",
        conversationId: conversationId || "",
      });
    },
    [socket, isConnected]
  );
  const leaveRoom = useCallback(() => {
    if (!socket || !currentRoom) return;

    socket.emit("room:leave", { roomId: currentRoom });

    setCurrentRoom(null);
    setCurrentUser(null);
    setUsers([]);
    setMessages([]);
    setTypingUsers([]);
  }, [socket, currentRoom]);

  const startTyping = useCallback(() => {
    if (!socket || !currentRoom) return;
    socket.emit("typing:start", { roomId: currentRoom });
  }, [socket, currentRoom]);

  const stopTyping = useCallback(() => {
    if (!socket || !currentRoom) return;
    socket.emit("typing:stop", { roomId: currentRoom });
  }, [socket, currentRoom]);
  const sendMessage = useCallback(
    async ({
      content,
      type = "text",
      conversationId,
      senderId,
      media,
    }: {
      content: string;
      type: "text" | "image" | "emoji";
      conversationId?: string;
      senderId?: number;
      media?: {
        url: string;
        type: string;
      }[];
    }) => {
      if (!socket || !currentRoom) return;
      await conversationService.sendMessage({
        conversationId,
        message: content || "",
        media,
        senderId,
      });
      socket.emit("message:send", {
        roomId: currentRoom,
        content: content.trim(),
        type,
        media,
      });
    },
    [socket, currentRoom]
  );
  const value: ChatContextType = {
    socket,
    isConnected,
    currentUser,
    currentRoom,
    users,
    messages,
    typingUsers,
    chats,
    reciverId,
    isOnline,
    newChat,
    setReciverId,
    setChats,
    getChats,
    joinRoom,
    joinSingle,
    leaveRoom,
    sendMessage,
    startTyping,
    stopTyping,
    sendNotification,
    checkerUserIsOnline,
  };
  const isMobile = useIsMobile();
  return (
    <ChatContext.Provider value={value}>
      {children}
      <Toaster
        position={isMobile ? "bottom-center" : "top-right"}
        reverseOrder={false}
      />
    </ChatContext.Provider>
  );
};
