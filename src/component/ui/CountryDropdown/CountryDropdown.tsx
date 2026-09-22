import React, { useEffect, useMemo, useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as countryCodes from "country-codes-list";
import Flag from "react-world-flags";
import IconChevron from "@/assets/icons/IconChevron";
import Spinner from "../loader/Spinner";

export default function CountryDropdown({
  onSelect,
}: {
  onSelect: (phoneCode: string) => void;
}) {
  const getIp = async () => {
    await fetch("https://ipapi.co/json/")
      .then(function (response) {
        response.json().then((jsonData) => {
          if (jsonData.country_code) {
            setSelected(jsonData.country_code);
          }
        });
      })
      .catch(function (error) {
        console.log(error);
      });
  };
  const [selected, setSelected] = useState<string | null>("UM");
  const [countries, setCountries] = useState<
    { phoneCode: string; name: string; code: string }[]
  >([]);
  const [search, setSearch] = useState<string>("");
  const filteredOptions = countries.filter((opt) =>
    opt.name.toLowerCase().includes(search.toLowerCase())
  );
  useEffect(() => {
    const cs = countryCodes.customList(
      "countryCallingCode",
      "{countryNameEn} __{countryCode}"
    );
    const codes = Object.keys(cs);
    const country: React.SetStateAction<
      { phoneCode: string; name: string; code: string }[]
    > = [];
    codes.map((phoneCode) => {
      const [name, code] = cs[phoneCode].split(" __");
      country.push({ phoneCode, name, code });
    });

    country.sort((a, b) => a.name.localeCompare(b.name));
    setCountries(country);
    getIp();
  }, []);

  const selectedCountry = useMemo(() => {
    return selected ? countries.find((c) => c.code === selected) : null;
  }, [selected]);
  const MemoizedFlag = React.memo(Flag);

  return (
   selectedCountry ?  <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="flex items-center gap-1 bg-transparent cursor-pointer outline-none  text-sm">
          {selectedCountry ? (
            <>
              <Flag
                code={selectedCountry.code}
                className="w-6 h-4 object-cover"
                alt={selectedCountry.name}
              />
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3.20041 5.73966C3.48226 5.43613 3.95681 5.41856 4.26034 5.70041L8 9.22652L11.7397 5.70041C12.0432 5.41856 12.5177 5.43613 12.7996 5.73966C13.0815 6.0432 13.0639 6.51775 12.7603 6.7996L8.51034 10.7996C8.22258 11.0668 7.77743 11.0668 7.48967 10.7996L3.23966 6.7996C2.93613 6.51775 2.91856 6.0432 3.20041 5.73966Z"
                  fill="#212121"
                />
              </svg>
            </>
          ) : (
            <span>Select Country</span>
          )}
          <IconChevron />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={5}
          className="bg-white  shadow-md rounded-md p-2 max-h-[300px] overflow-auto w-[300px] z-9999"
        >
          <div className="p-2 border-b border-gray-5/20">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full px-2 py-1 text-sm rounded text-dark-blue-cm bg-light-300 outline-none"
            />
          </div>
          {filteredOptions.map((country) => (
            <DropdownMenu.Item
              key={country.code}
              onSelect={() => {
                setSelected(country.code);
                onSelect(country.phoneCode);
              }}
              className={`flex items-center gap-2 p-2 rounded hover:bg-gray-100 cursor-pointer text-sm ${
                selectedCountry?.code === country.code ? "bg-gray-200" : ""
              }`}
            >
              <MemoizedFlag
                code={country.code}
                style={{ width: 24, height: 16, objectFit: "cover" }}
                alt={country.name}
              />
              {country.name}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root> : <div className=""><Spinner className="w-6 h-6" /></div>
  );
}
