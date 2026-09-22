import { db } from "@/db/db";
import { builds } from "@/db/schema/builds";
import { carBrands, carModels, carModelTypes } from "@/db/schema/default";
import { media } from "@/db/schema/media";
import { addCarBrand } from "@/models/cars.model";
import {
  BrandBase,
  BrandWithBuilds,
  PaginationResponse,
  QueryParams,
} from "@/types";
import { eq, desc, asc, count, ilike, inArray } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { NextRequest, NextResponse } from "next/server";

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
    const { name, logo, image, models } = body;

    if (!name || !logo) {
      return NextResponse.json(
        {
          error: "Missing Require fields",
        },
        { status: 400 }
      );
    }
    const result = await addCarBrand({ name, logo, image });

    if (result && typeof result === "object" && "error" in result) {
      return NextResponse.json(
        { error: (result as { error: string }).error },
        { status: 403 }
      );
    }

    if (models && result && typeof result === "object" && "id" in result) {
      // 1️⃣ Prepare models with brandId
      const modelsData = models.map(
        (model: {
          name: string;
          image: number;
          status: string;
          description: string;
        }) => ({
          name: model.name,
          brandId: (result as { id: number }).id,
          imageMediaId: model.image,
          status: model.status,
          description: model?.description,
        })
      );

      const insertModels = await db
        .insert(carModels)
        .values(modelsData)
        .returning();

      const variantsData = insertModels.flatMap((insertedModel, idx) => {
        const originalModel = models[idx];

        return (originalModel.variants || []).map(
          (variant: {
            name: string;
            status: string;
            description: string;
            image: number;
          }) => ({
            name: variant.name,
            status: variant.status,
            description: variant.description,
            modelId: insertedModel.id,
            imageMediaId: variant.image,
          })
        );
      });

      if (variantsData.length > 0) {
        const insertVariants = await db
          .insert(carModelTypes)
          .values(variantsData)
          .returning();
      }
    }
    return NextResponse.json(
      {
        success: true,
        message: "Brand has been added successfully.",
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
})

