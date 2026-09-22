"use client";
import React from "react";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import ProductCard from "@/component/products/ProductCard";
import "swiper/css";
import "swiper/css/navigation";
import { SearchResponsePart } from "@/app/api/search/route";
import { usePathname } from "next/navigation";

interface PartsSectionProps {
  parts: SearchResponsePart[];
  wishlistedItems: {
    entityId: number;
    entityType: string;
    itemId: number;
  }[];
}

export const PartsSection = React.memo<PartsSectionProps>(
  ({ parts, wishlistedItems }) => {
    const pathname = usePathname();
    const isSearchPage = pathname === "/search";

    const motionProps = {
      initial: { opacity: 0, y: 0 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 0 },
      transition: { duration: 0.3 },
    };

    return (
      <motion.div {...motionProps} key="tab-parts">
        <div className="my-4">
          <h3 className="text-left text-sm leading-[23px] text-dark-blue-cm relative z-[1] font-audiowide font-normal mb-2">
            Parts
          </h3>
          <div className="text-left">
            {isSearchPage ? (
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {parts.map((part) => {
                  const isWishlisted = wishlistedItems.some(
                    (item) =>
                      item.entityId === part.id && item.entityType === "part"
                  );

                  return (
                    <ProductCard
                      key={`parts-grid-${part.id}`}
                      product={{
                        isWishlisted,
                        id: part.id,
                        manufacture: {
                          logo: part.manufacturer?.[0]?.logo || "",
                          name: part.manufacturer?.[0]?.name || "",
                          text: part.manufacturer?.[0]?.subTitle || "",
                        },
                        price: part.price || "0",
                        title: part.title || "",
                        type:
                          part.listed === "For Sale"
                            ? "Lowest Listing"
                            : "Not for Sale",
                        medias: part.media || [],
                        slug: part.slug,
                      }}
                      showBookmark={true}
                      showNotificationIcon={false}
                    />
                  );
                })}
              </div>
            ) : (
              
              <Swiper
                modules={[Navigation]}
                navigation={{
                  nextEl: ".arrow-left-rp",
                  prevEl: ".arrow-right-rp",
                }}
                spaceBetween={12}
                slidesPerView={1.2}
                breakpoints={{
                  375: { slidesPerView: 1.2 },
                  768: { slidesPerView: 2.2 },
                  1024: { slidesPerView: 2.677 },
                }}
                className="relative"
              >
                {parts.map((part, index) => {
                  const isWishlisted = wishlistedItems.some(
                    (item) =>
                      item.entityId === part.id && item.entityType === "part"
                  );

                  return (
                    <SwiperSlide
                      className="!h-auto"
                      key={`parts-popular-${index}`}
                    >
                      <ProductCard
                        product={{
                          isWishlisted,
                          id: part.id,
                          manufacture: {
                            logo: part.manufacturer?.[0]?.logo || "",
                            name: part.manufacturer?.[0]?.name || "",
                            text: part.manufacturer?.[0]?.subTitle || "",
                          },
                          price: part.price || "0",
                          title: part.title || "",
                          type:
                            part.listed === "For Sale"
                              ? "Lowest Listing"
                              : "Not for Sale",
                          medias: part.media || [],
                          slug: part.slug,
                        }}
                        showBookmark={true}
                        showNotificationIcon={false}
                      />
                    </SwiperSlide>
                  );
                })}
              </Swiper>
            )}
          </div>
        </div>
      </motion.div>
    );
  }
);

PartsSection.displayName = "PartsSection";
