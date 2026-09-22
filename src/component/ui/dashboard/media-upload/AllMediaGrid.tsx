// src/component/ui/dashboard/media-upload/MediaGrid.tsx
"use client";

import React from "react";
import {
  Eye,
  Trash2,
  Download,
  Image as ImageIcon,
  Video,
  Music,
  FileText,
  Archive,
  File,
  EyeOff,
  AlertTriangle,
} from "lucide-react";
import {
  MediaGridProps,
  MediaItem,
  isImageType,
  isVideoType,
} from "@/types/media.types";
import Image from "next/image";

const MediaGrid: React.FC<MediaGridProps> = ({
  media,
  selectedMedia,
  onMediaSelect,
  onMediaView,
  onMediaDelete,
  loading = false,
}) => {
  const getMediaIcon = (mediaType: string) => {
    switch (mediaType) {
      case "image":
      case "vector":
        return <ImageIcon className="w-6 h-6 text-blue-400" />;
      case "video":
        return <Video className="w-6 h-6 text-purple-400" />;
      case "audio":
        return <Music className="w-6 h-6 text-green-400" />;
      case "archive":
        return <Archive className="w-6 h-6 text-yellow-400" />;
      case "document":
      case "spreadsheet":
      case "presentation":
        return <FileText className="w-6 h-6 text-gray-4" />;
      default:
        return <File className="w-6 h-6 text-gray-4" />;
    }
  };

  const handleDownload = (media: MediaItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement("a");
    link.href = media.url;
    link.download = media.originalFilename || media.filename || "file";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = (mediaId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onMediaDelete(mediaId);
  };

  const handleSelect = (mediaId: number) => {
    onMediaSelect(mediaId);
  };

  const renderMediaPreview = (mediaItem: MediaItem) => {
    if (isImageType(mediaItem.type)) {
      return (
        <Image
          src={mediaItem.url}
          alt={mediaItem.altText || "Media"}
          className="w-full h-full object-cover"
          width={1080}
          height={1080}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
            target.nextElementSibling?.classList.remove("hidden");
          }}
        />
      );
    }

    if (isVideoType(mediaItem.type)) {
      return (
        <div className="relative w-full h-full bg-gray-5/10 flex items-center justify-center">
          <Video className="w-8 h-8 text-gray-4" />
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Video className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full h-full bg-gray-5/10 flex items-center justify-center">
        {getMediaIcon(mediaItem.type)}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-10 gap-4">
        {Array.from({ length: 40 }).map((_, index) => (
          <div
            key={index}
            className="aspect-square bg-gray-5/10 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (media.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto bg-gray-5/20 rounded-full flex items-center justify-center mb-4">
          <ImageIcon className="w-8 h-8 text-gray-4" />
        </div>
        <h3 className="text-lg font-medium text-light-100 font-sofia-sans mb-2">
          No media files found
        </h3>
        <p className="text-gray-4 font-sofia-sans">
          Upload some files or adjust your filters to see media items.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-10 gap-4">
      {media.map((mediaItem) => {
        const isSelected = selectedMedia.includes(mediaItem.id);

        return (
          <div
            key={mediaItem.id}
            className={`
              group relative aspect-square bg-gray-5/5 rounded-lg border overflow-hidden cursor-pointer
              transition-all duration-200 hover:border-accent-100/50 hover:shadow-lg
              ${
                isSelected
                  ? "border-accent-100 ring-2 ring-accent-100/20"
                  : "border-gray-5/20"
              }
            `}
            onClick={() => onMediaView(mediaItem)}
          >
            {/* Selection Checkbox */}
            <div className="absolute top-2 left-2 z-10">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleSelect(mediaItem.id)}
                onClick={(e) => e.stopPropagation()}
                className="w-4 h-4 rounded border-2 border-gray-5/40 bg-dark-100 text-accent-100 focus:ring-accent-100/20"
              />
            </div>

            {/* Status Indicators */}
            <div className="absolute top-2 right-2 z-10 flex gap-1">
              {!mediaItem.isPublic && (
                <div className="w-6 h-6 bg-red-500/80 rounded-full flex items-center justify-center">
                  <EyeOff className="w-3 h-3 text-white" />
                </div>
              )}
              {mediaItem.isArchived && (
                <div className="w-6 h-6 bg-yellow-500/80 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-3 h-3 text-white" />
                </div>
              )}
            </div>

            {/* Media Preview */}
            <div className="w-full h-full">
              {renderMediaPreview(mediaItem)}
              {/* Fallback for broken images */}
              <div className="w-full h-full bg-gray-5/10 flex items-center justify-center">
                {getMediaIcon(mediaItem.type)}
              </div>
            </div>

            {/* Overlay with Actions */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="flex gap-2">
                <button
                  onClick={() => onMediaView(mediaItem)}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                  title="View details"
                >
                  <Eye className="w-4 h-4 text-white" />
                </button>

                <button
                  onClick={(e) => handleDownload(mediaItem, e)}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                  title="Download"
                >
                  <Download className="w-4 h-4 text-white" />
                </button>

                <button
                  onClick={(e) => handleDelete(mediaItem.id, e)}
                  className="p-2 bg-red-500/60 hover:bg-red-500/80 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Media Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="text-white">
                <p className="text-sm font-medium font-sofia-sans truncate">
                  {mediaItem.originalFilename ||
                    mediaItem.name ||
                    mediaItem.altText ||
                    "Untitled"}
                </p>
                <div className="flex items-center justify-between text-xs text-white/80 font-sofia-sans">
                  <span className="capitalize">{mediaItem.type}</span>
                  <span>{mediaItem.size ? mediaItem.size : ""}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MediaGrid;
