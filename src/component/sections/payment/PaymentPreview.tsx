import React from "react";
import Image from "next/image";
import BreadcrumbHeader from "../address/BreadcrumbHeader";
import IconPencil from "@/assets/icons/IconPencil";
import Anchor from "@/component/ui/Anchor/Anchor";

const PaymentPreview = () => {
  const summary = [
    { label: "Delivery", value: "$200" },
    { label: "Product", value: "$1,400" },
    { label: "GST", value: "$25" },
    { label: "Total", value: "$1,625" },
  ];
   const details = [
    "09 Arnulfo Crossing, Botsfordborough, NSW",
    "Used, 5x120, 18x9.5+45",
    "**** **** 1234",
  ];
  return (
    <div className="flex flex-col lg:flex-row w-full overflow-hidden">
    <div className="lg:w-[50.66%] relative aspect-[766/662] lg:max-h-[662px] mb-4 lg:mb-0">
        <Image
          src="/assets/images/mainwheel.png"
          alt="Main Product Image"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/20 opacity-100 group-hover:opacity-100 transition" />
      </div>

      <div className=" flex flex-col lg:w-[33.46%] mx-auto lg:pt-20">
        <BreadcrumbHeader
          breadcrumbs={["Home", "Rays", "RAYS Volk Racing"]}
          currentPage="Purchase Product"
          title="RAYS Volk Racing TE37V Mark II"
          onClose={() => console.log("Closed!")}
        />

        
          <div className="flex flex-col gap-3 mt-15">
            {details.map((detail, index) => (
            <div
              key={index} className="flex items-center justify-between border border-[#E8E8E866] text-lg leading-[100%] tracking-[1%] rounded-[6px] px-4 bg-white text-dark-blue-cm">
              <h3 className="flex-grow outline-none py-4 placeholder:text-dark-blue-cm font-supreme font-bold text-lg leading-[100%] tracking-[0.01em]">
                {detail}
              </h3>
              <button className="">
                <IconPencil />
              </button>
            </div>
              ))}
          </div>

         

            <div className="mt-10">
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
               </div>

              
                <div className="flex flex-col gap-3 mt-6">
                  {summary.map((item, index) => (
            <div key={index} className="flex justify-between">
                    <span className="font-supreme font-bold text-lg leading-[100%] tracking-[0.01em] text-dark-blue-cm">
                      {item.label}
                    </span>
                    <span className="font-supreme font-bold text-lg leading-[100%] tracking-[0.01em] text-dark-blue-cm">
                      {item.value}
                    </span>
                  </div>
                   ))}
                </div>
                <div className="flex gap-[12px] max-sm:flex-col max-sm:gap-4 items-center mt-12 mb-[49px]">
                  <p className="font-supreme font-normal text-xs tracking-[1%] text-dark-blue-cm max-w-[261px] w-full max-h-[32px] h-full max-sm:w-full max-sm:h-auto ">
                    *Lorem ipsum dolor sit amet consectetur. Et luctus eu
                    pretium id. At elit sed sagittis donec.
                  </p>

                  <Anchor
                    href="/marketplaces/12/payment/12/paymentmethod/12/paymentpreview/1/buycomplete/1"
                    className="!text-[#333333] !min-w-[233px] max-sm:!w-full !leading-[1.43] tracking-[0.1px] !py-[11px] font-bold font-supreme !text-xs"
                  >
                    Confirm & Pay
                  </Anchor>
                </div>
             
           
         
       
      </div>
    </div>
  );
};

export default PaymentPreview;
