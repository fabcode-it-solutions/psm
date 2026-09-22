import React from "react";
import { Media } from "@/types";
import MediaItem from "./MediaItem";

interface MediaGridProps {
  medias: Media[] | null;
  fetchLoading: boolean;
  selectedImages: number[];
  multipleSelect: boolean;
  onImageSelection: (imageId: number, url?: string, alt?: string) => void;
  loadMedia: () => void;
  itemsPerPage: number;
}

const MediaGrid: React.FC<MediaGridProps> = ({
  medias,
  fetchLoading,
  selectedImages,
  multipleSelect,
  onImageSelection,
  loadMedia,
  itemsPerPage,
}) => {
  if (fetchLoading) {
    return (
      <div className="grid grid-cols-[repeat(8,1fr)] gap-2 my-3">
        {Array.from({ length: itemsPerPage }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse w-full h-[70px] bg-gray-5/20 rounded-lg"
          ></div>
        ))}
      </div>
    );
  }

  if (!medias || medias.length === 0) {
    return (
      <div className="flex w-full justify-center mt-4 mb-4 text-gray-500">
        No Images
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(8,1fr)] gap-2 my-3">
      {medias.map((item: Media) => (
        <MediaItem
          loadMedia={loadMedia}
          key={item.id}
          media={item}
          isSelected={selectedImages.includes(item.id)}
          multipleSelect={multipleSelect}
          onSelect={() => onImageSelection(item.id, item.url, item.altText)}
        />
      ))}
    </div>
  );
};

export default React.memo(MediaGrid);
