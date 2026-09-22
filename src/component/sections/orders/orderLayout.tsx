"use client";
import React, { useState } from "react";
import Image from "next/image";
import Breadcrumb from "@/component/ui/BreadCrumb/BreadCrumb";
import Button from "@/component/ui/Button/Button";
import Anchor from "@/component/ui/Anchor/Anchor";
import AccordionTabs from "@/component/ui/Accordin/Accordin";
import OrderHistory from "./OrderHistory";
import DialogPopup from "@/component/ui/dashboard/DialogPopup";
import OfferManagement from "./my-listing/OfferManagement";
import IconRightArrow from "@/assets/icons/IconRightArrow";
import Heading from "@/component/ui/Heading/Heading";
interface AccordionItem {
  value: string;
  title: string;
  content: string;
}interface offerManagement {
  [x: string]: React.ReactNode | string;
  status: string;
  date: string;
  icon: React.ReactNode;
  price: string;
  userName: string;
}

interface OrderHistoryStep {
  status: string;
  date: string;
  icon: React.ReactNode;
}
type Listing = {
  id: string;
  title: string;
  image: string;
  code: string;
  date: string;
  status: string;
  orderNumber?: string;
};
interface PurchaseOrderProps {
  breadcrumbItems: string[];
  title: string;
  buyPrice: string;
  images: { src: string; alt?: string }[];
  addressInfo: string[];
  deliveryPrice: string;
  productPrice: string;
  gstPrice: string;
  totalPrice: string;
  onCancel: () => void;
  lastSalePrice: string;
  lastSaleChange: string;
  accordionItems: AccordionItem[];
  orderHistorySteps?: OrderHistoryStep[];
  offerManagement?: offerManagement[];
  accordionType?: "single" | "multiple";
  accordionDefaultValue?: string | string[];
  accordionCollapsible?: boolean;
  isUpdate?: boolean;
  isUpdateMode?: boolean;
  listingType?: string;
  buttonText?: string;
  cancelButtonText?: string;
   onRowClick?: (item: Listing) => void;
}


