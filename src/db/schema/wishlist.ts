// schema/wishlist.ts
import {
  pgTable,
  serial,
  varchar,
  integer,
  timestamp,
  index,
  text,
  boolean,
  numeric,
  unique,
} from "drizzle-orm/pg-core";
import { users } from "./auth";
import { parts } from "./parts";
import { listings } from "./listings";
import { builds } from "./builds";
import { media } from "./media";
import { seoMeta } from "./seoMeta";

// Wishlist Categories
export const wishlistCategories = pgTable(
  "wishlist_categories",
  {
    id: serial("id").primaryKey(),

    // User reference
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // Category details
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    note: varchar("note", { length: 255 }),
    description: text("description"),
    imageMediaId: integer("image_media_id").references(() => media.id, {
      onDelete: "set null",
    }),
    isDefault: boolean("is_default").default(false),
    isPublic: boolean("is_public").default(true),
    sortOrder: integer("sort_order").default(0),
    itemCount: integer("item_count").default(0),
    seo: integer("seo_id").references(() => seoMeta.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    userIdIdx: index("wishlist_categories_user_id_idx").on(table.userId),
    slugIdx: index("wishlist_categories_slug_idx").on(table.slug),
    isPublicIdx: index("wishlist_categories_is_public_idx").on(table.isPublic),
    // Ensure unique slug per user
    uniqueUserSlug: unique("wishlist_categories_unique_user_slug").on(
      table.userId,
      table.slug
    ),
  })
);

// Wishlist Items
export const wishlistItems = pgTable(
  "wishlist_items",
  {
    id: serial("id").primaryKey(),

    // User and Category references
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    categoryId: integer("category_id")
      .notNull()
      .references(() => wishlistCategories.id, { onDelete: "cascade" }),
    entityType: varchar("entity_type", { length: 50 }),
    entityId: integer("entity_id"),
    partId: integer("part_id").references(() => parts.id, {
      onDelete: "set null",
    }),
    listingId: integer("listing_id").references(() => listings.id, {
      onDelete: "set null",
    }),
    buildId: integer("build_id").references(() => builds.id, {
      onDelete: "set null",
    }),
    bookmarkedUserId: integer("bookmarked_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    isAlertOn: boolean("is_alert_on").default(false),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    userIdIdx: index("wishlist_items_user_id_idx").on(table.userId),
    categoryIdIdx: index("wishlist_items_category_id_idx").on(table.categoryId),
    entityIdx: index("wishlist_items_entity_idx").on(
      table.entityType,
      table.entityId
    ),
    partIdIdx: index("wishlist_items_part_id_idx").on(table.partId),
    listingIdIdx: index("wishlist_items_listing_id_idx").on(table.listingId),
    buildIdIdx: index("wishlist_items_build_id_idx").on(table.buildId),
    isAlertOnIdx: index("wishlist_items_is_alert_on_idx").on(table.isAlertOn),
    // Prevent duplicate items in same category
    uniqueEntityInCategory: unique("wishlist_items_unique_entity").on(
      table.categoryId,
      table.entityType,
      table.entityId
    ),
  })
);

// Price Alerts (only created when isAlertOn is true)
export const wishlistPriceAlerts = pgTable(
  "wishlist_price_alerts",
  {
    id: serial("id").primaryKey(),

    itemId: integer("item_id")
      .notNull()
      .references(() => wishlistItems.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // Alert details
    alertType: varchar("alert_type", { length: 50 }).notNull(), // 'price_drop', 'back_in_stock', 'target_price_reached'
    previousPrice: numeric("previous_price", { precision: 12, scale: 2 }),
    currentPrice: numeric("current_price", { precision: 12, scale: 2 }),
    targetPrice: numeric("target_price", { precision: 12, scale: 2 }),

    // Notification status
    isRead: boolean("is_read").default(false),
    notificationSent: boolean("notification_sent").default(false),
    notificationMethod: varchar("notification_method", { length: 50 }), // 'email', 'push', 'sms'

    // Timestamps
    createdAt: timestamp("created_at").defaultNow(),
    readAt: timestamp("read_at"),
  },
  (table) => ({
    itemIdIdx: index("wishlist_price_alerts_item_id_idx").on(table.itemId),
    userIdIdx: index("wishlist_price_alerts_user_id_idx").on(table.userId),
    isReadIdx: index("wishlist_price_alerts_is_read_idx").on(table.isRead),
    createdAtIdx: index("wishlist_price_alerts_created_at_idx").on(
      table.createdAt
    ),
  })
);

// Helper types
export type WishlistEntityType = "part" | "listing" | "build" | "custom";
export type AlertType = "price_drop" | "back_in_stock" | "target_price_reached";
