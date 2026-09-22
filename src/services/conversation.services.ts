export const conversationService = {
  checkConversation: async ({
    userId,
    senderId,
  }: {
    userId?: number;
    senderId?: number;
  }) => {
    try {
      const conversation = await fetch(
        `/api/conversations/check?userId=${userId}&senderId=${senderId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await conversation.json();
      return data;
    } catch (err) {
      console.log(err);
    }
  },
  getConversations: async ({ senderId }: { senderId?: number }) => {
    try {
      const conversation = await fetch(
        `${process.env.NEXT_PUBLIC_API_PATH}/conversations?senderId=${senderId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await conversation.json();
      return data;
    } catch (err) {
      console.log(err);
    }
  },
  sendMessage: async ({
    conversationId,
    senderId,
    message,
    media,
  }: {
    conversationId?: string;
    senderId?: number;
    message?: string;
    media?: {
      url: string;
      type: string;
    }[];
  }) => {
    try {
      const conversation = await fetch(`/api/conversations/send-message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId,
          senderId,
          message,
          attachments: media,
        }),
      });
      const data = await conversation.json();
      return data;
    } catch (err) {
      console.log(err);
    }
  },
  getSingleConversations: async ({
    senderId,
    conversationId,
  }: {
    conversationId?: string;
    senderId?: number;
  }) => {
    try {
      const conversation = await fetch(
        `${process.env.NEXT_PUBLIC_API_PATH}/conversations/single?senderId=${senderId}&conversationId=${conversationId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await conversation.json();
      return data;
    } catch (err) {
      console.log(err);
    }
  },
  updateSingleChat: async ({
    updates,
  }: {
    updates: {
      id: string;
      isRead?: boolean;
      message?: string;
    }[];
  }) => {
    try {
      const conversation = await fetch(
        `${process.env.NEXT_PUBLIC_API_PATH}/conversations/single`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            updates: [...updates],
          }),
        }
      );
      const data = await conversation.json();
      return data;
    } catch (err) {
      console.log(err);
    }
  },
  search: async ({
    senderId,
    query,
  }: {
    senderId?: number;
    query?: string;
  }) => {
    try {
      const conversation = await fetch(
        `/api/conversations/search?q=${query}&senderId=${senderId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await conversation.json();
      return data;
    } catch (err) {
      console.log(err);
    }
  },
};
