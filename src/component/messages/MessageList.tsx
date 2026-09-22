import { motion, AnimatePresence } from "framer-motion";
import { formatTime } from "@/utils/dateUtils";
import AttachmentGrid from "./AttachmentGrid";
import { SingleChatItem } from "@/types/chat.types";

const MessageList = ({
  padding,
  messages,
}: {
  padding: number;
  messages: SingleChatItem[];
}) => (
  <div
    className="flex flex-col-reverse overflow-y-auto custom-scrollbar h-[calc(100dvh-340px)] max-md:h-[calc(100dvh-280px)] pl-10 max-md:pl-4 pr-4 md:pr-0 gap-4 max-md:gap-3 mt-4 max-md:mt-2"
    style={{ paddingRight: `max(${padding}px, 16px)` }}
  >
    <AnimatePresence initial={false}>
      {messages &&
        messages.length > 0 &&
        messages.map((msg: SingleChatItem, i: number) =>
          msg.messageText ? (
            <motion.div
              key={msg.id || i}
              className={`flex w-full ${msg.isMine ? "justify-end" : ""}`}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              layout
            >
              <div>
                <div
                  className={`${
                    msg.isMine
                      ? "bg-[#54DC0033] rounded-br-none"
                      : "bg-white rounded-bl-none"
                  } w-full px-6 max-md:px-4 py-4 max-md:py-3 rounded-[16px] max-md:rounded-[12px] max-w-md max-md:max-w-[280px] text-sm max-md:text-[13px] leading-relaxed`}
                >
                  {msg.messageText}
                </div>
                {msg.messageAttachments &&
                  msg.messageAttachments?.length > 0 && (
                    <AttachmentGrid attachments={msg.messageAttachments} />
                  )}
                <p
                  className={`text-[10px] max-md:text-[9px] text-gray-400 mt-1 max-md:mt-0.5 ${
                    msg.isMine ? "text-right" : ""
                  }`}
                >
                  {formatTime(new Date(msg.createdAt))}
                </p>
              </div>
            </motion.div>
          ) : (
            msg.messageAttachments &&
            msg.messageAttachments?.length > 0 && (
              <motion.div
                key={msg.id || i}
                className={`flex w-full ${msg.isMine ? "justify-end" : ""}`}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                layout
              >
                <div>
                  <AttachmentGrid attachments={msg.messageAttachments} />
                  <p
                    className={`text-[10px] max-md:text-[9px] text-gray-400 mt-1 max-md:mt-0.5 ${
                      msg.isMine ? "text-right" : ""
                    }`}
                  >
                    {formatTime(new Date(msg.createdAt))}
                  </p>
                </div>
              </motion.div>
            )
          )
        )}
    </AnimatePresence>
  </div>
);
export default MessageList;
