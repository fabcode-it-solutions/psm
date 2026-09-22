import {
  pgTable,
  serial,
  varchar,
  timestamp,
  text,
  integer,
  index,
} from "drizzle-orm/pg-core";
import { media } from "./media";
import { relations } from "drizzle-orm";

// ------------------ car_brands ------------------
export const carBrands = pgTable(
  "car_brands",
  {
    id: serial("id").primaryKey(),
    logoMediaId: integer("logo_media_id").references(() => media.id, {
      onDelete: "set null",
    }),
    imageMediaId: integer("image_media_id").references(() => media.id, {
      onDelete: "set null",
    }),
    description: varchar("description", { length: 255 }),
    name: varchar("name", { length: 255 }).notNull(),
    status: varchar("status", { length: 255 }).default("active").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (brands) => ({
    nameIdx: index("idx_car_brands_name").on(brands.name),
    statusIdx: index("idx_car_brands_status").on(brands.status),
  })
);

// ------------------ car_models ------------------
export const carModels = pgTable(
  "car_models",
  {
    id: serial("id").primaryKey(),
    brandId: integer("brand_id")
      .references(() => carBrands.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .notNull(),
    name: varchar("name", { length: 128 }).notNull(),
    imageMediaId: integer("image_media_id").references(() => media.id, {
      onDelete: "set null",
    }),
    description: varchar("description", { length: 255 }),
    status: varchar("status", { length: 255 }).default("active").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (models) => ({
    brandIdx: index("idx_car_models_brand_id").on(models.brandId),
    nameIdx: index("idx_car_models_name").on(models.name),
    statusIdx: index("idx_car_models_status").on(models.status),
  })
);

// ------------------ car_model_types ------------------
export const carModelTypes = pgTable(
  "car_model_types",
  {
    id: serial("id").primaryKey(),
    modelId: integer("model_id")
      .references(() => carModels.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .notNull(),
    name: text("name").notNull(),
    imageMediaId: integer("image_media_id").references(() => media.id, {
      onDelete: "set null",
    }),
    description: varchar("description", { length: 255 }),
    status: varchar("status", { length: 255 }).default("active").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (types) => ({
    modelIdx: index("idx_car_model_types_model_id").on(types.modelId),
    nameIdx: index("idx_car_model_types_name").on(types.name),
    statusIdx: index("idx_car_model_types_status").on(types.status),
  })
);

export const manufacturers = pgTable(
  "manufacturers",
  {
    id: serial("id").primaryKey(),
    logoMediaId: integer("logo_media_id").references(() => media.id, {
      onDelete: "set null",
    }),
    imageMediaId: integer("image_media_id").references(() => media.id, {
      onDelete: "set null",
    }),
    description: varchar("description", { length: 255 }),
    name: varchar("name", { length: 255 }).notNull(),
    subTitle: varchar("subtitle", { length: 255 }),
    status: varchar("status", { length: 255 }).default("active").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (brands) => ({
    nameIdx: index("idx_manufacturers_name").on(brands.name),
    statusIdx: index("idx_manufacturers_status").on(brands.status),
  })
);

export const carModelsRelations = relations(carModels, ({ many }) => ({
  variants: many(carModelTypes),
}));

export const carModelTypesRelations = relations(carModelTypes, ({ one }) => ({
  model: one(carModels, {
    fields: [carModelTypes.modelId],
    references: [carModels.id],
  }),
}));
