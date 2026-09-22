/**
 * Metafield Type Definitions - Updated with Category Support
 *
 * @module types/metafields
 * @version 2.0.0
 */

/**
 * Metafield Option
 * Used for select and multiselect field types
 */
export interface MetafieldOption {
  readonly id?: number;
  value: string;
  label: string;
  color?: string;
  icon?: string;
  metadata?: Record<string, unknown>;
  isDefault?: boolean;
  isActive?: boolean;
  displayOrder?: number;
}

/**
 * Category Link for Metafield Definition
 * NEW: Represents the relationship between metafield and category
 */
export interface MetafieldDefinitionCategory {
  id: number;
  name: string;
  slug: string;
  isRequired?: boolean;
  displayOrder?: number;
}

/**
 * Metafield Definition
 * Defines the structure and rules for a custom field
 */
export interface MetafieldDefinition {
  readonly id: number;
  categoryIds?: number[];
  // Entity configuration
  entityType: EntityType;
  namespace: string;
  key: string;

  // Display information
  name: string;
  description?: string;

  // Field configuration
  type: MetafieldType;
  validationRules?: ValidationRules;
  defaultValue?: string;
  placeholder?: string;
  helpText?: string;

  // Behaviour flags
  isRequired: boolean;
  isSearchable: boolean;
  isPublic: boolean;
  isActive: boolean;

  // Display configuration
  displayOrder: number;
  settings?: MetafieldSettings;

  // NEW: Category filtering
  appliesGlobally: boolean;
  categories?: MetafieldDefinitionCategory[];

  // Options for select/multiselect
  options?: MetafieldOption[];

  // Metadata
  userId?: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}
export type Category = {
  id: number;
  name: string;
  isRequired: boolean;
  displayOrder: number;
};

export type CategoryList = Category[];

/**
 * Create Metafield Definition Input
 * Used when creating a new metafield definition
 */
export interface CreateMetafieldDefinition {
  entityType: EntityType;
  id?: number;
  namespace: string;
  key: string;
  name: string;
  description?: string;
  type: MetafieldType;
  validationRules?: ValidationRules;
  defaultValue?: string;
  placeholder?: string;
  helpText?: string;
  isRequired?: boolean;
  isSearchable?: boolean;
  isPublic?: boolean;
  isActive?: boolean;
  displayOrder?: number;
  settings?: MetafieldSettings;
  userId?: number;
  categories?: MetafieldDefinitionCategory[];
  // NEW: Category configuration
  appliesGlobally?: boolean;
  categoryIds?: number[];

  options?: Omit<MetafieldOption, "id">[];
}

/**
 * Update Metafield Definition Input
 */
export interface UpdateMetafieldDefinition
  extends Partial<CreateMetafieldDefinition> {
  id: number;
}

/**
 * Metafield Value
 * Represents the actual value stored for a metafield
 */
export interface MetafieldValue {
  readonly id: number;
  entityType: EntityType;
  entityId: number;
  metafieldDefinitionId: number;
  value: MetafieldValueType;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/**
 * Formatted Metafield
 * Combined definition and value for display
 */
export interface FormattedMetafield {
  readonly id: number;
  definition: MetafieldDefinition;
  value: MetafieldValueType;
}

/**
 * Metafield Types
 */
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

/**
 * Entity Types that can have metafields
 */
export type EntityType =
  | "part"
  | "category"
  | "variant"
  | "listing"
  | "page"
  | "user"
  | "manufacturer"
  | "order";

/**
 * Metafield Value Types
 */
export type MetafieldValueType =
  | string
  | number
  | boolean
  | Date
  | string[]
  | number[]
  | Array<string | number | boolean>
  | null
  | undefined;

/**
 * Validation Rules
 * Extensible validation configuration
 */
export interface ValidationRules {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  required?: boolean;
  email?: boolean;
  url?: boolean;
  phone?: boolean;
  custom?: {
    validator: string;
    message: string;
  }[];
}

/**
 * Metafield Settings
 * Type-specific configuration
 */
export interface MetafieldSettings {
  // For select/multiselect
  allowCustomValues?: boolean;

  // For file/image
  accept?: string;
  maxSize?: number;
  maxFiles?: number;

  // For text/rich_text
  rows?: number;
  enableFormatting?: boolean;

  // For number fields
  step?: number;
  prefix?: string;
  suffix?: string;

