"use client";
import React from "react";
import HeadingSlideButtons from "../global/HeadingSlideButtons";
import { useState } from "react";
import ListItems from "../sections/marketPlace/ListItems";

const ListedItems: React.FC = () => {
  const [price, setPrice] = useState<number[]>([500, 4500]);
  const [type, setType] = useState<string>("Rear");
  const [condition, setCondition] = useState<string>("Used");
  const [set, setSet] = useState<string>("Squared");
  const [pcd, setPcd] = useState<string>("5 x 100");

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(Number(e.target.value), price[1] - 100); 
    setPrice([value, price[1]]);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(Number(e.target.value), price[0] + 100); 
    setPrice([price[0], value]);
  };
  return (
    <section className="w-full max-w-[1273px] mx-auto  sm:px-6 lg:px-8 space-y-10 overflow-hidden">
      <div className="mt-6 mb-6 text-dark-blue-cm]">
        <HeadingSlideButtons
          heading="Listed Items (43 Results)"
          isButtons={false}
          hideRightSide={true}
        />
      </div>
      <div className="flex flex-col lg:flex-row px-10 lg:px-0">
        <div className="max-w-[286px] w-full gap-[12px]">
          <div className="mb-4 bg-white border-[1.5px] rounded-[6px] border-[#00000014] p-3 flex flex-col">
            <label className="block mb-1 text-dark-blue-cm font-sofia-sans font-normal text-sm">
              Price
            </label>

            <div className="relative w-full h-2">
              <div className="absolute top-1/2 -translate-y-1/2 h-2 w-full bg-[#F2F2F2] rounded"></div>

              <div
                className="absolute top-1/2 -translate-y-1/2 h-2 bg-[#54DC00] rounded"
                style={{
                  left: `${(price[0] / 5000) * 100}%`,
                  width: `${((price[1] - price[0]) / 5000) * 100}%`,
                }}
              ></div>

              <input
                type="range"
                min={0}
                max={5000}
                value={price[0]}
                onChange={handleMinChange}
                className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[22px] [&::-webkit-slider-thumb]:h-[24px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white  [&::-webkit-slider-thumb]:border-[#F2F2F2] [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:border-[1px] "
              />

              <input
                type="range"
                min={0}
                max={5000}
                value={price[1]}
                onChange={handleMaxChange}
                className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[22px] [&::-webkit-slider-thumb]:h-[24px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-[#F2F2F2] [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:border-[1px] "
              />
            </div>

            <span className="flex justify-between text-dark-blue-cm font-sofia-sans font-normal text-base mt-2">
              <span className="border border-[#00000014] rounded p-1">
                ${price[0]}
              </span>
              <span className="border border-[#00000014] rounded p-1">
                ${price[1]}
              </span>
            </span>
          </div>

          <div className="mb-4 bg-[#FFFFFF] border-[1.5px] rounded-[6px] border-[#00000014] p-3 flex flex-col gap-3">
            <label className="block mb-1 font-sofia-sans font-normal text-sm leading-[100%] tracking-[4%]">
              Type
            </label>
            <div className="flex gap-2 font-sofia-sans font-normal text-base leading-[100%] tracking-[4%]">
              {["Front", "Rear"].map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`border-[#00000014] border rounded p-1  ${
                    type === t
                      ? "bg-dark-blue-cm text-white"
                      : "bg-[#FFFFFF] text-dark-blue-cm"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4 bg-[#FFFFFF] border-[1.5px] rounded-[6px] border-[#00000014] p-3 flex flex-col gap-3">
            <label className="block mb-1 font-sofia-sans font-normal text-sm leading-[100%] tracking-[4%]">
              Condition:
            </label>
            <div className="flex gap-2 font-sofia-sans font-normal text-base leading-[100%] tracking-[4%]">
              {["New", "Used"].map((c) => (
                <button
                  key={c}
                  onClick={() => setCondition(c)}
                  className={`border-[#00000014] border rounded p-1 ${
                    condition === c
                      ? "bg-dark-blue-cm text-white"
                      : "bg-[#FFFFFF] text-dark-blue-cm"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4 bg-[#FFFFFF] border-[1.5px] rounded-[6px] border-[#00000014] p-3 flex flex-col gap-3">
            <label className="block mb-1 font-sofia-sans font-normal text-sm leading-[100%] tracking-[4%]">
              Set:
            </label>
            <div className="flex  gap-2 font-sofia-sans font-normal text-base leading-[100%] tracking-[4%]">
              {["Squared", "Staggered", "Single"].map((s) => (
                <button
                  key={s}
                  onClick={() => setSet(s)}
                  className={`border-[#00000014] border rounded p-1 ${
                    set === s
                      ? "bg-dark-blue-cm text-white"
                      : "bg-[#FFFFFF] text-dark-blue-cm"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4 bg-[#FFFFFF] border-[1.5px] rounded-[6px] border-[#00000014] p-3 flex flex-col gap-3">
            <label className="block mb-1 font-sofia-sans font-normal text-sm leading-[100%] tracking-[4%]">
              PCD:
            </label>
            <div className="flex flex-wrap gap-2 font-sofia-sans font-normal text-base leading-[100%] tracking-[4%]">
              {["5 x 114.3", "5 x 100", "4 x 100"].map((p) => (
                <button
                  key={p}
                  onClick={() => setPcd(p)}
                  className={`border-[#00000014] border rounded p-1 ${
                    pcd === p
                      ? "bg-dark-blue-cm text-white"
                      : "bg-[#FFFFFF]] text-dark-blue-cm"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 w-full ">
          <ListItems showHeading={false} />
        </div>
      </div>
    </section>
  );
};

export default ListedItems;
