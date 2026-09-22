"use client"
import React from "react";
import Image from "next/image";
import ListingTable from "../ListingLayout";
import { useRouter } from "next/navigation";


const OfferSend = () => {
   const listings = [
    {
      id: "123456781",
      title: "RAYS Volk Racing TE37V Mark II",
      image: "/assets/images/car.png",
      limitedPrice: "$2,500",
      myOffer: "$2,000",
      code: "#23201C",
      date: "12/01/23",
      status: "Offer Sent",
    },
    {
      id: "123456782",
      title: "RAYS Volk Racing TE37V Mark II",
      image: "/assets/images/car.png",
      limitedPrice: "$2,500",
      myOffer: "$2,000",
      code: "#23201C",
      date: "12/01/23",
      status: "Offer Sent",
    },
    {
      id: "123456783",
      title: "RAYS Volk Racing TE37V Mark II",
      image: "/assets/images/car.png",
      limitedPrice: "$2,500",
      myOffer: "$2,000",
      code: "#23201C",
      date: "12/01/23",
      status: "Offer Sent",
    },
    {
      id: "123456784",
      title: "RAYS Volk Racing TE37V Mark II",
      image: "/assets/images/car.png",
      limitedPrice: "$2,500",
      myOffer: "$2,000",
      code: "#23201C",
      date: "12/01/23",
      status: "Offer Sent",
    },
  ];

  type Listing = typeof listings[0];
  type Header = {
    key: keyof Listing;
    label: string;
    width: string;
  };

  const headers: Header[] = [
    { key: "title", label: "Listing Title", width: "30.42%" },
    { key: "code", label: "Part Number", width: "9.75%" },
    { key: "limitedPrice", label: "Limited Price", width: "9.91%" },
    { key: "myOffer", label: "My Offer", width: "7.47%" },
    { key: "status", label: "Status", width: "12.58%" },
    { key: "date", label: "Date", width: "7.55%" },
  ];

  const renderRow = (item: typeof listings[0]) => (
  <div className="flex bg-[#FFFFFF] justify-between mb-[2px] flex-wrap max-sm:mb-3">
    <div
      className="py-[19.5px] px-[16px] flex gap-[16px] max-sm:w-full max-tab-lg:w-[43.43%]"
      style={{ width: headers[0].width }}
    >
      <div className="relative rounded-[7px] overflow-hidden">
        <Image
          src={item.image}
          alt=""
          width={75}
          height={68}
          className="min-h-[68px] object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60" />
      </div>
      <span className="flex flex-col max-w-[178px] gap-1">
        <h2 className="text-[#23201C] font-medium text-base leading-[1.38]">
          {item.title}
        </h2>
        <p className="text-[16px] text-[#23201C] opacity-[60%] leading-[1.38]">
          ID: {item.id}
        </p>
      </span>
    </div>
    <div
      className="px-[16px] items-center flex max-sm:w-full"
      style={{ width: headers[1].width }}
    >
      <h2 className="text-[#23201C] font-medium text-base leading-[1.4] max-sm:hidden">
        {item.code}
      </h2>
      <span className="text-[#23201C] font-medium text-base leading-[1.4] flex gap-[20px] sm:hidden pb-[10px]">
        <p className="text-[#828282]"> Part Number</p> {item.code}
      </span>
    </div>
    <div
      className="px-[16px] items-center flex max-sm:w-full"
      style={{ width: headers[2].width }}
    >
      <h2 className="text-[#23201C] font-medium text-base leading-[1.4] max-sm:hidden">
        {item.limitedPrice}
      </h2>
      <span className="text-[#23201C] font-medium text-base leading-[1.4] flex gap-[20px] sm:hidden pb-[10px]">
        <p className="text-[#828282]"> Listing Price</p> {item.limitedPrice}
      </span>
    </div>
    <div
      className="px-[16px] items-center flex max-sm:w-full"
      style={{ width: headers[3].width }}
    >
      <h2 className="text-[#23201C] font-medium text-base leading-[1.4] max-sm:hidden">
        {item.myOffer}
      </h2>
      <span className="text-[#23201C] font-medium text-base leading-[1.4] flex gap-[20px] sm:hidden pb-[10px]">
        <p className="text-[#828282]"> My Offer</p> {item.myOffer}
      </span>
    </div>
    <div
      className="px-[16px] items-center flex max-sm:w-full"
      style={{ width: headers[4].width }}
    >
      <button className="py-[8px] px-4 bg-[#002029] max-sm:hidden rounded-[20px] flex gap-2.5 items-center">
        <svg
          width="9"
          height="9"
          viewBox="0 0 9 9"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="0.2" y="0.5" width="8" height="8" rx="4" fill="white" />
        </svg>
        <h2 className="text-[#FFFFFF] font-medium text-base leading-[1.4] font-sofia-sans">
          {item.status}
        </h2>
      </button>
      <div className="text-[#23201C] font-medium text-base leading-[1.4] flex gap-[20px] sm:hidden pb-[10px]">
        <span className="py-[8px] px-4 bg-[#002029]">
          <svg
            width="9"
            height="9"
            viewBox="0 0 9 9"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="0.2" y="0.5" width="8" height="8" rx="4" fill="white" />
          </svg>
        </span>
      </div>
    </div>
    <div
      className="px-[16px] items-center flex max-sm:w-full"
      style={{ width: headers[5].width }}
    >
      <h2 className="text-[#23201C] font-medium text-base leading-[1.4] max-sm:hidden">
        {item.date}
      </h2>
      <span className="text-[#23201C] font-medium text-base leading-[1.4] flex gap-[20px] sm:hidden pb-[10px]">
        <p className="text-[#828282]"> Date</p> {item.date}
      </span>
    </div>
  </div>
);
  const router = useRouter();
  return <ListingTable headers={headers} listings={listings}  onRowClick={(item) => {
    if (item.title) {
      router.push(`/orders/offer/${encodeURIComponent(item.title)}`);
    } else {
      console.warn("Order number is missing");
    }
  }} />;
};

export default OfferSend;
