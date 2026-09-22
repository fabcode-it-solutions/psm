/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */

"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Category } from "@/services/categoryService";
import { useCategories } from "@/hooks/useCategories";
import { CategoriesTable } from "@/component/admin/categories/CategoriesTable";
import { CategoryFormModal } from "@/component/admin/categories/CategoryFormModal";
import { CategoriesStats } from "@/component/admin/categories/CategoriesStats";
import Pagination from "@/component/ui/dashboard/Pagination";
import { Plus, Search } from "lucide-react";
import PageHeader from "@/component/dashboard/PageHeader";
import { FormField } from "@/component/ui/dashboard/FormField";
import Dropdown from "@/component/ui/dashboard/Dropdown";

interface Filters {
  search: string;
  status: string;
  category: string;
  inventoryStatus: string;
  dateRange: string;
}

export const statusOptions = [
  { value: "normal", label: "Normal" },
  { value: "a-z", label: "A-Z" },
  { value: "z-a", label: "Z-A" },
  { value: "parent", label: "Parent" },
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
];

export default function CategoriesPage() {
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    category?: Category;
  }>({
    isOpen: false,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const {
    categories,
    loading,
    error,
    fetchCategories,
    paginationState,
    stats,
    setPaginationState,
    applyLocalToggleActive,
    applyLocalDelete,
  } = useCategories();

  const handleCreateNew = () => {
    setModalState({
      isOpen: true,
      category: undefined,
    });
  };

  const handleEdit = (category: Category) => {
    setModalState({
      isOpen: true,
      category,
    });
  };

  const handleModalClose = () => {
    setModalState({
      isOpen: false,
      category: undefined,
    });
  };

  const handleModalSuccess = () => {
    fetchCategories({});
  };
  const [filters, setFilters] = useState<Filters>({
    search: "",
    status: "",
    category: "",
    inventoryStatus: "",
    dateRange: "",
  });


  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (value: string) => {
    setFilters((prev) => ({ ...prev, status: value }));
  };

  const filteredCategories = useMemo(() => {
    let result = [...categories];

    switch (filters.status) {
      case "a-z":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "z-a":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "parent":
        result = result.filter((cat) => !cat.parentId);
        break;
      case "newest":
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      default:
        break;
    }

    return result;
  }, [categories, filters.status]);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setFilters((prev) => ({ ...prev, search: searchTerm }));

      if (paginationState) {
        setPaginationState({
          page: 1,
          limit: paginationState.limit,
          total: paginationState.total,
          totalPages: paginationState.totalPages,
          hasNext: paginationState.hasNext,
          hasPrev: paginationState.hasPrev,
        });
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchTerm]);
  useEffect(() => {
    fetchCategories({ search: filters.search });
  }, [paginationState?.page, filters.search]);

  return (
    <div className="space-y-6">
      <PageHeader
        heading="Categories Management"
        describe="Manage your parts categories and hierarchy"
        button={
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 px-4 py-2 bg-accent-100 text-dark-100 rounded-lg hover:bg-accent-100/90 transition-colors font-sofia-sans font-medium"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Category</span>
            <span className="sm:hidden">Add</span>
          </button>
        }
      />
      {/* Search and Filter Bar */}
      {/* <div className="bg-dark-100 border border-gray-5/20 rounded-lg p-4"> */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-4 w-4 h-4" />
              <FormField
                type="text"
                placeholder="Search parts by name or SKU..."
                value={searchTerm}
                onChange={handleSearchChange}
                name="search"
                inputStyle="pl-10"
              />
             

            </div>
          </div>
           <Dropdown
            options={statusOptions}
            onValueChange={handleFilterChange}
            placeholder="Reorder"
            selectedText={filters.status}
          />
        </div>
      {/* </div> */}
      <CategoriesStats
        total={paginationState?.total}
        categories={categories}
        loading={loading}
        stats={stats}
      />
      <div className="bg-dark-100 border border-gray-5/20 rounded-lg overflow-hidden">
        {/* Table */}
        <CategoriesTable
          onEdit={handleEdit}
          onRefresh={handleModalSuccess}
          onLocalToggleActive={(id, isActive) => applyLocalToggleActive(id, isActive)}
          onLocalDelete={(id) => applyLocalDelete(id)}
          categories={filteredCategories}
          loading={loading}
        />
        {paginationState && (
          <Pagination
            currentPage={paginationState?.page}
            hasNext={paginationState?.hasNext}
            hasPrev={paginationState?.hasPrev}
            itemsPerPage={20}
            setCurrentPage={(e) =>
              setPaginationState({
                page: e,
                limit: paginationState.limit,
                total: paginationState.total,
                totalPages: paginationState.totalPages,
                hasNext: paginationState.hasNext,
                hasPrev: paginationState.hasPrev,
              })
            }
            totalItems={paginationState?.total}
            totalPages={paginationState?.totalPages}
          />
        )}
      </div>

      {/* Modals */}
      <CategoryFormModal
        isOpen={modalState.isOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        category={modalState.category}
        categories={categories}
      />

      {/* Error Display */}
      {/* {error && (
        <div className="fixed bottom-4 right-4 bg-red-500/10 border border-red-500/20 rounded-lg p-4 max-w-md z-50">
          <p className="text-red-500 text-sm font-sofia-sans">{error}</p>
        </div>
      )} */}
    </div>
  );
}
