import {
  pgTable,
  serial,
  integer,
  timestamp,
  index,
  text,
  unique,
  jsonb,
} from "drizzle-orm/pg-core";
import { users } from "./auth";
import { media } from "./media";
import { sql } from "drizzle-orm";

export const userBlocks = pgTable(
  "user_blocks",
  {
    id: serial("id").primaryKey(),
    blockerUserId: integer("blocker_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    blockedUserId: integer("blocked_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    reason: text("reason"),
    deviceFingerprint: text("device_fingerprint"),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    blockerUserIdIdx: index("user_blocks_blocker_user_id_idx").on(
      table.blockerUserId
    ),
     ipAddressIdx: index("user_blocks_ip_address_idx").on(table.ipAddress),
    deviceFingerprintIdx: index("user_blocks_device_fingerprint_idx").on(
      table.deviceFingerprint
    ),
    blockedUserIdIdx: index("user_blocks_blocked_user_id_idx").on(
      table.blockedUserId
    ),
    uniqueBlock: unique("user_blocks_unique_block").on(
      table.blockerUserId,
      table.blockedUserId
    ),
  })
);
export const bannedDevices = pgTable(
  "banned_devices",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id),
    ipAddress: text("ip_address"),
    deviceFingerprint: text("device_fingerprint"),
    reason: text("reason"),
    bannedBy: integer("banned_by")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    userIdIdx: index("banned_devices_user_id_idx").on(table.userId),
    ipAddressIdx: index("banned_devices_ip_address_idx").on(table.ipAddress),
    deviceFingerprintIdx: index("banned_devices_device_fingerprint_idx").on(
      table.deviceFingerprint
    ),
  })
);

export const userReports = pgTable(
  "user_reports",
  {
    id: serial("id").primaryKey(),
    reportId: text("report_id")
      .notNull()
      .default(
        sql`'#RPT' || LPAD(nextval('report_hash_id_seq')::text, 4, '0')`
      ),
    reporterUserId: integer("reporter_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    reportedUserId: integer("reported_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    reason: text("reason").notNull(),
    description: text("description"),
    category: text("category"),
    status: text("status").default("pending"),
    statusRecord: jsonb("status_record"),
    adminNotes: text("admin_notes"),
    reviewedBy: integer("reviewed_by").references(() => users.id, {
      onDelete: "set null",
    }),
    imageMediaId: integer("image_media_id").references(() => media.id, {
      onDelete: "set null",
    }),
    reviewedAt: timestamp("reviewed_at"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    reporterUserIdIdx: index("user_reports_reporter_user_id_idx").on(
      table.reporterUserId
    ),
    reportedUserIdIdx: index("user_reports_reported_user_id_idx").on(
      table.reportedUserId
    ),
    statusIdx: index("user_reports_status_idx").on(table.status),
    categoryIdx: index("user_reports_category_idx").on(table.category),
    reviewedByIdx: index("user_reports_reviewed_by_idx").on(table.reviewedBy),
    statusCreatedAtIdx: index("user_reports_status_created_at_idx").on(
      table.status,
      table.createdAt
    ),
  })
);
