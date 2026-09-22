import React from "react";
import * as Checkbox from "@radix-ui/react-checkbox";
import { CheckIcon } from "@radix-ui/react-icons";
const FilterCheckbox: React.FC<{
  id: string;
  label: string;
  count: string;
  checked: boolean;
  onChange: () => void;
}> = ({ id, label, count, checked, onChange }) => (
  <div className="flex justify-between items-center cursor-pointer mb-1">
    <label htmlFor={id} className="flex items-center gap-2 cursor-pointer">
      <Checkbox.Root
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        className={`w-[14px] h-[14px] flex items-center justify-center bg-white border rounded-sm transition-colors duration-200 
          ${checked ? "border-[#212121]" : "bg-white border-gray-300"}`}
      >
        <Checkbox.Indicator className="flex items-center justify-center w-full h-full">
          <CheckIcon className="w-4 h-4 text-black" />
        </Checkbox.Indicator>
      </Checkbox.Root>

      <p className="text-[#002029] text-base font-sofia-sans capitalize tracking-[0.64px]">
        {label}
      </p>
    </label>

    <p className="text-[#CDD2C8] text-base font-sofia-sans">({count})</p>
  </div>
);

export default React.memo(FilterCheckbox);
