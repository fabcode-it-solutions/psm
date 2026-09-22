import { ButtonType } from "@/types";
import React from "react";
const Button = ({
  className,
  children,
  onClick,
  type,
  classNameInner,
}: ButtonType) => {
  return (
    <div className="flex  ">
      <button
        onClick={onClick}
        type={type}
        className={`transform -skew-x-[14deg] max-tab-sm:min-w-[320px]  cursor-pointer text-white  bg-accent-100 hover:bg-accent-100/70 transition-all duration-300 min-w-[400px]  py-[14px]  flex justify-center items-center ${
          className || ""
        }`}
      >
        <span
          className={`block transform skew-x-[14deg] text-center text-base font-bold leading-[24px] tracking-[0.2px] font-supreme ${
            classNameInner || ""
          }`}
        >
          {children || "Sign Up"}
        </span>
      </button>
    </div>
  );
};
export default Button;
