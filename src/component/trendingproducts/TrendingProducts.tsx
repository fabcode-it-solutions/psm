"use client";

import Image from "next/image";
import { HiArrowNarrowRight } from "react-icons/hi";

import HeadingSlideButtons from "../global/HeadingSlideButtons";

const trendingData = [
  {
    brand: "RAYS",
    logo: "/assets/images/rayslogo.png",
    image: "/assets/images/alloy11.png",
  },
  {
    brand: "ENKEI",
    logo: "/assets/images/enkeilogo.png",
    image: "/assets/images/alloy22.png",
  },
  {
    brand: "WORK",
    logo: "/assets/images/worklogo.png",
    image: "/assets/images/alloy33.png",
  },
];

const TrendingProducts = () => {
  return (
    <section className="w-full max-w-[1272px] mx-auto  py-12 relative max-tab-sm:px-4 max-tab-lg:px-[30px] max-tab-md:max-w-full max-des-xs:max-w-[940px] max-des-md:max-w-[1100px]">
      <div className="mb-6">
          <HeadingSlideButtons
        heading="Trending Products"
        isButtons={false}
        rightArrowClass="arrow-left-rp"
        leftArrowClass="arrow-right-rp"
      />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {trendingData.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-md flex justify-between items-center p-4"
          >
            <div className="flex flex-col justify-between">
              <Image src={item.logo} alt={item.brand} width={139} height={49} />
              <a
                href="#view selection"
                className="mt-6 text-base font-medium text-black flex items-center gap-1"
              >
                View Selection <HiArrowNarrowRight size={27} />
              </a>
            </div>
            <div className="max-w-[145px] w-full max-h-[100px] h-full relative left-7 bottom-8 max-tab-sm:left-5 max-tab-sm:w-[120px] max-tab-sm:h-[90px]">
              <Image
                src={item.image}
                alt={`${item.brand} wheel`}
                width={145}
                height={135}
                className="object-contain"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TrendingProducts;
