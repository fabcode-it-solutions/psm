"use client";

import React from "react";
import IconNext from "@/assets/icons/IconNext";

type OtherBreadCrumbHeaderProps = {
  breadcrumbs: string[];
  currentPage: string;
  title: string;
  subtitle?: string;
  onClose?: () => void;
  listingsCount?: number | string;
};

const OtherBreadCrumbHeader: React.FC<OtherBreadCrumbHeaderProps> = ({
  breadcrumbs,
  currentPage,
  title,
  subtitle,
  onClose,
  listingsCount,
}) => {
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-row items-center justify-between gap-10 lg:gap-[129px] md:gap-8 sm:gap-6 max-sm:flex-col max-sm:items-start max-sm:gap-3">
        <div className="font-sofia-sans font-normal text-xs sm:text-sm leading-[100%] tracking-[4%] text-dark-blue-cm flex flex-wrap gap-1 sm:gap-2.5 w-full max-w-[345px]">
          <span className="opacity-40 flex flex-wrap  items-center gap-1">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {crumb} <IconNext />
              </React.Fragment>
            ))}
          </span>
          {currentPage}
        </div>

        <div className="flex gap-3">
          <button className="shrink-0 border-[#00202914] border-[1.5px] rounded-full p-[6px]">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9.38843 4.28963C7.69278 2.57693 4.94954 2.5686 3.26122 4.2739C1.5729 5.9792 1.58114 8.75004 3.27679 10.4627L9.55368 16.8028C9.81404 17.0657 10.2362 17.0657 10.4965 16.8028L16.7408 10.4994C18.4252 8.78856 18.4199 6.02549 16.7239 4.31249C15.0252 2.59671 12.2807 2.58838 10.5894 4.29673L9.99299 4.90026L9.38843 4.28963Z"
                fill="#212121"
              />
            </svg>
          </button>

          <button className="shrink-0 border-[#00202914] border-[1.5px] rounded-full p-[6px]">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.3776 5.70757V3.57782C12.3776 3.09805 12.9078 2.83964 13.268 3.10864L13.3297 3.16165L17.8268 7.58283C18.0367 7.78916 18.0558 8.12058 17.8841 8.34968L17.8269 8.41512L13.3298 12.8377C12.992 13.1699 12.4429 12.9566 12.3829 12.5039L12.3776 12.4216V10.3261L12.1199 10.3493C10.3196 10.5417 8.59416 11.3728 6.93261 12.8564C6.54318 13.2042 5.94067 12.8754 6.00472 12.3501C6.50344 8.25989 8.59039 6.00547 12.153 5.72268L12.3776 5.70757ZM5.5 4C4.11929 4 3 5.11929 3 6.5V14.5C3 15.8807 4.11929 17 5.5 17H13.5C14.8807 17 16 15.8807 16 14.5V13.5C16 13.2239 15.7761 13 15.5 13C15.2239 13 15 13.2239 15 13.5V14.5C15 15.3284 14.3284 16 13.5 16H5.5C4.67157 16 4 15.3284 4 14.5V6.5C4 5.67157 4.67157 5 5.5 5H8.5C8.77614 5 9 4.77614 9 4.5C9 4.22386 8.77614 4 8.5 4H5.5Z"
                fill="#002029"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className=" flex flex-col gap-[6px]">
        <h1 className="font-supreme font-medium text-[24px] sm:text-[28px] leading-[100%] tracking-[1%] text-dark-blue-cm">
          {title}
        </h1>
        {subtitle && (
          <span className="font-supreme text-dark-blue-cm font-normal not-italic text-xs sm:text-sm tracking-[1%]">
            {subtitle}
          </span>
        )}
      </div>

      {listingsCount !== undefined && (
        <div className="px-3 py-1.5 bg-dark-blue-cm text-white text-xs sm:text-sm font-bold rounded-md max-w-[97px] w-full">
          {listingsCount} Listings
        </div>
      )}
    </div>
  );
};

export default OtherBreadCrumbHeader;
