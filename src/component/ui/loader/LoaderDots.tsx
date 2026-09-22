import { cn } from "@sglara/cn";
import React from "react";

const LoaderDots = ({ className }: { className?: string }) => {
  return (
    <div className="flex gap-2 justify-center items-center">
      <div
        className={cn(
          "h-1 w-1 bg-dark-blue-cm rounded-full animate-bounce [animation-delay:-0.3s]",
          className
        )}
      ></div>
      <div
        className={cn(
          "h-1 w-1 bg-dark-blue-cm rounded-full animate-bounce [animation-delay:-0.15s]",
          className
        )}
      ></div>
      <div
        className={cn(
          "h-1 w-1 bg-dark-blue-cm rounded-full animate-bounce",
          className
        )}
      ></div>
    </div>
  );
};

export default LoaderDots;
