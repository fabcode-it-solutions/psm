"use client";

import React, { useCallback, useState } from "react";
import { FileRejection, useDropzone } from "react-dropzone";
import {
  Upload,
  X,
  File,
  Image as ImageIcon,
  Video,
  Music,
  FileText,
  Archive,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import {
  MediaUploadAreaProps,
  formatFileSize,
  getMediaTypeFromMimeType,
} from "@/types/media.types";
import Image from "next/image";
import { uploadFile } from "@/utils/uploadFile";

interface UploadFile extends File {
  file?: File;
  id: string;
  preview?: string;
  uploadProgress?: number;
  uploadStatus?: "pending" | "uploading" | "success" | "error";
  errorMessage?: string;
}
type UploadResult =
  | { file: UploadFile; result: unknown; error?: undefined }
  | { file: UploadFile; result?: undefined; error: Error }
  | undefined;
interface MultipleFileUploadProps extends MediaUploadAreaProps {
  onUploadComplete?: (uploadedFiles: UploadFile[]) => void;
  onUploadError?: (files: UploadFile[], errors: string[]) => void;
}

const MultipleFileUpload: React.FC<MultipleFileUploadProps> = ({
  onFilesUpload,
  onUploadComplete,
  onUploadError,
  accept = "*/*",
  maxFiles = 10,
  maxSize = 10, // MB
  loading = false,
  className = "",
}) => {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      console.log(acceptedFiles, rejectedFiles);

      // Handle rejected files
      if (rejectedFiles.length > 0) {
        const errors = rejectedFiles.map((file) =>
          file.errors.map((error) => error.message).join(", ")
        );
        console.error("Rejected files:", errors);
      }

      // Process accepted files
      const newFiles: UploadFile[] = acceptedFiles.map((file) => ({
        ...file,
        id: `${Date.now()}-${Math.random()}`,
        uploadStatus: "pending",
        name: file.name,
        type: file.type,
        size: file.size,
        preview: file.type?.includes("image/")
          ? URL.createObjectURL(file)
          : undefined,
        file,
      }));

      setUploadFiles((prev) => [...prev, ...newFiles]);
      if (onFilesUpload) {
        onFilesUpload(acceptedFiles);
      }
    },
    [onFilesUpload]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept: accept ? { [accept]: [] } : undefined,
      maxFiles: maxFiles - uploadFiles.length,
      maxSize: maxSize * 1024 * 1024,
      disabled: loading || isUploading,
    });

  const removeFile = (fileId: string) => {
    setUploadFiles((prev) => {
      const file = prev.find((f) => f.id === fileId);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((f) => f.id !== fileId);
    });
  };

  const clearAllFiles = () => {
    uploadFiles.forEach((file) => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    setUploadFiles([]);
  };

  const uploadFilesFn = async () => {
    if (uploadFiles.length === 0) return;

    setIsUploading(true);
    const uploadPromises: Promise<UploadResult>[] = uploadFiles.map(
      async (file) => {
        try {
          // Update file status to uploading
          setUploadFiles((prev) =>
            prev.map((f) =>
              f.id === file.id
                ? { ...f, uploadStatus: "uploading", uploadProgress: 0 }
                : f
            )
          );

          const formData = new FormData();
          formData.append("file", file);
          formData.append("altText", "");
          formData.append("isPublic", "true");

          if (file && file.file) {
            const mediaType = getMediaTypeFromMimeType(file.type);
            const r = await uploadFile({
              file: file.file,
              folder: `/images/`,
              type: mediaType,
            });

            if (r.media) {
              // Update file status to success
              setUploadFiles((prev) =>
                prev.map((f) =>
                  f.id === file.id
                    ? {
                        ...f,
                        uploadStatus: "success",
                        uploadProgress: 100,
                      }
                    : f
                )
              );

              return { file, result: r.result };
            }
          }
        } catch (error) {
          console.error("Upload error:", error);

          // Update file status to error
          setUploadFiles((prev) =>
            prev.map((f) =>
              f.id === file.id
                ? {
                    ...f,
                    uploadStatus: "error",
                    errorMessage:
                      error instanceof Error ? error.message : "Upload failed",
                  }
                : f
            )
          );

          return {
            file,
            error: error instanceof Error ? error : new Error("Upload failed"),
          };
        }
      }
    );

    try {
      const results = await Promise.all(uploadPromises);
      const validResults = results.filter(
        (r): r is Exclude<UploadResult, undefined> => r !== undefined
      );

      const successful = validResults.filter((r) => r.result !== undefined);
      const failed = validResults.filter((r) => r.error !== undefined);

      if (successful.length > 0 && onUploadComplete) {
        onUploadComplete(successful.map((r) => r.file));
      }

      if (failed.length > 0 && onUploadError) {
        onUploadError(
          failed.map((r) => r.file),
          failed.map((r) => r.error?.message || "Upload failed")
        );
      }
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (file: UploadFile) => {
    const mediaType = getMediaTypeFromMimeType(file.type);

    switch (mediaType) {
      case "image":
      case "vector":
        return <ImageIcon className="w-8 h-8 text-blue-400" />;
      case "video":
        return <Video className="w-8 h-8 text-purple-400" />;
      case "audio":
        return <Music className="w-8 h-8 text-green-400" />;
      case "archive":
        return <Archive className="w-8 h-8 text-yellow-400" />;
      default:
        return <FileText className="w-8 h-8 text-gray-4" />;
    }
  };

  const getStatusIcon = (file: UploadFile) => {
    switch (file.uploadStatus) {
      case "uploading":
        return <Loader2 className="w-4 h-4 text-accent-100 animate-spin" />;
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return null;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-all duration-200
          ${
            isDragActive
              ? "border-accent-100 bg-accent-100/10"
              : "border-gray-5/20 hover:border-gray-5/40"
          }
          ${loading || isUploading ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <input {...getInputProps()} />

        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto bg-accent-100/20 rounded-full flex items-center justify-center">
            <Upload className="w-8 h-8 text-accent-100" />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-light-100 font-sofia-sans">
              {isDragActive ? "Drop files here" : "Upload Media Files"}
            </h3>
            <p className="text-sm text-gray-4 mt-1 font-sofia-sans">
              Drag and drop files here, or click to browse
            </p>
            <p className="text-xs text-gray-5 mt-2 font-sofia-sans">
              Max {maxFiles} files, up to {maxSize}MB each
            </p>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent-100/20 text-accent-100 rounded-lg hover:bg-accent-100/30 transition-colors font-sofia-sans font-medium"
            disabled={loading || isUploading}
          >
            <Upload className="w-4 h-4" />
            Choose Files
          </button>
        </div>
      </div>

      {/* File Rejections */}
      {fileRejections.length > 0 && (
        <div className="space-y-2">
          {fileRejections.map(({ file, errors }) => (
            <div
              key={file.name}
              className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span className="text-sm font-medium text-red-400 font-sofia-sans">
                  {file.name}
                </span>
              </div>
              <div className="ml-6 mt-1">
                {errors.map((error) => (
                  <p
                    key={error.code}
                    className="text-xs text-red-400 font-sofia-sans"
                  >
                    {error.message}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* File List */}
      {uploadFiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-light-100 font-sofia-sans">
              Files to Upload ({uploadFiles.length})
            </h4>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={uploadFilesFn}
                disabled={
                  isUploading ||
                  uploadFiles.every((f) => f.uploadStatus === "success")
                }
                className="px-3 py-1 bg-accent-100/20 text-accent-100 rounded text-xs font-sofia-sans hover:bg-accent-100/30 transition-colors disabled:opacity-50"
              >
                {isUploading ? "Uploading..." : "Upload All"}
              </button>
              <button
                type="button"
                onClick={clearAllFiles}
                disabled={isUploading}
                className="px-3 py-1 bg-red-500/20 text-red-400 rounded text-xs font-sofia-sans hover:bg-red-500/30 transition-colors disabled:opacity-50"
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 max-h-[calc(100dvh-550px)] overflow-auto">
            {uploadFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-4 p-4 bg-gray-5/5 rounded-lg border border-gray-5/20"
              >
                {/* File Preview */}
                <div className="flex-shrink-0">
                  {file.preview ? (
                    <Image
                      width={48}
                      height={48}
                      src={file.preview}
                      alt={file.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-5/10 rounded-lg flex items-center justify-center">
                      {getFileIcon(file)}
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-light-100 font-sofia-sans truncate">
                      {file.name}
                    </p>
                    {getStatusIcon(file)}
                  </div>
                  <p className="text-xs text-gray-4 font-sofia-sans">
                    {formatFileSize(file.size)}
                  </p>

                  {/* Progress Bar */}
                  {file.uploadStatus === "uploading" && (
                    <div className="mt-2 w-full bg-gray-5/20 rounded-full h-1">
                      <div
                        className="bg-accent-100 h-1 rounded-full transition-all duration-200"
                        style={{ width: `${file.uploadProgress || 0}%` }}
                      />
                    </div>
                  )}

                  {/* Error Message */}
                  {file.uploadStatus === "error" && file.errorMessage && (
                    <p className="text-xs text-red-400 font-sofia-sans mt-1">
                      {file.errorMessage}
                    </p>
                  )}
                </div>

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => removeFile(file.id)}
                  disabled={file.uploadStatus === "uploading"}
                  className="p-1 text-gray-4 hover:text-red-400 transition-colors disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultipleFileUpload;
