/**
 * Metafield Utilities - Category-Based Helpers
 *
 * @module utils/metafields
 * @version 2.0.0
 */

import { FormattedMetafield, GroupedMetafields, MetafieldDefinition, MetafieldsByCategory, MetafieldValueType } from "@/types/metafield.types";



/**
 * Filter metafield definitions by category IDs
 *
 * Returns definitions that either:
 * 1. Apply globally, OR
 * 2. Are linked to at least one of the provided categories
 *
 * @param definitions - All metafield definitions
 * @param categoryIds - Category IDs to filter by
 * @param includeGlobal - Whether to include globally applicable metafields (default: true)
 * @returns Filtered metafield definitions
 */
export function filterMetafieldsByCategories(
  definitions: MetafieldDefinition[],
  categoryIds: number[],
  includeGlobal: boolean = true
): MetafieldDefinition[] {
  if (!categoryIds || categoryIds.length === 0) {
    return definitions;
  }

  return definitions.filter((def) => {
    // Include if globally applicable and includeGlobal is true
    if (def.appliesGlobally && includeGlobal) {
      return true;
    }

    // Include if linked to any of the specified categories
    if (def.categories && def.categories.length > 0) {
      return def.categories.some((cat) => categoryIds.includes(cat.id));
    }

    // If not global and no category links, exclude
    return false;
  });
}

/**
 * Group metafields by category
 *
 * Separates metafields into:
 * - Global: Metafields that apply to all categories
 * - By Category: Metafields specific to each category
 *
 * @param metafields - Formatted metafields to group
 * @returns Grouped metafields
 */
export function groupMetafieldsByCategory(
  metafields: FormattedMetafield[]
): GroupedMetafields {
  const global: FormattedMetafield[] = [];
  const byCategory: MetafieldsByCategory = {};

  metafields.forEach((metafield) => {
    if (metafield.definition.appliesGlobally) {
      global.push(metafield);
    } else if (metafield.definition.categories) {
      metafield.definition.categories.forEach((category) => {
        if (!byCategory[category.id]) {
          byCategory[category.id] = [];
        }
        byCategory[category.id].push(metafield);
      });
    }
  });

  return { global, byCategory };
}

/**
 * Get metafields for specific categories
 *
 * Returns both global metafields and category-specific metafields
 *
 * @param metafields - All formatted metafields
 * @param categoryIds - Category IDs to get metafields for
 * @param includeGlobal - Whether to include global metafields (default: true)
 * @returns Filtered metafields
 */
export function getMetafieldsForCategories(
  metafields: FormattedMetafield[],
  categoryIds: number[],
  includeGlobal: boolean = true
): FormattedMetafield[] {
  const definitions = metafields.map((m) => m.definition);
  const filteredDefinitions = filterMetafieldsByCategories(
    definitions,
    categoryIds,
    includeGlobal
  );

  const filteredDefinitionIds = new Set(filteredDefinitions.map((d) => d.id));

  return metafields.filter((m) => filteredDefinitionIds.has(m.definition.id));
}

/**
 * Sort metafields by display order
 *
 * Takes into account:
 * 1. Category-specific display order (if applicable)
 * 2. Global display order
 *
 * @param metafields - Metafields to sort
 * @param currentCategoryId - Current category ID for context (optional)
 * @returns Sorted metafields
 */
export function sortMetafieldsByDisplayOrder(
  metafields: FormattedMetafield[],
  currentCategoryId?: number
): FormattedMetafield[] {
  return [...metafields].sort((a, b) => {
    let orderA = a.definition.displayOrder;
    let orderB = b.definition.displayOrder;

    // Use category-specific order if available
    if (currentCategoryId) {
      const catA = a.definition.categories?.find(
        (c) => c.id === currentCategoryId
      );
      const catB = b.definition.categories?.find(
        (c) => c.id === currentCategoryId
      );

      if (catA?.displayOrder !== undefined) {
        orderA = catA.displayOrder;
      }
      if (catB?.displayOrder !== undefined) {
        orderB = catB.displayOrder;
      }
    }

    return orderA - orderB;
  });
}

/**
 * Check if a metafield is required for given categories
 *
 * @param definition - Metafield definition
 * @param categoryIds - Category IDs to check
 * @returns Whether the metafield is required
 */
export function isMetafieldRequired(
  definition: MetafieldDefinition,
  categoryIds: number[]
): boolean {
  // Global requirement
  if (definition.isRequired) {
    return true;
  }

  // Category-specific requirement
  if (definition.categories && categoryIds.length > 0) {
    return definition.categories.some(
      (cat) => categoryIds.includes(cat.id) && cat.isRequired === true
    );
  }

  return false;
}

/**
 * Get missing required metafields
 *
 * Identifies metafields that are required but don't have values
 *
 * @param definitions - Metafield definitions
 * @param values - Current metafield values
 * @param categoryIds - Category IDs for the entity
 * @returns Array of missing required metafield definitions
 */
export function getMissingRequiredMetafields(
  definitions: MetafieldDefinition[],
  values: Record<number, MetafieldValueType>,
  categoryIds: number[]
): MetafieldDefinition[] {
  const applicableDefinitions = filterMetafieldsByCategories(
    definitions,
    categoryIds,
    true
  );

  return applicableDefinitions.filter((def) => {
    const isRequired = isMetafieldRequired(def, categoryIds);
    const hasValue =
      values[def.id] !== null &&
      values[def.id] !== undefined &&
      values[def.id] !== "";

    return isRequired && !hasValue;
  });
}

/**
 * Prepare metafield data for API submission
 *
 * Converts form data to the format expected by the API
 *
 * @param formData - Form data with definition IDs as keys
 * @param definitions - Metafield definitions for type conversion
 * @returns Array of metafield data ready for API
 */
