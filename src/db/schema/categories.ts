import {
  pgTable,
  serial,
  varchar,
  integer,
  boolean,
  timestamp,
  index,
  text,
} from "drizzle-orm/pg-core";
import { users } from "./auth";
import { relations } from "drizzle-orm";
import { media } from "./media";

export type CategoriesType = {
  id: number;
  name: string;
  slug: string;
  parentId?: number;
  isCustom?: boolean;
  userId?: number;
  createdAt?: Date;
};

export const categories = pgTable(
  "categories",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).unique().notNull(),
    description: text("bio"),
    featuredImage: integer("cover_image_id").references(() => media.id, {
      onDelete: "set null",
    }),
    parentId: integer("parent_id"),
    isCustom: boolean("is_custom").default(false),
    isActive: boolean("is_active").default(true),
    userId: integer("user_id").references(() => users.id, {
      onDelete: "cascade",
    }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    slugIdx: index("category_slug_idx").on(table.slug),
    userIdx: index("category_user_id_idx").on(table.userId),
  })
);

export const categoriesRelations = relations(categories, ({ one }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
  }),
}));
