"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import Specifications from "./Specifications";
import OtherBreadCrumbHeader from "./OtherBreadCrumbHeader";

type CreateListingsProps = {
  slug: string;
  userId: number | null;
};

interface Media {
  url: string;
  alt?: string;
  order?: number;
  id: number;
}

interface Variant {
  id: string;
  option2?: string;
  price?: string;
}

const CreateListings = ({ slug, userId }: CreateListingsProps) => {
  const [selectedImage, setSelectedImage] = useState<string>(
    "/assets/images/mainwheel.png"
  );
  const [images, setImages] = useState<Media[]>([]);
  const [title, setTitle] = useState<string>("Loading...");
  const [currentPage, setCurrentPage] = useState<string>(slug);
  const [loading, setLoading] = useState(true);
  const [listingsCount, setListingsCount] = useState<number>(0);

  const fetchPart = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/parts/${slug}`);
      const data = await res.json();

      if (data.success && data.data?.part) {
        setTitle(data.data.part.title || "Untitled Part");
        setCurrentPage(data.data.part.slug || slug);

        const mediaData: Media[] = data.data.media || [];
        if (mediaData.length > 0) {
          setImages(mediaData);
          setSelectedImage(mediaData[0].url);
        }

        const variants: Variant[] = data.data.variants || [];
        setListingsCount(variants.length);
      }
    } catch (err) {
      console.error("Error fetching part details:", err);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchPart();
  }, [fetchPart]);

  // Ensure we have a valid userId (fallback to 20 if null)
  const validUserId = userId ?? 20;

  return (
    <section className="w-full flex flex-wrap flex-row justify-between max-w-[92.0634921%] mr-auto max-des-sm:flex-col max-des-sm:max-w-full mb-[0px] max-tab-sm:mb-[10px]">

      {/* LEFT SIDE IMAGES */}
      <div className="relative overflow-hidden w-[55.1724138%] max-des-sm:w-full">
        <div className="w-full relative aspect-[766/659] overflow-hidden">
          <Image
            src={selectedImage}
            alt="Main Product Image"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:opacity-100 transition" />
        </div>

        <Swiper
          slidesPerView={3}
          spaceBetween={0}
          breakpoints={{
            320: { slidesPerView: 2 },
            640: { slidesPerView: 3 },
            1024: { slidesPerView: 3 }
          }}
        >
          {images.map((img) => (
            <SwiperSlide key={img.id}>
              <div
                className="w-full relative cursor-pointer aspect-[255/220] overflow-hidden group"
                onClick={() => setSelectedImage(img.url)}
              >
                <Image
                  src={img.url}
                  alt={img.alt || "Thumbnail"}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:opacity-80 transition" />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* RIGHT SIDE FORM */}
      <div className="w-[36.3505747%] mt-[80px] max-des-sm:w-full max-des-sm:px-[30px] max-tab-sm:my-[20px] max-tab-sm:px-[16px]">
        <OtherBreadCrumbHeader
          breadcrumbs={["Home", "listings", "create"]}
          currentPage={loading ? "Loading..." : currentPage}
          title={loading ? "Loading..." : title}
          onClose={() => console.log("Closed!")}
          listingsCount={loading ? "" : listingsCount.toString()}
        />

        <Specifications slug={slug} userId={validUserId} />
      </div>
    </section>
  );
};

export default CreateListings;