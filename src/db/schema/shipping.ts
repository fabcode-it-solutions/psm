import { pgTable, serial, integer, varchar, numeric, boolean, timestamp, index, text } from "drizzle-orm/pg-core";
import { parts } from "./parts";


export const shippingProfiles = pgTable(
  "shipping_profiles",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    isDefault: boolean("is_default").default(false),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    defaultIdx: index("shipping_profile_default_idx").on(table.isDefault),
  })
);

export const partShipping = pgTable(
  "part_shipping",
  {
    id: serial("id").primaryKey(),
    partId: integer("part_id").references(() => parts.id, {
      onDelete: "cascade",
    }).notNull().unique(),
    shippingProfileId: integer("shipping_profile_id").references(() => shippingProfiles.id, {
      onDelete: "set null",
    }),
    width: numeric("width", { precision: 10, scale: 2 }), // in cm
    height: numeric("height", { precision: 10, scale: 2 }), // in cm
    length: numeric("length", { precision: 10, scale: 2 }), // in cm
    dimensionUnit: varchar("dimension_unit", { length: 10 }).default("cm"),
    shippingClass: varchar("shipping_class", { length: 100 }), // e.g., 'standard', 'oversized', 'fragile'
    originZipCode: varchar("origin_zip_code", { length: 20 }),
    processingTime: integer("processing_time"), // in days
    customsDescription: text("customs_description"),
    customsHsCode: varchar("customs_hs_code", { length: 20 }),
    customsValue: numeric("customs_value", { precision: 10, scale: 2 }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    partIdx: index("part_shipping_part_idx").on(table.partId),
    profileIdx: index("part_shipping_profile_idx").on(table.shippingProfileId),
  })
);