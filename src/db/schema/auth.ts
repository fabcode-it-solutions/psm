import {
  pgTable,
  serial,
  varchar,
  boolean,
  timestamp,
  text,
  integer,
  uuid,
  index,
  pgEnum,
} from "drizzle-orm/pg-core";
import { builds } from "./builds";
import { relations } from "drizzle-orm";

export const addresses = pgTable(
  "addresses",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    buildId: integer("vehicle_id")
      .references(() => builds.id)
      .notNull(),
    addressLine1: varchar("address_line1", { length: 256 }).notNull(),
    addressLine2: varchar("address_line2", { length: 256 }),
    state: varchar("state", { length: 128 }),
    postalCode: varchar("postal_code", { length: 20 }),
    isDefault: boolean("is_default").default(false),
    type: text("type"),
  },
  (addresses) => [
    index("idx_addresses_user_id").on(addresses.userId),
    index("idx_addresses_vehicle_id").on(addresses.buildId),
    index("idx_addresses_postal_code").on(addresses.postalCode),
  ]
);

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    firstName: varchar("first_name", { length: 255 }),
    lastName: varchar("last_name", { length: 255 }),
    email: varchar("email", { length: 255 }).notNull().unique(),
    password: varchar("password", { length: 255 }).notNull(),
    username: varchar("username", { length: 255 }).unique(),
    bio: text("bio"),
    profileImage: text("profile_image"),
    coverImage: text("cover_image"),
    phoneNumber: varchar("phone_number", { length: 20 }).unique(),
    countryCode: varchar("country_code", { length: 10 }),
    passwordToken: varchar("password_token", { length: 255 }),
    passwordTokenExpire: timestamp("password_token_expire"),
    role: varchar("role", { length: 100 }).default("user"),
    isVerified: boolean("is_verified").default(false).notNull(),
    isSocialLogin: boolean("is_social_login").default(false).notNull(),
    loginType: varchar("login_type").default("Email").notNull(),
    // lastLoginAt: timestamp("last_login_at"),
    anonymous: boolean("anonymous").default(false),
    isPrivate: boolean("is_private").default(false).notNull(),
    isTrustedSeller: boolean("trusted_seller").default(false),
    flagged: boolean("flagged").default(false).notNull(),
    notificationId: uuid("notification_id").defaultRandom(),
    anonymousName: varchar("anonymousName"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    
  },
  (users) => [
    index("idx_users_email").on(users.email),
    index("idx_users_username").on(users.username),
    index("idx_users_phone").on(users.phoneNumber),
  ]
);
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
export const userActivities = pgTable(
  "user_activities",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade", }),
    entityType: userActivityType("entity_type").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("user_activity_user_id_idx").on(table.userId),
    index("user_activity_entity_type_idx").on(table.entityType),
    index("user_activity_created_at_idx").on(table.createdAt),
  ]
);
 
export const follows = pgTable(
  "follows",
  {
    id: serial("id").primaryKey(),
    followerId: integer("follower_id").references(() => users.id, {
      onDelete: "cascade",
    }),
    followingId: integer("following_id").references(() => users.id, {
      onDelete: "cascade",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (follows) => [
    index("idx_follows_follower").on(follows.followerId),
    index("idx_follows_following").on(follows.followingId),
  ]
);
export const userOnlineHistory = pgTable("user_online_History", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
export const adminBlockUser = pgTable("admin_block_user", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  adminId: integer("admin_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  reason: text("reason"),
  blockTime: timestamp("block_time"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const AdminBlockedUser = pgTable(
  "admin_block_user",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: integer("user_id").references(() => users.id, {
      onDelete: "cascade",
    }),
    adminId: integer("admin_id").references(() => users.id, {
      onDelete: "cascade",
    }),
    reason: text("reason"),
    blockTime: timestamp("block_time"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (adminBlockedUser) => [
    index("idx_admin_block_user_user").on(adminBlockedUser.userId),
    index("idx_admin_block_user_admin").on(adminBlockedUser.adminId),
  ]
);

export const AdminSuspendedUser = pgTable(
  "admin_suspended_user",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: integer("user_id").references(() => users.id, {
      onDelete: "cascade",
    }),
    adminId: integer("admin_id").references(() => users.id, {
      onDelete: "cascade",
    }),
    reason: text("reason"),
    suspendTime: timestamp("suspend_time"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (adminSuspendedUser) => [
    index("idx_admin_suspended_user_user").on(adminSuspendedUser.userId),
    index("idx_admin_suspended_user_admin").on(adminSuspendedUser.adminId),
  ]
);

export const usernameHistory = pgTable("username_history", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  oldUsername: varchar("old_username", { length: 255 }),
  newUsername: varchar("new_username", { length: 255 }).notNull(),
  changedAt: timestamp("changed_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  addresses: many(addresses),
}));

export const addressesRelations = relations(addresses, ({ one }) => ({
  user: one(users, { fields: [addresses.userId], references: [users.id] }),
}));

export type User = typeof users.$inferSelect;
export type Addresses = typeof addresses.$inferInsert;
export type UsernameHistory = typeof usernameHistory.$inferSelect;
