/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { users } from "@/db/schema/auth";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { MediaData } from "./brands.types";
import { media } from "@/db/schema/media";

export interface AnchorType {
  href: string;
  className?: string;
  children?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
}
export interface InputFieldProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}
export type ButtonType = {
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  classNameInner?: string;
};
type ExtraUserFields = {
  lastUsernameChanged?: {
    allowed: boolean;
    pending: Date;
  };
};
export type InsertUsers = {
  user: InferInsertModel<typeof users> & ExtraUserFields;
};
export type UserType = InferInsertModel<typeof users> & ExtraUserFields;
export type MediaType = {
  media: InferInsertModel<typeof media>;
};
export type Media = {
  id: number;
  type: "image" | "video" | "audio" | string;
  url: string;
  altText: string;
  isPublic: boolean;
  isArchived: boolean;
  displayOrder: number;
  userId: number;
  size: string;
  width: number;
  height: number;
  format: string;
  createdAt: string;
  updatedAt: string;
};
export type UploadFileType = {
  id?: number;
  alt?: string;
  url?: string;
  order?: number;
};

export interface QueryParams {
  id?: string;
  page?: string;
  limit?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  includeBuilds?: string;
  isAll?: string;
}

export interface Build {
  id: number;
  createdAt: Date | string | null;
}

export interface BrandBase {
  id: number;
  name: string;
  logo: MediaData | string | null;
  image: MediaData | string | null;
  logoUrl?: string | null;
  description: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BrandWithBuilds extends BrandBase {
  builds: Build[];
  models?: Model[];
  _count: { builds: number };
}

interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginationResponse<T> {
  data: T[];
  pagination: PaginationMeta;
  success: boolean;
}
export type ApiUser = Omit<InferSelectModel<typeof users>, "password">;

export interface GetUserResponse {
  success: boolean;
  message: string;
  user: ApiUser;
  address: {
    addressLine1: string | null;
    addressLine2: string | null;
    state: string | null;
    postalCode: string | null;
    type: string | null;
  } | null;
  builds: {
    buildId: number;
    licensePlate: string | null;
    vinNumber: string | null;
    createdAt: Date;
    brand: {
      id: number;
      name: string;
      logo: string | null;
    };
    model: {
      id: number;
      name: string;
    };
    type: {
      id: number;
      name: string;
    };
  }[];
  buildsCount: number;
  followers: number;
  following: number;

  socialMedia: {
    id: number;
    facebook?: string | null;
    instagram?: string | null;
    youtube?: string | null;
    twitter?: string | null;
    linkedIn?: string | null;
  };
  partsListed: number;
}
type Followers = {
  id: number;
  username: string | null;
  profileImage: string | null;
};
export type ApiUserLite = {
  id: number;
  username: string | null;
  profileImage: string | null;
  followersCount: number;
  buildsCounts?: number;
  listingCounts?: number;
  followers: Followers | Followers[];
};

export interface MediaInfo {
  id: number;
  url: string;
  type?: string;
  alt?: string;
}

export interface ManufacturerBase {
  id: number;
  name: string;
  description: string | null;
  subTitle: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  logo: MediaInfo | null;
  image: MediaInfo | null;
}

export interface ManufacturerWithBuilds extends ManufacturerBase {
  builds: Array<{
    id: number;
    createdAt: Date;
  }>;
  _count: {
    builds: number;
  };
}

export interface CreateManufacturerRequest {
  name: string;
  description?: string;
  subTitle?: string;
  logo?: number | null;
  image?: number | null;
  status?: "active" | "inactive";
}

export interface UpdateManufacturerRequest {
  name?: string;
  description?: string;
  subTitle?: string;
  logo?: number | null;
  image?: number | null;
  status?: "active" | "inactive";
}
export interface SelectedState {
  brandID?: number;
  modelID?: number;
  typeID?: number;
  manufacturer?: number;
  categories?: number[];
}

// Root Response
export interface PartResponse {
  data: any;
  part: Part;
  categories?: Category[];
  additionalDetails?: AdditionalDetail[];
  media?: MediaPartResponse[];
  metafields?: Metafield[];
  seo?: Seo[];
  options?: OptionPartResponse[];
  variants?: Variant[];
  breadcrumb: Breadcrumb[];
}

// Part
export interface Part {
  partId: number;
  title: string;
  slug: string;
  description: string;
  status: string;
  userId: number;
  listed: string;
  brandId: number;
  modelId: number;
  typeId: number;
  manufacturerId: number;
  createdAt: string;
  updatedAt: string;
  user: User;
  brand: Brand;
  model: Model;
  type: TypeInfo;
  manufacturer: Manufacturer;
}

export interface User {
  username: string;
  firstName: string;
  lastName: string;
  countryCode?: string;
  isBlocked: boolean;
  isSuspended?: boolean;
  isVerified?: boolean;
  flagged?: boolean;
  createdAt: string;
  lastLoginAt?: Date | string | null;
  role: string;
  reportsCount?: number;

