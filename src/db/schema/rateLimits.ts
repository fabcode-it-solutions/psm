import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";

export const rateLimits = pgTable(
  "rate_limits",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),
    ipAddress: text("ip_address").notNull(),
    route: text("route").notNull(),
    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),
  },
  (table) => ([
 index("rate_limits_ip_route_created_at_idx").on(
      table.ipAddress,
      table.route,
      table.createdAt
    ),
  ])
);
