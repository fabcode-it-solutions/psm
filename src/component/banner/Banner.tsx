"use client";
import React, { useState } from "react";
import Image from "next/image";
import IconBrakes from "@/assets/icons/IconBrakes";
import IconElectronics from "@/assets/icons/IconElectronics";
import IconExterior from "@/assets/icons/IconExterior";
import IconEngineDrivetrain from "@/assets/icons/IconEngineDrivetrain";
import IconInterior from "@/assets/icons/IconInterior";
import IconSuspension from "@/assets/icons/IconSuspension";
import IconWheels from "@/assets/icons/IconWheels";
import IconTree from "@/assets/icons/IconTree";
import { useRouter } from "next/navigation";
import PredictiveSearch from "../sections/search/predictive-search/PredictiveSearch";

export default function Banner() {
  const [active, setActive] = useState("Brakes");
  const router = useRouter();
  return (
    <section className="relative w-full bg-black ">
      <div className="relative pb-[43.30%] max-sm:pb-[130%] max-tab-lg:pb-[70%] ">
        <Image
          src="/assets/images/profile-bg.jpg"
          alt="Car Banner"
          className="object-cover absolute top-0 left-0 w-full h-full"
          width={1920}
          height={1080}
        />
      </div>
      <div className="absolute top-0 left-0  flex flex-col items-center justify-center h-full px-4 text-center w-full max-tab-sm:py-[20px]">
        <h1 className="text-[44px]  md:text-[44px] text-white font-bold font-supreme mb-[57px] leading-[1.23] max-w-[709px] px-[30px] max-tab-sm:px-[16px] max-tab-sm:text-[32px] max-tab-lg:text-[36px] max-tab-lg:leading-[1.03] max-des-xs:mb-[27px]">
          Search Parts Listed by you, sold by you
        </h1>

        <div className="hidden md:flex justify-center w-full">
          <PredictiveSearch />
        </div>

        <div className="flex flex-wrap justify-center gap-6 gap-y-[22px] max-w-[784px] max-mb-sm:gap-y-[14px]">
          {[
            {
              icon: <IconBrakes />,
              title: "Brakes",
              query: "brakes",
            },
            {
              icon: (
                <IconElectronics
                  darkFill={active == "Electronics" ? "#fff" : ""}
                />
              ),
              title: "Electronics",
              query: "electronics",
            },
            {
              icon: (
                <IconExterior
                  darkFill={active == "Exterior" ? "#fff" : ""}
                  whiteFill={active == "Exterior" ? "#00212A" : ""}
                />
              ),
              title: "Exterior",
              query: "exterior",
            },
            {
              icon: (
                <IconEngineDrivetrain
                  darkFill={active == "Engine & Drivetrain" ? "#fff" : ""}
                />
              ),
              title: "Engine & Drivetrain",
              query: "engine-drivetrain",
            },
            {
              icon: (
                <IconInterior
                  darkFill={active == "Interior" ? "#fff" : ""}
                  whiteFill={active == "Interior" ? "#00212A" : ""}
                />
              ),
              title: "Interior",
              query: "interior",
            },
            {
              icon: (
                <IconSuspension
                  darkFill={active == "Suspension" ? "#fff" : ""}
                />
              ),
              title: "Suspension",
              query: "suspension",
            },
            {
              icon: (
                <IconWheels
                  darkFill={active == "Wheels" ? "#fff" : ""}
                  whiteFill={active == "Wheels" ? "#00212A" : ""}
                />
              ),
              title: "Wheels",
              query: "wheels",
            },
            {
              icon: (
                <IconTree
                  darkFill={active == "Accessories" ? "#fff" : ""}
                  whiteFill={active == "Accessories" ? "#00212A" : ""}
                />
              ),
              title: "Accessories",
              query: "accessories",
            },
          ].map(({ icon, title, query }, index) => (
            <button
              key={index}
              type="button"
              onClick={() => {
                setActive(title);
                router.push(`/search?q=${query}`);
              }}
              className={` transition-all duration-300 cursor-pointer  rounded-md pl-3.5 pr-[22px] max-tab-lg:px-[10px] py-0 flex items-center gap-2 justify-center text-sm leading-[21px] font-medium font-poppins
                ${
                  active == title
                    ? "text-white bg-dark-blue-cm"
                    : "bg-white text-dark-blue-cm"
                }
                `}
            >
              {icon}
              {title}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
