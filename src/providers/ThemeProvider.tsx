/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import LoaderDots from "@/component/ui/loader/LoaderDots";
import { usePathname } from "next/navigation";

import { RootState } from "@/libs/redux/store";
import {
  WishlistApiRes,
  WishlistCategoryWithImage,
  WishlistItem,
} from "@/types/wishlist.types";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { useSelector } from "react-redux";

type Theme = "light" | "dark";
export type WishlistItems = {
  entityId: number;
  userId?: number;
  entityType: string;
  added?: boolean;
};
interface ThemeContextType {
  wishlistItem: WishlistCategoryWithImage[];
  theme: Theme;
  wishlistFolders: WishlistApiRes;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  openWishlist: boolean;
  setOpenWishlist: (open: boolean) => void;
  fetchData: ({
    page,
    limit,
  }: {
    page?: number;
    limit?: number;
  }) => Promise<void>;
  wishlistItems: WishlistItems;
  setWishlistItems: (items: WishlistItems) => void;
  includedCategories: {
    categoryId: number;
    itemId: number;
  }[];
  wishlistedItems: {
    entityId: number;
    entityType: string;
    itemId: number;
  }[];

  loader: string;
  setLoader: (value: string) => void;

  checkCategories: (params: {
    entityType: string;
    entityId: number;
  }) => Promise<void>;
  getAllWishlistItems: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
    const pathname = usePathname(); 
  const userId = useSelector((state: RootState) => state.user.user?.user.id);
  const [wishlistItem, setWishlistItem] = useState<WishlistCategoryWithImage[]>(
    []
  );
  const [theme, setThemeState] = useState<Theme>("light");
  const [openWishlist, setOpenWishlist] = useState<boolean>(false);
  const [wishlistFolders, setWishlistFolders] = useState<WishlistApiRes>({});
  const [loader, setLoader] = useState<string>(""); // loader , setloader is here
  const [includedCategories, setIncludedCategories] = useState<
    {
      categoryId: number;
      itemId: number;
    }[]
  >([]);
  const [wishlistedItems, setWishlistedItems] = useState<
    {
      entityId: number;
      entityType: string;
      itemId: number;
    }[]
  >([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItems>({
    entityType: "",
    entityId: 0,
    added: false,
  });
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };
  const getWishlistFolders = async ({
    page,
    limit,
  }: {
    page: number;
    limit: number;
  }) => {
    try {
      const response = await fetch(
        `/api/wishlist/categories?userId=${userId}&page=${page}&limit=${limit}&sortBy=createdAt&sortOrder=desc&includeItems=true`
      );
      const result = await response.json();
      return result;
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    if (wishlistFolders.items && wishlistFolders.items?.length > 0) {
      setWishlistItem((prev) => {
        const newItems = (wishlistFolders.items ?? []).filter(
          (newItem) => !prev.some((oldItem) => oldItem.slug === newItem.slug)
        );
        return [...prev, ...newItems];
      });
    }
  }, [wishlistFolders]);
  const fetchData = async ({
    page,
    limit,
  }: {
    page?: number;
    limit?: number;
  }) => {
    if (page == 0) {
      const data = await getWishlistFolders({ page: 1, limit: limit || 14 });
      setWishlistFolders(data);
      setWishlistItem(data.items);
      return;
    }
    const data = await getWishlistFolders({
      page: page || 1,
      limit: limit || 14,
    });
    setWishlistFolders(data);
  };
  const checkCategories = async ({
    entityType = "part",
    entityId,
  }: {
    entityType: string;
    entityId: number;
  }) => {
    try {
      const response = await fetch(
        `/api/wishlist/items/${entityId}?userId=${userId}&entityType=${entityType}`
      );
      const result = await response.json();
      const c = result.data.map((item: WishlistItem) => ({
        categoryId: item.categoryId,
        itemId: item.id,
      }));
      setIncludedCategories(c);
    } catch (err) {
      console.error(err);
    }
  };
  const getAllWishlistItems = async () => {
    try {
      const response = await fetch(
        `/api/wishlist/items?userId=${userId}&limit=1000&includeDetails=false`
      );
      const result = await response.json();
      const parts = result.data.map((item: WishlistItem) => ({
        itemId: item.id,
        entityType: item.entityType,
        entityId: item.entityId,
      }));
      setWishlistedItems(parts);
    } catch (err) {
      console.error(err);
    }
  };
  const value: ThemeContextType = {
    theme,
    wishlistItem,
    wishlistFolders,
    openWishlist,
    wishlistItems,
    includedCategories,
    wishlistedItems,
    toggleTheme,
    setTheme,
    fetchData,
    setOpenWishlist,
    setWishlistItems,
    checkCategories,
    getAllWishlistItems,
    loader, // loader is here
    setLoader,
  };
  useEffect(() => {
    if (userId) {
      getAllWishlistItems();
    }
  }, [userId]);
  return (
    <ThemeContext.Provider value={value}>
      {loader && (
         <div
          className={`fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-md
           ${pathname.startsWith("/dashboard") ? "bg-black/20" : "bg-white/75"}`}
        >
          <div>
            <p className="mt-2  font-bold text-accent-100 text-4xl flex gap-1">
              {loader}
            </p>
            <LoaderDots className="h-4 w-4 bg-accent-100 mt-3" />
          </div>
        </div>
      )}

      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
