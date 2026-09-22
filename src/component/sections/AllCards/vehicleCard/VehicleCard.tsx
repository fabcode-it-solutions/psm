/* eslint-disable @next/next/no-img-element */
"use client";
import React from "react";
import { useRouter, usePathname } from "next/navigation";

type VehicleCardProps = {
  imageSrc: string;
  imageWidth?: string;
  title: string;
  registrationNo?: string;
  partsAdded: string;
  onScannerClick?: () => void; 
};

const VehicleCard: React.FC<VehicleCardProps> = ({
  imageSrc,
  imageWidth,
  title,
  registrationNo,
  partsAdded,
  onScannerClick,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const handleListViewClick = () => {
    router.push("/view-builds");
  };

  const isProfilePage = pathname?.startsWith("/profile/");
  return (
    <div className="w-[36.32%] bg-[#F4F4F4] flex flex-col p-6 justify-center space-y-10 rounded-[10px] max-h-[520px] max-tab-sm:w-full">
      <img
        src={imageSrc}
        alt={title}
        className={`${imageWidth} object-cover mx-auto`}
      />

      <div>
        <div className="space-y-3">
          <div className="space-y-[4px]">
            <h3 className="text-xl font-bold leading-[1.35] tracking-[-0.17px] font-supreme text-dark-blue-cm">
              {title}{" "}
            </h3>
            {registrationNo && (
              <p className="font-supreme text-base font-medium text-dark-blue-cm">
                Vehicle Registration No:
                <span className="font-bold"> {registrationNo}</span>
              </p>
            )}
          </div>
          <p className="font-supreme text-xs font-normal text-dark-blue-cm">
            {partsAdded}
          </p>
        </div>

        {isProfilePage && (
          <div className="flex justify-end gap-2">
            <div onClick={onScannerClick} className="cursor-pointer">
              <svg width="47" height="47" viewBox="0 0 47 47" fill="none">
                <circle cx="23.75" cy="23.25" r="23" fill="#002029" />
                <path
                  d="M27 32.5H25V30.5H27V32.5ZM25 25.5H23V30.5H25V25.5ZM33 23.5H31V27.5H33V23.5ZM31 21.5H29V23.5H31V21.5ZM19 23.5H17V25.5H19V23.5ZM17 21.5H15V23.5H17V21.5ZM24 16.5H26V14.5H24V16.5ZM16.5 16V19H19.5V16H16.5ZM21 20.5H15V14.5H21V20.5ZM16.5 28V31H19.5V28H16.5ZM21 32.5H15V26.5H21V32.5ZM28.5 16V19H31.5V16H28.5ZM33 20.5H27V14.5H33V20.5ZM31 30.5V27.5H27V29.5H29V32.5H33V30.5H31ZM29 23.5H25V25.5H29V23.5ZM25 21.5H19V23.5H21V25.5H23V23.5H25V21.5ZM26 20.5V18.5H24V16.5H22V20.5H26ZM18.75 16.75H17.25V18.25H18.75V16.75ZM18.75 28.75H17.25V30.25H18.75V28.75ZM30.75 16.75H29.25V18.25H30.75V16.75Z"
                  fill="#54DC00"
                />
              </svg>
            </div>

            <div onClick={handleListViewClick} className="cursor-pointer">
              <svg width="47" height="47" viewBox="0 0 47 47" fill="none">
                <circle cx="23.75" cy="23.25" r="23" fill="#54DC00" />
                <path
                  d="M25.0173 15.4594C24.7174 15.1737 24.2426 15.1852 23.9569 15.4852C23.6713 15.7851 23.6828 16.2598 23.9827 16.5455L30.2341 22.5001H15.5C15.0858 22.5001 14.75 22.8359 14.75 23.2501C14.75 23.6643 15.0858 24.0001 15.5 24.0001H30.2342L23.9827 29.9548C23.6828 30.2405 23.6713 30.7152 23.9569 31.0152C24.2426 31.3151 24.7174 31.3266 25.0173 31.041L32.4362 23.9743C32.6051 23.8134 32.7051 23.6081 32.7361 23.3948C32.7452 23.348 32.75 23.2996 32.75 23.2501C32.75 23.2006 32.7452 23.1521 32.736 23.1052C32.705 22.892 32.605 22.6869 32.4362 22.5261L25.0173 15.4594Z"
                  fill="#002029"
                />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleCard;
