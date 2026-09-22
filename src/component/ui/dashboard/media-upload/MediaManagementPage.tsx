// src/app/dashboard/media/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Upload,
  Grid3X3,
  List,
  Trash2,
  Archive,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

// Components
import PageHeader from "@/component/dashboard/PageHeader";
import { FormField } from "@/component/ui/dashboard/FormField";
import Dropdown from "@/component/ui/dashboard/Dropdown";
import MultipleFileUpload from "@/component/ui/dashboard/media-upload/MultipleFileUpload";
import MediaViewModal from "@/component/ui/dashboard/media-upload/MediaViewModal";

// Types and hooks
import {
  MediaItem,
  MediaFilters,
  MediaSortConfig,
  MediaApiResponse,
  BulkMediaOperation,
  MEDIA_TYPES,
  DATE_RANGES,
} from "@/types/media.types";
import { useApiRequest } from "@/hooks/useApiRequest";
import MediaGrid from "./AllMediaGrid";

interface PaginatedMediaResponse extends MediaApiResponse<MediaItem[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  counts: {
    images: number;
    videos: number;
    documents: number;
  };
}
const sortConfig = {
  field: "createdAt",
  direction: "desc",
};
const MediaManagementPage: React.FC = () => {
  // State
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [counts, setCounts] = useState({
    images: 0,
    videos: 0,
    documents: 0,
  });
  const [selectedMedia, setSelectedMedia] = useState<number[]>([]);
  const [selectedMediaItem, setSelectedMediaItem] = useState<MediaItem | null>(
    null
  );
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(48);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Filters and sorting
  const [filters, setFilters] = useState<MediaFilters>({
    search: "",
    type: "",
    entityType: "",
    isPublic: "",
    isArchived: "",
    dateRange: "",
    userId: "",
  });

  // API requests
  const { request: fetchMedia, loading: fetchLoading } =
    useApiRequest<PaginatedMediaResponse>();
  const { request: bulkOperation, loading: bulkLoading } =
    useApiRequest<MediaApiResponse>();
  const { request: deleteMedia } = useApiRequest<MediaApiResponse>();

  // Load media on mount and when filters/pagination change
  useEffect(() => {
    loadMedia();
  }, [currentPage, itemsPerPage, filters, sortConfig]);

  const loadMedia = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.type && { type: filters.type }),
        ...(filters.entityType && { entityType: filters.entityType }),
        ...(filters.isPublic && { isPublic: filters.isPublic }),
        ...(filters.isArchived && { isArchived: filters.isArchived }),
        ...(filters.dateRange && { dateRange: filters.dateRange }),
        ...(filters.userId && { userId: filters.userId }),
        sortBy: sortConfig.field,
        sortOrder: sortConfig.direction,
      });

      const result = await fetchMedia({
        url: `/api/media?${params.toString()}`,
        options: { method: "GET" },
      });

      if (result?.success && result.data) {
        setMedia(result.data);
        if (result.counts) {
          setCounts(result.counts);
        }
        if (result.pagination) {
          setTotalPages(result.pagination.totalPages);
          setTotalItems(result.pagination.total);
        }
      } else {
        toast.error(result?.error || "Failed to fetch media");
      }
    } catch (error) {
      console.error("Error fetching media:", error);
      toast.error("Failed to fetch media");
    }
  };

  const handleFilterChange = (key: keyof MediaFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleMediaSelect = (mediaId: number) => {
    setSelectedMedia((prev) =>
      prev.includes(mediaId)
        ? prev.filter((id) => id !== mediaId)
        : [...prev, mediaId]
    );
  };

  const handleSelectAll = () => {
    if (selectedMedia.length === media.length) {
      setSelectedMedia([]);
    } else {
      setSelectedMedia(media.map((m) => m.id));
    }
  };

  const handleMediaView = (mediaItem: MediaItem) => {
    setSelectedMediaItem(mediaItem);
    setShowMediaModal(true);
  };

  const handleMediaUpdate = (updatedMedia: MediaItem) => {
    setMedia((prev) =>
      prev.map((m) => (m.id === updatedMedia.id ? updatedMedia : m))
    );
  };

  const handleMediaDelete = async (mediaId: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this media? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const result = await deleteMedia({
        url: `/api/media/${mediaId}`,
        options: { method: "DELETE" },
      });

      if (result?.success) {
        toast.success("Media deleted successfully");
        setMedia((prev) => prev.filter((m) => m.id !== mediaId));
        setSelectedMedia((prev) => prev.filter((id) => id !== mediaId));
      } else {
        toast.error(result?.error || "Failed to delete media");
      }
    } catch (error) {
      console.error("Error deleting media:", error);
      toast.error("Failed to delete media");
    }
  };

  const handleBulkOperation = async (
    operation: BulkMediaOperation["action"]
  ) => {
    if (selectedMedia.length === 0) {
      toast.error("Please select media items first");
      return;
    }

    const confirmMessages = {
      delete:
        "Are you sure you want to delete the selected media? This action cannot be undone.",
      archive: "Archive the selected media items?",
      unarchive: "Unarchive the selected media items?",
      makePublic: "Make the selected media items public?",
      makePrivate: "Make the selected media items private?",
    };

    if (!confirm(confirmMessages[operation])) {
      return;
    }

    try {
      const result = await bulkOperation({
        url: "/api/media/bulk",
        options: {
          method: "POST",
          body: {
            action: operation,
            mediaIds: selectedMedia,
          },
        },
      });

      if (result?.success) {
        toast.success(result.message || "Operation completed successfully");
        setSelectedMedia([]);
        loadMedia(); // Reload data
      } else {
        toast.error(result?.error || "Operation failed");
      }
    } catch (error) {
      console.error("Error in bulk operation:", error);
      toast.error("Operation failed");
    }
  };

  const handleFilesUpload = (files: File[]) => {
    // Files are handled in the MultipleFileUpload component
    console.log("Files to upload:", files);
  };

  const handleUploadComplete = () => {
    toast.success("Files uploaded successfully");
    setShowUploadModal(false);
    loadMedia(); // Reload media
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      type: "",
      entityType: "",
      isPublic: "",
      isArchived: "",
      dateRange: "",
      userId: "",
    });
    setCurrentPage(1);
  };
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        heading="Media Library"
        describe="Manage your media files including images, videos, and documents"
      />

      {/* Top Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-4" />
            <FormField
              type="text"
              placeholder="Search media files..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="pl-10"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors font-sofia-sans
              ${
                showFilters
                  ? "bg-accent-100/20 text-accent-100 border-accent-100/30"
                  : "bg-gray-5/10 text-gray-4 border-gray-5/20 hover:border-gray-5/40"
              }
            `}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* View and Actions */}
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="hidden bg-gray-5/10 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`
                p-2 rounded transition-colors
                ${
                  viewMode === "grid"
                    ? "bg-accent-100/20 text-accent-100"
                    : "text-gray-4 hover:text-light-100"
                }
              `}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`
                p-2 rounded transition-colors
                ${
                  viewMode === "list"
                    ? "bg-accent-100/20 text-accent-100"
                    : "text-gray-4 hover:text-light-100"
                }
              `}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Refresh */}
          <button
            onClick={loadMedia}
            disabled={fetchLoading}
            className="p-2 text-gray-4 hover:text-light-100 transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw
              className={`w-4 h-4 ${fetchLoading ? "animate-spin" : ""}`}
            />
          </button>

          {/* Upload Button */}
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-accent-100 text-dark-100 rounded-lg hover:bg-accent-100/90 transition-colors font-sofia-sans font-medium"
          >
            <Upload className="w-4 h-4" />
            Upload Media
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-gray-5/5 border border-gray-5/20 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <Dropdown
              label="Type"
              options={[
                { value: "all", label: "All Types" },
                ...MEDIA_TYPES.map((t) => ({ value: t.value, label: t.label })),
              ]}
              selectedText={String(filters.type)}
              onValueChange={(value) => handleFilterChange("type", value)}
              placeholder="Select type..."
            />

            <Dropdown
              label="Status"
              options={[
                { value: "all", label: "All" },
                { value: "false", label: "Active" },
                { value: "true", label: "Archived" },
              ]}
              selectedText={filters.isArchived}
              onValueChange={(value) => handleFilterChange("isArchived", value)}
              placeholder="Select status..."
            />

            <Dropdown
              label="Date Range"
              options={DATE_RANGES}
              selectedText={filters.dateRange}
              onValueChange={(value) => handleFilterChange("dateRange", value)}
              placeholder="Select date range..."
            />

            <FormField
              label="User ID"
              type="number"
              placeholder="Filter by user..."
              value={filters.userId}
              onChange={(e) => handleFilterChange("userId", e.target.value)}
            />
          </div>

          <div className="flex justify-end mt-4">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-4 hover:text-light-100 transition-colors font-sofia-sans"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Bulk Actions Bar */}
      {selectedMedia.length > 0 && (
        <div className="bg-accent-100/10 border border-accent-100/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-light-100 font-sofia-sans">
                {selectedMedia.length} item{selectedMedia.length > 1 ? "s" : ""}{" "}
                selected
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBulkOperation("makePublic")}
                  disabled={bulkLoading}
                  className="flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 rounded text-sm font-sofia-sans hover:bg-green-500/30 transition-colors disabled:opacity-50"
                >
                  <Eye className="w-3 h-3" />
                  Make Public
                </button>

                <button
                  onClick={() => handleBulkOperation("makePrivate")}
                  disabled={bulkLoading}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-400 rounded text-sm font-sofia-sans hover:bg-blue-500/30 transition-colors disabled:opacity-50"
                >
                  <EyeOff className="w-3 h-3" />
                  Make Private
                </button>

                <button
                  onClick={() => handleBulkOperation("archive")}
                  disabled={bulkLoading}
                  className="flex items-center gap-2 px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded text-sm font-sofia-sans hover:bg-yellow-500/30 transition-colors disabled:opacity-50"
                >
                  <Archive className="w-3 h-3" />
                  Archive
                </button>

                <button
                  onClick={() => handleBulkOperation("delete")}
                  disabled={bulkLoading}
                  className="flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-400 rounded text-sm font-sofia-sans hover:bg-red-500/30 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              </div>
            </div>

            <button
              onClick={() => setSelectedMedia([])}
              className="text-gray-4 hover:text-light-100 transition-colors font-sofia-sans text-sm"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Media Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-gray-5/5 border border-gray-5/20 rounded-lg p-4">
          <div className="text-2xl font-bold text-light-100 font-sofia-sans">
            {totalItems}
          </div>
          <div className="text-sm text-gray-4 font-sofia-sans">Total Files</div>
        </div>

        <div className="bg-gray-5/5 border border-gray-5/20 rounded-lg p-4">
          <div className="text-2xl font-bold text-light-100 font-sofia-sans">
            {counts.images}
          </div>
          <div className="text-sm text-gray-4 font-sofia-sans">Images</div>
        </div>

        <div className="bg-gray-5/5 border border-gray-5/20 rounded-lg p-4">
          <div className="text-2xl font-bold text-light-100 font-sofia-sans">
            {counts.videos}
          </div>
          <div className="text-sm text-gray-4 font-sofia-sans">Videos</div>
        </div>

        <div className="bg-gray-5/5 border border-gray-5/20 rounded-lg p-4">
          <div className="text-2xl font-bold text-light-100 font-sofia-sans">
            {counts.documents}
          </div>
          <div className="text-sm text-gray-4 font-sofia-sans">Documents</div>
        </div>
      </div>

      {/* Media Grid/List */}
      <div className="space-y-4">
        {/* Select All */}
        {media.length > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={
                    selectedMedia.length === media.length && media.length > 0
                  }
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded border-2 border-gray-5/40 bg-dark-100 text-accent-100 focus:ring-accent-100/20"
                />
                <span className="text-sm text-gray-4 font-sofia-sans">
                  Select All ({media.length})
                </span>
              </label>
            </div>

            <Dropdown
              options={[
                { value: "12", label: "12 per page" },
                { value: "24", label: "24 per page" },
                { value: "48", label: "48 per page" },
                { value: "96", label: "96 per page" },
              ]}
              selectedText={itemsPerPage.toString()}
              onValueChange={(value) => {
                setItemsPerPage(parseInt(value));
                setCurrentPage(1);
              }}
              placeholder="Items per page"
            />
          </div>
        )}

        {/* Media Display */}
        <MediaGrid
          media={media}
          viewMode={viewMode}
          selectedMedia={selectedMedia}
          onMediaSelect={handleMediaSelect}
          onMediaView={handleMediaView}
          onMediaDelete={handleMediaDelete}
          loading={fetchLoading}
        />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-4 font-sofia-sans">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}{" "}
            results
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-2 text-gray-4 hover:text-light-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-sofia-sans"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                const isCurrentPage = page === currentPage;

                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`
                      px-3 py-2 rounded transition-colors font-sofia-sans
                      ${
                        isCurrentPage
                          ? "bg-accent-100 text-dark-100"
                          : "text-gray-4 hover:text-light-100 hover:bg-gray-5/10"
                      }
                    `}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-2 text-gray-4 hover:text-light-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-sofia-sans"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-dark-100 border border-gray-5/20 rounded-lg shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-5/20">
              <h2 className="text-lg font-semibold text-light-100 font-sofia-sans">
                Upload Media Files
              </h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-2 text-gray-4 hover:text-light-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6">
              <MultipleFileUpload
                onFilesUpload={handleFilesUpload}
                onUploadComplete={handleUploadComplete}
                maxFiles={20}
                maxSize={50}
                accept="*/*"
              />
            </div>
          </div>
        </div>
      )}

      {/* Media View Modal */}
      {showMediaModal && selectedMediaItem && (
        <MediaViewModal
          isOpen={showMediaModal}
          onClose={() => {
            setShowMediaModal(false);
            setSelectedMediaItem(null);
          }}
          media={selectedMediaItem}
          onUpdate={handleMediaUpdate}
          onDelete={handleMediaDelete}
        />
      )}
    </div>
  );
};

export default MediaManagementPage;
