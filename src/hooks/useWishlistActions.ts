/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useSelector } from "react-redux";
import { RootState } from "@/libs/redux/store";
import { useCallback, useEffect, useMemo, useState } from "react";
import { wishlistService } from "@/services/wishlist.service";
import toast from "react-hot-toast";
import {
  EXCLUDED_NOTE_TYPE,
  RemoveOperation,
  WishlistApiRes,
  WishlistCategoryWithImage,
  WishlistCategoryWithItems,
  WishlistOperation,
} from "@/types/wishlist.types";
import { useApiRequest } from "./useApiRequest";
import { useTheme } from "@/providers/ThemeProvider";

export const useWishlistActions = (userId?: number) => {
  const currentUser = useSelector((state: RootState) => state.user?.user);

  const [wishlistCategoryLoading, setWishlistCategoryLoading] = useState(false);
  const [wishlistCategories, setWishlistCategories] =
    useState<WishlistCategoryWithItems>();
  useEffect(() => {
    if (userId) {
      fetchWishlistCategoriesByUser({ userId });
    }
    if (currentUser) {
      fetchWishlistCategoriesByUser({ userId: currentUser?.user.id });
    }
  }, [userId, currentUser]);

  const createWishlistCategory = async ({
    name,
    description,
    imageMediaId,
  }: {
    name: string;
    description?: string;
    imageMediaId: number;
  }) => {
    try {
      setWishlistCategoryLoading(true);
      const response = await wishlistService.createWishlistCategory({
        userId: Number(currentUser?.user.id),
        name,
        description,
        imageMediaId,
      });
      await fetchWishlistCategoriesByUser({});
      // Optional: Update local state after creation
      return response;
    } catch (error) {
      toast.error("Failed to create category");
      console.error(error);
    } finally {
      setWishlistCategoryLoading(false);
    }
  };

  // ✅ Get All Categories
  const fetchWishlistCategoriesByUser = async ({
    userId,
    page,
    limit,
    search,
    sortBy,
    sortOrder,
  }: {
    userId?: number;
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) => {
    try {
      setWishlistCategoryLoading(true);
      const response = await wishlistService.getWishlistCategoriesByUser({
        userId: userId || Number(currentUser?.user.id),
        limit,
        page,
        search,
        sortBy,
        sortOrder,
      });

      setWishlistCategories(response || []);
      return response;
    } catch (error) {
      toast.error("Failed to fetch categories");
      console.error(error);
    } finally {
      setWishlistCategoryLoading(false);
    }
  };

  // const updateWishlistCategory = async (
  //   categoryId: number,
  //   data: { name?: string; description?: string; imageMediaId?: number }
  // ) => {
  //   try {
  //     setWishlistCategoryLoading(true);
  //     setWishlistError(null);

  //     const response = await wishlistService.updateWishlistCategory(
  //       categoryId,
  //       data
  //     );

  //     // update local state
  //     setWishlistCategories((prev) =>
  //       prev.map((cat) => (cat.id === categoryId ? { ...cat, ...response } : cat))
  //     );

  //     return response;
  //   } catch (error: any) {
  //     setWishlistError(error?.message || "Failed to update category");
  //     console.error(error);
  //   } finally {
  //     setWishlistCategoryLoading(false);
  //   }
  // };

  // const deleteWishlistCategory = async (categoryId: number) => {
  //   try {
  //     setWishlistCategoryLoading(true);
  //     setWishlistError(null);

  //     await wishlistService.deleteWishlistCategory(categoryId);

  //     // update local state
  //     setWishlistCategories((prev) =>
  //       prev.filter((cat) => cat.id !== categoryId)
  //     );

  //     return true;
  //   } catch (error) {
  //     setWishlistError(error?.message || "Failed to delete category");
  //     console.error(error);
  //   } finally {
  //     setWishlistCategoryLoading(false);
  //   }
  // };

  return {
    wishlistCategoryLoading,
    wishlistCategories,
    createWishlistCategory,
    fetchWishlistCategoriesByUser,
    // updateWishlistCategory,
    // deleteWishlistCategory,
  };
};

export const useWishlistOperations = () => {
  const { wishlistItems, checkCategories, getAllWishlistItems } = useTheme();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const {
    request: addRequest,
    loading: addLoading,
    success: addSuccess,
    error: addError,
  } = useApiRequest();

  const {
    request: removeRequest,
    loading: removeLoading,
    success: removeSuccess,
    error: removeError,
  } = useApiRequest();

  const addToFolder = useCallback(
    async ({ categoryId, index }: WishlistOperation) => {
      if (!wishlistItems.entityId || !wishlistItems.entityType) return;

      try {
        setActiveIndex(index);
        await addRequest({
          url: `/api/wishlist/items`,
          options: {
            method: "POST",
            body: {
              userId: wishlistItems.userId,
              entityId: wishlistItems.entityId,
              entityType: wishlistItems.entityType,
              categoryId,
              partId:
                wishlistItems.entityType === "part"
                  ? wishlistItems.entityId
                  : undefined,
              listingId:
                wishlistItems.entityType === "listing"
                  ? wishlistItems.entityId
                  : undefined,
              buildId:
                wishlistItems.entityType === "build"
                  ? wishlistItems.entityId
                  : undefined,
              bookmarkedUserId:
                wishlistItems.entityType === "user"
                  ? wishlistItems.entityId
                  : undefined,
            },
          },
        });
      } catch (error) {
        console.error("Failed to add to folder:", error);
      } finally {
        setActiveIndex(null);
      }
    },
    [wishlistItems, addRequest]
  );

  const removeFromFolder = useCallback(
    async ({ index, itemId }: RemoveOperation) => {
      if (!wishlistItems.entityId || !wishlistItems.entityType) return;

      try {
        setActiveIndex(index);
        await removeRequest({
          url: `/api/wishlist/items/${itemId}`,
          options: {
            method: "DELETE",
          },
        });
      } catch (error) {
        console.error("Failed to remove from folder:", error);
      } finally {
        setActiveIndex(null);
      }
    },
    [wishlistItems, removeRequest]
  );

  // Handle success states
  useEffect(() => {
    if (addSuccess || removeSuccess) {
      checkCategories({
        entityType: wishlistItems.entityType,
        entityId: wishlistItems.entityId,
      });
      getAllWishlistItems();
    }
  }, [
    addSuccess,
    removeSuccess,
    wishlistItems.entityType,
    wishlistItems.entityId,
  ]);

  return {
    addToFolder,
    removeFromFolder,
    addLoading,
    removeLoading,
    activeIndex,
    addError,
    removeError,
  };
};

export const useInfiniteWishlist = (wishlistFolders: WishlistApiRes) => {
  const [wishlistItemsMap, setWishlistItemsMap] = useState(
    new Map<number, WishlistCategoryWithImage>()
  );

  // Convert map to array for rendering, memoized
  const wishlistItems = useMemo(
    () =>
      Array.from(wishlistItemsMap.values()).filter(
        (item) => item.note !== EXCLUDED_NOTE_TYPE
      ),
    [wishlistItemsMap]
  );

  useEffect(() => {
    if (!wishlistFolders.items?.length) return;

    const currentPage = wishlistFolders.pagination?.page || 1;

    setWishlistItemsMap((prevMap) => {
      if (currentPage === 1) {
        // First page - reset with new items
        const newMap = new Map();
        if (wishlistFolders.items)
          wishlistFolders.items.forEach((item: WishlistCategoryWithImage) => {
            newMap.set(item.id, item);
          });
        return newMap;
      } else {
        // Subsequent pages - add only new items
        const newMap = new Map(prevMap);
        if (wishlistFolders.items)
          wishlistFolders.items.forEach((item: WishlistCategoryWithImage) => {
            if (!newMap.has(item.id)) {
              newMap.set(item.id, item);
            }
          });
        return newMap;
      }
    });
  }, [wishlistFolders]);

  // Reset when component unmounts or modal closes
  const resetWishlist = useCallback(() => {
    setWishlistItemsMap(new Map());
  }, []);

  return { wishlistItems, resetWishlist };
};