export const GET = async (request: Request) => {
  try {
    const url = new URL(request.url);
    const params: QueryParams = {
      id: url.searchParams.get("id") || undefined,
      page: url.searchParams.get("page") || undefined,
      limit: url.searchParams.get("limit") || undefined,
      search: url.searchParams.get("search") || undefined,
      sortBy: url.searchParams.get("sortBy") || undefined,
      sortOrder: url.searchParams.get("sortOrder") || undefined,
      includeBuilds: url.searchParams.get("includeBuilds") || undefined,
    };
    const logoMedia = alias(media, "logoMedia");
    const imageMedia = alias(media, "imageMedia");

    // === 1️⃣ Single Brand by ID ===
    if (params.id) {
      const brandId = Number(params.id);
      if (isNaN(brandId)) {
        return NextResponse.json(
          { error: "Invalid brand ID" },
          { status: 400 }
        );
      }

      const [brandRows] = await db
        .select({
          brandId: carBrands.id,
          name: carBrands.name,
          description: carBrands.description,
          status: carBrands.status,
          createdAt: carBrands.createdAt,
          updatedAt: carBrands.updatedAt,
          logo: {
            id: logoMedia.id,
            url: logoMedia.url,
            type: logoMedia.type,
            alt: logoMedia.altText,
          },
          image: {
            id: imageMedia.id,
            url: imageMedia.url,
            type: imageMedia.type,
            alt: imageMedia.altText,
          },
        })
        .from(carBrands)
        .leftJoin(logoMedia, eq(carBrands.logoMediaId, logoMedia.id))
        .leftJoin(imageMedia, eq(carBrands.imageMediaId, imageMedia.id))
        .where(eq(carBrands.id, brandId));

      if (!brandRows) {
        return NextResponse.json({ error: "Brand not found" }, { status: 404 });
      }
      const models = await db
        .select()
        .from(carModels)
        .where(eq(carModels.brandId, brandId));
      const variants = await db
        .select()
        .from(carModelTypes)
        .where(
          inArray(
            carModelTypes.modelId,
            models.map((m) => m.id)
          )
        );

      const modelsWithVariants = models.map((model) => ({
        ...model,
        variants: variants.filter((v) => v.modelId === model.id),
      }));
      const brand: BrandWithBuilds = {
        id: brandRows.brandId,
        name: brandRows.name,
        logo: brandRows.logo,
        image: brandRows.image,
        description: brandRows.description,
        status: brandRows.status,
        createdAt: brandRows.createdAt,
        updatedAt: brandRows.updatedAt,
        models: modelsWithVariants,
        builds: [],
        _count: { builds: 0 },
      };

      if (params.includeBuilds === "true") {
        // for (const row of brandRows) {
        //   if (row.buildId) {
        //     brand.builds.push({
        //       id: row.buildId,
        //       createdAt: row.buildCreatedAt,
        //     });
        //     brand._count.builds++;
        //   }
        // }
      }

      return NextResponse.json({ data: brand }, { status: 200 });
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

    let whereCondition = undefined;
    if (search) {
      whereCondition = ilike(carBrands.name, `%${search}%`);
    }

    // Count total items
    const totalCountResult = await db
      .select({ count: count().as("count") })
      .from(carBrands)
      .where(whereCondition ?? undefined);

    const totalItems = Number(totalCountResult[0]?.count || 0);
    const totalPages = Math.ceil(totalItems / limit);

    const sortColumn =
      sortBy === "createdAt"
        ? carBrands.createdAt
        : sortBy === "updatedAt"
        ? carBrands.updatedAt
        : sortBy === "status"
        ? carBrands.status
        : carBrands.name;

    let brands: BrandBase[] | BrandWithBuilds[] = [];

    if (params.includeBuilds === "true") {
      const rows = await db
        .select({
          brandId: carBrands.id,
          name: carBrands.name,
          description: carBrands.description,
          status: carBrands.status,
          createdAt: carBrands.createdAt,
          updatedAt: carBrands.updatedAt,
          buildId: builds.id,
          buildCreatedAt: builds.createdAt,
          logo: {
            id: logoMedia.id,
            url: logoMedia.url,
            type: logoMedia.type,
            alt: logoMedia.altText,
          },
          image: {
            id: imageMedia.id,
            url: imageMedia.url,
            type: imageMedia.type,
            alt: imageMedia.altText,
          },
        })
        .from(carBrands)
        .leftJoin(builds, eq(carBrands.id, builds.brandId))
        .leftJoin(logoMedia, eq(carBrands.logoMediaId, logoMedia.id))
        .leftJoin(imageMedia, eq(carBrands.imageMediaId, imageMedia.id))
        .where(whereCondition ?? undefined)
        .orderBy(sortOrder === "desc" ? desc(sortColumn) : asc(sortColumn))
        .limit(limit)
        .offset(offset);

      const brandMap = new Map<number, BrandWithBuilds>();

      for (const row of rows) {
        if (!brandMap.has(row.brandId)) {
          brandMap.set(row.brandId, {
            id: row.brandId,
            name: row.name,
            logo: row.logo,
            image: row.image,
            description: row.description,
            status: row.status,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            builds: [],
            _count: { builds: 0 },
          });
        }
        if (row.buildId) {
          const b = brandMap.get(row.brandId)!;
          b.builds.push({
            id: row.buildId,
            createdAt: row.buildCreatedAt,
          });
          b._count.builds++;
        }
      }

      brands = Array.from(brandMap.values());
    } else {
      const result = await db
        .select({
          id: carBrands.id,
          name: carBrands.name,
          description: carBrands.description,
          status: carBrands.status,
          createdAt: carBrands.createdAt,
          updatedAt: carBrands.updatedAt,
          logo: {
            id: logoMedia.id,
            url: logoMedia.url,
            type: logoMedia.type,
            alt: logoMedia.altText,
          },
          image: {
            id: imageMedia.id,
            url: imageMedia.url,
            type: imageMedia.type,
            alt: imageMedia.altText,
          },
        })
        .from(carBrands)
        .leftJoin(logoMedia, eq(carBrands.logoMediaId, logoMedia.id))
        .leftJoin(imageMedia, eq(carBrands.imageMediaId, imageMedia.id))
        .orderBy(carBrands.name);

      return NextResponse.json(
        { success: true, data: result },
        { status: 200 }
      );
    }

    const response: PaginationResponse<(typeof brands)[number]> = {
      data: brands,
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
    console.error("<----------Brand Route Error------------>");
    console.error(error);
    console.error("<----------End Brand Route Error------------>");
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
};
