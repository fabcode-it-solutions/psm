"use client";
import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import BreadcrumbHeader from "../address/BreadcrumbHeader";
import ProductModal from "./ProductModal";
import LoaderDots from "@/component/ui/loader/LoaderDots";
import { useListingFlow } from "@/hooks/useApiListing";

interface Metafield {
  id: number;
  name: string;
  key: string;
  namespace: string;
  value: string[];
}

interface OptionValue {
  id: number;
  value: string;
}

interface Option {
  id: number;
  name: string;
  values: OptionValue[];
}

interface Part {
  title: string;
  metafields: Metafield[];
  options: Option[];
  media: Media[];
  id: number;
}

interface Media {
  url: string;
  alt: string;
  order: number;
  id: number;
}

interface ApiResponse {
  success: boolean;
  data: {
    part: {
      title: string;
      id: number;
    };
    metafields: Metafield[];
    options: Option[];
    media: Media[];
  };
}

const capitalizeFirst = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

const ListingProductDetails = ({
  slug,
  userId,
}: {
  slug: string;
  userId: number;
}) => {
  const { listingData, updateFields } = useListingFlow(userId);
  const [part, setPart] = useState<Part | null>(null);
  const [loading, setLoading] = useState(true);

  const [condition, setCondition] = useState(
    listingData.selectedSpecs?.condition || ""
  );
  const [pcd, setPcd] = useState(listingData.selectedSpecs?.pcd || "");
  const [setType, setSetType] = useState(listingData.selectedSpecs?.set || "");
  const [size, setSize] = useState(listingData.selectedSpecs?.size || "");
  const [offset, setOffset] = useState(listingData.selectedSpecs?.offset || "");
  const fetchPart = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/parts/${slug}`);
      const json: ApiResponse = await res.json();
      const data = json.data;

      setPart({
        title: data.part.title,
        id: data.part.id,
        metafields: data.metafields,
        options: data.options,
        media: data.media || [],
      });

      updateFields({
        partId: data.part.id,
        partTitle: data.part.title,
        partSlug: slug,
      });
    } catch (error) {
      console.error("Error fetching part:", error);
    } finally {
      setLoading(false);
    }
  }, [slug, updateFields]);

  useEffect(() => {
    fetchPart();
  }, [fetchPart]);

  useEffect(() => {
    updateFields({
      selectedSpecs: {
        condition,
        pcd,
        set: setType,
        size,
        offset,
      },
    });
  }, [condition, pcd, setType, size, offset, updateFields]);

  if (loading || !part) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <LoaderDots className="!bg-accent-100 !w-4 !h-4" />
      </div>
    );
  }

  const filters = [
    {
      label: "Condition:",
      state: condition,
      setState: setCondition,
      options:
        part.metafields.find((m) => m.key.toLowerCase() === "condition")
          ?.value || [],
    },
    {
      label: "PCD:",
      state: pcd,
      setState: setPcd,
      options:
        part.metafields.find((m) => m.key.toLowerCase() === "pcd")?.value || [],
    },
    {
      label: "Set:",
      state: setType,
      setState: setSetType,
      options:
        part.metafields.find((m) => m.key.toLowerCase() === "set")?.value || [],
    },
    {
      label: "Size:",
      state: size,
      setState: setSize,
      options:
        part.options
          .find((o) => o.name.toLowerCase() === "size (inches)")
          ?.values.map((v) => v.value) || [],
    },
    {
      label: "Offset:",
      state: offset,
      setState: setOffset,
      options:
        part.options
          .find((o) => o.name.toLowerCase() === "offset")
          ?.values.map((v) => v.value) || [],
    },
  ];

  return (
    <div className="flex flex-col lg:flex-row w-full overflow-visible relative items-start">
      <div className="lg:w-[50.66%] lg:sticky lg:top-0 mb-4">
        <div className="relative w-full h-full aspect-[766/662] overflow-hidden">
          <Image
            src={part.media?.[0]?.url || "/assets/images/mainwheel.png"}
            alt="Main Product Image"
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex flex-col lg:w-[33.46%] mt-[80px] lg:mx-auto mx-5">
        <BreadcrumbHeader
          breadcrumbs={["Create Listing", "Search Product"]}
          currentPage={slug}
          title={part.title}
          onClose={() => console.log("Closed!")}
        />

        <div className="w-full lg:max-w-[506px] border-[1.5px] border-[#E8E8E866] rounded-[6px] bg-white mt-11">
          <div className="w-full max-w-[466px] lg:mx-auto mx-5 text-dark-blue-cm">
            <h2 className="w-full font-supreme font-bold text-[18px] leading-[100%] mt-[15px] mb-2">
              Select Specifications:
            </h2>

            {filters.map((filter, idx) => (
              <div
                key={filter.label}
                className={`flex py-3 items-center gap-[49px] ${
                  idx !== filters.length - 1
                    ? "border-b border-[#00000014]"
                    : "mb-[17px]"
                }`}
              >
                <h2 className="font-supreme font-medium text-[16px] w-[75px]">
                  {filter.label}
                </h2>

                <span className="flex lg:gap-6 gap-2 flex-wrap">
                  {filter.options.map((item) => (
                    <button
                      key={item}
                      onClick={() => filter.setState(item)}
                      className={`px-3 py-1.5 rounded-[6px] border-[1.5px] text-sm ${
                        filter.state === item
                          ? "bg-dark-blue-cm text-white"
                          : "bg-white text-gray-700 border-[#00000014]"
                      }`}
                    >
                      {capitalizeFirst(item)}
                    </button>
                  ))}
                </span>
              </div>
            ))}
          </div>
        </div>

        <ProductModal slug={slug} userId={userId} />
      </div>
    </div>
  );
};

export default ListingProductDetails;
