
import { pgTable, serial, varchar, text, integer, timestamp, index, jsonb } from "drizzle-orm/pg-core";

export const seoMeta = pgTable(
  "seo_meta",
  {
    id: serial("id").primaryKey(),
    entityType: varchar("entity_type", { length: 50 }).notNull(), 
    entityId: integer("entity_id"),
    metaTitle: varchar("meta_title", { length: 255 }),
    metaDescription: text("meta_description"),
    metaKeywords: text("meta_keywords"),
    ogTitle: varchar("og_title", { length: 255 }),
    ogDescription: text("og_description"),
    ogImage: varchar("og_image", { length: 500 }),
    canonicalUrl: varchar("canonical_url", { length: 500 }),
    robots: varchar("robots", { length: 100 }), 
    structuredData: jsonb("structured_data"), 
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    entityIdx: index("seo_meta_entity_idx").on(table.entityType, table.entityId),
  })
);