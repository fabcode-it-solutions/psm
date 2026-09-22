
import {
  pgTable,
  serial,
  varchar,
  integer,
  timestamp,
  index,
  text,
  boolean,
  jsonb,
  unique,
} from "drizzle-orm/pg-core";
import { users } from "./auth";
import { parts } from "./parts";
import { listings } from "./listings";
import { builds } from "./builds";
import { listingOffers } from "./listings";

export const notifications = pgTable(
  "notifications",
  {
    id: serial("id").primaryKey(),
    
    // Core fields (required)
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    
    type: varchar("type", { length: 50 }).notNull(), // See NotificationType below
    
    message: text("message").notNull(), // The notification message
    
    // Optional context fields
    title: varchar("title", { length: 255 }), // Optional title for the notification
    
    // Related entities (optional - depends on notification type)
    entityType: varchar("entity_type", { length: 50 }), // 'part', 'listing', 'build', 'user', 'offer', etc.
    entityId: integer("entity_id"), // ID of the related entity
    
    // Specific entity references for easier querying
    fromUserId: integer("from_user_id")
      .references(() => users.id, { onDelete: "set null" }), // Who triggered the notification
    
    partId: integer("part_id")
      .references(() => parts.id, { onDelete: "cascade" }),
    
    listingId: integer("listing_id")
      .references(() => listings.id, { onDelete: "cascade" }),
    
    buildId: integer("build_id")
      .references(() => builds.id, { onDelete: "cascade" }),
    
    offerId: integer("offer_id")
      .references(() => listingOffers.id, { onDelete: "cascade" }),
    
    // Notification details
    priority: varchar("priority", { length: 20 }).default("normal"), // 'low', 'normal', 'high', 'urgent'
    category: varchar("category", { length: 50 }), // 'marketplace', 'social', 'admin', 'system', 'promotional'
    
    // Action URL - where to go when notification is clicked
    actionUrl: varchar("action_url", { length: 500 }),
    actionLabel: varchar("action_label", { length: 100 }), // e.g., "View Offer", "See Build"
    
    // Additional data
    metadata: jsonb("metadata"), // Store any additional data specific to the notification type
    
    // Status
    isRead: boolean("is_read").default(false),
    readAt: timestamp("read_at"),
    
    // Delivery channels
    emailSent: boolean("email_sent").default(false),
    emailSentAt: timestamp("email_sent_at"),
    pushSent: boolean("push_sent").default(false),
    pushSentAt: timestamp("push_sent_at"),
    smsSent: boolean("sms_sent").default(false),
    smsSentAt: timestamp("sms_sent_at"),
    
    // Grouping for batched notifications
    groupKey: varchar("group_key", { length: 100 }), // For grouping similar notifications
    groupCount: integer("group_count").default(1), // Number of grouped notifications
    
    // Expiry
    expiresAt: timestamp("expires_at"), // Auto-delete after this date
    
    // Timestamps
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    userIdIdx: index("notifications_user_id_idx").on(table.userId),
    typeIdx: index("notifications_type_idx").on(table.type),
    isReadIdx: index("notifications_is_read_idx").on(table.isRead),
    categoryIdx: index("notifications_category_idx").on(table.category),
    priorityIdx: index("notifications_priority_idx").on(table.priority),
    entityIdx: index("notifications_entity_idx").on(table.entityType, table.entityId),
    fromUserIdx: index("notifications_from_user_idx").on(table.fromUserId),
    createdAtIdx: index("notifications_created_at_idx").on(table.createdAt),
    groupKeyIdx: index("notifications_group_key_idx").on(table.groupKey),
    // Composite index for unread notifications query
    userUnreadIdx: index("notifications_user_unread_idx").on(table.userId, table.isRead, table.createdAt),
  })
);

// Notification Settings - User preferences for notification types
export const notificationSettings = pgTable(
  "notification_settings",
  {
    id: serial("id").primaryKey(),
    
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    
    notificationType: varchar("notification_type", { length: 50 }).notNull(),
    
    // Channel preferences
    inApp: boolean("in_app").default(true),
    email: boolean("email").default(true),
    push: boolean("push").default(true),
    sms: boolean("sms").default(false),
    
    // Frequency settings
    frequency: varchar("frequency", { length: 20 }).default("instant"), // 'instant', 'hourly', 'daily', 'weekly', 'never'
    
    // Time preferences (for batched notifications)
    preferredTime: varchar("preferred_time", { length: 5 }), // e.g., "09:00" for daily digest
    timezone: varchar("timezone", { length: 50 }).default("UTC"),
    
    // Timestamps
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    userIdIdx: index("notification_settings_user_id_idx").on(table.userId),
    uniqueUserType: unique("notification_settings_unique").on(table.userId, table.notificationType),
  })
);

