import {
  pgTable,
  serial,
  integer,
  varchar,
  numeric,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { shippingProfiles } from "./shipping";

export const shippingRates = pgTable(
  "shipping_rates",
  {
    id: serial("id").primaryKey(),
    shippingProfileId: integer("shipping_profile_id")
      .references(() => shippingProfiles.id, {
        onDelete: "cascade",
      })
      .notNull(),
    name: varchar("name", { length: 255 }).notNull(), // e.g., 'Standard Shipping', 'Express'
    carrier: varchar("carrier", { length: 100 }), // e.g., 'USPS', 'FedEx', 'UPS'
    service: varchar("service", { length: 100 }), // e.g., 'Ground', '2-Day', 'Overnight'
    basePrice: numeric("base_price", { precision: 10, scale: 2 }).notNull(),
    priceModifiers: jsonb("price_modifiers"), // JSON for complex pricing rules
    estimatedDaysMin: integer("estimated_days_min"),
    estimatedDaysMax: integer("estimated_days_max"),
    zones: jsonb("zones"), // JSON array of applicable zones/regions
    conditions: jsonb("conditions"), // JSON for conditions (weight limits, etc.)
    displayOrder: integer("display_order").default(0),
  },
  (table) => ({
    profileIdx: index("shipping_rate_profile_idx").on(table.shippingProfileId),
    orderIdx: index("shipping_rate_order_idx").on(table.displayOrder),
  })
);
