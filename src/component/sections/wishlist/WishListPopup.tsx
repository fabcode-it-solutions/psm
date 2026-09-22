"use client";
import IconBookMark from "@/assets/icons/IconBookMark";
import IconBookmarkRemove from "@/assets/icons/IconBookmarkRemove";
import IconNotificationRemove from "@/assets/icons/IconNotificationRemove";
import TooltipPopup from "@/component/global/TooltipPopup";
import { RootState } from "@/libs/redux/store";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { useSelector } from "react-redux";

const WishListPopup = () => {
  const user = useSelector((state: RootState) => state.user.user)?.user;
  const items = [
    {
      heading: "RAYS Volk Racing TE37V Mark II",
      text: "Used, 5x120, 18x9.5+45",
      image: "/assets/images/wishlist/image-1.png",
      id: 1,
    },
    {
      heading: "RAYS Volk Racing TE37V Mark II",
      text: "Used, 5x120, 18x9.5+45",
      image: "/assets/images/wishlist/image-2.png",
      id: 1,
    },
    {
      heading: "RAYS Volk Racing TE37V Mark II",
      text: "Used, 5x120, 18x9.5+45",
      image: "/assets/images/wishlist/image-3.png",
      id: 3,
    },
  ];
  return (
    <TooltipPopup
      heading="My Wishlist"
      icon={
        <div className="flex items-center gap-2 cursor-pointer">
      <span className="flex justify-center items-center bg-white border-[#00202914] border-[1.5px] p-[6px] rounded-full w-[32px] h-[32px]">
        <IconBookMark fill="#002029" />
      </span>
      <span className="block sm:hidden">Wishlist</span>
    </div>
      }
      content={
        "Simply click the heart icon next to any product to add it to your list, and come back later to purchase your items all at once."
      }
    >
      <div className="flex gap-5 flex-col">
        {items.map((item, index) => (
          <div
            key={index}
            className="bg-white border-gray-1 border relative rounded-md overflow-hidden flex gap-4 pr-[50px]"
          >
            <div className="relative">
              <Image
                width={132}
                height={132}
                alt=""
                className="object-center object-cover  min-w-[132px] h-full"
                src={item.image || "/assets/images/wishlist/image-1.png"}
                unoptimized
              />
            </div>
            <div className="flex flex-col justify-center py-4">
              <div><div className="bg-white rounded-[4.65px] border inline-flex border-black/8 py-[3.1px] px-[9.29px]">
                <Image
                  src="/assets/images/rays-logo.png"
                  alt="rays"
                  width={48}
                  height={18}
                  className="h-[18px] w-auto object-contain"
                  unoptimized
                />
              </div></div>
              <div className="text-dark-blue-cm text-lg leading-[1.33] font-bold font-supreme tracking-[0.18px] mt-1.5">
                {item.heading}
              </div>
              <div className=" text-dark-blue-cm text-sm font-normal font-sofia-sans tracking-[0.56px] leading-normal mt-1">
                {item.text}
              </div>
            </div>
            <Link href={String(item?.id)} className="absolute top-0 left-0 w-full h-full" />
            <div className="absolute bottom-[7px] right-[9px] flex items-center gap-2">
              <button className="w-[27px] h-[27px] bg-accent-100 flex items-center justify-center rounded-full ">
                <IconBookmarkRemove className="fill-white w-4 h-4" />
              </button>
              <button className="w-[27px] h-[27px] bg-accent-100 flex items-center justify-center rounded-full">
                <IconNotificationRemove className="fill-white w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </TooltipPopup>
  );
};

export default WishListPopup;
