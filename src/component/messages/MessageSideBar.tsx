/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { useState } from "react";
import { useChatContext } from "@/providers/ChatContext";
import { useSelector } from "react-redux";
import { RootState } from "@/libs/redux/store";
import { formatTime } from "@/utils/dateUtils";
import Link from "next/link";
import { Chat } from "@/types/chat.types";
import { conversationService } from "@/services/conversation.services";
import { usePathname, useRouter } from "next/navigation";
interface SearchResult {
  chats?: {
    conversationId: string;
    user: {
      id: number;
      username: string;
      profileImage: string;
    };
    lastMessage: {
      message_text: string;
      created_at: string;
      is_read: boolean;
    };
  }[];
  users?: {
    username: string;
    id: number;
    profileImage: string;
  }[];
}
const MessageSideBar = ({
  intialChats,
}: {
  intialChats: { members: Chat[] };
}) => {
  const router = useRouter();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const [results, setResults] = useState<SearchResult>({});
  const [searchLoading, setSearchLoading] = useState(false);
  const sender = useSelector((state: RootState) => state.user.user?.user);
  const { chats, getChats, setChats, newChat, setReciverId, joinRoom } =
    useChatContext();
  useEffect(() => {
    setChats(intialChats?.members);
  }, []);
  const [searchTerm, setSearchTerm] = useState("");
  useEffect(() => {
    if (!searchTerm) {
      setResults({});
      return;
    }
    setSearchLoading(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      const data = await conversationService.search({
        query: searchTerm,
        senderId: sender?.id,
      });
      setResults(data);
      setSearchLoading(false);
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchTerm]);
  const checkConversation = async (id: number) => {
    try {
      const data = await conversationService.checkConversation({
        userId: id,
        senderId: sender?.id,
      });
      if (data.data?.conversationId && sender && sender.id) {
        getChats(sender.id);
        setReciverId(data.data.reciverId);
        router.push(`/messages/${data.data?.conversationId}`);
        setSearchTerm("");
      }
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    if (chats && typeof chats != "boolean") {
      chats.map((chat) => {
        if (sender?.username) {
          joinRoom(chat.conversationId.trim(), sender?.username.trim());
        }
      });
    }
  }, [sender]);
  useEffect(() => {
    if (newChat != "" && sender?.username) {
      joinRoom(newChat.trim(), sender?.username.trim());
    }
  }, [newChat, sender]);

  return (
    <div className="min-w-[360px] max-md:min-w-full max-md:w-full overflow-y-auto bg-[#F4F4F4] flex flex-col overflow-x-hidden">
      <div className="max-w-[336px] max-md:max-w-full w-full h-full mt-21 max-md:mt-4 ml-[15px] max-md:ml-0 px-3 max-md:px-4">
        <h1 className="block md:hidden text-xl font-bold text-[#09132C] font-supreme mb-6">
          Messages
        </h1>

        <span className="flex items-center gap-[9.88px] justify-center font-sofia-sans font-bold text-sm leading-[100%] tracking-[4%] align-middle border-[#D1E4E8] border-[1px] rounded-[24px] bg-[#FFFFFF] max-md:mx-0">
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="flex items-center p-[1.67px] max-md:ml-2"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M8.78283 0.666626C13.2578 0.666626 16.8978 4.30663 16.8978 8.78163C16.8978 10.8929 16.0876 12.8185 14.7617 14.2637L17.3707 16.8672C17.6148 17.1114 17.6157 17.5064 17.3715 17.7505C17.2498 17.8739 17.089 17.9347 16.929 17.9347C16.7698 17.9347 16.6098 17.8739 16.4873 17.7522L13.8469 15.1191C12.4579 16.2315 10.6967 16.8975 8.78283 16.8975C4.30783 16.8975 0.666992 13.2566 0.666992 8.78163C0.666992 4.30663 4.30783 0.666626 8.78283 0.666626ZM8.78283 1.91663C4.99699 1.91663 1.91699 4.99579 1.91699 8.78163C1.91699 12.5675 4.99699 15.6475 8.78283 15.6475C12.5678 15.6475 15.6478 12.5675 15.6478 8.78163C15.6478 4.99579 12.5678 1.91663 8.78283 1.91663Z"
              fill="#888888"
            />
          </svg>

          <input
            type="text"
            placeholder="Search User or start a new chat"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-[250.12px] max-md:w-full py-3 max-md:py-2 max-md:pr-4"
          />
        </span>
        {searchTerm && (
          <div className="flex flex-col overflow-y-auto mt-6">
            {searchLoading &&
              Array.from({ length: 12 }).map((_, index) => (
                <div
                  key={`chat-${index}`}
                  className="flex items-center gap-3 max-md:gap-2 animate-pulse py-2 max-md:py-3 hover:bg-gray-100 cursor-pointer"
                >
                  <div className="rounded-full min-w-[60px] w-[60px] h-[60px] max-md:min-w-[55px] max-md:w-[55px] max-md:h-[55px] object-cover bg-dark-blue-cm/10" />
                  <span className="flex justify-between w-full pr-2 max-md:pr-1">
                    <div className="flex flex-col gap-2 max-md:gap-1.5 w-full">
                      <p className="font-supreme font-bold text-base max-md:text-base h-6 max-md:h-6 leading-[24px] rounded-md bg-dark-blue-cm/10 tracking-[0%] align-middle text-[#09132C]"></p>
                      <p className="font-supreme font-normal text-xs max-md:text-sm h-3 max-md:h-4 leading-[100%] rounded-md bg-dark-blue-cm/10 tracking-[0%] align-middle text-[#09132C]"></p>
                    </div>
                  </span>
                </div>
              ))}
            {results.chats && results.chats.length > 0 && (
              <div>
                <div className="font-supreme font-medium text-[18px] max-md:text-base text-[#09132C] max-md:mb-2">
                  Chats
                </div>
                {results.chats.map((chat, index) => {
                  const dateT = new Date(chat?.lastMessage?.created_at);
                  return (
                    <ChatItems
                      chat={{
                        conversationId: chat.conversationId,
                        lastMessage: chat?.lastMessage?.message_text,
                        lastMessageSentTime: dateT,
                        profileImage: chat?.user.profileImage,
                        username: chat.user.username,
                        userId: chat.user.id,
                        unreadCount: "0",
                      }}
                      dateT={dateT}
                      key={`chat--${index}`}
                    />
                  );
                })}
              </div>
            )}
            {results.users && results.users.length > 0 && (
              <div>
                <div className="font-supreme font-medium text-[18px] max-md:text-base text-[#09132C] max-md:mb-2">
                  Users
                </div>
                {results.users.map((user, index) => {
                  return (
                    <div
                      key={`chat-users-${index}`}
                      className="flex items-center relative gap-3 max-md:gap-3 py-2 max-md:py-4 hover:bg-gray-100 cursor-pointer"
                    >
                      <Image
                        src={
                          user.profileImage ||
                          "/assets/images/WithoutProfil.png"
                        }
                        alt={user.username || "WithoutProfile"}
                        width={60}
                        height={60}
                        className="rounded-full w-[60px] h-[60px] max-md:w-[55px] max-md:h-[55px] object-cover"
                      />

                      <div className="flex flex-col gap-2 max-md:gap-1.5">
                        <p className="font-supreme font-bold text-base max-md:text-base leading-[24px] tracking-[0%] align-middle text-[#09132C]">
                          {user.username}
                        </p>
                      </div>
                      <button
                        onClick={() => checkConversation(user.id)}
                        type="button"
                        className="absolute top-0 left-0 w-full h-full"
                      ></button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        {!searchTerm && (
          <div className="flex flex-col overflow-y-auto mt-6">
            {chats && typeof chats != "boolean" && chats.length > 0 ? (
              chats.map((chat, index) => {
                const dateT = new Date(chat.lastMessageSentTime);
                return (
                  <ChatItems
                    chat={chat}
                    dateT={dateT}
                    key={`chat-${chat.conversationId}-${index}`}
                  />
                );
              })
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">
                No chats found
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageSideBar;

const ChatItems = ({ chat, dateT }: { chat: Chat; dateT: Date }) => {
  const path = usePathname();
  const is = path.replace("/messages/", "");
  const { typingUsers, setReciverId } = useChatContext();
  const router = useRouter();
  const changeRouter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (chat.reciverId) {
      setReciverId(chat.reciverId);
    }
    router.push(`/messages/${chat.conversationId}`);
  };
  return (
    <div
      className={`flex items-center relative gap-3 max-md:gap-3 transition-all duration-200 py-2 max-md:py-4 hover:bg-gray-100 cursor-pointer ${
        is == chat.conversationId ? "bg-white p-2 max-md:p-3 rounded-md" : ""
      } `}
    >
      <Image
        src={chat.profileImage || "/assets/images/WithoutProfil.png"}
        alt={chat.username || "WithoutProfile"}
        width={60}
        height={60}
        className="rounded-full w-[60px] h-[60px] max-md:w-[55px] max-md:h-[55px] min-w-15 max-md:min-w-[55px] object-cover"
      />
      <span className="flex justify-between w-full">
        <div className="flex flex-col gap-2 max-md:gap-1.5 flex-1 min-w-0">
          <p className="font-supreme font-bold text-base max-md:text-base leading-[24px] tracking-[0%] align-middle text-[#09132C] truncate">
            {chat.username}
          </p>
          <p className="font-supreme font-normal text-xs max-md:text-sm leading-[100%] tracking-[0%] align-middle text-[#09132C] truncate">
            {typingUsers.some((u) => u.username === chat.username)
              ? "Typing..."
              : chat.lastMessage}
          </p>
        </div>
        {chat.lastMessage && (
          <p className="font-supreme flex flex-col justify-between items-end font-normal text-[10px] max-md:text-[10px] leading-[16px] tracking-[0%] text-[#829C99] ml-2 flex-shrink-0">
            {formatTime(dateT)}
            {Number(chat.unreadCount) == 0 ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="max-md:w-6 max-md:h-6"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M11.3246 5.16599C11.555 5.39108 11.5594 5.7604 11.3343 5.99089L5.63773 11.8242C5.52294 11.9418 5.36391 12.0055 5.19972 11.9996C5.03553 11.9938 4.88141 11.919 4.77524 11.7937L2.30519 8.87699C2.09698 8.63114 2.1275 8.26305 2.37335 8.05485C2.6192 7.84665 2.98728 7.87716 3.19549 8.12301L5.2511 10.5503L10.4997 5.17577C10.7247 4.94528 11.0941 4.9409 11.3246 5.16599Z"
                  fill="#54DC00"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M14.6576 5.16599C14.8881 5.39108 14.8924 5.7604 14.6673 5.99089L8.97073 11.8242C8.85595 11.9418 8.69692 12.0055 8.53273 11.9996C8.36854 11.9938 8.21442 11.919 8.10824 11.7937L5.6382 8.87699C5.42999 8.63114 5.46051 8.26305 5.70636 8.05485C5.95221 7.84665 6.32029 7.87716 6.52849 8.12301L8.5841 10.5503L13.8327 5.17577C14.0577 4.94528 14.4271 4.9409 14.6576 5.16599Z"
                  fill="#54DC00"
                />
              </svg>
            ) : (
              <span className="rounded-full text-dark-blue-cm min-w-5 min-h-5 max-md:min-w-4 max-md:min-h-4 bg-[#D9F4C8] text-[10px] max-md:text-[8px] font-bold leading-5 max-md:leading-4 font-supreme text-center">
                {chat.unreadCount}
              </span>
            )}
          </p>
        )}
      </span>
      <Link
        onClick={changeRouter}
        href={`/messages/${chat.conversationId}`}
        className="absolute top-0 left-0 w-full h-full"
      ></Link>
    </div>
  );
};
