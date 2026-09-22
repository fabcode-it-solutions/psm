/* eslint-disable react-hooks/exhaustive-deps */
import { generateRandom } from "@/utils/generateRandom";
import Image from "next/image";
import React, { useState, useEffect, useCallback } from "react";
import { UploadFileType } from "@/types";
import DialogPopup from "../DialogPopup";
import toast from "react-hot-toast";
import { uploadFile } from "@/utils/uploadFile";
import MediaSelector from "./MediaSelector";
import { cn } from "@sglara/cn";

interface UploadInputProps {
  label: string;
  required: boolean;
  image?: string;
  requiredWidth?: number;
  requiredHeight?: number;
  altText?: string;
  folder?: string;
  multipleSelect?: boolean;
  preSelectedImageIds?: number[];
  preSelectedImages?: UploadFileType[];
  setImageFile?: React.Dispatch<React.SetStateAction<UploadFileType>>;
  setImageFileMulti?: React.Dispatch<React.SetStateAction<UploadFileType[]>>;
  onImagesSelected?: (imageIds: number[], images?: UploadFileType[]) => void;
  mode?: string;
  trigger?: React.ReactNode;
  className?: string;
  previewImage?: string;
}

const UploadInput: React.FC<UploadInputProps> = ({
  label,
  required,
  image,
  requiredWidth,
  requiredHeight,
  altText,
  folder = "/images",
  multipleSelect = false,
  preSelectedImageIds = [],
  setImageFile,
  onImagesSelected,
  mode,
  trigger,
  className,
  setImageFileMulti,
  preSelectedImages,
  previewImage,
}) => {
  const [preview, setPreview] = useState<string>("");
  const [alt, setAltText] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const id = generateRandom("string");
  useEffect(() => {
    if (previewImage) {
      setPreview(previewImage);
    }
  }, []);
  useEffect(() => {
    if (altText) {
      setAltText(altText);
      if (setImageFile) {
        setImageFile((prev: UploadFileType) => ({
          ...prev,
          alt: altText,
        }));
      }
    }
  }, [altText, setImageFile]);

  const handleFileUpload = useCallback(
    async (file: File): Promise<void> => {
      const img = new window.Image();
      img.src = URL.createObjectURL(file);

      img.onload = async () => {
        if (
          requiredWidth &&
          requiredHeight &&
          (img.width !== requiredWidth || img.height !== requiredHeight)
        ) {
          alert(
            `Image must be exactly ${requiredWidth}x${requiredHeight} pixels. Uploaded: ${img.width}x${img.height}`
          );
          return;
        }

        setPreview(img.src);
        setAltText(file.name);

        try {
          const image = await uploadFile({
            file: file,
            folder: folder,
            type: "image",
            alt: file.name,
          });

          if (image.media.success) {
            if (setImageFile) {
              setImageFile((prev: UploadFileType) => ({
                ...prev,
                alt: alt,
                id: image.media.success[0].id,
              }));
            }

            if (onImagesSelected) {
              onImagesSelected([image.media.success[0].id]);
            }
          } else {
            toast.error("Upload failed");
          }
        } catch (error) {
          toast.error("Upload failed");
          console.error("Upload error:", error);
        }
      };
    },
    [requiredWidth, requiredHeight, folder, setImageFile, onImagesSelected, alt]
  );
  const handleCancel = useCallback(() => {
    setShowCreateModal(false);
  }, []);

  const handleImagesSelected = useCallback(
    (imageIds: number[], url?: string, images?: UploadFileType[]) => {
      if (onImagesSelected) {
        onImagesSelected(imageIds, images);
      }
      if (setImageFileMulti && images) {
        setImageFileMulti(images);
      }
      if (url) {
        setPreview(url);
      }

      if (!multipleSelect && imageIds.length > 0) {
        if (setImageFile) {
          setImageFile((prev: UploadFileType) => ({
            ...prev,
            url,
            id: imageIds[0],
          }));
        }
      }

      setShowCreateModal(false);
    },
    [onImagesSelected, setImageFileMulti, multipleSelect, setImageFile]
  );

  const displayImage = preview || image || "";

  return (
    <div className={cn(className, "w-full")}>
      {!mode && label && (
        <label className="block text-sm text-light-100 mb-2 font-sofia-sans">
          {label} {required && "*"}
        </label>
      )}

      {!mode && !trigger && (
        <UploadButton
          displayImage={displayImage}
          alt={alt}
          requiredWidth={requiredWidth}
          requiredHeight={requiredHeight}
          onClick={() => setShowCreateModal(true)}
        />
      )}
      {mode == "accounts" && (
        <div
          className=" relative cursor-pointer"
          onClick={() => setShowCreateModal(true)}
        >
          {displayImage && (
            <Image
              src={displayImage}
              alt={"Uploaded Preview"}
              className="w-full absolute top-0 left-0 z-10 h-full object-cover object-center rounded-md"
              width={400}
              height={88}
              unoptimized
            />
          )}
          {trigger}
        </div>
      )}
      {mode != "accounts" && trigger && (
        <div
          className=" relative cursor-pointer"
          onClick={() => setShowCreateModal(true)}
        >
          {displayImage && (
            <Image
              src={displayImage}
              alt={"Uploaded Preview"}
              className="w-full absolute top-0 left-0 z-10 h-full object-cover object-center rounded-md"
              width={400}
              height={88}
              unoptimized
            />
          )}
          {trigger}
        </div>
      )}
      <DialogPopup
        heading="Select Media"
        open={showCreateModal}
        setShowCreateModal={setShowCreateModal}
        overlayStyle={
          mode == "accounts" ? "!bg-dark-blue-cm/20" : " !bg-transparent"
        }
        mode={mode == "accounts" ? "light" : "dark"}
      >
        <MediaSelector
          mode={mode == "accounts" ? "light" : "dark"}
          onFileUpload={handleFileUpload}
          onImagesSelected={handleImagesSelected}
          onCancel={handleCancel}
          multipleSelect={multipleSelect}
          preSelectedImageIds={preSelectedImageIds}
          preSelectedImages={preSelectedImages}
          requiredWidth={requiredWidth}
          requiredHeight={requiredHeight}
          uploadInputId={id}
        />
      </DialogPopup>
    </div>
  );
};

interface UploadButtonProps {
  displayImage: string;
  alt: string;
  requiredWidth?: number;
  requiredHeight?: number;
  onClick: () => void;
}

const UploadButton: React.FC<UploadButtonProps> = ({
  displayImage,
  alt,
  requiredWidth,
  requiredHeight,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      type="button"
      className="flex mb-2 flex-col items-center justify-center w-full h-48 border-2 border-gray-5/20 border-dashed rounded-lg cursor-pointer overflow-hidden"
    >
      {!displayImage ? (
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <svg
            className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 16"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
            />
          </svg>
          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="font-semibold">Click to upload</span> or drag and
            drop
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            PNG, JPG, GIF, or WebP{" "}
            {requiredWidth && `(${requiredWidth}px X ${requiredHeight}px)`}
          </p>
        </div>
      ) : (
        <Image
          src={displayImage}
          alt={alt || "Uploaded Preview"}
          className="w-full h-full object-contain object-center"
          width={400}
          height={400}
          unoptimized
        />
      )}
    </button>
  );
};

export default UploadInput;
