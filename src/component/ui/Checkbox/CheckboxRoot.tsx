import React from "react";
import * as Checkbox from "@radix-ui/react-checkbox";

type CheckboxRootProps = {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
};
const CheckboxRoot = ({ checked, onCheckedChange }: CheckboxRootProps) => {
  return (
    <Checkbox.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      className="w-4 h-4 flex items-center justify-center bg-gray-5/10 border border-gray-5/20 rounded data-[state=checked]:bg-accent-100 data-[state=checked]:border-accent-100"
    >
      <Checkbox.Indicator className="text-dark-100 absolute">
        ✓
      </Checkbox.Indicator>
    </Checkbox.Root>
  );
};

export default CheckboxRoot;
