import {
  pgTable,
  serial,
  varchar,
  timestamp,
  integer,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./auth";
import { carBrands, carModels, carModelTypes } from "./default";

export const builds = pgTable(
  "builds",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" })
      .notNull(),
    brandId: integer("brand_id")
      .references(() => carBrands.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .notNull(),
    modelId: integer("model_id")
      .references(() => carModels.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .notNull(),
    typeId: integer("type_id")
      .references(() => carModelTypes.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .notNull(),
    licensePlate: varchar("license_plate", { length: 32 }),
    vinNumber: varchar("vin_number", { length: 64 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (builds) => ({
    userIdIdx: index("idx_builds_user_id").on(builds.userId),
    brandIdIdx: index("idx_builds_brand_id").on(builds.brandId),
    modelIdIdx: index("idx_builds_model_id").on(builds.modelId),
    typeIdIdx: index("idx_builds_type_id").on(builds.typeId),
    licensePlateIdx: index("idx_builds_license_plate").on(builds.licensePlate),
  })
);