const PurchaseOrder: React.FC<PurchaseOrderProps> = ({
  title,
  buyPrice,
  images,
  addressInfo,
  deliveryPrice,
  productPrice,
  gstPrice,
  totalPrice,
  onCancel,
  lastSalePrice,
  lastSaleChange,
  accordionItems,
  orderHistorySteps,
  offerManagement,
  accordionType,
  listingType,
  accordionDefaultValue,
  accordionCollapsible,
  buttonText,
  cancelButtonText,
  isUpdateMode = false,
}) => {
  const [showDialog, setShowDialog] = useState(false);
  const [actionType, setActionType] = useState<"cancelListing" | "cancel" | null>(
    null
  );

  const handleConfirm = () => {
    setShowDialog(false);
    if (actionType === "cancelListing") {
    } else if (actionType === "cancel") {
      onCancel();
    }
  };
  return (
    <section className="max-w-[81.4814814815%] w-full mx-auto px-[30px] flex justify-between my-[80px] flex-wrap max-tab-lg:gap-[40px] max-tab-lg:max-w-full max-tab-sm:px-4">
      <div className="w-[43.1740614%] max-tab-lg:w-full">
        <Breadcrumb  />
       <Heading level={3} className="mt-[16px]">
          {title}
        </Heading>
        <span className="flex flex-col mt-[32px]">
          <p className="font-light text-sm leading-[1.358] tracking-[0.14px] text-[#002029] opacity-40 w-fit">
            Buy Price
          </p>
          <h3 className="text-[32px] font-bold tracking-[0.32px] leading-[1.344] w-fit">
            {buyPrice}
          </h3>
        </span>

        <div className="mt-[28px] flex gap-3 flex-wrap">
          {images.map(({ src, alt }, idx) => (
            <Image
              key={idx}
              src={src}
              alt={alt || ""}
              width={120}
              height={120}
              className="rounded-[6px] border-[1.5px] border-[#E8E8E866]"
            />
          ))}
        </div>

        <div className="mt-[24px] flex flex-col gap-3 pb-[40px]">
          {addressInfo.map((info, idx) => (
            <span
              key={idx}
              className="py-[15px] border-[#E8E8E866] border-[1.5px] rounded-[6px] pl-[20px] bg-[#FFFFFF] font-bold text-[18px] leading-[1.223] tracking-[0.18px]"
            >
              {info}
            </span>
          ))}
        </div>
        <form className="bg-[length:20px_1.5px] bg-repeat-x bg-[linear-gradient(to_right,#0000001F_10px,transparent_10px)] pt-[24px] flex flex-col gap-3">
          <span className="flex justify-between">
            <p className="text-[18px] font-bold leading-[1.334]">Delivery</p>
            <p className="text-[18px] font-bold leading-[1.334]">
              {deliveryPrice}
            </p>
          </span>
          <span className="flex justify-between">
            <p className="text-[18px] font-bold leading-[1.334]">Product</p>
            <p className="text-[18px] font-bold leading-[1.334]">
              {productPrice}
            </p>
          </span>
          <span className="flex justify-between">
            <p className="text-[18px] font-bold leading-[1.334]">Gst</p>
            <p className="text-[18px] font-bold leading-[1.334]">{gstPrice}</p>
          </span>
          <span className="flex justify-between">
            <p className="text-[18px] font-bold leading-[1.334]">Total</p>
            <p className="text-[18px] font-bold leading-[1.334]">
              {totalPrice}
            </p>
          </span>
          {isUpdateMode ? (
            <div className="mt-[23px] flex justify-end gap-4 flex-wrap">
              <Button
                type="button"
                className="!bg-[#55E200] !text-[#002029] !font-semibold !min-w-[180px] !py-[8px] hover:opacity-90"
              >
                {buttonText  || "Update Order"}
              </Button>
              <Button
                type="button"
                className="!bg-[#F3F3F3] !text-[#002029] !font-semibold !min-w-[180px] !py-[8px]"
                onClick={() => {
                  setActionType("cancel");
                  setShowDialog(true);
                }}
              >
                {cancelButtonText || "Cancel Order"}
              </Button>
            </div>
          ) : (
            <span className="mt-[23px] flex justify-end">
              <Button
                type="button"
                className="!min-w-[233px] !py-[8px] !text-[#002029]"
                onClick={() => {
                  setActionType("cancel");
                  setShowDialog(true);
                }}
              >
                Cancel Order
              </Button>
            </span>
          )}

          <DialogPopup
            heading={
           actionType === "cancel"
      ? "Are you sure you want to cancel this order?"
      : "Are you sure you want to cancel this listing?"
  }
            open={showDialog}
            setShowCreateModal={(val) => {
              if (!val) setShowDialog(false);
            }}
            mode="light"
          >
            <div className="flex gap-4 mt-4">
              <Button
                type="button"
                className="!bg-gray-200 !text-black !min-w-[120px]"
                onClick={() => setShowDialog(false)}
              >
                No
              </Button>
              <Button
                type="button"
                className="!text-white !min-w-[120px]"
                onClick={handleConfirm}
              >
                {actionType === "cancelListing" ? "Yes, Cancel" : "Yes, cancel"}
              </Button>
            </div>
          </DialogPopup>
        </form>
        {listingType && (
        <span className="bg-[#FFFFFF] rounded-[6px] border-[1.5] py-[32px] px-[20px] border-[#E8E8E866] flex justify-between mt-[27px] mb-[16px]">
          <p className="text-[18px] font-bold tracking-[0.18px] leading-[1.334] text-[#002029] ">
          {listingType}
          </p>
          <IconRightArrow />
        </span>
        )} 
        <div className="mt-[31px] flex flex-col gap-2">
          <div className="flex justify-between flex-wrap">
            <span>
              <p className="text-sm font-light text-[#002029] opacity-40">
                Last Sale
              </p>
              <h4 className="text-[32px] font-bold text-[#002029]">
                {lastSalePrice}
              </h4>
            </span>
            <span className="flex gap-[10px] flex-wrap">
              <Anchor
                href="/"
                className="!bg-[#EFEFEF] !min-w-[110px] !text-[#002029] !text-[12px]"
              >
                View All prices
              </Anchor>
              <Anchor
                href="/"
                className="!bg-[#EFEFEF] !min-w-[110px] !text-[#002029] !text-[12px]"
              >
                View Offers
              </Anchor>
              <Anchor
                href="/"
                className="!bg-[#EFEFEF] !min-w-[110px] !text-[#002029] !text-[12px]"
              >
                View Sales
              </Anchor>
            </span>
          </div>

          <span className="flex gap-2 items-center">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8.75 12L13.2982 11.9986L13.4058 11.9841L13.519 11.9509L13.6206 11.9031L13.6592 11.8797L13.7079 11.8452L13.784 11.7782L13.8682 11.677L13.9266 11.5773L13.9681 11.4719L13.9912 11.3745L14.0015 11.25V6.74611C14.0015 6.3319 13.6657 5.99611 13.2515 5.99611C12.8718 5.99611 12.558 6.27826 12.5084 6.64434L12.5015 6.74611L12.501 9.439L8.28044 5.21589C8.01407 4.9494 7.59709 4.92527 7.30344 5.14342L7.21931 5.21614L5.74855 6.68888L3.28044 4.21978C2.9876 3.92682 2.51273 3.92673 2.21978 4.21956C1.95346 4.48578 1.92917 4.90244 2.14696 5.19609L2.21956 5.28022L5.21836 8.28022C5.48474 8.54671 5.90171 8.57084 6.19536 8.35269L6.27949 8.27997L7.75024 6.80724L11.441 10.5H8.75C8.3703 10.5 8.05651 10.7822 8.00685 11.1482L8 11.25C8 11.6642 8.33579 12 8.75 12Z"
                fill="#EB5757"
              />
            </svg>
            <p className="text-base font-bold text-[#EB5757]">
              {lastSaleChange}
            </p>
          </span>
        </div>

        <AccordionTabs
          accordionItems={accordionItems}
          type={accordionType}
          defaultValue={accordionDefaultValue}
          collapsible={accordionCollapsible}
        />
      </div>
      <div className="w-[44.8805461%] max-tab-lg:w-full">
        <OrderHistory steps={orderHistorySteps ?? []} />
        {typeof offerManagement !== "undefined" &&
          offerManagement &&
          offerManagement.length > 0 && (
            <OfferManagement offers={offerManagement} />
          )}
      </div>
    </section>
  );
};

export default PurchaseOrder;
