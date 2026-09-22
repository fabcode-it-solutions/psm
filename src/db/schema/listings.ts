import {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  timestamp,
  boolean,
  numeric,
  jsonb,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { parts, productVariants } from "./parts";
import { users } from "./auth";
import { builds } from "./builds";
import { sql } from "drizzle-orm";

export const listings = pgTable(
  "listings",
  {
    id: serial("id").primaryKey(),
    listId: text("list_id") .notNull().default(sql`'#LST' || LPAD(nextval('part_hash_id_seq')::text, 4, '0')`),
    partId: integer("part_id").references(() => parts.id, { onDelete: "set null", }),
    variantId: integer("variant_id").references(() => productVariants.id, { onDelete: "set null", }),
    buildId: integer("build_id").references(() => builds.id, {onDelete: "set null",}),
    userId: integer("user_id") .references(() => users.id, { onDelete: "cascade", }).notNull(),
    title: varchar("title", { length: 500 }),
    slug: varchar("slug", { length: 500 }).unique().notNull(),
    description: text("description"),
    price: numeric("price", { precision: 12, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).default("USD"),
    minimumBid: numeric("minimum_bid", { precision: 12, scale: 2 }),
    buyNowPrice: numeric("buy_now_price", { precision: 12, scale: 2 }),
    offerNotificationThreshold: numeric("offer_notification_threshold", {
      precision: 12,
      scale: 2,
    }),
    quantity: integer("quantity").default(1),
    quantityAvailable: integer("quantity_available").default(1),
    sku: varchar("sku", { length: 255 }),
    addressLine1: varchar("address_line1", { length: 255 }),
    addressLine2: varchar("address_line2", { length: 255 }),
    city: varchar("city", { length: 100 }),
    state: varchar("state", { length: 100 }),
    postalCode: varchar("postal_code", { length: 20 }),
    country: varchar("country", { length: 2 }),
    latitude: numeric("latitude", { precision: 10, scale: 7 }),
    longitude: numeric("longitude", { precision: 10, scale: 7 }),
    hideExactLocation: boolean("hide_exact_location").default(false),
    shippingAvailable: boolean("shipping_available").default(true),
    localPickupAvailable: boolean("local_pickup_available").default(false),
    shippingCost: numeric("shipping_cost", { precision: 10, scale: 2 }),
    freeShipping: boolean("free_shipping").default(false),
    shippingNotes: text("shipping_notes"),
    status: varchar("status", { length: 50 }).default("draft"),
    isAvailableForSale: boolean("is_available_for_sale").default(true),
    soldAt: timestamp("sold_at"),
    expiresAt: timestamp("expires_at"),
    submittedForReviewAt: timestamp("submitted_for_review_at"),
    reviewStatus: varchar("review_status", { length: 50 }),
    reviewedBy: integer("reviewed_by").references(() => users.id, {
      onDelete: "set null",
    }),
    reviewedAt: timestamp("reviewed_at"),
    reviewNotes: text("review_notes"),
    rejectionReason: text("rejection_reason"),
    listingType: varchar("listing_type", { length: 50 }).default("fixed_price"),
    auctionStartsAt: timestamp("auction_starts_at"),
    auctionEndsAt: timestamp("auction_ends_at"),
    views: integer("views").default(0),
    watchCount: integer("watch_count").default(0),
    offerCount: integer("offer_count").default(0),
    autoRenew: boolean("auto_renew").default(false),
    featured: boolean("featured").default(false),
    featuredUntil: timestamp("featured_until"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
    publishedAt: timestamp("published_at"),
    lastBumpedAt: timestamp("last_bumped_at"),
  },
  (table) => [
    index("listing_user_idx").on(table.userId),
    index("listing_part_idx").on(table.partId),
    index("listing_variant_idx").on(table.variantId),
    index("listing_status_idx").on(table.status),
    index("listing_review_status_idx").on(table.reviewStatus),
    index("listing_price_idx").on(table.price),
    index("listing_created_at_idx").on(table.createdAt),
    index("listing_expires_at_idx").on(table.expiresAt),
    index("listing_location_idx").on(table.latitude, table.longitude),
    index("listing_available_idx").on(table.isAvailableForSale, table.status),
  ]
);

export const listingReviews = pgTable(
  "listing_reviews",
  {
    id: serial("id").primaryKey(),
    listingId: integer("listing_id")
      .references(() => listings.id, {
        onDelete: "cascade",
      })
      .notNull(),
    reviewerId: integer("reviewer_id")
      .references(() => users.id, {
        onDelete: "set null",
      })
      .notNull(),
    action: varchar("action", { length: 50 }).notNull(), // 'submitted', 'approved', 'rejected', 'changes_requested', 'note_added'
    previousStatus: varchar("previous_status", { length: 50 }),
    newStatus: varchar("new_status", { length: 50 }),
    notes: text("notes"),
    metadata: jsonb("metadata"), // Store what was changed, reasons, etc.
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("listing_review_listing_idx").on(table.listingId),
    index("listing_review_reviewer_idx").on(table.reviewerId),
    index("listing_review_action_idx").on(table.action),
    index("listing_review_created_at_idx").on(table.createdAt),
  ]
);

// Price history tracking
export const listingPriceHistory = pgTable(
  "listing_price_history",
  {
    id: serial("id").primaryKey(),
    listingId: integer("listing_id")
      .references(() => listings.id, {
        onDelete: "cascade",
      })
      .notNull(),
    previousPrice: numeric("previous_price", { precision: 12, scale: 2 }),
    newPrice: numeric("new_price", { precision: 12, scale: 2 }).notNull(),
    changedBy: integer("changed_by").references(() => users.id, {
      onDelete: "set null",
    }),
    changeReason: varchar("change_reason", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    listingIdx: index("price_history_listing_idx").on(table.listingId),
    createdAtIdx: index("price_history_created_at_idx").on(table.createdAt),
  })
);

// Transaction history
export const listingTransactions = pgTable(
  "listing_transactions",
  {
    id: serial("id").primaryKey(),
    listingId: integer("listing_id")
      .references(() => listings.id, {
        onDelete: "cascade",
      })
      .notNull(),
    userId: integer("user_id").references(() => users.id, {
      onDelete: "set null",
    }), // Who performed the action
    action: varchar("action", { length: 50 }).notNull(), // 'listed', 'relisted', 'price_changed', 'offer_made', 'offer_accepted', 'offer_rejected', 'offer_countered', 'purchased', 'cancelled', 'expired', 'bumped'
    amount: numeric("amount", { precision: 12, scale: 2 }), // Price or offer amount
    quantity: integer("quantity").default(1),
    previousValue: jsonb("previous_value"), // Store previous state
    newValue: jsonb("new_value"), // Store new state
    notes: text("notes"),
    metadata: jsonb("metadata"), // Additional transaction data
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    listingIdx: index("transaction_listing_idx").on(table.listingId),
    userIdx: index("transaction_user_idx").on(table.userId),
    actionIdx: index("transaction_action_idx").on(table.action),
    createdAtIdx: index("transaction_created_at_idx").on(table.createdAt),
  })
);

// Offers system
export const listingOffers = pgTable(
  "listing_offers",
  {
    id: serial("id").primaryKey(),
    listingId: integer("listing_id")
      .references(() => listings.id, {
        onDelete: "cascade",
      })
      .notNull(),
    buyerId: integer("buyer_id")
      .references(() => users.id, {
        onDelete: "cascade",
      })
      .notNull(),
    offerAmount: numeric("offer_amount", { precision: 12, scale: 2 }).notNull(),
    quantity: integer("quantity").default(1),
    message: text("message"),
    status: varchar("status", { length: 50 }).default("pending"), // 'pending', 'accepted', 'rejected', 'countered', 'expired', 'withdrawn'
    counterAmount: numeric("counter_amount", { precision: 12, scale: 2 }),
    counterMessage: text("counter_message"),
    expiresAt: timestamp("expires_at"),
    respondedAt: timestamp("responded_at"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    listingIdx: index("offer_listing_idx").on(table.listingId),
    buyerIdx: index("offer_buyer_idx").on(table.buyerId),
    statusIdx: index("offer_status_idx").on(table.status),
    createdAtIdx: index("offer_created_at_idx").on(table.createdAt),
  })
);

// Watchlist
export const listingWatchlist = pgTable(
  "listing_watchlist",
  {
    id: serial("id").primaryKey(),
    listingId: integer("listing_id")
      .references(() => listings.id, {
        onDelete: "cascade",
      })
      .notNull(),
    userId: integer("user_id")
      .references(() => users.id, {
        onDelete: "cascade",
      })
      .notNull(),
    notifyPriceDrops: boolean("notify_price_drops").default(true),
    notifyBackInStock: boolean("notify_back_in_stock").default(true),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    listingIdx: index("watchlist_listing_idx").on(table.listingId),
    userIdx: index("watchlist_user_idx").on(table.userId),
    uniqueUserListing: unique("watchlist_unique").on(
      table.listingId,
      table.userId
    ),
  })
);

// Monthly price statistics (for analytics)
export const listingPriceStats = pgTable(
  "listing_price_stats",
  {
    id: serial("id").primaryKey(),
    listingId: integer("listing_id")
      .references(() => listings.id, {
        onDelete: "cascade",
      })
      .notNull(),
    year: integer("year").notNull(),
    month: integer("month").notNull(), // 1-12
    averagePrice: numeric("average_price", { precision: 12, scale: 2 }),
    minPrice: numeric("min_price", { precision: 12, scale: 2 }),
    maxPrice: numeric("max_price", { precision: 12, scale: 2 }),
    priceChangeCount: integer("price_change_count").default(0),
    offerCount: integer("offer_count").default(0),
    averageOffer: numeric("average_offer", { precision: 12, scale: 2 }),
    viewCount: integer("view_count").default(0),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    listingIdx: index("price_stats_listing_idx").on(table.listingId),
    periodIdx: index("price_stats_period_idx").on(table.year, table.month),
    uniquePeriod: unique("price_stats_unique").on(
      table.listingId,
      table.year,
      table.month
    ),
  })
);

// Questions and Answers on listings
export const listingQuestions = pgTable(
  "listing_questions",
  {
    id: serial("id").primaryKey(),
    listingId: integer("listing_id")
      .references(() => listings.id, {
        onDelete: "cascade",
      })
      .notNull(),
    askedBy: integer("asked_by")
      .references(() => users.id, {
        onDelete: "set null",
      })
      .notNull(),
    question: text("question").notNull(),
    answer: text("answer"),
    answeredBy: integer("answered_by").references(() => users.id, {
      onDelete: "set null",
    }),
    answeredAt: timestamp("answered_at"),
    isPublic: boolean("is_public").default(true),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    listingIdx: index("question_listing_idx").on(table.listingId),
    askedByIdx: index("question_asked_by_idx").on(table.askedBy),
    publicIdx: index("question_public_idx").on(table.isPublic),
  })
);
