/**
 * Metafields Schema - Updated with Category Support
 *
 * @module schema/metafields
 * @version 2.0.0
 */

import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  boolean,
  index,
  integer,
  jsonb,
  unique,
  numeric,
  primaryKey,
} from "drizzle-orm/pg-core";
import { users } from "./auth";
import { categories } from "./categories";

/**
 * Metafield Definitions
 * Defines the structure and rules for custom fields
 *
 * NEW: Now supports category-specific metafields
 */
export const metafieldDefinitions = pgTable(
  "metafield_definitions",
  {
    id: serial("id").primaryKey(),

    // Entity configuration
    entityType: varchar("entity_type", { length: 50 }).notNull(),
    namespace: varchar("namespace", { length: 100 }).default("custom"),
    key: varchar("key", { length: 100 }).notNull(),

    // Display information
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),

    // Field configuration
    type: varchar("type", { length: 50 }).notNull(),
    validationRules: jsonb("validation_rules"),
    defaultValue: text("default_value"),
    placeholder: varchar("placeholder", { length: 255 }),
    helpText: text("help_text"),

    // Behaviour flags
    isRequired: boolean("is_required").default(false),
    isSearchable: boolean("is_searchable").default(false),
    isPublic: boolean("is_public").default(true),
    isActive: boolean("is_active").default(true).notNull(),

    // Display configuration
    displayOrder: integer("display_order").default(0),
    settings: jsonb("settings"),

    // NEW: Category filtering
    // If null, applies to all categories
    // If set, only applies to specific categories
    appliesGlobally: boolean("applies_globally").default(true).notNull(),

    // Metadata
    userId: integer("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    // Existing indexes
    entityTypeIdx: index("metafield_def_entity_type_idx").on(table.entityType),
    namespaceIdx: index("metafield_def_namespace_idx").on(table.namespace),
    keyIdx: index("metafield_def_key_idx").on(table.key),
    typeIdx: index("metafield_def_type_idx").on(table.type),
    searchableIdx: index("metafield_def_searchable_idx").on(table.isSearchable),
    orderIdx: index("metafield_def_order_idx").on(table.displayOrder),

    // NEW: Category filtering indexes
    activeIdx: index("metafield_def_active_idx").on(table.isActive),
    globalIdx: index("metafield_def_global_idx").on(table.appliesGlobally),

    // Unique constraint
    uniqueEntityNamespaceKey: unique("metafield_def_unique").on(
      table.entityType,
      table.namespace,
      table.key
    ),
  })
);

/**
 * NEW TABLE: Metafield Definition Categories
 * Links metafield definitions to specific categories
 *
 * This allows metafields to be category-specific:
 * - Electronics parts show voltage, wattage
 * - Mechanical parts show torque, material
 * - Body parts show color, finish
 */
export const metafieldDefinitionCategories = pgTable(
  "metafield_definition_categories",
  {
    metafieldDefinitionId: integer("metafield_definition_id")
      .references(() => metafieldDefinitions.id, { onDelete: "cascade" })
      .notNull(),
    categoryId: integer("category_id")
      .references(() => categories.id, { onDelete: "cascade" })
      .notNull(),

    // Allow category-specific overrides
    isRequired: boolean("is_required"),
    displayOrder: integer("display_order"),

    // Metadata
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.metafieldDefinitionId, table.categoryId],
    }),
    metafieldIdx: index("metafield_def_cat_metafield_idx").on(
      table.metafieldDefinitionId
    ),
    categoryIdx: index("metafield_def_cat_category_idx").on(table.categoryId),
  })
);

/**
 * Metafield Options
 * For select and multiselect field types
 */
export const metafieldOptions = pgTable(
  "metafield_options",
  {
    id: serial("id").primaryKey(),
    metafieldDefinitionId: integer("metafield_definition_id")
      .references(() => metafieldDefinitions.id, { onDelete: "cascade" })
      .notNull(),

    // Option data
    value: varchar("value", { length: 255 }).notNull(),
    label: varchar("label", { length: 255 }).notNull(),

    // Visual configuration
    color: varchar("color", { length: 7 }),
    icon: varchar("icon", { length: 100 }),
    metadata: jsonb("metadata"),

    // Behaviour
    isDefault: boolean("is_default").default(false),
    isActive: boolean("is_active").default(true),
    displayOrder: integer("display_order").default(0),
  },
  (table) => ({
    defIdx: index("metafield_option_def_idx").on(table.metafieldDefinitionId),
    activeIdx: index("metafield_option_active_idx").on(table.isActive),
    orderIdx: index("metafield_option_order_idx").on(table.displayOrder),
  })
);

/**
 * Metafield Values
 * Stores actual values for metafields
 */
export const metafields = pgTable(
  "metafields",
  {
    id: serial("id").primaryKey(),

    // Entity reference
    entityType: varchar("entity_type", { length: 50 }).notNull(),
    entityId: integer("entity_id").notNull(),
    metafieldDefinitionId: integer("metafield_definition_id")
      .references(() => metafieldDefinitions.id, { onDelete: "cascade" })
      .notNull(),

    // Value storage by type
    valueText: text("value_text"),
    valueNumber: numeric("value_number", { precision: 20, scale: 6 }),
    valueInteger: integer("value_integer"),
    valueBoolean: boolean("value_boolean"),
    valueDate: timestamp("value_date"),
    valueArray: jsonb("value_json"),
    selectedOptions: jsonb("selected_options"),

    // Metadata
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    entityIdx: index("metafield_entity_idx").on(
      table.entityType,
      table.entityId
    ),
    defIdx: index("metafield_def_idx").on(table.metafieldDefinitionId),

    // Value indexes for searchability
    textIdx: index("metafield_value_text_idx").on(table.valueText),
    numberIdx: index("metafield_value_number_idx").on(table.valueNumber),
    integerIdx: index("metafield_value_integer_idx").on(table.valueInteger),
    booleanIdx: index("metafield_value_boolean_idx").on(table.valueBoolean),
    dateIdx: index("metafield_value_date_idx").on(table.valueDate),

    // Unique constraint: one value per definition per entity
    uniqueEntityDefinition: unique("metafield_unique").on(
      table.entityType,
      table.entityId,
      table.metafieldDefinitionId
    ),
  })
);

/**
 * Type exports for use in application
 */
export type MetafieldDefinition = typeof metafieldDefinitions.$inferSelect;
export type InsertMetafieldDefinition =
  typeof metafieldDefinitions.$inferInsert;

export type MetafieldDefinitionCategory =
  typeof metafieldDefinitionCategories.$inferSelect;
export type InsertMetafieldDefinitionCategory =
  typeof metafieldDefinitionCategories.$inferInsert;

export type MetafieldOption = typeof metafieldOptions.$inferSelect;
export type InsertMetafieldOption = typeof metafieldOptions.$inferInsert;

export type Metafield = typeof metafields.$inferSelect;
export type InsertMetafield = typeof metafields.$inferInsert;
