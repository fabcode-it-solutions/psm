import HeadingSlideButtons from '@/component/global/HeadingSlideButtons'
import React from 'react'
import Image from 'next/image'
const Build = () => {
  return (
    <div>
        <HeadingSlideButtons
        heading="My Build"
        isButtons={false}
        rightArrowClass="arrow-left-main"
        leftArrowClass="arrow-right-main"
        hideRightSide
      />
      <div className=" bg-[#F4F4F4] p-6 max-w-[462px] w-full flex  gap-[40px] flex-col rounded-[10px]">
        <Image
          src="/assets/images/image-removebg.png"
          alt=""
          width="229"
          height="131"
        />
        <span className="flex flex-col gap-1">
          <h2 className="text-xl font-bold tracking-[-0.17px] leading-[1.35] text-[#002029]">
            2012 Toyota 86
          </h2>
          <h4 className="text-base font-medium tracking-[-0.17px leading-[1.38] text-[#002029]">
            Vehicle registration no :<b> 5TSN 521</b>
          </h4>
          <p className="pt-[8px] font-sofia-sans font-normal text-sm tracking-[0.56px] leading-[1.22] text-[#002029] ">
            {" "}
            8 Parts Added
          </p>
        </span>
      </div>
    </div>
  )
}

export default Build
