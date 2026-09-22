import { Media } from ".";
import { Brand } from "./brands.types";
import { TypeFormData } from "./types.types";

export interface Model {
  id: number;
  name: string;
  description?: string | null;
  status: "active" | "inactive";
  brandId: number;
  imageMediaId?: number;
  createdAt: string;
  updatedAt: string;

  // Relations
  brand?: Brand;
  image?: Media;
  imageUrl?: string;
  types?: ModelType[];
  builds?: Build[];
  variants?: ModelType[];
  // Counts
  _count?: {
    builds?: number;
    types?: number;
  };
}

export interface ModelType {
  id: number;
  name: string;
  description?: string;
  status: "active" | "inactive";
  modelId: number;
  imageMediaId?: number;
  createdAt: string;
  updatedAt: string;

  // Relations
  model?: Model;
  image?: Media;
  imageUrl?: string;
  builds?: Build[];

  // Counts
  _count?: {
    builds?: number;
  };
}

export interface Build {
  id: number;
  licensePlate?: string;
  vinNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ModelFormData {
  name: string;
  description?: string;
  status: "active" | "inactive";
  brandId?: number;
  image?: number;
  variants?: TypeFormData[];
}

export interface ModelTypeFormData {
  name: string;
  description?: string;
  status: "active" | "inactive";
  modelId?: number;
  image?: number;
}

export interface ModelApiResponse {
  success: boolean;
  data: Model | Model[];
  error?: string;
  message?: string;
  pagination?: {
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ModelTypeApiResponse {
  success: boolean;
  data: ModelType | ModelType[];
  error?: string;
  message?: string;
  pagination?: {
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface SortConfig {
  field: keyof Model | "buildsCount";
  direction: "asc" | "desc";
}
export type ModelEntry = {
  id: number;
  name: string;
  description: string | null;
  status: "active" | "inactive";
  createdAt: Date | null;
  updatedAt: Date | null;
  brand: {
    id: number;
    name: string | null;
  };
  image: {
    id?: number;
    url?: string;
    type?: string;
    alt?: string;
  };
  builds: Build[];
  _count: { builds: number };
};
