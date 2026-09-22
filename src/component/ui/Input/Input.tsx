import React, { ReactNode } from "react";
import { InputFieldProps } from "@/types";

interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    Omit<InputFieldProps, "value"> {
  value?: React.InputHTMLAttributes<HTMLInputElement>["value"];
  leftIcon?: ReactNode;
  onLeftIconClick?: () => void;
  rightIcon?: ReactNode;
  onRightIconClick?: () => void;
  error?: boolean;
  errorMessage?: string;
}

const InputField = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      type = "text",
      placeholder,
      className,
      value,
      onChange,
      leftIcon,
      onLeftIconClick,
      rightIcon,
      onRightIconClick,
      error = false,
      errorMessage,
      ...rest
    },
    ref
  ) => {
    return (
      <div className="relative ">
        {leftIcon && (
          <span
            className="absolute top-[18px] left-[16px] cursor-pointer "
            onClick={onLeftIconClick}
          >
            {leftIcon}
          </span>
        )}

        <input
          ref={ref}
          type={type}
          placeholder={placeholder || "Enter text"}
          value={value}
          onChange={onChange}
          className={`${
            className || ""
          }  min-w-[400px] max-tab-sm:!min-w-full border-[1.5px] text-[#002029] py-[18.5px] pl-[16px] pr-[80px] bg-white text-sm leading-[1.3] font-medium rounded-md focus:outline-none focus:ring-1
            ${
              error
                ? "border-red-500 focus:ring-red-500"
                : "border-[#E8E8E866] focus:ring-accent-100"
            }`}
          {...rest} // <-- Pass react-hook-form props
        />

        {rightIcon && (
          <span
            className="absolute top-[18px] right-[16px] cursor-pointer"
            onClick={onRightIconClick}
          >
            {rightIcon}
          </span>
        )}

        {error && errorMessage && (
          <div className="flex items-center gap-2 mt-3">
            <span className="w-[10px] h-[10px] rounded-full bg-[#EB5757]" />
            <p className="text-red-500 text-xs">{errorMessage}</p>
          </div>
        )}
      </div>
    );
  }
);

InputField.displayName = "InputField";
export default InputField;
