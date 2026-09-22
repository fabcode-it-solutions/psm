"use client";
 
import Image from "next/image";
import Bookmark from "../products/Bookmark";
import IconNext from "@/assets/icons/IconNext";
import { Swiper, SwiperSlide } from "swiper/react";
import { useState } from "react";
import ProductDetails from "./ProductDetails";
import ListedItems from "./ListedItems";
 
export default function ProductView() {
  const images = [
    "/assets/images/wheel1.jpg",
    "/assets/images/wheel2.jpg",
    "/assets/images/wheel3.png",
    "/assets/images/wheel4.jpg",
    "/assets/images/mainwheel.png",
  ];
 
  const [selectedImage, setSelectedImage] = useState(
    "/assets/images/mainwheel.png"
  );
 
  return (
    <section className="w-full">
      <div className="w-full flex flex-col lg:flex-row gap-10 lg:gap-[74px]">
        <div className="flex-1 w-full lg:max-w-[766px]">
         <div className="relative w-full aspect-[766/661]">
            <Image
              src={selectedImage}
              alt="Product Image"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/20" />
          </div>
 
          <Swiper spaceBetween={0} slidesPerView={3.3} className="w-full">
            {images.map((img) => (
              <SwiperSlide key={img}>
                <div
                 className="relative w-full aspect-square cursor-pointer group"
                  onClick={() => setSelectedImage(img)}
                >
                  <Image
                    src={img}
                    alt="wheel-image"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-100 group-hover:opacity-100 transition" />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
 
        <div className="flex-1 flex flex-col gap-4 pt-6 lg:pt-[72px] px-10 lg:px-0">
          <div className="font-sofia-sans font-normal text-sm leading-[100%] tracking-[4%] text-dark-blue-cm flex flex-wrap gap-2.5">
            <span className="opacity-40 flex items-center gap-2.5">
              Home <IconNext /> Wheels <IconNext /> RAYS{" "}
            </span>
            <IconNext /> RAYS Volk Racing
          </div>
 
          <div className="relative flex flex-col sm:flex-row w-full lg:max-w-[551px] justify-between gap-4">
            <div className="flex flex-col gap-4">
              <h1 className="font-supreme font-medium text-xl sm:text-2xl lg:text-[28px] leading-[100%] tracking-[1%] text-dark-blue-cm">
                RAYS Volk Racing TE37V Mark II
              </h1>
 
              <div className="flex items-center gap-4">
                <div className="py-[7px] px-3 border border-[rgba(0,0,0,0.08)] rounded-md bg-white">
                  <Image
                    src="/assets/images/rays-logo.png"
                    width={62}
                    height={23}
                    alt="logo"
                    className="h-auto w-auto block"
                  />
                </div>
 
                <div className="px-3 py-1.5 bg-dark-blue-cm text-white text-xs sm:text-sm font-bold rounded-md">
                  43 Listings
                </div>
              </div>
            </div>
 
            <Bookmark id={1} isMarked={false} />
          </div>
 
          <ProductDetails />
        </div>
      </div>
      <ListedItems />
    </section>
  );
}