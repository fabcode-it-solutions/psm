import { cn } from "@sglara/cn";
import React from "react";

const AutoHeading = ({
  heading,
  className,
}: {
  heading: string;
  className?: string;
}) => {
  return (
    <h2
      className={cn(
        "text-lg leading-[23px] relative z-[1] font-audiowide font-normal before:w-7 before:h-full before:bg-accent-100 before:absolute before:skew-x-[-18deg] before:left-[-6px] before:top-0 before:z-[-1]",
        className
      )}
    >
      {heading}      
    </h2>
  );
};

export default AutoHeading;
