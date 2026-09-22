import { AnchorType } from "@/types";
import Link from "next/link";
import React from "react";

const Anchor = ({ className, href, children,onClick }: AnchorType) => {
  return (
    <div className="flex  ">
      <Link
        href={href}
        onClick={onClick}
        className={`transform -skew-x-[14deg] max-tab-sm:min-w-[320px] hover:bg-accent-100/70 transition-all duration-300 text-center text-base font-bold leading-[24px] tracking-[0.2px] font-supreme cursor-pointer text-white  bg-accent-100 min-w-[400px]  py-[14px]  flex justify-center items-center ${className || ""}`}
      >
        <span className="block transform skew-x-[14deg] ">
          {children || "Sign Up"}
        </span>
      </Link>
    </div>
  );
};
export default Anchor;
