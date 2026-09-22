"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import React from "react";
import Image from "next/image";
import HeadingSlideButtons from "@/component/global/HeadingSlideButtons";
import ProductCard from "@/component/products/ProductCard";
import { ProductCardType } from "@/types/product.types";
import Link from "next/link";
import { SearchResponsePart } from "@/app/api/search/route";

export const products: ProductCardType[] = [
  {
    images: [
      "/assets/images/products/53f7600e487b18d5aa967d78dbb9cb7754353aff.png",
      "/assets/images/products/53f7600e487b18d5aa967d78dbb9cb7754353aff.png",
      "/assets/images/products/53f7600e487b18d5aa967d78dbb9cb7754353aff.png",
      "/assets/images/products/53f7600e487b18d5aa967d78dbb9cb7754353aff.png",
    ],
    listingCount: 43,
    title: "RAYS Volk Racing TE37V Mark II",
    manufacture: {
      logo: "/assets/images/rays-logo.png",
      name: "RAYS Volk Racing",
      text: "TE37V Mark II",
    },
    price: "$4285.00",
    type: "Lowest Listing",
    isWishlisted: false,
    link: "#",
  },
  {
    images: [
      "/assets/images/products/53f7600e487b18d5aa967d78dbb9cb7754353aff.png",
      "/assets/images/products/53f7600e487b18d5aa967d78dbb9cb7754353aff.png",
      "/assets/images/products/53f7600e487b18d5aa967d78dbb9cb7754353aff.png",
      "/assets/images/products/53f7600e487b18d5aa967d78dbb9cb7754353aff.png",
    ],
    listingCount: 43,
    title: "RAYS Volk Racing TE37V Mark II",
    manufacture: {
      logo: "/assets/images/rays-logo.png",
      name: "RAYS Volk Racing",
      text: "TE37V Mark II",
    },
    price: "$4285.00",
    type: "Lowest Listing",
    isWishlisted: false,
    link: "#",
  },
  {
    images: [
      "/assets/images/products/53f7600e487b18d5aa967d78dbb9cb7754353aff.png",
      "/assets/images/products/53f7600e487b18d5aa967d78dbb9cb7754353aff.png",
      "/assets/images/products/53f7600e487b18d5aa967d78dbb9cb7754353aff.png",
      "/assets/images/products/53f7600e487b18d5aa967d78dbb9cb7754353aff.png",
    ],
    listingCount: 43,
    title: "RAYS Volk Racing TE37V Mark II",
    manufacture: {
      logo: "/assets/images/rays-logo.png",
      name: "RAYS Volk Racing",
      text: "TE37V Mark II",
    },
    price: "$4285.00",
    type: "Lowest Listing",
    isWishlisted: false,
    link: "#",
  },
  {
    images: [
      "/assets/images/products/53f7600e487b18d5aa967d78dbb9cb7754353aff.png",
      "/assets/images/products/53f7600e487b18d5aa967d78dbb9cb7754353aff.png",
      "/assets/images/products/53f7600e487b18d5aa967d78dbb9cb7754353aff.png",
      "/assets/images/products/53f7600e487b18d5aa967d78dbb9cb7754353aff.png",
    ],
    listingCount: 43,
    title: "RAYS Volk Racing TE37V Mark II",
    manufacture: {
      logo: "/assets/images/rays-logo.png",
      name: "RAYS Volk Racing",
      text: "TE37V Mark II",
    },
    price: "$4285.00",
    type: "Lowest Listing",
    isWishlisted: false,
    link: "#",
  },
];

