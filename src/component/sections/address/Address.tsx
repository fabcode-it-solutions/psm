"use client";

import Anchor from "@/component/ui/Anchor/Anchor";

import ProductImageGallery from "./ProductImageGallery";
import BreadcrumbHeader from "./BreadcrumbHeader";
import IconPencil from "@/assets/icons/IconPencil";

const Address = () => {
  const images = [
    "/assets/images/wheel1.jpg",
    "/assets/images/wheel2.jpg",
    "/assets/images/wheel3.png",
    "/assets/images/wheel4.jpg",
    "/assets/images/mainwheel.png",
  ];

  return (
    <div className="flex flex-col lg:flex-row max-w-[1272] w-full mx-auto justify-between  overflow-hidden">
      <ProductImageGallery
        images={images}
        mainImage="/assets/images/mainwheel.png"
      />

      <div className=" flex flex-col max-w-[506px] w-full   pt-8 sm:pt-12 lg:pt-[80px] gap-10 sm:gap-12 lg:gap-16">
        <BreadcrumbHeader
          breadcrumbs={["Home", "Rays", "RAYS Volk Racing"]}
          currentPage="Purchase Product"
          title="RAYS Volk Racing TE37V Mark II"
          onClose={() => console.log("Closed!")}
        />
        <div className="flex flex-col gap-55 ">
          <div className=" flex flex-col gap-2">
            <label className="font-supreme text-sm leading-[16px] tracking-[0%] text-[#606060] font-medium">
              Your Address
            </label>
            <div className="flex items-center justify-between border border-[#E8E8E866] text-lg leading-[100%] tracking-[1%] rounded-[6px] px-4 bg-white text-dark-blue-cm">
             <h3 className="flex-grow outline-none py-4 placeholder:text-dark-blue-cm font-supreme font-bold text-lg leading-[100%] tracking-[0.01em]">
                09 Arnulfo Crossing, Botsfordborough, NSW
                </h3>
              <button className="">
                <IconPencil fill="fade" />
              </button>
            </div>
          </div>

          <div className=" flex lg:justify-end lg:pr-1 justify-center">
            <Anchor
              href="/marketplaces/12/payment/12"
              className="!text-[#333333] !min-w-[233px]   !leading-[1.43] tracking-[0.1px] !py-[11px] font-bold font-supreme !text-xs  "
            >
              Confirm
            </Anchor>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Address;
