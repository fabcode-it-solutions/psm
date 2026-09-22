"use client";

import { useState } from "react";
import Anchor from "@/component/ui/Anchor/Anchor";

export default function PurchaseBox() {
  const [activeTab, setActiveTab] = useState<"buy" | "offer">("buy");

  return (
    <div className="bg-white rounded-[6px] border-[1.5px] border-[#E8E8E866] text-dark-blue-cm flex flex-col gap-[49px]">
     
      <div className="flex flex-col gap-[31px]">
        <div className="flex  max-sm:flex-col max-sm:items-center max-sm:gap-2">
          <h3
            className={`cursor-pointer font-supreme font-bold text-base leading-[24px] tracking-[1%] text-dark-blue-cm py-4.5 px-[93px]  rounded-md transition-colors ${
              activeTab === "buy" ? "bg-[#EFEFEF3D] text-dark-blue-cm" : "bg-white text-dark-blue-cm"
            }`}
            onClick={() => setActiveTab("buy")}
          >
            Buy Now
          </h3>
          <h3
            className={`cursor-pointer font-supreme font-bold text-base leading-[24px] tracking-[1%] text-dark-blue-cm py-4.5 px-[74px] rounded-md transition-colors ${
              activeTab === "offer" ? "bg-[#EFEFEF3D] text-dark-blue-cm" : "bg-white text-dark-blue-cm"
            }`}
            onClick={() => setActiveTab("offer")}
          >
            Send An Offer
          </h3>
        </div>
      </div>

     
      {activeTab === "buy" ? (
        
        <div className="max-w-[464px] w-full max-lg:w-full flex flex-col gap-4 pl-[22px]">
          <div>
            <h4 className="font-supreme font-bold text-[32px] leading-[100%] tracking-[1%] text-dark-blue-cm max-sm:text-[24px]">
              $2,285
            </h4>
          </div>
          <h4 className="font-supreme font-bold text-lg tracking-[1%] text-dark-blue-cm max-sm:text-base">
            This product will be shipped to your address: 09 Arnulfo Crossing,
            Botsfordborough, NSW
          </h4>

          <div className="flex justify-between items-center mb-5">
            <span>
              <p className="font-supreme font-normal text-xs tracking-[1%] text-dark-blue-cm max-w-[210px] w-full max-h-[32px] h-full max-sm:w-full max-sm:h-auto">
                You are about to purchase this listing at the price set by the
                Seller.
              </p>
            </span>
            <Anchor
              href="/marketplaces/12/payment/12/paymentmethod/12"
              className="!text-[#333333] !min-w-[233px] max-sm:!w-full !leading-[1.43] tracking-[0.1px] !py-[11px] font-bold font-supreme !text-xs"
            >
              Confirm
            </Anchor>
          </div>
        </div>
      ) : (
     
        <div className="max-w-[464px] w-full max-lg:w-full flex flex-col gap-4  pl-[22px]">
          <div className="flex items-center gap-6">
            <svg
              width="15"
              height="31"
              viewBox="0 0 13 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5.336 21.088V19.24C3.784 19.064 2.52 18.52 1.544 17.608C0.568 16.696 0.064 15.472 0.032 13.936H3.272C3.304 14.576 3.496 15.136 3.848 15.616C4.216 16.096 4.712 16.424 5.336 16.6V11.536C5.192 11.488 5.04 11.44 4.88 11.392C4.736 11.344 4.584 11.296 4.424 11.248C3.128 10.8 2.136 10.224 1.448 9.52C0.776 8.816 0.44 7.88 0.44 6.712C0.424 5.336 0.872 4.232 1.784 3.4C2.696 2.552 3.88 2.064 5.336 1.936V-0.00800133H6.944V1.96C8.384 2.104 9.544 2.608 10.424 3.472C11.32 4.32 11.792 5.416 11.84 6.76H8.552C8.536 6.296 8.384 5.872 8.096 5.488C7.824 5.088 7.44 4.808 6.944 4.648V9.112C7.072 9.16 7.2 9.208 7.328 9.256C7.456 9.288 7.584 9.328 7.712 9.376C8.544 9.664 9.304 10 9.992 10.384C10.68 10.768 11.232 11.28 11.648 11.92C12.064 12.544 12.272 13.352 12.272 14.344C12.272 15.176 12.064 15.952 11.648 16.672C11.248 17.392 10.648 17.992 9.848 18.472C9.064 18.936 8.096 19.2 6.944 19.264V21.088H5.336ZM3.656 6.496C3.656 7.008 3.808 7.424 4.112 7.744C4.416 8.048 4.824 8.312 5.336 8.536V4.552C4.84 4.648 4.432 4.864 4.112 5.2C3.808 5.536 3.656 5.968 3.656 6.496ZM9.008 14.56C9.008 13.92 8.816 13.416 8.432 13.048C8.048 12.68 7.552 12.368 6.944 12.112V16.672C7.584 16.576 8.088 16.344 8.456 15.976C8.824 15.608 9.008 15.136 9.008 14.56Z"
                fill="black"
              />
            </svg>

            <input
              type="number"
              placeholder="Enter Offer Price"
              className="border-[#00000014] bg-white border-[1px] rounded-[12px] p-[15px] placeholder:text-black text-sm w-full font-supreme font-normal leading-[100%] tracking-[0.01em] align-middle"
            />
          </div>
          <div className="flex justify-between max-sm:flex-col max-sm:gap-4 mt-[50] items-center mb-5">
            <span>
              <p className="font-supreme font-normal text-xs tracking-[1%] text-dark-blue-cm max-w-[171px] w-full max-h-[32px] h-full max-sm:w-full max-sm:h-auto">
                You are about to submit an offer to the Seller.
              </p>
            </span>
            <Anchor
              href="/marketplaces/12/payment/12/paymentmethod/12"
              className="!text-[#333333] !min-w-[233px] max-sm:!w-full !leading-[1.43] tracking-[0.1px] !py-[11px] font-bold font-supreme !text-xs"
            >
              Confirm
            </Anchor>
          </div>
        </div>
      )}
    </div>
  );
}   