const MainProducts = ({ data }: { data?: SearchResponsePart[] }) => {
  return (
    <section className="w-full mx-auto px-[61px] pt-10 pb-12 max-tab-lg:px-[30px] max-tab-sm:px-[16px]">
      <div className="pr-[177px] max-des-md:pr-0">
        <HeadingSlideButtons
          heading="Spotlight"
          isButtons={true}
          rightArrowClass="arrow-left-main"
          leftArrowClass="arrow-right-main"
        />
      </div>

      <div className="text-white overflow-hidden relative flex flex-col md:flex-row gap-2 ">
        <div className="max-w-[58.3453237&] w-full relative max-tab-sm:max-w-full max-tab-lg:max-w-[65%]">
          <div className="overlay-10 absolute top-0 left-0 w-full h-full z-[1] rounded-[6px]"></div>
          <div className="relative w-full h-full">
            <Image
              src="/assets/images/e1540366d7403f9fc0c8d1c36ea5fb93984b00a4.png"
              alt="main-product"
              objectFit="cover"
              width={820}
              height={520}
              className="rounded-[6px] w-full h-full object-cover object-right  "
            />
          </div>
          <div className="absolute top-auto left-0 w-full z-[1] max-w-[687px] max-tab-sm:max-w-full  right-0 mx-auto  bottom-[7px] max-tab-sm:relative max-tab-sm:bottom-0 max-des-sm:max-w-[375px] max-des-xlg:max-w-[570px]">
            <div className="absolute top-[54px] w-full flex justify-center  max-des-sm:top-4">
              <Image
                src="/assets/images/rays-car.png"
                alt="rays"
                width={156}
                height={36}
              />
            </div>

            <h3 className="max-w-[414px] absolute top-[118px] max-des-sm:top-20 max-des-sm:px-[16px] w-full left-0 right-0 mx-auto max-des-sm:text-[27px] max-des-sm:leading-[1.2]  text-[44px] font-black font-supreme max-des-lg:leading-[1.2] leading-[1.7275] tracking-normal italic text-center">
              The Original Forged Sports Wheel
            </h3>

            <div className=" pointer-events-none w-full  ">
              <svg
                width="607"
                height="371"
                viewBox="0 0 607 371"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-auto"
              >
                <path
                  d="M606.25 0.75V370.25H0.75V35.0859L34.3154 0.75H606.25Z"
                  stroke="#54DC00"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
            <div className="absolute bottom-6  w-full z-[1] flex  justify-center ">
              <Link
                href="#"
                className="flex  items-center gap-4 font-supreme font-bold text-base leading-6 tracking-[0.16] text-accent-100"
              >
                View All Products{" "}
                <svg
                  width="25"
                  height="25"
                  viewBox="0 0 25 25"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M14.2045 4.93001C13.8111 4.54239 13.178 4.54708 12.7904 4.94048C12.4027 5.33389 12.4074 5.96704 12.8008 6.35466L18.1712 11.6461H4.5C3.94771 11.6461 3.5 12.0938 3.5 12.6461C3.5 13.1983 3.94772 13.6461 4.5 13.6461H18.1646L12.8008 18.9309C12.4074 19.3186 12.4027 19.9517 12.7904 20.3451C13.178 20.7385 13.8111 20.7432 14.2045 20.3556L21.1287 13.5332C21.6256 13.0436 21.6256 12.242 21.1287 11.7524L14.2045 4.93001Z"
                    fill="#54DC00"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        <div className="w-full max-w-[41.6546763%] max-tab-sm:max-w-full max-tab-lg:max-w-[35%]">
          <Swiper
            modules={[Navigation]}
            navigation={{
              nextEl: ".arrow-left-main",
              prevEl: ".arrow-right-main",
            }}
            breakpoints={{
              340: {
                slidesPerView: 1,
              },
              1480: {
                slidesPerView: 1.5,
              },
            }}
            spaceBetween={24}
            slidesPerView={1.19}
          >
            {data &&
              data.map((part, index) => (
                <SwiperSlide key={index}>
                  <Link href={`/parts/${part.slug}`}>
                    <ProductCard
                      product={{
                        listingCount: 0,
                        isWishlisted: false,
                        id: part.id,
                        manufacture: {
                          logo:
                            (part.manufacturer && part.manufacturer[0].logo) ||
                            "",
                          name:
                            (part.manufacturer && part.manufacturer[0].name) ||
                            "",
                          text:
                            (part.manufacturer &&
                              part.manufacturer[0].subTitle) ||
                            "",
                        },
                        price: part.price || "0",
                        title: part.title || "",
                        type:
                          part.listed == "For Sale"
                            ? part.quantity < 8
                              ? "Lowest Listing"
                              : "For Sale"
                            : "Not for Sale",
                        medias: part.media || [],
                        slug: part.slug,
                      }}
                      showBookmark={true}
                      showNotificationIcon={false}
                      textWidth="max-w-full"
                    />
                  </Link>
                </SwiperSlide>
              ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default MainProducts;
