/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import MediaViewModal from "@/component/ui/dashboard/media-upload/MediaViewModal";
import UploadInput from "@/component/ui/dashboard/media-upload/UploadInput";
import { updatePartField } from "@/libs/redux/slices/partsSlice";
import { RootState } from "@/libs/redux/store";
import { mediaService } from "@/services/media.services";
import { UploadFileType } from "@/types";
import { MediaItem } from "@/types/media.types";
import { Eye, GripVertical, Plus, Upload } from "lucide-react";
import Image from "next/image";
import React, { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createSwapy, Swapy } from "swapy";

const Media = () => {
  const dispatch = useDispatch();
  const partMedia = useSelector((state: RootState) => state.part.part?.media);

  const [mediaFiles, setMediaFiles] = useState<UploadFileType[]>([]);
  const [selectedMediaItem, setSelectedMediaItem] = useState<MediaItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  
  const swapyRef = useRef<Swapy | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

 
  const mediaFileIds = useMemo(() => 
    mediaFiles.map(item => Number(item.id)), 
    [mediaFiles]
  );

  const orderedMediaMap = useMemo(() => 
    mediaFiles.map((item, index) => ({
      id: Number(item.id),
      order: index + 1,
      url: item.url || "",
      alt: item.alt || "",
    })), 
    [mediaFiles]
  );


  useEffect(() => {
    if (partMedia && mediaFiles.length === 0) {
      setMediaFiles(partMedia);
    }
  }, [partMedia]);


  const setupSwapy = useCallback(() => {
    if (!containerRef.current || mediaFiles.length === 0) return;

    swapyRef.current?.destroy();
    swapyRef.current = createSwapy(containerRef.current);

    swapyRef.current.onSwapEnd((event) => {
      if (!event.hasChanged) return;

      const orderMap = event.slotItemMap.asObject;
      const fileMap = new Map(mediaFiles.map(f => [String(f.id), f]));
      
      const reordered = Object.keys(orderMap)
        .sort((a, b) => Number(a) - Number(b))
        .map(slot => fileMap.get(orderMap[slot]))
        .filter(Boolean) as UploadFileType[];

      setMediaFiles(reordered);
    });
  }, [mediaFiles]);


  useEffect(() => {
    setupSwapy();
    return () => swapyRef.current?.destroy();
  }, [setupSwapy]);


  useEffect(() => {
    dispatch(updatePartField({ key: "media", value: orderedMediaMap }));
  }, [dispatch, orderedMediaMap]);


  const handleMediaView = useCallback(async (id: number) => {
    setLoading(true);
    try {
      const media = await mediaService.getMediaById({ id });
      setSelectedMediaItem(media);
      setShowMediaModal(true);
    } catch (error) {
      console.error('Failed to fetch media:', error);
    } finally {
      setLoading(false);
    }
  }, []);


  const handleCloseModal = useCallback(() => {
    setShowMediaModal(false);
    setSelectedMediaItem(null);
  }, []);

  const UploadTrigger = useMemo(() => (
    <div className="relative w-[80px] h-[80px] bg-gray-5/5 rounded-lg border border-gray-5/20 flex items-center justify-center">
      <Plus className="text-white" />
    </div>
  ), []);


  const EmptyState = useMemo(() => (
    <div className="text-center py-12 bg-gray-5/5 rounded-lg border-2 border-dashed border-gray-5/20">
      <Upload className="w-8 h-8 text-gray-4 mx-auto mb-4" />
      <p className="text-gray-4 text-sm font-sofia-sans">
        No media files uploaded yet.
      </p>
      <p className="text-gray-5 text-xs font-sofia-sans mt-1">
        Add product images.
      </p>
    </div>
  ), []);

  return (
    <div className="space-y-6">
      {mediaFiles.length === 0 ? (
        <UploadInput
          label=""
          required
          setImageFileMulti={setMediaFiles}
          preSelectedImages={mediaFiles}
          multipleSelect
          trigger={EmptyState}
        />
      ) : (
        <div className="flex flex-wrap gap-2" ref={containerRef}>
          <UploadInput
            label=""
            required
            setImageFileMulti={setMediaFiles}
            preSelectedImages={mediaFiles}
            preSelectedImageIds={mediaFileIds}
            multipleSelect
            className="!w-auto"
            trigger={UploadTrigger}
          />

          {mediaFiles.map((file, index) => (
            <MediaFileItem
              key={file.id}
              file={file}
              index={index}
              loading={loading}
              onView={handleMediaView}
            />
          ))}
        </div>
      )}

      {showMediaModal && selectedMediaItem && (
        <MediaViewModal
          isOpen={showMediaModal}
          onClose={handleCloseModal}
          media={selectedMediaItem}
        />
      )}
    </div>
  );
};


const MediaFileItem = React.memo<{
  file: UploadFileType;
  index: number;
  loading: boolean;
  onView: (id: number) => void;
}>(({ file, index, loading, onView }) => (
  <div
    className="relative bg-gray-5/20 group rounded-lg overflow-hidden border border-gray-5/20 flex justify-center"
    data-swapy-slot={index}
  >
    {file.url && (
      <div data-swapy-item={file.id} className="relative">
        <div
          className="handle absolute top-0.5 left-0.5 z-[2]"
          data-swapy-handle
        >
          <GripVertical className="w-4 h-4 text-gray-4 cursor-move" />
        </div>
        <Image
          src={file.url}
          alt={file.alt || ""}
          width={80}
          height={80}
          unoptimized
          className="object-cover block w-[80px] h-[80px]"
        />
        <button
          type="button"
          onClick={() => file.id && onView(file.id)}
          className="opacity-0 transition-all z-[1] top-0 left-0 items-center flex justify-center bg-dark-100/70 duration-200 absolute w-full h-full group-hover:opacity-100"
          disabled={loading}
        >
          <span className="bg-accent-100 w-5 h-5 rounded-sm flex items-center justify-center">
            <Eye className="text-white w-4 h-4" />
          </span>
        </button>
      </div>
    )}
  </div>
));

MediaFileItem.displayName = "MediaFileItem";

export default Media;