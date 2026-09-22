import {
  uniqueNamesGenerator,
  Config,
  names,
  adjectives,
} from "unique-names-generator";

import React, { useState } from "react";
import IconDismissCircle from "@/assets/icons/IconDismissCircle";
import InputField from "@/component/ui/Input/Input";
import ToggleButton from "@/component/ui/Toogle/Toogle";
import { Tooltip } from "@/component/ui/Tooltip/Tooltip";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/libs/redux/store";
import {
  Build,
  removeBuildField,
  setBuild,
} from "@/libs/redux/slices/buildSlice";

const UserProfile = ({
  tooltipLabel = "Can’t find your Licence Plate number?",
  tooltipText,
}: {
  tooltipText?: string;
  tooltipLabel?: string;
}) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
  });
  const build = useSelector((state: RootState) => state.build.build);
  const dispatch = useDispatch();
  const handleChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
      const b = {
        ...build,
        [field]: e.target.value,
      };
      dispatch(setBuild(b));
    };
  const handleClear = (field: string) => () => {
    setFormData((prev) => ({
      ...prev,
      [field]: "",
    }));
    dispatch(removeBuildField(field as keyof Build));
  };

  const onPressedChange = (pressed: boolean) => {
    const config: Config = {
      dictionaries: [names, adjectives],
    };

    const characterName: string = uniqueNamesGenerator(config);
    const b = {
      ...build,
      anonymous: pressed,
      anonymousName: characterName,
    };
    dispatch(setBuild(b));  
    
  };
  return (
    <form className="pt-[94px] flex flex-col max-w-[400px] w-full mx-auto relative max-tab-sm:pt-[30px]">
      <div className="flex gap-[16px] max-tab-sm:flex-wrap">
        <div className="flex flex-col gap-[8px]  w-full">
          <label className="text-sm leading-[16px] font-medium text-[#606060]">
            First Name
          </label>
          <InputField
            placeholder="First Name"
            value={formData.firstName || build?.firstName || ''}
            onChange={handleChange("firstName")}
            rightIcon={formData.firstName ? <IconDismissCircle /> : undefined}
            onRightIconClick={handleClear("firstName")}
            className="text-[#002029] !min-w-[192px] !py-[18.5px] !px-[16px] border-[1.5px]"
          />
        </div>

        <div className="flex flex-col gap-[8px]  w-full ">
          <label className="text-sm leading-[16px] font-medium text-[#606060]">
            Last Name
          </label>
          <InputField
            placeholder="Last Name"
            value={formData.lastName || build?.lastName || ''}
            onChange={handleChange("lastName")}
            rightIcon={formData.lastName ? <IconDismissCircle /> : undefined}
            onRightIconClick={handleClear("lastName")}
            className="text-[#002029] !min-w-[192px] !py-[18.5px] !px-[16px] border-[1.5px]"
          />
        </div>
      </div>

      <div className="pt-[18px] flex gap-[9px] justify-between">
        {tooltipText && (
          <span className="flex gap-[9px]">
            <Tooltip content={tooltipText} label={tooltipLabel} />
          </span>
        )}
        <ToggleButton onPressedChange={onPressedChange} pressed={build?.anonymous || false} />
      </div>
    </form>
  );
};

export default UserProfile;
