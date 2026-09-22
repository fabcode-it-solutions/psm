"use client";

import Image from "next/image";
import HeadingSlideButtons from "@/component/global/HeadingSlideButtons";
import IconRightArrow from "@/assets/icons/IconRightArrow";

const trendingData = [
  {
    brand: "RAYS",
    logo: {
      src: "/assets/images/rayslogo.png",
      width: 131,
      height: 49,
    },
     image: {
      src: "/assets/images/alloy11.png",
      width: 145,
      height: 135,
    },
  },
  {
    brand: "ENKEI",
    logo: {
      src: "/assets/images/enkeilogo.png",
      width: 118,
      height: 49,
    },
     image: {
      src: "/assets/images/alloy22edit.png",
      width: 162,
      height: 167,
    },
  },
  {
    brand: "WORK",
    logo: {
      src: "/assets/images/worklogo.png",
      width: 121,
      height: 49,
    },
     image: {
      src: "/assets/images/alloy33.png",
      width: 154,
      height: 146,
      
    },
  },
];


const TrendingProducts = () => {
  return (
    <section className="w-full max-w-[1272px] mx-auto py-12 max-tab-sm:px-[16px] max-des-sm:px-[30px] relative">
      <div className="mb-6">
        <HeadingSlideButtons
          heading="Trending Products"
          isButtons={false}
          rightArrowClass="arrow-left-rp"
          leftArrowClass="arrow-right-rp"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {trendingData.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-md relative border-[1.5px] border-[#00202914] shadow-[0px_4px_12px_rgba(0,32,41,0.08)] flex justify-between items-center p-4 max-h-[150px] "
          >
            <div className="flex flex-col space-y-12 ">
              <div>
              <Image
                  src={item.logo.src}
                  alt={item.brand}
                  width={item.logo.width}
                  height={item.logo.height}
                  className="object-contain"
                />
              </div>
              <div>
              <a
                href="#view selection"
                className="text-base font-bold text-dark-blue-cm flex items-center gap-4"
              >
                View Selection <IconRightArrow />
              </a>
              </div>
            </div>
            <div className="  absolute right-[-11px] top-[-30px] flex justify-center items-end max-mb-sm:right-3 max-des-xs:top-[-10px]">
               <Image
                src={item.image.src}
                alt={`${item.brand} wheel`}
                width={item.image.width}
                height={item.image.height}
                className="object-contain max-tab-sm:w-[120px] max-mb-sm:w-[110px]"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TrendingProducts;