export function prepareMetafieldDataForSubmission(
  formData: Record<string, MetafieldValueType>,
  definitions: MetafieldDefinition[]
): Array<{ definitionId: number; value: MetafieldValueType }> {
  const definitionMap = new Map(definitions.map((d) => [d.id.toString(), d]));

  return Object.entries(formData)
    .filter(
      ([_, value]) => value !== null && value !== undefined && value !== ""
    )
    .map(([definitionId, value]) => {
      const definition = definitionMap.get(definitionId);

      return {
        definitionId: parseInt(definitionId, 10),
        value: definition ? formatValueForType(value, definition.type) : value,
      };
    });
}

/**
 * Format value based on metafield type
 *
 * @param value - Raw value
 * @param type - Metafield type
 * @returns Formatted value
 */
function formatValueForType(value: unknown, type: string): MetafieldValueType {
  if (value === null || value === undefined || value === "") {
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
      if (typeof value === "string") {
        return value.toLowerCase() === "true" || value === "1";
      }
      return Boolean(value);

    case "date":
    case "datetime":
      if (value instanceof Date) {
        return value;
      }
      return new Date(String(value));

   case "multiselect":
  return Array.isArray(value)
    ? value
    : [value as string | number | boolean];

   case "select": {
  if (Array.isArray(value)) return value[0] as MetafieldValueType;
  return value as MetafieldValueType;
}

    default:
      return value as MetafieldValueType;
  }
}

/**
 * Merge category definitions into a single list
 *
 * When a part belongs to multiple categories, merge their metafield definitions
 * and remove duplicates
 *
 * @param categoryIds - Category IDs
 * @param allDefinitions - All available metafield definitions
 * @returns Merged list of unique definitions
 */
export function mergeMetafieldDefinitionsForCategories(
  categoryIds: number[],
  allDefinitions: MetafieldDefinition[]
): MetafieldDefinition[] {
  const definitionMap = new Map<number, MetafieldDefinition>();

  allDefinitions.forEach((def) => {
    // Include global definitions
    if (def.appliesGlobally) {
      definitionMap.set(def.id, def);
      return;
    }

    // Include category-specific definitions
    if (def.categories && def.categories.length > 0) {
      const hasMatchingCategory = def.categories.some((cat) =>
        categoryIds.includes(cat.id)
      );

      if (hasMatchingCategory) {
        definitionMap.set(def.id, def);
      }
    }
  });

  return Array.from(definitionMap.values());
}

/**
 * Get category names for a metafield definition
 *
 * @param definition - Metafield definition
 * @returns Array of category names or ["All Categories"] if global
 */
export function getCategoryNamesForDefinition(
  definition: MetafieldDefinition
): string[] {
  if (definition.appliesGlobally) {
    return ["All Categories"];
  }

  if (definition.categories && definition.categories.length > 0) {
    return definition.categories.map((cat) => cat.name);
  }

  return ["No Categories"];
}

/**
 * Validate metafields for categories
 *
 * Check if all required metafields for given categories have values
 *
 * @param definitions - Metafield definitions
 * @param values - Current values
 * @param categoryIds - Category IDs
 * @returns Validation result with errors
 */
export function validateMetafieldsForCategories(
  definitions: MetafieldDefinition[],
  values: Record<number, MetafieldValueType>,
  categoryIds: number[]
): {
  valid: boolean;
  errors: Array<{ definitionId: number; name: string; message: string }>;
} {
  const errors: Array<{ definitionId: number; name: string; message: string }> =
    [];

  const applicableDefinitions = filterMetafieldsByCategories(
    definitions,
    categoryIds,
    true
  );

  applicableDefinitions.forEach((def) => {
    const isRequired = isMetafieldRequired(def, categoryIds);
    const value = values[def.id];
    const hasValue = value !== null && value !== undefined && value !== "";

    if (isRequired && !hasValue) {
      errors.push({
        definitionId: def.id,
        name: def.name,
        message: `${def.name} is required`,
      });
    }

    // Add validation rules checking here if needed
    if (hasValue && def.validationRules) {
      // Implement specific validation logic based on rules
      // This is a placeholder for future expansion
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get metafield statistics for categories
 *
 * Returns useful stats about metafields for given categories
 *
 * @param definitions - Metafield definitions
 * @param categoryIds - Category IDs
 * @returns Statistics object
 */
export function getMetafieldStatistics(
  definitions: MetafieldDefinition[],
  categoryIds: number[]
): {
  total: number;
  global: number;
  categorySpecific: number;
  required: number;
  optional: number;
  byType: Record<string, number>;
} {
  const applicable = filterMetafieldsByCategories(
    definitions,
    categoryIds,
    true
  );

  const stats = {
    total: applicable.length,
    global: applicable.filter((d) => d.appliesGlobally).length,
    categorySpecific: applicable.filter((d) => !d.appliesGlobally).length,
    required: applicable.filter((d) => isMetafieldRequired(d, categoryIds))
      .length,
    optional: 0,
    byType: {} as Record<string, number>,
  };

  stats.optional = stats.total - stats.required;

  // Count by type
  applicable.forEach((def) => {
    stats.byType[def.type] = (stats.byType[def.type] || 0) + 1;
  });

  return stats;
}

/**
 * Export helper functions
 */
export const metafieldUtils = {
  filterMetafieldsByCategories,
  groupMetafieldsByCategory,
  getMetafieldsForCategories,
  sortMetafieldsByDisplayOrder,
  isMetafieldRequired,
  getMissingRequiredMetafields,
  prepareMetafieldDataForSubmission,
  mergeMetafieldDefinitionsForCategories,
  getCategoryNamesForDefinition,
  validateMetafieldsForCategories,
  getMetafieldStatistics,
};
