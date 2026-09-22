import { Drawer } from "@/component/global/Drawer";
import Dropdown from "@/component/ui/dashboard/Dropdown";
import { partsService } from "@/services/part.service";
import {
  statusOptions,
  priceRangeOptions,
  inventoryStatusOptions,
  dateRangeOptions,
} from "@/utils/defaults";
import { Filter } from "lucide-react";
import React, { useEffect, useState } from "react";

interface Filters {
  search: string;
  status: string;
  category: string;
  inventoryStatus: string;
  dateRange: string;
}
export interface CategoryFilters {
  parentId?: number;
  isCustom?: boolean;
  dateRange?: 'today' | 'week' | 'month' | 'year' | 'all';
  sortBy?: 'name' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}
const CategoriesFilters = ({
  onChangeFilter,
}: {
  onChangeFilter?: (filters: Filters) => void;
}) => {
  const [categoryOptions, setCategoryOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    status: "",
    category: "",
    inventoryStatus: "",
    dateRange: "",
  });
  const getCategoryOptions = async () => {
    try {
      const result = await partsService.getCategories();
      const r = result.map((item) => {
        return {
          value: String(item.id),
          label: item.parentCategory
            ? `${item.name} - ${item.parentCategory.name}`
            : item.name,
        };
      });
      setCategoryOptions(r);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getCategoryOptions();
  }, []);
  const handleFilterChange = (field: keyof Filters) => (value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };
  const clearFilters = () => {
    setFilters({
      search: "",
      status: "",
      category: "",
      inventoryStatus: "",
      dateRange: "",
    });
    if (onChangeFilter) {
      onChangeFilter(filters);
    }
  };
  const applyFilters = () => {
    if (filters && onChangeFilter) {
      onChangeFilter(filters);
      setShowFilters(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => setShowFilters(!showFilters)}
        className={`flex items-center gap-2 min-h-[42px] px-3 py-2 rounded-lg border transition-colors font-sofia-sans ${
          showFilters || Object.values(filters).some((v) => v !== "")
            ? "border-accent-100 text-accent-100 bg-accent-100/10"
            : "border-gray-5/20 text-gray-4 hover:text-light-100"
        }`}
      >
        <Filter className="w-4 h-4" />
        {Object.values(filters).filter((v) => v !== "").length > 0 && (
          <span className="ml-1 px-1.5 py-0.5 bg-accent-100 text-dark-100 rounded text-xs">
            {Object.values(filters).filter((v) => v !== "").length}
          </span>
        )}
      </button>
      <Drawer
        open={showFilters}
        onOpenChange={setShowFilters}
        side="right"
        title="Filter"
      >
        <div className="grid gap-4">
          <Dropdown
            label="Status"
            options={statusOptions}
            onValueChange={handleFilterChange("status")}
            placeholder="All Status"
            selectedText={filters.status}
          />

          <Dropdown
            label="Category"
            options={categoryOptions}
            onValueChange={handleFilterChange("category")}
            placeholder="By Parent"
            selectedText={filters.category}
          />

       
          <Dropdown
            label="Date Range"
            options={dateRangeOptions}
            onValueChange={handleFilterChange("dateRange")}
            placeholder="All Dates"
            selectedText={filters.dateRange}
          />

          <div className="flex items-end">
            <button
              type="button"
              onClick={applyFilters}
              className="w-full px-4 py-2 border bg-accent-100 border-gray-5/20 rounded-lg text-dark-blue-cm transition-all duration-200 hover:text-light-100 hover:bg-gray-5/10 font-sofia-sans"
            >
              Apply Filters
            </button>
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={clearFilters}
              className="w-full px-4 py-2 border border-gray-5/50 rounded-lg text-gray-4 hover:text-light-100 hover:bg-gray-5/10 font-sofia-sans transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export default CategoriesFilters;
