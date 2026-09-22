/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import Image from "next/image";
import HeadingSlideButtons from "@/component/global/HeadingSlideButtons";
import IconVerified from "@/assets/icons/IconVerified";
import IconBookmarkEmpty from "@/assets/icons/IconBookmarkEmpty";
import IconBookmarkRemove from "@/assets/icons/IconBookmarkRemove";
import Bookmark from "@/component/products/Bookmark";
import NotificationIcon from "@/component/products/NotificationIcon";

const dummyData = [
  {
    id: 1,
    Image: "/assets/images/image-removebg-preview (4) 1.png",
    username: "Lachy123",
    vehicle: "2012 Toyota 86",
    regNo: "5TSN 521",
    parts: 8,
    profile : "/assets/images/Ellipse 731.png",
    isWishlisted: true,
  },
  {
    id: 2,
    Image: "/assets/images/3d555770fd19ab5236bb81f4aea45b4319b14a5c .png",
    username: "Jhonny123",
    vehicle: "2012 Toyota 86",
    regNo: "5TSN 521",
    parts: 8,
    profile : "/assets/images/ProfilePicturecar.png",
    isWishlisted: true,
  },
  {
    id: 3,
    Image: "/assets/images/18da41bce92777638236f5f1496db9d787fa0023.png",
    username: "Eric123",
    vehicle: "2012 Toyota 86",
    regNo: "5TSN 521",
    parts: 8,
    profile : "/assets/images/ProfilePicturecar.png",
    isWishlisted: true,
  },
  {
    id: 4,
    Image: "/assets/images/22da55422f70ea38d3ca892f55836862978c676e.png",
    username: "Tricia123",
    vehicle: "2012 Toyota 86",
    regNo: "5TSN 521",
    parts: 8,
    profile : "/assets/images/ProfilePicturecar.png",
    isWishlisted: true,
  },
];

const FollowedBuild = () => {
  return (
    <div className="mt-[117px] max-tab-sm:mt-[40px]  w-full max-w-[1272px] mx-auto max-tab-sm:px-[16px] max-tab-lg:px-[30px] max-tab-lg:max-w-full max-des-xs:max-w-[940px] max-des-md:max-w-[1100px]">
      <HeadingSlideButtons
        heading="Followed Builds"
        isButtons={true}
        rightArrowClass="arrow-left-collection"
        leftArrowClass="arrow-right-collection"
      />

      <Swiper
        modules={[Navigation]}
        navigation={{
          nextEl: ".arrow-left-collection",
          prevEl: ".arrow-right-collection",
        }}
        spaceBetween={24}
        breakpoints={{
          375: {
            slidesPerView: 1.2,
          },
          500: {
            slidesPerView: 1.3,
          },
          768: {
            slidesPerView: 2.2,
          },
          1024: {
            slidesPerView: 3.36,
          },
        }}
        className="relative"
      >
        {dummyData.map((item, index) => (
          <SwiperSlide key={item.id}>
            <div className="p-[24px] rounded-[10px]  max-tab-sm:max-w-full w-full bg-[#F4F4F4]">
              <div className="flex flex-col gap-4">
                <div className="flex gap-2 items-center min-h-[40px]">
                  <Image
                    src={item.profile}
                    alt=""
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                  <h2 className="text-xl leading-[1.35] tracking-[0.2] text-[#002029]">
                    {item.username}
                  </h2>
                  <span className="w-[32px] h-[32px] border-[1.5px] rounded-full border-[#00202914] flex justify-center items-center">
                    <IconVerified stroke="#54DC00" />
                  </span>
                </div>

                <Image src={item.Image} alt="" width={314} height={180} />

                <div className="flex gap-1 flex-col">
                  <h2 className="text-xl font-bold leading-[1.35] tracking-[-0.17px] font-supreme">
                    {item.vehicle}
                  </h2>
                  <h4 className="text-base font-semibold leading-[24px] tracking-[0.64px] font-sofia-sans">
                    Vehicle registration no : {item.regNo}
                  </h4>
                  <p className="text-sm font-sofia-sans tracking-[0.56px] leading-[1.215] mt-[8px]">
                    {item.parts} Parts Added
                  </p>

                  <span className="mt-[6px] flex justify-end gap-2 min-h-[46px]">
                    <NotificationIcon
                      isMarked={item.isWishlisted}
                      className="w-[44px] h-[44px] bg-[#002029CC] rounded-[20px] flex justify-center items-center"
                    />
                    <Bookmark
                      isMarked={item.isWishlisted}
                      className="w-[44px] h-[44px] bg-[#002029CC] rounded-[20px] flex justify-center items-center"
                    />

                    <button className="w-[44px] h-[44px] bg-accent-100 rounded-[20px] flex justify-center items-center">
                      <svg
                        width="25"
                        height="24"
                        viewBox="0 0 25 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M13.7316 4.20938C13.4317 3.92369 12.957 3.93523 12.6713 4.23516C12.3856 4.53509 12.3971 5.00982 12.6971 5.29551L18.9485 11.2501H4.21436C3.80014 11.2501 3.46436 11.5859 3.46436 12.0001C3.46436 12.4143 3.80014 12.7501 4.21436 12.7501H18.9486L12.6971 18.7048C12.3971 18.9905 12.3856 19.4652 12.6713 19.7652C12.957 20.0651 13.4317 20.0766 13.7316 19.791L21.1506 12.7243C21.3195 12.5634 21.4194 12.3581 21.4504 12.1448C21.4596 12.098 21.4644 12.0496 21.4644 12.0001C21.4644 11.9506 21.4595 11.9021 21.4504 11.8552C21.4193 11.642 21.3194 11.4369 21.1506 11.2761L13.7316 4.20938Z"
                          fill="#002029"
                        />
                      </svg>
                    </button>
                  </span>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default FollowedBuild;
