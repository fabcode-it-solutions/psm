"use client";

import { useState } from "react";
import BreadcrumbHeader from "../address/BreadcrumbHeader";
import ProductImageGallery from "../address/ProductImageGallery";
import Anchor from "@/component/ui/Anchor/Anchor";

export default function PaymentOptions() {
  const [selected, setSelected] = useState("paypal");

  const paymentMethods = [
    { id: "paypal", label: "Pay Pal" },
    { id: "credit", label: "Credit Card" },
  ];

  const images = [
    "/assets/images/wheel1.jpg",
    "/assets/images/wheel2.jpg",
    "/assets/images/wheel3.png",
    "/assets/images/wheel4.jpg",
    "/assets/images/mainwheel.png",
  ];

  const [checked, setChecked] = useState(false);

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
          subtitle="By pressing confirm you are committing to paying for the confirmed amount"
          onClose={() => console.log("Closed!")}
        />

        <div className="flex flex-col gap-[155px] px-10 lg:px-0">
          <div className="w-full max-w-md">
            <h2 className=" text-dark-blue-cm mb-4 font-supreme font-normal not-italic text-base leading-[100%] tracking-[1%]">
              Select Payment Option
            </h2>

            <div className="flex flex-col gap-4 max-w-[506px] w-full lg:w-[506px]">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelected(method.id)}
                  className={`w-full py-4 flex items-center justify-between border rounded-lg px-5 transition bg-white text-dark-blue-cm ${
                    selected === method.id
                      ? "border-gray-300"
                      : "border-gray-300"
                  }`}
                >
                  <span className="font-supreme font-bold not-italic text-lg leading-[100%] tracking-[1%] text-dark-blue-cm">
                    {method.label}
                  </span>
                  <span
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selected === method.id
                        ? "border-[#54DC00]"
                        : "border-dark-blue-cm"
                    }`}
                  >
                    {selected === method.id && (
                      <span className="w-2.5 h-2.5 bg-[#54DC00] rounded-full"></span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-5 max-sm:flex-col max-sm:gap-4">
            <span className="flex gap-2 items-center">
              <span
                onClick={() => setChecked(!checked)}
                className="cursor-pointer"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    x="0.5"
                    y="0.5"
                    width="17"
                    height="17"
                    rx="2"
                    fill={checked ? "#212121" : "none"}
                    stroke="#212121"
                  />

                  {checked && (
                    <path
                      d="M13.4697 4.96967L7 11.4393L4.53033 8.96967C4.23744 8.67678 3.76256 8.67678 3.46967 8.96967C3.17678 9.26256 3.17678 9.73744 3.46967 10.0303L6.46967 13.0303C6.76256 13.3232 7.23744 13.3232 7.53033 13.0303L14.5303 6.03033C14.8232 5.73744 14.8232 5.26256 14.5303 4.96967C14.2374 4.67678 13.7626 4.67678 13.4697 4.96967Z"
                      fill="white"
                    />
                  )}
                </svg>
              </span>
              <p className="font-supreme font-normal text-xs tracking-[1%] text-dark-blue-cm max-w-[210px] w-full max-sm:w-full max-sm:h-auto ">
                Do you wish to save your payment details for future use?
              </p>
            </span>
            <Anchor
              href="/marketplaces/12/payment/12/paymentmethod/12/paymentpreview/1"
              className="relative !text-[#333333] !min-w-[233px] max-sm:!w-full !leading-[1.43] tracking-[0.1px] !py-[11px] font-bold font-supreme !text-xs"
            >
              Confirm
            </Anchor>
          </div>
        </div>
      </div>
    </div>
  );
}