  id: number;
  name: string;
  email: string;
}

export interface Brand {
  id: number;
  name: string;
  logo: string;
  alt: string;
}

export interface Model {
  name: string;
}

export interface TypeInfo {
  name: string;
}

export interface Manufacturer {
  id: number;
  name: string;
  description: string | null;
  subTitle: string;
  status: string;
  logo: string;
  alt: string;
}

// Categories
export interface Category {
  name: string;
  slug: string;
  id?: number;
}

// Additional Details
export interface AdditionalDetail {
  id: number;
  partId: number;
  heading: string;
  content: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

// Media
export interface MediaPartResponse {
  url: string;
  alt: string;
  order: number;
  id: number;
}

export interface Metafield {
  id: number;
  name: string;
  key: string;
  namespace: string;
  definitionId?: number;
  value: string[] | string | boolean | Date | number;
}

export interface Seo {
  id: number;
  entityType: string;
  entityId: number;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string | null;
  ogTitle: string;
  ogDescription: string;
  ogImage: string | null;
  canonicalUrl: string | null;
  robots: string | null;
  structuredData: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OptionPartResponse {
  id: number;
  name: string;
  values: {
    id: number;
    value: string;
  }[];
}

// Variants
export interface Variant {
  id: number;
  partId: number;
  title: string;
  sku: string | null;
  barcode: string | null;
  option1: string | null;
  option2: string | null;
  option3: string | null;
  option1Label: string | null;
  option2Label: string | null;
  option3Label: string | null;
  price: string;
  compareAtPrice: string | null;
  quantity: number;
  weight: number | null;
  weightUnit: string;
  requiresShipping: boolean;
  taxable: boolean;
  inventoryTracking: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

// Breadcrumb
export interface Breadcrumb {
  label?: string;
  link?: string;
  name?: string;
  slug?: string;
  id?: number;
}

interface FilterItem {
  id?: number;
  name: string;
  count: string;
  value?: string | boolean | number;
  values?: string[] | number[];
}

export interface FiltersType {
  breadcrumb: Breadcrumb[];
  brandResult?: FilterItem[];
  manufacturersResult?: FilterItem[];
  listedData?: FilterItem[];
  meta?: FilterItem[];
  optionsData?: FilterItem[];
}

export interface SEOMetaType {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}
export interface PaginationState {
  page?: number;
  currentPage?: number;
  itemsPerPage: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrev: boolean;
}
type Listing = {
  id: string;
  title: string;
  image: string;
  code: string;
  date: string;
  status: string;
  orderNumber?: string;
};

export type StatItem = {
  icon: React.ReactNode;
  value: number | string;
  label: string;
  href?: string;
};

export type UserInformationProps = {
  backgroundImage?: string;
  userData: GetUserResponse;
  isFollow?: boolean;
  isPrivateServer?: boolean;
  isBlockedSever?: boolean;
  currentUserId?: number | null;
  otherUser?: boolean;
};

export interface RateLimitResult {
  success: boolean;
  limit?: number;
  remaining?: number;
  resetTime?: number;
  retryAfter?: number;
}

export interface ExpressLikeRequest {
  url: string;
  method: string;
  headers: Record<string, string | undefined>;
}

export interface ExpressLikeResponse {
  status(code: number): {
    json(body: unknown): void;
  };
}

export interface RateLimitRequest {
  ip?: string;
  headers: Record<string, string | string[] | undefined>;
  connection?: {
    remoteAddress?: string;
  };
}

export interface RateLimitResponse {
  setHeader(name: string, value: string): void;
  status(code: number): {
    json(body: unknown): void;
  };
}

export interface ValidationRequest {
  body: unknown;
  validated?: unknown;
}

export interface ValidationResponse {
  status(code: number): {
    json(body: unknown): unknown;
  };
}

export interface PostgresError extends Error {
  code?: string;
  severity?: string;
  detail?: string;
}
