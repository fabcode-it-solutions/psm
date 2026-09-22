"use client";
import React from "react";
import Image from "next/image";
import SearchProductCard from "../CreateListings/SearchProductCard";
import Anchor from "@/component/ui/Anchor/Anchor";

const RequestItem = () => {
  return (
    <div className="flex flex-col lg:flex-row w-full overflow-hidden">
      <div className="lg:w-[50.66%]  relative aspect-[766/662] lg:max-h-screen mb-4 lg:mb-0 ">
        <Image
          src="/assets/images/mainwheel.png"
          alt="Main Product Image"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/20 opacity-100 group-hover:opacity-100 transition" />
      </div>

      <div className=" flex flex-col w-full lg:w-[33.46%] lg:mx-auto">
        <div className="relative lg:bottom-7 bottom-0 mx-5 lg:mx-0">
          <SearchProductCard />
        </div>
        <div className="w-full max-w-[510px]  bg-white border-[#E8E8E866] border-[1.5px] rounded-[6px] shadow">
          <h2 className="justify-center flex mt-[30px] text-dark-blue-cm font-supreme font-bold text-xl leading-[100%] tracking-[0em] text-center align-middle">
            Couldn’t find a product?
          </h2>
          <p className="max-w-[450px] w-full text-center mx-auto mt-[10px] font-supreme font-normal text-xs leading-[100%] tracking-[0.01em] text-dark-blue-cm">
            Simply fill out our request form and let us do the work for you. Our
            team is dedicated to helping you find the item you need. With just a
            few quick clicks, you can make a request and we&apos;ll do our best to
            source the item for you.
          </p>

          <Anchor
            href="#"
            className="!text-[#333333] !min-w-[232px] max-sm:!w-full !leading-[1.43] tracking-[0.1px] !py-[11px] font-bold font-supreme !text-xs mt-[30px] mb-[40px] mx-auto"
          >
            Request Item
          </Anchor>
        </div>
      </div>
    </div>
  );
};

export default RequestItem;
