import React from "react";
import Image from "next/image";

const SearchProductCard = () => {
  const listings = [
    {
      id: "1",
      image: "/assets/images/mainwheel.png", 
      logo: "/assets/images/rays-logo.png",
      listingsCount: "43 Listings",
      title: "RAYS Volk Racing TE37V Mark II",
      price: "$4285",
      note: "Lowest EOI",
    },
    {
      id: "2",
      image: "/assets/images/mainwheel.png", 
      logo: "/assets/images/rays-logo.png", 
      listingsCount: "43 Listings",
      title: "RAYS Volk Racing TE37V Mark II",
      price: "$4285",
      note: "Lowest EOI",
    },
    
  ];

  return (
    <section className="">
      <div className="relative max-w-[506px] w-full  ">

      
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {listings.map((item) => (
            <div
              key={item.id}
              className="bg-white overflow-hidden cursor-pointer shadow-xl transition rounded-t-[6px] rounded-b-[10px] mr-10 lg:mr-0"
            >
             
              <div className="relative w-full  h-[217.2px] ">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
                  <div className="absolute inset-0 bg-black/20 opacity-100 group-hover:opacity-100 transition" />
              </div>

             
              <div className="pl-[18.3px] mb-[22.73px]">      
                <div className="flex gap-[7.32px] relative bottom-4">
                  <div className="flex items-center gap-2 bg-white border-[#00000014] border-[1.5px] rounded-[6px] px-[8.34px] py-[2.71px]">
                    <Image
                      src={item.logo}
                      alt="Brand"
                      width={62}
                      height={23}
                      className="object-contain "
                    />
                  </div>
                  <span className=" text-white bg-dark-blue-cm px-[7.87px] py-[4.71px] rounded-[6px] items-center flex font-supreme font-bold text-sm leading-[100%] tracking-[0.01em]">
                    {item.listingsCount}
                  </span>
                </div>

                
                <h3 className=" text-dark-blue-cm font-supreme font-normal text-xl leading-[100%]  tracking-[1%] max-w-[189.37px] w-full h-[49.49px] flex items-center">
                  {item.title}
                </h3>

              
                <p className="text-lg  text-dark-blue-cm font-supreme font-bold text-[32px] leading-[100%] tracking-[0.01em] mt-[13.86px]  flex items-center">
                  {item.price}
                </p>
                <p className=" text-dark-blue-cm font-supreme font-light text-sm leading-[100%] tracking-[0.01em] opacity-40 flex items-center ">{item.note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SearchProductCard;
