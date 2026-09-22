"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import React from "react";
import { ProductCardType } from "@/types/product.types";
import ProductCard from "@/component/products/ProductCard";
import HeadingSlideButtons from "@/component/global/HeadingSlideButtons";
import Link from "next/link";
import { SearchResponsePart } from "@/app/api/search/route";
import ProductCardLoader from "@/component/products/ProductCardLoader";

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim();

const baseProducts = [
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
    category: "wheels",
    link: "/",
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
    category: "wheels", // ✅ added category
    link: "/",
  },
  {
    images: [
      "/assets/images/products/image 10 (4).png",
      "/assets/images/products/image 10 (4).png",
      "/assets/images/products/image 10 (4).png",
      "/assets/images/products/image 10 (4).png",
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
    category: "wheels",
    link: "/",
  },
];

export const products: ProductCardType[] = baseProducts.map(
  (product, index) => {
    const slug = slugify(product.title);
    const productId = (10000 + index).toString();
    const category = product.category || "wheels";
    return {
      ...product,
      slug,
      category,
      productId,
      link: `/marketplaces/${category}/product/${slug}`,
    };
  }
);

const ProductType = ({
  parts,
  loading,
}: {
  parts?: SearchResponsePart[];
  loading: boolean;
}) => {
  return (
    <section className="pl-[45px] w-full mt-[33px] max-tab-sm:px-4 max-tab-lg:px-[30px]">
      <div className="max-w-[1004px] px-[30px] max-tab-sm:px-0">
        <HeadingSlideButtons
          heading={`Product Type (${parts?.length || 0} Results)`}
          isButtons={true}
          rightArrowClass="arrow-left-rp"
          leftArrowClass="arrow-right-rp"
        />
      </div>

      <div>
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
              slidesPerView: 2.24,
            },
          }}
          className="relative"
        >
          {!loading &&
            parts &&
            parts.map((part, i) => (
              <SwiperSlide key={i}>
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
          {loading &&
            Array.from({ length: 6 }).map((_, i) => (
              <SwiperSlide key={`product-loader-${i}`}>
                {" "}
                <ProductCardLoader />{" "}
              </SwiperSlide>
            ))}
        </Swiper>
      </div>
    </section>
  );
};

export default ProductType;
