import { cn } from "@sglara/cn";
import React from "react";

const IconBookmarkRemove = ({ className }: { className?: string }) => {
  return (
    <svg
      width="25"
      height="24"
      viewBox="0 0 25 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className)}
    >
      <path d="M16.1787 11V17.97L11.1787 15.83L6.17871 17.97V5H12.1787V3H6.17871C5.07871 3 4.17871 3.9 4.17871 5V21L11.1787 18L18.1787 21V11H16.1787ZM20.1787 7H14.1787V5H20.1787V7Z" />
    </svg>
  );
};

export default IconBookmarkRemove;
