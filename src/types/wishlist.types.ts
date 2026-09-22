import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
  wishlistCategories,
  wishlistItems,
  wishlistPriceAlerts,
} from "@/db/schema/wishlist";

export const PAGINATION_LIMIT = 14;
export const EXCLUDED_NOTE_TYPE = "all";
export const BUTTON_BASE_CLASSES =
  "py-2 px-4 font-medium rounded-[20px] text-accent-100 text-base tracking-[-0.17px] leading-[1.35] bg-[#002029] hover:bg-dark-blue-cm/80 transition-all duration-300";


// Inferred types from schema
export type WishlistCategory = InferSelectModel<typeof wishlistCategories>;
export type NewWishlistCategory = InferInsertModel<typeof wishlistCategories>;
export type WishlistItem = InferSelectModel<typeof wishlistItems>;
export type NewWishlistItem = InferInsertModel<typeof wishlistItems>;
export type WishlistPriceAlert = InferSelectModel<typeof wishlistPriceAlerts>;
export type NewWishlistPriceAlert = InferInsertModel<
  typeof wishlistPriceAlerts
>;
export interface WishlistCategoryWithImage {
  id: number;
  userId: number;
  name: string;
  slug: string;
  description: string | null;
  imageMediaId: number | null;
  isDefault: boolean;
  isPublic: boolean;
  note?: string;
  sortOrder: number;
  itemCount: number | string; // if your API sometimes returns string
  seo?: number | null;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  image?: {
    url: string | null;
    alt: string | null;
  };
}

// API response types
export interface WishlistCategoryWithItems extends WishlistCategory {
  items?: WishlistCategoryWithImage[] | WishlistItemWithDetails[];
  allItemCount?: number;
  pagination?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface WishlistItemWithDetails extends WishlistItem {
  part?: {
    id: number;
    title: string;
    slug: string;
    isWishlisted: boolean;
    media?: {
      id: number;
      alt: string;
      url: string;
    }[];
    manufacturer?:
      | {
          id: number;
          alt: string;
          logo: string;
          name: string;
          status: string;
          subTitle: string;
        }[]
      | null;
  };
  listing?: number; // Replace with your Listing type
  build?: number; // Replace with your Build type
  alerts?: WishlistPriceAlert[];
  itemCount?: number;
  slug?: string;
  note?: string;
  name?: string;
  image?: {
    url: string | null;
    alt: string | null;
  };
}

export interface WishlistApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface WishlistApiRes {
  all?:WishlistCategoryWithImage,
  success?: boolean;
  items?: WishlistCategoryWithImage[];
  error?: string;
  message?: string;
  allItemCount?: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}



export interface WishlistOperation {
  categoryId: number;
  index: number;
}

export interface RemoveOperation {
  index: number;
  itemId: number;
}

export interface WishlistItemProps {
  item: WishlistCategoryWithImage;
  index: number;
  includeItem: {itemId:number};
  onAdd: (operation: WishlistOperation) => void;
  onRemove: (operation: RemoveOperation) => void;
  isAddLoading: boolean;
  isRemoveLoading: boolean;
  activeIndex: number | null;
}