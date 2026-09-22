"use client"
import React, { useState } from "react";
import { Tabs } from "radix-ui";
import PurchaseOrderDetail from "../orders/purchase-order/PurchaseOrderDetail";
import OfferSend from "../orders/offer-order/OfferSend";
import ListingList from "../orders/my-listing/ListingList";
import SolidOrder from "../orders/solid-order/SolidOrder";
import Anchor from "@/component/ui/Anchor/Anchor";

const TabsLayout = () => {
  const [activeTab, setActiveTab] = useState("purchased"); 

  return (
    <section className="mt-[35px] max-w-[1333px] w-full mx-auto px-[30px] max-sm:mt-[30px] max-tab-sm:px-4">
      <div className="flex justify-between items-center">
        <div className="font-supreme font-bold text-[26px] leading-[100%] tracking-[1px] capitalize text-[#000000] flex gap-2">
          Orders
          <span className="font-[Supreme] font-medium text-[26px] leading-[100%] tracking-[1px] capitalize text-[#00000033]">
            (3)
          </span>
        </div>
      
        <div>
          {activeTab === "solid" ? (
           
            <Anchor
              href="/createlistings"
              className="!min-w-[233px] !py-[8px] !text-[#002029]"
            >
              Create a New Listing
            </Anchor>
          ) : (
         
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 16H14C14.5523 16 15 16.4477 15 17C15 17.5128 14.614 17.9355 14.1166 17.9933L14 18H10C9.44772 18 9 17.5523 9 17C9 16.4872 9.38604 16.0645 9.88338 16.0067L10 16H14H10ZM8 11H16C16.5523 11 17 11.4477 17 12C17 12.5128 16.614 12.9355 16.1166 12.9933L16 13H8C7.44772 13 7 12.5523 7 12C7 11.4872 7.38604 11.0645 7.88338 11.0067L8 11H16H8ZM5 6H19C19.5523 6 20 6.44772 20 7C20 7.51284 19.614 7.93551 19.1166 7.99327L19 8H5C4.44772 8 4 7.55228 4 7C4 6.48716 4.38604 6.06449 4.88338 6.00673L5 6H19H5Z"
                fill="#212121"
              />
            </svg>
          )}
        </div>
      </div>



    
      <div className="flex flex-col mt-[30px]">
        <Tabs.Root
          defaultValue="purchased"
          value={activeTab}
          onValueChange={(value) => setActiveTab(value)} 
          className="w-full"
        >
          <Tabs.List className="flex bg-[#FFFFFF] border-[1.5px] border-[#F7F7F7] rounded-[6px] min-h-[48px] h-full justify-between items-center max-sm:gap-1 max-sm:px-1">
            <Tabs.Trigger
              value="purchased"
              className="flex max-w-[316px] w-full min-h-[48px] items-center justify-center cursor-pointer select-none text-dark-blue-cm font-medium text-lg leading-[1.2] data-[state=active]:text-black data-[state=active]:border-b-[4px] data-[state=active]:border-[#54DC00] max-sm:text-sm max-sm:px-1"
            >
              Purchased Order
            </Tabs.Trigger>
            <Tabs.Trigger
              value="offers"
              className="flex max-w-[316px] w-full min-h-[48px] items-center justify-center cursor-pointer select-none text-[#828282] font-medium text-lg leading-[1.2] data-[state=active]:text-black data-[state=active]:border-b-4 data-[state=active]:border-[#54DC00] max-sm:text-sm max-sm:px-1"
            >
              Offers Sent
            </Tabs.Trigger>
            <Tabs.Trigger
              value="listings"
              className="flex max-w-[316px] w-full min-h-[48px] items-center justify-center cursor-pointer select-none text-[#828282] font-medium text-lg leading-[1.2] data-[state=active]:text-black data-[state=active]:border-b-4 data-[state=active]:border-[#54DC00] max-sm:text-sm max-sm:px-1"
            >
              My Listings
            </Tabs.Trigger>
            <Tabs.Trigger
              value="solid"
              className="flex max-w-[316px] w-full min-h-[48px] items-center justify-center cursor-pointer select-none text-[#828282] font-medium text-lg leading-[1.2] data-[state=active]:text-black data-[state=active]:border-b-4 data-[state=active]:border-[#54DC00] max-sm:text-sm max-sm:px-1"
            >
              Solid Orders
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="purchased" className="mt-4">
            <PurchaseOrderDetail />
          </Tabs.Content>
          <Tabs.Content value="offers" className="mt-4">
            <OfferSend />
          </Tabs.Content>
          <Tabs.Content value="listings" className="mt-4">
            <ListingList />
          </Tabs.Content>
          <Tabs.Content value="solid" className="mt-4">
            <SolidOrder />
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </section>
  );
};

export default TabsLayout;
