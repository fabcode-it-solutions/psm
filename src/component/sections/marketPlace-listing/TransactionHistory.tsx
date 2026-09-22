/* eslint-disable @typescript-eslint/no-explicit-any */
import HeadingSlideButtons from "@/component/global/HeadingSlideButtons";
import React from "react";
import Image from "next/image";

const Timeline = () => {
  const timelineData = [
    {
      id: 1,
      date: "9/12/24",
      title: "Listed",
      amount: "$4285.00",
      user: "Oaksoe123",
      img: "/assets/images/ProfilePicturecar.png",
      position: "left",
    },
    {
      id: 3,
      date: "27/02/24",
      title: "Offered",
      amount: "$4800",
      user: "Anonymous User",
      img: "/assets/images/ProfilePicturecar.png",
      position: "left",
    },
    {
      id: 2,
      date: "10/12/24",
      title: "Purchased",
      amount: "$4285.00",
      user: "Anonymous User",
      img: "/assets/images/ProfilePicturecar.png",
      position: "right",
    },
    {
      id: 4,
      date: "30/02/24",
      title: "Offer Accepted",
      amount: "$4,800",
      user: "Anonymous User",
      img: "/assets/images/ProfilePicturecar.png",
      position: "right",
    },
  ];

  const renderTimelineItem = (item: any, isTopRow = true) => (
    <div
      className={`flex gap-[16px] ${isTopRow ? "" : "relative bottom-[3px]"}`}
      key={item.id}
    >
      <svg
        width="35"
        height="186"
        viewBox="0 0 35 186"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${isTopRow ? "relative bottom-[-2px] left-[-6px] " : ""}`}
      >
        <line
          x1={isTopRow ? "16.5" : "18.5"}
          y1={isTopRow ? "235.991" : "-57.991071"}
          x2={isTopRow ? "17.5001" : "17.5"}
          y2={isTopRow ? "17.9911" : "168.009"}
          stroke="black"
          strokeOpacity="0.44"
          strokeWidth="3"
        />
        <circle
          cx="17.5"
          cy={isTopRow ? "17.5" : "168.5"}
          r="17.5"
          transform={isTopRow ? "" : "rotate(180 17.5 168.5)"}
          fill="#002029"
        />
        <text
          x="17.5"
          y={isTopRow ? "22" : "173"}
          fill="white"
          fontSize="16"
          fontWeight="bold"
          textAnchor="middle"
          fontFamily="Arial, sans-serif"
          dominantBaseline={isTopRow ? undefined : "middle"}
        >
          {item.id}
        </text>
      </svg>
      <div
        className={`max-tab-sm:flex max-tab-sm:flex-col max-tab-sm:justify-center  max-tab-sm:gap-[4px] ${
          isTopRow ? "" : "mt-[43px]"
        }`}
      >
        <p className="text-sm font-sofia-sans font-bold leading-[1.2] text-[#002029] tracking-[0.035px]">
          {item.date}
        </p>
        <h2 className="text-[32px] font-bold leading-[1.34199] tracking-[0.32px] text-[#002029] max-tab-sm:text-[14px]">
          {item.title}
        </h2>
        <h2 className="text-[32px] font-bold leading-[1.34199] tracking-[0.32px] text-[#002029] max-tab-sm:text-[14px]">
          {item.amount}
        </h2>
        <span className="flex items-center gap-2 flex-wrap max-sm:gap-[4px]">
          <Image src={item.img} alt="" width={40} height={40} />
          <h4 className="text-[20px] font-medium tracking-[0.2] leading-[1.35] max-tab-sm:text-[14px] ">
            {item.user}
          </h4>
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className=""
          >
            <circle
              cx="16"
              cy="16"
              r="15.25"
              stroke="#002029"
              strokeOpacity="0.08"
              strokeWidth="1.5"
            />
            <path
              d="M16 6.83301L8.5 10.1663V15.1663C8.5 19.7913 11.7 24.1163 16 25.1663C20.3 24.1163 23.5 19.7913 23.5 15.1663V10.1663L16 6.83301ZM21.8333 15.1663C21.8333 18.933 19.35 22.408 16 23.4413C12.65 22.408 10.1667 18.933 10.1667 15.1663V11.2497L16 8.65801L21.8333 11.2497V15.1663ZM12.175 15.658L11 16.833L14.3333 20.1663L21 13.4997L19.825 12.3163L14.3333 17.808L12.175 15.658Z"
              fill="#54DC00"
            />
          </svg>
        </span>
      </div>
    </div>
  );

  return (
    <div className="mt-[43px] max-w-[1373px] w-full mx-auto px-[30px] max-tab-sm:px-4">
      <div className="px-[21px] pt-[52.79px] pb-[63px] bg-white rounded-[6px] max-mb-sm:px-[10px] ">
        <div className="pl-[21px] max-tab-sm:pl-0 relative ">
          <HeadingSlideButtons
            heading="Transaction History"
            isButtons={false}
            hideRightSide={true}
          />
        </div>
        <div className="mt-[15px] pl-[25px] max-sm:pl-0  ">
          <div className="max-w-[935px] flex justify-between max-">
            {timelineData
              .filter((item) => item.position === "left")
              .map((item) => renderTimelineItem(item, true))}
          </div>
          <svg
            width="1227"
            height="5"
            viewBox="0 0 1227 5"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full"
          >
            <line
              x1="1521.5"
              y1="3.49803"
              x2="1.49796"
              y2="1.50197"
              stroke="black"
              strokeOpacity="0.44"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>

          <div className="max-w-[922px] w-full ml-auto justify-between flex">
            {timelineData
              .filter((item) => item.position === "right")
              .map((item) => renderTimelineItem(item, false))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
