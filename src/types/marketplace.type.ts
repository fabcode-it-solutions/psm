import { FiltersType } from "@/types";
import { Pagination } from "./types.types";
import { SearchResponsePart } from "@/app/api/search/route";
type OptionsFilter = {
  optionId: number;
  value: string;
};
type MetafieldsFilter = {
  definitionId: number;
  value: string;
};

export interface FilterItems {
  userId?: number;
  brandId?: number[];
  manufacturerId?: number[];
  slug: string;
  priceMin?: number;
  priceMax?: number;
  listed?: string[];
  sortBy?: string;
  optionsFilter?: OptionsFilter[];
  metafieldsFilter?: MetafieldsFilter[];
}

export type MarketPlaceProps = {
  slug: string;
  filters?: FiltersType;
};
export interface MarketPlaceResult {
  success: boolean;
  pagination: Pagination;
  parts: SearchResponsePart[];
}

export type SortOption = {
  value: string;
  label: string;
};
