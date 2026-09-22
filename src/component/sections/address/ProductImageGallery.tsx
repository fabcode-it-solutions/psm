"use client";

import Image from "next/image";
import { Swiper, SwiperClass, SwiperSlide } from "swiper/react";
import "swiper/css";
import { useState, useMemo } from "react";
import { Thumbs } from "swiper/modules";

type ProductImageGalleryProps = {
  images: string[];
  mainImage: string;
};

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  images,
  mainImage,
}) => {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperClass | null>(null);

  
  const orderedImages = useMemo(() => {
    const filtered = images.filter((img) => img !== mainImage);
    return [mainImage, ...filtered];
  }, [images, mainImage]);

  return (
    <div className="w-full max-w-[698px]">
     
      <Swiper
        spaceBetween={0}
        thumbs={{
          swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
        }}
        modules={[Thumbs]}
        className="main-swiper w-full"
      >
        {orderedImages.map((img, idx) => (
          <SwiperSlide key={`main-${idx}`}>
            <div className="relative">
              <Image
                alt={`main-image-${idx}`}
                src={img}
                width={698}
                height={462}
                className="object-cover w-full h-full aspect-[698/462]"
                unoptimized={img.startsWith("http")}
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition" />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Thumbnails */}
      <Swiper
        onSwiper={setThumbsSwiper}
        spaceBetween={0}
        slidesPerView={3}
        watchSlidesProgress
        modules={[Thumbs]}
        className="thumb-swiper"
        breakpoints={{
          320: { slidesPerView: 2 },
          640: { slidesPerView: 3 },
          1024: { slidesPerView: 3 },
        }}
      >
        {orderedImages.map((img, idx) => (
          <SwiperSlide key={`thumb-${idx}`}>
            <Image
              alt={`thumbnail-${idx}`}
              src={img}
              width={234}
              height={220}
              className="object-cover w-full min-h-[120px] sm:min-h-[220px] h-full cursor-pointer"
              unoptimized={img.startsWith("http")}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ProductImageGallery;