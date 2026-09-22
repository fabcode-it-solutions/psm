/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import IconDismissCircle from "@/assets/icons/IconDismissCircle";
import InputField from "@/component/ui/Input/Input";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/libs/redux/store";
import { Build, setBuild } from "@/libs/redux/slices/buildSlice";
import { Tooltip } from "@/component/ui/Tooltip/Tooltip";

interface LicenseNumberProps {
  label?: string;
  placeholder?: string;
  tooltipText?: string;
  tooltipLabel?: string;
  type: keyof Build;
}

const LicenseNumber: React.FC<LicenseNumberProps> = ({
  label = "Licence Plate Number",
  placeholder = "Enter plate number",
  tooltipLabel = "Can’t find your Licence Plate number?",
  tooltipText,
  type,
}) => {
  const [plateNumber, setPlateNumber] = useState<Partial<Build>>({});
  const build = useSelector((state: RootState) => state.build.build);
  const dispatch = useDispatch();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };
  useEffect(() => {
    const builds = {
      ...build,
      [type]: plateNumber[type],
    };
    dispatch(setBuild(builds));
  }, [plateNumber]);
      
  return (
    <form onSubmit={handleSubmit} className="max-w-[400px] w-full mx-auto">
      <div className="flex flex-col justify-between">
        <div className="flex flex-col gap-[8px]  w-full">
          <label className="text-sm leading-[16px] font-medium text-[#606060]">
            {label}
          </label>
          <InputField
            placeholder={placeholder}
            value={(plateNumber[type] as string) || (build?.[type] as string) || ''}
            onChange={(e) =>
              setPlateNumber((prev) => ({
                ...prev,
                [type]: e.target.value,
              }))
            }
            rightIcon={plateNumber ? <IconDismissCircle /> : undefined}
            onRightIconClick={() =>
              setPlateNumber((prev) => ({
                ...prev,
                [type]: "",
              }))
            }
            className="text-[#002029]"
          />
        </div>
        {tooltipText && (
          <span className="pt-[16px] flex gap-[9px]">
            <Tooltip content={tooltipText} label={tooltipLabel} />
          </span>
        )}
      </div>
    </form>
  );
};

export default LicenseNumber;
