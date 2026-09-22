
export interface MediaInfo {
  id: number;
  url: string;
  type: string;
  alt: string;
}

export interface Manufacturer {
  id: number;
  name: string;
  description: string | null;
  subTitle: string | null;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
  logo: MediaInfo | null;
  image: MediaInfo | null;
  logoUrl?: string; 
  imageUrl?: string; 
}

export interface ManufacturerFormData {
  name: string;
  description?: string;
  subTitle?: string;
  status: "active" | "inactive";
}

export interface ManufacturerApiResponse {
  success: boolean;
  data?: Manufacturer | Manufacturer[];
  error?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface SortConfig {
  field: keyof Manufacturer;
  direction: "asc" | "desc";
}

export interface QueryParams {
  id?: string;
  page?: string;
  limit?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}