  // General
  [key: string]: unknown;
}

/**
 * Metafield Namespace
 * Predefined namespaces for organization
 */
export type MetafieldNamespace =
  | "specifications"
  | "shipping"
  | "custom"
  | "technical"
  | "warranty"
  | "compatibility"
  | "seo"
  | "marketing";

/**
 * API Request/Response Types
 */

export interface GetMetafieldDefinitionsParams {
  entityType?: EntityType;
  namespace?: MetafieldNamespace | string;
  categoryIds?: number[];
  includeGlobal?: boolean;
}

export interface GetMetafieldDefinitionsResponse {
  success: boolean;
  data: MetafieldDefinition[];
  meta: {
    total: number;
    filteredByCategories: boolean;
    includeGlobal: boolean;
  };
  error?: string;
}

export interface GetMetafieldValuesParams {
  entityType: EntityType;
  entityId: number;
  includeDefinitions?: boolean;
}

export interface GetMetafieldValuesResponse {
  success: boolean;
  data: FormattedMetafield[];
  error?: string;
}

export interface CreateMetafieldDefinitionResponse {
  success: boolean;
  data?: MetafieldDefinition;
  message?: string;
  error?: string;
  details?: unknown;
}

/**
 * Form Data Types
 */

export interface MetafieldFormData {
  [definitionId: string]: MetafieldValueType;
}

export interface MetafieldData {
  definitionId: number;
  value: MetafieldValueType;
}

/**
 * Utility Types
 */

export type MetafieldsByCategory = Record<number, FormattedMetafield[]>;

export interface GroupedMetafields {
  global: FormattedMetafield[];
  byCategory: MetafieldsByCategory;
}

/**
 * Constants
 */

export const FIELD_TYPES: Array<{ value: MetafieldType; label: string }> = [
  { value: "text", label: "Text" },
  { value: "rich_text", label: "Rich Text" },
  { value: "number", label: "Number" },
  { value: "integer", label: "Integer" },
  { value: "decimal", label: "Decimal" },
  { value: "boolean", label: "Boolean" },
  { value: "date", label: "Date" },
  { value: "datetime", label: "Date & Time" },
  { value: "select", label: "Select (Single)" },
  { value: "multiselect", label: "Select (Multiple)" },
  { value: "url", label: "URL" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "color", label: "Color" },
  { value: "file", label: "File" },
  { value: "image", label: "Image" },
  { value: "json", label: "JSON" },
];

export const ENTITY_TYPES: Array<{ value: EntityType; label: string }> = [
  { value: "part", label: "Parts" },
  { value: "category", label: "Categories" },
  // { value: "variant", label: "Variants" },
  // { value: "listing", label: "Listings" },
  // { value: "page", label: "Pages" },
  { value: "user", label: "Users" },
  // { value: "manufacturer", label: "Manufacturers" },
  { value: "order", label: "Orders" },
];

export const NAMESPACES: Array<{ value: MetafieldNamespace; label: string }> = [
  { value: "specifications", label: "Specifications" },
  { value: "shipping", label: "Shipping" },
  { value: "custom", label: "Custom" },
  { value: "technical", label: "Technical" },
  { value: "warranty", label: "Warranty" },
  { value: "compatibility", label: "Compatibility" },
  { value: "seo", label: "SEO" },
  { value: "marketing", label: "Marketing" },
];

/**
 * Type Guards
 */

export function isSelectType(
  type: MetafieldType
): type is "select" | "multiselect" {
  return type === "select" || type === "multiselect";
}

export function isNumericType(
  type: MetafieldType
): type is "number" | "decimal" | "integer" {
  return type === "number" || type === "decimal" || type === "integer";
}

export function isDateType(type: MetafieldType): type is "date" | "datetime" {
  return type === "date" || type === "datetime";
}

export function isFileType(type: MetafieldType): type is "file" | "image" {
  return type === "file" || type === "image";
}

/**
 * Helper Functions
 */

/**
 * Get the appropriate database column for a metafield type
 */
export function getValueColumnForType(type: MetafieldType): string {
  switch (type) {
    case "text":
    case "rich_text":
    case "url":
    case "email":
    case "phone":
    case "color":
      return "valueText";
    case "number":
    case "decimal":
      return "valueNumber";
    case "integer":
      return "valueInteger";
    case "boolean":
      return "valueBoolean";
    case "date":
    case "datetime":
      return "valueDate";
    case "select":
    case "multiselect":
      return "selectedOptions";
    case "json":
    case "file":
    case "image":
      return "valueArray";
    default:
      return "valueText";
  }
}

/**
 * Format metafield value based on type
 */
export function formatMetafieldValue(
  value: unknown,
  type: MetafieldType
): MetafieldValueType {
  if (value === null || value === undefined) {
    return null;
  }

  switch (type) {
    case "number":
    case "decimal":
      return typeof value === "string" ? parseFloat(value) : Number(value);
    case "integer":
      return typeof value === "string"
        ? parseInt(value, 10)
        : Math.floor(Number(value));
    case "boolean":
      return Boolean(value);
    case "date":
    case "datetime":
      return value instanceof Date ? value : new Date(String(value));
  case "multiselect": {
  if (Array.isArray(value)) {
    return value.map(v => String(v)) as string[];
  }
  return [String(value)] as string[];
}

    default:
      return value as MetafieldValueType;
  }
}

/**
 * Validate metafield value against definition
 */
export function validateMetafieldValue(
  value: MetafieldValueType,
  definition: MetafieldDefinition
): { valid: boolean; error?: string } {
  // Check required
  if (
    definition.isRequired &&
    (value === null || value === undefined || value === "")
  ) {
    return { valid: false, error: `${definition.name} is required` };
  }

  // No further validation if value is empty and not required
  if (
    !definition.isRequired &&
    (value === null || value === undefined || value === "")
  ) {
    return { valid: true };
  }

  const rules = definition.validationRules;
  if (!rules) {
    return { valid: true };
  }

  // Type-specific validation
  if (isNumericType(definition.type) && typeof value === "number") {
    if (rules.min !== undefined && value < rules.min) {
      return {
        valid: false,
        error: `${definition.name} must be at least ${rules.min}`,
      };
    }
    if (rules.max !== undefined && value > rules.max) {
      return {
        valid: false,
        error: `${definition.name} must be at most ${rules.max}`,
      };
    }
  }

  if (definition.type === "text" && typeof value === "string") {
    if (rules.minLength !== undefined && value.length < rules.minLength) {
      return {
        valid: false,
        error: `${definition.name} must be at least ${rules.minLength} characters`,
      };
    }
    if (rules.maxLength !== undefined && value.length > rules.maxLength) {
      return {
        valid: false,
        error: `${definition.name} must be at most ${rules.maxLength} characters`,
      };
    }
    if (rules.pattern) {
      const regex = new RegExp(rules.pattern);
      if (!regex.test(value)) {
        return { valid: false, error: `${definition.name} format is invalid` };
      }
    }
  }

  return { valid: true };
}