// Notification Templates - For consistent messaging
export const notificationTemplates = pgTable(
  "notification_templates",
  {
    id: serial("id").primaryKey(),
    
    type: varchar("type", { length: 50 }).notNull().unique(),
    
    // Template content with variables like {{userName}}, {{partName}}, etc.
    titleTemplate: varchar("title_template", { length: 255 }),
    messageTemplate: text("message_template").notNull(),
    emailSubjectTemplate: varchar("email_subject_template", { length: 255 }),
    emailBodyTemplate: text("email_body_template"),
    pushTemplate: text("push_template"),
    smsTemplate: varchar("sms_template", { length: 500 }),
    
    // Default settings
    defaultPriority: varchar("default_priority", { length: 20 }).default("normal"),
    defaultCategory: varchar("default_category", { length: 50 }),
    
    // Variables used in this template
    variables: jsonb("variables"), // Array of variable names and descriptions
    
    isActive: boolean("is_active").default(true),
    
    // Timestamps
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    typeIdx: index("notification_templates_type_idx").on(table.type),
    isActiveIdx: index("notification_templates_is_active_idx").on(table.isActive),
  })
);

// Notification Queue - For delayed or scheduled notifications
export const notificationQueue = pgTable(
  "notification_queue",
  {
    id: serial("id").primaryKey(),
    
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    
    type: varchar("type", { length: 50 }).notNull(),
    
    // Notification data
    data: jsonb("data").notNull(), // All data needed to create the notification
    
    // Scheduling
    scheduledFor: timestamp("scheduled_for").notNull(),
    processedAt: timestamp("processed_at"),
    
    // Status
    status: varchar("status", { length: 20 }).default("pending"), // 'pending', 'processing', 'sent', 'failed', 'cancelled'
    attempts: integer("attempts").default(0),
    lastError: text("last_error"),
    
    // Priority for queue processing
    priority: integer("priority").default(0), // Higher number = higher priority
    
    // Timestamps
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    statusIdx: index("notification_queue_status_idx").on(table.status),
    scheduledForIdx: index("notification_queue_scheduled_for_idx").on(table.scheduledFor),
    priorityIdx: index("notification_queue_priority_idx").on(table.priority),
  })
);

// TypeScript types for notification types
export type NotificationType = 
  // Marketplace
  | 'new_part_added'
  | 'new_listing_added'
  | 'offer_received'
  | 'offer_accepted'
  | 'offer_rejected'
  | 'offer_countered'
  | 'listing_sold'
  | 'listing_expired'
  | 'price_drop'
  | 'back_in_stock'
  
  // Social
  | 'new_follower'
  | 'build_added'
  | 'build_liked'
  | 'build_commented'
  | 'mentioned'
  
  // Catalog updates
  | 'new_brand_added'
  | 'new_model_added'
  | 'new_type_added'
  | 'new_category_added'
  
  // Admin notifications
  | 'report_submitted'
  | 'report_resolved'
  | 'new_user_registered'
  | 'listing_flagged'
  | 'review_required'
  | 'system_alert'
  
  // Account
  | 'account_verified'
  | 'password_changed'
  | 'login_from_new_device'
  | 'subscription_expiring'
  | 'payment_received'
  | 'payment_failed'
  
  // Wishlist
  | 'wishlist_price_alert'
  | 'wishlist_item_available'
  
  // System
  | 'maintenance_scheduled'
  | 'feature_announcement'
  | 'policy_update'
  | 'promotional'
  | 'custom';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';
export type NotificationCategory = 'marketplace' | 'social' | 'admin' | 'system' | 'promotional' | 'account';
export type NotificationFrequency = 'instant' | 'hourly' | 'daily' | 'weekly' | 'never';

// Helper function types for creating notifications
export interface CreateNotificationInput {
  userId: number;
  type: NotificationType;
  message: string;
  title?: string;
  entityType?: string;
  entityId?: number;
  fromUserId?: number;
  priority?: NotificationPriority;
  category?: NotificationCategory;
  actionUrl?: string;
  actionLabel?: string;
  groupKey?: string;
  expiresAt?: Date;
}