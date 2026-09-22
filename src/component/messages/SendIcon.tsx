import { SingleChat, TypingUser } from "@/types/chat.types";
import Image from "next/image";
import { useRouter } from "next/navigation";

const SendIcon = ({
  chat,
  isUserOnline,
  typingUsers,
  username,
}: {
  chat: SingleChat;
  isUserOnline: boolean;
  typingUsers: TypingUser[];
  username: string;
}) => {
  const router = useRouter();
  
  return (
    <div className="flex items-center px-6 max-md:px-4 py-4 max-md:py-3 bg-[#F7F7FC] gap-4 max-md:gap-3">
      <button
        onClick={() => router.push('/messages')}
        className="hidden max-md:flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-200 transition-colors"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="#09132C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <Image
        src={chat.user.profileImage || "/assets/images/WithoutProfil.png"}
        alt="Profile"
        width={60}
        height={60}
        className="rounded-full w-[60px] h-[60px] max-md:w-[45px] max-md:h-[45px] object-cover"
      />
      <div className="flex flex-col gap-1">
        <p className="font-supreme font-medium text-[18px] max-md:text-base text-[#09132C]">
          {chat.user.name}
        </p>
        <p className="font-supreme text-xs max-md:text-[11px] text-[#6E7FA9] flex gap-1 items-center">
          <span
            className={`w-2 h-2 max-md:w-1.5 max-md:h-1.5 rounded-full ${
              isUserOnline ? "bg-[#54DC00]" : "bg-red-500"
            }`}
          />
          {typingUsers.some((u) => u.username !== username)
            ? "Typing..."
            : isUserOnline
            ? "Online"
            : "Offline"}
        </p>
      </div>
    </div>
  );
};
export default SendIcon;
