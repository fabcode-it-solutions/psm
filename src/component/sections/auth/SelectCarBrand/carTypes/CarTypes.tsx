/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import * as RadioGroup from "@radix-ui/react-radio-group";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/libs/redux/store";
import { Build, setBuild } from "@/libs/redux/slices/buildSlice";
import { BrandType, ModelType, ModelTypes } from "@/types/build";


interface CarModelProps {
  heading?: string;
  subheading?: string;
  buttonText?: string;
  carModelsList?: BrandType[] | ModelType[] | ModelTypes[];
  onContinue?: (selectedName: string) => void;
  showImages?: boolean;
  itemPaddingClass?: string;
  type: keyof Build;
}

const CarModel: React.FC<CarModelProps> = ({
  carModelsList = [],
  itemPaddingClass = "",
  showImages = true,
  type,
}) => {
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const builds = useSelector((state: RootState) => state.build.build);
  const dispatch = useDispatch();
  const selectedItem =
    carModelsList.length > 0
      ? carModelsList?.find((item) => item.name === selectedName)
      : "";
  useEffect(() => {
    if (selectedItem) {
      const build = {
        ...builds,
        [type]: {
          id: selectedItem.id,
          name: selectedItem.name,
          logo: selectedItem?.logo?.url,
        },
      };
      dispatch(setBuild(build));
    }
  }, [selectedItem]);
  useEffect(() => {
    if (builds) {
      setSelectedName(
        typeof builds[type] === "object" &&
          builds[type] !== null &&
          "name" in builds[type]
          ? (builds[type] as { name: string }).name
          : null
      );
    }
  }, [builds]);
  return (
    <RadioGroup.Root
      className={`flex flex-wrap ${
        type == "brand" ? "justify-center" : ""
      } gap-[8px] `}
      value={selectedName || ""}
      onValueChange={setSelectedName}
    >
      {carModelsList.length > 0 &&
        carModelsList.slice(0, 25).map((item) => (
          <RadioGroup.Item
            key={item.name}
            value={item.name ?? ''}
            className={`${
              builds &&
              builds[type] &&
              typeof builds[type] === "object" &&
              "name" in builds[type] &&
              (builds[type] as { name: string }).name === item.name
                ? "bg-[#002029] text-[#FFFFFF]"
                : `${type == "brand" ? "bg-white" : ""}`
            } ${itemPaddingClass} pl-[11.5px] max-h-[48px] cursor-pointer  pr-[20px] py-[13px] flex border-[#00202914]  border-[1px] rounded-[45px] gap-[6px] items-center hover:shadow-md transition-shadow`}
            aria-label={item.name}
          >
            {showImages && item.logo && (
              <Image
                src={item.logo?.url}
                alt={item.name || 'logo'}
                width={24}
                height={24}
                unoptimized
                className="bg-white rounded-full"
              />
            )}
            <span
              className={` font-bold ${
                type == "brand" ? "text-base" : "text-sm"
              }`}
            >
              {item.name}
            </span>
          </RadioGroup.Item>
        ))}
    </RadioGroup.Root>
  );
};

export default CarModel;
