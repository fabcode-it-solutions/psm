"use client";
import Anchor from "@/component/ui/Anchor/Anchor";
import React, { useState } from "react";
import Image from "next/image";
import IconBuyComplete from "@/assets/icons/IconBuyComplete";
import IconNext from "@/assets/icons/IconNext";

import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useListingFlow } from "@/hooks/useApiListing";

const ListingComplete = ({ 
  slug, 
  userId 
}: { 
  slug: string;
  userId: number;
}) => {
  const router = useRouter();
  const { listingData, saveToDatabase, loading, clearDraft } = useListingFlow(userId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const details = [
    listingData.addressLine1 && listingData.city
      ? `${listingData.addressLine1}, ${listingData.city}, ${listingData.state}`
      : "Address not set",
    listingData.selectedSpecs
      ? `${listingData.selectedSpecs.condition || "N/A"}, ${
          listingData.selectedSpecs.pcd || "N/A"
        }, ${listingData.selectedSpecs.size || "N/A"}`
      : "Specs not set",
    "Payment method on file",
  ];

  // Calculate fees and totals
  const listingPrice = parseFloat(listingData.price || "0");
  const deliveryCost = 200; // This could be dynamic
  const gst = listingPrice * 0.1; // 10% GST
  const fees = listingPrice * 0.05; // 5% platform fee
  const totalEarnings = listingPrice + deliveryCost - gst - fees;

  const summary = [
    { label: "Listing Price", value: `$${listingPrice.toFixed(2)}` },
    { label: "Delivery", value: `$${deliveryCost.toFixed(2)}` },
    { label: "GST", value: `$${gst.toFixed(2)}` },
    { label: "Fees", value: `$${fees.toFixed(2)}` },
    { label: "Total Potential Earnings", value: `$${totalEarnings.toFixed(2)}` },
  ];

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const result = await saveToDatabase("pending");
      
      if (result.success) {
        toast.success("Listing submitted for review!");
        clearDraft();
        // Redirect to listings page or success page
        router.push("/listings/success");
      } else {
        toast.error(result.error || "Failed to submit listing");
      }
    } catch (error) {
      console.error("Error submitting:", error);
      toast.error("An error occurred while submitting");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    const result = await saveToDatabase("draft");
    if (result.success) {
      toast.success("Draft saved!");
      router.push("/listings/drafts");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row w-full overflow-hidden">
      <div className="lg:w-[50.66%] relative aspect-[766/662] max-h-[662px] lg:max-h-screen mb-4 lg:mb-0">
        <Image
          src={listingData.photos?.[0]?.url || "/assets/images/mainwheel.png"}
          alt="Main Product Image"
          fill
          className="object-cover opacity-100 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-black/20 opacity-100 group-hover:opacity-100 transition" />
      </div>

      <div className="flex flex-col w-full lg:w-[38.82%] lg:ml-[70px]">
        <div className="flex mt-20 flex-wrap mx-5 lg:mx-0 justify-between">
          <span className="flex items-center font-sofia-sans font-normal text-xs sm:text-sm leading-[100%] tracking-[4%] text-dark-blue-cm flex-wrap gap-1">
            <span className="opacity-40 flex flex-wrap items-center gap-1">
              Create Listing <IconNext /> Search Product <IconNext /> Add
              Details <IconNext /> Add Address
            </span>
            <IconNext /> Review
          </span>
          <span>
            <button 
              onClick={() => router.push(`/listings/create/${slug}`)}
              className="shrink-0"
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="16"
                  cy="16"
                  r="15.25"
                  stroke="#002029"
                  strokeOpacity="0.08"
                  strokeWidth="1.5"
                />
                <path
                  d="M9.89705 10.0538L9.96967 9.96967C10.2359 9.7034 10.6526 9.6792 10.9462 9.89705L11.0303 9.96967L16 14.939L20.9697 9.96967C21.2359 9.7034 21.6526 9.6792 21.9462 9.89705L22.0303 9.96967C22.2966 10.2359 22.3208 10.6526 22.1029 10.9462L22.0303 11.0303L17.061 16L22.0303 20.9697C22.2966 21.2359 22.3208 21.6526 22.1029 21.9462L22.0303 22.0303C21.7641 22.2966 21.3474 22.3208 21.0538 22.1029L20.9697 22.0303L16 17.061L11.0303 22.0303C10.7641 22.2966 10.3474 22.3208 10.0538 22.1029L9.96967 22.0303C9.7034 21.7641 9.6792 21.3474 9.89705 21.0538L9.96967 20.9697L14.939 16L9.96967 11.0303C9.7034 10.7641 9.6792 10.3474 9.89705 10.0538L9.96967 9.96967L9.89705 10.0538Z"
                  fill="#002029"
                />
              </svg>
            </button>
          </span>
        </div>

        <div className="flex flex-col justify-center w-full mx-auto mt-[15px] lg:ml-[51px] ml-5">
          <div className="flex-col items-center font-supreme font-medium text-2xl sm:text-[28px] leading-[100%] tracking-[1%] text-dark-blue-cm max-w-[408px] w-full">
            {listingData.partTitle || "Product Listing"}
            <span className="mt-15.5 flex lg:ml-[76px] lg:justify-normal justify-center mr-5 lg:mr-0">
              <IconBuyComplete />
            </span>
          </div>
        </div>

        {/* Review Details */}
        <div className="flex flex-col gap-3 mt-10 mr-7 lg:mr-0 ml-5">
          {details.map((detail, index) => (
            <div
              key={index}
              className="flex items-center justify-between border border-[#E8E8E866] text-lg leading-[100%] tracking-[1%] rounded-[6px] px-4 bg-white text-dark-blue-cm"
            >
              <h3 className="flex-grow outline-none py-4 placeholder:text-dark-blue-cm font-supreme font-bold text-sm leading-[100%] tracking-[0.01em]">
                {detail}
              </h3>
            </div>
          ))}
        </div>

        {/* Divider */}
        <span className="mt-10 mr-8 lg:mr-0 ml-5">
          <svg
            className="w-full h-[2px]"
            viewBox="0 0 506 2"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <line
              x1="0"
              y1="1"
              x2="506"
              y2="1"
              stroke="black"
              strokeOpacity="0.12"
              strokeWidth="1.5"
              strokeDasharray="10 10"
            />
          </svg>
        </span>

        {/* Summary */}
        <div className="flex flex-col gap-3 mt-6 mr-8 lg:mr-0 ml-5">
          {summary.map((item, index) => (
            <div key={index} className="flex justify-between">
              <span className="font-supreme font-bold text-base leading-[100%] tracking-[0.01em] text-dark-blue-cm">
                {item.label}
              </span>
              <span className="font-supreme font-bold text-base leading-[100%] tracking-[0.01em] text-dark-blue-cm">
                {item.value}
              </span>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end mx-8 lg:mx-auto max-sm:flex-col max-sm:gap-4 lg:mt-[100px] mt-[50px] mr-10 lg:mr-[30.5px] gap-4">
          <button
            onClick={handleSaveDraft}
            disabled={loading || isSubmitting}
            className="!text-[#333333] !min-w-[180px] max-sm:!w-full !leading-[1.43] tracking-[0.1px] !py-[11px] font-bold font-supreme !text-xs bg-[#EFEFEF3D] rounded-md border border-gray-300 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Draft"}
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || isSubmitting}
            className="!text-white !min-w-[233px] max-sm:!w-full !leading-[1.43] tracking-[0.1px] !py-[11px] font-bold font-supreme !text-xs bg-dark-blue-cm rounded-md disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Send for Review"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListingComplete;