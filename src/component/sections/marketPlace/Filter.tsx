/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import React, { useState, useMemo, useCallback } from "react";
import HeadingSlideButtons from "@/component/global/HeadingSlideButtons";
import PriceRangeSlider from "./PriceRangeSlider";
import FilterCheckbox from "./FilterCheckbox";
import Accordion from "./Accordion";
import { FilterItems } from "@/types/marketplace.type";

interface FilterItem {
  id?: number;
  name: string;
  count: string;
  definitionId?: number;
  optionId?: number;
  value?: string | boolean | number;
  values?: string[] | number[];
  type?: string;
}

export interface FiltersType {
  brandResult?: FilterItem[];
  manufacturersResult?: FilterItem[];
  listedData?: FilterItem[];
  meta?: FilterItem[];
  optionsData?: FilterItem[];
  priceRange?: {
    min: string;
    max: string;
  }[];
}

interface FilterProps {
  filters?: FiltersType;
}

const groupLabels: Record<string, string> = {
  brandResult: "Car Brand",
  manufacturersResult: "Manufacturer",
  listedData: "Listed",
  meta: "Condition",
};

const Filter: React.FC<FilterProps> = ({ filters }) => {
  if (!filters) return null;

  const filterGroups = useMemo(
    () =>
      Object.entries(filters).filter(
        ([, items]) => Array.isArray(items) && items.length > 0
      ),
    [filters]
  );

  const [selected, setSelected] = useState<FilterItems>({ slug: "" });
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    filterGroups.reduce((acc, [key, items]) => {
      if (key === "meta" || key === "optionsData") {
        (items as FilterItem[]).forEach((item) => {
          acc[`${key}-${item.name}`] = true;
        });
      } else {
        acc[key] = true;
      }
      return acc;
    }, {} as Record<string, boolean>)
  );

  const toggleGroup = useCallback((groupKey: string) => {
    setOpenGroups((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }));
  }, []);

  const handleReset = useCallback(
    () =>
      setSelected({
        slug: "",
      }),
    []
  );
  const toggleSelected = (
    prev: typeof selected,
    key: string,
    item: FilterItem,
    val?: string | number
  ) => {
    if (key === "brandResult") {
      const arr = prev.brandId || [];
      return {
        ...prev,
        brandId: arr.includes(item.id!)
          ? arr.filter((id) => id !== item.id!)
          : [...arr, item.id!],
      };
    }

    if (key === "manufacturersResult") {
      const arr = prev.manufacturerId || [];
      return {
        ...prev,
        manufacturerId: arr.includes(item.id!)
          ? arr.filter((id) => id !== item.id!)
          : [...arr, item.id!],
      };
    }

    if (key === "listedData") {
      const arr = prev.listed || [];
      return {
        ...prev,
        listed: arr.includes(item.name as string)
          ? arr.filter((n) => n !== item.name)
          : [...arr, item.name as string],
      };
    }

    if (key.startsWith("meta-") && val && item.definitionId !== undefined) {
      const arr = prev.metafieldsFilter || [];
      return {
        ...prev,
        metafieldsFilter: arr.find((s) => s.value === val)
          ? arr.filter((s) => s.value !== val)
          : [...arr, { definitionId: item.definitionId, value: val as string }],
      };
    }

    if (key.startsWith("optionsData-") && val && item.optionId !== undefined) {
      const arr = prev.optionsFilter || [];
      return {
        ...prev,
        optionsFilter: arr.find((s) => s.value === val)
          ? arr.filter((s) => s.value !== val)
          : [...arr, { optionId: item.optionId, value: val as string }],
      };
    }

    return prev;
  };

  const renderItems = useCallback(
    (key: string, items: FilterItem[]) => (
      <div className="flex flex-col pt-5 gap-3">
        {items.map((item) => {
          if (item.values?.length) {
            return (
              <div key={`${key}-${item.name}`}>
                {item.values.map((val) => (
                  <FilterCheckbox
                    key={`${key}-${val}`}
                    id={`${key}-${val}`}
                    label={String(val)}
                    count={item.count}
                    checked={
                      (key.startsWith("meta-")
                        ? selected.metafieldsFilter?.some(
                            (s) => s.value === val
                          )
                        : key.startsWith("optionsData-")
                        ? selected.optionsFilter?.some((s) => s.value === val)
                        : false) || false
                    }
                    onChange={() =>
                      setSelected((prev) =>
                        toggleSelected(prev, key, item, val)
                      )
                    }
                  />
                ))}
              </div>
            );
          }

          return (
            <FilterCheckbox
              key={`${key}-${item.id ?? item.name}`}
              id={`${key}-${item.name}`}
              label={item.name}
              count={item.count}
              checked={
                (key === "brandResult"
                  ? selected.brandId?.includes(item.id!)
                  : key === "manufacturersResult"
                  ? selected.manufacturerId?.includes(item.id!)
                  : key === "listedData"
                  ? selected.listed?.includes(item.name as string)
                  : false) || false
              }
              onChange={() =>
                setSelected((prev) => toggleSelected(prev, key, item))
              }
            />
          );
        })}
      </div>
    ),
    [selected]
  );

  return (
    <div className="pt-12 max-tab-sm:w-full max-tab-lg:pt-7">
      <div className="flex justify-between mb-2 max-w-[361px] mx-auto w-full px-[30px] max-tab-lg:px-4 max-tab-md:flex-col">
        <HeadingSlideButtons
          heading="Filter By"
          isButtons={false}
          hideRightSide
        />
        <h4
          className="text-sm font-bold text-accent-100 cursor-pointer"
          onClick={handleReset}
        >
          Reset Filter
        </h4>
      </div>

      <div className="max-w-[352px] w-full mx-auto px-[30px] max-tab-lg:px-4">
        {filterGroups.map(([groupKey, items]) =>
          groupKey === "meta" || groupKey === "optionsData"
            ? (items as FilterItem[]).map((item) => (
                <Accordion
                  key={`${groupKey}-${item.name}`}
                  id={`${groupKey}-${item.name}`}
                  label={item.name}
                  open={openGroups[`${groupKey}-${item.name}`]}
                  onToggle={() => toggleGroup(`${groupKey}-${item.name}`)}
                >
                  {renderItems(`${groupKey}-${item.name}`, [item])}
                </Accordion>
              ))
            : groupKey != "priceRange" &&
              groupKey != "breadcrumb" && (
                <Accordion
                  key={groupKey}
                  id={groupKey}
                  label={groupLabels[groupKey] ?? groupKey}
                  open={openGroups[groupKey]}
                  onToggle={() => toggleGroup(groupKey)}
                >
                  {renderItems(groupKey, items as FilterItem[])}
                </Accordion>
              )
        )}
        <Accordion
          key={"priceRange"}
          id={"priceRange"}
          label={groupLabels["listingPrice"] ?? "Listing Price"}
          open={openGroups["priceRange"]}
          onToggle={() => toggleGroup("priceRange")}
        >
          <PriceRangeSlider
            defaultValue={[
              0,
              filters?.priceRange
                ? parseFloat(filters?.priceRange[0]?.max)
                : 4000,
            ]}
            max={
              filters?.priceRange
                ? parseFloat(filters?.priceRange[0]?.max)
                : 4000
            }
          />
        </Accordion>
      </div>
    </div>
  );
};

export default React.memo(Filter);
