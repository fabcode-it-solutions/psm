import toast from "react-hot-toast";
import type { ApiResponse } from "../types/parts.types";
import { MetafieldDefinition } from "@/types/metafield.types";

export const metafieldsService = {
  getMetafieldDefinitions: async (
    entityType: string = "part",
    categoryIds?: number[]
  ): Promise<MetafieldDefinition[]> => {
    try {
      const response = await fetch(
        `/api/metafields/definitions?entityType=${entityType}&categoryIds=${JSON.stringify(
          categoryIds
        )}`
      );
      const result: ApiResponse<MetafieldDefinition[]> = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Failed to fetch metafield definitions"
        );
      }

      return result.data || [];
    } catch (error) {
      console.error("Error fetching metafield definitions:", error);
      return [];
    }
  },
  delete: async (id: number) => {
    try {
      const response = await fetch(`/api/metafields/definitions/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data?.message);
      }
      return data;
    } catch (error) {
      toast.error("Failed to delete metafields definitions");
      throw new Error(
        "Failed to delete metafields definitions" + JSON.stringify(error)
      );
    }
  },
};
