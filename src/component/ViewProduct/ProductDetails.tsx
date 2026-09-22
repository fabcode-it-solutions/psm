"use client";

import { useState } from "react";

const sections = [
  {
    title: "Details",
    content: `The VOLK RACING Wheel brand represents the benchmark for forged
    sport wheels that leverage racing technology. The lightness and
    strength of VOLK RACING wheels has been attained by applying the
    latest technologies, coupled with real world testing in high
    pressure motorsport environments. World renowned for making the
    highest quality motorsport wheels, Rays brings their hard won
    knowledge and experience to every wheel they make – and the VOLK
    line of wheels is at the top of the tree. All of Rays Engineering
    wheels undergo stringent testing, far exceeding the minimum quality
    controls laid down to receive JWL certification. All of Rays forged
    wheels must exceed Rays own internal JWL+R Spec 2 standards – the
    world’s most stringent standard for wheel manufacturing. As an
    example, the JWL standards require a wheel to undergo a radial
    stress test for a minimum of 500,000 rotations – JWL+R Spec 2 sees
    the wheel do 1,000,000 rotations.`,
  },
  {
    title: "Features",
    content: "This section contains product features.",
  },
  {
    title: "Specifications",
    content: "This section contains all technical specifications.",
  },
  {
    title: "Condition",
    content: "This section will describe product condition.",
  },
  {
    title: "Compatible Vehicles",
    content: "This section lists vehicles compatible with the product.",
  },
];

export default function ProductDetails() {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (title: string) => {
    setOpenSection(openSection === title ? null : title);
  };

  return (
    <div className="text-dark-blue-cm font-supreme font-bold text-lg leading-[100%] tracking-[1%] flex flex-col gap-[14px] mt-3 ">
      {sections.map((section) => (
        <div
          key={section.title}
          className="bg-[#FFFFFF] border-[1.5px] rounded-[6px] border-[#E8E8E866] w-full max-w-[555px] px-[21.94px] cursor-pointer"
          onClick={() => toggleSection(section.title)}
        >
       
          <div className="flex justify-between items-center">
            <span className="font-supreme font-bold text-lg leading-[100%] tracking-[1%] text-dark-blue-cm py-[15px] ">
              {section.title}
            </span>
            <svg
              width="28"
              height="24"
              viewBox="0 0 28 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={`transition-transform duration-300 ${
                openSection === section.title ? "rotate-180" : ""
              }`}
            >
              <path
                d="M6.03215 8.29289C6.42268 7.90237 7.05584 7.90237 7.44636 8.29289L13.7393 14.5858L20.0322 8.29289C20.4227 7.90237 21.0558 7.90237 21.4464 8.29289C21.8369 8.68342 21.8369 9.31658 21.4464 9.70711L14.4464 16.7071C14.0558 17.0976 13.4227 17.0976 13.0322 16.7071L6.03215 9.70711C5.64163 9.31658 5.64163 8.68342 6.03215 8.29289Z"
                fill="#002029"
              />
            </svg>
          </div>

         
          {openSection === section.title && (
            <div className="mt-6 pb-[84px]">
              <span className="font-supreme font-light text-base tracking-[1%] text-dark-blue-cm">
                {section.content}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
