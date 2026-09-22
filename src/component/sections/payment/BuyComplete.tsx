import Anchor from "@/component/ui/Anchor/Anchor";
import React from "react";
import Image from "next/image";
import BreadcrumbHeader from "../address/BreadcrumbHeader";
import IconBuyComplete from "@/assets/icons/IconBuyComplete";


const BuyComplete = () => {
  return (
   <div className="flex flex-col lg:flex-row w-full overflow-hidden">
      <div className="lg:w-[50.66%] relative aspect-[698/462] lg:max-h-[662px] mb-4 lg:mb-0">
        <Image
          src="/assets/images/mainwheel.png"
          alt="Main Product Image"
          fill
          className="object-cover"
        />
      <div className="absolute inset-0 bg-black/20 opacity-100 group-hover:opacity-100 transition" />
      </div>

       <div className=" flex flex-col lg:w-[33.46%]  lg:pt-20 gap-10 sm:gap-12 lg:gap-[50px] lg:pb-[55px] mx-auto ">
        <BreadcrumbHeader
          breadcrumbs={["Home", "Rays", "RAYS Volk Racing"]}
          currentPage="Purchase Product"
          title="RAYS Volk Racing TE37V Mark II"
          onClose={() => console.log("Closed!")}
        />

       <div className="flex flex-col gap-10 lg:gap-[105px] w-full">
          <div className="max-w-[408px] w-full flex flex-col gap-4 lg:gap-[39.59px] ">
            <div className="flex ml-[76px]">
              <IconBuyComplete />
            </div>
            <div className="flex flex-col gap-4">
              
              <h3 className="flex justify-center font-supreme font-bold text-[26px] text-[#000000] leading-[18px] tracking-[-0.17px] text-center capitalize">
                Purchase Complete
              </h3>
              <h4 className="flex justify-center font-supreme font-normal text-sm text-[#000000] leading-[140%] tracking-[0.01em] text-center">
                This product will be shipped to your address.
              </h4>
            </div>
          </div>

          <div className="flex justify-end max-sm:flex-col max-sm:gap-4">
            <Anchor
              href="/purchaseorderlists"
              className="!text-[#333333] !min-w-[233px] max-sm:!w-full !leading-[1.43] tracking-[0.1px] !py-[11px] font-bold font-supreme !text-xs"
            >
              Track Order
            </Anchor>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyComplete;
