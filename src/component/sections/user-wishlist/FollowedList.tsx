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
      "/assets/images/products/productimage.png",
      "/assets/images/products/productimage.png",
      "/assets/images/products/productimage.png",
      "/assets/images/products/productimage.png",
    ],
    listingLabel: "Listed for Sale",
    title: "RAYS Volk Racing TE37V Mark II",
    manufacture: {
      logo: "/assets/images/rays-logo.png",
      name: "RAYS Volk Racing",
      text: "TE37V Mark II",
    },
    price: "$4285.00",
    type: "Free Shipping",
    isWishlisted: false,
    link: "#",
    

    slideProfiles: {
      profilePic: "/assets/images/ProfilePicture.png",
      username: "Lachy123",
    },
  },
  {
    images: [
      "/assets/images/products/productimage 2.png",
      "/assets/images/products/productimage 2.png",
      "/assets/images/products/productimage 2.png",
      "/assets/images/products/productimage 2.png",
    ],
    listingLabel: "Not for Sale",
    title: "RAYS Volk Racing TE37V Mark II",
    manufacture: {
      logo: "/assets/images/rays-logo.png",
      name: "RAYS Volk Racing",
      text: "TE37V Mark II",
    },
    price: "$4285.00",
    type: "Free Shipping",
    isWishlisted: false,
    link: "#",
    
    slideProfiles: {
      profilePic: "/assets/images/ProfileImag2.png",
      username: "Sarah123",
    },
  },
  {
    images: [
      "/assets/images/products/image 11.png",
      "/assets/images/products/image 11.png",
      "/assets/images/products/image 11.png",
      "/assets/images/products/image 11.png",
    ],
    listingLabel: "Listed for Sale",
    title: "PRO Composite Swan Neck GT Wing",
    manufacture: {
      logo: "/assets/images/rays-logo.png",
      name: "RAYS Volk Racing",
      text: "TE37V Mark II",
    },
    price: "$1359.80",
    type: "Free Shipping",
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
    listingLabel: "Listed for Sale",
    title: "RAYS Volk Racing TE37V Mark II",
    manufacture: {
      logo: "/assets/images/rays-logo.png",
      name: "RAYS Volk Racing",
      text: "TE37V Mark II",
    },
    price: "$4285.00",
    type: "Free Shipping",
    isWishlisted: false,
    link: "#",
  
  },
];

const FollowedList = () => {
  return (
    <section className="w-full max-w-[1272px] mx-auto py-5 max-tab-sm:px-[16px] max-tab-lg:px-[30px] max-tab-lg:max-w-full max-des-xs:max-w-[940px] max-des-md:max-w-[1100px] ">
      <HeadingSlideButtons
        heading="Followed Listings"
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
              linkBgColor="bg-[#002029]"
              arrowFill="fill-[#54DC00]"
              listingLabelTextColor="text-white"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default FollowedList;
