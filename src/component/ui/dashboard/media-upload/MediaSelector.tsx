/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, ChangeEvent, useCallback } from "react";
import { Media, PaginationState, UploadFileType } from "@/types";
import toast from "react-hot-toast";
import { useApiRequest } from "@/hooks/useApiRequest";
import { PaginationInfo } from "@/types/brands.types";
import Pagination from "../Pagination";
import { FormField } from "../FormField";
import FileUploadArea from "./FileUploadArea";
import MediaGrid from "./MediaGrid";

interface MediaSelectorProps {
  onFileUpload: (file: File) => Promise<void>;
  onImagesSelected: (
    imageIds: number[],
    url?: string,
    images?: UploadFileType[]
  ) => void;
  onCancel: () => void;
  multipleSelect: boolean;
  preSelectedImageIds: number[];
  requiredWidth?: number;
  requiredHeight?: number;
  uploadInputId: string;
  mode?: string;
  preSelectedImages?: UploadFileType[];
}

const MediaSelector: React.FC<MediaSelectorProps> = ({
  onFileUpload,
  onImagesSelected,
  onCancel,
  multipleSelect,
  preSelectedImageIds,
  requiredWidth,
  requiredHeight,
  uploadInputId,
  mode,
  preSelectedImages,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [medias, setMedias] = useState<Media[] | null>(null);
  const [selectedImages, setSelectedImages] =
    useState<number[]>(preSelectedImageIds);
  const [multiSelectedImages, setMultiSelectedImages] = useState<
    UploadFileType[]
  >([]);
  const [selectedUrl, setSelectedUrl] = useState("");
  const [paginationState, setPaginationState] = useState<PaginationState>({
    itemsPerPage: 32,
    totalPages: 1,
    totalItems: 0,
    hasNext: false,
    hasPrev: false,
  });

  const { request: fetchBrands, loading: fetchLoading } = useApiRequest<{
    success: boolean;
    data?: Media | Media[];
    pagination?: PaginationInfo;
    error?: string;
    message?: string;
  }>();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await onFileUpload(file);
      e.target.value = "";
      setTimeout(() => {
        loadMedia();
      }, 1000);
    }
  };

  const loadMedia = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      params.append("page", currentPage.toString());
      params.append("limit", paginationState.itemsPerPage.toString());
      params.append("type", "image");
      params.append("userId", String(localStorage.getItem("userIdOverlap")));
      if (searchTerm) params.append("search", searchTerm);

      const result = await fetchBrands({
        url: `/api/media?${params.toString()}`,
        options: { method: "GET" },
      });

      if (result?.success && Array.isArray(result.data)) {
        setMedias(result.data);
        if (result.pagination) {
          setPaginationState((prev) => ({ ...prev, ...result.pagination }));
        }
      } else {
        toast.error(result?.error || "Failed to fetch media");
      }
    } catch (error) {
      console.error("Error fetching media:", error);
      toast.error("Failed to fetch media");
    }
  }, [paginationState.itemsPerPage, searchTerm, currentPage]);

  useEffect(() => {
    if (!multipleSelect && preSelectedImageIds) {
      setSelectedImages(preSelectedImageIds);
    }
  }, [preSelectedImageIds]);
  useEffect(() => {
    if (preSelectedImages && multipleSelect) {
      setMultiSelectedImages(preSelectedImages);
    }
  }, [preSelectedImages]);
  const handleImageSelection = useCallback(
    (imageId: number, url?: string, alt?: string) => {
      if (multipleSelect) {
        setMultiSelectedImages((prev) => {
          if (prev.find((item) => item.id === imageId)) {
            return prev.filter((id) => id.id !== imageId);
          } else {
            return [
              ...prev,
              {
                alt: alt ?? "image",
                id: imageId,
                url,
              },
            ];
          }
        });
        setSelectedImages((prev) =>
          prev.includes(imageId)
            ? prev.filter((id) => id !== imageId)
            : [...prev, imageId]
        );
      } else {
        if (url) setSelectedUrl(url);
        setSelectedImages([imageId]);
      }
    },
    [multipleSelect] // dependencies
  );

  const handleDone = useCallback(() => {
    onImagesSelected(selectedImages, selectedUrl, multiSelectedImages);
  }, [selectedImages, selectedUrl, multiSelectedImages]);
  useEffect(() => {
    loadMedia();
  }, [currentPage, searchTerm]);
  return (
    <div>
      <div className="flex-1 flex items-center gap-2 mb-4">
        <FormField
          className="flex-1"
          name="search"
          type="text"
          placeholder="Search Image..."
          value={searchTerm}
          onChange={handleSearch}
          mode={mode}
        />
      </div>

      <FileUploadArea
        uploadInputId={uploadInputId}
        requiredWidth={requiredWidth}
        requiredHeight={requiredHeight}
        onFileChange={handleFileChange}
      />

      <MediaGrid
        loadMedia={loadMedia}
        medias={medias}
        fetchLoading={fetchLoading}
        selectedImages={selectedImages}
        multipleSelect={multipleSelect}
        itemsPerPage={paginationState.itemsPerPage}
        onImageSelection={handleImageSelection}
      />

      <Pagination
        currentPage={currentPage}
        hasNext={paginationState.hasNext}
        hasPrev={paginationState.hasPrev}
        itemsPerPage={paginationState.itemsPerPage}
        setCurrentPage={setCurrentPage}
        totalItems={paginationState.totalItems}
        totalPages={paginationState.totalPages}
      />

      <div className="flex gap-3 justify-end pt-4">
        <button
          type="button"
          onClick={onCancel}
          className={`px-4 py-2 border border-gray-5/20 rounded  hover:bg-gray-5/10 font-sofia-sans ${
            mode == "light" ? "" : "text-light-100"
          }`}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleDone}
          className="px-4 py-2 bg-accent-100 text-dark-100 rounded hover:bg-accent-100/90 disabled:opacity-50 font-sofia-sans font-medium"
        >
          Done {selectedImages.length > 0 && `(${selectedImages.length})`}
        </button>
      </div>
    </div>
  );
};

export default MediaSelector;
