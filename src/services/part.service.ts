import { Parts } from "@/libs/redux/slices/partsSlice";
import type {
  CreatePartResponse,
  PartCategory,
  ApiResponse,
} from "../types/parts.types";

export const partsService = {
  createPart: async (data: Parts): Promise<CreatePartResponse> => {
    try {
      const response = await fetch("/api/parts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create part");
      }

      return result;
    } catch (error) {
      console.error("Error creating part:", error);
      throw error;
    }
  },

  getCategories: async (): Promise<PartCategory[]> => {
    try {
      const response = await fetch(
        "/api/admin/categories?includeChildren=false"
      );
      const result: ApiResponse<PartCategory[]> = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch categories");
      }

      return result.data || [];
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  },
  getPartsAdmin: async ({
    currentPage,
    itemsPerPage,
    searchTerm,
    status,
    inventoryStatus,
    categoryId,
    dateRange,
    sortBy,     
  sortOrder,
  }: {
    currentPage?: number;
    itemsPerPage?: number;
    searchTerm?: string;
    status?: string;
    inventoryStatus?: string;
    categoryId?: number;
    dateRange?: string;
      sortBy?: string;         
  sortOrder?: "asc" | "desc";  
  }) => {
    try {
      const params = new URLSearchParams();
      if (currentPage) {
        params.append("page", String(currentPage));
      }
      if (itemsPerPage) {
        params.append("limit", String(itemsPerPage));
      }
      if (status) {
        params.append("status", status);
      }
      if (inventoryStatus) {
        params.append("inventoryStatus", inventoryStatus);
      }
      if (dateRange) {
        params.append("dateRange", dateRange);
      }
      if (categoryId) {
        params.append("categoryId", String(categoryId));
      }
       if (sortBy) params.append("sortBy", sortBy);
  if (sortOrder) params.append("sortOrder", sortOrder);

      if (searchTerm) params.append("search", searchTerm);
      const response = await fetch(`/api/parts/admin?${params.toString()}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch categories");
      }

      return result || [];
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  },
};
