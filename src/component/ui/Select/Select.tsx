import IconArrowDropdown from "@/assets/icons/IconArrowDropdown";
import { SortOption } from "@/types/marketplace.type";
import { getSlug } from "@/utils/getSlug";
import { Select as RSelect } from "radix-ui";
import React from "react";

const Select = ({
  options,
  label,
}: {
  options: SortOption[];
  label: string;
}) => {
  return (
    <RSelect.Root>
      <RSelect.Trigger
        className="inline-flex items-center max-h-[54px] focus:outline-none max-w-[166px]  w-full justify-between bg-[#FFFFFF] border-[1.5px] border-[#E8E8E866] rounded-[6px] font-medium font-supreme text-sm  text-[#002029]  py-[15px] px-[20px]"
        aria-label={label}
      >
        <RSelect.Value placeholder={options[0].label} />
        <RSelect.Icon>
          <IconArrowDropdown />
        </RSelect.Icon>
      </RSelect.Trigger>

      <RSelect.Portal>
        <RSelect.Content className="bg-white border border-gray-200 rounded shadow-md z-50">
          <RSelect.Viewport className="p-2">
            {options &&
              options.map((item, index) => (
                <RSelect.Item
                  key={`${getSlug(label)}-${item.value}-${index}`}
                  value={item.value}
                  className="cursor-pointer px-3 py-2 text-sm text-[#002029] hover:bg-gray-100 rounded"
                >
                  <RSelect.ItemText>{item.label}</RSelect.ItemText>
                </RSelect.Item>
              ))}
          </RSelect.Viewport>
        </RSelect.Content>
      </RSelect.Portal>
    </RSelect.Root>
  );
};

export default Select;
