
import React from "react";
import Image from "next/image";
import Build from "./Build";
const ListView = () => {
  const listings = [
    {
      id: "123456781",
      title: "RAYS Volk Racing TE37V Mark II",
      image: "/assets/images/car.png",
      code: "#23201C",
      date: "12/01/23",
    },
    {
      id: "123456781",
      title: "RAYS Volk Racing TE37V Mark II",
      image: "/assets/images/car.png",
      code: "#23201C",
      date: "12/01/23",
    },
    {
      id: "123456781",
      title: "RAYS Volk Racing TE37V Mark II",
      image: "/assets/images/car.png",
      code: "#23201C",
      date: "12/01/23",
    },
    {
      id: "123456781",
      title: "RAYS Volk Racing TE37V Mark II",
      image: "/assets/images/car.png",
      code: "#23201C",
      date: "12/01/23",
    },
  ];

  return (
    <section className="mt-[60px] max-w-[1333px] w-full mx-auto px-[30px] max-sm:mt-[30px] max-tab-sm:px-4">
     <Build />
      <div className="flex flex-col mt-[72px] mb-[150px]">
        <div className="flex justify-between bg-[#FFFFFF] border-[1.5px] border-[#F7F7F7] rounded-t-[8px] h-[77px] max-sm:hidden">
          <div className="py-[27.5px] px-[16px] flex min-h-[77px] w-[30.4245283019%]">
            <h2 className="text-[#828282] font-medium text-base leading-[1.2]">
              Listing Title
            </h2>
          </div>
          <div className="py-[27.5px] px-[16px] flex w-[21.6194968553%]">
            <h2 className="text-[#828282] font-medium text-base leading-[1.2]">
              Part Number
            </h2>
          </div>

          <div className="py-[27.5px] px-[16px] flex w-[12.5%]">
            <h2 className="text-[#828282] font-medium text-base leading-[1.2]">
              Date
            </h2>
          </div>
        </div>

        {listings.map((item, index) => (
          <div
            key={item.id || index}
            className="flex bg-[#FFFFFF] justify-between mb-[2px] flex-wrap max-sm:mb-3"
          >
            <div className="py-[19.5px] px-[16px] flex w-[30.4245283019%] gap-[16px] max-sm:w-full  max-tab-lg:w-[43.43%]">
              <div className="relative rounded-[7px] overflow-hidden ">
              <Image
                src={item.image}
                alt=""
                width={75}
                height={68}
                className=" min-h-[68px] object-cover"
              />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60" />
              </div>
              
              <span className="flex flex-col max-w-[178px] gap-1">
                <h2 className="text-[#23201C] font-medium text-base leading-[1.38]">
                  {item.title}
                </h2>
                <p className="text-base text-[#23201C] opacity-[60%] leading-[1.38]">
                  ID: {item.id}
                </p>
              </span>
            </div>

            <div className="px-[16px] items-center flex w-[21.6194968553%] max-sm:w-full">
              <h2 className="text-[#23201C] font-medium text-base leading-[1.4] max-sm:hidden">
                {item.code}
              </h2>

              <span className="text-[#23201C] font-medium text-base leading-[1.4] flex gap-[20px] sm:hidden pb-[10px]">
                <p className="text-[#828282]"> Part Number</p> {item.code}
              </span>
            </div>

            <div className="px-[16px] items-center flex w-[12.5%] max-sm:w-full ">
              <h2 className="text-[#23201C] font-medium text-base leading-[1.4] max-sm:hidden">
                {item.date}
              </h2>
              <span className="text-[#23201C] font-medium text-base leading-[1.4] flex gap-[20px] sm:hidden pb-[10px]">
                <p className="text-[#828282]"> Date</p> {item.date}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ListView;
