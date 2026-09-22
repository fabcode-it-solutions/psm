export interface User {
  id: string;
  username: string;
  avatar?: string;
  joinedAt: Date;
}

export interface Message {
  id: string;
  userId: string;
  username: string;
  roomId?: string;
  content: string;
  type: "text" | "image" | "emoji";
  timestamp: Date;
  media?: {
    url: string;
    type: string;
  }[];
  messageAttachments?: {
    url: string;
    type: string;
  }[];
}

export interface Room {
  id: string;
  name: string;
  users: User[];
  messages: Message[];
  createdAt: Date;
}

export interface TypingUser {
  userId: string;
  username: string;
}
export type Chat = {
  conversationId: string;
  userId: number;
  username: string;
  reciverId?: string;
  profileImage: string;
  lastMessage: string;
  lastMessageSentTime: Date;
  unreadCount: string;
};
export type SingleChatItem = {
  id: string;
  conversationId: string;
  senderId: number;
  messageText: string;
  messageAttachments?: {
    url: string;
    type: string;
  }[];
  createdAt: string;
  isMine: boolean;
  isRead?: boolean;
};
export type SingleChat = {
  success: boolean;
  messages: SingleChatItem[];
  user: {
    name: string;
    profileImage: string;
    id: number;
    reciverId: string;
  };
  message?: string;
  code: number;
};
export interface ChatContextType {
  socket: Socket | null;
  isConnected: boolean;
  currentUser: User | null;
  currentRoom: string | null;
  users: User[];
  messages: Message[];
  typingUsers: TypingUser[];
  chats: Chat[] | boolean;
  reciverId: string | null;
  isOnline: boolean;
  newChat: string;
  setReciverId: React.Dispatch<React.SetStateAction<string | null>>;
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  joinRoom: (roomId: string, username: string) => void;
  joinSingle: (id: string, username: string) => void;
  leaveRoom: () => void;
  sendMessage: ({
    content,
    type,
    media,
    conversationId,
    senderId,
    messageAttachments,
  }: {
    content: string;
    type: "text" | "image" | "emoji";
    media?: {
      url: string;
      type: string;
    }[];
    conversationId?: string;
    senderId?: number;
    message?: string;
    messageAttachments?: {
      url: string;
      type: string;
    }[];
  }) => void;
  startTyping: () => void;
  stopTyping: () => void;
  getChats: (senderId: number) => void;
  sendNotification: (
    id: string,
    username: string,
    profieImage: string,
    message: string,
    type?: string,
    conversationId?: string
  ) => void;
  checkerUserIsOnline: (id: string, username: string, senderId: string) => void;
}

export interface ServerToClientEvents {
  "message:new": (message: Message) => void;
  "user:joined": (user: User) => void;
  "user:welcome": (id: string) => void;
  "user:left": (userId: string) => void;
  "checker:checked": (data: { id: string; status: boolean }) => void;
  "room:users": (users: User[]) => void;
  "notification:recive": (data: {
    id: string;
    username: string;
    profieImage: string;
    message: string;
    type: string;
    conversationId?: string;
  }) => void;
  "room:messages": (messages: Message[]) => void;
  "typing:start": (data: { userId: string; username: string }) => void;
  "typing:stop": (data: { userId: string; username: string }) => void;
}

export interface ClientToServerEvents {
  "checker:user": (data: {
    id: string;
    username: string;
    senderId: string;
  }) => void;
  "room:join": (data: { roomId: string; username: string }) => void;
  "single:join": (data: { id: string; username: string }) => void;
  "notification:send": (data: {
    id: string;
    username: string;
    profieImage: string;
    message: string;
    type: string;
    conversationId?: string;
  }) => void;
  "room:leave": (data: { roomId: string }) => void;
  "message:send": (data: {
    roomId: string;
    content: string;
    type: "text" | "image" | "emoji";
    media?: {
      url: string;
      type: string;
    }[];
  }) => void;
  "typing:start": (data: { roomId: string }) => void;
  "typing:stop": (data: { roomId: string }) => void;
}

export type Socket = import("socket.io-client").Socket<
  ServerToClientEvents,
  ClientToServerEvents
>;
