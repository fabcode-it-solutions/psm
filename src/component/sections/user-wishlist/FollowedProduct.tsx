"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import HeadingSlideButtons from "@/component/global/HeadingSlideButtons";

import ProductCard from "@/component/products/ProductCard";
import { ProductCardType } from "@/types/product.types";
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
      "/assets/images/products/11181a5445f61a4ee61129931398585cf15c27c8.png",
      "/assets/images/products/11181a5445f61a4ee61129931398585cf15c27c8.png",
      "/assets/images/products/11181a5445f61a4ee61129931398585cf15c27c8.png",
      "/assets/images/products/11181a5445f61a4ee61129931398585cf15c27c8.png",
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

const FollowedProducts = () => {
  return (
    <section className="w-full mt-[20px] max-w-[1272px] mx-auto py-5 max-tab-sm:px-[16px] max-tab-lg:px-[30px] max-tab-lg:max-w-full max-des-xs:max-w-[940px] max-des-md:max-w-[1100px] ">
      <HeadingSlideButtons
        heading="Followed Products"
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
        {products.map((product, i) => (
          <SwiperSlide key={i}>
            <ProductCard
              product={product}
              showBookmark={true}
              showNotificationIcon={true}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default FollowedProducts;
