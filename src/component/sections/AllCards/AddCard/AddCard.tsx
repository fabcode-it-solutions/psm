"use client";
import React, { ReactNode, MouseEventHandler } from "react";

type AddCardProps = {
  onClick?: MouseEventHandler<HTMLDivElement>;
};

const AddCard: React.FC<AddCardProps> = ({ onClick }) => {
  return (
    <div
      onClick={onClick}
      className="flex-1 flex flex-col items-center justify-center border-2 border-[#F4F4F4] rounded-[10px] w-[17.21%] cursor-pointer text-center " >
        <svg
          width="110"
          height="109"
          viewBox="0 0 110 109"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="mb-[10px] max-mb-sm:w-[60px] max-mb-sm:h-[60px]"
        >
          <path
            d="M55.1334 45.5067L55.25 45.5C55.7628 45.5 56.1855 45.886 56.2433 46.3834L56.25 46.5V53.5H63.25C63.7628 53.5 64.1855 53.886 64.2433 54.3834L64.25 54.5C64.25 55.0128 63.864 55.4355 63.3666 55.4933L63.25 55.5H56.25V62.5C56.25 63.0128 55.864 63.4355 55.3666 63.4933L55.25 63.5C54.7372 63.5 54.3145 63.114 54.2567 62.6166L54.25 62.5V55.5H47.25C46.7372 55.5 46.3145 55.114 46.2567 54.6166L46.25 54.5C46.25 53.9872 46.636 53.5645 47.1334 53.5067L47.25 53.5H54.25V46.5C54.25 45.9872 54.636 45.5645 55.1334 45.5067L55.25 45.5L55.1334 45.5067Z"
            fill="#212121"
            fillOpacity="0.2"
          />
        </svg>
      
      <span className="font-bold font-supreme text-xl text-dark-blue-cm leading-[100%] tracking-[-0.17px] ">Add New Part</span>
    </div>
  );
};

export default AddCard;
