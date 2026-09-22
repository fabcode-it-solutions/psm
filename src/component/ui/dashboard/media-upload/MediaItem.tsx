import React from "react";
import Image from "next/image";
import { Media } from "@/types";
import { Check, Trash } from "lucide-react";
import { deleteFile } from "@/actions/upload";

interface MediaItemProps {
  media: Media;
  isSelected: boolean;
  multipleSelect: boolean;
  onSelect: () => void;
  loadMedia: () => void;
}

const MediaItem: React.FC<MediaItemProps> = ({
  media,
  isSelected,
  multipleSelect,
  onSelect,
  loadMedia,
}) => {
  const deleteFileDB = async () => {
    if (confirm("Are you sure? You want to delete this media?")) {
      await deleteFile(media?.url);
      await fetch(`/api/media/${media?.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      loadMedia();
    }
  };
  return (
    <div className="relative group">
      <button
        className="absolute top-1 group-hover:opacity-100 opacity-0 right-1 z-10 bg-red-600 w-5 h-5 rounded-sm flex items-center justify-center"
        onClick={() => deleteFileDB()}
      >
        <Trash className="w-4 h-4 stroke-white" />
      </button>
      <div className={`relative cursor-pointer`} onClick={onSelect}>
        {/* Selection indicator */}
        <div className="absolute top-1 left-1 z-10">
          {multipleSelect ? (
            <div
              className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center ${
                isSelected
                  ? "bg-accent-100 border-accent-100"
                  : "bg-white border-gray-300"
              }`}
            >
              {isSelected && <Check className="w-3 h-3" />}
            </div>
          ) : (
            <div
              className={`w-4 h-4 rounded-sm border-2 ${
                isSelected
                  ? "bg-accent-100 border-accent-100"
                  : "bg-white border-gray-300"
              }`}
            >
              {isSelected && <Check className="w-3 h-3" />}
            </div>
          )}
        </div>

        {/* Image */}
        <div className="relative pb-[100%] w-full">
          <Image
            src={media?.url ?? ""}
            width={100}
            height={100}
            alt={media?.altText ?? ""}
            className={`w-full h-full absolute top-0 left-0 border-2 rounded-lg object-center object-cover transition-all ${
              isSelected
                ? "border-accent-100"
                : "border-gray-1/20 hover:border-gray-1/40"
            }`}
            unoptimized
          />
        </div>
      </div>
    </div>
  );
};

export default MediaItem;
