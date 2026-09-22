import { ModelType } from "./build";

// Base interfaces
export interface MediaFile {
  id: number;
  url: string;
  type: string;
  alt?: string;
}

export interface Model {
  id: number;
  name: string;
}

export interface Build {
  id: number;
  createdAt: string;
  licensePlate?: string;
  vinNumber?: string;
}

// Type interfaces
export interface TypeBase {
  id: number;
  name: string;
  modelId: number;
  description?: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
  imageMediaId?: MediaFile | null;
  image?: MediaFile | null;
  model: ModelType;
  builds?: Build[];
  _count?: { builds: number };
}

export interface TypeWithModel extends TypeBase {
  model: Model;
}

export interface TypeWithBuilds extends TypeWithModel {
  builds: Build[];
  _count: {
    builds: number;
  };
}

export interface TypeWithCounts extends TypeWithModel {
  _count: {
    builds: number;
  };
}

// Union type for all Type variations
export type Type = TypeBase | TypeWithModel | TypeWithBuilds | TypeWithCounts;

// Form data interface
export interface TypeFormData {
  name: string;
  modelId: number;
  description?: string;
  status: "active" | "inactive";
  image?: number;
}

// API Response interface
export interface TypeApiResponse {
  success: boolean;
  data?: Type | Type[];
  error?: string;
  message?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Query parameters interface
export interface QueryParams {
  id?: string;
  page?: string;
  limit?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  includeBuilds?: string;
  modelId?: string;
}

// Sort configuration
export interface SortConfig {
  field: keyof Type | "buildsCount";
  direction: "asc" | "desc";
}
export type Pagination = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
};

// Pagination response
export interface PaginationResponse<T> {
  data: T[];
  pagination: Pagination;
  success: boolean;
}
