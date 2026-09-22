/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useCallback, useEffect, useState } from "react";

import Filter from "./Filter";
import IconArrowDropdown from "@/assets/icons/IconArrowDropdown";
import ProductType from "./Product";
import ListItems from "./ListItems";
import Anchor from "@/component/ui/Anchor/Anchor";
import Breadcrumb from "@/component/ui/BreadCrumb/BreadCrumb";
import { marketplaceService } from "@/services/marketplace.service";
import {
  MarketPlaceProps,
  MarketPlaceResult,
  SortOption,
} from "@/types/marketplace.type";
import Select from "@/component/ui/Select/Select";
import { ImageIcon } from "lucide-react";
const sortingOptions: SortOption[] = [
  {
    value: "featured",
    label: "Featured",
  },
  {
    value: "price-low-high",
    label: "Price Low to High",
  },
  {
    value: "price-high-low",
    label: "Price High to Low",
  },
  {
    value: "new-old",
    label: "New to old",
  },
  {
    value: "old-new",
    label: "Old to New",
  },
  {
    value: "a-z",
    label: "A-Z",
  },
  {
    value: "z-a",
    label: "Z-A",
  },
];
const MarketPlace: React.FC<MarketPlaceProps> = ({ slug, filters }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [data, setData] = useState<MarketPlaceResult>();
  const [loading, setLoading] = useState(false);
  const getCategoryData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await marketplaceService.getData({
        filter: {
          slug,
        },
      });
      if (data.success) {
        setData(data);
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    getCategoryData();
  }, []);
  return (
    <div className="flex w-full">
      <div className="hidden md:block w-[26.7%]  bg-white border border-[#E8E8E866]">
        <Filter filters={filters} />
      </div>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 bg-opacity-20"
          onClick={() => setSidebarOpen(false)}
        >
          <div
            className="fixed top-0 bottom-0 left-0 w-[70%] bg-white shadow-lg z-10 md:hidden overflow-y-scroll transform transition-transform duration-300 translate-x-0"
            onClick={(e) => e.stopPropagation()}
          >
            <Filter filters={filters} />
          </div>
        </div>
      )}

      <div className="w-full md:w-[73.3%] pt-[9px]">
        <div className="flex max-w-[1012px] w-full pl-[60px] justify-between items-center max-des-md:px-[30px] max-tab-sm:px-4">
          <Breadcrumb breadcrumb={filters?.breadcrumb} />
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden"
            aria-label="Toggle menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M3 4h18a1 1 0 0 1 .8 1.6L15 13.5V19a1 1 0 0 1-1.45.9l-4-2A1 1 0 0 1 9 17v-3.5L3.2 5.6A1 1 0 0 1 3 4z"
              />
            </svg>
          </button>

          <div className="flex gap-[15px] items-center w-full justify-end">
            <p className="text-base font-sofia-sans font-normal leading-[1.2] tracking-[0.64px]">
              Sort By
            </p>
            <Select options={sortingOptions} label="Sort By" />
          </div>
        </div>

        <ProductType loading={loading} parts={data?.parts} />

        <ListItems />
        <div className="my-[197px] max-tab-lg:my-[60px] bg-[#FFFFFF] max-w-[974px] max-tab-lg:px-[30px] max-tab-sm:px-4 max-tab-lg:mx-[30px] max-tab-sm:mx-4 ml-[45px] pr-[30px] rounded-[10px] py-[50px] flex flex-col gap-6 justify-center items-center">
          <h4 className="text-[28px] font-bold leading-[1.35] text-[#002029]">
            Couldn’t find a product?
          </h4>
          <Anchor
            href="/"
            className="!min-w-[233px] !py-[10.5px] text-sm !leading-[1.358] !text-[#002029]"
          >
            Request Item
          </Anchor>
        </div>
      </div>
    </div>
  );
};

export default MarketPlace;
