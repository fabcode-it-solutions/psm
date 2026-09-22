export interface PartForm {
  title?: string;
  slug?: string;
  description?: string;
  status?: "active";
  categoryIds?: string[];
  basePrice?: string;
  compareAtPrice?: string;
  costPerItem?: string;
  profitMargin?: string;
  trackQuantity?: false;
  quantity?: string;
  lowStockThreshold?: string;
  sku?: string;
  barcode?: string;
}

export interface PartCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parentId?: number;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  parentCategory?: {
    id: 3;
    name: string;
    slug: string;
  };
}

export interface AdditionalDetail {
  id?: number;
  partId?: number;
  heading: string;
  content: string;
  displayOrder: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MetafieldOption {
  id: number;
  metafieldDefinitionId: number;
  value: string;
  label: string;
  displayOrder: number;
}

export interface MetafieldDefinition {
  id: number;
  entityType: string;
  namespace: string;
  key: string;
  name: string;
  description?: string;
  type: MetafieldType;
  validationRules?: Record<string, unknown>;
  defaultValue?: MetafieldValue;
  placeholder?: string;
  helpText?: string;
  isRequired: boolean;
  isSearchable: boolean;
  isPublic: boolean;
  displayOrder: number;
  settings?: MetafieldSettings;
  userId: number;
  options?: MetafieldOption[];
  createdAt: Date;
  updatedAt: Date;
}

export type MetafieldType =
  | "text"
  | "rich_text"
  | "url"
  | "email"
  | "phone"
  | "color"
  | "number"
  | "decimal"
  | "integer"
  | "boolean"
  | "date"
  | "datetime"
  | "json"
  | "select"
  | "multiselect"
  | "file"
  | "image";

export type MetafieldValue =
  | string
  | number
  | boolean
  | Date
  | string[]
  | number[]
  | Record<string, unknown>
  | null
  | undefined;

export interface MetafieldSettings {
  options?: Array<{
    value: string;
    label: string;
  }>;
  min?: number;
  max?: number;
  maxLength?: number;
  allowMultiple?: boolean;
  accept?: string; // for file/image types
  [key: string]: unknown;
}

export interface MetafieldData {
  definitionId: number;
  value: MetafieldValue;
}

export interface MetafieldsFormData {
  [definitionId: string]: MetafieldValue;
}

export interface Part {
  id: number;
  title: string;
  slug: string;
  description?: string;
  status: PartStatus;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

export type PartStatus = "draft" | "active" | "archived";

export interface PartWithRelations extends Part {
  categories: PartCategory[];
  additionalDetails: AdditionalDetail[];
  metafields: FormattedMetafield[];
  media?: MediaItem[];
}

export interface FormattedMetafield {
  id: number;
  definition: MetafieldDefinition;
  value: MetafieldValue;
}

export interface MediaItem {
  id: number;
  type: string;
  url: string;
  altText?: string;
  displayOrder: number;
  entityType?: string;
  entityId?: number;
}

// Form-specific types
export interface CreatePartFormData {
  title: string;
  slug: string;
  description?: string;
  status: PartStatus;
  categoryIds: number[];
  additionalDetails: AdditionalDetail[];
  metafields: MetafieldsFormData;
}

export interface CreatePartApiData {
  title: string;
  slug: string;
  description?: string;
  status: PartStatus;
  userId: number;
  categoryIds?: number[];
  additionalDetails?: Omit<
    AdditionalDetail,
    "id" | "partId" | "createdAt" | "updatedAt"
  >[];
  mediaIds?: number[];
  metafields?: MetafieldData[];
}

// API Response types
export interface ApiResponse<T> {
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
  error?: string;
}

export interface CreatePartResponse extends ApiResponse<Part> {
  data?: Part & { id: number };
}

// Form component prop types
export interface FormFieldError {
  message?: string | number | number[];
  type?: string;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

// Form section prop types
export interface BasicInfoSectionProps<T extends Record<string, unknown>> {
  register: UseFormRegister<T>;
  watch: UseFormWatch<T>;
  setValue: UseFormSetValue<T>;
  errors?: FieldErrors<T>;
}

export interface AdditionalDetailsSectionProps<
  T extends Record<string, unknown>
> {
  control: Control<T>;
  register: UseFormRegister<T>;
  errors?: FieldErrors<T>;
}

export interface MetafieldsSectionProps<T extends Record<string, unknown>> {
  metafieldDefinitions: MetafieldDefinition[];
  watch: UseFormWatch<T>;
  setValue: UseFormSetValue<T>;
  register: UseFormRegister<T>;
  errors?: FieldErrors<T>;
}

// Hook types
export interface UseApiRequestResult<T> {
  request: (params: ApiRequestParams) => Promise<T | null>;
  loading: boolean;
  error: string | null;
  success: boolean;
  result: T | null;
}

export interface ApiRequestParams {
  url: string;
  options?: {
    method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    body?: unknown;
    headers?: Record<string, string>;
  };
  tag?: string;
  cache?: "force-cache" | "no-store";
}

// Import React Hook Form types
import type {
  UseFormRegister,
  UseFormWatch,
  UseFormSetValue,
  Control,
  FieldErrors,
} from "react-hook-form";

export interface AdditionalDetail {
  heading: string;
  content: string;
  displayOrder: number;
}

export interface ShippingInfo {
  weight: string;
  dimensions: {
    length: string;
    width: string;
    height: string;
  };
  shippingClass: string;
  requiresShipping: boolean;
  freeShipping: boolean;
  shippingCost: string;
}

export type Variant = {
  id?: number;
  title?: string;
  sku?: string;
  barcode?: string;
  option1?: string;
  option2?: string;
  option3?: string;
  option1Label?: string;
  option2Label?: string;
  option3Label?: string;
  price?: number;
  compareAtPrice?: number;
  quantity?: number;
  weight?: number;
  weightUnit?: string;
  requiresShipping?: boolean;
  taxable?: boolean;
  inventoryTracking?: boolean;
  lowStockThreshold?: number;
  displayOrder?: number;
};
export type Metafield = {
  entityType?: string;
  entityId?: number;
  metafieldDefinitionId?: number;
  value?: string | string[] | number | boolean;
  valueText?: string;
  valueNumber?: number;
  valueInteger?: number;
  valueBoolean?: boolean;
  valueArray?: string[];
};
export type OptionValues = {
  value?: string;
};
export type Option = {
  name?: string;
  displayOrder?: number;
  optionValues: OptionValues[];
  values: string[];
};

export interface Manufacturer {
  id: number;
  name: string;
  description: string | null;
  subTitle: string | null;
  status: string;
  logo: string;
  alt: string;
}

export interface Media {
  id: number;
  url: string;
  alt: string;
  order: number;
}

export interface Breadcrumb {
  label?: string;
  name?: string;
  slug?: string;
  id: string | number;
  link?: string;
}

export interface Part {
  partId: number;
  title: string;
  slug: string;
  description?: string;
  manufacturer: Manufacturer;
}

export interface PartApiResponse {
  success: boolean;
  data: {
    part: Part;
    media: Media[];
    variants: Variant[];
    breadcrumb: Breadcrumb[];
  };
}

// types.ts (optional)
export type MetaField = {
  key: string;
  values: string[];
};

export type Product = {
  title: string;
  media?: { url: string }[];
  metafields?: MetaField[];
  options?: Option[];
};

export type Filter = {
  label: string;
  state: string;
  setState: React.Dispatch<React.SetStateAction<string>>;
  options: string[];
};
