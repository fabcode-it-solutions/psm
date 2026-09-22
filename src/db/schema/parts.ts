import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  index,
  boolean,
  numeric,
  primaryKey,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";
import { users } from "./auth";
import { categories } from "./categories";
import { carBrands, carModels, carModelTypes, manufacturers } from "./default";
import { media } from "./media";
import { sql } from "drizzle-orm";
export const userActivityType = pgEnum("user_activity_type", [
  "login",
  "logout",
  "block",
  "unblock",
  "password_change",
  "profile_update",
  "email_verify",
  "suspend",
]);
export const moderationStatusEnum = pgEnum("moderation_status", [
  "clean",   
  "flagged",  
  "reviewed",  
  "rejected",   
  "hidden",     
])
export const parts = pgTable(
  "parts",
  {
    id: serial("id").primaryKey(),
    partId: text("partid")
      .notNull()
      .default(sql`'#PRT' || LPAD(nextval('part_hash_id_seq')::text, 4, '0')`),
    title: varchar("title", { length: 500 }).notNull(),
    slug: varchar("slug", { length: 500 }).unique().notNull(),
    description: text("description"),
    status: varchar("status", { length: 50 }).default("draft"),
    userId: integer("user_id").references(() => users.id, {onDelete: "cascade",}),
    listed: varchar("listed", { length: 50 }).default("For Sale"),
    brandId: integer("brand_id").references(() => carBrands.id, {onDelete: "set null",}).notNull(),
    modelId: integer("model_id").references(() => carModels.id, {onDelete: "set null",}).notNull(),
    typeId: integer("type_id").references(() => carModelTypes.id, {onDelete: "set null",}).notNull(),
    manufacturerId: integer("manufacturer_id").references(() => manufacturers.id, { onDelete: "set null", }).notNull(),
    moderationStatus: moderationStatusEnum("moderation_status").default("clean"),
    tags: jsonb("tags"),
      demandScore: integer("demand_score").default(0),
    wishlistCount: integer("wishlist_count").default(0),
    inquiryCount: integer("inquiry_count").default(0),
    viewCount: integer("view_count").default(0),
    lastRestockRequest: timestamp("last_restock_request"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("part_slug_idx").on(table.slug),
    index("part_id_idx").on(table.partId),
    index("part_user_id_idx").on(table.userId),
    index("part_status_idx").on(table.status),
    index("part_demand_score_idx").on(table.demandScore),
    index("part_moderation_status_idx").on(table.moderationStatus), 

  ]
);
export const userActivities = pgTable(
  "user_activities",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade", }),
    entityType: userActivityType("entity_type").notNull(),
    notes: text("notes"),
    ipAddress: text("ip_address"),
    deviceFingerprint: text("device_fingerprint"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("user_activity_user_id_idx").on(table.userId),
    index("user_activity_entity_type_idx").on(table.entityType),
    index("user_activity_created_at_idx").on(table.createdAt),
    index("user_activity_ip_address_idx").on(table.ipAddress),
    index("user_activity_device_fingerprint_idx").on(table.deviceFingerprint),
  ]
);
export const partMedia = pgTable(
  "part_media",
  {
    id: serial("id").primaryKey(),
    partId: integer("part_id")
      .references(() => parts.id, { onDelete: "cascade" })
      .notNull(),
    mediaId: integer("media_id").references(() => media.id, {
      onDelete: "set null",
    }),
    order: integer("order"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [index("part_media_idx").on(table.partId, table.mediaId)]
);

export const partCategories = pgTable(
  "part_categories",
  {
    partId: integer("part_id") .references(() => parts.id, {onDelete: "cascade", }).notNull(),
    categoryId: integer("category_id").references(() => categories.id, {onDelete: "cascade",}).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.partId, table.categoryId] }),
  })
);

export const moderationQueue = pgTable(
  "moderation_queue",
  {
    id: serial("id").primaryKey(),
    partId: integer("part_id").references(() => parts.id, { onDelete: "cascade",}).notNull(),
    reason: varchar("reason", { length: 100 }).notNull(),
    reasonLabel: varchar("reason_label", { length: 255 }).notNull(),
    severity: varchar("severity", { length: 20 }).notNull(), 
    notes: text("notes"),
    status: varchar("status", { length: 20 }).default("review").notNull(), 
    flaggedBy: varchar("flagged_by", { length: 255 }).notNull(),
    flaggedByUserId: integer("flagged_by_user_id").references(() => users.id, { onDelete: "set null",  }),
    flaggedAt: timestamp("flagged_at").defaultNow().notNull(),
    reviewedBy: varchar("reviewed_by", { length: 255 }),
    reviewedByUserId: integer("reviewed_by_user_id").references(
      () => users.id,
      {
        onDelete: "set null",
      }
    ),
    reviewedAt: timestamp("reviewed_at"),
    reviewNotes: text("review_notes"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    partIdx: index("moderation_part_idx").on(table.partId),
    statusIdx: index("moderation_status_idx").on(table.status),
    severityIdx: index("moderation_severity_idx").on(table.severity),
    flaggedAtIdx: index("moderation_flagged_at_idx").on(table.flaggedAt),
  })
);


