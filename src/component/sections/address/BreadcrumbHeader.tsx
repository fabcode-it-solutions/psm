"use client";

import React from "react";
import IconNext from "@/assets/icons/IconNext";

type BreadcrumbHeaderProps = {
  breadcrumbs: string[];
  currentPage: string;
  title: string;
  subtitle?: string; 
  onClose?: () => void; 
};

const BreadcrumbHeader: React.FC<BreadcrumbHeaderProps> = ({
  breadcrumbs,
  currentPage,
  title,
  subtitle,
  onClose,
}) => {
  return (
    <div className="flex flex-col gap-4 w-full">
    
       <div className="flex flex-row items-center justify-between flex-wrap lg:flex-nowrap">
        <div className="font-sofia-sans font-normal text-xs sm:text-sm leading-[100%] tracking-[4%] text-dark-blue-cm flex flex-wrap gap-1 sm:gap-2.5 w-full max-w-[506px]">
            <span className="opacity-40 flex flex-wrap  items-center gap-1">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {crumb} <IconNext />
              </React.Fragment>
            ))}
          </span>
          {currentPage}
        </div>

        
        {onClose && (
          <button onClick={onClose} className="shrink-0">
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="16"
                cy="16"
                r="15.25"
                stroke="#002029"
                strokeOpacity="0.08"
                strokeWidth="1.5"
              />
              <path
                d="M9.89705 10.0538L9.96967 9.96967C10.2359 9.7034 10.6526 9.6792 10.9462 9.89705L11.0303 9.96967L16 14.939L20.9697 9.96967C21.2359 9.7034 21.6526 9.6792 21.9462 9.89705L22.0303 9.96967C22.2966 10.2359 22.3208 10.6526 22.1029 10.9462L22.0303 11.0303L17.061 16L22.0303 20.9697C22.2966 21.2359 22.3208 21.6526 22.1029 21.9462L22.0303 22.0303C21.7641 22.2966 21.3474 22.3208 21.0538 22.1029L20.9697 22.0303L16 17.061L11.0303 22.0303C10.7641 22.2966 10.3474 22.3208 10.0538 22.1029L9.96967 22.0303C9.7034 21.7641 9.6792 21.3474 9.89705 21.0538L9.96967 20.9697L14.939 16L9.96967 11.0303C9.7034 10.7641 9.6792 10.3474 9.89705 10.0538L9.96967 9.96967L9.89705 10.0538Z"
                fill="#002029"
              />
            </svg>
          </button>
        )}
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
    </div>
  );
};

export default BreadcrumbHeader;
