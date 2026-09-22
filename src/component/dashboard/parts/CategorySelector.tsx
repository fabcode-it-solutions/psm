/**
 * Category Selector Component
 *
 * Features:
 * - Infinite scroll for categories
 * - Debounced search
 * - Multi-select support
 * - Dialog popup integration
 * - Loading states
 * - Empty states
 *
 * @component CategorySelector
 * @version 1.0.0
 */

"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import DialogPopup from "@/component/ui/dashboard/DialogPopup";
import DashboardButton from "@/component/ui/dashboard/DashboardButton";
import * as Checkbox from "@radix-ui/react-checkbox";
import { Search, X, ChevronRight, Loader2 } from "lucide-react";
import { MetafieldDefinitionCategory } from "@/types/metafield.types";

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parentId?: number;
  parentCategory?: {
    id: number;
    name: string;
    slug: string;
  };
}

interface CategorySelectorProps {
  selectedCategories: number[];
  onSelectionChange: (categoryIds: number[]) => void;
  maxSelection?: number;
  required?: boolean;
  label?: string;
  placeholder?: string;
  multiSelect?: boolean;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategories,
  onSelectionChange,
  maxSelection,
  required = false,
  label = "Categories",
  placeholder = "Select categories...",
  multiSelect = true,
}) => {
  console.log(selectedCategories);
  // State management
  const [showDialog, setShowDialog] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce search input
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
      setCategories([]);
      setHasMore(true);
    }, 500); // 500ms debounce

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchTerm]);

  // Fetch categories
  const fetchCategories = useCallback(
    async (pageNum: number, search: string) => {
      if (!hasMore && pageNum > 1) return;

      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: pageNum.toString(),
          limit: "20",
          ...(search && { search }),
        });

        const response = await fetch(`/api/admin/categories?${params}`);
        const data = await response.json();

        if (data.success) {
          const newCategories = data.data || [];

          setCategories((prev) =>
            pageNum === 1 ? newCategories : [...prev, ...newCategories]
          );

          // Check if there are more pages
          const totalPages = data.pagination?.totalPages || 1;
          setHasMore(pageNum < totalPages);
        } else {
          setError(data.error || "Failed to fetch categories");
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to load categories");
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    },
    [hasMore]
  );

  // Load categories when dialog opens or search changes
  useEffect(() => {
    if (showDialog) {
      fetchCategories(page, debouncedSearch);
    }
  }, [showDialog, page, debouncedSearch, fetchCategories]);

  // Infinite scroll observer
  useEffect(() => {
    if (!showDialog || !loadMoreRef.current) return;

    const options = {
      root: null,
      rootMargin: "100px",
      threshold: 0.1,
    };

    observerRef.current = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && !loading && hasMore) {
        setPage((prev) => prev + 1);
      }
    }, options);

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [showDialog, loading, hasMore]);

  // Toggle category selection
  const toggleCategory = (categoryId: number) => {
    if (!multiSelect) {
      onSelectionChange([categoryId]);
      setShowDialog(false);
      return;
    }

    const isSelected = selectedCategories.includes(categoryId);

    if (isSelected) {
      onSelectionChange(selectedCategories.filter((id) => id !== categoryId));
    } else {
      if (maxSelection && selectedCategories.length >= maxSelection) {
        alert(`You can only select up to ${maxSelection} categories`);
        return;
      }
      onSelectionChange([...selectedCategories, categoryId]);
    }
  };

  // Get selected category names
  const getSelectedCategoryNames = () => {
    if (selectedCategories.length === 0) return placeholder;

    // Fetch selected categories to show names
    const selectedNames = categories
      .filter((cat) => selectedCategories.includes(cat.id))
      .map((cat) => cat.name);

    if (selectedNames.length === 0) {
      return `${selectedCategories.length} selected`;
    }

    if (selectedNames.length <= 2) {
      return selectedNames.join(", ");
    }

    return `${selectedNames[0]}, ${selectedNames[1]} +${
      selectedNames.length - 2
    } more`;
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm("");
  };

  // Clear all selections
  const clearSelections = () => {
    onSelectionChange([]);
  };

  return (
    <div className="space-y-2">
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-light-100 font-sofia-sans">
          {label}
          {required && <span className="text-accent-100 ml-1">*</span>}
        </label>
      )}

      {/* Selected Categories Display */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowDialog(true)}
          className="w-full px-4 py-2.5 bg-gray-5/10 border border-gray-5/20 rounded-lg text-left text-light-100 hover:border-gray-5/40 focus:ring-1 focus:ring-accent-100 focus:border-transparent transition-all font-sofia-sans"
        >
          <div className="flex items-center justify-between">
            <span
              className={selectedCategories.length === 0 ? "text-gray-4" : ""}
            >
              {getSelectedCategoryNames()}
            </span>
            <ChevronRight className="w-4 h-4 text-gray-4" />
          </div>
        </button>

        {selectedCategories.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {categories
              .filter((cat) => selectedCategories.includes(cat.id))
              .map((category) => (
                <span
                  key={category.id}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-accent-100/20 text-accent-100 rounded text-xs font-sofia-sans"
                >
                  {category.name}
                  <button
                    type="button"
                    onClick={() => toggleCategory(category.id)}
                    className="hover:bg-accent-100/30 rounded p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            {selectedCategories.length > 0 && (
              <button
                type="button"
                onClick={clearSelections}
                className="text-xs text-gray-4 hover:text-light-100 underline font-sofia-sans"
              >
                Clear all
              </button>
            )}
          </div>
        )}
      </div>

      {/* Dialog Popup */}
      <DialogPopup
        heading="Select Categories"
        open={showDialog}
        setShowCreateModal={setShowDialog}
      >
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-4 w-4 h-4" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-gray-5/10 border border-gray-5/20 rounded-lg text-light-100 placeholder-gray-4 focus:ring-1 focus:ring-accent-100 focus:border-transparent font-sofia-sans"
              autoFocus
            />
            {searchTerm && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-4 hover:text-light-100"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Info Banner */}
          <div className="flex items-center justify-between text-xs text-gray-4 font-sofia-sans">
            <span>
              {selectedCategories.length > 0 && (
                <>
                  {selectedCategories.length} selected
                  {maxSelection && ` (max ${maxSelection})`}
                </>
              )}
            </span>
            {selectedCategories.length > 0 && (
              <button
                type="button"
                onClick={clearSelections}
                className="text-accent-100 hover:underline"
              >
                Clear all
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {categories
              .filter((cat) => selectedCategories.includes(cat.id))
              .map((category) => (
                <span
                  key={category.id}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-accent-100/20 text-accent-100 rounded text-xs font-sofia-sans"
                >
                  {category.name}
                  <button
                    type="button"
                    onClick={() => toggleCategory(category.id)}
                    className="hover:bg-accent-100/30 rounded p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
          </div>
          {/* Categories List */}
          <div className="max-h-96 overflow-y-auto space-y-1">
            {/* Initial Loading */}
            {initialLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-accent-100 animate-spin" />
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-12">
                <p className="text-sm text-red-400 font-sofia-sans">{error}</p>
                <button
                  type="button"
                  onClick={() => fetchCategories(1, debouncedSearch)}
                  className="mt-2 text-xs text-accent-100 hover:underline font-sofia-sans"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Empty State */}
            {!initialLoading && !error && categories.length === 0 && (
              <div className="text-center py-12">
                <p className="text-sm text-gray-4 font-sofia-sans">
                  {searchTerm
                    ? "No categories found"
                    : "No categories available"}
                </p>
              </div>
            )}

            {/* Categories */}
            {!initialLoading &&
              !error &&
              categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-start space-x-3 p-3 hover:bg-gray-5/10 rounded-lg transition-colors cursor-pointer group"
                  onClick={() => toggleCategory(category.id)}
                >
                  <Checkbox.Root
                    checked={selectedCategories.includes(category.id)}
                    onCheckedChange={() => toggleCategory(category.id)}
                    className="w-4 h-4 mt-0.5 bg-gray-5/10 flex items-center justify-center border border-gray-5/20 rounded data-[state=checked]:bg-accent-100 data-[state=checked]:border-accent-100 flex-shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Checkbox.Indicator className="text-dark-100 text-xs flex items-center justify-center absolute">
                      ✓
                    </Checkbox.Indicator>
                  </Checkbox.Root>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-light-100 font-sofia-sans group-hover:text-accent-100 transition-colors">
                        {category.name}
                      </span>
                      {category.parentCategory && (
                        <span className="text-xs text-gray-4 font-sofia-sans">
                          in {category.parentCategory.name}
                        </span>
                      )}
                    </div>
                    {category.description && (
                      <p className="text-xs text-gray-4 font-sofia-sans mt-0.5 line-clamp-1">
                        {category.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}

            {/* Infinite Scroll Trigger */}
            {!initialLoading && hasMore && (
              <div ref={loadMoreRef} className="py-4">
                {loading && (
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-accent-100 animate-spin" />
                    <span className="ml-2 text-sm text-gray-4 font-sofia-sans">
                      Loading more...
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* End of List */}
            {!initialLoading && !hasMore && categories.length > 0 && (
              <p className="text-center text-xs text-gray-4 py-4 font-sofia-sans">
                No more categories
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-5/20">
            <button
              type="button"
              onClick={() => setShowDialog(false)}
              className="px-4 py-2 text-gray-4 hover:text-light-100 transition-colors font-sofia-sans"
            >
              Cancel
            </button>
            <DashboardButton
              buttonText={`Apply ${
                selectedCategories.length > 0
                  ? `(${selectedCategories.length})`
                  : ""
              }`}
              onClick={() => setShowDialog(false)}
            />
          </div>
        </div>
      </DialogPopup>
    </div>
  );
};

export default CategorySelector;
