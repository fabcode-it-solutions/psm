import {
  pgTable,
  serial,
  integer,
  varchar,
  timestamp,
  index,
  boolean,
} from "drizzle-orm/pg-core";
import { users } from "./auth";

export const media = pgTable(
  "media",
  {
    id: serial("id").primaryKey(),    
    type: varchar("type", { length: 50 }).notNull(),
    name: varchar("name", { length: 50 }),
    url: varchar("url", { length: 500 }).notNull(),
    altText: varchar("alt_text", { length: 500 }), 
    isPublic: boolean("is_public").default(true), 
    isArchived: boolean("is_archived").default(false),
    displayOrder: integer("display_order").default(0),
    userId: integer("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    size: varchar("size", { length: 500 }),
    width: integer("width"),
    height: integer("height"),
    format: varchar("format", { length: 500 }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    typeIdx: index("media_type_idx").on(table.type),
    publicIdx: index("media_public_idx").on(table.isPublic),
    archivedIdx: index("media_archived_idx").on(table.isArchived),
    orderIdx: index("media_order_idx").on(table.displayOrder),
    createdAtIdx: index("media_created_at_idx").on(table.createdAt),
  })
);
