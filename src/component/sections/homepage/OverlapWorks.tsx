import React from "react";
import Button from "@/component/ui/Button/Button";
import Link from "next/link";

const OverlapWorks = () => {
  const steps = [
    {
      title: "Sell on Overlap",
      description:
        "Got parts that just Don't suit your taste and need to upgrade? Sell what you have, buy what you want and repeat.",
      buttonText: "Post a new listing",
       link: "#", 
    },
    {
      title: "Hunt Down your Grail",
      description:
        "Need that one part to complete your build? Find it here from sellers who share your passion.",
      buttonText: "Search listings",
       link: "#", 
    },
    {
      title: "The Finish Line",
      description:
        "Track your shipment, bolt on that beauty, and enjoy the fruits of your labour. Time to turn some heads!",
      buttonText: "Buy Something",
       link: "#", 
    },
  ];

  return (
    <div className=" bg-white py-25">
     
      <div className="flex justify-center items-center">
        <h2 className="text-3xl text-dark-blue-cm font-bold text-center max-w-150 font-supreme">
          Buy, Sell, Mod, Repeat - How Overlap Works
        </h2>
      </div>
      <div className="flex justify-center items-center mt-3">
        <p className="text-gray-3 font-supreme">
          Help users decide what to do next. Some examples below.
        </p>
      </div>

     
      <div className="flex flex-col lg:flex-row justify-center mt-6 px-5 space-y-6 lg:space-y-0 lg:gap-4">
        {steps.map((step, index) => (
          <div
            key={index}
            className="flex flex-col justify-center items-center gap-3 lg:max-w-xs text-center"
          >
            <h3 className="text-xl font-bold text-dark-blue-cm font-supreme">
              {step.title}
            </h3>
            <p className="text-gray-3 font-supreme">{step.description}</p>
             <Link href={step.link}>
             <Button
              className=" bg-accent-100 text-white  !min-w-[233px] !leading-[1.43] tracking-[0.1px] !py-[11px] font-bold font-supreme !text-xs "
            >
              {step.buttonText}
            </Button>
            </Link>
            
          </div>
        ))}
      </div>
    </div>
  );
};

export default OverlapWorks;
