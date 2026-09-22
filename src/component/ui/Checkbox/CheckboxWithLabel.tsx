import React, { useCallback } from "react";
import * as Checkbox from "@radix-ui/react-checkbox";

type CheckboxWithLabelProps = {
  label: string;
  name?: string;
  checked?: boolean;
  onChecked?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  id?: string;
};

const CheckboxWithLabel = ({
  checked,
  label,
  name,
  onChecked,
  id,
}: CheckboxWithLabelProps) => {
  const [check, setCheck] = React.useState(checked || false);

  const handleChange = useCallback(
    (checked: boolean | "indeterminate") => {
      const value = checked === true;
      setCheck(value);

      if (onChecked) {
        const event = {
          target: {
            name,
            type: "checkbox",
            checked: value,
            value,
          },
        } as unknown as React.ChangeEvent<HTMLInputElement>;

        onChecked(event);
      }
    },
    [onChecked, name]
  );

  return (
    <div className="text-sm text-light-100 font-sofia-sans flex items-center gap-4 cursor-pointer">
      <input
        type="checkbox"
        name={name}
        checked={check}
        onChange={() => handleChange(!check)}
        style={{ display: "none" }}
        id={id}
      />
      <label
        htmlFor={id}
        className={`w-4 h-4 flex items-center justify-center  rounded 
            ${
              check
                ? "bg-accent-100 border-accent-100"
                : " bg-gray-5/10 border border-gray-5/20"
            }
            `}
      >
        {check && <div className="text-dark-100 absolute">✓</div>}
      </label>
      <label htmlFor={id} className="cursor-pointer">
        {label}
      </label>
    </div>
  );
};

export default CheckboxWithLabel;
