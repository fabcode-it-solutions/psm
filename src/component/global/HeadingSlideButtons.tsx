import React from "react";
import AutoHeading from "../ui/Heading/AutoHeading";
import IconChevron from "@/assets/icons/IconChevron";
import { cn } from "@sglara/cn";
import Link from "next/link";

const HeadingSlideButtons = ({
  heading,
  isButtons,
  leftArrowClass,
  rightArrowClass,
  buttonText,
  buttonLink,
  hideRightSide = false, 
}: {
  heading: string;
  isButtons: boolean;
  leftArrowClass?: string;
  rightArrowClass?: string;
  buttonText?: string;
  buttonLink?: string;
  hideRightSide?: boolean;
}) => {
  return (
    <div className="flex justify-between items-start mb-10 max-tab-sm:mb-5 max-tab-sm:pl-[13px]">
      <AutoHeading heading={heading} />

      {!hideRightSide && (
        isButtons ? (
          <div className="flex items-center gap-2 slider-arrows">
            <button className={cn("relative slider-arrow-left w-10 h-10 max-tab-lg:w-7 max-tab-lg:h-7 !cursor-pointer flex items-center justify-center skew-x-[-15deg] border border-dark-blue-cm bg-dark-blue-cm transition-all duration-200", leftArrowClass)}>
              <IconChevron className={cn("fill-white skew-x-[15deg] max-tab-sm:w-[18px] max-tab-sm:h-[18px]")} type="left" />
            </button>
            <button className={cn("relative slider-arrow-right w-10 h-10 max-tab-lg:w-7 max-tab-lg:h-7 !cursor-pointer flex items-center justify-center skew-x-[-15deg] border border-dark-blue-cm bg-dark-blue-cm", rightArrowClass)}>
              <IconChevron className={cn("fill-white skew-x-[15deg] max-tab-sm:w-[18px] max-tab-sm:h-[18px]")} type="right" />
            </button>
          </div>
        ) : (
          <Link
            className="flex items-center gap-2 font-supreme leading-6 text-lg tracking-normal font-light text-dark-blue-cm/40"
            href={buttonLink || "#"}
          >
            {buttonText || "View All"}
            <IconChevron type="right" className="fill-dark-blue-cm/40" />
          </Link>
        )
      )}
    </div>
  );
};


export default HeadingSlideButtons;
