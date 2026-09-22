import React from "react";
import Image from "next/image";
import Link from "next/link";

const ImageWithText = () => {
  return (
    <section className=" py-12 flex flex-col  ">
      <div className=" w-full  flex  relative gap-[43.13px] max-des-xs:items-center max-sm:flex-wrap max-tab-lg:gap-[25px] max-sm:flex-col">
        <div className=" w-[53.24%] max-sm:w-full">
          <Image
            alt=""
            src="/assets/images/Featured Build (2).png"
            width={806}
            height={454}
            className=" w-full"
            unoptimized
          />
        </div>
        <div className="flex items-center">
          <div className="flex flex-col gap-8 min-w-[574px] pr-[30px] max-des-xs:min-w-[300px] max-tab-sm:min-w-full max-tab-md:px-4 max-tab-lg:gap-4">
            <span className="flex gap-[5px] min-w-[292px]  items-center max-tab-sm:min-w-full w-fit">
              <Image
                alt=""
                src="/assets/images/ImageWithCar.png"
                width={75}
                height={75}
                className="object-cover mr-[4.96px] mb-[5.43px]"
                unoptimized
              />
              <h2 className="text-xl font-medium leading-[1.2] tracking-[tracking-[0.01em] w-full">
                Lachy Collis
              </h2>
            </span>
            <div className="w-full relative max-w-[544px] max-tab-sm:max-w-full   mx-auto  max-tab-sm:bottom-0 max-des-sm:max-w-[375px] max-des-xlg:max-w-[570px]">
              <span className="max-w-[472px] absolute top-[40px] max-mb-sm:top-[20px] max-tab-sm:top-[40px] max-tab-lg:top-[20px]  bottom-[32px] w-full  mx-auto left-0 right-0 max-des-sm:max-w-[320px] max-mb-sm:max-w-[300px] ">
                <h3 className="  text-[24px]   font-supreme max-des-lg:leading-[1.2] leading-[1.3334] tracking-[0.24px ] max-des-sm:text-base ">
                  Lorem ipsum dolor sit amet consectetur. At dui sed mus arcu
                  venenatis dolor maecenas consectetur volutpat. Orci pretium
                  amet erat id. Pellentesque porttitor mauris vulputate
                  curabitur. Sed orci maecenas eu semper. Amet egestas et nunc
                  quam consectetur sit eu quis.
                </h3>
                <Link
                  href="#"
                  className="flex  items-center gap-4 font-supreme font-bold text-base leading-6 tracking-[0.16] text-accent-100"
                >
                  Read More{" "}
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 25 25"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="max-tab-sm:w-[20px] max-tab-sm:h-[20px]"
                  >
                    <path
                      d="M14.2045 4.93001C13.8111 4.54239 13.178 4.54708 12.7904 4.94048C12.4027 5.33389 12.4074 5.96704 12.8008 6.35466L18.1712 11.6461H4.5C3.94771 11.6461 3.5 12.0938 3.5 12.6461C3.5 13.1983 3.94772 13.6461 4.5 13.6461H18.1646L12.8008 18.9309C12.4074 19.3186 12.4027 19.9517 12.7904 20.3451C13.178 20.7385 13.8111 20.7432 14.2045 20.3556L21.1287 13.5332C21.6256 13.0436 21.6256 12.242 21.1287 11.7524L14.2045 4.93001Z"
                      fill="#54DC00"
                    />
                  </svg>
                </Link>
              </span>
              <div className=" pointer-events-none w-full ">
                <svg
                  width="544"
                  height="320"
                  viewBox="0 0 544 320"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-auto"
                >
                  <path
                    d="M543.25 0.75V319.25H0.75V30.3135L30.8281 0.75H543.25Z"
                    stroke="#54DC00"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImageWithText;
