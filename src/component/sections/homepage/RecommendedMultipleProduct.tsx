"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import React from "react";

import ProductCard from "@/component/products/ProductCard";
import { SearchResponsePart } from "@/app/api/search/route";
import Link from "next/link";

const RecommendedMultipleProduct = ({
  data,
}: {
  data?: SearchResponsePart[];
}) => {
  return (
    <section className="w-full max-w-[1420px] pl-[30px] ml-auto top-[-107px] overflow-hidden relative max-des-xs:top-0 max-tab-lg:px-[30px] max-tab-sm:px-[15px]">
      <div className="">
        <Swiper
          modules={[Navigation]}
          navigation={{
            nextEl: ".arrow-left-rp",
            prevEl: ".arrow-right-rp",
          }}
          spaceBetween={24}
          breakpoints={{
            360: {
              slidesPerView: 1.2,
            },
            768: {
              slidesPerView: 2.2,
            },
            1024: {
              slidesPerView: 2.87,
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
    </section>
  );
};

export default RecommendedMultipleProduct;
