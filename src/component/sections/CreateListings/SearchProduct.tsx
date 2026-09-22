/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import BreadcrumbHeader from "../address/BreadcrumbHeader";
import { partsService } from "@/services/part.service";
import { useRouter } from "next/navigation";
import { useListingFlow } from "@/hooks/useApiListing";
import Button from "@/component/ui/Button/Button";


const SearchProduct = ({ userId }: { userId: number }) => {
  const router = useRouter();
  const { updateFields } = useListingFlow(userId);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPart, setSelectedPart] = useState<any>(null);

  // Fetch using partsService
  const fetchParts = async () => {
    try {
      setLoading(true);

      const result = await partsService.getPartsAdmin({
        searchTerm,
        itemsPerPage: 20,
        currentPage: 1,
      });


      const mapped =
        result?.data?.map((item: any) => ({
          id: item.id,
          slug: item.slug,
          title: item.title,
          image: item.featuredImage || "/assets/images/mainwheel.png",
          logo: "/assets/images/rays-logo.png",
          listingsCount: `${item.inventory || 0} in stock`,
          price: `$${item.price || "0.00"}`,
          note: item.inventoryStatus || "N/A",
        })) || [];

      setParts(mapped);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(fetchParts, 400); // debounce
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const handleSelectPart = (item: any) => {
    setSelectedPart(item);
  };

  const handleConfirm = () => {
    if (!selectedPart) {
      alert("Please select a product first");
      return;
    }

    // Save selected part to listing flow
    updateFields({
      partId: selectedPart.id,
      partTitle: selectedPart.title,
      partSlug: selectedPart.slug,
    });

    // Navigate to product details page
    router.push(`/listings/create/${selectedPart.slug}/product`);
  };

  return (
    <div className="flex flex-col lg:flex-row w-full overflow-hidden">
      {/* LEFT IMAGE */}
      <div className="lg:w-[50.66%] relative aspect-[766/662] lg:max-h-screen mb-4 lg:mb-0">
        <Image
          src="/assets/images/mainwheel.png"
          alt="Main Product Image"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* RIGHT SIDE */}
      <div className="lg:w-[33.46%] mt-20 lg:mx-auto mx-5 max-des-sm:w-full max-des-sm:px-[30px]">
        <BreadcrumbHeader
          breadcrumbs={["Create Listing"]}
          currentPage="Search Product"
          title="What Parts are you looking to sell?"
          onClose={() => router.push("/")}
        />

        {/* SEARCH BOX */}
        <div className="flex flex-col mt-15 mr-10 lg:mr-0">
          <div className="flex items-center border border-[#E8E8E866] rounded-[6px] bg-white">
            <div className="flex items-center gap-[10px] py-[15px] px-5 w-full">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8.5 3C11.5376 3 14 5.46243 14 8.5C14 9.83879 13.5217 11.0659 12.7266 12.0196L16.8536 16.1464C17.0488 16.3417 17.0488 16.6583 16.8536 16.8536C16.68 17.0271 16.4106 17.0464 16.2157 16.9114L16.1464 16.8536L12.0196 12.7266C11.0659 13.5217 9.83879 14 8.5 14C5.46243 14 3 11.5376 3 8.5C3 5.46243 5.46243 3 8.5 3ZM8.5 4C6.01472 4 4 6.01472 4 8.5C4 10.9853 6.01472 13 8.5 13C10.9853 13 13 10.9853 13 8.5C13 6.01472 10.9853 4 8.5 4Z"
                  fill="#212121"
                  fillOpacity="0.4"
                />
              </svg>
              <input
                type="text"
                placeholder="Search for Car, Manufacturer, Part, Offset..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-grow outline-none text-[14px] font-supreme"
              />
            </div>
          </div>

          {/* RESULTS */}
          <div className="mt-4">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {loading && (
                <p className="text-center col-span-full text-gray-500">
                  Loading...
                </p>
              )}

              {!loading && parts.length === 0 && searchTerm && (
                <p className="text-center col-span-full text-gray-500">
                  No products found.
                </p>
              )}

              {!loading &&
                parts.map((item: any) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectPart(item)}
                    className={`bg-white shadow-md rounded-md overflow-hidden cursor-pointer transition-all border-2 ${
                      selectedPart?.id === item.id
                        ? "border-dark-blue-cm"
                        : "border-transparent"
                    }`}
                  >
                    <div className="relative w-full h-[217px]">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20" />
                      
                      {selectedPart?.id === item.id && (
                        <div className="absolute top-3 right-3 bg-dark-blue-cm text-white rounded-full p-2">
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M10 2C14.4183 2 18 5.58172 18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2ZM13.3584 7.64645C13.1849 7.47288 12.9154 7.4536 12.7206 7.58859L12.6513 7.64645L9 11.298L7.35355 9.65131L7.28431 9.59346C7.08944 9.45846 6.82001 9.47775 6.64645 9.65131C6.47288 9.82488 6.4536 10.0943 6.58859 10.2892L6.64645 10.3584L8.64645 12.3584L8.71569 12.4163C8.8862 12.5344 9.1138 12.5344 9.28431 12.4163L9.35355 12.3584L13.3584 8.35355L13.4163 8.28431C13.5513 8.08944 13.532 7.82001 13.3584 7.64645Z"
                              fill="white"
                            />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className="pl-[18px] mb-[22px]">
                      <div className="flex gap-2 relative bottom-4">
                        <div className="flex items-center bg-white border px-2 py-1 rounded-md">
                          <Image
                            src={item.logo}
                            alt="Brand Logo"
                            width={62}
                            height={23}
                          />
                        </div>
                        <span className="text-white bg-dark-blue-cm px-3 py-1 rounded-md text-sm font-bold">
                          {item.listingsCount}
                        </span>
                      </div>

                      <h3 className="font-normal text-xl h-[50px] flex items-center text-dark-blue-cm font-supreme">
                        {item.title}
                      </h3>

                      <p className="text-dark-blue-cm font-bold text-[32px] mt-3 font-supreme">
                        {item.price}
                      </p>
                      <p className="text-sm opacity-40 font-supreme">{item.note}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* CONFIRM BUTTON */}
          <div className="mt-10 flex justify-end mb-[30px]">
            <Button
              onClick={handleConfirm}
              disabled={!selectedPart}
              className="!text-[#333] !min-w-[233px] !py-[11px] font-bold text-xs "
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchProduct;