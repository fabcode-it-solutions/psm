/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Universal Search API - COMPLETE FIXED VERSION
 *
 * Fix: Added empty array for types when types table is not available
 */

import { db } from "@/db/db";
import { users } from "@/db/schema/auth";
import { categories } from "@/db/schema/categories";
import { carBrands, carModels, manufacturers } from "@/db/schema/default";
import { media } from "@/db/schema/media";
import { metafieldDefinitions } from "@/db/schema/metafields";
import { parts } from "@/db/schema/parts";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// Define action types for quick navigation
const QUICK_ACTIONS = [
  // Parts Actions
  {
    id: "action-add-part",
    title: "Add New Part",
    category: "actions",
    route: "/dashboard/parts/create",
    icon: "plus",
  },
  {
    id: "action-all-parts",
    title: "View All Parts",
    category: "actions",
    route: "/dashboard/parts",
    icon: "package",
  },
  {
    id: "action-low-stock",
    title: "Low Stock Parts",
    category: "actions",
    route: "/dashboard/parts?inventoryStatus=low-stock",
    icon: "alert-triangle",
  },
  {
    id: "action-add-user",
    title: "Add New User",
    category: "actions",
    route: "/dashboard/users",
    icon: "user-plus",
  },
  {
    id: "action-all-users",
    title: "View All Users",
    category: "actions",
    route: "/dashboard/users",
    icon: "users",
  },
  {
    id: "action-all-orders",
    title: "View All Orders",
    category: "actions",
    route: "/dashboard/orders",
    icon: "shopping-cart",
  },
  {
    id: "action-add-category",
    title: "Add New Category",
    category: "actions",
    route: "/dashboard/categories",
    icon: "folder-plus",
  },
  {
    id: "action-all-categories",
    title: "View All Categories",
    category: "actions",
    route: "/dashboard/categories",
    icon: "folder",
  },
  {
    id: "action-add-brand",
    title: "Add New Brand",
    category: "actions",
    route: "/dashboard/carBrands",
    icon: "tag",
  },
  {
    id: "action-all-brands",
    title: "View All Brands",
    category: "actions",
    route: "/dashboard/carBrands",
    icon: "tags",
  },
  {
    id: "action-add-manufacturer",
    title: "Add New Manufacturer",
    category: "actions",
    route: "/dashboard/manufacturers",
    icon: "factory",
  },
  {
    id: "action-all-manufacturers",
    title: "View All Manufacturers",
    category: "actions",
    route: "/dashboard/manufacturers",
    icon: "building",
  },
  {
    id: "action-add-model",
    title: "Add New Model",
    category: "actions",
    route: "/dashboard/models",
    icon: "car",
  },
  {
    id: "action-all-models",
    title: "View All Models",
    category: "actions",
    route: "/dashboard/models",
    icon: "car",
  },
  {
    id: "action-add-metafield",
    title: "Add New Metafield",
    category: "actions",
    route: "/dashboard/metafields",
    icon: "database",
  },
  {
    id: "action-all-metafields",
    title: "View All Metafields",
    category: "actions",
    route: "/dashboard/metafields",
    icon: "database",
  },
  {
    id: "action-view-reports",
    title: "View Reports",
    category: "actions",
    route: "/dashboard/reports",
    icon: "flag",
  },
  {
    id: "action-export-data",
    title: "Export Data",
    category: "actions",
    route: "/dashboard/settings/export",
    icon: "download",
  },
];

const PAGE_NAVIGATION = [
  {
    id: "page-dashboard",
    title: "Dashboard",
    category: "pages",
    route: "/dashboard",
    icon: "home",
    keywords: ["home", "overview", "analytics"],
  },
  {
    id: "page-parts",
    title: "Parts Management",
    category: "pages",
    route: "/dashboard/parts",
    icon: "package",
    keywords: ["parts", "products", "inventory"],
  },
  {
    id: "page-orders",
    title: "Orders",
    category: "pages",
    route: "/dashboard/orders",
    icon: "shopping-cart",
    keywords: ["orders", "sales", "purchases"],
  },
  {
    id: "page-users",
    title: "Users",
    category: "pages",
    route: "/dashboard/users",
    icon: "users",
    keywords: ["users", "customers", "accounts"],
  },
  {
    id: "page-categories",
    title: "Categories",
    category: "pages",
    route: "/dashboard/categories",
    icon: "folder",
    keywords: ["categories", "taxonomy"],
  },
  {
    id: "page-brands",
    title: "Brands",
    category: "pages",
    route: "/dashboard/carBrands",
    icon: "tag",
    keywords: ["brands", "makes"],
  },
  {
    id: "page-models",
    title: "Models",
    category: "pages",
    route: "/dashboard/models",
    icon: "car",
    keywords: ["models", "vehicles"],
  },
  {
    id: "page-types",
    title: "Types",
    category: "pages",
    route: "/dashboard/types",
    icon: "list",
    keywords: ["types", "variants"],
  },
  {
    id: "page-manufacturers",
    title: "Manufacturers",
    category: "pages",
    route: "/dashboard/manufacturers",
    icon: "building",
    keywords: ["manufacturers", "suppliers"],
  },
  {
    id: "page-metafields",
    title: "Metafields",
    category: "pages",
    route: "/dashboard/metafields",
    icon: "database",
    keywords: ["metafields", "custom fields", "attributes"],
  },
  {
    id: "page-reports",
    title: "Reports",
    category: "pages",
    route: "/dashboard/reports",
    icon: "flag",
    keywords: ["reports", "issues", "complaints"],
  },
  {
    id: "page-settings",
    title: "Settings",
    category: "pages",
    route: "/dashboard/settings",
    icon: "settings",
    keywords: ["settings", "configuration", "preferences"],
  },
];

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("q") || "";

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        success: true,
        query: "",
        results: {
          actions: [],
          pages: [],
          parts: [],
          categories: [],
          brands: [],
          models: [],
          types: [],
          manufacturers: [],
          users: [],
          metafields: [],
        },
        totalResults: 0,
      });
    }

    const searchTerm = query.trim().toLowerCase();
    const limit = 5;

    // Search Actions
    const matchedActions = QUICK_ACTIONS.filter((action) =>
      action.title.toLowerCase().includes(searchTerm)
    ).slice(0, limit);

    // Search Pages
    const matchedPages = PAGE_NAVIGATION.filter(
      (page) =>
        page.title.toLowerCase().includes(searchTerm) ||
        page.keywords.some((keyword) => keyword.includes(searchTerm))
    ).slice(0, limit);

    // Parallel database searches
    const [
      partsResults,
      categoriesResults,
      brandsResults,
      modelsResults,
      manufacturersResults,
      usersResults,
      metafieldsResults,
    ] = await Promise.all([
      // Search Parts (simplified - without variants subqueries)
      db
        .select({
          id: parts.id,
          title: parts.title,
          description: parts.description,
          slug: parts.slug,
          status: parts.status,
        })
        .from(parts)
        .where(
          or(
            ilike(parts.title, `%${query}%`),
            ilike(parts.description, `%${query}%`),
            ilike(parts.slug, `%${query}%`)
          )
        )
        .orderBy(desc(parts.updatedAt))
        .limit(limit),

      // Search Categories
      db
        .select({
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          description: categories.description,
          featuredImage: categories.featuredImage,
          partsCount: sql<number>`(
            SELECT COUNT(*) 
            FROM part_categories 
            WHERE category_id = ${categories.id}
          )`.as("parts_count"),
        })
        .from(categories)
        .where(
          or(
            ilike(categories.name, `%${query}%`),
            ilike(categories.description, `%${query}%`),
            ilike(categories.slug, `%${query}%`)
          )
        )
        .orderBy(desc(categories.updatedAt))
        .limit(limit),

      // Search Brands
      db
        .select({
          id: carBrands.id,
          name: carBrands.name,
          description: carBrands.description,
          logo: {
            id: media.id,
            url: media.url,
            alt: media.altText,
          },
        })
        .from(carBrands)
        .leftJoin(media, eq(carBrands.logoMediaId, media.id))
        .where(
          or(
            ilike(carBrands.name, `%${query}%`),
            ilike(carBrands.description, `%${query}%`)
          )
        )
        .orderBy(desc(carBrands.updatedAt))
        .limit(limit),

      // Search Models
      db
        .select({
          id: carModels.id,
          name: carModels.name,
          description: carModels.description,
          brandName: carBrands.name,
        })
        .from(carModels)
        .leftJoin(carBrands, eq(carModels.brandId, carBrands.id))
        .where(
          or(
            ilike(carModels.name, `%${query}%`),
            ilike(carModels.description, `%${query}%`)
          )
        )
        .orderBy(desc(carModels.updatedAt))
        .limit(limit),

      // Search Manufacturers
      db
        .select({
          id: manufacturers.id,
          name: manufacturers.name,
          subTitle: manufacturers.subTitle,
          description: manufacturers.description,
          logo: {
            id: media.id,
            url: media.url,
            alt: media.altText,
          },
        })
        .from(manufacturers)
        .leftJoin(media, eq(manufacturers.logoMediaId, media.id))
        .where(
          or(
            ilike(manufacturers.name, `%${query}%`),
            ilike(manufacturers.description, `%${query}%`)
          )
        )
        .orderBy(desc(manufacturers.updatedAt))
        .limit(limit),

      // Search Users
      db
        .select({
          id: users.id,
          username: users.username,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImage: users.profileImage,
          role: users.role,
        })
        .from(users)
        .where(
          or(
            ilike(users.username, `%${query}%`),
            ilike(users.email, `%${query}%`),
            ilike(users.firstName, `%${query}%`),
            ilike(users.lastName, `%${query}%`)
          )
        )
        .orderBy(desc(users.updatedAt))
        .limit(limit),

      // Search Metafields
      db
        .select({
          id: metafieldDefinitions.id,
          name: metafieldDefinitions.name,
          key: metafieldDefinitions.key,
          entityType: metafieldDefinitions.entityType,
          namespace: metafieldDefinitions.namespace,
          type: metafieldDefinitions.type,
        })
        .from(metafieldDefinitions)
        .where(
          or(
            ilike(metafieldDefinitions.name, `%${query}%`),
            ilike(metafieldDefinitions.key, `%${query}%`),
            ilike(metafieldDefinitions.entityType, `%${query}%`)
          )
        )
        .orderBy(desc(metafieldDefinitions.id))
        .limit(limit),
    ]);
    const typesResults: any[] = [];
    const results = {
      actions: matchedActions.map((action) => ({
        id: action.id,
        title: action.title,
        subtitle: "Quick Action",
        route: action.route,
        icon: action.icon,
        category: "actions" as const,
      })),

      pages: matchedPages.map((page) => ({
        id: page.id,
        title: page.title,
        subtitle: "Navigate to page",
        route: page.route,
        icon: page.icon,
        category: "pages" as const,
      })),

      parts: partsResults.map((part) => ({
        id: part.id,
        title: part.title,
        subtitle: part.status || "Part",
        route: `/parts/${part.slug}`,
        status: part.status,
        category: "parts" as const,
      })),
      categories: categoriesResults.map((cat) => ({
        id: cat.id,
        title: cat.name,
        subtitle: `${cat.partsCount || 0} parts`,
        route: `/dashboard/categories`,
        image: cat.featuredImage,
        category: "categories" as const,
      })),

      brands: brandsResults.map((brand) => ({
        id: brand.id,
        title: brand.name,
        subtitle: "Brand",
        route: `/dashboard/brands`,
        image: brand.logo?.url,
        category: "brands" as const,
      })),

      models: modelsResults.map((model) => ({
        id: model.id,
        title: model.name,
        subtitle: `Model - ${model.brandName || "Unknown Brand"}`,
        route: `/dashboard/models`,
        category: "models" as const,
      })),

      types: typesResults.map((type) => ({
        id: type.id,
        title: type.name,
        subtitle: `Type - ${type.brandName || ""} ${
          type.modelName || ""
        }`.trim(),
        route: `/dashboard/types`,
        category: "types" as const,
      })),

      manufacturers: manufacturersResults.map((mfg) => ({
        id: mfg.id,
        title: mfg.name,
        subtitle: mfg.subTitle || "Manufacturer",
        route: `/dashboard/manufacturers`,
        image: mfg.logo?.url,
        category: "manufacturers" as const,
      })),

      users: usersResults.map((user) => ({
        id: user.id,
        title: user.username || `${user.firstName} ${user.lastName}`.trim(),
        subtitle: user.email,
        route: `/profile/${user.id}`,
        image: user.profileImage,
        role: user.role,
        category: "users" as const,
      })),

      metafields: metafieldsResults.map((meta) => ({
        id: meta.id,
        title: meta.name,
        subtitle: `${meta.entityType} • ${meta.type}`,
        route: `/dashboard/metafields/${meta.id}`,
        category: "metafields" as const,
      })),
    };

    const totalResults =
      results.actions.length +
      results.pages.length +
      results.parts.length +
      results.categories.length +
      results.brands.length +
      results.models.length +
      results.types.length +
      results.manufacturers.length +
      results.users.length +
      results.metafields.length;

    return NextResponse.json({
      success: true,
      query,
      results,
      totalResults,
    });
  } catch (error) {
    console.error("Universal search error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Search failed",
        query: "",
        results: {
          actions: [],
          pages: [],
          parts: [],
          categories: [],
          brands: [],
          models: [],
          types: [],
          manufacturers: [],
          users: [],
          metafields: [],
        },
        totalResults: 0,
      },
      { status: 500 }
    );
  }
}
