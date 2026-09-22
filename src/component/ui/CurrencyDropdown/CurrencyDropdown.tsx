import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useEffect, useState, memo } from "react";
import Flag from "react-world-flags";
import clsx from "clsx";
import { CountryData, countryList } from "@/utils/countrydata";
import IconArrowDropdown from "@/assets/icons/IconArrowDropdown";

const CountryDropdown = () => {
  const [selected, setSelected] = useState("US");
  const [open, setOpen] = useState(false);

  const selectedCountry = countryList.find((c) => c.code === selected);
  const MemoizedFlag = memo(Flag);

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>
        <button
          className={clsx(
            "inline-flex items-center gap-[16px] text-white cursor-pointer ",
            " border-transparent focus:outline-none focus:ring-0 focus:border-none active:border-none"
          )}
        >
          {selectedCountry ? (
            <div className="flex items-center gap-[16px]">
              <MemoizedFlag
                code={selectedCountry.code}
                className="w-[24px] h-[24px] rounded-full object-cover"
              />
              <span className="text-base tracking-[0.64px] opacity-[0.72] text-[#FFFFFF] leading-[1.375]">
                {selectedCountry.currencySymbol}
                {selectedCountry.currencyCode}
              </span>
            </div>
          ) : (
            "Select"
          )}
          <IconArrowDropdown fill="#FFFFFF" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={5}
          align="start"
          className="bg-amber-50 text-[#002029] rounded shadow-amber-50 overflow-auto z-50 max-h-[300px] p-2 w-[300px]"
        >
          {countryList.map((country: CountryData) => (
            <DropdownMenu.Item
              key={country.code}
              onSelect={() => {
                setSelected(country.code);
                setOpen(false);
              }}
              className={clsx(
                "cursor-pointer px-4 py-2 rounded hover:bg-white/10 flex items-center gap-3 text-sm",
                selected === country.code && "bg-white/10"
              )}
            >
              <MemoizedFlag
                code={country.code}
                style={{ width: 20, height: 14 }}
              />
              <span className="flex-1">{country.name}</span>
              <span>
                {country.currencySymbol} {country.currencyCode}
              </span>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default CountryDropdown;
