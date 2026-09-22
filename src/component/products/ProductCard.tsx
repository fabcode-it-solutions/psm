import React from "react";
import Bookmark from "./Bookmark";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import Image from "next/image";
import IconChevron from "@/assets/icons/IconChevron";
import { ProductCardType } from "@/types/product.types";
import NotificationIcon from "./NotificationIcon";

type ProductCardProps = {
  product: ProductCardType;
  showNotificationIcon?: boolean;
  showBookmark?: boolean;
  linkBgColor?: string;
  arrowFill?: string;
  listingLabelTextColor?: string;
  textWidth?: string;
};

const ProductCard = ({
  product,
  showNotificationIcon = false,
  showBookmark = true,
  linkBgColor = "bg-accent-100",
  arrowFill = "fill-dark-blue-cm",
  textWidth = "max-w-[88%]",
}: ProductCardProps) => {
  return (
    <div className="p-6 bg-light-300 h-full rounded-lg relative max-tab-sm:p-0 max-tab-lg:p-3">
      <div className="relative product-card-media-wrapper">
        <>
          {product.listingLabel ? (
            <div
              className={`absolute top-2.5 left-[9px] z-[2] px-3 py-1.5 bg-dark-blue-cm text-sm font-semibold rounded-md shadow-md ${
                product.listingLabel === "Not for Sale"
                  ? "text-white"
                  : "text-accent-100"
              }`}
            >
              {product.listingLabel}
            </div>
          ) : product.listingCount != undefined ? (
            <div className="absolute top-2.5 left-[9px] z-[2] px-3 py-1.5 bg-dark-blue-cm text-accent-100 text-sm font-bold rounded-md">
              {product.listingCount} Listings
            </div>
          ) : null}
        </>

        {(showNotificationIcon || showBookmark) && (
          <div className="absolute top-[45px] left-0 z-[2] flex gap-1">
            {showBookmark && (
              <Bookmark
                id={product?.id}
                isMarked={product?.isWishlisted}
                entityType="part"
              />
            )}
            {showNotificationIcon && (
              <NotificationIcon isMarked={product?.isWishlisted} />
            )}
          </div>
        )}

        <div className="product-image-slider">
          {(product?.images && product?.images?.length > 0) ||
          (product?.medias && product?.medias.length > 0) ? (
            <Swiper
              modules={[Pagination, Autoplay]}
              spaceBetween={0}
              slidesPerView={1}
              loop={true}
              pagination={true}
              className="h-auto rounded-lg"
              autoplay={{
                delay: 2500,
                disableOnInteraction: false,
              }}
            >
              {product?.images &&
                product?.images.map((image: string, index: number) => (
                  <SwiperSlide key={index}>
                    <div className="relative pb-[65.0485437%]">
                      <div className="from-0% to-100% bg-gradient-to-b from-black/0 to-black opacity-20 absolute top-0 left-0 w-full h-full z-[1]"></div>
                      <Image
                        src={image}
                        alt="Images"
                        width={1236}
                        height={804}
                        className="absolute object-cover w-full h-full top-0 left-0"
                        unoptimized
                      />
                      {product?.slideProfiles && (
                        <span className="absolute bottom-0 right-0 z-[2] px-3 pt-1 pl-2 pr-1 bg-[#FAFAFACC] text-xl text-black rounded-tl-[8px] items-center flex gap-1">
                          <Image
                            src={product.slideProfiles.profilePic}
                            alt={product.slideProfiles.username}
                            width={40}
                            height={40}
                            unoptimized
                          />
                          <h2 className="text-xl font-medium leading-[1.35] tracking-[0.2px] max-tab-lg:text-sm">
                            {product.slideProfiles.username}
                          </h2>
                        </span>
                      )}
                    </div>
                  </SwiperSlide>
                ))}
              {product?.medias &&
                product?.medias.map((media, index) => (
                  <SwiperSlide key={index}>
                    <div className="relative pb-[65.0485437%]">
                      <div className="from-0% to-100% bg-gradient-to-b from-black/0 to-black opacity-20 absolute top-0 left-0 w-full h-full z-[1]"></div>
                      <Image
                        src={media.url}
                        alt={media.alt || ""}
                        width={1236}
                        height={804}
                        className="absolute object-cover w-full h-full top-0 left-0"
                        unoptimized
                      />
                      {product?.slideProfiles && (
                        <span className="absolute bottom-0 right-0 z-[2] px-3 pt-1 pl-2 pr-1 bg-[#FAFAFACC] text-xl text-black rounded-tl-[8px] items-center flex gap-1">
                          <Image
                            src={product.slideProfiles.profilePic}
                            alt={product.slideProfiles.username}
                            width={40}
                            height={40}
                            unoptimized
                          />
                          <h2 className="text-xl font-medium leading-[1.35] tracking-[0.2px] max-tab-lg:text-sm">
                            {product.slideProfiles.username}
                          </h2>
                        </span>
                      )}
                    </div>
                  </SwiperSlide>
                ))}
            </Swiper>
          ) : (
            <div className="relative pb-[65.0485437%]">
              <div className="flex absolute h-full items-center justify-center w-full  bg-gray-300 rounded-sm ">
                <svg
                  className="w-10 h-10 text-gray-200 "
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 18"
                >
                  <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="product-card-content mt-2">
        <h3
          className={`text-[32px] font-bold font-supreme leading-[1.3438] tracking-[0.32px] text-dark-blue-cm max-tab-lg:text-xl ${textWidth}`}
        >
          {product?.title}
        </h3>
        <div className="flex items-center gap-2 my-[3.5px]">
          <div className="py-[7px] px-3 border border-[rgba(0,0,0,0.08)] rounded-md bg-white">
            <Image
              src={product?.manufacture?.logo}
              width={62}
              height={23}
              alt="logo"
              className="h-auto w-auto block"
            />
          </div>
          <div>
            <span className="font-supreme font-bold text-[15px] leading-none tracking-[0.15px] text-dark-blue-cm">
              {product?.manufacture?.name}
            </span>
            <span className="font-sofia-sans block font-normal text-sm leading-none tracking-[0.56px] text-dark-blue-cm">
              {product?.manufacture?.text}
            </span>
          </div>
        </div>
        <div>
          <span className="font-supreme font-bold text-[32px] max-tab-sm:text-[25px] max-tab-lg:text-xl leading-[1.34375] block tracking-[0.32px] text-dark-blue-cm">
            {product?.price}
          </span>
          <div className="font-supreme font-light mt-1 text-sm leading-[1.358] tracking-[0.14px] text-dark-blue-cm/40">
            {product?.type}
          </div>
        </div>
      </div>

      <div
        className={`flex items-center justify-center w-[122px] max-tab-lg:w-[100px] h-[92px] max-tab-lg:h-[68px] rounded-br-[6px] absolute bottom-0 right-0  ${
          linkBgColor ?? "bg-accent-100"
        }`}
      >
        <svg
          width="39"
          height="92"
          viewBox="0 0 39 92"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="block absolute top-0 left-0 max-tab-lg:left-[-1px] max-tab-lg:top-[-1px]"
        >
          <path d="M0 0H38.5L0 91.3086V91V0Z" fill="#FAFAFA" />
        </svg>
        <IconChevron
          type="right"
          className={` translate-x-6 translate-y-[-6px] ${
            arrowFill ?? "fill-dark-blue-cm"
          }`}
        />
      </div>
    </div>
  );
};
export default ProductCard;
