"use client";
import Anchor from "@/component/ui/Anchor/Anchor";
import React, { useState, useEffect , useCallback } from "react";
import { useRouter } from "next/navigation";
import Button from "@/component/ui/Button/Button";

type Variant = {
  id: number;
  option1: string;
  option2: string;
  option3: string;
  price: string;
  option1Label: string;
  option2Label: string;
  option3Label: string;

};

type Metafield = {
  key: string;
  value: string[];
};

const capitalizeFirst = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

export default function Specifications({ slug }: { slug: string , userId:number |null}) {
   const router = useRouter();
  const [variants, setVariants] = useState<Variant[]>([]);
  const [metafields, setMetafields] = useState<Metafield[]>([]);
  const [selected, setSelected] = useState<number | null>(null);

  const [loading, setLoading] = useState(true); 

  
  const [condition, setCondition] = useState("Used");
  const [pcd, setPcd] = useState("5 x 100");
  const [setType, setSetType] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/parts/${slug}`);
      const data = await res.json();

      if (data.success) {
        if (data.data.variants) {
          setVariants(data.data.variants);
        }
        if (data.data.metafields) {
          setMetafields(data.data.metafields);
        }
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, [slug]); 


  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filterOptions = [
    {
      label: "Condition:",
      state: condition,
      setState: setCondition,
      options:
        metafields.find((m) => m.key === "condition")?.value || ["Not Found"],
    },
    {
      label: "PCD:",
      state: pcd,
      setState: setPcd,
      options: metafields.find((m) => m.key === "pcd")?.value || ["Not Found"],
    },
    {
      label: "Set:",
      state: setType,
      setState: setSetType,
      options: metafields.find((m) => m.key === "set")?.value || ["Not Found"],
    },
  ];

  if (loading) {
    return (
      <div className="w-full max-w-[506px] max-h-[200px] h-full flex items-center justify-center border-[1.5px] border-[#E8E8E866] rounded-[6px] bg-white mt-11">
        <span className="text-dark-blue-cm font-supreme font-medium">
          Loading specifications...
        </span>
      </div>
    );
  }


  return (
    <div className="w-full max-w-[506px]  h-auto border-[1.5px] border-[#E8E8E866]  rounded-[6px] bg-white mt-11">
      <div className="w-full max-w-[466px] mx-auto">
        <h2 className="w-full font-supreme font-bold text-[18px] leading-[1.334] tracking-[0.18px] mt-[15px] text-dark-blue-cm">
          Available Specifications:
        </h2>

        <div className="flex border-b-1 border-[#00000014]  mt-2 items-center gap-[49px]">
          <span className=" flex  flex-wrap">
            {filterOptions.map((filter, idx) => (
              <div
                key={filter.label}
                className={`flex py-3 items-center gap-[49px] ${
                  idx !== filterOptions.length - 1
                    ? "border-b w-full border-[#00000014]"
                    : ""
                }`}
              >
                <span>
                  <h2 className="font-supreme font-medium text-base leading-[100%] tracking-[0.01em] flex items-center max-w-[74.73px] w-full text-dark-blue-cm">
                    {filter.label}
                  </h2>
                </span>

                <span className="flex gap-6 flex-wrap">
                  {filter.options.map((item) => (
                    <button
                      key={item}
                      onClick={() => filter.setState(item)}
                      className={`px-3 py-1.5 rounded-[6px] border-[1.5px] font-supreme font-normal text-sm leading-[1.215] tracking-[0.14px] ${
                        filter.state === item
                          ? "bg-dark-blue-cm text-white"
                          : "bg-white text-gray-700 border-[#00000014]"
                      }`}
                    >
                      {capitalizeFirst(item)}
                    </button>
                  ))}
                </span>
              </div>
            ))}
          </span>
        </div>

        <div className="border-[#E8E8E8] border-[1.5px] rounded-[6px] overflow-y-auto overflow-x-hidden mt-[20px] max-h-[315px]">
          <div className="sticky top-0 grid grid-cols-5 bg-[#E8E8E8] text-[#000000] py-5 px-3 font-audiowide font-normal text-xs leading-[100%] tracking-[0em] text-center align-middle">
            <span className="leading-[100%] tracking-[0em]  text-xs"> {variants[0].option1Label || "Option 1"}</span>
            <span className="leading-[100%] tracking-[0em] text-xs">{variants[0].option2Label || "Option 2"}</span>
            <span className="leading-[100%] tracking-[0em]  text-xs"> {variants[0].option3Label || "Option 3"}</span>
            <span className="leading-[100%] tracking-[0em]  text-xs">Price</span>
          </div>

          {variants.map((variant) => (
            <div
              key={variant.id}
              className={`grid grid-cols-5 items-center cursor-pointer transition align-middle font-supreme font-normal text-xs leading-[100%]  tracking-[0em] text-center ${
                selected === variant.id
                  ? "bg-dark-blue-cm text-white"
                  : "bg-white hover:bg-gray-50"
              }`}
              onClick={() => setSelected(variant.id)}
            >
               <span className="py-4 px-3">{variant.option1}</span>
              <span className="py-4 px-3">{variant.option2}</span>
              <span className="py-4 px-3">{variant.option3}</span>
              <span className="py-4 px-3">${variant.price}</span>

              <span className="flex justify-end">
                {selected === variant.id ? (
                  <div
                    className="h-[52px] w-[71px] flex items-center justify-center"
                    style={{
                      clipPath: "polygon(30% 0, 100% 0, 100% 100%, 0 100%)",
                      background: "#54DC00",
                    }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M10 2C14.4183 2 18 5.58172 18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2ZM13.3584 7.64645C13.1849 7.47288 12.9154 7.4536 12.7206 7.58859L12.6513 7.64645L9 11.298L7.35355 9.65131L7.28431 9.59346C7.08944 9.45846 6.82001 9.47775 6.64645 9.65131C6.47288 9.82488 6.4536 10.0943 6.58859 10.2892L6.64645 10.3584L8.64645 12.3584L8.71569 12.4163C8.8862 12.5344 9.1138 12.5344 9.28431 12.4163L9.35355 12.3584L13.3584 8.35355L13.4163 8.28431C13.5513 8.08944 13.532 7.82001 13.3584 7.64645Z"
                        fill="white"
                      />
                    </svg>
                  </div>
                ) : (
                  <div className="h-[52px] w-[71px] flex items-center justify-center">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M6 10C6 9.72386 6.22386 9.5 6.5 9.5H9.5V6.5C9.5 6.22386 9.72386 6 10 6C10.2761 6 10.5 6.22386 10.5 6.5V9.5H13.5C13.7761 9.5 14 9.72386 14 10C14 10.2761 13.7761 10.5 13.5 10.5H10.5V13.5C10.5 13.7761 10.2761 14 10 14C9.72386 14 9.5 13.7761 9.5 13.5V10.5H6.5C6.22386 10.5 6 10.2761 6 10ZM10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10C17 13.866 13.866 17 10 17Z"
                        fill="#002029"
                      />
                    </svg>
                  </div>
                )}
              </span>
            </div>
          ))}
        </div>


        <div className="w-full flex items-center mt-8 flex-wrap justify-center lg:justify-normal ">
          <Anchor  href="#"
            className="!text-[#333333] !min-w-[232px] max-sm:!w-full !py-[11px] font-bold font-supreme !text-xs !bg-[#EFEFEF3D]"
          >
            Looking to sell?
          </Anchor>
          <Button
           onClick={() => router.push(`/listings/create/${slug}/product`)}
            className="!text-[#333333] !min-w-[232px] max-sm:!w-full !py-[11px] font-bold font-supreme !text-xs"
          >
            Select Product
          </Button>
        </div>
      </div>
    </div>
  );
}
