"use client";

import React, { useState } from "react";
import HeadingSlideButtons from "@/component/global/HeadingSlideButtons";
import * as Tabs from "@radix-ui/react-tabs";
import Bar from "./BarDesign";

// Full 12 months of price data
const allPrices = [
  { month: "Jan", price: 2000 },
  { month: "Feb", price: 1800 },
  { month: "Mar", price: 2300 },
  { month: "Apr", price: 1700 },
  { month: "May", price: 2600 },
  { month: "Jun", price: 3100 },
  { month: "Jul", price: 3500 },
  { month: "Aug", price: 4500 },
  { month: "Sep", price: 5285 },
  { month: "Oct", price: 5000 },
  { month: "Nov", price: 4000 },
  { month: "Dec", price: 2700 },
];

const MAX_HEIGHT = 200;

const PriceHistory = () => {
  const [selectedTab, setSelectedTab] = useState("tab1");

  const getFilteredPrices = () => {
    if (selectedTab === "tab2") return allPrices.slice(0, 3); 
    if (selectedTab === "tab3") return allPrices.slice(0,6); 
    if (selectedTab === "tab4") return allPrices.slice(-12); 
    return allPrices; 
  };

  const prices = getFilteredPrices();
  const maxPrice = Math.max(...prices.map((p) => p.price));

  return (
    <div className="mt-[40px] max-w-[1373px] w-full mx-auto px-[30px] max-tab-sm:px-4 max-sm:hidden">
      <div className="bg-white rounded-[6px] py-[95px] px-[42px] max-tab-lg:px-4">
        <HeadingSlideButtons
          heading="Price History"
          isButtons={false}
          hideRightSide={true}
        />

        <Tabs.Root
          className="TabsRoot"
          defaultValue="tab1"
          value={selectedTab}
          onValueChange={setSelectedTab}
        >
          <Tabs.List
            className="TabsList flex gap-[12px] pl-[30px]"
            aria-label="Manage your account"
          >
            <Tabs.Trigger
              className="TabsTrigger data-[active]:bg-dark-100 py-[4.5px] px-[12px] border-[1.5px] text-[18px] font-normal rounded-[6px] border-[#00000014] bg-white"
              value="tab1"
            >
              All
            </Tabs.Trigger>
            <Tabs.Trigger
              className="TabsTrigger py-[4.5px] px-[12px] border-[1.5px] rounded-[6px] border-[#00000014] bg-white"
              value="tab2"
            >
              3 Months
            </Tabs.Trigger>
            <Tabs.Trigger
              className="TabsTrigger py-[4.5px] px-[12px] border-[1.5px] rounded-[6px] border-[#00000014] bg-white"
              value="tab3"
            >
              6 Months
            </Tabs.Trigger>
            <Tabs.Trigger
              className="TabsTrigger py-[4.5px] px-[12px] border-[1.5px] rounded-[6px] border-[#00000014] bg-white"
              value="tab4"
            >
              1 Year
            </Tabs.Trigger>
          </Tabs.List>
        </Tabs.Root>

        <div className="pt-[32px] pl-[30px] max-des-sm:pl-0">
          <div className="text-3xl font-bold text-red-600 mb-1">
            ${prices[prices.length - 1].price.toLocaleString()}
          </div>
          <div className="text-red-500 mb-8">
            - $
            {(
              prices[0].price - prices[prices.length - 1].price
            ).toLocaleString()}{" "}
            ({(
              ((prices[0].price - prices[prices.length - 1].price) /
                prices[0].price) *
              100
            ).toFixed(0)}
            %)
          </div>

          <div className="flex items-end gap-[40px] pl-[38px]  my-[43px] max-des-sm:pl-0 max-tab-lg:gap-[20px]">
            {prices.map((data, index) => {
              const prevPrice =
                index > 0 ? prices[index - 1].price : data.price;
              const isIncrease = data.price >= prevPrice;
              const height = (data.price / maxPrice) * MAX_HEIGHT;

              return (
                <Bar
                  key={data.month}
                  height={height}
                  type={isIncrease ? "increase" : "decrease"}
                  label={data.month}
                />
              );
            })}
          </div>

          <div className="grid grid-cols-4 text-center text-[#002029]">
            <div className="w-fit">
              <div className="text-[32px] max-tab-sm:text-[24px] font-bold leading-[1.344] tracking-[0.32px] text-[#002029]">
                ${Math.min(...prices.map((p) => p.price)).toLocaleString()}
              </div>
              <div className="text-sm leading-[1.358] tracking-[0.14px] font-light opacity-40">
                Lowest EOI
              </div>
            </div>
            <div className="w-fit">
              <div className="text-[32px] max-tab-sm:text-[24px] font-bold leading-[1.344] tracking-[0.32px] text-[#002029]">
                ${Math.max(...prices.map((p) => p.price)).toLocaleString()}
              </div>
              <div className="text-sm leading-[1.358] tracking-[0.14px] font-light opacity-40">
                Highest EOI
              </div>
            </div>
            <div className="w-fit">
              <div className="text-[32px] max-tab-sm:text-[24px] font-bold leading-[1.344] tracking-[0.32px] text-[#002029]">
                {
                  prices.reduce((a, b) =>
                    a.price > b.price ? a : b
                  ).month
                }
              </div>
              <div className="text-sm leading-[1.358] tracking-[0.14px] font-light opacity-40">
                Highest Month
              </div>
            </div>
            <div className="w-fit">
              <div className="text-[32px] max-tab-sm:text-[24px] font-bold leading-[1.344] tracking-[0.32px] text-red-600">
                -$
                {Math.abs(
                  prices[0].price - prices[prices.length - 1].price
                ).toLocaleString()}
              </div>
              <div className="text-sm leading-[1.358] tracking-[0.14px] font-light opacity-40">
                Current Drop
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceHistory;
