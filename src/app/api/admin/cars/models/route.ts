import { db } from "@/db/db";
import { carBrands, carModels } from "@/db/schema/default";
import { addCarModel } from "@/models/cars.model";
import { NextRequest, NextResponse } from "next/server";

import { asc, desc, eq, ilike, count, and } from "drizzle-orm";
import { media } from "@/db/schema/media";
import { alias } from "drizzle-orm/pg-core";
import { builds } from "@/db/schema/builds";
import { Model, ModelEntry } from "@/types/models.types";
import { BrandType } from "@/types/build";
import { withFullCsrfProtection } from "@/libs/security/csrf-full";


export const POST = withFullCsrfProtection(
  async (req: NextRequest): Promise<NextResponse> => {

  try {
    if (!req.headers.get("content-type")?.includes("application/json")) {
      return NextResponse.json(
        { error: "Use application/json" },
        { status: 415 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const { brandId, name } = body;
    if (!name || !brandId) {
      return NextResponse.json(
        {
          error: "Missing Require fields",
        },
        { status: 400 }
      );
    }
    const result = await addCarModel({ name, brandId });
    if (result && typeof result === "object" && "error" in result) {
      return NextResponse.json(
        {
          error: (result as { error: string }).error,
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Model has been added successfully.",
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Unexpected error: Please try again later" },
      { status: 500 }
    );
  }
}
)
type QueryParams = {
  id?: string;
  brandId?: string;
  page?: string;
  limit?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  includeBuilds?: string;
};

export const GET = async (request: Request) => {
  try {
    const url = new URL(request.url);
    const params: QueryParams = {
      id: url.searchParams.get("id") || undefined,
      brandId: url.searchParams.get("brandId") || undefined,
      page: url.searchParams.get("page") || undefined,
      limit: url.searchParams.get("limit") || undefined,
      search: url.searchParams.get("search") || undefined,
      sortBy: url.searchParams.get("sortBy") || undefined,
      sortOrder: url.searchParams.get("sortOrder") || undefined,
      includeBuilds: url.searchParams.get("includeBuilds") || undefined,
    };
    const imageMedia = alias(media, "imageMedia");

    // === 1️⃣ Get single model by ID ===
    if (params.id) {
      const modelId = Number(params.id);
      if (isNaN(modelId)) {
        return NextResponse.json(
          { error: "Invalid model ID" },
          { status: 400 }
        );
      }

      const modelRows = await db
        .select({
          modelId: carModels.id,
          name: carModels.name,
          description: carModels.description,
          status: carModels.status,
          createdAt: carModels.createdAt,
          updatedAt: carModels.updatedAt,
          brandId: carModels.brandId,
          brandName: carBrands.name,
          buildId: builds.id,
          buildCreatedAt: builds.createdAt,
          image: {
            id: imageMedia.id,
            url: imageMedia.url,
            type: imageMedia.type,
            alt: imageMedia.altText,
          },
        })
        .from(carModels)
        .leftJoin(carBrands, eq(carModels.brandId, carBrands.id))
        .leftJoin(builds, eq(carModels.id, builds.modelId))
        .leftJoin(imageMedia, eq(carModels.imageMediaId, imageMedia.id))
        .where(eq(carModels.id, modelId));

      if (!modelRows.length) {
        return NextResponse.json({ error: "Model not found" }, { status: 404 });
      }

      const model = {
        id: modelRows[0].modelId,
        name: modelRows[0].name,
        description: modelRows[0].description,
        status: modelRows[0].status,
        createdAt: modelRows[0].createdAt,
        updatedAt: modelRows[0].updatedAt,
        brandId: modelRows[0].brandId,
        brandName: modelRows[0].brandName,
        brand: {
          name: modelRows[0].brandName,
          id: modelRows[0].brandId,
        },
        image: modelRows[0].image,
        builds: [] as BrandType[],
        _count: { builds: 0 },
      };

      if (params.includeBuilds === "true") {
        for (const row of modelRows) {
          if (row.buildId) {
            model.builds.push({
              id: row.buildId,
              createdAt: row.buildCreatedAt,
            });
            model._count.builds++;
          }
        }
      }

      return NextResponse.json({ data: model }, { status: 200 });
    }

    // === 2️⃣ Pagination, Search, Sort ===
    const page = Math.max(1, parseInt(params.page || "1", 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(params.limit || "10", 10))
    );
    const offset = (page - 1) * limit;
    const search = params.search?.trim() || "";
    const sortBy = params.sortBy || "name";
    const sortOrder =
      params.sortOrder?.toLowerCase() === "desc" ? "desc" : "asc";

    // Filtering
    let whereCondition = undefined;
    if (search) {
      whereCondition = ilike(carModels.name, `%${search}%`);
    }
    if (params.brandId) {
      const brandId = Number(params.brandId);
      if (!isNaN(brandId)) {
        whereCondition = whereCondition
          ? and(whereCondition, eq(carModels.brandId, brandId))
          : eq(carModels.brandId, brandId);
      }
    }

    // Count total
    const totalCountResult = await db
      .select({ count: count().as("count") })
      .from(carModels)
      .where(whereCondition ?? undefined);

    const totalItems = Number(totalCountResult[0]?.count || 0);
    const totalPages = Math.ceil(totalItems / limit);

    const sortColumn =
      sortBy === "createdAt"
        ? carModels.createdAt
        : sortBy === "updatedAt"
        ? carModels.updatedAt
        : sortBy === "status"
        ? carModels.status
        : carModels.name;

    let models: Model[] | ModelEntry[] = [];

    if (params.includeBuilds === "true") {
      const rows = await db
        .select({
          modelId: carModels.id,
          name: carModels.name,
          description: carModels.description,
          status: carModels.status,
          createdAt: carModels.createdAt,
          updatedAt: carModels.updatedAt,
          brand: {
            name: carBrands.name,
            id: carModels.brandId,
          },
          brandId: carModels.brandId,
          brandName: carBrands.name,
          buildId: builds.id,
          buildCreatedAt: builds.createdAt,
          image: {
            id: imageMedia.id,
            url: imageMedia.url,
            type: imageMedia.type,
            alt: imageMedia.altText,
          },
        })
        .from(carModels)
        .leftJoin(carBrands, eq(carModels.brandId, carBrands.id))
        .leftJoin(builds, eq(carModels.id, builds.modelId))
        .leftJoin(imageMedia, eq(carModels.imageMediaId, imageMedia.id))
        .where(whereCondition ?? undefined)
        .orderBy(sortOrder === "desc" ? desc(sortColumn) : asc(sortColumn))
        .limit(limit)
        .offset(offset);

      const modelMap = new Map<number, ModelEntry>();

      for (const row of rows) {
        if (!modelMap.has(row.modelId)) {
          modelMap.set(row.modelId, {
            id: row.modelId,
            name: row.name,
            description: row.description,
            status: row.status == "inactive" ? "inactive" : "active",
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            brand: {
              name: row.brandName,
              id: row.brandId,
            },
            image: {},
            builds: [],
            _count: { builds: 0 },
          });
        }
        if (row.buildId) {
          const m = modelMap.get(row.modelId)!;
          m.builds.push({
            id: row.buildId,
            createdAt: String(row.buildCreatedAt),
            updatedAt: String(row.updatedAt),
          });
          m._count.builds++;
        }
      }

      models = Array.from(modelMap.values());
    } else {
      const mod = await db
        .select()
        .from(carModels)
        .where(whereCondition ?? undefined)
        .orderBy(sortOrder === "desc" ? desc(sortColumn) : asc(sortColumn));

      const response = {
        data: mod,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          limit,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
        success: true,
      };

      return NextResponse.json(response, { status: 200 });
    }

    const response = {
      data: models,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        limit,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      success: true,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("<----------Model Route Error------------>");
    console.error(error);
    console.error("<----------End Model Route Error------------>");
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
};
