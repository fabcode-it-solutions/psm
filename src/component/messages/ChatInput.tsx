import IconClose from "@/assets/icons/IconClose";
import { useChatContext } from "@/providers/ChatContext";
import { UploadFileType } from "@/types";
import Image from "next/image";
import { useEffect, useMemo, useRef } from "react";
import UploadInput from "../ui/dashboard/media-upload/UploadInput";

const ChatInput = ({
  mediaFiles,
  setMediaFiles,
  inputChat,
  handleChat,
  handleSubmitChat,
  padding,
  conversationId,
}: {
  mediaFiles: UploadFileType[];
  inputChat: string;
  handleChat: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmitChat: (e: React.FormEvent) => void;
  padding: number;
  setMediaFiles: React.Dispatch<React.SetStateAction<UploadFileType[]>>;
  conversationId: string;
}) => {
  const { stopTyping } = useChatContext();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto resize height when text changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const newHeight = Math.min(textareaRef.current.scrollHeight, 120);
      textareaRef.current.style.height = newHeight + "px";
    }
  }, [inputChat]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmitChat(e as unknown as React.FormEvent);
    }
  };

  const deselectImage = (imageIndex: number) => {
    setMediaFiles((prev) => prev.filter((_, index) => index !== imageIndex));
  };

  const mediaFileIds = useMemo(
    () => mediaFiles.map((item) => Number(item.id)),
    [mediaFiles]
  );

  const disabled = useMemo(() => {
    if (mediaFiles.length > 0) return false;
    return !inputChat.trim();
  }, [mediaFiles, inputChat]);

  return (
    <div className="relative">
      {/* Image previews */}
      {mediaFiles.length > 0 && (
        <>
          {/* Mobile → previews inline above input */}
          <div className="max-md:block hidden w-full bg-[#F7F7FC] p-3">
            <div className="flex flex-wrap gap-2">
              {mediaFiles.map((item, index) => (
                <PreviewItem
                  key={`mobile-image-${index}`}
                  item={item}
                  onRemove={() => deselectImage(index)}
                />
              ))}
            </div>
          </div>

          {/* Desktop → previews float above input */}
          <div className="hidden md:block absolute bottom-full left-0 right-0 mb-[-25px]">
            <div className="flex flex-wrap gap-2 w-full bg-[#F7F7FC] p-4 rounded-t-lg">
              {mediaFiles.map((item, index) => (
                <PreviewItem
                  key={`desktop-image-${index}`}
                  item={item}
                  onRemove={() => deselectImage(index)}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmitChat}
        className="flex gap-6 max-md:gap-3 relative items-center bg-[#F7F7F7] px-6 max-md:px-4 py-4 max-md:py-3 pr-4 md:pr-0"
        style={{ paddingRight: `max(${padding}px, 16px)` }}
      >
        <div className="w-full">
          <textarea
            ref={textareaRef}
            placeholder="Say Something..."
            value={inputChat}
            onChange={handleChat}
            onKeyDown={handleKeyDown}
            onBlur={stopTyping}
            rows={1}
            className="flex-1 py-3 max-md:py-2 px-6 max-md:px-4 custom-scrollbar rounded-[6px] bg-white placeholder:text-[#8F8F8F] text-dark-blue-cm w-full text-sm max-md:text-[13px] leading-[1.71428571] focus:outline-none resize-none overflow-y-auto"
            style={{ maxHeight: "120px" }}
          />
        </div>

        <UploadInput
          className="!w-auto"
          required={false}
          label=""
          mode="accounts"
          preSelectedImages={mediaFiles}
          preSelectedImageIds={mediaFileIds}
          setImageFileMulti={setMediaFiles}
          multipleSelect={true}
          folder={`/chats/${conversationId}/images`}
          trigger={
            <button
              type="button"
              className="w-12 h-12 max-md:w-10 max-md:h-10 flex min-w-12 max-md:min-w-10 items-center justify-center rounded-full bg-[#54DC00]"
            >
              <svg
                width="24"
                height="25"
                viewBox="0 0 24 25"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="max-md:w-5 max-md:h-5"
              >
                <path
                  d="M9 17H15V11H19L12 4L5 11H9V17ZM12 6.83L14.17 9H13V15H11V9H9.83L12 6.83ZM5 19H19V21H5V19Z"
                  fill="#002029"
                />
              </svg>
            </button>
          }
        />

        <button type="submit" disabled={disabled} className="disabled:opacity-50">
          <SendIcon />
        </button>
      </form>
    </div>
  );
};

export default ChatInput;

/* ------------------ Helpers ------------------ */
const PreviewItem = ({
  item,
  onRemove,
}: {
  item: UploadFileType;
  onRemove: () => void;
}) => (
  <div className="border relative border-gray-1 rounded-md">
    <button
      onClick={onRemove}
      type="button"
      className="absolute top-0 right-0 p-1 bg-white/80 rounded-sm"
    >
      <IconClose className="w-3 h-3 fill-dark-blue-cm" />
    </button>
    <Image
      src={item.url || ""}
      alt={item.alt || ""}
      width={70}
      height={70}
      className="w-[70px] h-[70px] max-md:w-[60px] max-md:h-[60px] object-cover rounded-md"
      unoptimized
    />
  </div>
);

const SendIcon = () => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 48 48"
    fill="none"
    className="max-md:w-10 max-md:h-10"
  >
    <rect width="48" height="48" rx="24" fill="#54DC00" />
    <path
      d="M25.267 16.21c-.3-.286-.775-.274-1.061.026-.286.3-.274.775.026 1.06l6.252 5.955H15.75a.75.75 0 0 0 0 1.5h14.734l-6.251 5.955c-.3.286-.311.761-.026 1.061.285.3.76.311 1.06.026l7.42-7.067a.75.75 0 0 0 0-1.087l-7.42-7.067Z"
      fill="#002029"
    />
  </svg>
);