export const proAdditionalDetails = pgTable(
  "additional_details",
  {
    id: serial("id").primaryKey(),
    partId: integer("part_id")
      .references(() => parts.id, {
        onDelete: "cascade",
      })
      .notNull(),
    heading: varchar("heading", { length: 255 }).notNull(),
    content: text("content").notNull(),
    displayOrder: integer("display_order").default(0),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    partIdx: index("additional_details_part_idx").on(table.partId),
    orderIdx: index("additional_details_order_idx").on(table.displayOrder),
  })
);

export const productOptions = pgTable(
  "options",
  {
    id: serial("id").primaryKey(),
    partId: integer("part_id")
      .references(() => parts.id, {
        onDelete: "cascade",
      })
      .notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    displayOrder: integer("display_order").default(0),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    partIdx: index("option_part_idx").on(table.partId),
    orderIdx: index("option_order_idx").on(table.displayOrder),
  })
);

export const optionValues = pgTable(
  "option_values",
  {
    id: serial("id").primaryKey(),
    optionId: integer("option_id")
      .references(() => productOptions.id, {
        onDelete: "cascade",
      })
      .notNull(),
    value: varchar("value", { length: 255 }).notNull(),
    displayOrder: integer("display_order").default(0),
  },
  (table) => ({
    optionIdx: index("option_value_option_idx").on(table.optionId),
    orderIdx: index("option_value_order_idx").on(table.displayOrder),
  })
);

export const productVariants = pgTable(
  "variants",
  {
    id: serial("id").primaryKey(),
    partId: integer("part_id")
      .references(() => parts.id, {
        onDelete: "cascade",
      })
      .notNull(),
    title: varchar("title", { length: 500 }).notNull(),
    sku: varchar("sku", { length: 255 }).unique(),
    barcode: varchar("barcode", { length: 255 }),
    option1: varchar("option1", { length: 255 }),
    option2: varchar("option2", { length: 255 }),
    option3: varchar("option3", { length: 255 }),
    option1Label: varchar("option1Label", { length: 255 }),
    option2Label: varchar("option2Label", { length: 255 }),
    option3Label: varchar("option3Label", { length: 255 }),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    compareAtPrice: numeric("compare_at_price", { precision: 10, scale: 2 }),
    quantity: integer("quantity").default(0),
    weight: numeric("weight", { precision: 10, scale: 3 }), // in kg
    weightUnit: varchar("weight_unit", { length: 10 }).default("kg"),
    requiresShipping: boolean("requires_shipping").default(true),
    taxable: boolean("taxable").default(true),
    inventoryTracking: boolean("inventory_tracking").default(true),
    displayOrder: integer("display_order").default(0),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    partIdx: index("variant_part_idx").on(table.partId),
    skuIdx: index("variant_sku_idx").on(table.sku),
    barcodeIdx: index("variant_barcode_idx").on(table.barcode),
    orderIdx: index("variant_order_idx").on(table.displayOrder),
  })
);



export const demandNotifications = pgTable(
  "demand_notifications",
  {
    id: serial("id").primaryKey(),
    partId: integer("part_id")
      .references(() => parts.id, { onDelete: "cascade" })
      .notNull(),
    userId: integer("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    notified: boolean("notified").default(false),
    createdAt: timestamp("created_at").defaultNow(),
    notifiedAt: timestamp("notified_at"),
  },
  (table) => ({
    partUserIdx: index("demand_notification_part_user_idx").on(
      table.partId,
      table.userId
    ),
    partIdx: index("demand_notification_part_idx").on(table.partId),
    notifiedIdx: index("demand_notification_notified_idx").on(table.notified),
  })
);

// Track user interactions for demand calculation
export const partInteractions = pgTable(
  "part_interactions",
  {
    id: serial("id").primaryKey(),
    partId: integer("part_id")
      .references(() => parts.id, { onDelete: "cascade" })
      .notNull(),
    userId: integer("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    sessionId: varchar("session_id", { length: 255 }), // For non-logged-in users
    interactionType: varchar("interaction_type", { length: 50 }).notNull(), // 'view', 'wishlist', 'inquiry', 'restock_request'
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    partIdx: index("part_interaction_part_idx").on(table.partId),
    typeIdx: index("part_interaction_type_idx").on(table.interactionType),
    dateIdx: index("part_interaction_date_idx").on(table.createdAt),
    userIdx: index("part_interaction_user_idx").on(table.userId),
    sessionIdx: index("part_interaction_session_idx").on(table.sessionId),
  })
);