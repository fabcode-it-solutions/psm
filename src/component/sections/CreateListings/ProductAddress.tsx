"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Anchor from "@/component/ui/Anchor/Anchor";
import IconPencil from "@/assets/icons/IconPencil";
import BreadcrumbHeader from "../address/BreadcrumbHeader";

import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useListingFlow } from "@/hooks/useApiListing";
import Button from "@/component/ui/Button/Button";

const ProductAddress = ({ 
  slug, 
  userId 
}: { 
  slug: string;
  userId: number;
}) => {
  const router = useRouter();
  const { listingData, updateFields } = useListingFlow(userId);
  
  const [isEditing, setIsEditing] = useState(false);
  const [address, setAddress] = useState({
    addressLine1: listingData.addressLine1 || "",
    addressLine2: listingData.addressLine2 || "",
    city: listingData.city || "",
    state: listingData.state || "",
    postalCode: listingData.postalCode || "",
    country: listingData.country || "AU",
  });

  const handleNext = () => {
    if (!address.addressLine1 || !address.city || !address.state) {
      toast.error("Please fill in all required address fields");
      return;
    }

    // Save address and navigate
    updateFields({
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
    });

    router.push(`/listings/create/${slug}/product-detail`);
  };

  const formatAddress = () => {
    const parts = [
      address.addressLine1,
      address.addressLine2,
      address.city,
      address.state,
      address.postalCode,
    ].filter(Boolean);
    return parts.join(", ");
  };

  return (
    <div className="flex flex-col lg:flex-row overflow-hidden">
      <div className="lg:w-[50.66%] relative aspect-[766/662] max-h-[662px] lg:max-h-screen mb-4 lg:mb-0">
        <Image
          src="/assets/images/mainwheel.png"
          alt="Main Product Image"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/20 opacity-100 group-hover:opacity-100 transition" />
      </div>

      <div className="flex flex-col w-full lg:w-[33.46%] lg:mx-auto mx-5 mt-[80px]">
        <BreadcrumbHeader
          breadcrumbs={["Create Listing", "Search Product", "Add Details"]}
          currentPage="Add Address"
          title={listingData.partTitle || "Product"}
          onClose={() => console.log("Closed!")}
        />

        <div className="flex flex-col mt-15">
          {isEditing ? (
            <div className="flex flex-col gap-3 mr-8 lg:mr-0">
              <label className="font-supreme text-sm leading-[16px] tracking-[0%] text-[#606060] font-medium">
                Address Line 1 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={address.addressLine1}
                onChange={(e) =>
                  setAddress({ ...address, addressLine1: e.target.value })
                }
                placeholder="Street address"
                className="border border-[#E8E8E866] rounded-[6px] px-4 py-3 text-dark-blue-cm font-supreme"
              />

              <label className="font-supreme text-sm leading-[16px] tracking-[0%] text-[#606060] font-medium mt-3">
                Address Line 2
              </label>
              <input
                type="text"
                value={address.addressLine2}
                onChange={(e) =>
                  setAddress({ ...address, addressLine2: e.target.value })
                }
                placeholder="Apartment, suite, etc. (optional)"
                className="border border-[#E8E8E866] rounded-[6px] px-4 py-3 text-dark-blue-cm font-supreme"
              />

              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="font-supreme text-sm leading-[16px] tracking-[0%] text-[#606060] font-medium">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={address.city}
                    onChange={(e) =>
                      setAddress({ ...address, city: e.target.value })
                    }
                    placeholder="City"
                    className="border border-[#E8E8E866] rounded-[6px] px-4 py-3 text-dark-blue-cm font-supreme w-full"
                  />
                </div>

                <div>
                  <label className="font-supreme text-sm leading-[16px] tracking-[0%] text-[#606060] font-medium">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={address.state}
                    onChange={(e) =>
                      setAddress({ ...address, state: e.target.value })
                    }
                    placeholder="State"
                    className="border border-[#E8E8E866] rounded-[6px] px-4 py-3 text-dark-blue-cm font-supreme w-full"
                  />
                </div>
              </div>

              <label className="font-supreme text-sm leading-[16px] tracking-[0%] text-[#606060] font-medium mt-3">
                Postal Code
              </label>
              <input
                type="text"
                value={address.postalCode}
                onChange={(e) =>
                  setAddress({ ...address, postalCode: e.target.value })
                }
                placeholder="Postal code"
                className="border border-[#E8E8E866] rounded-[6px] px-4 py-3 text-dark-blue-cm font-supreme"
              />

              <button
                onClick={() => setIsEditing(false)}
                className="mt-4 bg-dark-blue-cm text-white px-4 py-2 rounded-md font-supreme font-bold"
              >
                Save Address
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 mr-8 lg:mr-0">
              <label className="font-supreme text-sm leading-[16px] tracking-[0%] text-[#606060] font-medium">
                Your Address
              </label>
              <div className="flex items-center justify-between border border-[#E8E8E866] text-lg leading-[100%] tracking-[1%] rounded-[6px] px-4 bg-white text-dark-blue-cm">
                <h3 className="flex-grow outline-none py-4 placeholder:text-dark-blue-cm font-supreme font-bold text-lg leading-[100%] tracking-[0.01em]">
                  {formatAddress() || "No address entered"}
                </h3>
                <button onClick={() => setIsEditing(true)}>
                  <IconPencil />
                </button>
              </div>
            </div>
          )}

          <div className="flex lg:justify-end lg:pr-1 justify-center lg:mt-72 mt-20">
            <Button
              onClick={handleNext}
              disabled={!address.addressLine1 || !address.city || !address.state}
              className="!text-[#333333] !min-w-[233px] !leading-[1.43] tracking-[0.1px] !py-[11px] font-bold font-supreme !text-xs "
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductAddress;