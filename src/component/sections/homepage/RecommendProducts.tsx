"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import ProductCard from "@/component/products/ProductCard";
import HeadingSlideButtons from "@/component/global/HeadingSlideButtons";
import { SearchResponsePart } from "@/app/api/search/route";
import Link from "next/link";

const RecommendProducts = ({ data }: { data?: SearchResponsePart[] }) => {

  return (
    <section className="w-full max-w-[1272px] mx-auto py-12 max-tab-sm:px-[16px] max-tab-lg:px-[30px] max-tab-lg:max-w-full max-des-xs:max-w-[940px] max-des-md:max-w-[1100px] ">
      <HeadingSlideButtons
        heading="Recommend Products"
        isButtons={true}
        rightArrowClass="arrow-left-rp"
        leftArrowClass="arrow-right-rp"
      />
      <Swiper
        modules={[Navigation]}
        navigation={{
          nextEl: ".arrow-left-rp",
          prevEl: ".arrow-right-rp",
        }}
        spaceBetween={24}
        slidesPerView={1.2}
        breakpoints={{
          375: {
            slidesPerView: 1.2,
          },
          768: {
            slidesPerView: 2.2,
          },
          1024: {
            slidesPerView: 2.677,
          },
        }}
        className="relative"
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
                        (part.manufacturer && part.manufacturer[0].logo) || "",
                      name:
                        (part.manufacturer && part.manufacturer[0].name) || "",
                      text:
                        (part.manufacturer && part.manufacturer[0].subTitle) ||
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
    </section>
  );
};

export default RecommendProducts;
