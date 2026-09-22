import React from "react";
import TooltipPopup from "../global/TooltipPopup";
import IconNotification from "@/assets/icons/IconNotification";
import Image from "next/image";

const NotificationPopup = () => {
  const items = [
    {
      type: "social",
      image: "/assets/images/Featured Build (2).png",
      heading: "Eric123",
      text: "is now following you",
    },
    {
      type: "market-place",
      heading:
        "Seller of RAYS Volk Racing TE37V Mark II has accepted your offer",
      label: "Today",
    },
    {
      type: "market-place",
      heading: "RAYS Volk Racing TE37V Mark II",
      text: "Used, 5x120, 18x9.5+45",
      image: "/assets/images/wishlist/image-2.png",
      id: 1,
    },
    {
      type: "market-place",
      heading: "RAYS Volk Racing TE37V Mark II",
      text: "Used, 5x120, 18x9.5+45",
      image: "/assets/images/wishlist/image-2.png",
      id: 2,
    },
  ];
  const socialFilter = items.filter((item) => item.type === "social");
  const marketPlaceFilter = items.filter(
    (item) => item.type === "market-place"
  );
  return (
    <TooltipPopup
      heading="Notifications"
      headerWrapperStyle="!flex-row justify-between items-center"
      icon={
        <span className="flex justify-center items-center cursor-pointer bg-white border-[#00202914] border-[1.5px] p-[6px] rounded-full w-[32px] h-[32px]">
          <IconNotification fill="#002029" />
        </span>
      }
      content={<button>Mark all as read</button>}
    >
      <div className="flex gap-5 flex-col">
        {socialFilter && socialFilter.length > 0 && (
          <div className="text-black font-supreme text-xl font-bold capitalize leading-[1.35]">
            Social
          </div>
        )}
        {socialFilter &&
          socialFilter.length > 0 &&
          socialFilter.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-md border border-gray-1 p-5 flex items-center gap-4"
            >
              <div className="relative">
                <Image
                  width={101}
                  height={101}
                  alt=""
                  className="object-center object-cover rounded-full  min-w-[101px] h-[101px]"
                  src={item.image || "/assets/images/wishlist/image-1.png"}
                  unoptimized
                />
              </div>
              <div className="flex flex-col justify-center py-4">
                <div className="text-dark-blue-cm text-xl leading-[1.35] font-bold font-supreme tracking-[0.2px]">
                  {item.heading}
                </div>
                <div className=" text-dark-blue-cm text-sm font-bold font-sofia-sans tracking-[0.56px] leading-normal">
                  {item.text}
                </div>
              </div>
            </div>
          ))}
        {marketPlaceFilter && marketPlaceFilter.length > 0 && (
          <div className="text-black font-supreme text-xl font-bold capitalize leading-[1.35]">
            market place
          </div>
        )}
        {marketPlaceFilter &&
          marketPlaceFilter.length > 0 &&
          marketPlaceFilter.map((item, index) => (
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
                <div>
                  {item?.label ? (
                    <div className="text-dark-blue-cm font-supreme leading-[1.357] text-sm font-normal tracking-[0.14px]">
                      {item?.label}
                    </div>
                  ) : (
                    <div className="bg-white rounded-[4.65px] border inline-flex border-black/8 py-[3.1px] px-[9.29px]">
                      <Image
                        src="/assets/images/rays-logo.png"
                        alt="rays"
                        width={48}
                        height={18}
                        className="h-[18px] w-auto object-contain"
                        unoptimized
                      />
                    </div>
                  )}
                </div>
                <div className="text-dark-blue-cm text-lg leading-[1.33] font-bold font-supreme tracking-[0.18px] mt-1.5">
                  {item.heading}
                </div>
                <div className=" text-dark-blue-cm text-sm font-bold font-sofia-sans tracking-[0.56px] leading-normal mt-1">
                  {item.text}
                </div>
              </div>
            </div>
          ))}
      </div>
    </TooltipPopup>
  );
};

export default NotificationPopup;
