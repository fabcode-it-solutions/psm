/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import VehicleCard from "@/component/sections/AllCards/vehicleCard/VehicleCard";
import AddCard from "@/component/sections/AllCards/AddCard/AddCard";
import ProductCard from "@/component/products/ProductCard";
import { ProductCardType } from "@/types/product.types";
import QRBuilderPage from "../../QR-Builder/QRBuilderPage";
import DialogPopup from "@/component/ui/dashboard/DialogPopup";

// Product type based on your provided product objects
export type Product = {
  images: string[];
  listingCount: number;
  title: string;
  manufacture: {
    logo: string;
    name: string;
    text: string;
  };
  price: string;
  type: string;
  isWishlisted: boolean;
  link: string;
};

type ProfileContentCardProps = {
  vehicle: {
    imageSrc: string;
    imageWidth?: string;
    title: string;
    registrationNo: string;
    partsAdded: string;
  };
  products: ProductCardType[];
  onAddClick?: () => void;
  className?: string;
};

const ProfileContentCard: React.FC<ProfileContentCardProps> = ({
  vehicle,
  onAddClick,
  products,
  className = "",
}) => {
  const [showQRModal, setShowQRModal] = useState(false);
  return (
    <div
      className={`flex flex-wrap gap-6 justify-center mb-[72px] ${className}`}
    >
      <VehicleCard
        imageSrc={vehicle.imageSrc}
        imageWidth={vehicle.imageWidth}
        title={vehicle.title}
        registrationNo={vehicle.registrationNo}
        partsAdded={vehicle.partsAdded}
        onScannerClick={() => setShowQRModal(true)}
      />
      <DialogPopup
        heading="QR Builder"
        open={showQRModal}
        setShowCreateModal={setShowQRModal}
        mode="light"
        overlayStyle="backdrop-blur-sm"
      >
        <QRBuilderPage url={`/parts/rays-volk-racing-te37v-mark-ii-21ca66`} />
      </DialogPopup>

      <AddCard onClick={onAddClick} />

      <div className="w-full max-w-[43.01%]  max-tab-sm:max-w-full max-tab-lg:max-w-[35%]">
        <Swiper
          modules={[Navigation]}
          navigation={{
            nextEl: ".arrow-left-main",
            prevEl: ".arrow-right-main",
          }}
          breakpoints={{
            320: { slidesPerView: 1, spaceBetween: 16 },
            640: { slidesPerView: 1, spaceBetween: 20 },
            1024: { slidesPerView: 1.18, spaceBetween: 24 },
          }}
        >
          {products.map((product, index) => (
            <SwiperSlide key={index}>
              <ProductCard
                product={product}
                showBookmark={false}
                linkBgColor="bg-[#002029] "
                arrowFill="fill-accent-100"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default ProfileContentCard;
