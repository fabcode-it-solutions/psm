/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useMemo, useRef } from "react";
import { useApiRequest } from "@/hooks/useApiRequest";
import { Category, CategoryService } from "@/services/categoryService";
import { CategoryFilters } from "@/component/admin/categories/CategoriesFilters";

interface CategoriesResponse {
  success: boolean;
  data?: Category[];
  rootCount: number;
  subCount: number;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface UseCategoriesOptions {
  autoFetch?: boolean;
}

export function useCategories(
  options: UseCategoriesOptions = { autoFetch: true }
) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<{
    rootCount: number;
    subCount: number;
  }>({ rootCount: 0, subCount: 0 });
  const [paginationState, setPaginationState] = useState<
    CategoriesResponse["pagination"]
  >({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<CategoryFilters>({});

  const { request, loading } = useApiRequest<CategoriesResponse>();
  const [listError, setListError] = useState<string | null>(null);
  const fetchSeqRef = useRef(0);

  const fetchCategories = async ({ search }: { search?: string }) => {
    const seq = ++fetchSeqRef.current;
    try {
      const response = await request({
        url: `/api/admin/categories?page=${paginationState?.page || 1}&limit=20&sortBy=updatedAt&sortOrder=desc&includeChildren=true&search=${search || ''}`,
        options: { method: "GET" },
      });

      if (seq !== fetchSeqRef.current) return;

      setListError(null);
      if (response?.data) {
        setCategories(response.data);
      }
      if (response?.pagination) {
        setPaginationState(response.pagination);
      }
      setStats({
        rootCount: response?.rootCount || 0,
        subCount: response?.subCount || 0,
      });
    } catch (error) {
      if (seq !== fetchSeqRef.current) return;
      console.error("Failed to fetch categories:", error);
      setListError(
        error instanceof Error ? error.message : "Failed to fetch categories"
      );
    }
  };

  const applyLocalToggleActive = (categoryId: number, isActive: boolean) => {
    setCategories((prev) =>
      prev.map((c) =>
        c.id === categoryId
          ? { ...c, isActive, updatedAt: new Date().toISOString() }
          : c
      )
    );
  };

  const applyLocalDelete = (categoryId: number) => {
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    setPaginationState((prev) => prev ? { ...prev, total: prev.total - 1 } : prev);
  };

  // Initial load
  useEffect(() => {
    if (options.autoFetch) {
      fetchCategories({});
    }
  }, [options.autoFetch]);

  // Filter and search categories
  const filteredCategories = useMemo(() => {
    let result = [...categories];

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (category) =>
          category.name.toLowerCase().includes(query) ||
          category.slug.toLowerCase().includes(query) ||
          (category.description &&
            category.description.toLowerCase().includes(query))
      );
    }

    // Apply filters
    if (filters.parentId !== undefined) {
      if (filters.parentId === 0) {
        result = result.filter((category) => !category.parentId);
      } else {
        result = result.filter(
          (category) => category.parentId === filters.parentId
        );
      }
    }

    if (filters.isCustom !== undefined) {
      result = result.filter(
        (category) => category.isCustom === filters.isCustom
      );
    }

    if (filters.dateRange && filters.dateRange !== "all") {
      const now = new Date();
      const filterDate = new Date();

      switch (filters.dateRange) {
        case "today":
          filterDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          filterDate.setDate(now.getDate() - 7);
          break;
        case "month":
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case "year":
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      result = result.filter(
        (category) => new Date(category.createdAt) >= filterDate
      );
    }

    // Apply sorting
    const sortBy = filters.sortBy || "name";
    const sortOrder = filters.sortOrder || "asc";

    result.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [categories, searchQuery, filters]);

  // Helper functions
  const createCategory = async (
    data: Parameters<typeof CategoryService.createCategory>[0]
  ) => {
    try {
      const result = await CategoryService.createCategory(data);
      if (result.success) {
        await fetchCategories({});
      }
      return result;
    } catch (error) {
      throw error;
    }
  };

  const updateCategory = async (
    data: Parameters<typeof CategoryService.updateCategory>[0]
  ) => {
    try {
      const result = await CategoryService.updateCategory(data);
      if (result.success) {
        await fetchCategories({});
      }
      return result;
    } catch (error) {
      throw error;
    }
  };

  const deleteCategory = async (categoryId: number) => {
    try {
      const result = await CategoryService.deleteCategory(categoryId);
      if (result.success) {
        await fetchCategories({});
      }
      return result;
    } catch (error) {
      throw error;
    }
  };

  const clearFilters = () => {
    setFilters({});
  };

  const getCategoryById = (id: number) => {
    return categories.find((category) => category.id === id);
  };

  const getRootCategories = () => {
    return categories.filter((category) => !category.parentId);
  };

  const getSubCategories = (parentId: number) => {
    return categories.filter((category) => category.parentId === parentId);
  };

  const getCategoryHierarchy = () => {
    const rootCategories = getRootCategories();
    return rootCategories.map((root) => ({
      ...root,
      children: getSubCategories(root.id),
    }));
  };

  return {
    // Data
    categories,
    filteredCategories,
    searchQuery,
    filters,
    paginationState,
    stats,
    // State
    loading,
    error: listError,
    // Actions
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    setSearchQuery,
    setFilters,
    clearFilters,
    applyLocalToggleActive,
    applyLocalDelete,

    // Helpers
    getCategoryById,
    getRootCategories,
    getSubCategories,
    getCategoryHierarchy,
    setPaginationState,
  };
}
