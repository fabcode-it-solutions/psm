import { getSlug } from "@/utils/getSlug";
import { handleRevalidate } from "@/utils/handleRevalidate";
import toast from "react-hot-toast";

export const wishlistService = {
  createWishlistCategory: async ({
    userId,
    name,
    description,
    imageMediaId,
  }: {
    userId: number;
    name: string;
    description?: string;
    imageMediaId: number;
  }) => {
    const toastId = toast.loading("Creating wishlist category...");
    try {
      const slug = getSlug(name);
      const categories = await fetch(`/api/wishlist/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          name,
          description,
          imageMediaId,
          slug,
        }),
        next: {
          tags: ["wishlist"],
        },
      });
      const result = await categories.json();
      console.log(result);
      if (result?.success) {
        toast.success(result?.message);
      }
      if (result?.error) {
        toast.error(result?.error);
      }
      return result;
    } catch (error) {
      console.log("Error Creating Wishlist:", error);
      return {
        message: "Error Creating Wishlist",
        statusCode: 500,
      };
    } finally {
      toast.dismiss(toastId);
      handleRevalidate("profile");
    }
  },
  getWishlistCategoriesByUser: async ({
    userId,
    page = 1,
    limit = 10,
    search = "",
    sortBy = "createdAt",
    sortOrder = "desc",
  }: {
    userId: number;
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) => {
    try {
      const query = new URLSearchParams({
        userId: String(userId),
        page: String(page),
        limit: String(limit),
        search,
        sortBy,
        sortOrder,
      }).toString();

      const res = await fetch(`/api/wishlist/categories?${query}`, {
        method: "GET",
        next: { tags: ["wishlist"] },
      });
      return await res.json();
    } catch (error) {
      console.error("Error fetching wishlist categories:", error);
      return { error: "Failed to fetch wishlist categories" };
    }
  },
  getAllWishlistCategories: async ({
    page = 1,
    limit = 10,
    search = "",
    sortBy = "createdAt",
    sortOrder = "desc",
  }: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) => {
    try {
      const query = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        search,
        sortBy,
        sortOrder,
      }).toString();

      const res = await fetch(`/api/wishlist/categories/all?${query}`, {
        method: "GET",
        next: { tags: ["wishlist"] },
      });

      return await res.json();
    } catch (error) {
      console.error("Error fetching all wishlist categories:", error);
      return { error: "Failed to fetch all wishlist categories" };
    }
  },
  getWishlistCategory: async ({ categorySlug }: { categorySlug: string }) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_PATH}/wishlist/categories/${categorySlug}`,
        {
          method: "GET",
          next: { tags: ["wishlist-category", `wishlist-${categorySlug}`] },
        }
      );
      return await res.json();
    } catch (error) {
      console.error("Error fetching wishlist categories:", error);
      return { error: "Failed to fetch wishlist categories" };
    }
  },
};
