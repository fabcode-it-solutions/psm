import { db } from "@/db/db";
import { builds } from "@/db/schema/builds";
import { carModelTypes, carModels } from "@/db/schema/default";
import { media } from "@/db/schema/media";
import { withFullCsrfProtection } from "@/libs/security/csrf-full";
import { addCarModelType } from "@/models/cars.model";
import {
  TypeBase,
  TypeWithBuilds,
  PaginationResponse,
  QueryParams,
} from "@/types/types.types";
import { eq, desc, asc, count, ilike } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { NextRequest, NextResponse } from "next/server";

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
    const { name, modelId, description, status, image } = body;

    if (!name || !modelId) {
      return NextResponse.json(
        {
          error: "Missing required fields",
        },
        { status: 400 }
      );
    }
    const result = await addCarModelType({
      name,
      modelId,
      description,
      status: status || "active",
      image,
    });

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
        message: "Type has been added successfully.",
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
      modelId: url.searchParams.get("modelId") || undefined,
    };

    const imageMedia = alias(media, "imageMedia");

    // === 1️⃣ Single Type by ID ===
    if (params.id) {
      const typeId = Number(params.id);
      if (isNaN(typeId)) {
        return NextResponse.json({ error: "Invalid type ID" }, { status: 400 });
      }

      const typeRows = await db
        .select({
          typeId: carModelTypes.id,
          name: carModelTypes.name,
          modelId: carModelTypes.modelId,
          description: carModelTypes.description,
          status: carModelTypes.status,
          createdAt: carModelTypes.createdAt,
          updatedAt: carModelTypes.updatedAt,
          buildId: builds.id,
          buildCreatedAt: builds.createdAt,
          buildLicensePlate: builds.licensePlate,
          buildVinNumber: builds.vinNumber,
          model: {
            id: carModels.id,
            name: carModels.name,
          },
          image: {
            id: imageMedia.id,
            url: imageMedia.url,
            type: imageMedia.type,
            alt: imageMedia.altText,
          },
        })
        .from(carModelTypes)
        .leftJoin(builds, eq(carModelTypes.id, builds.typeId))
        .leftJoin(carModels, eq(carModelTypes.modelId, carModels.id))
        .leftJoin(imageMedia, eq(carModelTypes.imageMediaId, imageMedia.id))
        .where(eq(carModelTypes.id, typeId));

      if (!typeRows.length) {
        return NextResponse.json({ error: "Type not found" }, { status: 404 });
      }

      const type: TypeWithBuilds = {
        id: typeRows[0].typeId,
        name: typeRows[0].name,
        modelId: typeRows[0].modelId,
        model: {
          id: Number(typeRows[0].model?.id),
          name: typeRows[0].model?.name || "",
        },
        description: typeRows[0].description || "",
        status: typeRows[0].status == "active" ? "active" : "inactive",
        createdAt: String(typeRows[0].createdAt),
        updatedAt: String(typeRows[0].updatedAt),
        builds: [],
        _count: { builds: 0 },
      };

      if (params.includeBuilds === "true") {
        for (const row of typeRows) {
          if (row.buildId) {
            type.builds.push({
              id: row.buildId,
              createdAt: String(row.buildCreatedAt),
              licensePlate: String(row.buildLicensePlate),
              vinNumber: String(row.buildVinNumber),
            });
            type._count.builds++;
          }
        }
      }

      return NextResponse.json({ data: type }, { status: 200 });
    }

    // === 2️⃣ Filter by Model ID ===
    if (params.modelId) {
      const modelId = Number(params.modelId);
      if (isNaN(modelId)) {
        return NextResponse.json(
          { error: "Invalid model ID" },
          { status: 400 }
        );
      }

      const result = await db
        .select({
          id: carModelTypes.id,
          name: carModelTypes.name,
          modelId: carModelTypes.modelId,
          description: carModelTypes.description,
          status: carModelTypes.status,
          createdAt: carModelTypes.createdAt,
          updatedAt: carModelTypes.updatedAt,
          model: {
            id: carModels.id,
            name: carModels.name,
          },
          image: {
            id: imageMedia.id,
            url: imageMedia.url,
            type: imageMedia.type,
            alt: imageMedia.altText,
          },
        })
        .from(carModelTypes)
        .leftJoin(carModels, eq(carModelTypes.modelId, carModels.id))
        .leftJoin(imageMedia, eq(carModelTypes.imageMediaId, imageMedia.id))
        .where(eq(carModelTypes.modelId, modelId))
        .orderBy(carModelTypes.name);

      return NextResponse.json(
        { success: true, data: result },
        { status: 200 }
      );
    }

    // === 3️⃣ Pagination, Search, Sort ===
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
      whereCondition = ilike(carModelTypes.name, `%${search}%`);
    }

    // Count total items
    const totalCountResult = await db
      .select({ count: count().as("count") })
      .from(carModelTypes)
      .where(whereCondition ?? undefined);

    const totalItems = Number(totalCountResult[0]?.count || 0);
    const totalPages = Math.ceil(totalItems / limit);

    const sortColumn =
      sortBy === "createdAt"
        ? carModelTypes.createdAt
        : sortBy === "updatedAt"
        ? carModelTypes.updatedAt
        : sortBy === "status"
        ? carModelTypes.status
        : carModelTypes.name;

    let types: TypeBase[] | TypeWithBuilds[] = [];

    if (params.includeBuilds === "true") {
      const rows = await db
        .select({
          typeId: carModelTypes.id,
          name: carModelTypes.name,
          modelId: carModelTypes.modelId,
          description: carModelTypes.description,
          status: carModelTypes.status,
          createdAt: carModelTypes.createdAt,
          updatedAt: carModelTypes.updatedAt,
          buildId: builds.id,
          buildCreatedAt: builds.createdAt,
          buildLicensePlate: builds.licensePlate,
          buildVinNumber: builds.vinNumber,
          model: {
            id: carModels.id,
            name: carModels.name,
          },
          image: {
            id: imageMedia.id,
            url: imageMedia.url,
            type: imageMedia.type,
            alt: imageMedia.altText,
          },
        })
        .from(carModelTypes)
        .leftJoin(builds, eq(carModelTypes.id, builds.typeId))
        .leftJoin(carModels, eq(carModelTypes.modelId, carModels.id))
        .leftJoin(imageMedia, eq(carModelTypes.imageMediaId, imageMedia.id))
        .where(whereCondition ?? undefined)
        .orderBy(sortOrder === "desc" ? desc(sortColumn) : asc(sortColumn))
        .limit(limit)
        .offset(offset);

      const typeMap = new Map<number, TypeWithBuilds>();

      for (const row of rows) {
        if (!typeMap.has(row.typeId)) {
          typeMap.set(row.typeId, {
            id: row.typeId,
            name: row.name,
            modelId: row.modelId,
            model: {
              id:Number(row.model?.id),
              name:row.model?.name || ''
            },
            description: row.description || '',
            status: row.status  == "active" ? "active" : "inactive",
            createdAt: String(row.createdAt),
            updatedAt: String(row.updatedAt),
            builds: [],
            _count: { builds: 0 },
          });
        }
        if (row.buildId) {
          const t = typeMap.get(row.typeId)!;
          t.builds.push({
            id: row.buildId,
            createdAt:String( row.buildCreatedAt),
            licensePlate: row.buildLicensePlate || '',
            vinNumber: row.buildVinNumber || '',
          });
          t._count.builds++;
        }
      }

      types = Array.from(typeMap.values());
    } else {
      const result = await db
        .select({
          id: carModelTypes.id,
          name: carModelTypes.name,
          modelId: carModelTypes.modelId,
          description: carModelTypes.description,
          status: carModelTypes.status,
          createdAt: carModelTypes.createdAt,
          updatedAt: carModelTypes.updatedAt,
          model: {
            id: carModels.id,
            name: carModels.name,
          },
          image: {
            id: imageMedia.id,
            url: imageMedia.url,
            type: imageMedia.type,
            alt: imageMedia.altText,
          },
        })
        .from(carModelTypes)
        .leftJoin(carModels, eq(carModelTypes.modelId, carModels.id))
        .leftJoin(imageMedia, eq(carModelTypes.imageMediaId, imageMedia.id))
        .orderBy(carModelTypes.name);

      return NextResponse.json(
        { success: true, data: result },
        { status: 200 }
      );
    }

    const response: PaginationResponse<(typeof types)[number]> = {
      data: types,
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
    console.error("<----------Type Route Error------------>");
    console.error(error);
    console.error("<----------End Type Route Error------------>");
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
};
export const PUT = withFullCsrfProtection(
  async (req: NextRequest): Promise<NextResponse> => {
  try {
    const { pathname } = new URL(req.url);
    const typeId = pathname.split("/").pop();

    if (!typeId || isNaN(Number(typeId))) {
      return NextResponse.json({ error: "Invalid type ID" }, { status: 400 });
    }

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

    const { name, modelId, description, status, image } = body;

    if (!name || !modelId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {
      name,
      modelId,
      description,
      status,
      updatedAt: new Date(),
    };

    if (image) {
      updateData.imageMediaId = image;
    }

    await db
      .update(carModelTypes)
      .set(updateData)
      .where(eq(carModelTypes.id, Number(typeId)));

    return NextResponse.json(
      {
        success: true,
        message: "Type updated successfully.",
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Update error:", error);
    return NextResponse.json(
      { error: "Unexpected error: Please try again later" },
      { status: 500 }
    );
  }
})
export const DELETE = withFullCsrfProtection(async (req: NextRequest): Promise<NextResponse> => {
  try {
    const { pathname } = new URL(req.url);
    const typeId = pathname.split("/").pop();

    if (!typeId || isNaN(Number(typeId))) {
      return NextResponse.json({ error: "Invalid type ID" }, { status: 400 });
    }

    // Check if type has associated builds
    const buildsCount = await db
      .select({ count: count() })
      .from(builds)
      .where(eq(builds.typeId, Number(typeId)));

    if (buildsCount[0].count > 0) {
      return NextResponse.json(
        { error: "Cannot delete type with associated builds" },
        { status: 400 }
      );
    }

    await db.delete(carModelTypes).where(eq(carModelTypes.id, Number(typeId)));

    return NextResponse.json(
      {
        success: true,
        message: "Type deleted successfully.",
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "Unexpected error: Please try again later" },
      { status: 500 }
    );
  }
}
)