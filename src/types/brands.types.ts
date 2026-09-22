import { brandSchema } from "@/utils/validationSchema";
import z from "zod";
import { Model } from "./models.types";

export interface Brand {
  id: number;
  name: string;
  logo?: MediaData | string;
  image?: MediaData | string;
  logoUrl?: string | null;
  description?: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
  builds?: Build[];
  models?: Model[];
  _count?: {
    builds: number;
  };
}

export interface Build {
  id: number;
  brandId: number;
  modelId: number;
  typeId: number;
  userId: number;
  licensePlate?: string;
  vinNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}
export interface BrandApiResponse {
  success: boolean;
  data?: Brand | Brand[];
  pagination?: PaginationInfo;
  error?: string;
  message?: string;
}
export interface SortConfig {
  field: keyof Brand | "buildsCount";
  direction: "asc" | "desc";
}
export type BrandFormData = z.infer<typeof brandSchema>;

export interface MediaData {
  id?: number | null;
  url: string;
  type?: string | null;
  alt?: string | null;
}
