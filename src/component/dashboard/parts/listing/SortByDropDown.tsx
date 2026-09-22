// File: src/component/dashboard/parts/listing/SortByDropdown.tsx

import React, { useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ArrowUpDown, Check } from "lucide-react";

export type SortOption = {
  value: string;
  label: string;
  field: string;
  order: "asc" | "desc";
};

const sortOptions: SortOption[] = [
  { value: "price-asc", label: "Price: Low to High", field: "price", order: "asc" },
  { value: "price-desc", label: "Price: High to Low", field: "price", order: "desc" },
  { value: "date-desc", label: "Date: Newest First", field: "createdAt", order: "desc" },
  { value: "date-asc", label: "Date: Oldest First", field: "createdAt", order: "asc" },
  { value: "inventory-desc", label: "Inventory: High to Low", field: "inventory", order: "desc" },
  { value: "inventory-asc", label: "Inventory: Low to High", field: "inventory", order: "asc" },
  { value: "name-asc", label: "Name: A to Z", field: "title", order: "asc" },
  { value: "name-desc", label: "Name: Z to A", field: "title", order: "desc" },
];

interface SortByDropdownProps {
  onSortChange: (sortBy: string, sortOrder: "asc" | "desc") => void;
  currentSort?: { field: string; order: "asc" | "desc" };
}

const SortByDropdown: React.FC<SortByDropdownProps> = ({
  onSortChange,
  currentSort,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const currentSortOption = sortOptions.find(
    (opt) =>
      opt.field === currentSort?.field && opt.order === currentSort?.order
  );

  const handleSortSelect = (option: SortOption) => {
    onSortChange(option.field, option.order);
    setIsOpen(false);
  };

  return (
    <DropdownMenu.Root open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenu.Trigger asChild>
        <button className="flex items-center gap-2 px-4 py-2 bg-dark-100 border border-gray-5/20 rounded-lg hover:bg-gray-5/5 transition-colors font-sofia-sans text-sm text-light-100">
          <ArrowUpDown className="w-4 h-4" />
          <span>
            {currentSortOption ? currentSortOption.label : "Sort By"}
          </span>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[220px] bg-dark-100 border border-gray-5/20 rounded-lg shadow-lg p-2 z-50"
          sideOffset={5}
          align="end"
        >
          <div className="px-2 py-1.5 text-xs font-medium text-gray-4 font-sofia-sans uppercase">
            Sort By
          </div>

          {sortOptions.map((option) => {
            const isSelected =
              option.field === currentSort?.field &&
              option.order === currentSort?.order;

            return (
              <DropdownMenu.Item
                key={option.value}
                className="flex items-center justify-between gap-2 px-3 py-2 text-sm text-light-100 hover:bg-gray-5/10 rounded cursor-pointer font-sofia-sans outline-none"
                onSelect={() => handleSortSelect(option)}
              >
                <span>{option.label}</span>
                {isSelected && (
                  <Check className="w-4 h-4 text-accent-100" />
                )}
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default SortByDropdown;