import Breadcrumb from "@/component/ui/BreadCrumb/BreadCrumb";
import Button from "@/component/ui/Button/Button";
import Heading from "@/component/ui/Heading/Heading";
import ProductMainImage from "@/component/ui/ProductMainImage/ProductMainImage";
import { RadioGroup } from "radix-ui";
import React from "react";
const ShippingAddress = () => {
  return (
    <div className="max-w-[92.0634921%] w-full mr-auto flex justify-between max-des-sm:flex-col max-des-sm:max-w-full mb-[82px] max-tab-sm:mb-[10px]">
      <ProductMainImage />
      <div className="w-[36.3505747%] mt-[80px]  max-des-sm:w-full max-des-sm:px-[30px] max-tab-sm:my-[20px] max-tab-sm:px-[16px]">
        <Breadcrumb />
        <Heading level={3} className="mt-[16px]">RAYS Volk Racing TE37V Mark II</Heading>
        <form className="mt-[60px] max-tab-sm:mt-[30px]">
          <h4 className="text-base font-normal leading-[1.313] w-fit tracking-[0.16px] text-[#002029] ">
            Select Shipping Option
          </h4>
          <RadioGroup.Root
            className="flex flex-col gap-3 mt-[12px]"
            defaultValue="2"
          >
            <RadioGroup.Item
              className="group relative py-[15px] px-[20px] bg-[#FFFFFF] focus:outline-none focus:ring-0 border border-[#E8E8E8] rounded-[6px] flex justify-between cursor-pointer"
              value="1"
            >
              Regular
              <span className="w-6 h-6 flex items-center justify-center border-2 rounded-full border-[#002029] group-data-[state=checked]:border-[#37FF00]">
                <RadioGroup.Indicator className="w-3 h-3 bg-[#37FF00] rounded-full" />
              </span>
            </RadioGroup.Item>
            <RadioGroup.Item
              className="group relative py-[15px] px-[20px] focus:outline-none focus:ring-0 bg-[#FFFFFF] border border-[#E8E8E8] rounded-[6px] justify-between flex cursor-pointer"
              value="2"
            >
              Express
              <span className="w-6 h-6 flex items-center justify-center border-2 border-[#002029] rounded-full group-data-[state=checked]:border-accent-100">
                <RadioGroup.Indicator className="w-3 h-3 bg-[#37FF00] rounded-full" />
              </span>
            </RadioGroup.Item>
          </RadioGroup.Root>
          <div className="mt-[32px] ">
            <h4 className="text-base font-normal leading-[1.313] w-fit tracking-[0.16px] text-[#002029] ">
              Add Package Dimensions
            </h4>
            <div className="flex flex-col rounded-[6px] border-[1.5] bg-[#FFFFFF]  mt-[12px] border-[#E8E8E8] pt-[40px] px-[20px] pb-[27px]">
              <div className="flex gap-[21px] items-center">
                <p>Order Weight:</p>
                <span className="relative max-w-[342px] ">
                  <input
                    type="text"
                    className="border border-[#E8E8E8] rounded-[12px] p-[11px] pr-12 w-full"
                  />
                  <p className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#B0B0B0] pointer-events-none select-none">
                    kgs
                  </p>
                </span>
              </div>
              <span className="border-[1px] border-[#00000014] my-[12px]"></span>
              <div className="flex gap-[21px] items-center">
                <p>Dimensions:</p>
                <div className="relative w-full flex gap-5 max-des-sm:flex-wrap">
                  <span className="relative w-full flex gap-2 items-center">
                    H
                    <input
                      type="text"
                      className="border border-[#E8E8E8] rounded-[12px] p-[11px] pr-12 w-full"
                    />
                    <p className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#B0B0B0] pointer-events-none select-none">
                      mm
                    </p>
                  </span>

                  <span className="relative w-full flex gap-2 items-center">
                    W
                    <input
                      type="text"
                      className="border border-[#E8E8E8] rounded-[12px] p-[11px] pr-12 w-full"
                    />
                    <p className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#B0B0B0] pointer-events-none select-none">
                      mm
                    </p>
                  </span>
                  <span className="relative w-full flex gap-2 items-center">
                    L
                    <input
                      type="text"
                      className="border border-[#E8E8E8] rounded-[12px] p-[11px] pr-12 w-full"
                    />
                    <p className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#B0B0B0] pointer-events-none select-none">
                      mm
                    </p>
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
          <Button type="submit" className="!py-[8px] !min-w-[233px] mt-[65px] !text-[#002029] ">
           Next
          </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default ShippingAddress;
