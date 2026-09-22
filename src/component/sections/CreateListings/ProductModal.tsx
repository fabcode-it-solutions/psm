"use client";
import Anchor from "@/component/ui/Anchor/Anchor";
import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { UploadFileType } from "@/types";
import UploadInput from "@/component/ui/dashboard/media-upload/UploadInput";

import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useListingFlow } from "@/hooks/useApiListing";
import Button from "@/component/ui/Button/Button";

const ProductModal = ({ 
  slug, 
  userId 
}: { 
  slug: string;
  userId: number;
}) => {
  const router = useRouter();
  const { listingData, updateFields, saveToDatabase, loading } = useListingFlow(userId);
  const docInputRef = useRef<HTMLInputElement | null>(null);

  const [documents, setDocuments] = useState<File[]>([]);
  const [photos, setPhotos] = useState<UploadFileType[]>(listingData.photos || []);
  const [price, setPrice] = useState(listingData.price || "");
  const [minimumBid, setMinimumBid] = useState(listingData.minimumBid || "");
  const [description, setDescription] = useState(listingData.description || "");
  const [isAnonymous, setIsAnonymous] = useState(listingData.anonymous || false);
  const [notificationThreshold, setNotificationThreshold] = useState(
    listingData.offerNotificationThreshold || ""
  );

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setDocuments(files);
    }
  };

  // Save draft automatically when fields change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Filter and map photos to match expected type
      const validPhotos = photos
        .filter((photo): photo is { id?: number; url: string; size?: number; name?: string } => {
          // Check if it's not a File and has a url
          return !(photo instanceof File) && 'url' in photo && !!photo.url;
        })
        .map(photo => ({
          url: photo.url,
          alt: photo.name || ''
        }));

      updateFields({
        photos: validPhotos,
        price,
        minimumBid,
        description,
        anonymous: isAnonymous,
        offerNotificationThreshold: notificationThreshold,
      });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [photos, price, minimumBid, description, isAnonymous, notificationThreshold, updateFields]);

  const handleSaveDraft = async () => {
    const result = await saveToDatabase("draft");
    if (result.success) {
      toast.success("Draft saved successfully!");
    }
  };

  const handleNext = () => {
    // Validate required fields
    if (!price) {
      toast.error("Please enter a price");
      return;
    }
    if (photos.length === 0) {
      toast.error("Please upload at least one photo");
      return;
    }

    // Filter and map photos to match expected type
    const validPhotos = photos
      .filter((photo): photo is { id?: number; url: string; size?: number; name?: string } => {
        // Check if it's not a File and has a url
        return !(photo instanceof File) && 'url' in photo && !!photo.url;
      })
      .map(photo => ({
        url: photo.url,
        alt: photo.name || ''
      }));

    // Save and navigate
    updateFields({
      photos: validPhotos,
      price,
      minimumBid,
      description,
      anonymous: isAnonymous,
      offerNotificationThreshold: notificationThreshold,
    });

    router.push(`/productaddress`);
  };

  return (
    <section className="mb-[69px]">
      <div className="w-full lg:max-w-[506px] border-[1.5px] border-[#E8E8E866] rounded-[6px] bg-white mt-5">
        <div className="w-full max-w-[466px] lg:mx-auto mt-[16.35px] mx-5">
          {/* Header */}
          <h2 className="w-full font-supreme font-bold text-lg leading-[100%] tracking-[0.01em] text-dark-blue-cm">
            Product Information:
          </h2>

          {/* Upload Photos */}
          <div className="flex mt-[21.8px] py-3 border-b-1 border-[#00000014] justify-between">
            <label className="font-supreme font-medium text-base leading-none tracking-[0.01em] mt-[3.27px] text-dark-blue-cm max-w-[122px] w-full">
              Upload Photos <span className="text-red-500">*</span>
            </label>
            <UploadInput
              label=""
              required={false}
              multipleSelect={true}
              setImageFileMulti={setPhotos}
              mode="accounts"
              onImagesSelected={(ids, images) => {
                if (images) setPhotos(images);
              }}
              trigger={
                <div className="h-[70.68px] border-[1.5px] border-[#E8E8E866] rounded-[6px] flex items-center justify-center cursor-pointer text-dark-blue-cm text-sm mr-8 lg:mr-0">
                  {photos.length === 0 ? (
                    <svg
                      width="24"
                      height="18"
                      viewBox="0 0 24 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g opacity="0.2" clipPath="url(#clip0_123_5980)">
                        <path
                          d="M11.8834 -0.815538L12 -0.822266C12.5128 -0.822266 12.9355 -0.436225 12.9933 0.0611134L13 0.177734V7.17773H20C20.5128 7.17773 20.9355 7.56378 20.9933 8.06111L21 8.17773C21 8.69057 20.614 9.11324 20.1166 9.17101L20 9.17773H13V16.1777C13 16.6906 12.614 17.1132 12.1166 17.171L12 17.1777C11.4872 17.1777 11.0645 16.7917 11.0067 16.2944L11 16.1777V9.17773H4C3.48716 9.17773 3.06449 8.79169 3.00673 8.29436L3 8.17773C3 7.6649 3.38604 7.24223 3.88338 7.18446L4 7.17773H11V0.177734C11 -0.335101 11.386 -0.757773 11.8834 -0.815538L12 -0.822266L11.8834 -0.815538Z"
                          fill="#212121"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_123_5980">
                          <rect
                            width="24"
                            height="16.963"
                            fill="white"
                            transform="translate(0 0.177734)"
                          />
                        </clipPath>
                      </defs>
                    </svg>
                  ) : (
                    <div className="flex gap-2 overflow-x-auto px-2">
                      {photos.map((file, idx) => {
                        const src =
                          "url" in file && file.url
                            ? file.url
                            : URL.createObjectURL(file as unknown as File);

                        return (
                          <Image
                            key={idx}
                            src={src}
                            alt={`preview-${idx}`}
                            className="w-12 h-12 object-cover rounded"
                            width={48}
                            height={48}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              }
            />
          </div>

          {/* Upload Documents */}
          <div className="flex py-4 border-b-1 border-[#00000014] pb-[26.32px] items-center justify-between">
            <label className="font-supreme font-medium text-base leading-none tracking-[0.01em] max-w-[122px] w-full text-dark-blue-cm">
              Upload Documents (optional)
            </label>
            <div
              className="max-w-[342px] w-full h-[70.68px] border-[1.5px] border-[#E8E8E866] rounded-[6px] flex items-center justify-center cursor-pointer text-dark-blue-cm text-sm mr-8 lg:mr-0"
              onClick={() => docInputRef.current?.click()}
            >
              {documents.length === 0 ? (
                <svg
                  width="24"
                  height="18"
                  viewBox="0 0 24 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g opacity="0.2" clipPath="url(#clip0_123_5980)">
                    <path
                      d="M11.8834 -0.815538L12 -0.822266C12.5128 -0.822266 12.9355 -0.436225 12.9933 0.0611134L13 0.177734V7.17773H20C20.5128 7.17773 20.9355 7.56378 20.9933 8.06111L21 8.17773C21 8.69057 20.614 9.11324 20.1166 9.17101L20 9.17773H13V16.1777C13 16.6906 12.614 17.1132 12.1166 17.171L12 17.1777C11.4872 17.1777 11.0645 16.7917 11.0067 16.2944L11 16.1777V9.17773H4C3.48716 9.17773 3.06449 8.79169 3.00673 8.29436L3 8.17773C3 7.6649 3.38604 7.24223 3.88338 7.18446L4 7.17773H11V0.177734C11 -0.335101 11.386 -0.757773 11.8834 -0.815538L12 -0.822266L11.8834 -0.815538Z"
                      fill="#212121"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_123_5980">
                      <rect
                        width="24"
                        height="16.963"
                        fill="white"
                        transform="translate(0 0.177734)"
                      />
                    </clipPath>
                  </defs>
                </svg>
              ) : (
                <ol className="text-xs text-gray-600 px-2 overflow-y-auto max-h-[60px]">
                  {documents.map((file, idx) => (
                    <li key={idx} className="truncate">
                      {file.name}
                    </li>
                  ))}
                </ol>
              )}
              <input
                type="file"
                ref={docInputRef}
                className="hidden"
                multiple
                onChange={handleDocumentUpload}
              />
            </div>
          </div>

          {/* Price */}
          <div className="flex pt-[11.74px] pb-[10.4px] border-b-1 border-[#00000014] justify-between">
            <label className="flex font-supreme font-medium text-base leading-none tracking-[0.01em] items-center text-dark-blue-cm">
              Price: <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter price"
              className="w-full max-w-[342px] text-dark-blue-cm h-[52.33px] bg-[#E8E8E866] rounded-[6px] px-3 py-2 text-sm focus:outline-none focus:border-blue-500 mr-8 lg:mr-0"
            />
          </div>

          {/* Minimum bid */}
          <div className="flex border-b-1 border-[#00000014] py-[13.08px] justify-between items-center">
            <label className="font-supreme font-medium text-base leading-none tracking-[0.01em] max-w-[106px] w-full text-dark-blue-cm">
              Minimum bid acceptable:
            </label>
            <input
              type="number"
              value={minimumBid}
              onChange={(e) => setMinimumBid(e.target.value)}
              placeholder="Enter minimum bid"
              className="w-full max-w-[342px] h-[52.33px] bg-[#E8E8E866] text-dark-blue-cm rounded-[6px] px-3 py-2 text-sm focus:outline-none focus:border-blue-500 mr-8 lg:mr-0"
            />
          </div>

          {/* Description */}
          <div className="flex pt-[12.87px] pb-[21.14px] justify-between">
            <label className="font-supreme font-medium text-base leading-none tracking-[0.01em] mt-[4.57px] text-dark-blue-cm">
              Description:
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your product..."
              className="w-full max-w-[342px] bg-[#E8E8E866] rounded-[6px] px-3 py-2 text-sm text-dark-blue-cm resize-none focus:outline-none mr-8 lg:mr-0"
            ></textarea>
          </div>
        </div>
      </div>

      <div className="w-full max-w-[506px] border-[1.5px] border-[#E8E8E866] rounded-[6px] bg-white mt-5 mb-[33px] py-[22px]">
        <div className="w-full max-w-[466px] mx-auto">
          <label className="flex items-center text-[#000000] font-sofia-sans font-normal text-sm leading-none tracking-[0.04em] align-middle justify-between mx-2 lg:mx-0 gap-2 lg:gap-0">
            I want to remain anonymous while posting
            <span
              onClick={() => setIsAnonymous(!isAnonymous)}
              className="cursor-pointer"
            >
              <svg
                width="40"
                height="20"
                viewBox="0 0 40 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  width="40"
                  height="20"
                  rx="10"
                  fill={isAnonymous ? "#54DC00" : "#E0E0E0"}
                />
                <rect
                  x={isAnonymous ? 22 : 2}
                  y="2"
                  width="16"
                  height="16"
                  rx="8"
                  fill="white"
                />
              </svg>
            </span>
          </label>

          <div className="flex items-center justify-between mt-4.5 mx-2 lg:mx-0 gap-2 lg:gap-0">
            <span className="text-[#000000] font-sofia-sans font-normal text-sm leading-none tracking-[0.04em] align-middle">
              Show notifications for offers over $x only
            </span>
            <input
              type="number"
              value={notificationThreshold}
              onChange={(e) => setNotificationThreshold(e.target.value)}
              placeholder="enter $x amount"
              className="bg-[#F9F9F9] px-0 lg:px-3 py-[17px] text-center rounded-[12px] focus:outline-none font-sofia-sans font-normal text-xs leading-none tracking-[0.04em] align-middle"
            />
          </div>
        </div>
      </div>

      <div className="lg:flex lg:justify-end lg:gap-[21px] gap-0 justify-start">
        <Button
          onClick={handleSaveDraft}
          disabled={loading}
          className="!text-[#333333] lg:!min-w-[232px] !min-w-[180px] max-sm:!w-full !leading-[1.43] tracking-[0.1px] !py-[11px] font-bold font-supreme !text-xs !bg-[#EFEFEF3D]"
        >
          {loading ? "Saving..." : "Save as Draft"}
        </Button>
        <Button
          onClick={handleNext}
          disabled={loading || !price || photos.length === 0}
          className="!text-[#333333] !min-w-[232px] max-sm:!w-full !leading-[1.43] tracking-[0.1px] !py-[11px] font-bold font-supreme !text-xs "
        >
          Next
        </Button>
      </div>
    </section>
  );
};

export default ProductModal;